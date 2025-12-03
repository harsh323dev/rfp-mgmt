import React, { useState, useEffect } from "react";
import { api } from "../api";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// phone optional; if present, must be 8–15 digits, optional leading +
const phoneRegex = /^\+?[0-9]{10,15}$/;


const Vendors: React.FC = () => {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
  });
  const [error, setError] = useState<string | null>(null);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const response = await api.getAllVendors();
      setVendors(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const name = formData.name.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();

    if (!name || !email) {
      setError("Vendor name and email are required.");
      return;
    }

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (phone && !phoneRegex.test(phone)) {
      setError(
        "Please enter a valid phone number (8–15 digits, optional leading +)."
      );
      return;
    }

    try {
      await api.createVendor(formData);
      setFormData({ name: "", email: "", phone: "", company: "" });
      setShowForm(false);
      await fetchVendors();
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.message || "Failed to add vendor.";
      setError(msg);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="card-title">👥 Vendor Management</h2>
          <button
            className="btn-primary"
            onClick={() => {
              setShowForm(!showForm);
              setError(null);
            }}
          >
            {showForm ? "Cancel" : "+ Add Vendor"}
          </button>
        </div>

        {showForm && (
          <>
            {error && (
              <div className="mb-3 text-sm px-3 py-2 rounded border border-red-300 bg-red-50 text-red-700 font-semibold">
                ❗❗ {error} ❗❗
              </div>
            )}

            <form onSubmit={handleSubmit} className="mb-4">
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="label">Vendor Name</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="label">Email</label>
                  <input
                    type="email"
                    className="input-field"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="label">Phone</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Optional (e.g. +11234567890)"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="label">Company</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary">
                Add Vendor
              </button>
            </form>
          </>
        )}

        {loading ? (
          <div className="spinner"></div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Company</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((vendor) => (
                  <tr key={vendor._id}>
                    <td>{vendor.name}</td>
                    <td>{vendor.email}</td>
                    <td>{vendor.phone || "N/A"}</td>
                    <td>{vendor.company || "N/A"}</td>
                  </tr>
                ))}
                {vendors.length === 0 && (
                  <tr>
                    <td colSpan={4}>No vendors added yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Vendors;
