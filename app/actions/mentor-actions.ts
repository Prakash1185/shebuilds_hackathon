"use server";

import { gemini } from "@/lib/gemini";

type MentorRole = "user" | "assistant";

interface MentorMessage {
  role: MentorRole;
  content: string;
}

interface MentorRequest {
  history: MentorMessage[];
  message: string;
  language: string;
}

const LANGUAGE_NAME: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  ta: "Tamil",
  te: "Telugu",
  mr: "Marathi",
  bn: "Bengali",
};

export async function chatWithMentor(
  request: MentorRequest
): Promise<{ success: boolean; reply: string; error?: string }> {
  const userMessage = request.message?.trim();

  if (!userMessage) {
    return {
      success: false,
      reply: "",
      error: "Message cannot be empty",
    };
  }

  const language = LANGUAGE_NAME[request.language] || "English";
  const history = (request.history || [])
    .filter(
      (entry): entry is MentorMessage =>
        (entry.role === "user" || entry.role === "assistant") &&
        typeof entry.content === "string" &&
        entry.content.trim().length > 0
    )
    .slice(-12);

  const transcript = history
    .map((entry) => `${entry.role === "user" ? "User" : "Assistant"}: ${entry.content.trim()}`)
    .join("\n");

  const prompt = `You are Suno Sathi, a practical and empathetic AI business mentor for women entrepreneurs in India.

Rules:
- Respond in ${language}.
- Keep answers actionable with 3-6 concise bullet points when giving advice.
- Be specific to Indian small-business realities (UPI, WhatsApp, ONDC, local sourcing, GST/FSSAI when relevant).
- If the user asks a vague question, ask 1 clarifying question at the end.
- Avoid generic fluff.

Conversation so far:
${transcript || "No prior conversation."}

Current user question:
${userMessage}`;

  try {
    const reply = await gemini.generateText(prompt, {
      model: "google/gemini-3.5-flash",
    });
    const normalizedReply = reply.trim();

    if (!normalizedReply) {
      return {
        success: false,
        reply: "",
        error: "Gemini returned an empty response",
      };
    }

    return {
      success: true,
      reply: normalizedReply,
    };
  } catch (error) {
    return {
      success: false,
      reply: "",
      error: error instanceof Error ? error.message : "AI temporarily unavailable",
    };
  }
}
