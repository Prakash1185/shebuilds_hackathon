"use server";
import { gemini } from "@/lib/gemini";

export interface FormData {
  skill: string;
  location: string;
  timeAvailability: string;
  investment: string;
  experience: string;
}

export interface IdeaResult {
  id: string;
  title: string;
  description: string;
  monthlyIncome: string;
  investment: string;
  demand: string;
  competition: string;
  steps: string[];
  tags: string[];
  difficulty: "Easy" | "Medium" | "Hard";
  timeToProfit: string;
}

export interface GenerateIdeasResponse {
  success: boolean;
  ideas?: IdeaResult[];
  isFallback?: boolean;
  error?: string;
}

export async function generateBusinessIdeas(
  formData: FormData
): Promise<GenerateIdeasResponse> {
  try {
    const prompt = `You are an expert business consultant for women entrepreneurs in India. Generate 3 highly personalized and practical business ideas based on the following profile:

**Profile Details:**
- Primary Skill/Interest: ${formData.skill}
- Location: ${formData.location}
- Time Availability: ${formData.timeAvailability}
- Investment Capacity: ${formData.investment}
- Business Experience: ${formData.experience}

**Requirements:**
1. Generate exactly 3 business ideas tailored to this profile
2. Consider local market conditions in ${formData.location}
3. Match investment range to ${formData.investment}
4. Align time commitment with ${formData.timeAvailability}
5. Adjust complexity based on ${formData.experience} experience level

**For each business idea, provide:**
- title: Catchy, specific business name (e.g., "Home-Based Bakery & Cake Delivery")
- description: 2-3 sentence practical description
- monthlyIncome: Realistic range in Indian Rupees (e.g., "₹25,000 - ₹45,000")
- investment: Initial investment needed in INR (e.g., "₹15,000 - ₹30,000")
- demand: Market demand with percentage (e.g., "High (92% demand score)")
- competition: Low/Medium/High with brief context
- steps: Array of 6 actionable steps to launch (be specific, include Indian licenses/permits)
- tags: Array of 3 relevant tags (e.g., ["Food", "Home-Based", "Creative"])
- difficulty: "Easy" or "Medium" or "Hard" based on experience needed
- timeToProfit: Realistic timeline (e.g., "2-3 months")

**Important Guidelines:**
- Focus on businesses suitable for women entrepreneurs
- Include home-based options when possible
- Mention relevant Indian regulations (FSSAI, GST, etc.)
- Consider local market trends in ${formData.location}
- Prioritize low-risk, scalable ideas
- Include both online and offline options
- Be realistic with income projections

Return ONLY a valid JSON array of 3 business ideas. No markdown, no explanations.

Example format:
[
  {
    "title": "...",
    "description": "...",
    "monthlyIncome": "...",
    "investment": "...",
    "demand": "...",
    "competition": "...",
    "steps": ["Step 1...", "Step 2...", "Step 3...", "Step 4...", "Step 5...", "Step 6..."],
    "tags": ["...", "...", "..."],
    "difficulty": "Easy",
    "timeToProfit": "..."
  }
]`;

    // 1. Generate ideas using Gemini via Mesh API
    const rawResponse = await gemini.generateJSON<any>(prompt, {
      model: "google/gemini-3.5-flash",
    });

    let responseList: any[] = [];
    if (Array.isArray(rawResponse)) {
      responseList = rawResponse;
    } else if (rawResponse && typeof rawResponse === "object") {
      const candidate =
        rawResponse.ideas ||
        rawResponse.businessIdeas ||
        rawResponse.data ||
        Object.values(rawResponse).find((val) => Array.isArray(val));
      if (Array.isArray(candidate)) {
        responseList = candidate;
      }
    }

    if (!Array.isArray(responseList) || responseList.length === 0) {
      throw new Error("Invalid response format from AI");
    }

    // Add IDs and ensure proper typing with all 6 guided steps
    const ideas: IdeaResult[] = responseList.slice(0, 3).map((idea: any, index: number) => ({
      id: `${Date.now()}-${index}`,
      title: idea.title || "Untitled Business",
      description: idea.description || "No description available",
      monthlyIncome: idea.monthlyIncome || "₹20,000 - ₹40,000",
      investment: idea.investment || formData.investment || "₹10,000 - ₹25,000",
      demand: idea.demand || "High (88% demand score)",
      competition: idea.competition || "Medium",
      steps:
        Array.isArray(idea.steps) && idea.steps.length > 0
          ? idea.steps
          : getCuratedLaunchSteps(idea.title || formData.skill, formData.location),
      tags: Array.isArray(idea.tags) && idea.tags.length > 0 ? idea.tags : ["Women Led", "Home-Based"],
      difficulty:
        idea.difficulty === "Easy" ||
        idea.difficulty === "Medium" ||
        idea.difficulty === "Hard"
          ? idea.difficulty
          : "Medium",
      timeToProfit: idea.timeToProfit || "2-3 months",
    }));

    return { success: true, ideas, isFallback: false };
  } catch (error) {
    console.warn("AI Idea Generation encountered an issue. Using curated project fallback plans:", error);
    // Graceful fallback to verified curated blueprints with step-by-step guided launch roadmap
    const fallbackIdeas = getCuratedFallbackIdeas(formData);
    return {
      success: true,
      ideas: fallbackIdeas,
      isFallback: true,
    };
  }
}

