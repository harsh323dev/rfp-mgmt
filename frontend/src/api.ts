import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const api = {
  // RFP endpoints
  createRFP: (data: any) => axios.post(`${API_URL}/rfps/create`, data),
  getAllRFPs: () => axios.get(`${API_URL}/rfps`),
  sendRFP: (rfpId: string, vendorIds: string[]) =>
    axios.post(`${API_URL}/rfps/send`, { rfpId, vendorIds }),

  // Vendor endpoints
  getAllVendors: () => axios.get(`${API_URL}/vendors`),
  createVendor: (data: any) => axios.post(`${API_URL}/vendors`, data),

  // Proposal endpoints
  receiveProposals: () => axios.post(`${API_URL}/proposals/receive`),
  getAllProposals: () => axios.get(`${API_URL}/proposals`),

  // Compare proposals with AI (FIXED: POST to /rfps/:id/compare)
  compareProposals: (rfpId: string) =>
    axios.post(`${API_URL}/rfps/${rfpId}/compare`),
};
