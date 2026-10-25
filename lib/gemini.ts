import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenAI } from "@google/genai";

const textApiKey = process.env.GEMINI_API_KEY;

if (!textApiKey) {
  throw new Error("Set GEMINI_API_KEY in environment variables");
}

const genAI = new GoogleGenerativeAI(textApiKey);
const imageAI = new GoogleGenAI({ apiKey: textApiKey });

interface GeminiImagePart {
  text?: string;
  inlineData?: {
    mimeType?: string;
    data?: string;
  };
}

interface GeneratedImage {
  base64Data: string;
  mimeType: string;
  model: string;
  description?: string;
}

class GeminiService {
  private model;

  constructor() {
    this.model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 8192,
      },
    });
  }

  async generateJSON<T = unknown>(prompt: string): Promise<T> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Extract JSON from response (handle markdown code blocks)
      let jsonText = text.trim();
      
      // Remove markdown code blocks if present
      if (jsonText.startsWith("```json")) {
        jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      } else if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/```\n?/g, "");
      }

      // Try to find JSON array or object
      const jsonMatch = jsonText.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in response");
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return parsed as T;
    } catch (error) {
      throw new Error(
        error instanceof Error 
          ? `AI Generation Failed: ${error.message}` 
          : "Failed to generate content"
      );
    }
  }

  async generateText(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      throw new Error(
        error instanceof Error 
          ? `AI Generation Failed: ${error.message}` 
          : "Failed to generate content"
      );
    }
  }

  async generateImage(prompt: string): Promise<GeneratedImage> {
    const preferredModel = process.env.GEMINI_IMAGE_MODEL || "gemini-3.1-flash-image-preview";
    const candidateModels = Array.from(
      new Set([
        preferredModel,
        "gemini-3.1-flash-image-preview",
        "gemini-2.5-flash-image",
        "gemini-3-pro-image-preview",
      ])
    );

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
          (part) => part.inlineData?.data && (part.inlineData?.mimeType || "").startsWith("image/")
        );

        if (!imagePart?.inlineData?.data) {
          continue;
        }

        const textPart = parts.find((part) => typeof part.text === "string" && part.text.trim().length > 0);

        return {
          base64Data: imagePart.inlineData.data,
          mimeType: imagePart.inlineData.mimeType || "image/png",
          model,
          description: textPart?.text,
        };
      } catch {
        // Try the next supported model.
      }
    }

    return this.createPromptBasedSvgImage(prompt);
  }

  private createPromptBasedSvgImage(prompt: string): GeneratedImage {
    const palettes = [
      { bgFrom: "#0f766e", bgTo: "#0891b2", accent: "#f97316", accentSecondary: "#a78bfa" },
      { bgFrom: "#1d4ed8", bgTo: "#6366f1", accent: "#34d399", accentSecondary: "#fbbf24" },
      { bgFrom: "#7c3aed", bgTo: "#ec4899", accent: "#22d3ee", accentSecondary: "#fde047" },
      { bgFrom: "#0f172a", bgTo: "#334155", accent: "#60a5fa", accentSecondary: "#f472b6" },
      { bgFrom: "#7c2d12", bgTo: "#c2410c", accent: "#fde047", accentSecondary: "#fb7185" },
    ];

    const hash = this.hashString(prompt);
    const palette = palettes[Math.abs(hash) % palettes.length];
    const primaryPrompt = (prompt.split("Design constraints:")[0] || prompt).replace(/\s+/g, " ").trim();
    const brandName = this.extractBrandName(prompt) || "Brand Concept";
    const heading = this.limitText(brandName, 32);
    const subtitleLines = this.splitTextToLines(
      primaryPrompt || "AI-assisted design concept",
      46,
      2
    );

    const circleX = 860 + (Math.abs(hash) % 180);
    const circleY = 220 + (Math.abs(hash * 7) % 220);
    const circleRadius = 120 + (Math.abs(hash * 13) % 70);
    const secondaryX = 260 + (Math.abs(hash * 11) % 140);
    const secondaryY = 200 + (Math.abs(hash * 17) % 120);

    const safeHeading = this.escapeXml(heading);
    const safeSubtitleLines = subtitleLines.map((line) => this.escapeXml(line));
    const subtitleSvg = safeSubtitleLines
      .map((line, index) => `<tspan x="185" dy="${index === 0 ? 0 : 38}">${line}</tspan>`)
      .join("\n    ");

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900" role="img" aria-label="${safeHeading}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.bgFrom}" />
      <stop offset="100%" stop-color="${palette.bgTo}" />
    </linearGradient>
    <linearGradient id="accent-bar" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${palette.accent}" />
      <stop offset="100%" stop-color="${palette.accentSecondary}" />
    </linearGradient>
  </defs>
  <rect width="1200" height="900" fill="url(#bg)" />
  <circle cx="${circleX}" cy="${circleY}" r="${circleRadius}" fill="${palette.accent}" fill-opacity="0.18" />
  <circle cx="${secondaryX}" cy="${secondaryY}" r="96" fill="${palette.accentSecondary}" fill-opacity="0.2" />
  <path d="M90 780 C260 660 420 780 590 660 C760 540 930 670 1110 560 L1110 900 L90 900 Z" fill="#ffffff" fill-opacity="0.12" />

  <rect x="125" y="135" width="850" height="620" rx="34" fill="#000000" fill-opacity="0.12" />
  <rect x="110" y="120" width="850" height="620" rx="34" fill="#ffffff" fill-opacity="0.93" />
  <rect x="110" y="120" width="850" height="620" rx="34" stroke="#ffffff" stroke-opacity="0.35" stroke-width="2" />
  <rect x="110" y="120" width="850" height="16" rx="8" fill="url(#accent-bar)" />

  <text x="185" y="300" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="70" font-weight="800" fill="#0f172a">
    ${safeHeading}
  </text>

  <text x="185" y="360" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="32" fill="#334155" fill-opacity="0.95">
    ${subtitleSvg}
  </text>

  <rect x="185" y="600" width="260" height="56" rx="28" fill="#0f172a" fill-opacity="0.06" />
  <text x="215" y="636" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="20" font-weight="700" letter-spacing="3" fill="#0f172a">
    SHECAN STUDIO
  </text>
</svg>`;

    return {
      base64Data: Buffer.from(svg, "utf8").toString("base64"),
      mimeType: "image/svg+xml",
      model: "shecan-svg-fallback",
      description: "Prompt-based SVG fallback generated by SheCan",
    };
  }

  private extractBrandName(prompt: string): string {
    const match = prompt.match(/brand name(?: to include conceptually)?\s*:\s*([^\n]+)/i);
    return match?.[1]?.trim() || "";
  }

  private hashString(value: string): number {
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) {
      hash = (hash << 5) - hash + value.charCodeAt(index);
      hash |= 0;
    }
    return hash;
  }

  private limitText(value: string, maxLength: number): string {
    const normalized = value.replace(/\s+/g, " ").trim();
    if (normalized.length <= maxLength) {
      return normalized;
    }

    if (maxLength <= 3) {
      return normalized.slice(0, maxLength);
    }

    return `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
  }

  private splitTextToLines(value: string, maxLineLength: number, maxLines: number): string[] {
    const words = value.replace(/\s+/g, " ").trim().split(" ");
    if (!words.length) {
      return [""];
    }

    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      const candidate = currentLine ? `${currentLine} ${word}` : word;
      if (candidate.length <= maxLineLength) {
        currentLine = candidate;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;

        if (lines.length >= maxLines - 1) {
          break;
        }
      }
    }

    if (lines.length < maxLines && currentLine) {
      lines.push(currentLine);
    }

    if (lines.length > maxLines) {
      return lines.slice(0, maxLines);
    }

    const trimmed = lines.slice(0, maxLines);
    const joinedWords = words.join(" ");
    const trimmedJoined = trimmed.join(" ");
    if (trimmedJoined.length < joinedWords.length && trimmed.length) {
      const lastIndex = trimmed.length - 1;
      trimmed[lastIndex] = this.limitText(trimmed[lastIndex], maxLineLength);
      if (!trimmed[lastIndex].endsWith("...")) {
        trimmed[lastIndex] = this.limitText(`${trimmed[lastIndex]}...`, maxLineLength);
      }
    }

    return trimmed;
  }

  private escapeXml(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  async chat(history: Array<{ role: string; parts: string }>, message: string) {
    try {
      const chat = this.model.startChat({
        history: history.map((msg) => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.parts }],
        })),
      });

      const result = await chat.sendMessage(message);
      return result.response.text();
    } catch {
      throw new Error("Failed to process chat message");
    }
  }
}

export const gemini = new GeminiService();
