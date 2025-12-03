import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="container">
      <div className="hero">
        <h1 className="hero-title">AI-Powered RFP Management</h1>
        <p className="hero-subtitle">
          Create, send, and compare RFPs using advanced AI automation
        </p>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3 className="card-title">📝 Create RFP with AI</h3>
          <p className="mb-4">Describe your requirements in natural language. AI will structure it into a professional RFP.</p>
          <Link to="/create-rfp">
            <button className="btn-primary">Get Started</button>
          </Link>
        </div>

        <div className="card">
          <h3 className="card-title">👥 Manage Vendors</h3>
          <p className="mb-4">Add and manage your vendor database for easy RFP distribution.</p>
          <Link to="/vendors">
            <button className="btn-secondary">View Vendors</button>
          </Link>
        </div>

        <div className="card">
          <h3 className="card-title">📧 Send RFPs</h3>
          <p className="mb-4">Select vendors and automatically send RFPs via email.</p>
          <Link to="/send-rfp">
            <button className="btn-secondary">Send RFP</button>
          </Link>
        </div>

        <div className="card">
          <h3 className="card-title">🤖 AI Comparison</h3>
          <p className="mb-4">AI analyzes proposals and recommends the best vendor with detailed scoring.</p>
          <Link to="/compare">
            <button className="btn-secondary">Compare Proposals</button>
          </Link>
        </div>
      </div>

      <div className="card mt-4">
        <h3 className="card-title">✨ Features</h3>
        <ul style={{ lineHeight: '2', color: 'var(--slate-700)' }}>
          <li>✅ Natural language RFP creation using Google Gemini AI</li>
          <li>✅ Automated email distribution to vendors</li>
          <li>✅ IMAP inbox monitoring for vendor responses</li>
          <li>✅ AI-powered proposal extraction from emails</li>
          <li>✅ Intelligent proposal comparison with scoring</li>
          <li>✅ Detailed vendor recommendations</li>
        </ul>
      </div>
    </div>
  );
};

export default Home;
