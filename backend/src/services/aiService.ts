import { model } from '../config/gemini';

// ---------------- RFP extraction with Gemini ----------------

export const extractRFPFromText = async (
  naturalLanguageInput: string
): Promise<any> => {
  try {
    const prompt = `
You are an AI assistant that converts natural language procurement requests into structured RFP (Request for Proposal) data.

Extract the following information from the user's input and return ONLY valid JSON (no markdown, no code blocks, no extra text):

{
  "title": "Brief title for the RFP",
  "description": "Detailed description of what is being procured",
  "budget": number,
  "items": [
    {
      "name": "Item name",
      "quantity": number,
      "specifications": "Technical specifications or requirements"
    }
  ],
  "deliveryDays": number,
  "paymentTerms": "string (e.g., 'Net 30', 'Advance payment', etc.)",
  "warrantyMonths": number
}

Rules:
- Extract all numerical values as numbers (not strings)
- If multiple items are mentioned, create separate objects in the items array
- If information is missing, use reasonable defaults
- deliveryDays should be a number (convert "2 weeks" to 14, "1 month" to 30, etc.)
- warrantyMonths should be in months (convert "1 year" to 12, "2 years" to 24, etc.)

User Input: ${naturalLanguageInput}

Return ONLY the JSON object, nothing else.
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    let text = response.text();

    console.log('🔍 Raw RFP AI response:', text);

    text = text.trim();
    text = text.replace(/``````/g, '').trim();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }

    text = text.trim();

    console.log('🔍 Cleaned RFP text:', text);

    const rfpData = JSON.parse(text);

    if (!rfpData.title || rfpData.budget == null || !rfpData.items) {
      throw new Error('Missing required RFP fields');
    }

    console.log('✅ AI RFP extraction successful');
    return rfpData;
  } catch (error) {
    console.error('Error extracting RFP from text:', error);
    throw new Error('Failed to extract RFP data from natural language');
  }
};

// ---------------- Proposal extraction with Gemini ----------------

export const extractProposalFromEmail = async (
  emailBody: string,
  vendorEmail: string,
  subject: string
): Promise<any> => {
  try {
    const prompt = `
You are an AI assistant that extracts structured proposal data from vendor email responses.

Extract the following information from the vendor's email and return ONLY valid JSON (no markdown, no extra text):

{
  "vendorEmail": "${vendorEmail}",
  "totalPrice": number,
  "deliveryDays": number,
  "warrantyMonths": number,
  "notes": "string (any additional notes or terms from vendor)"
}

Rules:
- Extract the total price (convert to number, remove currency symbols like $, ₹, etc.)
- Extract delivery timeline in days (convert weeks/months to days)
- Extract warranty period in months (convert years to months)
- Include any important additional notes or special terms
- If information is missing, use null for that field
- IMPORTANT: Return ONLY the JSON object. No markdown, no code blocks, no backticks.

Email Subject: ${subject}

Email Body:
${emailBody}

JSON output:
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    let text = response.text();

    console.log('🔍 Raw proposal AI response:', text);

    text = text.trim();
    text = text.replace(/``````/g, '').trim();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }

    text = text.trim();

    console.log('🔍 Cleaned proposal text:', text);

    const proposalData = JSON.parse(text);

    console.log('✅ AI proposal extraction successful');
    return proposalData;
  } catch (error) {
    console.error('Error extracting proposal from email:', error);
    throw new Error('Failed to extract proposal data from email');
  }
};

// ---------------- PURE MATH comparison (no Gemini) ----------------

