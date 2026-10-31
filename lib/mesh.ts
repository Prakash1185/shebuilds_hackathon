/**
 * Mesh API Client
 * Unified gateway for AI models (OpenAI-compatible)
 * https://api.meshapi.ai/v1
 *
 * Configured strictly for Gemini models:
 * - Text/Chat/JSON: google/gemini-3.5-flash (primary), google/gemini-2.5-flash, google/gemini-3.1-pro
 * - Images: google/gemini-2.5-flash-image (primary), fal-ai/gemini-25-flash-image
 */

export interface MeshConfig {
  apiKey?: string;
  baseURL?: string;
  defaultTextModel?: string;
  defaultImageModel?: string;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GeneratedImageResult {
  base64Data: string;
  mimeType: string;
  model: string;
  url?: string;
  description?: string;
}

export class MeshService {
  private apiKey: string;
  private baseURL: string;
  public defaultTextModel: string;
  public defaultImageModel: string;

  constructor(config?: MeshConfig) {
    this.apiKey =
      config?.apiKey ||
      process.env.MESH_API_KEY ||
      process.env.ROUTER_SERVICE_KEY ||
      process.env.GEMINI_API_KEY ||
      "";
    this.baseURL = (
      config?.baseURL ||
      process.env.MESH_BASE_URL ||
      "https://api.meshapi.ai/v1"
    ).replace(/\/+$/, "");
    this.defaultTextModel =
      config?.defaultTextModel ||
      process.env.MESH_TEXT_MODEL ||
      "google/gemini-3.5-flash";
    this.defaultImageModel =
      config?.defaultImageModel ||
      process.env.MESH_IMAGE_MODEL ||
      "google/gemini-2.5-flash-image";
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }
    return headers;
  }

  /**
   * Generate structured JSON using strictly Gemini models via Mesh API
   */
  async generateJSON<T = unknown>(
    prompt: string,
    options?: { model?: string; system?: string }
  ): Promise<T> {
    const model = options?.model || this.defaultTextModel;

    if (!this.apiKey) {
      console.warn(
        "Mesh API key missing (MESH_API_KEY / ROUTER_SERVICE_KEY). Check .env."
      );
      throw new Error("Mesh API key missing. Please set MESH_API_KEY in .env");
    }

    const messages: ChatMessage[] = [];
    if (options?.system) {
      messages.push({ role: "system", content: options.system });
    }
    messages.push({ role: "user", content: prompt });

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Mesh API Error (${response.status}):`, errorText);
      throw new Error(`Mesh API request failed [${response.status}]: ${errorText}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Mesh API returned empty response content");
    }

