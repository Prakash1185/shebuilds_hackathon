import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";
import { mesh, MeshService, GeneratedImageResult } from "./mesh";

const textApiKey = process.env.GEMINI_API_KEY;
const meshApiKey =
  process.env.MESH_API_KEY ||
  process.env.ROUTER_SERVICE_KEY ||
  textApiKey;

const genAI = textApiKey ? new GoogleGenerativeAI(textApiKey) : null;
const imageAI = textApiKey ? new GoogleGenAI({ apiKey: textApiKey }) : null;

export interface GeneratedImage {
  base64Data: string;
  mimeType: string;
  model: string;
  description?: string;
  url?: string;
}

class GeminiService {
  private directModel;
  private meshClient: MeshService;

  constructor() {
    this.meshClient = mesh;
    this.directModel = genAI
      ? genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 8192,
            responseMimeType: "application/json",
          },
        })
      : null;
  }

  /**
   * Generates structured JSON using Gemini via Mesh API (OpenAI-compatible gateway)
   * Falls back to direct Gemini SDK if Mesh API is unavailable.
   */
  async generateJSON<T = unknown>(
    prompt: string,
    options?: { model?: string }
  ): Promise<T> {
    const selectedModel = options?.model || "google/gemini-3.5-flash";

    // 1. Try Mesh API first if key exists
    if (meshApiKey) {
      try {
        return await this.meshClient.generateJSON<T>(prompt, {
          model: selectedModel,
        });
      } catch (meshErr) {
        console.warn("Mesh API generateJSON error, checking fallback:", meshErr);
        if (!this.directModel) {
          throw meshErr;
        }
      }
    }

    // 2. Direct Gemini SDK fallback
    if (this.directModel) {
      try {
        const result = await this.directModel.generateContent(prompt);
        const text = result.response.text().trim();
        const cleaned = text
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/```\s*$/i, "")
          .trim();
        return JSON.parse(cleaned) as T;
      } catch (directErr) {
        console.error("Direct Gemini SDK generation failed:", directErr);
        throw directErr;
      }
    }

    throw new Error(
      "AI Service unavailable: Neither MESH_API_KEY nor GEMINI_API_KEY is configured."
    );
  }

  /**
   * Generates text content using Gemini via Mesh API
   */
  async generateText(
    prompt: string,
    options?: { model?: string }
  ): Promise<string> {
    const selectedModel = options?.model || "google/gemini-3.5-flash";

    if (meshApiKey) {
      try {
        const result = await this.meshClient.generateText(prompt, {
          model: selectedModel,
        });
        if (result && !result.includes("temporarily unavailable")) {
          return result;
        }
      } catch (err) {
        console.warn("Mesh API generateText error, checking fallback:", err);
      }
    }

    if (this.directModel) {
      try {
        const result = await this.directModel.generateContent(prompt);
        return result.response.text();
      } catch (error) {
        console.error("Direct Gemini text generation failed:", error);
      }
    }

    return "Demo response: Mesh API is configuring. Suno Sathi will be fully live once MESH_API_KEY is set in .env.";
  }

  /**
   * Generates images using strictly Gemini image models via Mesh API
   * Supports google/gemini-2.5-flash-image and fal-ai/gemini-25-flash-image
   */
  async generateImage(
    prompt: string,
    options?: { model?: string }
  ): Promise<GeneratedImage> {
    const selectedModel =
      options?.model ||
      process.env.GEMINI_IMAGE_MODEL ||
      "google/gemini-2.5-flash-image";

    // 1. Try Mesh API image generation
    if (meshApiKey) {
      try {
        const meshImg: GeneratedImageResult = await this.meshClient.generateImage(
          prompt,
          { model: selectedModel }
        );
        if (meshImg && (meshImg.base64Data || meshImg.url)) {
          return {
            base64Data: meshImg.base64Data,
            mimeType: meshImg.mimeType || "image/png",
            model: meshImg.model,
            url: meshImg.url,
            description: meshImg.description,
          };
        }
      } catch (meshImgErr) {
        console.warn("Mesh API image generation error:", meshImgErr);
      }
    }

    // 2. Direct Gemini SDK fallback if configured
    if (imageAI && textApiKey) {
      const candidateModels = [
        "gemini-2.5-flash-image",
        "gemini-3.1-flash-image-preview",
      ];
      for (const model of candidateModels) {
        try {
          const response = await imageAI.models.generateContent({
            model,
            contents: prompt,
            config: {
              responseModalities: ["TEXT", "IMAGE"],
            },
          });

          const parts = response.candidates?.[0]?.content?.parts || [];
          const imagePart = parts.find(
            (part) =>
              part.inlineData?.data &&
              (part.inlineData?.mimeType || "").startsWith("image/")
          );

          if (imagePart?.inlineData?.data) {
            return {
              base64Data: imagePart.inlineData.data,
              mimeType: imagePart.inlineData.mimeType || "image/png",
              model,
              url: `data:${imagePart.inlineData.mimeType || "image/png"};base64,${imagePart.inlineData.data}`,
            };
          }
        } catch {
          // Continue to next candidate
        }
      }
    }

    // 3. Fallback to custom SVG concept design
    const svgResult = this.meshClient.createPromptBasedSvgImage(prompt);
    return {
      base64Data: svgResult.base64Data,
      mimeType: svgResult.mimeType,
      model: svgResult.model,
      url: svgResult.url,
      description: svgResult.description,
    };
  }

  /**
   * Multi-turn chat using strictly Gemini models via Mesh API
   */
  async chat(
    history: Array<{ role: string; parts?: string; content?: string }>,
    message: string,
    options?: { model?: string }
  ): Promise<string> {
    const selectedModel = options?.model || "google/gemini-3.5-flash";

    if (meshApiKey) {
      try {
        const messages = history.map((msg) => ({
          role: (msg.role === "assistant" || msg.role === "model"
            ? "assistant"
            : "user") as "user" | "assistant",
          content: msg.content || msg.parts || "",
        }));
        messages.push({ role: "user", content: message });

        return await this.meshClient.chat(messages, { model: selectedModel });
      } catch (err) {
        console.warn("Mesh chat error:", err);
      }
    }

    if (this.directModel) {
      try {
        const chat = this.directModel.startChat({
          history: history.map((msg) => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.parts || msg.content || "" }],
          })),
        });
        const result = await chat.sendMessage(message);
        return result.response.text();
      } catch {
        // Fallback
      }
    }

    return "Demo response: I'm here to help you grow your business! (Mesh API)";
  }
}

export const gemini = new GeminiService();
export { mesh };
