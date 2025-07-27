import React from 'react';
import './LandingPage.css';

function LandingPage({ onStart }) {
  return (
    <div className="landing">
      <h1>🕵️ Welcome to Verifact: Fake News Verifier</h1>
      <p>AI-powered real-time fact checker</p>
      <button onClick={onStart}>🚀 Start Verifying</button>
    </div>
  );
}

export default LandingPage;
