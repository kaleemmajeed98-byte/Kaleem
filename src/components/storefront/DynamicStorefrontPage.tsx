import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Flame,
  Plus,
  Minus,
  Trash2,
  Clock,
  Sparkles,
  ShoppingBag,
  Bike,
  Store,
  ChevronRight,
  ShieldCheck,
  MapPin,
  Phone,
  Check,
  X,
  AlertCircle,
  ArrowLeft,
  Share2,
  ChefHat,
  Receipt,
} from 'lucide-react';

interface PublicBranch {
  id: string;
  name: string;
  code: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  deliveryRadiusKm: number;
  minOrderAmount: number;
  standardDeliveryFee: number;
  openingTime: string;
  closingTime: string;
}

interface PublicCategory {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
}

interface PublicMenuItem {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  description: string;
  basePrice: number;
  station: string;
  isAvailable: boolean;
  preparationMinutes: number;
  spiciness?: string;
  variants?: { name: string; price: number }[];
}

interface PublicTenant {
  id: string;
  name: string;
  slug: string;
  legalBusinessName: string;
  currency: string;
  logoInitial: string;
  primaryColor: string;
  primaryContactPhone: string;
  primaryContactEmail?: string;
}

interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  station: string;
  variant?: string;
  notes?: string;
}

interface LiveOrderState {
  orderNumber: string;
  kdsStatus: string;
  channel: string;
  orderType: string;
  customerName: string;
  grandTotal: number;
  items: any[];
  createdAt: string;
}

interface DynamicStorefrontPageProps {
  slug: string;
  onBackToAdmin?: () => void;
}

