import { model } from '../config/gemini';

// Extract RFP data from natural language
export const extractRFPFromText = async (naturalLanguageInput: string) => {
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

    // Aggressive cleaning: remove any markdown code fences
    text = text.trim();
    text = text.split('``````').join('').trim();

    // Extract the JSON object between { and }
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }

    text = text.trim();

    console.log('🔍 Cleaned RFP text:', text);

    const rfpData = JSON.parse(text);

    // Basic validation
    if (!rfpData.title || !rfpData.budget || !rfpData.items) {
      throw new Error('Missing required RFP fields');
    }

    console.log('✅ AI RFP extraction successful');
    return rfpData;
  } catch (error) {
    console.error('Error extracting RFP from text:', error);
    throw new Error('Failed to extract RFP data from natural language');
  }
};

// Extract proposal data from vendor email response
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
    text = text.split('``````').join('').trim();

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

// Compare proposals and generate AI recommendation
export const compareProposals = async (rfp: any, proposals: any[]): Promise<any> => {
  try {
    const prompt = `
You are an AI assistant that compares vendor proposals and provides recommendations.

RFP Details:
- Title: ${rfp.title}
- Budget: $${rfp.budget}
- Required Delivery: ${rfp.deliveryDays} days
- Required Warranty: ${rfp.warrantyMonths} months

Vendor Proposals:
${proposals
  .map(
    (p, i) => `
Proposal ${i + 1}:
- Vendor: ${p.vendor?.name || p.vendorEmail}
- Price: $${p.totalPrice}
- Delivery: ${p.deliveryDays} days
- Warranty: ${p.warrantyMonths} months
- Notes: ${p.notes || 'None'}`
  )
  .join('\n')}

Provide a comprehensive comparison and recommendation in the following JSON format:

{
  "summary": "Brief overview of all proposals",
  "scores": [
    {
      "vendorName": "Vendor name",
      "priceScore": number (0-100),
      "deliveryScore": number (0-100),
      "warrantyScore": number (0-100),
      "totalScore": number (0-100)
    }
  ],
  "recommendation": {
    "bestVendor": "Vendor name",
    "reason": "Detailed explanation of why this vendor is recommended"
  },
  "considerations": [
    "Important point 1",
    "Important point 2"
  ]
}

Scoring criteria:
- Price: Lower is better (within budget gets higher score)
- Delivery: Faster is better (meeting or beating required delivery)
- Warranty: Longer is better (meeting or exceeding required warranty)

Return ONLY the JSON object, nothing else.
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    let text = response.text();

    console.log('🔍 Raw comparison response:', text);

    text = text.trim();
    text = text.split('``````').join('').trim();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }

    text = text.trim();

    console.log('🔍 Cleaned comparison text:', text);

    const comparison = JSON.parse(text);

    console.log('✅ AI comparison successful');
    return comparison;
  } catch (error) {
    console.error('Error comparing proposals:', error);
    throw new Error('Failed to compare proposals');
  }
};
