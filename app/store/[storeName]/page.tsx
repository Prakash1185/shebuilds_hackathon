"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Store,
  ShoppingCart,
  Heart,
  Share2,
  Star,
  Package,
  Truck,
  Shield,
  ChevronLeft,
  CheckCircle2,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  Search,
  Tag,
  CreditCard,
  Phone,
  MapPin,
  X,
  ArrowRight,
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  storeService,
  StoreData,
  ProductData,
  OrderItem,
  OrderData,
} from "@/lib/store-service";

interface CartItem extends OrderItem {
  stock: number;
}

export default function SingleStorePage() {
  const params = useParams();
  const slug = (Array.isArray(params?.storeName) ? params.storeName[0] : params?.storeName) || "";

  const [store, setStore] = React.useState<StoreData | null>(null);
  const [products, setProducts] = React.useState<ProductData[]>([]);
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<string>("All");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Coupon State
  const [couponCode, setCouponCode] = React.useState("");
  const [discountPercent, setDiscountPercent] = React.useState(0);

  // Checkout State
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);
  const [isOrderSuccess, setIsOrderSuccess] = React.useState(false);
  const [completedOrder, setCompletedOrder] = React.useState<OrderData | null>(null);

  const [checkoutForm, setCheckoutForm] = React.useState({
    name: "",
    phone: "",
    address: "",
    paymentMethod: "UPI" as "UPI" | "COD",
  });

  // Load store and products
  React.useEffect(() => {
    if (!slug) return;
    const currentStore = storeService.getStoreBySlug(slug);
    if (currentStore) {
      setStore(currentStore);
      storeService.incrementViews(slug);
    }
    setProducts(storeService.getProducts(slug));
  }, [slug]);

  // Cart operations
  const addToCart = (product: ProductData) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.image,
          stock: product.stock,
        },
      ];
    });
    toast.success(`Added "${product.name}" to cart! 🛒`);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
    toast.info("Item removed from cart");
  };

  // Pricing calculations
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = Math.round((subtotal * discountPercent) / 100);
  const delivery = subtotal >= 499 || subtotal === 0 ? 0 : 40;
  const total = subtotal - discount + delivery;
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleApplyCoupon = () => {
    if (couponCode.trim().toUpperCase() === "SHECAN10") {
      setDiscountPercent(10);
      toast.success("Coupon SHECAN10 applied! 10% discount added 🎉");
    } else {
      toast.error("Invalid coupon code. Try 'SHECAN10'");
    }
  };

  const handlePlaceOrder = () => {
    if (!checkoutForm.name.trim() || !checkoutForm.phone.trim() || !checkoutForm.address.trim()) {
      toast.error("Please fill in your name, phone number, and address");
      return;
    }

    const order = storeService.createOrder(slug, {
      customerName: checkoutForm.name.trim(),
      customerPhone: checkoutForm.phone.trim(),
      customerAddress: checkoutForm.address.trim(),
      items: cart,
      subtotal,
      discount,
      total,
      paymentMethod: checkoutForm.paymentMethod,
    });

    setCompletedOrder(order);
    setCart([]);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setIsOrderSuccess(true);
    toast.success("Order placed successfully! 🛍️");
  };

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (!store && products.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <Store className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold">Store Not Found</h2>
        <p className="text-muted-foreground mt-1 mb-6">
          The requested store &quot;{slug}&quot; doesn&apos;t exist or is currently being setup.
        </p>
        <Button asChild>
          <Link href="/business-setup/store-builder">Back to Store Builder</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative pb-20">
      {/* Announcement Bar */}
      {store?.announcement && (
        <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white py-2 px-4 text-center text-xs sm:text-sm font-medium tracking-wide">
          {store.announcement}
        </div>
      )}

      {/* Main Navigation Header */}
      <header className="border-b bg-background/95 backdrop-blur-xl sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground -ml-2">
              <Link href="/business-setup/store-builder">
                <ChevronLeft className="h-4 w-4 mr-1" />
                SheCan
              </Link>
            </Button>

            <div className="flex items-center gap-2.5">
              {store?.logo && (
                <div className="relative h-9 w-9 rounded-xl overflow-hidden border shadow-sm">
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
                <h1 className="font-heading font-bold text-base sm:text-lg text-foreground leading-tight">
                  {store?.name || slug}
                </h1>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  Verified SheCan Founder
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: store?.name, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Store URL copied!");
                }
              }}
              className="gap-1.5 hidden sm:flex text-xs h-9"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </Button>

            {/* Cart Trigger Button */}
            <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
              <SheetTrigger asChild>
                <Button className="gap-2 bg-violet-600 hover:bg-violet-700 text-white relative h-9 px-3.5">
                  <ShoppingCart className="h-4 w-4" />
                  <span className="font-semibold text-xs sm:text-sm">Cart</span>
                  {totalItemsCount > 0 && (
                    <Badge className="bg-red-600 hover:bg-red-600 text-white text-[11px] h-5 w-5 p-0 flex items-center justify-center rounded-full ml-1">
                      {totalItemsCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>

              <SheetContent className="w-full sm:max-w-md flex flex-col p-6">
                <SheetHeader className="pb-4 border-b">
                  <SheetTitle className="flex items-center justify-between text-xl font-bold">
                    <span>Your Shopping Bag</span>
                    <Badge variant="secondary" className="font-normal text-xs">
                      {totalItemsCount} {totalItemsCount === 1 ? "item" : "items"}
                    </Badge>
                  </SheetTitle>
                  <SheetDescription className="text-xs">
                    Order directly from {store?.name}. Handcrafted with genuine ingredients.
                  </SheetDescription>
                </SheetHeader>

                {/* Cart Items List */}
                <div className="flex-1 overflow-y-auto py-4 space-y-4">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                      <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-3">
                        <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="font-semibold text-foreground">Your cart is empty</p>
                      <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                        Browse our catalog and add artisanal products to start your order.
                      </p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div
                        key={item.productId}
                        className="flex gap-3 p-3 rounded-xl border bg-muted/20 hover:bg-muted/30 transition-colors"
                      >
                        <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            unoptimized={item.image.startsWith("data:")}
                          />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-xs sm:text-sm line-clamp-1 text-foreground">
                              {item.name}
                            </h4>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.productId)}
                              className="text-muted-foreground hover:text-red-600 transition-colors shrink-0"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-bold text-sm text-foreground">
                              ₹{item.price * item.quantity}
                            </span>
                            <div className="flex items-center gap-1.5 border rounded-lg bg-background px-1.5 py-0.5">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.productId, -1)}
                                className="h-5 w-5 flex items-center justify-center text-muted-foreground hover:text-foreground"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="text-xs font-bold w-4 text-center">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.productId, 1)}
                                className="h-5 w-5 flex items-center justify-center text-muted-foreground hover:text-foreground"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Cart Footer */}
                {cart.length > 0 && (
                  <div className="pt-4 border-t space-y-4">
                    {/* Coupon Input */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Discount code (e.g. SHECAN10)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="h-9 text-xs uppercase"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleApplyCoupon}
                        className="h-9 text-xs"
                      >
                        Apply
                      </Button>
                    </div>

                    {/* Breakdown */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal</span>
                        <span>₹{subtotal}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-emerald-600 font-medium">
                          <span>Discount (SHECAN10)</span>
                          <span>-₹{discount}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-muted-foreground">
                        <span>Delivery</span>
                        <span>{delivery === 0 ? "FREE" : `₹${delivery}`}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-foreground pt-2 border-t">
                        <span>Total Payable</span>
                        <span>₹{total}</span>
                      </div>
                    </div>

                    {/* Checkout Button */}
                    <Button
                      onClick={() => {
                        setIsCheckoutOpen(true);
                      }}
                      className="w-full h-11 text-sm font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/25"
                    >
                      Proceed to Checkout (₹{total})
                      <ArrowRight className="h-4 w-4 ml-1.5" />
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Hero Storefront Banner */}
      <section className="relative w-full">
        <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-muted">
          {store?.banner && (
            <Image
              src={store.banner}
              alt={store.name}
              fill
              priority
              className="object-cover"
              unoptimized={store.banner.startsWith("data:")}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

          {/* Banner Details */}
          <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8 max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4 text-white">
            <div className="flex items-center gap-4 sm:gap-6">
              {store?.logo && (
                <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl overflow-hidden border-4 border-white/90 shadow-2xl shrink-0 bg-card">
                  <Image
                    src={store.logo}
                    alt={store.name}
                    fill
                    className="object-cover"
                    unoptimized={store.logo.startsWith("data:")}
                  />
                </div>
              )}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-4xl font-heading font-extrabold tracking-tight">
                    {store?.name}
                  </h1>
                  <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-xs border-none">
                    Verified Seller
                  </Badge>
                </div>
                <p className="text-sm sm:text-base text-gray-200 font-medium">
                  {store?.tagline}
                </p>
                <p className="text-xs text-gray-300 max-w-2xl line-clamp-2">
                  {store?.description}
                </p>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="hidden lg:flex items-center gap-4 text-xs text-gray-200">
              <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                <Truck className="h-4 w-4 text-violet-400" />
                <span>Fast Nationwide Shipping</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                <Shield className="h-4 w-4 text-emerald-400" />
                <span>Safe UPI & COD</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Section */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Search & Category Pills */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-2 border-b">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all shrink-0 ${
                  selectedCategory === cat
                    ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs rounded-full border"
            />
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border-2 hover:border-violet-500/40 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group h-full bg-card">
                {/* Cloudinary Image */}
                <div className="relative h-56 w-full bg-muted overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized={product.image.startsWith("data:")}
                  />
                  <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 items-end">
                    <Badge className="bg-black/60 backdrop-blur-md text-white border-none text-[10px]">
                      {product.category}
                    </Badge>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <Badge className="bg-red-600 text-white text-[10px] font-bold">
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                      </Badge>
                    )}
                  </div>
                </div>

                <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-1 text-amber-500 text-xs mb-1">
                      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                      <span className="font-bold">{product.rating}</span>
                      <span className="text-muted-foreground text-[11px]">({product.reviews})</span>
                    </div>

                    <h3 className="font-bold text-sm sm:text-base text-foreground line-clamp-1 group-hover:text-violet-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {product.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-bold text-foreground">₹{product.price}</span>
                        {product.originalPrice && (
                          <span className="text-xs text-muted-foreground line-through">
                            ₹{product.originalPrice}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-emerald-600 font-medium">In Stock</p>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => addToCart(product)}
                      className="bg-violet-600 hover:bg-violet-700 text-white h-9 px-3.5 text-xs font-semibold gap-1.5 shadow-md shadow-violet-500/20"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add to Bag
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Checkout Modal */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="max-w-lg border-2 bg-background/95 backdrop-blur-2xl p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <ShoppingBag className="h-6 w-6 text-violet-600" />
              Complete Your Order
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Direct checkout with {store?.name}. You will pay ₹{total} via your chosen method.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Full Name *</Label>
              <Input
                placeholder="e.g. Radhika Verma"
                value={checkoutForm.name}
                onChange={(e) => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                className="h-10 border rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Mobile Phone / WhatsApp *</Label>
              <Input
                placeholder="e.g. +91 98765 43210"
                value={checkoutForm.phone}
                onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                className="h-10 border rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Delivery Address *</Label>
              <Textarea
                rows={2}
                placeholder="Flat / House No., Society / Street, City, Pincode"
                value={checkoutForm.address}
                onChange={(e) => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                className="border rounded-xl resize-none text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Payment Method</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCheckoutForm({ ...checkoutForm, paymentMethod: "UPI" })}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    checkoutForm.paymentMethod === "UPI"
                      ? "border-violet-600 bg-violet-50/50"
                      : "border-border hover:border-muted-foreground/40"
                  }`}
                >
                  <p className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <CreditCard className="h-4 w-4 text-violet-600" />
                    Instant UPI
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    GPay, PhonePe, Paytm QR
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setCheckoutForm({ ...checkoutForm, paymentMethod: "COD" })}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    checkoutForm.paymentMethod === "COD"
                      ? "border-violet-600 bg-violet-50/50"
                      : "border-border hover:border-muted-foreground/40"
                  }`}
                >
                  <p className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-emerald-600" />
                    Cash on Delivery
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Pay on parcel arrival</p>
                </button>
              </div>
            </div>

            {/* Merchant UPI display */}
            {checkoutForm.paymentMethod === "UPI" && store?.upiId && (
              <div className="p-3 rounded-xl bg-violet-50 border border-violet-200 text-xs text-violet-900">
                <p className="font-semibold">Merchant UPI ID:</p>
                <p className="font-mono text-sm font-bold text-violet-700 select-all mt-0.5">
                  {store.upiId}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  You can scan/transfer directly after placing the order.
                </p>
              </div>
            )}

            <Button
              onClick={handlePlaceOrder}
              className="w-full h-11 text-sm font-bold bg-violet-600 hover:bg-violet-700 text-white mt-2 shadow-lg shadow-violet-500/25"
            >
              Confirm Order (₹{total})
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Success Confirmation Dialog */}
      <Dialog open={isOrderSuccess} onOpenChange={setIsOrderSuccess}>
        <DialogContent className="max-w-md border-2 bg-background p-6 text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <DialogTitle className="text-2xl font-bold text-foreground">
              Order Confirmed! 🎉
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Thank you for supporting a women-led business!
            </DialogDescription>
          </div>

          {completedOrder && (
            <div className="p-4 rounded-xl bg-muted/40 border text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID:</span>
                <span className="font-mono font-bold text-violet-600">{completedOrder.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Items:</span>
                <span className="font-semibold">{completedOrder.items.length} items</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Paid:</span>
                <span className="font-bold text-foreground">₹{completedOrder.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="font-semibold">{completedOrder.paymentMethod}</span>
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            The founder will dispatch your parcel shortly and text tracking details to your phone.
          </p>

          <Button
            onClick={() => setIsOrderSuccess(false)}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white"
          >
            Continue Shopping
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
