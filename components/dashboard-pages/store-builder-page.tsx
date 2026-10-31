"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Store,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Settings,
  Package,
  ShoppingCart,
  Eye,
  Copy,
  CheckCircle2,
  Sparkles,
  Globe,
  Palette,
  Image as ImageIcon,
  TrendingUp,
  Tag,
  CreditCard,
  Check,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/image-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { storeService, StoreData } from "@/lib/store-service";

const categories = [
  "Food & Beverages",
  "Handicrafts",
  "Beauty & Cosmetics",
  "Textiles & Clothing",
  "Home Decor",
  "Jewelry & Accessories",
  "Organic Products",
  "Baked Goods",
];

const themes = [
  { value: "natural", label: "Earthy & Natural", preview: "🌿" },
  { value: "elegant", label: "Elegant Classic", preview: "✨" },
  { value: "modern", label: "Modern Minimal", preview: "🎨" },
  { value: "colorful", label: "Vibrant & Bold", preview: "🌈" },
];

const sampleLogos = [
  "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=400&q=80",
  "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&q=80",
  "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80",
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80",
];

const sampleBanners = [
  "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1400&q=80",
  "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1400&q=80",
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1400&q=80",
];

export default function StoreBuilderPage() {
  const router = useRouter();
  const [stores, setStores] = React.useState<StoreData[]>([]);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [copiedSlug, setCopiedSlug] = React.useState<string | null>(null);

  const [newStore, setNewStore] = React.useState({
    name: "",
    tagline: "",
    description: "",
    category: "Food & Beverages",
    theme: "natural" as const,
    logo: "",
    banner: "",
    upiId: "",
  });

  // Load stores from StoreService
  React.useEffect(() => {
    setStores(storeService.getStores());
  }, []);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleCreateStore = () => {
    if (!newStore.name.trim()) {
      toast.error("Please enter a store name");
      return;
    }

    const slug = generateSlug(newStore.name);
    const created = storeService.saveStore({
      name: newStore.name.trim(),
      slug,
      tagline: newStore.tagline.trim() || "Handcrafted with love & authenticity",
      description:
        newStore.description.trim() ||
        "Welcome to our verified SheCan boutique store. Explore our curated collection.",
      category: newStore.category,
      theme: newStore.theme,
      logo: newStore.logo || sampleLogos[0],
      banner: newStore.banner || sampleBanners[0],
      announcement: "🎉 Welcome! Free shipping on orders above ₹499.",
      upiId: newStore.upiId.trim() || "merchant@upi",
      status: "active",
    });

    setStores(storeService.getStores());
    setIsCreateOpen(false);
    setNewStore({
      name: "",
      tagline: "",
      description: "",
      category: "Food & Beverages",
      theme: "natural",
      logo: "",
      banner: "",
      upiId: "",
    });

    toast.success(`Store "${created.name}" created successfully! 🚀`);
    router.push(`/store/${slug}/manage`);
  };

  const handleDeleteStore = (id: string, name: string) => {
    storeService.deleteStore(id);
    setStores(storeService.getStores());
    toast.success(`Store "${name}" deleted`);
  };

  const copyStoreLink = (slug: string) => {
    const link = `${window.location.origin}/store/${slug}`;
    navigator.clipboard.writeText(link);
    setCopiedSlug(slug);
    toast.success("Store link copied to clipboard! 📋");
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const totalProducts = stores.reduce(
    (acc, s) => acc + storeService.getProducts(s.slug).length,
    0
  );
  const totalSales = stores.reduce((acc, s) => acc + (s.sales || 0), 0);
  const totalRevenue = stores.reduce((acc, s) => acc + (s.revenue || 0), 0);

  return (
    <div className="space-y-8 relative pb-12">
      {/* Background Glow */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1.5s" }}
        />
      </div>

      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 p-6 md:p-8 rounded-2xl bg-gradient-to-r from-violet-600/10 via-purple-600/10 to-pink-600/10 border-2 border-violet-500/20 backdrop-blur-md shadow-sm"
      >
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-700 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            Shopify-Grade Store Builder • Cloudinary Powered
          </div>
          <h1 className="text-3xl font-heading font-bold flex items-center gap-3">
            <Store className="w-8 h-8 text-violet-600" />
            Your Online Stores
          </h1>
          <p className="text-muted-foreground text-base max-w-2xl">
            Launch your e-commerce storefront in minutes. Manage product inventories, upload high-res imagery to Cloudinary, track sales, and accept customer orders.
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button
              className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-xl shadow-violet-500/25 h-12 px-6 text-base font-semibold"
              size="lg"
            >
              <Plus className="h-5 w-5" />
              Create New Store
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-2 bg-background/95 backdrop-blur-2xl p-6 sm:p-8">
            <DialogHeader className="space-y-1">
              <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
                <Store className="h-6 w-6 text-violet-600" />
                Launch a New Store
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Set up your brand presence, upload Cloudinary assets, and configure your payment ID.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              {/* Store Name & Slug */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storeName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Store Name *
                  </Label>
                  <Input
                    id="storeName"
                    placeholder="e.g. Radhika Organic Honey"
                    value={newStore.name}
                    onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                    className="h-11 border-2 rounded-xl"
                  />
                  {newStore.name && (
                    <p className="text-xs text-violet-600 font-medium flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      Domain: <span className="font-mono">/store/{generateSlug(newStore.name)}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tagline" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tagline / Subheading
                  </Label>
                  <Input
                    id="tagline"
                    placeholder="e.g. 100% Raw Forest Honey from Nilgiris"
                    value={newStore.tagline}
                    onChange={(e) => setNewStore({ ...newStore, tagline: e.target.value })}
                    className="h-11 border-2 rounded-xl"
                  />
                </div>
              </div>

              {/* Category & Theme */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Primary Category
                  </Label>
                  <Select
                    value={newStore.category}
                    onValueChange={(val) => setNewStore({ ...newStore, category: val })}
                  >
                    <SelectTrigger className="h-11 border-2 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Store Theme Style
                  </Label>
                  <Select
                    value={newStore.theme}
                    onValueChange={(val: any) => setNewStore({ ...newStore, theme: val })}
                  >
                    <SelectTrigger className="h-11 border-2 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {themes.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.preview} {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="desc" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Store Story & About
                </Label>
                <Textarea
                  id="desc"
                  rows={3}
                  placeholder="Share the story behind your products, sourcing practices, and values..."
                  value={newStore.description}
                  onChange={(e) => setNewStore({ ...newStore, description: e.target.value })}
                  className="border-2 rounded-xl resize-none"
                />
              </div>

              {/* Cloudinary Media Upload Section */}
              <div className="p-4 rounded-xl border-2 border-violet-500/20 bg-violet-50/30 space-y-4">
                <h4 className="text-sm font-semibold flex items-center gap-2 text-violet-900">
                  <ImageIcon className="h-4 w-4 text-violet-600" />
                  Store Visuals (Cloudinary Hosted)
                </h4>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Store Logo */}
                  <div>
                    <ImageUpload
                      label="Store Logo / Profile"
                      value={newStore.logo}
                      onChange={(url) => setNewStore({ ...newStore, logo: url })}
                      onRemove={() => setNewStore({ ...newStore, logo: "" })}
                      aspectRatio="square"
                      folder="shecan/stores/logos"
                      presetOptions={sampleLogos}
                    />
                  </div>

                  {/* Store Banner */}
                  <div>
                    <ImageUpload
                      label="Store Hero Banner"
                      value={newStore.banner}
                      onChange={(url) => setNewStore({ ...newStore, banner: url })}
                      onRemove={() => setNewStore({ ...newStore, banner: "" })}
                      aspectRatio="banner"
                      folder="shecan/stores/banners"
                      presetOptions={sampleBanners}
                    />
                  </div>
                </div>
              </div>

              {/* UPI Payment Info */}
              <div className="space-y-2">
                <Label htmlFor="upi" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  UPI ID (For Customer Checkouts)
                </Label>
                <Input
                  id="upi"
                  placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                  value={newStore.upiId}
                  onChange={(e) => setNewStore({ ...newStore, upiId: e.target.value })}
                  className="h-11 border-2 rounded-xl"
                />
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleCreateStore}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-xl shadow-violet-500/25"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Launch Store Now
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Aggregate Metrics (Shopify Style) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Total Stores",
            value: stores.length,
            sub: "Active brand storefronts",
            icon: Store,
            color: "text-violet-600",
            bg: "bg-violet-100",
          },
          {
            title: "Total Products",
            value: totalProducts,
            sub: "In stock across stores",
            icon: Package,
            color: "text-blue-600",
            bg: "bg-blue-100",
          },
          {
            title: "Total Orders",
            value: totalSales,
            sub: "Orders received to date",
            icon: ShoppingCart,
            color: "text-emerald-600",
            bg: "bg-emerald-100",
          },
          {
            title: "Total Gross Revenue",
            value: `₹${totalRevenue.toLocaleString()}`,
            sub: "Direct merchant earnings",
            icon: TrendingUp,
            color: "text-amber-600",
            bg: "bg-amber-100",
          },
        ].map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
            >
              <Card className="border-2 hover:border-violet-500/40 hover:shadow-lg transition-all">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {metric.title}
                    </p>
                    <p className="text-2xl font-bold mt-1 text-foreground">{metric.value}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{metric.sub}</p>
                  </div>
                  <div className={`p-3 rounded-2xl ${metric.bg} ${metric.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Stores Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-heading font-bold text-foreground">
            Managed Storefronts ({stores.length})
          </h2>
          <Badge variant="outline" className="text-xs">
            Cloudinary CDN Enabled
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {stores.map((store, idx) => {
              const productCount = storeService.getProducts(store.slug).length;
              return (
                <motion.div
                  key={store.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.08 }}
                >
                  <Card className="border-2 hover:border-violet-500/50 hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col group bg-card">
                    {/* Store Hero Banner */}
                    <div className="relative h-36 w-full overflow-hidden bg-muted">
                      <Image
                        src={store.banner}
                        alt={`${store.name} banner`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized={store.banner.startsWith("data:")}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      
                      <Badge className="absolute top-3 right-3 bg-emerald-600 hover:bg-emerald-600 text-white font-medium text-xs">
                        {store.status === "active" ? "Live Storefront" : "Draft"}
                      </Badge>

                      <Badge variant="secondary" className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white border-none text-[11px]">
                        {store.category}
                      </Badge>
                    </div>

                    {/* Logo & Headline */}
                    <div className="px-5 pt-0 pb-2 relative flex-1 flex flex-col">
                      <div className="flex items-end justify-between -mt-10 mb-3">
                        <div className="relative h-18 w-18 rounded-2xl overflow-hidden border-3 border-background shadow-lg bg-card">
                          <Image
                            src={store.logo}
                            alt={store.name}
                            fill
                            className="object-cover"
                            unoptimized={store.logo.startsWith("data:")}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyStoreLink(store.slug)}
                          className="h-8 text-xs text-muted-foreground hover:text-violet-600 gap-1"
                        >
                          {copiedSlug === store.slug ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              Share Link
                            </>
                          )}
                        </Button>
                      </div>

                      <div className="space-y-1 mb-3">
                        <h3 className="text-lg font-heading font-bold text-foreground line-clamp-1 group-hover:text-violet-600 transition-colors">
                          {store.name}
                        </h3>
                        <p className="text-xs text-muted-foreground font-medium line-clamp-1">
                          {store.tagline}
                        </p>
                      </div>

                      <p className="text-xs text-muted-foreground/90 line-clamp-2 mb-4">
                        {store.description}
                      </p>

                      {/* Store Performance Metrics */}
                      <div className="grid grid-cols-3 gap-2 py-3 px-2 rounded-xl bg-muted/40 border border-border/60 text-center mb-4 mt-auto">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Products</p>
                          <p className="text-sm font-bold text-foreground">{productCount}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Orders</p>
                          <p className="text-sm font-bold text-foreground">{store.sales || 0}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Revenue</p>
                          <p className="text-sm font-bold text-emerald-600">
                            ₹{(store.revenue || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="gap-1.5 hover:border-violet-600 hover:text-violet-600"
                        >
                          <Link href={`/store/${store.slug}`} target="_blank">
                            <ExternalLink className="h-3.5 w-3.5" />
                            View Store
                          </Link>
                        </Button>

                        <Button
                          size="sm"
                          asChild
                          className="gap-1.5 bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-500/20"
                        >
                          <Link href={`/store/${store.slug}/manage`}>
                            <Settings className="h-3.5 w-3.5" />
                            Manage
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
