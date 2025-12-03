import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import CreateRFP from './pages/CreateRFP';
import Vendors from './pages/Vendors';
import SendRFP from './pages/SendRFP';
import Proposals from './pages/Proposals';
import Compare from './pages/Compare';

function App() {
  return (
    <Router>
      <div>
        <nav className="nav">
          <div className="nav-container">
            <div className="nav-brand">🤖 RFP AI Manager</div>
            <ul className="nav-links">
              <li><Link to="/" className="nav-link">Home</Link></li>
              <li><Link to="/create-rfp" className="nav-link">Create RFP</Link></li>
              <li><Link to="/vendors" className="nav-link">Vendors</Link></li>
              <li><Link to="/send-rfp" className="nav-link">Send RFP</Link></li>
              <li><Link to="/proposals" className="nav-link">Proposals</Link></li>
              <li><Link to="/compare" className="nav-link">Compare</Link></li>
            </ul>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create-rfp" element={<CreateRFP />} />
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/send-rfp" element={<SendRFP />} />
          <Route path="/proposals" element={<Proposals />} />
          <Route path="/compare" element={<Compare />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
