import React, { useState, useEffect } from 'react';
import { api } from '../api';

const SendRFP: React.FC = () => {
  const [rfps, setRfps] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [selectedRFP, setSelectedRFP] = useState('');
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rfpRes, vendorRes] = await Promise.all([
        api.getAllRFPs(),
        api.getAllVendors()
      ]);
      setRfps(rfpRes.data);
      setVendors(vendorRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleVendorToggle = (vendorId: string) => {
    setSelectedVendors(prev =>
      prev.includes(vendorId)
        ? prev.filter(id => id !== vendorId)
        : [...prev, vendorId]
    );
  };

  const handleSend = async () => {
    if (!selectedRFP || selectedVendors.length === 0) {
      setMessage('Please select an RFP and at least one vendor');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await api.sendRFP(selectedRFP, selectedVendors);
      setMessage('✅ RFP sent successfully to selected vendors!');
      setSelectedRFP('');
      setSelectedVendors([]);
    } catch (err: any) {
      setMessage('❌ ' + (err.response?.data?.message || 'Failed to send RFP'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2 className="card-title">📧 Send RFP to Vendors</h2>

        <div className="form-group">
          <label className="label">Select RFP</label>
          <select
            className="input-field"
            value={selectedRFP}
            onChange={(e) => setSelectedRFP(e.target.value)}
          >
            <option value="">Choose an RFP...</option>
            {rfps.map((rfp) => (
              <option key={rfp._id} value={rfp._id}>
                {rfp.title} - ${rfp.budget}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="label">Select Vendors (check all that apply)</label>
          <div style={{ maxHeight: '300px', overflowY: 'auto', border: '2px solid var(--slate-200)', borderRadius: '12px', padding: '1rem' }}>
            {vendors.map((vendor) => (
              <div key={vendor._id} style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedVendors.includes(vendor._id)}
                    onChange={() => handleVendorToggle(vendor._id)}
                    style={{ marginRight: '0.75rem', width: '18px', height: '18px' }}
                  />
                  <span><strong>{vendor.name}</strong> - {vendor.email}</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        <button
          className="btn-primary"
          onClick={handleSend}
          disabled={loading}
        >
          {loading ? 'Sending...' : '📨 Send RFP'}
        </button>

        {message && (
          <div className={`alert mt-4 ${message.includes('✅') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default SendRFP;
