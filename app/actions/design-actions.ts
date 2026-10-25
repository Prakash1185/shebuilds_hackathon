"use server";

import { gemini } from "@/lib/gemini";

interface DesignRequest {
  designType: string;
  businessName: string;
  colorScheme: string;
  description: string;
}

interface GeneratedDesign {
  id: string;
  type: string;
  prompt: string;
  imageUrl: string;
  downloadUrl: string;
  aiGenerated: boolean;
}

interface DesignGenerationResult {
  enhancedPrompt?: string;
  designElements?: string[];
  colorPalette?: string[];
  typography?: string;
  layout?: string;
}

const DESIGN_CONTEXT: Record<string, { canvas: string; composition: string; style: string }> = {
  "product-label": {
    canvas: "portrait product sticker layout, print-ready look",
    composition: "strong hierarchy with brand mark, product name, and trust badges",
    style: "premium shelf-appeal packaging aesthetic",
  },
  "social-post": {
    canvas: "square digital social graphic",
    composition: "bold center focal element with supportive accents",
    style: "high-contrast social-first marketing visual",
  },
  "business-card": {
    canvas: "landscape business card mockup",
    composition: "clean typographic grid with elegant whitespace",
    style: "professional, modern, and minimalist branding",
  },
  flyer: {
    canvas: "vertical A4-style poster/flyer",
    composition: "headline-driven layout with clear visual flow",
    style: "event-ready promotional design language",
  },
  banner: {
    canvas: "wide horizontal website hero banner",
    composition: "left-to-right storytelling with a clear focal area",
    style: "web-native crisp marketing composition",
  },
  logo: {
    canvas: "centered logo concept presentation",
    composition: "balanced geometry and iconic silhouette",
    style: "vector-like brand identity concept art",
  },
  packaging: {
    canvas: "3D-inspired packaging face design",
    composition: "front-panel clarity with decorative edge details",
    style: "premium consumer packaged goods look",
  },
  menu: {
    canvas: "restaurant menu card layout",
    composition: "readable section blocks with visual separators",
    style: "hospitality-focused elegant menu aesthetic",
  },
};

const COLOR_CONTEXT: Record<string, string> = {
  vibrant: "energetic saturated tones with bold contrast",
  pastel: "soft pastel harmony with gentle gradients",
  elegant: "refined neutral palette with premium accents",
  earthy: "organic warm tones inspired by nature",
  modern: "clean monochrome base with strategic accent color",
};

export async function generateDesign(request: DesignRequest) {
  try {
    const normalizedBusinessName = request.businessName.trim();
    const normalizedDescription = request.description.trim();
    const context = DESIGN_CONTEXT[request.designType] || DESIGN_CONTEXT["social-post"];
    const colorDirection = COLOR_CONTEXT[request.colorScheme] || COLOR_CONTEXT.modern;

    // Generate enhanced design prompt using Gemini
    const prompt = `You are a senior creative director and brand designer. Build a high-quality design brief for an AI image model.

Business Context:
- Entrepreneur Segment: women-led small business in India
- Brand Name: ${normalizedBusinessName}
- Design Type: ${request.designType}
- Color Direction: ${request.colorScheme} (${colorDirection})
- User Goal: ${normalizedDescription}

Format Context:
- Canvas: ${context.canvas}
- Composition: ${context.composition}
- Visual Style: ${context.style}

Return ONLY valid JSON with this exact shape:
{
  "enhancedPrompt": "A detailed visual prompt (120-180 words) suitable for image generation",
  "designElements": ["element1", "element2", "element3", "element4"],
  "colorPalette": ["#HEX1", "#HEX2", "#HEX3", "#HEX4"],
  "typography": "short typography recommendation",
  "layout": "short layout summary"
}

Rules:
- Mention the brand name naturally inside the prompt.
- Prioritize readability and commercial quality.
- Avoid photoreal human faces unless requested.
- Keep text rendering expectations realistic; focus on visual composition.
- No markdown, no code fences, no extra keys.`;

    let result: DesignGenerationResult = {};
    try {
      result = await gemini.generateJSON<DesignGenerationResult>(prompt);
    } catch {
      // Fallback to user prompt if text generation is unavailable.
      result = {};
    }

    const finalPrompt = (result.enhancedPrompt || normalizedDescription).trim();
    const imagePrompt = `${finalPrompt}

Design constraints:
- Output format: ${context.canvas}
- Composition direction: ${context.composition}
- Visual style: ${context.style}
- Color direction: ${colorDirection}
- Brand name to include conceptually: ${normalizedBusinessName}
- Ensure sharp, high-quality, commercial design output.`;

    let imageUrl = generatePlaceholderImage(request);
    let aiGenerated = false;

    try {
      const imageResult = await gemini.generateImage(imagePrompt);
      imageUrl = `data:${imageResult.mimeType};base64,${imageResult.base64Data}`;
      aiGenerated = imageResult.model !== "shecan-svg-fallback";
    } catch {
      // Keep UX functional if provider quota/rate limits are hit.
      aiGenerated = false;
    }

    return {
      success: true,
      design: {
        id: `design-${Date.now()}`,
        type: request.designType,
        prompt: finalPrompt,
        imageUrl: imageUrl,
        downloadUrl: imageUrl,
        aiGenerated,
        designElements: normalizeStringArray(result.designElements),
        colorPalette: normalizeStringArray(result.colorPalette),
        typography: result.typography || "Modern Sans-serif",
        layout: result.layout || "Centered composition",
      } as GeneratedDesign & { designElements: string[]; colorPalette: string[]; typography: string; layout: string },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate design",
    };
  }
}

function generatePlaceholderImage(request: DesignRequest): string {
  const encodedName = encodeURIComponent(request.businessName || "Your Brand");
  const encodedType = encodeURIComponent((request.designType || "design").replace("-", " "));

  const colorMap: Record<string, string> = {
    vibrant: "FF6B6B",
    pastel: "FFD6E8",
    elegant: "2C3E50",
    earthy: "8B7355",
    modern: "6366F1",
  };

  const bgColor = colorMap[request.colorScheme] || "6366F1";
  return `https://placehold.co/1200x800/${bgColor}/ffffff?text=${encodedName}+%0A${encodedType}&font=raleway`;
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}