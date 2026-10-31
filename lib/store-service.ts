/**
 * SheCan Store Service
 * Shopify-like multi-tenant store & product management engine
 * Integrated with Cloudinary media storage and persistent state
 */

export interface StoreData {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: string;
  theme: "modern" | "elegant" | "colorful" | "natural";
  logo: string;
  banner: string;
  announcement: string;
  upiId: string;
  phone: string;
  views: number;
  sales: number;
  revenue: number;
  status: "active" | "draft";
  createdAt: string;
}

export interface ProductData {
  id: string;
  storeSlug: string;
  name: string;
  price: number;
  originalPrice?: number;
  stock: number;
  category: string;
  description: string;
  image: string;
  inStock: boolean;
  rating: number;
  reviews: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface OrderData {
  id: string;
  storeSlug: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: "UPI" | "COD";
  status: "Processing" | "Shipped" | "Delivered";
  createdAt: string;
}

// Default Seed Stores with real photography
export const DEFAULT_STORES: StoreData[] = [
  {
    id: "store-1",
    name: "Priya's Traditional Pickles",
    slug: "priyas-pickles",
    tagline: "Farm-Fresh, Sun-Dried & Handcrafted with Ancestral Heritage",
    description:
      "Authentic homemade artisanal pickles and gourmet spice pastes, crafted using cold-pressed mustard oil, organic hand-picked spices, and traditional stone-grinding methods passed down three generations.",
    category: "Food & Beverages",
    theme: "natural",
    logo: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=400&q=80",
    banner: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1400&q=80",
    announcement: "🎉 Festive Offer: Use code SHECAN10 for 10% off + Free Shipping above ₹499!",
    upiId: "priya.pickles@okhdfcbank",
    phone: "+91 98765 43210",
    views: 1240,
    sales: 84,
    revenue: 16800,
    status: "active",
    createdAt: "2026-01-15",
  },
  {
    id: "store-2",
    name: "Anjali Handicrafts & Decor",
    slug: "anjali-handicrafts",
    tagline: "Sustainable Terracotta, Macramé & Festive Artisan Artifacts",
    description:
      "Handmade sustainable home decor items crafted with love by rural women artisans. Every purchase directly empowers traditional craftswomen across Maharashtra and Gujarat.",
    category: "Handicrafts",
    theme: "elegant",
    logo: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&q=80",
    banner: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1400&q=80",
    announcement: "✨ Handcrafted with care. Dispatched within 24 hours nationwide.",
    upiId: "anjali.crafts@okaxis",
    phone: "+91 98220 11223",
    views: 2150,
    sales: 112,
    revenue: 44800,
    status: "active",
    createdAt: "2026-02-01",
  },
  {
    id: "store-3",
    name: "Sara's Organic Glow",
    slug: "beauty-by-sara",
    tagline: "Pure Herbal Skincare Formulated with Cold-Pressed Botanicals",
    description:
      "100% natural, chemical-free skincare and hair elixirs. Dermatologically gentle ayurvedic formulations free from sulfates, parabens, and synthetic perfumes.",
    category: "Beauty & Cosmetics",
    theme: "modern",
    logo: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80",
    banner: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1400&q=80",
    announcement: "🌿 100% Organic & Cruelty-Free certified. Free gift with every purchase!",
    upiId: "sara.beauty@okicici",
    phone: "+91 97110 55443",
    views: 980,
    sales: 42,
    revenue: 21000,
    status: "active",
    createdAt: "2026-02-10",
  },
];

// Default Seed Products (with real high-resolution images instead of emojis)
export const DEFAULT_PRODUCTS: Record<string, ProductData[]> = {
  "priyas-pickles": [
    {
      id: "prod-101",
      storeSlug: "priyas-pickles",
      name: "Grandmother's Special Mango Pickle (Aam Ka Achar)",
      price: 180,
      originalPrice: 220,
      stock: 45,
      category: "Pickles",
      description: "Sun-ripened green mangoes marinated in cold-pressed mustard oil, fenugreek, and roasted spices.",
      image: "https://images.unsplash.com/photo-1589135233689-d56d48259b32?w=600&q=80",
      inStock: true,
      rating: 4.8,
      reviews: 42,
    },
    {
      id: "prod-102",
      storeSlug: "priyas-pickles",
      name: "Tangy Stuffed Red Chilli Pickle (Banarasi Mirch)",
      price: 210,
      originalPrice: 250,
      stock: 28,
      category: "Pickles",
      description: "Hand-stuffed plump red chillies packed with amchur, fennel, and aromatic spices.",
      image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&q=80",
      inStock: true,
      rating: 4.9,
      reviews: 36,
    },
    {
      id: "prod-103",
      storeSlug: "priyas-pickles",
      name: "Sweet & Sour Lemon Pickle (Khatta Meetha Nimbu)",
      price: 160,
      originalPrice: 190,
      stock: 35,
      category: "Pickles",
      description: "Oil-free digestive lemon preserve slow-aged under natural sunlight with jaggery and black salt.",
      image: "https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=600&q=80",
      inStock: true,
      rating: 4.6,
      reviews: 19,
    },
    {
      id: "prod-104",
      storeSlug: "priyas-pickles",
      name: "Crispy Garlic & Green Chilli Relish",
      price: 195,
      originalPrice: 230,
      stock: 18,
      category: "Chutneys & Pastes",
      description: "Pungent roasted garlic cloves cooked with fiery green chillies and curry leaves.",
      image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80",
      inStock: true,
      rating: 4.7,
      reviews: 24,
    },
  ],
  "anjali-handicrafts": [
    {
      id: "prod-201",
      storeSlug: "anjali-handicrafts",
      name: "Boho Macrame Wall Hanging Tapestry",
      price: 650,
      originalPrice: 850,
      stock: 15,
      category: "Wall Decor",
      description: "100% natural unbleached cotton macrame woven onto a rustic natural wooden dowel.",
      image: "https://images.unsplash.com/photo-1522758971460-1d21eed7dc1d?w=600&q=80",
      inStock: true,
      rating: 4.9,
      reviews: 58,
    },
    {
      id: "prod-202",
      storeSlug: "anjali-handicrafts",
      name: "Hand-Painted Terracotta Diya & Planter Set",
      price: 420,
      originalPrice: 500,
      stock: 22,
      category: "Home Accents",
      description: "Set of 4 artisan terracotta planters hand-painted with tribal Warli motifs.",
      image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&q=80",
      inStock: true,
      rating: 4.7,
      reviews: 31,
    },
  ],
  "beauty-by-sara": [
    {
      id: "prod-301",
      storeSlug: "beauty-by-sara",
      name: "Rosehip & Saffron Radiant Facial Elixir (30ml)",
      price: 580,
      originalPrice: 750,
      stock: 30,
      category: "Serums",
      description: "Pure cold-pressed rosehip seed oil infused with Kashmiri saffron threads for a natural golden glow.",
      image: "https://images.unsplash.com/photo-1608248597359-009d169d2d0b?w=600&q=80",
      inStock: true,
      rating: 4.9,
      reviews: 73,
    },
    {
      id: "prod-302",
      storeSlug: "beauty-by-sara",
      name: "Handmade Shea Butter & Almond Body Whip",
      price: 390,
      originalPrice: 480,
      stock: 25,
      category: "Moisturizers",
      description: "Decadent whipped body butter with sweet almond oil, vitamin E, and pure vanilla bean extract.",
      image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80",
      inStock: true,
      rating: 4.8,
      reviews: 44,
    },
  ],
};

const STORES_KEY = "shecan_stores_v2";
const PRODUCTS_KEY = "shecan_products_v2";
const ORDERS_KEY = "shecan_orders_v2";

export class StoreService {
  private isBrowser(): boolean {
    return typeof window !== "undefined";
  }

