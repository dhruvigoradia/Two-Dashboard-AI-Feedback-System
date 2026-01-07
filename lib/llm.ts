import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!, // OpenRouter key
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "AI Feedback Dashboard",
  },
});

function extractJSON(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("LLM did not return valid JSON");
  }
  return JSON.parse(match[0]);
}

export async function generateAIOutputs(review: string, rating: number) {
  const completion = await client.chat.completions.create({
    model: "mistralai/mistral-7b-instruct",
    temperature: 0.3,
    max_tokens: 250, // safe for free tier
    messages: [
      {
        role: "system",
        content:
          "You are a professional customer support agent responding on behalf of a business. You must always be polite, empathetic, and professional.",
      },
      {
        role: "user",
        content: `
A customer has submitted feedback.

Rating: ${rating}/5
Review: "${review}"

STRICT RULES:
- The customer-facing response must be polite and empathetic.
- Do NOT repeat or paraphrase the review.
- Do NOT mention internal actions in the customer response.
- The admin fields should be factual and concise.

Generate THREE outputs:

1. user_response - polite reply to the customer
2. admin_summary - neutral internal summary
3. admin_action - clear recommended internal action

Return ONLY valid JSON in this format:
{
  "user_response": "...",
  "admin_summary": "...",
  "admin_action": "..."
}
        `,
      },
    ],
  });

  return extractJSON(completion.choices[0].message.content!);
}
