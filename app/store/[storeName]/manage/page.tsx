"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Save,
  Eye,
  Package,
  BarChart3,
  Settings,
  Sparkles,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Tag,
  DollarSign,
  TrendingUp,
  Image as ImageIcon,
  ExternalLink,
  Phone,
  CreditCard,
  Search,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ImageUpload } from "@/components/image-upload";
import {
  storeService,
  StoreData,
  ProductData,
  OrderData,
} from "@/lib/store-service";

const sampleProductPresets = [
  "https://images.unsplash.com/photo-1589135233689-d56d48259b32?w=600&q=80",
  "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&q=80",
  "https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=600&q=80",
  "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80",
  "https://images.unsplash.com/photo-1522758971460-1d21eed7dc1d?w=600&q=80",
  "https://images.unsplash.com/photo-1608248597359-009d169d2d0b?w=600&q=80",
];

export default function ManageStorePage() {
  const params = useParams();
  const router = useRouter();
  const slug = (Array.isArray(params?.storeName) ? params.storeName[0] : params?.storeName) || "";

  const [store, setStore] = React.useState<StoreData | null>(null);
  const [products, setProducts] = React.useState<ProductData[]>([]);
  const [orders, setOrders] = React.useState<OrderData[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Add / Edit Product Dialog State
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<ProductData | null>(null);

  const [productForm, setProductForm] = React.useState({
    name: "",
    price: "",
    originalPrice: "",
    stock: "25",
    category: "General",
    description: "",
    image: "",
  });

  // Settings State
  const [settingsForm, setSettingsForm] = React.useState({
    name: "",
    tagline: "",
    description: "",
    announcement: "",
    category: "",
    theme: "natural" as any,
    logo: "",
    banner: "",
    upiId: "",
    phone: "",
  });

  // Load Store, Products, and Orders
  const loadData = React.useCallback(() => {
    if (!slug) return;
    const currentStore = storeService.getStoreBySlug(slug);
    if (currentStore) {
      setStore(currentStore);
      setSettingsForm({
        name: currentStore.name,
        tagline: currentStore.tagline,
        description: currentStore.description,
        announcement: currentStore.announcement,
        category: currentStore.category,
        theme: currentStore.theme,
        logo: currentStore.logo,
        banner: currentStore.banner,
        upiId: currentStore.upiId,
        phone: currentStore.phone,
      });
    }
    setProducts(storeService.getProducts(slug));
    setOrders(storeService.getOrders(slug));
  }, [slug]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Product Form Actions
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      price: "",
      originalPrice: "",
      stock: "25",
      category: store?.category || "General",
      description: "",
      image: "",
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (prod: ProductData) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      price: prod.price.toString(),
      originalPrice: prod.originalPrice ? prod.originalPrice.toString() : "",
      stock: prod.stock.toString(),
      category: prod.category,
      description: prod.description,
      image: prod.image,
    });
    setIsAddOpen(true);
  };

  const handleSaveProduct = () => {
    if (!productForm.name.trim() || !productForm.price) {
      toast.error("Please provide product name and price");
      return;
    }

    const saved = storeService.saveProduct(slug, {
      id: editingProduct?.id,
      name: productForm.name.trim(),
      price: Number(productForm.price),
      originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : undefined,
      stock: Number(productForm.stock || 10),
      category: productForm.category.trim() || "General",
      description: productForm.description.trim(),
      image: productForm.image || sampleProductPresets[0],
    });

    setIsAddOpen(false);
    loadData();
    toast.success(
      editingProduct
        ? `Updated product: ${saved.name}`
        : `Added product: ${saved.name} with Cloudinary image! 📦`
    );
  };

  const handleDeleteProduct = (productId: string, name: string) => {
    storeService.deleteProduct(slug, productId);
    loadData();
    toast.success(`Removed product: ${name}`);
  };

  // Save Store Settings
  const handleSaveSettings = () => {
    if (!settingsForm.name.trim()) {
      toast.error("Store name is required");
      return;
    }

    storeService.saveStore({
      id: store?.id,
      slug,
      ...settingsForm,
    });

    loadData();
    toast.success("Store branding and settings updated successfully! ✨");
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = orders.reduce((acc, o) => acc + (o.total || 0), 0);
  const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  return (
    <div className="min-h-screen bg-background relative pb-16">
      {/* Background glow */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Top Navigation Bar */}
      <header className="border-b-2 bg-background/95 backdrop-blur-xl sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <Link href="/business-setup/store-builder">
                <ArrowLeft className="h-4 w-4" />
                All Stores
              </Link>
            </Button>

            <div className="flex items-center gap-3">
              {store?.logo && (
                <div className="relative h-10 w-10 rounded-xl overflow-hidden border shadow-sm shrink-0">
                  <Image
                    src={store.logo}
                    alt={store.name}
                    fill
                    className="object-cover"
                    unoptimized={store.logo.startsWith("data:")}
                  />
                </div>
              )}
              <div>
                <h1 className="text-xl font-heading font-bold text-foreground capitalize flex items-center gap-2">
                  {store?.name || slug.replace(/-/g, " ")}
                </h1>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="font-mono text-violet-600">/store/{slug}</span>
                  • {products.length} Products in catalog
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              asChild
              className="gap-1.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-md shadow-violet-500/20"
            >
              <Link href={`/store/${slug}`} target="_blank">
                <Eye className="h-4 w-4" />
                View Live Storefront
                <ExternalLink className="h-3 w-3 ml-0.5 opacity-70" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Admin Workspace */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md h-12 bg-muted/60 p-1 rounded-xl border">
            <TabsTrigger value="products" className="gap-2 font-medium">
              <Package className="h-4 w-4" />
              Products ({products.length})
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2 font-medium">
              <ShoppingBag className="h-4 w-4" />
              Orders & Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 font-medium">
              <Settings className="h-4 w-4" />
              Store Branding
            </TabsTrigger>
          </TabsList>

          {/* ================= PRODUCTS TAB ================= */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-pink-500/10 border-2 border-violet-500/20 backdrop-blur-sm">
              <div>
                <h2 className="text-2xl font-heading font-bold flex items-center gap-2">
                  <Package className="h-6 w-6 text-violet-600" />
                  Product Inventory
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Manage product variants, inventory quantities, and Cloudinary media assets.
                </p>
              </div>

              <Button
                onClick={handleOpenAdd}
                className="gap-2 bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/25 h-11"
              >
                <Plus className="h-4 w-4" />
                Add New Product
              </Button>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products by title or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 border-2 rounded-xl"
                />
              </div>
            </div>

            {/* Product Cards Grid */}
            {filteredProducts.length === 0 ? (
              <Card className="border-2 border-dashed p-12 text-center">
                <div className="h-12 w-12 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center mx-auto mb-3">
                  <Package className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground">No products found</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                  {searchQuery
                    ? "No products matched your search keyword."
                    : "Your store catalog is currently empty. Add your first item to start selling."}
                </p>
                <Button onClick={handleOpenAdd} className="mt-4 gap-2 bg-violet-600">
                  <Plus className="h-4 w-4" />
                  Add First Product
                </Button>
              </Card>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((prod) => (
                  <Card
                    key={prod.id}
                    className="border-2 hover:border-violet-500/40 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group bg-card"
                  >
                    {/* Cloudinary Product Photo */}
                    <div className="relative h-48 w-full bg-muted overflow-hidden">
                      <Image
                        src={prod.image}
                        alt={prod.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized={prod.image.startsWith("data:")}
                      />
                      <Badge className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md text-white border-none text-[10px]">
                        {prod.category}
                      </Badge>
                      {prod.originalPrice && prod.originalPrice > prod.price && (
                        <Badge className="absolute top-2.5 left-2.5 bg-red-600 text-white font-bold text-[10px]">
                          Save ₹{prod.originalPrice - prod.price}
                        </Badge>
                      )}
                    </div>

                    <CardContent className="p-4 flex-1 flex flex-col space-y-3">
                      <div>
                        <h3 className="font-bold text-base line-clamp-1 group-hover:text-violet-600 transition-colors">
                          {prod.name}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {prod.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t mt-auto">
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-lg font-bold text-foreground">₹{prod.price}</span>
                            {prod.originalPrice && (
                              <span className="text-xs text-muted-foreground line-through">
                                ₹{prod.originalPrice}
                              </span>
                            )}
                          </div>
                        </div>

                        <Badge
                          variant={prod.stock > 10 ? "default" : prod.stock > 0 ? "secondary" : "destructive"}
                          className={`text-xs ${prod.stock > 10 ? "bg-emerald-600" : ""}`}
                        >
                          {prod.stock > 0 ? `${prod.stock} in stock` : "Sold Out"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(prod)}
                          className="gap-1.5 hover:border-violet-600 hover:text-violet-600 h-9"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProduct(prod.id, prod.name)}
                          className="gap-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 h-9"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ================= ORDERS & ANALYTICS TAB ================= */}
          <TabsContent value="orders" className="space-y-6">
            {/* KPI Summary */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-2 p-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Gross Revenue
                </p>
                <p className="text-3xl font-bold mt-1 text-emerald-600">
                  ₹{totalRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Direct to your UPI / Account</p>
              </Card>

              <Card className="border-2 p-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Total Orders
                </p>
                <p className="text-3xl font-bold mt-1 text-foreground">{orders.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Processed from storefront</p>
              </Card>

              <Card className="border-2 p-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Avg Order Value (AOV)
                </p>
                <p className="text-3xl font-bold mt-1 text-violet-600">
                  ₹{avgOrderValue.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Per checkout basket</p>
              </Card>

              <Card className="border-2 p-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Storefront Views
                </p>
                <p className="text-3xl font-bold mt-1 text-foreground">{store?.views || 140}</p>
                <p className="text-xs text-muted-foreground mt-1">Customer impressions</p>
              </Card>
            </div>

            {/* Orders Table */}
            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-violet-600" />
                  Recent Customer Orders
                </CardTitle>
                <CardDescription>
                  Real-time orders placed by shoppers visiting your public SheCan link.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {orders.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    No orders placed yet. Share your store link on WhatsApp to get your first customer!
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/50 border-y text-xs uppercase text-muted-foreground font-semibold">
                        <tr>
                          <th className="px-6 py-3.5">Order ID</th>
                          <th className="px-6 py-3.5">Customer</th>
                          <th className="px-6 py-3.5">Items</th>
                          <th className="px-6 py-3.5">Total Amount</th>
                          <th className="px-6 py-3.5">Payment</th>
                          <th className="px-6 py-3.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {orders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-6 py-4 font-mono font-medium text-violet-600">
                              {ord.id}
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-semibold text-foreground">{ord.customerName}</p>
                              <p className="text-xs text-muted-foreground">{ord.customerPhone}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-xs font-medium">
                                {ord.items.map((i) => `${i.name} (x${i.quantity})`).join(", ")}
                              </p>
                            </td>
                            <td className="px-6 py-4 font-bold text-foreground">
                              ₹{ord.total}
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant="outline" className="text-xs gap-1 font-normal">
                                <CreditCard className="h-3 w-3" />
                                {ord.paymentMethod}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <Badge className="bg-emerald-600 text-white text-xs">
                                {ord.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ================= STORE BRANDING & SETTINGS TAB ================= */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="border-2 p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Settings className="h-5 w-5 text-violet-600" />
                    Branding & Storefront Settings
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Customize your shop visuals, announcement banner, and payment receiver details.
                  </p>
                </div>
                <Button onClick={handleSaveSettings} className="gap-2 bg-violet-600 hover:bg-violet-700">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>

              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Store Name</Label>
                  <Input
                    value={settingsForm.name}
                    onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                    className="h-11 border-2 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Tagline</Label>
                  <Input
                    value={settingsForm.tagline}
                    onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                    className="h-11 border-2 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">
                  Announcement Bar Notice
                </Label>
                <Input
                  value={settingsForm.announcement}
                  onChange={(e) => setSettingsForm({ ...settingsForm, announcement: e.target.value })}
                  placeholder="e.g. Free delivery on orders above ₹499! Use coupon SHECAN10"
                  className="h-11 border-2 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">Store Story & Bio</Label>
                <Textarea
                  rows={3}
                  value={settingsForm.description}
                  onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                  className="border-2 rounded-xl resize-none"
                />
              </div>

              {/* Cloudinary Visuals */}
              <div className="p-5 rounded-xl border-2 border-violet-500/20 bg-violet-50/20 space-y-4">
                <h4 className="text-sm font-bold text-violet-900 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-violet-600" />
                  Cloudinary Media Assets
                </h4>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <ImageUpload
                      label="Store Logo"
                      value={settingsForm.logo}
                      onChange={(url) => setSettingsForm({ ...settingsForm, logo: url })}
                      onRemove={() => setSettingsForm({ ...settingsForm, logo: "" })}
                      aspectRatio="square"
                      folder="shecan/stores/logos"
                    />
                  </div>
                  <div>
                    <ImageUpload
                      label="Store Hero Banner"
                      value={settingsForm.banner}
                      onChange={(url) => setSettingsForm({ ...settingsForm, banner: url })}
                      onRemove={() => setSettingsForm({ ...settingsForm, banner: "" })}
                      aspectRatio="banner"
                      folder="shecan/stores/banners"
                    />
                  </div>
                </div>
              </div>

              {/* Payment & Contact Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">
                    Merchant UPI ID (For Checkouts)
                  </Label>
                  <Input
                    value={settingsForm.upiId}
                    onChange={(e) => setSettingsForm({ ...settingsForm, upiId: e.target.value })}
                    placeholder="e.g. yourname@okhdfcbank"
                    className="h-11 border-2 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">
                    WhatsApp Business Contact
                  </Label>
                  <Input
                    value={settingsForm.phone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="h-11 border-2 rounded-xl"
                  />
                </div>
              </div>

              <Button
                onClick={handleSaveSettings}
                className="w-full h-12 text-base font-semibold bg-violet-600 hover:bg-violet-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Save All Changes
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Add / Edit Product Modal with Cloudinary Upload */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-2 bg-background/95 backdrop-blur-2xl p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Package className="h-6 w-6 text-violet-600" />
              {editingProduct ? "Edit Product Details" : "Add New Product to Store"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Provide product details, pricing, and upload product imagery directly to Cloudinary.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 mt-4">
            {/* Cloudinary Product Photo Upload */}
            <div className="p-4 rounded-xl border-2 border-violet-500/20 bg-violet-50/30">
              <ImageUpload
                label="Product Showcase Image (Cloudinary)"
                value={productForm.image}
                onChange={(url) => setProductForm({ ...productForm, image: url })}
                onRemove={() => setProductForm({ ...productForm, image: "" })}
                aspectRatio="square"
                folder="shecan/products"
                presetOptions={sampleProductPresets}
              />
            </div>

            {/* Name & Category */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">Product Title *</Label>
                <Input
                  placeholder="e.g. Roasted Garlic Pickle (350g)"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="h-11 border-2 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">Category</Label>
                <Input
                  placeholder="e.g. Pickles, Preserves, Decor"
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  className="h-11 border-2 rounded-xl"
                />
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">Price (₹) *</Label>
                <Input
                  type="number"
                  placeholder="190"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  className="h-11 border-2 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">
                  Original (₹) (Optional)
                </Label>
                <Input
                  type="number"
                  placeholder="230"
                  value={productForm.originalPrice}
                  onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                  className="h-11 border-2 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">Inventory Stock</Label>
                <Input
                  type="number"
                  placeholder="30"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                  className="h-11 border-2 rounded-xl"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Description & Ingredients</Label>
              <Textarea
                rows={3}
                placeholder="Describe flavors, materials, weights, and highlights..."
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                className="border-2 rounded-xl resize-none"
              />
            </div>

            {/* Submit */}
            <Button
              onClick={handleSaveProduct}
              className="w-full h-12 text-base font-semibold bg-violet-600 hover:bg-violet-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              {editingProduct ? "Update Product" : "Publish to Storefront"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
