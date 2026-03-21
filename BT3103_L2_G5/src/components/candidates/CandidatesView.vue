<template>
    <div class="candidates-container">
      <header class="page-header">
        <router-link to="/hr-dashboard" class="back-link">← Back to Dashboard</router-link>
        <h1>Candidates Overview</h1>
        <p class="muted">Viewing applicants for Job ID: <strong>{{ id }}</strong></p>
      </header>
  
      <main class="content">
        <div class="card empty-state">
          <h2>No candidates yet</h2>
          <p class="muted">When candidates apply for this position, they will appear here.</p>
        </div>
      </main>
    </div>
  </template>
  
  <script setup>
  // This tells Vue to accept the ':id' parameter from the URL as a variable
  defineProps({
    id: {
      type: String,
      required: true
    }
  })
  </script>
  
  <style scoped>
  .candidates-container {
    padding: 2.5rem;
    background-color: #f8fafc;
    min-height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #1a1f2c;
  }
  
  .page-header {
    margin-bottom: 2rem;
  }
  
  .back-link {
    display: inline-block;
    color: #6e7a8e;
    text-decoration: none;
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }
  
  .back-link:hover {
    color: #1e3a8a;
  }
  
  .muted {
    color: #6e7a8e;
  }
  
  .card {
    background-color: #ffffff;
    padding: 3rem;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }
  
  .empty-state {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
  </style>