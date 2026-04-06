// ============================================================
// Firebase Cloud Function — Automatic Resume Parser
// Region: asia-southeast1
//
// WHAT IT DOES:
//   Listens for new documents in the Firestore "applications" collection.
//   When a candidate submits a job application (with a resume PDF), this
//   function automatically downloads and parses the PDF, then stores the
//   extracted text in a "parseResults" subcollection.
// ============================================================

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const PDFParser = require("pdf2json");
const https = require("https");
const { onDocumentUpdated } = require('firebase-functions/v2/firestore')

admin.initializeApp();

const db = admin.firestore();

// Parses a PDF from a raw buffer and returns the extracted text + page count.
// Uses pdf2json instead of pdf-parse due to a known import bug in Cloud Functions.
function parsePdfBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, 1);
    pdfParser.on("pdfParser_dataError", (err) => reject(err.parserError));
    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      resolve({
        text: pdfParser.getRawTextContent(),
        numpages: pdfData.Pages ? pdfData.Pages.length : 0,
      });
    });
    pdfParser.parseBuffer(buffer);
  });
}

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

// Firestore trigger — fires automatically when a new application is created.
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

      console.log(`[TRIGGER] Parsing resume for application: ${applicationId}`);

      // Step 1: Download the PDF from Firebase Storage
      const pdfBuffer = await downloadPdfFromUrl(resumeUrl);

      // Step 2: Extract text from the PDF
      const pdfData = await parsePdfBuffer(pdfBuffer);

      console.log(`[TRIGGER] Parsed: ${pdfData.numpages} pages, ${pdfData.text.length} characters`);

      // Step 3: Save the extracted text to the parseResults subcollection
      const resultDoc = await db
        .collection("applications")
        .doc(applicationId)
        .collection("parseResults")
        .add({
          extractedText: pdfData.text,
          pageCount: pdfData.numpages,
          characterCount: pdfData.text.length,
          resumeUrl: resumeUrl,
          parsedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      // Step 4: Update the application document with the parse result ID and status
      await snap.ref.update({
        resumeParsed: true,
        resumeParseResultId: resultDoc.id,
        resumeParseStatus: "completed",
      });

      console.log(`[TRIGGER] Done. Result stored at: ${resultDoc.id}`);
    } catch (error) {
      // If anything fails, mark the application as parse-failed
      console.error(`[TRIGGER] Error for ${applicationId}:`, error);
      await snap.ref.update({
        resumeParsed: false,
        resumeParseStatus: "failed",
        resumeParseError: error.message,
      }).catch(() => {});
    }
  });

// Email notification function - updated to handle Shortlisted status (force redeploy)
exports.sendApplicationStatusEmail = onDocumentUpdated(
  {
    document: 'applications/{applicationId}',
    region: 'asia-southeast1'
  },
  async (event) => {
    const before = event.data.before.data()
    const after = event.data.after.data()

    if (!before || !after) return

    const oldStatus = before.status
    const newStatus = after.status

    const validTransition =
      oldStatus === 'Pending' &&
      (newStatus === 'Accepted' || newStatus === 'Rejected' || newStatus === 'Shortlisted')

    if (!validTransition) return
    if (after.emailNotificationSent === true) return

    const candidateEmail = after.candidateEmail
    const candidateName = after.candidateName || 'Applicant'
    const jobTitle = after.jobTitle || 'the position'

    let subject = ''
    let html = ''

    if (newStatus === 'Accepted' || newStatus === 'Shortlisted') {
      subject = 'Your application has been accepted'
      html = `
        <p>Hi ${candidateName},</p>
        <p>We are pleased to inform you that your application for <b>${jobTitle}</b> has been <b>accepted</b>.</p>
        <p>We will contact you with the next steps soon.</p>
        <p>Best regards,<br/>Recruitment Team</p>
      `
    } else {
      subject = 'Update on your job application'
      html = `
        <p>Hi ${candidateName},</p>
        <p>Thank you for applying for <b>${jobTitle}</b>.</p>
        <p>We would like to let you know that your application was <b>not selected</b> this time.</p>
        <p>We appreciate your interest and wish you all the best.</p>
        <p>Best regards,<br/>Recruitment Team</p>
      `
    }

    await admin.firestore().collection('mail').add({
      to: candidateEmail,
      message: { subject, html }
    })

    await event.data.after.ref.update({
      emailNotificationSent: true
    })
  }
)