  // --- STORES ---
  getStores(): StoreData[] {
    if (!this.isBrowser()) return DEFAULT_STORES;
    try {
      const stored = localStorage.getItem(STORES_KEY);
      if (!stored) {
        localStorage.setItem(STORES_KEY, JSON.stringify(DEFAULT_STORES));
        return DEFAULT_STORES;
      }
      return JSON.parse(stored);
    } catch {
      return DEFAULT_STORES;
    }
  }

  getStoreBySlug(slug: string): StoreData | undefined {
    const stores = this.getStores();
    return stores.find((s) => s.slug === slug || s.id === slug);
  }

  saveStore(storeData: Partial<StoreData> & { name: string }): StoreData {
    const stores = this.getStores();
    const slug =
      storeData.slug ||
      storeData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const existingIndex = stores.findIndex((s) => s.slug === slug || s.id === storeData.id);

    const store: StoreData = {
      id: storeData.id || `store-${Date.now()}`,
      name: storeData.name,
      slug,
      tagline: storeData.tagline || "Artisan products crafted with passion",
      description: storeData.description || "Welcome to our handcrafted boutique store.",
      category: storeData.category || "General",
      theme: (storeData.theme as any) || "natural",
      logo: storeData.logo || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80",
      banner: storeData.banner || "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1400&q=80",
      announcement: storeData.announcement || "✨ Welcome to our online storefront! Fast delivery available.",
      upiId: storeData.upiId || "pay@upi",
      phone: storeData.phone || "+91 98000 00000",
      views: storeData.views ?? 0,
      sales: storeData.sales ?? 0,
      revenue: storeData.revenue ?? 0,
      status: storeData.status || "active",
      createdAt: storeData.createdAt || new Date().toISOString().split("T")[0],
    };

    if (existingIndex >= 0) {
      stores[existingIndex] = { ...stores[existingIndex], ...store };
    } else {
      stores.unshift(store);
    }

    if (this.isBrowser()) {
      localStorage.setItem(STORES_KEY, JSON.stringify(stores));
    }
    return store;
  }

