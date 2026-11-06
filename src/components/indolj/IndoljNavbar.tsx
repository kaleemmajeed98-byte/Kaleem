import React from 'react';
import { ShoppingBag, Store, ChefHat, Calculator, Flame, MapPin, ChevronDown } from 'lucide-react';
import { Branch } from '../../types/indolj';

export type ActiveTab = 'storefront' | 'merchant' | 'calculator' | 'saas';

interface IndoljNavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  selectedBranch: Branch;
  onSelectBranch: (branch: Branch) => void;
  branches: Branch[];
  cartCount: number;
  cartSubtotal: number;
  onOpenCart: () => void;
  pendingOrdersCount: number;
}

export const IndoljNavbar: React.FC<IndoljNavbarProps> = ({
  activeTab,
  onSelectTab,
  selectedBranch,
  onSelectBranch,
  branches,
  cartCount,
  cartSubtotal,
  onOpenCart,
  pendingOrdersCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-stone-950/95 backdrop-blur-md border-b border-stone-800 transition-colors">
      
      {/* Top Thin Notification Ticker */}
      <div className="bg-emerald-950/60 border-b border-emerald-900/40 py-1.5 px-4 text-center text-[11px] text-emerald-300">
        <span className="font-semibold">Indolj Direct Ordering:</span> 0% Aggregator Commission · 100% Restaurant Revenue Retained · Flat 20% off with code <code className="bg-emerald-900/80 px-1.5 py-0.5 rounded font-mono font-bold text-emerald-200">INDOLJ20</code>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-6">
        
        {/* Zone 1: Indolj Brand Identity */}
        <div className="flex items-center gap-6 shrink-0">
          <button
            onClick={() => onSelectTab('storefront')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Flame className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xl tracking-tight text-white font-serif">
                  indolj<span className="text-emerald-400">.pk</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded font-mono">
                  v3.4
                </span>
              </div>
              <span className="text-[10px] text-stone-400 block -mt-0.5">
                Direct Restaurant Engine
              </span>
            </div>
          </button>

          {/* Branch Switcher (Storefront mode) */}
          {activeTab === 'storefront' && (
            <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-stone-800 text-xs">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] text-stone-500">Selected Branch:</span>
                <select
                  value={selectedBranch.id}
                  onChange={(e) => {
                    const br = branches.find((b) => b.id === e.target.value);
                    if (br) onSelectBranch(br);
                  }}
                  className="bg-transparent text-stone-200 font-semibold focus:outline-none cursor-pointer pr-4"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id} className="bg-stone-900 text-stone-100">
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Zone 2: Navigation / Platform Mode Switcher */}
        <nav className="hidden md:flex items-center gap-1 p-1 bg-stone-900/90 rounded-xl border border-stone-800/90 text-xs">
          <button
            onClick={() => onSelectTab('storefront')}
            className={`px-3.5 py-2 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'storefront'
                ? 'bg-emerald-500 text-stone-950 font-bold shadow-sm'
                : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Customer Storefront</span>
          </button>

          <button
            onClick={() => onSelectTab('merchant')}
            className={`px-3.5 py-2 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-2 relative ${
              activeTab === 'merchant'
                ? 'bg-emerald-500 text-stone-950 font-bold shadow-sm'
                : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>Merchant KDS & POS</span>
            {pendingOrdersCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-400 text-stone-950 rounded-full tabular-nums animate-pulse">
                {pendingOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('calculator')}
            className={`px-3.5 py-2 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'calculator'
                ? 'bg-emerald-500 text-stone-950 font-bold shadow-sm'
                : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Commission Saver</span>
          </button>

          <button
            onClick={() => onSelectTab('saas')}
            className={`px-3.5 py-2 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'saas'
                ? 'bg-emerald-500 text-stone-950 font-bold shadow-sm'
                : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Indolj Platform</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action Lockup */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenCart}
            className="inline-flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-stone-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-all shadow-md shadow-emerald-500/10 cursor-pointer active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Cart ({cartCount})</span>
            {cartSubtotal > 0 && (
              <span className="hidden sm:inline pl-1 border-l border-stone-950/20 font-mono tabular-nums">
                Rs {cartSubtotal.toLocaleString()}
              </span>
            )}
          </button>
        </div>

      </div>

      {/* Mobile Mode Switcher Row */}
      <div className="md:hidden flex items-center gap-1 px-4 py-2 border-t border-stone-800 bg-stone-900/60 overflow-x-auto no-scrollbar text-xs">
        <button
          onClick={() => onSelectTab('storefront')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap ${
            activeTab === 'storefront' ? 'bg-emerald-500 text-stone-950 font-bold' : 'text-stone-300'
          }`}
        >
          Storefront
        </button>
        <button
          onClick={() => onSelectTab('merchant')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'merchant' ? 'bg-emerald-500 text-stone-950 font-bold' : 'text-stone-300'
          }`}
        >
          <span>Merchant KDS</span>
          {pendingOrdersCount > 0 && (
            <span className="px-1 text-[10px] bg-amber-400 text-stone-950 rounded-full font-bold">
              {pendingOrdersCount}
            </span>
          )}
        </button>
        <button
          onClick={() => onSelectTab('calculator')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap ${
            activeTab === 'calculator' ? 'bg-emerald-500 text-stone-950 font-bold' : 'text-stone-300'
          }`}
        >
          Commission Saver
        </button>
        <button
          onClick={() => onSelectTab('saas')}
          className={`px-3 py-1.5 rounded-md whitespace-nowrap ${
            activeTab === 'saas' ? 'bg-emerald-500 text-stone-950 font-bold' : 'text-stone-300'
          }`}
        >
          SaaS Engine
        </button>
      </div>

    </header>
  );
};
