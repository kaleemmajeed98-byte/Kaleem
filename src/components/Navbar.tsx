import React from 'react';
import { ShoppingBag, Calendar, Phone, MapPin, Heart } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/restaurantData';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenReservation: () => void;
  onOpenDirections: () => void;
  savedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onOpenReservation,
  onOpenDirections,
  savedCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-stone-950/90 backdrop-blur-md border-b border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single text element wordmark */}
        <a 
          href="#overview" 
          className="flex items-center gap-3 text-stone-100 hover:text-amber-400 transition-colors shrink-0 group"
        >
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
            <span className="font-serif text-xl font-bold">M</span>
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl font-semibold tracking-wide text-stone-100 group-hover:text-amber-300 transition-colors whitespace-nowrap">
              {RESTAURANT_INFO.name}
            </span>
            <span className="text-[11px] text-amber-500/80 tracking-widest uppercase font-medium">
              {RESTAURANT_INFO.urduName} · Karachi
            </span>
          </div>
        </a>

        {/* Zone 2: 4–5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-300">
          <a href="#overview" className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0">
            Overview
          </a>
          <a href="#menu" className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0">
            Menu
          </a>
          <a href="#reviews" className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0">
            Reviews (4.6★)
          </a>
          <a href="#about" className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0">
            About
          </a>
          <a href="#location" className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0">
            Directions
          </a>
        </nav>

        {/* Zone 3: 1 primary action lockup with cart & quick reserve */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenReservation}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-stone-300 hover:text-white bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-lg transition-colors whitespace-nowrap"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Book Table</span>
          </button>

          <button
            onClick={onOpenCart}
            aria-label="View order cart"
            className="relative inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm whitespace-nowrap cursor-pointer active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Order Online</span>
            {cartCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold text-white bg-stone-950 rounded-full tabular-nums">
                {cartCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