    // Strip markdown code fences if model returned ```json ... ```
    const cleaned = content
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    try {
      const parsed = JSON.parse(cleaned);
      return parsed as T;
    } catch (parseError) {
      console.error("JSON parsing error on text:", cleaned);
      throw new Error("Failed to parse JSON response from Mesh API Gemini model");
    }
  }

  /**
   * Generate text using strictly Gemini models via Mesh API
   */
  async generateText(
    prompt: string,
    options?: { model?: string; system?: string }
  ): Promise<string> {
    const model = options?.model || this.defaultTextModel;

    if (!this.apiKey) {
      return "Demo response: Mesh API key is not configured. Please add MESH_API_KEY to your .env file.";
    }

    try {
      const messages: ChatMessage[] = [];
      if (options?.system) {
        messages.push({ role: "system", content: options.system });
      }
      messages.push({ role: "user", content: prompt });

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Mesh API Text Error (${response.status}):`, errorText);
        return `Mesh API temporarily unavailable (${response.status}).`;
      }

      const data = await response.json();
      return (
        data?.choices?.[0]?.message?.content ||
        "No response generated from Gemini model."
      );
    } catch (error) {
      console.error("Mesh API generateText failure:", error);
      return "AI mentor is temporarily offline. Please try again shortly.";
    }
  }

  /**
   * Multi-turn chat using strictly Gemini models via Mesh API
   */
  async chat(
    messages: ChatMessage[],
    options?: { model?: string }
  ): Promise<string> {
    const model = options?.model || this.defaultTextModel;

    if (!this.apiKey) {
      return "Demo response: Mesh API key is not configured.";
    }

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        console.error(`Mesh API Chat Error (${response.status}):`, err);
        return "I am currently unable to answer. Please check Mesh API status.";
      }

      const data = await response.json();
      return data?.choices?.[0]?.message?.content || "";
    } catch (err) {
      console.error("Mesh API chat error:", err);
      return "Chat service encountered an error. Please retry.";
    }
  }

  /**
   * Generate images using strictly Gemini image models via Mesh API
   * Falls back smoothly to prompt-based SVG if API key is absent or quota is reached
   */
  async generateImage(
    prompt: string,
    options?: { model?: string }
  ): Promise<GeneratedImageResult> {
    const preferredModel = options?.model || this.defaultImageModel;
    const candidateModels = Array.from(
      new Set([
        preferredModel,
        "google/gemini-2.5-flash-image",
        "fal-ai/gemini-25-flash-image",
        "fal-ai/gemini-3.1-flash-image-preview",
      ])
    );

    if (this.apiKey) {
      for (const model of candidateModels) {
        try {
          // Attempt standard OpenAI-compatible image endpoint on Mesh API
          const response = await fetch(`${this.baseURL}/images/generations`, {
            method: "POST",
            headers: this.getHeaders(),
            body: JSON.stringify({
              model,
              prompt,
              response_format: "url",
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const item = data?.data?.[0];
            if (item) {
              const url = item.url || "";
              const b64 = item.b64_json || "";

              // Vertex/Gemini models on Mesh API often return a data URI (data:image/...;base64,...) in url
              if (url.startsWith("data:")) {
                const match = url.match(/^data:([^;]+);base64,(.+)$/);
                if (match) {
                  return {
                    base64Data: match[2],
                    mimeType: match[1],
                    model,
                    url,
                  };
                }
              }

              if (b64) {
                return {
                  base64Data: b64,
                  mimeType: "image/png",
                  model,
                  url: `data:image/png;base64,${b64}`,
                };
              }

              if (url) {
                return {
                  base64Data: "",
                  mimeType: "image/png",
                  model,
                  url,
                };
              }
            }
          }
        } catch (err) {
          console.warn(`Mesh API image model ${model} failed, trying next...`, err);
        }
      }
    }

    // High quality SVG branding fallback
    return this.createPromptBasedSvgImage(prompt);
  }

  /**
   * SVG Fallback generator (for offline / demo / quota safety)
   */
  public createPromptBasedSvgImage(prompt: string): GeneratedImageResult {
    const palettes = [
      { bgFrom: "#0f766e", bgTo: "#0891b2", accent: "#f97316", accentSecondary: "#a78bfa" },
      { bgFrom: "#1d4ed8", bgTo: "#6366f1", accent: "#34d399", accentSecondary: "#fbbf24" },
      { bgFrom: "#7c3aed", bgTo: "#ec4899", accent: "#22d3ee", accentSecondary: "#fde047" },
      { bgFrom: "#0f172a", bgTo: "#334155", accent: "#60a5fa", accentSecondary: "#f472b6" },
      { bgFrom: "#7c2d12", bgTo: "#c2410c", accent: "#fde047", accentSecondary: "#fb7185" },
    ];

    const hash = this.hashString(prompt);
    const palette = palettes[Math.abs(hash) % palettes.length];
    const brandName = this.extractBrandName(prompt) || "SheCan Venture";
    const heading = this.limitText(brandName, 32);

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900" role="img" aria-label="${this.escapeXml(heading)}">
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
  <circle cx="860" cy="220" r="140" fill="${palette.accent}" fill-opacity="0.2" />
  <circle cx="260" cy="200" r="96" fill="${palette.accentSecondary}" fill-opacity="0.2" />
  <rect x="110" y="120" width="850" height="620" rx="34" fill="#ffffff" fill-opacity="0.95" />
  <rect x="110" y="120" width="850" height="16" rx="8" fill="url(#accent-bar)" />
  <text x="185" y="300" font-family="system-ui, sans-serif" font-size="64" font-weight="800" fill="#0f172a">
    ${this.escapeXml(heading)}
  </text>
  <text x="185" y="380" font-family="system-ui, sans-serif" font-size="28" fill="#475569">
    AI Brand & Packaging Concept (Mesh API Gemini)
  </text>
  <rect x="185" y="580" width="280" height="56" rx="28" fill="#0f172a" fill-opacity="0.08" />
  <text x="220" y="616" font-family="system-ui, sans-serif" font-size="18" font-weight="700" letter-spacing="2" fill="#0f172a">
    SHECAN STUDIO
  </text>
</svg>`;

    return {
      base64Data: Buffer.from(svg, "utf8").toString("base64"),
      mimeType: "image/svg+xml",
      model: "shecan-mesh-svg-fallback",
      url: `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`,
      description: "Prompt-based SVG generated by SheCan Studio",
    };
  }

  private extractBrandName(prompt: string): string {
    const match = prompt.match(/brand name(?: to include conceptually)?\s*:\s*([^\n]+)/i);
    return match?.[1]?.trim() || "";
  }

  private hashString(value: string): number {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  private limitText(value: string, maxLength: number): string {
    const normalized = value.replace(/\s+/g, " ").trim();
    if (normalized.length <= maxLength) return normalized;
    return `${normalized.slice(0, maxLength - 3)}...`;
  }

  private escapeXml(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }
}

export const mesh = new MeshService();
