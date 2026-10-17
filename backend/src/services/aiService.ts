// aiService.ts
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export interface Manufacturer {
  id: string;
  name: string;
  loyaltyScore: number;
  orderVolume: number;
  onTimeDeliveryRate: number;
  disputeHistoryCount: number;
  [key: string]: any;
}

export interface CustomerPreferences {
  priority?: string;
  maxDisputeTolerance?: number;
  [key: string]: any;
}

export interface AIRecommendationResponse {
  recommendedManufacturerId: string;
  headline: string;
  justification: string;
  runnerUpId: string;
  runnerUpReason: string;
}

export async function getManufacturerRecommendation(
  scoredManufacturers: Manufacturer[],
  customerPreferences: CustomerPreferences = {}
): Promise<AIRecommendationResponse> {
  const prompt = `
You are an expert supply chain and procurement strategist.
Review the following pre-scored shortlist of manufacturers and determine the optimal selection for the customer.

Customer Requirements & Preferences:
${JSON.stringify(customerPreferences, null, 2)}

Pre-Scored Manufacturers:
${JSON.stringify(scoredManufacturers, null, 2)}

Provide your analysis strictly as a JSON object with these keys:
- "recommendedManufacturerId": (string) ID of the top-choice manufacturer.
- "headline": (string) A concise single-sentence summary.
- "justification": (string) A detailed breakdown explaining why this manufacturer is the best match.
- "runnerUpId": (string) ID of the best alternative.
- "runnerUpReason": (string) Brief reason why they came in second.
`;

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: 'You are an enterprise procurement AI assistant. Always reply in clean, valid JSON.' },
      { role: 'user', content: prompt }
    ],
    model: 'openai/gpt-oss-20b', // <--- Change model name here
    response_format: { type: 'json_object' },
    temperature: 0.2
  });

  const rawContent = chatCompletion.choices[0]?.message?.content || '{}';
  return JSON.parse(rawContent) as AIRecommendationResponse;
}