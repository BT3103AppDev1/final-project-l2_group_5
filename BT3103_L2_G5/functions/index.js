const functions = require("firebase-functions");
const admin = require("firebase-admin");
const https = require("https");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { onDocumentUpdated } = require('firebase-functions/v2/firestore');

admin.initializeApp();
const db = admin.firestore();

// Downloads a PDF from a Firebase Storage URL and returns it as a Buffer.
function downloadPdfFromUrl(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}: ${url}`));
          return;
        }
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => resolve(Buffer.concat(chunks)));
        response.on("error", reject);
      })
      .on("error", reject);
  });
}

exports.onApplicationCreated = functions
  .region("asia-southeast1")
  .firestore.document("applications/{applicationId}")
  .onCreate(async (snap, context) => {
    const applicationId = context.params.applicationId;
    const applicationData = snap.data();

    try {
      const resumeUrl = applicationData.resumeUrl;
      if (!resumeUrl) {
        console.warn(`[TRIGGER] No resume URL for application ${applicationId}`);
        return;
      }

      console.log(`[TRIGGER] Processing resume for application: ${applicationId}`);

      // Step 1: Download PDF and convert to base64
      const pdfBuffer = await downloadPdfFromUrl(resumeUrl);
      const base64Pdf = pdfBuffer.toString("base64");
      console.log(`[TRIGGER] PDF downloaded, size: ${pdfBuffer.length} bytes`);

      // Step 2: Fetch job description and requirements from Firestore
      const jobId = applicationData.jobId;
      let jobDescription = "Not provided";
      let jobRequirements = "Not provided";
      if (jobId) {
        const jobDoc = await db.collection("jobs").doc(jobId).get();
        if (jobDoc.exists) {
          jobDescription = jobDoc.data().description || "Not provided";
          jobRequirements = jobDoc.data().requirements || "Not provided";
          console.log(`[TRIGGER] Job description and requirements fetched for jobId: ${jobId}`);
        }
      }

      // Step 3: Send PDF natively to Gemini
      const genAI = new GoogleGenerativeAI(functions.config().gemini.key);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `You are an expert resume parser and job fit assessor. Extract information from the attached resume PDF and evaluate it against the job description and requirements below. Return a single JSON object.

JOB DESCRIPTION:
${jobDescription}

JOB REQUIREMENTS:
${jobRequirements}

TODAY'S DATE: ${new Date().toISOString().split('T')[0]}

FIELDS TO EXTRACT:
- candidateName: Full name of the candidate.
- location: Current location. City and Country only.
- totalYearsExperience: Total years of work experience as a number (decimal ok, e.g. 2.5). Include military/national service. Exclude education periods. For current roles, calculate duration up to today.
- primarySkills: Array of top 5 recruiter-friendly skills. Prefer technologies, tools, domain expertise, programming languages. No generic tasks like "communication" or "reporting".
- experienceSummary: Max 3 sentences. Summarise the candidate's most relevant work experience in plain English. Mention current/recent role, key achievements, and relevant background.
- educationSummary: Max 2 sentences. State the highest qualification and institution. Example: "Bachelor of Science in Marketing, UC Berkeley."
- matchScore: Integer 0-100. How well does this resume match the job description and requirements? Consider relevant skills, experience, industry background, and qualifications. Be realistic. 70+ = strong, 40-69 = partial, below 40 = weak.
- matchReason: 1-2 sentences explaining the match score. Mention key strengths and any gaps.

If a field cannot be determined, use:
- null for numbers
- "Not found" for strings
- [] for arrays

Return ONLY a valid JSON object. No markdown, no backticks, no explanation.`;

      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: "application/pdf",
            data: base64Pdf,
          },
        },
        { text: prompt },
      ]);

      // Step 4: Parse Gemini response
      const raw = result.response.text().trim()
        .replace(/^```json\n?/, '')
        .replace(/^```\n?/, '')
        .replace(/```$/, '')
        .trim();

      const extractedData = JSON.parse(raw);
      console.log(`[GEMINI] Extracted:`, extractedData);

      // Step 5: Save extraction to Firestore
      await db
        .collection("applications")
        .doc(applicationId)
        .collection("resumeExtraction")
        .add({
          ...extractedData,
          extractedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      // Step 6: Update application status
      await snap.ref.update({
        resumeParsed: true,
        resumeParseStatus: "completed",
        extractionStatus: "completed",
        matchScore: extractedData.matchScore ?? null,
      });

      console.log(`[TRIGGER] Done for application: ${applicationId}`);

    } catch (error) {
      console.error(`[TRIGGER] Error for ${applicationId}:`, error);
      await snap.ref.update({
        resumeParsed: false,
        resumeParseStatus: "failed",
        extractionStatus: "incomplete",
        resumeParseError: error.message,
      }).catch(() => {});
    }
  });

// Email notification function
exports.sendApplicationStatusEmail = onDocumentUpdated(
  {
    document: 'applications/{applicationId}',
    region: 'asia-southeast1'
  },
  async (event) => {
    const before = event.data.before.data();
    const after = event.data.after.data();

    if (!before || !after) return;

    const oldStatus = before.status;
    const newStatus = after.status;

    const validTransition =
      oldStatus === 'Pending' &&
      (newStatus === 'Accepted' || newStatus === 'Rejected' || newStatus === 'Shortlisted');

    if (!validTransition) return;
    if (after.emailNotificationSent === true) return;

    const candidateEmail = after.candidateEmail;
    const candidateName = after.candidateName || 'Applicant';
    const jobTitle = after.jobTitle || 'the position';

    let subject = '';
    let html = '';

    if (newStatus === 'Accepted' || newStatus === 'Shortlisted') {
      subject = 'Your application has been accepted';
      html = `
        <p>Hi ${candidateName},</p>
        <p>We are pleased to inform you that your application for <b>${jobTitle}</b> has been <b>accepted</b>.</p>
        <p>We will contact you with the next steps soon.</p>
        <p>Best regards,<br/>Recruitment Team</p>
      `;
    } else {
      subject = 'Update on your job application';
      html = `
        <p>Hi ${candidateName},</p>
        <p>Thank you for applying for <b>${jobTitle}</b>.</p>
        <p>We would like to let you know that your application was <b>not selected</b> this time.</p>
        <p>We appreciate your interest and wish you all the best.</p>
        <p>Best regards,<br/>Recruitment Team</p>
      `;
    }

    await admin.firestore().collection('mail').add({
      to: candidateEmail,
      message: { subject, html }
    });

    await event.data.after.ref.update({
      emailNotificationSent: true
    });
  }
);
