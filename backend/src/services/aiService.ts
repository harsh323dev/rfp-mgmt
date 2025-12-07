import axios from 'axios';
import OpenAI from 'openai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ----------------- Gemini helper (Create RFP) -----------------

async function callGemini(prompt: string) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const res = await axios.post(
    `${GEMINI_URL}?key=${GEMINI_API_KEY}`,
    {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  const data: any = res.data;

  const text =
    data &&
    data.candidates &&
    data.candidates[0] &&
    data.candidates[0].content &&
    data.candidates[0].content.parts &&
    data.candidates[0].content.parts[0] &&
    typeof data.candidates[0].content.parts[0].text === 'string'
      ? data.candidates[0].content.parts[0].text
      : data &&
        data.candidates &&
        data.candidates[0] &&
        typeof data.candidates[0].output_text === 'string'
      ? data.candidates[0].output_text
      : '';

  if (!text) {
    throw new Error('Empty response from Gemini');
  }

  return text;
}

// ---------- RFP extraction with Gemini ----------

export const extractRFPFromText = async (naturalLanguageInput: string) => {
  const prompt = `
You are an assistant that extracts structured RFP data from unstructured text.

Input:
${naturalLanguageInput}

Return ONLY valid JSON with this shape:
{
  "title": "short title",
  "description": "clean summary",
  "budget": 0,
  "deliveryDays": 0,
  "warrantyMonths": 0,
  "paymentTerms": "string",
  "items": [
    {
      "name": "item name",
      "quantity": 1,
      "unit": "unit"
    }
  ]
}
`;

  const text = await callGemini(prompt);

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const jsonString = jsonMatch ? jsonMatch[0] : text;

  const parsed = JSON.parse(jsonString);

  return parsed;
};

// ---------- Proposal comparison with OpenAI ----------

export const compareProposals = async (rfp: any, proposalsInput: any[]) => {
  const proposals = Array.isArray(proposalsInput)
    ? proposalsInput
    : [proposalsInput];

  if (!proposals.length) {
    throw new Error('No proposals passed to compareProposals');
  }

  const proposalSummaries = proposals.map((p: any) => ({
    vendorName: p.vendor?.name ?? 'Unknown Vendor',
    totalPrice: p.totalPrice,
    deliveryDays: p.deliveryDays,
    warrantyMonths: p.warrantyMonths,
    notes: p.notes ?? '',
  }));

  const userPrompt = `
You are an expert procurement analyst.

RFP:
Title: ${rfp.title}
Description: ${rfp.description}
Budget: ${rfp.budget}
DeliveryDays: ${rfp.deliveryDays}
WarrantyMonths: ${rfp.warrantyMonths}
PaymentTerms: ${rfp.paymentTerms}

Proposals (JSON array):
${JSON.stringify(proposalSummaries, null, 2)}

Compare the proposals and respond ONLY as valid JSON in this structure:
{
  "proposals": [
    {
      "vendorName": "string",
      "totalPrice": number,
      "deliveryDays": number,
      "warrantyMonths": number,
      "scores": {
        "priceScore": number,
        "deliveryScore": number,
        "warrantyScore": number
      },
      "totalScore": number,
      "summary": "short explanation"
    }
  ],
  "recommendation": {
    "vendorName": "string",
    "reason": "why this vendor is recommended"
  },
  "considerations": [
    "short bullet point about duplicates, trade-offs, or remarks"
  ]
}
Return JSON only, no extra text.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a strict JSON generator. Always return exactly the JSON schema requested by the user.',
        },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
    });

    const raw = completion.choices[0]?.message?.content ?? '';
    const jsonMatch = raw.match(/\{[\s\S]*\}$/);
    const jsonString = jsonMatch ? jsonMatch[0] : raw;

    const parsed = JSON.parse(jsonString);

    if (!Array.isArray(parsed.proposals)) {
      throw new Error('AI response missing proposals array');
    }

    return parsed;
  } catch (error: any) {
    console.error('OpenAI compare error:', error);
    throw new Error('Failed to compare proposals');
  }
};
