import dotenv from 'dotenv';

// Load .env FIRST before anything else
dotenv.config();

import { GoogleGenerativeAI } from '@google/generative-ai';

// console.log('🔑 Gemini API Key loaded:', process.env.GEMINI_API_KEY?.substring(0, 15) + '...');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

// Use gemini-1.5-flash (free and fast) instead of gemini-pro
export const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });


export default genAI;