export const compareProposals = async (
  rfp: any,
  proposalsInput: any[]
): Promise<any> => {
  try {
    console.log('📊 Starting pure math comparison...');

    const proposals = Array.isArray(proposalsInput)
      ? proposalsInput
      : [proposalsInput];

    if (!proposals.length) {
      throw new Error('No proposals to compare');
    }

    const scores = proposals.map((p: any) => {
      const vendorName = p.vendor?.name || p.vendorEmail || 'Unknown Vendor';
      const price = Number(p.totalPrice) || 0;
      const delivery = Number(p.deliveryDays) || 0;
      const warranty = Number(p.warrantyMonths) || 0;

      // Price: lower is better, relative to budget if available
      const priceScore =
        price > 0 && rfp.budget > 0
          ? Math.min(100, Math.round((rfp.budget / price) * 100))
          : price > 0
          ? Math.min(100, Math.round((100000 / price)))
          : 0;

      // Delivery: meeting or beating required days gives high score
      const deliveryScore =
        delivery > 0 && rfp.deliveryDays > 0
          ? Math.min(100, Math.round((rfp.deliveryDays / delivery) * 100))
          : delivery > 0
          ? Math.max(0, 100 - delivery * 2)
          : 0;

      // Warranty: meeting/exceeding required months gives high score
      const warrantyScore =
        warranty > 0 && rfp.warrantyMonths > 0
          ? Math.min(100, Math.round((warranty / rfp.warrantyMonths) * 100))
          : warranty > 0
          ? Math.min(100, warranty * 5)
          : 0;

      const totalScore = Math.round(
        (priceScore + deliveryScore + warrantyScore) / 3
      );

      return {
        vendorName,
        priceScore,
        deliveryScore,
        warrantyScore,
        totalScore,
        price,
        delivery,
        warranty,
      };
    });

    const best = scores.reduce((a, b) =>
      a.totalScore > b.totalScore ? a : b
    );

    const avgPrice =
      proposals.reduce((sum, p) => sum + (Number(p.totalPrice) || 0), 0) /
      proposals.length;
    const minPrice = Math.min(
      ...proposals.map((p) => Number(p.totalPrice) || Infinity)
    );
    const maxWarranty = Math.max(
      ...proposals.map((p) => Number(p.warrantyMonths) || 0)
    );

    const considerations: string[] = [];

    if (best.price < avgPrice) {
      considerations.push(
        `${best.vendorName} offers below‑average pricing ($${best.price} vs avg $${Math.round(
          avgPrice
        )})`
      );
    }

    if (best.delivery && rfp.deliveryDays && best.delivery <= rfp.deliveryDays) {
      considerations.push(
        `${best.vendorName} meets or beats required delivery timeline`
      );
    }

    if (
      best.warranty &&
      rfp.warrantyMonths &&
      best.warranty >= rfp.warrantyMonths
    ) {
      considerations.push(
        `${best.vendorName} meets or exceeds warranty requirements`
      );
    }

    const cheapestVendor = scores.find((s) => s.price === minPrice);
    if (cheapestVendor && cheapestVendor.vendorName !== best.vendorName) {
      considerations.push(
        `${cheapestVendor.vendorName} has the lowest price ($${minPrice}) but a lower overall score`
      );
    }

    const longestWarrantyVendor = scores.find(
      (s) => s.warranty === maxWarranty
    );
    if (
      longestWarrantyVendor &&
      longestWarrantyVendor.vendorName !== best.vendorName
    ) {
      considerations.push(
        `${longestWarrantyVendor.vendorName} offers the longest warranty (${maxWarranty} months)`
      );
    }

    console.log('✅ Math comparison complete');

    return {
      summary: `Analyzed ${proposals.length} proposal(s) using mathematical scoring based on price, delivery, and warranty. ${best.vendorName} achieved the highest overall score.`,
      scores: scores.map((s) => ({
        vendorName: s.vendorName,
        priceScore: s.priceScore,
        deliveryScore: s.deliveryScore,
        warrantyScore: s.warrantyScore,
        totalScore: s.totalScore,
      })),
      recommendation: {
        bestVendor: best.vendorName,
        reason: `${best.vendorName} scored highest (${best.totalScore}/100) with strong price (${best.priceScore}/100), delivery (${best.deliveryScore}/100), and warranty (${best.warrantyScore}/100).`,
      },
      considerations:
        considerations.length > 0
          ? considerations
          : ['All proposals scored purely with math, no external AI.'],
    };
  } catch (error) {
    console.error('Error in math comparison:', error);
    throw new Error('Failed to compare proposals');
  }
};