/**
 * Verified step-by-step guided launch plans tailored to Indian entrepreneur realities
 */
function getCuratedFallbackIdeas(formData: FormData): IdeaResult[] {
  const loc = formData.location || "your local area";
  const skill = formData.skill || "Entrepreneurship";
  const skillLower = skill.toLowerCase();
  const investment = formData.investment || "₹10,000 - ₹25,000";

  // Category 1: Food, Baking & Catering
  if (
    skillLower.includes("cook") ||
    skillLower.includes("bak") ||
    skillLower.includes("food") ||
    skillLower.includes("catering")
  ) {
    return [
      {
        id: `fallback-food-1-${Date.now()}`,
        title: `Home-Based Bakery & Custom Cake Studio in ${loc}`,
        description: `Start a specialized custom cake and artisanal dessert brand taking orders for birthdays, anniversaries, and corporate celebrations.`,
        monthlyIncome: "₹25,000 - ₹50,000",
        investment: investment,
        demand: "Very High (93% demand score)",
        competition: "Medium",
        tags: ["Food", "Home-Based", "Creative"],
        difficulty: "Easy",
        timeToProfit: "2-3 months",
        steps: [
          "Step 1: Obtain basic FSSAI registration online via FoSCoS portal (₹100/year license).",
          "Step 2: Set up dedicated hygienic prep station with standard baking pans and food-grade packaging.",
          "Step 3: Curate signature menu of 5 high-demand items (tea cakes, custom fondant, brownies).",
          "Step 4: Launch WhatsApp Business catalog with UPI QR code payments and high-res photos.",
          "Step 5: Tie up with local delivery partners (Dunzo, Porter, or Swiggy Minis) for prompt drop-offs.",
          "Step 6: Distribute tasting boxes to nearby residential societies to gather initial 5-star reviews.",
        ],
      },
      {
        id: `fallback-food-2-${Date.now()}`,
        title: `Healthy Home Meal & Subscription Tiffin Service`,
        description: `Deliver nutritious, hygienic home-cooked regional meals to working professionals, students, and busy families in ${loc}.`,
        monthlyIncome: "₹30,000 - ₹65,000",
        investment: investment,
        demand: "Very High (96% demand score)",
        competition: "Medium",
        tags: ["Subscription", "Daily Revenue", "Healthy"],
        difficulty: "Medium",
        timeToProfit: "1-2 months",
        steps: [
          "Step 1: Complete FSSAI food hygiene checklist and register on the government portal.",
          "Step 2: Procure eco-friendly insulated tiffin boxes and standard cooking supplies in bulk.",
          "Step 3: Design rotating 4-week balanced menu with clear calorie and ingredient breakdowns.",
          "Step 4: Create pre-paid weekly/monthly subscription plans via UPI auto-pay or advance transfers.",
          "Step 5: Network with local co-working spaces, tech hubs, and student hostels in ${loc}.",
          "Step 6: Offer 'Free First Meal Trial' to onboard your first 15 loyal monthly subscribers.",
        ],
      },
      {
        id: `fallback-food-3-${Date.now()}`,
        title: `Traditional Handcrafted Pickles & Gourmet Spices`,
        description: `Produce and market authentic heritage pickles, chutneys, and roasted masala mixes using traditional family recipes.`,
        monthlyIncome: "₹20,000 - ₹45,000",
        investment: investment,
        demand: "High (89% demand score)",
        competition: "Low",
        tags: ["Shelf-Stable", "ONDC", "Packaged Goods"],
        difficulty: "Easy",
        timeToProfit: "2-4 months",
        steps: [
          "Step 1: Register business with MSME Udyam (free) and obtain basic FSSAI certification.",
          "Step 2: Standardize secret family recipes into exact batch ratios with shelf-life testing.",
          "Step 3: Source airtight glass jars and print branded waterproof labels via local printers.",
          "Step 4: Set up digital storefront on ONDC (Open Network for Digital Commerce) & SheCan store.",
          "Step 5: Distribute sampler packs at local weekend organic farmers markets and society fairs.",
          "Step 6: Expand distribution through neighborhood organic grocery stores on consignment.",
        ],
      },
    ];
  }

  // Category 2: Tailoring, Fashion, Handicrafts & Jewelry
  if (
    skillLower.includes("tailor") ||
    skillLower.includes("stitch") ||
    skillLower.includes("handicraft") ||
    skillLower.includes("decor") ||
    skillLower.includes("jewelry")
  ) {
    return [
      {
        id: `fallback-craft-1-${Date.now()}`,
        title: `Boutique Tailoring & Designer Ethnic Wear Studio in ${loc}`,
        description: `Offer personalized stitching, festive blouse designing, and custom ethnic alterations with doorstep fitting options.`,
        monthlyIncome: "₹22,000 - ₹48,000",
        investment: investment,
        demand: "High (88% demand score)",
        competition: "Low",
        tags: ["Fashion", "Skill-Based", "Custom Made"],
        difficulty: "Medium",
        timeToProfit: "1-2 months",
        steps: [
          "Step 1: Set up dedicated cutting table and professional sewing/overlock machines at home.",
          "Step 2: Register MSME Udyam certificate for women entrepreneur priority credit and subsidies.",
          "Step 3: Create digital design lookbook showcasing neck patterns, sleeve styles, and embroidery.",
          "Step 4: Offer doorstep measurement pickup and delivery service within a 5 km radius in ${loc}.",
          "Step 5: Network across local women's WhatsApp groups and kitty clubs with introductory offers.",
          "Step 6: Build repeat client loyalty by maintaining personal measurement cards and prompt delivery.",
        ],
      },
      {
        id: `fallback-craft-2-${Date.now()}`,
        title: `Handcrafted Eco-Friendly Home Decor & Festive Gifts`,
        description: `Design and sell sustainable handmade macrame, scented soy wax candles, and festive gift hampers online.`,
        monthlyIncome: "₹18,000 - ₹42,000",
        investment: investment,
        demand: "Very High (94% demand score)",
        competition: "Medium",
        tags: ["E-Commerce", "Eco-Friendly", "Handmade"],
        difficulty: "Easy",
        timeToProfit: "2-3 months",
        steps: [
          "Step 1: Source bulk natural materials (soy wax, cotton cords, terracotta pots) from wholesale traders.",
          "Step 2: Perfect prototype collection of 6 signature aesthetic products with premium unboxing feel.",
          "Step 3: Register store on ONDC, Instagram Shopping, and the SheCan digital storefront.",
          "Step 4: Create short-form making-of videos (Reels) highlighting the handcrafted artisan story.",
          "Step 5: Reach out to local corporate offices and event planners for festive bulk gift orders.",
          "Step 6: Partner with regional courier aggregators (Shiprocket) for nationwide pan-India shipping.",
        ],
      },
      {
        id: `fallback-craft-3-${Date.now()}`,
        title: `Artisanal Resin & Oxidized Jewelry E-Commerce`,
        description: `Create and sell lightweight designer jewelry combining modern botanical resin art with traditional Indian motifs.`,
        monthlyIncome: "₹20,000 - ₹45,000",
        investment: investment,
        demand: "High (91% demand score)",
        competition: "Medium",
        tags: ["Jewelry", "Online First", "High Margin"],
        difficulty: "Easy",
        timeToProfit: "1-3 months",
        steps: [
          "Step 1: Master UV resin casting, curing techniques, and jewelry assembly with safety gear.",
          "Step 2: Procure findings, chains, and floral elements in wholesale quantities from craft hubs.",
          "Step 3: Photograph pieces in natural light with model styling for high-converting social listings.",
          "Step 4: Launch WhatsApp direct ordering and list on platforms like Meesho and Etsy India.",
          "Step 5: Run micro-giveaways collaborating with local college student ambassadors in ${loc}.",
          "Step 6: Introduce seasonal limited-edition collections for festive and wedding seasons.",
        ],
      },
    ];
  }

  // Category 3: General / Versatile Services, Teaching & Digital
  return [
    {
      id: `fallback-gen-1-${Date.now()}`,
      title: `${skill} Training & Coaching Academy in ${loc}`,
      description: `Monetize your expertise by providing personalized 1-on-1 coaching, small batch weekend workshops, and practical guidance.`,
      monthlyIncome: "₹25,000 - ₹55,000",
      investment: investment,
      demand: "High (91% demand score)",
      competition: "Low",
      tags: ["Zero Inventory", "High Profit", "Service Based"],
      difficulty: "Easy",
      timeToProfit: "1 month",
      steps: [
        "Step 1: Structure a 4-week step-by-step curriculum with hands-on exercises and practical takeaways.",
        "Step 2: Set up Zoom/Google Meet classroom and digital payment link via UPI/Instamojo.",
        "Step 3: Create informative social posts sharing free actionable tips to establish credibility.",
        "Step 4: Host a free introductory masterclass on weekend to demonstrate your coaching methodology.",
        "Step 5: Convert attendees into paid batch cohorts with dedicated doubt-clearing WhatsApp support.",
        "Step 6: Gather video testimonials from early students to drive automated word-of-mouth enrollments.",
      ],
    },
    {
      id: `fallback-gen-2-${Date.now()}`,
      title: `Curated Online Reselling & Digital Boutique`,
      description: `Curate trending regional apparel, accessories, and lifestyle goods from direct manufacturers and resell with healthy markup.`,
      monthlyIncome: "₹20,000 - ₹45,000",
      investment: investment,
      demand: "Very High (93% demand score)",
      competition: "Medium",
      tags: ["Digital First", "Low Risk", "Flexible Hours"],
      difficulty: "Easy",
      timeToProfit: "1-2 months",
      steps: [
        "Step 1: Identify verified wholesale suppliers on B2B platforms (IndiaMART, GlowRoad) with drop-shipping.",
        "Step 2: Set up professional WhatsApp Business catalog and Instagram boutique storefront.",
        "Step 3: Curate weekly themed drops (e.g. 'Office Chic', 'Festive Edit') with clear pricing.",
        "Step 4: Leverage SheCan Store Builder to provide customers an easy card & UPI checkout experience.",
        "Step 5: Post interactive polls and outfit recommendations daily to boost buyer engagement.",
        "Step 6: Maintain prompt after-sales tracking updates and seamless exchange assistance to build trust.",
      ],
    },
    {
      id: `fallback-gen-3-${Date.now()}`,
      title: `Celebration & Intimate Event Styling Service in ${loc}`,
      description: `Organize birthday setups, baby showers, festive decor, and anniversary celebrations with aesthetic themes.`,
      monthlyIncome: "₹30,000 - ₹70,000",
      investment: investment,
      demand: "High (89% demand score)",
      competition: "Medium",
      tags: ["Event Planning", "Creative", "Weekend Business"],
      difficulty: "Medium",
      timeToProfit: "2-3 months",
      steps: [
        "Step 1: Build inventory of reusable backdrop frames, fairy lights, balloon arches, and props.",
        "Step 2: Partner with local florists, bakers, and photographers for bundled party packages.",
        "Step 3: Design tiered package cards (Silver, Gold, Bespoke Luxury) with clear deliverables.",
        "Step 4: Create a stunning visual portfolio by styling an initial mock event at home or for friends.",
        "Step 5: Distribute flyers and digital posters across nearby residential societies and daycare centers.",
        "Step 6: Take advance bookings with 50% deposit and collect glowing reviews after every celebration.",
      ],
    },
  ];
}

/**
 * Universal Indian small business launch steps
 */
function getCuratedLaunchSteps(title: string, location: string): string[] {
  return [
    `Step 1: Complete business registration and obtain MSME Udyam / FSSAI certificate for ${location}.`,
    `Step 2: Set up dedicated workspace with necessary equipment and source raw materials in bulk.`,
    `Step 3: Create branded WhatsApp Business catalog with UPI QR code and transparent pricing.`,
    `Step 4: Set up digital storefront on SheCan Store Builder and link social media channels.`,
    `Step 5: Launch introductory promotional campaign for local neighborhood and community groups.`,
    `Step 6: Collect customer reviews and feedback to optimize product quality and scale repeat orders.`,
  ];
}