export const DynamicStorefrontPage: React.FC<DynamicStorefrontPageProps> = ({
  slug,
  onBackToAdmin,
}) => {
  const [tenant, setTenant] = useState<PublicTenant | null>(null);
  const [branches, setBranches] = useState<PublicBranch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<PublicBranch | null>(null);
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [menuItems, setMenuItems] = useState<PublicMenuItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Cart & UI State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customizingItem, setCustomizingItem] = useState<PublicMenuItem | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [customNotes, setCustomNotes] = useState<string>('');
  const [customQuantity, setCustomQuantity] = useState<number>(1);

  // Checkout Form State
  const [orderType, setOrderType] = useState<'delivery' | 'takeaway'>('delivery');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'jazzcash' | 'easypaisa'>('cash');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Live Order Tracking State
  const [activeOrder, setActiveOrder] = useState<LiveOrderState | null>(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState<boolean>(false);

  // Fetch Storefront Data
  useEffect(() => {
    let isMounted = true;
    const fetchStore = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/v1/tenants/public/${slug}`);
        const result = await res.json();
        if (!isMounted) return;

        if (result.success && result.data) {
          setTenant(result.data.tenant);
          setBranches(result.data.branches || []);
          if (result.data.branches?.length > 0) {
            setSelectedBranch(result.data.branches[0]);
          }
          setCategories(result.data.categories || []);
          setMenuItems(result.data.menuItems || []);
        } else {
          setError(result.error?.message || `Store "${slug}" not found.`);
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Failed to load store.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchStore();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Live Tracking Poller
  useEffect(() => {
    if (!activeOrder?.orderNumber || !isTrackingModalOpen) return;

    const pollTracker = async () => {
      try {
        const res = await fetch(`/api/v1/orders/public/track/${activeOrder.orderNumber}`);
        const result = await res.json();
        if (result.success && result.data) {
          setActiveOrder((prev) => (prev ? { ...prev, ...result.data } : null));
        }
      } catch {}
    };

    const interval = setInterval(pollTracker, 3000);
    return () => clearInterval(interval);
  }, [activeOrder?.orderNumber, isTrackingModalOpen]);

  // Cart Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [cart]);

  const deliveryFee = orderType === 'delivery' ? (selectedBranch?.standardDeliveryFee || 100) : 0;
  const taxAmount = Math.round(subtotal * 0.13); // 13% GST Sindh SRB
  const grandTotal = subtotal + taxAmount + deliveryFee;
  const totalItemCount = cart.reduce((sum, it) => sum + it.quantity, 0);

  // Filter items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.categoryId === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  // Handle Customizer Open
  const handleOpenCustomizer = (item: PublicMenuItem) => {
    setCustomizingItem(item);
    setSelectedVariant(item.variants?.length ? item.variants[0].name : '');
    setCustomNotes('');
    setCustomQuantity(1);
  };

  // Add Item to Cart
  const handleAddToCart = () => {
    if (!customizingItem) return;

    let unitPrice = customizingItem.basePrice;
    if (selectedVariant && customizingItem.variants?.length) {
      const v = customizingItem.variants.find((x) => x.name === selectedVariant);
      if (v) unitPrice = v.price;
    }

    const newItem: CartItem = {
      id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      menuItemId: customizingItem.id,
      name: customizingItem.name,
      quantity: customQuantity,
      unitPrice,
      totalPrice: unitPrice * customQuantity,
      station: customizingItem.station,
      variant: selectedVariant || undefined,
      notes: customNotes || undefined,
    };

    setCart((prev) => [...prev, newItem]);
    setCustomizingItem(null);
  };

  const updateQuantity = (cartId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((it) => {
          if (it.id === cartId) {
            const nextQty = it.quantity + delta;
            return {
              ...it,
              quantity: nextQty,
              totalPrice: it.unitPrice * nextQty,
            };
          }
          return it;
        })
        .filter((it) => it.quantity > 0)
    );
  };

  // Submit Order
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);

    if (!customerName.trim() || !customerPhone.trim()) {
      setCheckoutError('Please provide your name and phone number.');
      return;
    }

    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      setCheckoutError('Please provide a delivery address.');
      return;
    }

    if (!selectedBranch || !tenant) {
      setCheckoutError('Store branch not selected.');
      return;
    }

    setIsSubmittingOrder(true);
    try {
      const res = await fetch('/api/v1/orders/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: tenant.id,
          branchId: selectedBranch.id,
          customerName,
          customerPhone,
          deliveryAddress: orderType === 'delivery' ? deliveryAddress : 'Takeaway Pickup',
          orderType,
          paymentMethod,
          items: cart.map((it) => ({
            menuItemId: it.menuItemId,
            name: it.name,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            station: it.station,
            variant: it.variant,
            notes: it.notes,
          })),
        }),
      });

      const result = await res.json();
      if (result.success && result.data) {
        setActiveOrder({
          orderNumber: result.data.orderNumber,
          kdsStatus: result.data.kdsStatus || 'new',
          channel: result.data.channel,
          orderType: result.data.orderType,
          customerName: result.data.customerName,
          grandTotal: result.data.grandTotal,
          items: result.data.items,
          createdAt: result.data.createdAt,
        });
        setCart([]);
        setIsCartOpen(false);
        setIsTrackingModalOpen(true);
      } else {
        setCheckoutError(result.error?.message || 'Failed to place order.');
      }
    } catch (err: any) {
      setCheckoutError(err.message || 'Error connecting to server.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-stone-400">Loading storefront for <strong className="text-white">/{slug}</strong>...</p>
        </div>
      </div>
    );
  }

  // Error / Not Found State
  if (error || !tenant) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2 max-w-md">
          <h1 className="text-2xl font-bold font-serif text-white">Store Not Found</h1>
          <p className="text-sm text-stone-400">{error || `No active restaurant registered under "${slug}".`}</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {onBackToAdmin && (
            <button
              onClick={onBackToAdmin}
              className="py-2.5 px-5 bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800 rounded-xl text-xs font-semibold transition-colors"
            >
              Back to Super Admin
            </button>
          )}
          <a
            href="/store/kababjees"
            className="py-2.5 px-5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold rounded-xl text-xs transition-colors"
          >
            Visit Kababjees Storefront
          </a>
          <a
            href="/store/mehmaan"
            className="py-2.5 px-5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs transition-colors"
          >
            Visit Mehmaan Storefront
          </a>
        </div>
      </div>
    );
  }

  const primaryColor = tenant.primaryColor || '#10b981';

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Top Banner Ribbon */}
      <div className="bg-stone-900 border-b border-stone-800 py-2 px-4 text-xs text-stone-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white">{tenant.name} Direct Storefront</span>
            <span className="hidden sm:inline text-stone-500">·</span>
            <span className="hidden sm:inline text-stone-400">Official Online Ordering Portal</span>
          </div>

          <div className="flex items-center gap-3">
            {onBackToAdmin && (
              <button
                onClick={onBackToAdmin}
                className="text-stone-400 hover:text-emerald-400 transition-colors font-medium text-[11px] flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Console / Switch View</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Storefront Header */}
      <header className="sticky top-0 z-30 bg-stone-950/90 backdrop-blur-md border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold font-serif text-xl shadow-lg border border-white/10"
              style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
            >
              {tenant.logoInitial || tenant.name.charAt(0)}
            </div>
            <div>
              <h1 className="font-serif font-bold text-base sm:text-lg text-white leading-tight">
                {tenant.name}
              </h1>
              {selectedBranch && (
                <div className="flex items-center gap-1.5 text-xs text-stone-400">
                  <MapPin className="w-3 h-3 text-stone-500 shrink-0" />
                  <span className="truncate max-w-[200px] sm:max-w-xs">{selectedBranch.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Branch Picker (if multiple) & Cart Trigger */}
          <div className="flex items-center gap-3">
            {branches.length > 1 && (
              <select
                value={selectedBranch?.id || ''}
                onChange={(e) => {
                  const b = branches.find((x) => x.id === e.target.value);
                  if (b) setSelectedBranch(b);
                }}
                className="bg-stone-900 border border-stone-800 text-stone-300 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-emerald-500 cursor-pointer hidden md:block"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    📍 {b.name} ({b.city})
                  </option>
                ))}
              </select>
            )}

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative py-2 px-4 rounded-xl font-bold text-xs flex items-center gap-2 transition-transform active:scale-95 shadow-lg text-stone-950"
              style={{ backgroundColor: primaryColor }}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Cart</span>
              {totalItemCount > 0 && (
                <span className="bg-stone-950 text-white text-[11px] px-1.5 py-0.5 rounded-full font-bold ml-0.5">
                  {totalItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Welcome Banner */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden border border-stone-800 bg-stone-900/60 p-6 sm:p-10 relative">
          <div className="max-w-2xl space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Direct Kitchen Ordering · Fresh & Fast</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight">
              Savor Royal Authentic Flavors at <span style={{ color: primaryColor }}>{tenant.name}</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
              Order fresh Karahi in pure butter, charcoal-grilled BBQ skewers, and fragrant Dum Biryani directly from our master chefs. Direct kitchen dispatch with live cooking updates.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-stone-300">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Avg 25-35 Mins</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Bike className="w-4 h-4 text-emerald-400" />
                <span>Rs. {selectedBranch?.standardDeliveryFee || 100} Delivery</span>
              </div>
              {selectedBranch?.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>{selectedBranch.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Category Tabs & Search Bar */}
      <section className="sticky top-[69px] z-20 bg-stone-950/95 backdrop-blur-md border-b border-stone-800 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`py-2 px-4 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-white text-stone-950 shadow-md font-bold'
                  : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
              }`}
            >
              All Items ({menuItems.length})
            </button>
            {categories.map((c) => {
              const count = menuItems.filter((i) => i.categoryId === c.id).length;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`py-2 px-4 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === c.id
                      ? 'bg-white text-stone-950 shadow-md font-bold'
                      : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
                  }`}
                >
                  {c.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes or ingredients..."
              className="w-full pl-10 pr-4 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </section>

      {/* Menu Item Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {filteredItems.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <ChefHat className="w-12 h-12 text-stone-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No dishes found</h3>
            <p className="text-xs text-stone-400">Try adjusting your search query or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-2xl p-5 bg-gradient-to-b from-stone-900/80 to-stone-950 border border-white/[0.07] hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-300 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                          {item.categoryName}
                        </span>
                        <span className="text-stone-700">·</span>
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-white/5 text-stone-400">
                          {item.station?.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <h3 className="font-serif font-bold text-base sm:text-lg text-white group-hover:text-emerald-300 transition-colors">
                        {item.name}
                      </h3>
                    </div>

                    {item.spiciness && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0 flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        <span>{item.spiciness}</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed font-light">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-stone-500 uppercase tracking-wider block">From</span>
                    <span className="text-base sm:text-lg font-bold text-emerald-400 font-mono tracking-tight">
                      Rs. {item.basePrice.toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenCustomizer(item)}
                    className="py-2 px-4 rounded-xl bg-white/10 hover:bg-emerald-400 hover:text-stone-950 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 border border-white/5 hover:border-emerald-400"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Add to Order</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* CUSTOMIZE ITEM MODAL */}
      {customizingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setCustomizingItem(null)}
            className="absolute inset-0 bg-stone-950/85 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden z-10 text-stone-100 flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400">{customizingItem.categoryName}</span>
                <h3 className="font-serif text-lg font-bold text-white">{customizingItem.name}</h3>
              </div>
              <button
                onClick={() => setCustomizingItem(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
              <p className="text-stone-300 leading-relaxed">{customizingItem.description}</p>

              {/* Variants Selector */}
              {customizingItem.variants && customizingItem.variants.length > 0 && (
                <div className="space-y-2">
                  <span className="font-semibold text-stone-300 block">Select Portion / Serving:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {customizingItem.variants.map((v) => (
                      <button
                        key={v.name}
                        type="button"
                        onClick={() => setSelectedVariant(v.name)}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-colors ${
                          selectedVariant === v.name
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
                            : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700'
                        }`}
                      >
                        <span className="font-semibold text-xs">{v.name}</span>
                        <span className="font-mono text-emerald-400 font-bold mt-1">Rs. {v.price}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Instructions */}
              <div className="space-y-1.5">
                <span className="font-semibold text-stone-300 block">Special Cooking Notes:</span>
                <input
                  type="text"
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="e.g. Less oil, extra ginger, spicy..."
                  className="w-full px-3.5 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center justify-between pt-2">
                <span className="font-semibold text-stone-300">Quantity</span>
                <div className="flex items-center gap-3 bg-stone-950 border border-stone-800 rounded-xl p-1">
                  <button
                    onClick={() => setCustomQuantity(Math.max(1, customQuantity - 1))}
                    className="p-1 rounded-lg hover:bg-stone-800 text-stone-300"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-sm px-2 font-mono">{customQuantity}</span>
                  <button
                    onClick={() => setCustomQuantity(customQuantity + 1)}
                    className="p-1 rounded-lg hover:bg-stone-800 text-stone-300"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-stone-800 bg-stone-950 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-stone-400 block">Item Total</span>
                <span className="text-base font-bold text-emerald-400 font-mono">
                  Rs.{' '}
                  {(
                    (selectedVariant && customizingItem.variants?.length
                      ? customizingItem.variants.find((x) => x.name === selectedVariant)?.price ||
                        customizingItem.basePrice
                      : customizingItem.basePrice) * customQuantity
                  ).toLocaleString()}
                </span>
              </div>

              <button
                onClick={handleAddToCart}
                className="py-2.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs transition-colors cursor-pointer"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHOPPING CART & CHECKOUT DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-md bg-stone-900 border-l border-stone-800 shadow-2xl flex flex-col h-full z-10 text-stone-100">
            {/* Cart Header */}
            <div className="p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">Your Order</h3>
                <span className="text-xs text-stone-400 font-mono">({totalItemCount} items)</span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
              {cart.length === 0 ? (
                <div className="py-16 text-center space-y-2 text-stone-500">
                  <ShoppingBag className="w-10 h-10 mx-auto stroke-1" />
                  <p>Your cart is empty.</p>
                  <p className="text-[11px] text-stone-600">Select dishes from the menu to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1 flex-1">
                        <span className="font-bold text-white block">{item.name}</span>
                        {item.variant && (
                          <span className="text-[11px] text-stone-400 block font-medium">
                            Portion: {item.variant}
                          </span>
                        )}
                        {item.notes && (
                          <span className="text-[11px] text-amber-400/80 block italic">
                            Note: {item.notes}
                          </span>
                        )}
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          Rs. {item.totalPrice.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-stone-900 border border-stone-800 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 text-stone-400 hover:text-white"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 font-bold font-mono text-xs text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 text-stone-400 hover:text-white"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button
                          onClick={() => updateQuantity(item.id, -item.quantity)}
                          className="p-1.5 text-stone-500 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Checkout Form */}
              {cart.length > 0 && (
                <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-4 pt-4 border-t border-stone-800">
                  <span className="font-bold text-stone-300 block text-xs uppercase tracking-wider">
                    Customer & Delivery Information
                  </span>

                  {checkoutError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{checkoutError}</span>
                    </div>
                  )}

                  {/* Order Type Toggle */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOrderType('delivery')}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        orderType === 'delivery'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-white'
                      }`}
                    >
                      <Bike className="w-4 h-4" />
                      <span>Delivery</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('takeaway')}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        orderType === 'takeaway'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-white'
                      }`}
                    >
                      <Store className="w-4 h-4" />
                      <span>Takeaway Pickup</span>
                    </button>
                  </div>

                  {/* Full Name & Phone */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] text-stone-400 block mb-1">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Tariq Mehmood"
                        className="w-full px-3.5 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-stone-400 block mb-1">WhatsApp / Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="e.g. 0321 2345678"
                        className="w-full px-3.5 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {orderType === 'delivery' && (
                      <div>
                        <label className="text-[11px] text-stone-400 block mb-1">Complete Delivery Address *</label>
                        <textarea
                          required
                          rows={2}
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          placeholder="e.g. House 42, Street 7, Block 3, DMCHS, Karachi"
                          className="w-full px-3.5 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    )}
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="text-[11px] text-stone-400 block mb-1">Payment Method</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cash')}
                        className={`p-2 rounded-xl border text-xs font-semibold ${
                          paymentMethod === 'cash'
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
                            : 'bg-stone-950 border-stone-800 text-stone-400'
                        }`}
                      >
                        Cash on Delivery
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('jazzcash')}
                        className={`p-2 rounded-xl border text-xs font-semibold ${
                          paymentMethod === 'jazzcash'
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
                            : 'bg-stone-950 border-stone-800 text-stone-400'
                        }`}
                      >
                        JazzCash / Online
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Cart Footer Total & Submit */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-stone-800 bg-stone-950 space-y-3">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-stone-400">
                    <span>Subtotal</span>
                    <span className="font-mono text-white">Rs. {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-stone-400">
                    <span>Sindh Sales Tax (13% GST)</span>
                    <span className="font-mono text-white">Rs. {taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-stone-400">
                    <span>Delivery Charges</span>
                    <span className="font-mono text-white">
                      {deliveryFee > 0 ? `Rs. ${deliveryFee}` : 'FREE'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-stone-800">
                    <span>Total Amount</span>
                    <span className="font-mono text-emerald-400">Rs. {grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isSubmittingOrder}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-stone-950 transition-colors shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingOrder ? (
                    <span>Routing Order to Kitchen...</span>
                  ) : (
                    <>
                      <span>Place Order (Rs. {grandTotal.toLocaleString()})</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LIVE ORDER TRACKER MODAL */}
      {isTrackingModalOpen && activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsTrackingModalOpen(false)}
            className="absolute inset-0 bg-stone-950/85 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden z-10 text-stone-100 flex flex-col">
            <div className="p-6 border-b border-stone-800 bg-stone-950 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">
                  Live Kitchen Dispatch
                </span>
                <h3 className="font-serif text-xl font-bold text-white">
                  Order #{activeOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setIsTrackingModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs">
              {/* Animated Live Status Badge */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-stone-950 flex items-center justify-center font-bold">
                    <ChefHat className="w-5 h-5 animate-bounce" />
                  </div>
                  <div>
                    <span className="text-[11px] text-stone-400 block">Current Status</span>
                    <span className="text-sm font-bold text-emerald-300 uppercase tracking-wide">
                      {activeOrder.kdsStatus === 'new' && 'Order Received · Queued'}
                      {activeOrder.kdsStatus === 'accepted' && 'Confirmed by Kitchen'}
                      {activeOrder.kdsStatus === 'preparing' && 'Cooking Sizzling on Grills / Wok'}
                      {activeOrder.kdsStatus === 'ready' && 'Freshly Packed & Ready'}
                      {activeOrder.kdsStatus === 'completed' && 'Delivered / Enjoy your meal!'}
                    </span>
                  </div>
                </div>

                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              </div>

              {/* Progress Steps */}
              <div className="space-y-3">
                {[
                  { step: 'new', label: 'Order Sent to Kitchen' },
                  { step: 'accepted', label: 'Chef Accepted Ticket' },
                  { step: 'preparing', label: 'Cooking & Preparation' },
                  { step: 'ready', label: 'Packed & Dispatch' },
                  { step: 'completed', label: 'Delivered / Completed' },
                ].map((st, idx) => {
                  const statusOrder = ['new', 'accepted', 'preparing', 'ready', 'completed'];
                  const currentIdx = statusOrder.indexOf(activeOrder.kdsStatus);
                  const stepIdx = statusOrder.indexOf(st.step);
                  const isDone = stepIdx <= currentIdx;
                  const isCurrent = stepIdx === currentIdx;

                  return (
                    <div key={st.step} className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                          isDone
                            ? 'bg-emerald-500 text-stone-950'
                            : 'bg-stone-800 text-stone-500'
                        }`}
                      >
                        {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          isCurrent
                            ? 'text-emerald-400 font-bold'
                            : isDone
                            ? 'text-stone-200'
                            : 'text-stone-500'
                        }`}
                      >
                        {st.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Order Summary Details */}
              <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                <span className="font-semibold text-stone-400 block text-[11px] uppercase">
                  Order Items ({activeOrder.items?.length || 0})
                </span>
                <div className="space-y-1.5 divide-y divide-stone-800/60">
                  {activeOrder.items?.map((it: any, i: number) => (
                    <div key={i} className="pt-1.5 flex justify-between text-stone-300">
                      <span>
                        {it.quantity}x {it.name} {it.variant ? `(${it.variant})` : ''}
                      </span>
                      <span className="font-mono text-emerald-400">Rs. {it.totalPrice}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-stone-800 flex justify-between font-bold text-white text-xs">
                  <span>Grand Total</span>
                  <span className="font-mono text-emerald-400">Rs. {activeOrder.grandTotal}</span>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-stone-800 bg-stone-950 flex justify-between items-center text-xs text-stone-400">
              <span>Auto-refreshing status every 3 seconds...</span>
              <button
                onClick={() => setIsTrackingModalOpen(false)}
                className="py-1.5 px-4 bg-stone-800 hover:bg-stone-700 text-white rounded-lg font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-stone-800 bg-stone-950 py-8 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} {tenant.name}. Powered by EROS Enterprise Restaurant OS.</p>
          <p className="text-[11px] text-stone-400">Direct Order Fulfillment · 0% Aggregator Commission</p>
        </div>
      </footer>
    </div>
  );
};
