import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateKeywords(keyword) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant", //  FIXED MODEL
    messages: [
      {
        role: "system",
        content:
          "You generate short, relevant job-related keyword suggestions. Respond with a comma-separated list only."
      },
      {
        role: "user",
        content: `Generate 10 job-related keywords for: ${keyword}`
      }
    ],
    temperature: 0.3,
    max_tokens: 80,
  });

  return completion.choices[0].message.content;
}
