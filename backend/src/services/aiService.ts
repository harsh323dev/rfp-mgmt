import { model } from '../config/gemini';

export const extractRFPFromText = async (naturalLanguageInput: string) => {
  try {
    const prompt = `
You are an AI assistant that converts natural language procurement requests into structured RFP data.

Extract the following information from the user's input and return ONLY a valid JSON object (no markdown, no code blocks):

{
  "title": "Brief title for the RFP",
  "description": "Full description of what they want to buy",
  "budget": number (total budget in dollars),
  "items": [
    {
      "name": "Item name",
      "quantity": number,
      "specifications": "detailed specs"
    }
  ],
  "deliveryDays": number (delivery timeline in days),
  "paymentTerms": "string (e.g., Net 30, Net 60)",
  "warrantyMonths": number (warranty period in months)
}

User Input: ${naturalLanguageInput}

Return ONLY the JSON object, nothing else.
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Clean up the response - remove markdown code blocks if present
    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json\n?/, '').replace(/```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\n?/, '').replace(/```$/, '');
    }
    
    const rfpData = JSON.parse(cleanedText);
    return rfpData;
  } catch (error) {
    console.error('Error extracting RFP from text:', error);
    throw new Error('Failed to extract RFP data from natural language');
  }
};
