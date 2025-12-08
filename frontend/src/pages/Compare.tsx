import React, { useState, useEffect } from 'react';
import { api } from '../api';

type RFP = {
  _id: string;
  title: string;
};

type ScoreRow = {
  vendorName: string;
  priceScore: number;
  deliveryScore: number;
  warrantyScore: number;
  totalScore: number;
};

type ComparisonResult = {
  summary: string;
  scores: ScoreRow[];
  recommendation: {
    bestVendor: string;
    reason: string;
  };
  considerations: string[];
};

const Compare: React.FC = () => {
  const [rfps, setRfps] = useState<RFP[]>([]);
  const [selectedRFP, setSelectedRFP] = useState('');
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRFPs();
  }, []);

  const fetchRFPs = async () => {
    try {
      const response = await api.getAllRFPs();
      setRfps(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompare = async () => {
    if (!selectedRFP) return;

    setLoading(true);
    setError('');
    setComparison(null);

    try {
      // backend now returns the comparison object directly
      const response = await api.compareProposals(selectedRFP);
      const data: ComparisonResult = response.data;
      setComparison(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to compare proposals');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2 className="card-title">🤖 AI Proposal Comparison</h2>

        <div className="form-group">
          <label className="label">Select RFP to Compare</label>
          <select
            className="input-field"
            value={selectedRFP}
            onChange={(e) => setSelectedRFP(e.target.value)}
          >
            <option value="">Choose an RFP...</option>
            {rfps.map((rfp) => (
              <option key={rfp._id} value={rfp._id}>
                {rfp.title}
              </option>
            ))}
          </select>
        </div>

        <button
          className="btn-primary"
          onClick={handleCompare}
          disabled={loading || !selectedRFP}
        >
          {loading ? 'Analyzing...' : '🔍 Compare Proposals with AI'}
        </button>

        {loading && (
          <div>
            <div className="spinner"></div>
            <p className="loading-text">AI is analyzing proposals...</p>
          </div>
        )}

        {error && (
          <div className="alert alert-error mt-4">
            ❌ {error}
          </div>
        )}

        {comparison && (
          <div className="mt-4">
            {/* Summary card */}
            <div className="card">
              <h3 className="font-bold mb-2">📊 Summary</h3>
              <p style={{ color: 'var(--slate-700)' }}>{comparison.summary}</p>
            </div>

            {/* Vendor scores table */}
            <div className="card mt-4">
              <h3 className="font-bold mb-4">🏆 Vendor Scores</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Vendor</th>
                      <th>Price Score</th>
                      <th>Delivery Score</th>
                      <th>Warranty Score</th>
                      <th>Total Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.scores.map((score, index) => (
                      <tr key={index}>
                        <td>
                          <strong>{score.vendorName}</strong>
                        </td>
                        <td>{score.priceScore}/100</td>
                        <td>{score.deliveryScore}/100</td>
                        <td>{score.warrantyScore}/100</td>
                        <td>
                          <span className="badge badge-success">
                            {score.totalScore}/100
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recommendation card */}
            <div
              className="card mt-4"
              style={{
                background:
                  'linear-gradient(135deg, var(--primary-50), var(--accent-50))',
              }}
            >
              <h3 className="font-bold mb-2">✨ AI Recommendation</h3>
              <p
                className="text-xl font-bold mb-2"
                style={{ color: 'var(--primary-700)' }}
              >
                {comparison.recommendation.bestVendor}
              </p>
              <p style={{ color: 'var(--slate-700)' }}>
                {comparison.recommendation.reason}
              </p>
            </div>

            {/* Considerations card */}
            <div className="card mt-4">
              <h3 className="font-bold mb-2">⚠️ Considerations</h3>
              <ul style={{ lineHeight: '2', color: 'var(--slate-700)' }}>
                {comparison.considerations.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Compare;
