import dotenv from 'dotenv';
dotenv.config(); // MUST BE FIRST!

import express, { Request, Response } from 'express';
import cors from 'cors';
import connectDB from './config/database';
import rfpRoutes from './routes/rfpRoutes';
import vendorRoutes from './routes/vendorRoutes';
import proposalRoutes from './routes/proposalRoutes';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - ORDER MATTERS!
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global request logger - MUST BE BEFORE ALL ROUTES!
app.use((req, res, next) => {
  console.log(`🟢 Incoming: ${req.method} ${req.url}`);
  console.log(`🟢 Body:`, req.body);
  next();
});

// Connect to MongoDB
connectDB();

// Test route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: '🚀 RFP Management System API is running!' });
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes - MUST BE BEFORE app.listen()!
app.use('/api/rfps', rfpRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/proposals', proposalRoutes);

// Start server - MUST BE LAST!
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
