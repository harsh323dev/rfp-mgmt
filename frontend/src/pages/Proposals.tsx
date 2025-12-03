import React, { useState, useEffect } from 'react';
import { api } from '../api';

const Proposals: React.FC = () => {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState('');

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const response = await api.getAllProposals();
      setProposals(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const handleCheckInbox = async () => {
    setChecking(true);
    setMessage('');
    try {
      const response = await api.receiveProposals();
      setMessage(`✅ Found ${response.data.proposals.length} new proposal(s)`);
      fetchProposals();
    } catch (err: any) {
      setMessage('❌ ' + (err.response?.data?.message || 'Failed to check inbox'));
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="card-title">📬 Vendor Proposals</h2>
          <button
            className="btn-primary"
            onClick={handleCheckInbox}
            disabled={checking}
          >
            {checking ? 'Checking...' : '📧 Check Inbox'}
          </button>
        </div>

        {message && (
          <div className={`alert mb-4 ${message.includes('✅') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}

        {loading ? (
          <div className="spinner"></div>
        ) : proposals.length === 0 ? (
          <p className="text-center" style={{ color: 'var(--slate-700)', padding: '2rem' }}>
            No proposals received yet. Click "Check Inbox" to fetch vendor responses.
          </p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>RFP</th>
                  <th>Total Price</th>
                  <th>Delivery</th>
                  <th>Warranty</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {proposals.map((proposal) => (
                  <tr key={proposal._id}>
                    <td>{proposal.vendor?.name || 'Unknown'}</td>
                    <td>{proposal.rfp?.title || 'N/A'}</td>
                    <td>${proposal.totalPrice}</td>
                    <td>{proposal.deliveryDays} days</td>
                    <td>{proposal.warrantyMonths} months</td>
                    <td>{proposal.notes || 'None'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Proposals;
