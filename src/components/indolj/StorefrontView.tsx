import React, { useState, useMemo } from 'react';
import {
  Search,
  Flame,
  Plus,
  Clock,
  Sparkles,
  Users,
  Bike,
  Store,
  QrCode,
  Tag,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { Branch, MenuItem, Order, OrderType } from '../../types/indolj';
import { MENU_CATEGORIES } from '../../data/indoljData';

interface StorefrontViewProps {
  branch: Branch;
  menuItems: MenuItem[];
  onSelectItemToCustomize: (item: MenuItem) => void;
  activeOrder: Order | null;
  onOpenOrderTracker: () => void;
}

export const StorefrontView: React.FC<StorefrontViewProps> = ({
  branch,
  menuItems,
  onSelectItemToCustomize,
  activeOrder,
  onOpenOrderTracker,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.urduName && item.urduName.includes(searchQuery)) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  return (
    <div className="space-y-10 pb-20">
      
      {/* Active Order Floating Alert Strip */}
      {activeOrder && activeOrder.status !== 'delivered' && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <span className="text-stone-200">
                Active Order <strong className="font-mono text-amber-300">#{activeOrder.orderNumber}</strong> is currently{' '}
                <span className="text-amber-400 font-semibold capitalize">{activeOrder.status.replace(/_/g, ' ')}</span>
              </span>
            </div>
            <button
              onClick={onOpenOrderTracker}
              className="py-1 px-3 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-lg transition-colors flex items-center gap-1 shrink-0"
            >
              <span>Track Live</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Hero Banner Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-6">
        <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden border border-stone-800 bg-stone-900 shadow-2xl relative">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            
            <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 space-y-5 z-10">
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  Indolj Direct Storefront
                </span>
                <span className="text-stone-400">·</span>
                <span className="text-stone-300 font-medium">{branch.name}</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
                Authentic Food Delivered Direct, <br />
                <span className="text-emerald-400 italic">Zero Aggregator Markup</span>
              </h1>

              <p className="text-sm sm:text-base text-stone-300 max-w-xl font-light leading-relaxed">
                Order sizzling charcoal BBQ, Shinwari karahi in pure desi ghee, and clay pot handis directly from our kitchen. Faster delivery, hotter food, and exclusive direct discounts.
              </p>

              {/* Verified Trust Stats */}
              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-stone-300">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Avg Delivery: <strong className="text-white">{branch.deliveryTime}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Min Order: <strong className="text-white">Rs {branch.minOrder}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-400" />
                  <span>Code: <strong className="font-mono text-amber-300">INDOLJ20</strong> (20% OFF)</span>
                </div>
              </div>

            </div>

            {/* Right Media Preview */}
            <div className="lg:col-span-5 relative h-64 sm:h-80 lg:h-full min-h-[300px]">
              <img
                src="/src/assets/images/food_bbq_platter_1793901968953.jpg"
                alt="Sizzling Charcoal BBQ Platter on Indolj direct online ordering"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-stone-900 via-stone-900/40 to-transparent pointer-events-none" />
              
              <div className="absolute bottom-4 right-4 p-3 rounded-xl bg-stone-950/80 backdrop-blur-md border border-stone-800 text-xs">
                <span className="text-amber-400 font-bold block">100% Direct Store</span>
                <span className="text-stone-400 text-[11px]">Save up to 30% vs Foodpanda</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Menu & Catalog Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Search & Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-stone-800">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Explore Our Live Menu
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-0.5">
              Food Categories & Deals
            </h2>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search BBQ, handi, karahi, naan..."
              className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {MENU_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`py-2 px-4 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-emerald-400 text-stone-950 shadow-sm'
                    : 'bg-stone-900 text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-800'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Food Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border bg-stone-900/60 overflow-hidden flex flex-col justify-between transition-all group ${
                item.inStock
                  ? 'border-stone-800 hover:border-emerald-500/50 hover:bg-stone-900'
                  : 'border-stone-800/50 opacity-60'
              }`}
            >
              
              {/* Image Preview */}
              <div className="relative h-48 bg-stone-950 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent pointer-events-none" />

                {item.isDeal && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-400 text-stone-950 shadow-md">
                    Combo Deal
                  </span>
                )}

                {item.isPopular && !item.isDeal && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-400 text-stone-950 shadow-md">
                    Bestseller
                  </span>
                )}

                {!item.inStock && (
                  <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center">
                    <span className="px-3 py-1 bg-red-500/20 border border-red-500/50 text-red-300 text-xs font-bold rounded-md">
                      Sold Out for Today
                    </span>
                  </div>
                )}

                {item.urduName && (
                  <span className="absolute bottom-2.5 right-3 text-xs font-serif text-amber-200/90 font-medium">
                    {item.urduName}
                  </span>
                )}
              </div>

              {/* Item Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-serif text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {item.name}
                  </h3>

                  {item.serves && (
                    <div className="flex items-center gap-1.5 text-xs text-stone-400 mt-1">
                      <Users className="w-3.5 h-3.5 text-stone-500" />
                      <span>{item.serves}</span>
                    </div>
                  )}

                  <p className="text-xs text-stone-300 leading-relaxed mt-2 line-clamp-2">
                    {item.description}
                  </p>
                </div>

                {/* Price and Action */}
                <div className="pt-3 border-t border-stone-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-stone-500 block uppercase tracking-wider">
                      Starting from
                    </span>
                    <span className="font-mono text-base font-bold text-white tabular-nums">
                      Rs {item.basePrice.toLocaleString()}
                    </span>
                  </div>

                  <button
                    disabled={!item.inStock}
                    onClick={() => onSelectItemToCustomize(item)}
                    className="py-2 px-3.5 text-xs font-bold text-stone-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 disabled:pointer-events-none rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Customise & Add</span>
                  </button>
                </div>

              </div>

            </div>
          ))}
        </div>

      </section>

    </div>
  );
};
