import React, { useState } from 'react';
import { api } from '../api';

const CreateRFP: React.FC = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await api.createRFP({ naturalLanguageInput: input });
      setResult(response.data.rfp);
      setInput('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create RFP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2 className="card-title">🤖 Create RFP with AI</h2>
        <p className="mb-4" style={{ color: 'var(--slate-700)' }}>
          Describe what you need in plain English. AI will structure it into a professional RFP.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Describe Your Requirements</label>
            <textarea
              className="input-field"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Example: I need to buy 50 ergonomic office chairs with adjustable height, lumbar support, and wheels. Budget is $10,000. Delivery needed in 2 weeks with 2-year warranty."
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating...' : '✨ Generate RFP with AI'}
          </button>
        </form>

        {loading && (
          <div>
            <div className="spinner"></div>
            <p className="loading-text">AI is processing your request...</p>
          </div>
        )}

        {error && (
          <div className="alert alert-error mt-4">
            ❌ {error}
          </div>
        )}

        {result && (
          <div className="mt-4">
            <div className="alert alert-success">
              ✅ RFP Created Successfully!
            </div>

            <div className="card mt-4">
              <h3 className="font-bold mb-2">📋 {result.title}</h3>
              <p className="mb-4" style={{ color: 'var(--slate-700)' }}>{result.description}</p>

              <div className="grid grid-2 mb-4">
                <div>
                  <p className="text-sm" style={{ color: 'var(--slate-700)' }}><strong>Budget:</strong> ${result.budget}</p>
                  <p className="text-sm" style={{ color: 'var(--slate-700)' }}><strong>Delivery:</strong> {result.deliveryDays} days</p>
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'var(--slate-700)' }}><strong>Warranty:</strong> {result.warrantyMonths} months</p>
                  <p className="text-sm" style={{ color: 'var(--slate-700)' }}><strong>Payment:</strong> {result.paymentTerms}</p>
                </div>
              </div>

              <h4 className="font-bold mb-2">Items:</h4>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Quantity</th>
                      <th>Specifications</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.items.map((item: any, index: number) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>{item.specifications}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateRFP;