  deleteStore(id: string): void {
    if (!this.isBrowser()) return;
    const stores = this.getStores().filter((s) => s.id !== id && s.slug !== id);
    localStorage.setItem(STORES_KEY, JSON.stringify(stores));
  }

  incrementViews(slug: string): void {
    if (!this.isBrowser()) return;
    const stores = this.getStores();
    const store = stores.find((s) => s.slug === slug);
    if (store) {
      store.views += 1;
      localStorage.setItem(STORES_KEY, JSON.stringify(stores));
    }
  }

  // --- PRODUCTS ---
  getProducts(storeSlug: string): ProductData[] {
    if (!this.isBrowser()) {
      return DEFAULT_PRODUCTS[storeSlug] || [];
    }
    try {
      const stored = localStorage.getItem(PRODUCTS_KEY);
      let allProducts: Record<string, ProductData[]> = DEFAULT_PRODUCTS;
      if (stored) {
        allProducts = { ...DEFAULT_PRODUCTS, ...JSON.parse(stored) };
      } else {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(DEFAULT_PRODUCTS));
      }
      return allProducts[storeSlug] || [];
    } catch {
      return DEFAULT_PRODUCTS[storeSlug] || [];
    }
  }

  saveProduct(storeSlug: string, product: Partial<ProductData> & { name: string; price: number }): ProductData {
    const products = this.getProducts(storeSlug);
    const id = product.id || `prod-${Date.now()}`;
    const newProduct: ProductData = {
      id,
      storeSlug,
      name: product.name,
      price: Number(product.price),
      originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
      stock: Number(product.stock ?? 10),
      category: product.category || "General",
      description: product.description || "",
      image:
        product.image ||
        "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80",
      inStock: (product.stock ?? 10) > 0,
      rating: product.rating ?? 4.8,
      reviews: product.reviews ?? 1,
    };

    const index = products.findIndex((p) => p.id === id);
    if (index >= 0) {
      products[index] = newProduct;
    } else {
      products.unshift(newProduct);
    }

    if (this.isBrowser()) {
      const stored = localStorage.getItem(PRODUCTS_KEY);
      const all = stored ? JSON.parse(stored) : { ...DEFAULT_PRODUCTS };
      all[storeSlug] = products;
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(all));
    }

    return newProduct;
  }

  deleteProduct(storeSlug: string, productId: string): void {
    if (!this.isBrowser()) return;
    const products = this.getProducts(storeSlug).filter((p) => p.id !== productId);
    const stored = localStorage.getItem(PRODUCTS_KEY);
    const all = stored ? JSON.parse(stored) : { ...DEFAULT_PRODUCTS };
    all[storeSlug] = products;
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(all));
  }

  // --- ORDERS ---
  getOrders(storeSlug: string): OrderData[] {
    if (!this.isBrowser()) return [];
    try {
      const stored = localStorage.getItem(ORDERS_KEY);
      const allOrders: Record<string, OrderData[]> = stored ? JSON.parse(stored) : {};
      return allOrders[storeSlug] || [
        {
          id: "ORD-9421",
          storeSlug,
          customerName: "Ritu Sharma",
          customerPhone: "+91 98112 34567",
          customerAddress: "402, Lotus Residency, Mumbai",
          items: [
            {
              productId: "prod-101",
              name: "Grandmother's Special Mango Pickle",
              quantity: 2,
              price: 180,
              image: "https://images.unsplash.com/photo-1589135233689-d56d48259b32?w=600&q=80",
            },
          ],
          subtotal: 360,
          discount: 36,
          total: 324,
          paymentMethod: "UPI",
          status: "Processing",
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
      ];
    } catch {
      return [];
    }
  }

  createOrder(
    storeSlug: string,
    order: {
      customerName: string;
      customerPhone: string;
      customerAddress: string;
      items: OrderItem[];
      subtotal: number;
      discount: number;
      total: number;
      paymentMethod: "UPI" | "COD";
    }
  ): OrderData {
    const orders = this.getOrders(storeSlug);
    const newOrder: OrderData = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      storeSlug,
      ...order,
      status: "Processing",
      createdAt: new Date().toISOString(),
    };

    orders.unshift(newOrder);

    if (this.isBrowser()) {
      const stored = localStorage.getItem(ORDERS_KEY);
      const all = stored ? JSON.parse(stored) : {};
      all[storeSlug] = orders;
      localStorage.setItem(ORDERS_KEY, JSON.stringify(all));

      // Update store sales metrics
      const stores = this.getStores();
      const store = stores.find((s) => s.slug === storeSlug);
      if (store) {
        store.sales += 1;
        store.revenue += order.total;
        localStorage.setItem(STORES_KEY, JSON.stringify(stores));
      }
    }

    return newOrder;
  }
}

export const storeService = new StoreService();
