import React from 'react';
import { RESTAURANT_INFO } from '../data/restaurantData';
import { Phone, MapPin, Clock, Heart } from 'lucide-react';

interface FooterProps {
  onOpenReservation: () => void;
  onOpenOrder: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenReservation, onOpenOrder }) => {
  return (
    <footer className="bg-stone-950 border-t border-stone-800 text-stone-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Col 1: Brand & Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-serif font-bold text-base">
                M
              </div>
              <div>
                <span className="font-serif text-lg font-bold text-stone-100 block">
                  {RESTAURANT_INFO.name}
                </span>
                <span className="text-[10px] text-amber-500/80 font-serif">
                  {RESTAURANT_INFO.urduName}
                </span>
              </div>
            </div>
            <p className="text-stone-400 text-xs leading-relaxed">
              Traditional Karachi hospitality, charcoal babool BBQ, Shinwari karahi in pure desi ghee, and clay pot handi on Tariq Road.
            </p>
            <div className="text-[11px] text-stone-500 pt-1">
              Google Maps Rating: <span className="text-amber-400 font-bold tabular-nums">4.6 ★</span> (231 reviews)
            </div>
          </div>

          {/* Col 2: Services & Quick Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-stone-200 text-xs tracking-wider uppercase">
              Hospitality
            </h4>
            <ul className="space-y-2 text-stone-400">
              <li>
                <a href="#overview" className="hover:text-amber-400 transition-colors">Restaurant Overview</a>
              </li>
              <li>
                <a href="#menu" className="hover:text-amber-400 transition-colors">Our Full Menu</a>
              </li>
              <li>
                <button onClick={onOpenReservation} className="hover:text-amber-400 transition-colors text-left">
                  Reserve a Family Table
                </button>
              </li>
              <li>
                <button onClick={onOpenOrder} className="hover:text-amber-400 transition-colors text-left">
                  Takeout & Home Delivery
                </button>
              </li>
              <li>
                <a href="#reviews" className="hover:text-amber-400 transition-colors">Guest Reviews</a>
              </li>
            </ul>
          </div>

          {/* Col 3: Operating Hours */}
          <div className="space-y-3">
            <h4 className="font-semibold text-stone-200 text-xs tracking-wider uppercase">
              Dining Hours
            </h4>
            <div className="space-y-2 text-stone-300">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-stone-100 block">Monday to Sunday</span>
                  <span className="text-stone-400 text-[11px]">12:00 PM – 1:00 AM Daily</span>
                </div>
              </div>
              <p className="text-[11px] text-stone-500 pt-1">
                Late night dining available every day. Tandoor and BBQ ovens operate until 1:00 AM.
              </p>
            </div>
          </div>

          {/* Col 4: Location & Contact */}
          <div className="space-y-3">
            <h4 className="font-semibold text-stone-200 text-xs tracking-wider uppercase">
              Karachi Location
            </h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="text-stone-300 leading-relaxed text-[11px]">
                  Plot no 20 Shop 4 Alrehman Corner, DMCHS, Tariq Rd, opp. traffic choki, Delhi CHS Karachi, 75400
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a
                  href={`tel:${RESTAURANT_INFO.phone}`}
                  className="font-semibold text-stone-200 hover:text-amber-400 transition-colors font-mono tabular-nums text-xs"
                >
                  {RESTAURANT_INFO.phoneFormatted}
                </a>
              </div>
              <p className="text-[10px] text-stone-500 font-mono">
                Plus Code: {RESTAURANT_INFO.plusCode}
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
          <p>© {new Date().getFullYear()} Mehmaan Restaurant Karachi. All rights reserved. 100% Halal certified.</p>
          <div className="flex items-center gap-4">
            <span>Dine-in</span>
            <span aria-hidden="true">·</span>
            <span>Takeout</span>
            <span aria-hidden="true">·</span>
            <span>Delivery</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
