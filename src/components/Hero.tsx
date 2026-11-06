import React from 'react';
import { Star, MapPin, Clock, Phone, Navigation, Bookmark, Share2, Smartphone, UtensilsCrossed, Calendar } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/restaurantData';

interface HeroProps {
  onOpenReservation: () => void;
  onOpenDirections: () => void;
  onOpenShare: () => void;
  onOpenSendToPhone: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenReservation,
  onOpenDirections,
  onOpenShare,
  onOpenSendToPhone,
  isSaved,
  onToggleSave,
}) => {
  return (
    <section id="overview" className="relative pt-6 pb-16 lg:pt-10 lg:pb-24 overflow-hidden">
      {/* Background Subtle Gradient & Glow */}
      <div className="absolute inset-0 bg-radial from-amber-500/5 via-stone-950 to-stone-950 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Main 2-Column Split: Editorial Presentation & Atmospheric Imagery */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Business Credentials & Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Google Maps Real Listing Verified Header */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-stone-400">
              <span className="font-semibold text-amber-400">Restaurant</span>
              <span aria-hidden="true">·</span>
              <div className="flex items-center gap-1 text-stone-200">
                <span className="font-bold text-amber-400 tabular-nums">{RESTAURANT_INFO.rating}</span>
                <div className="flex text-amber-400" aria-label="Rating 4.6 out of 5 stars">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < 4 ? 'fill-amber-400 text-amber-400' : 'fill-amber-400/40 text-amber-400'}`}
                    />
                  ))}
                </div>
                <span className="text-stone-400">({RESTAURANT_INFO.reviewCount} reviews)</span>
              </div>
              <span aria-hidden="true">·</span>
              <span className="text-stone-300 font-medium">{RESTAURANT_INFO.priceRange}</span>
              <span aria-hidden="true">·</span>
              <span className="text-stone-400">Karachi, PK</span>
            </div>

            {/* Display Headline */}
            <div className="space-y-2">
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-100 text-balance leading-tight">
                Authentic Karachi Dining, <br />
                <span className="text-amber-400 italic font-serif">Served with Royal Hospitality</span>
              </h1>
              <p className="text-base sm:text-lg text-stone-300 max-w-2xl font-light leading-relaxed">
                Welcome to <strong className="font-medium text-stone-100">{RESTAURANT_INFO.name}</strong> on Tariq Road. 
                Relish sizzling charcoal BBQ, Shinwari karahi in pure desi ghee, clay pot handi, and fragrant dum biryani—prepared fresh for you until 1:00 AM.
              </p>
            </div>

            {/* Service Capabilities Strip */}
            <div className="flex items-center gap-4 text-xs sm:text-sm text-stone-300 pt-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Dine-in</span>
              </div>
              <span aria-hidden="true" className="text-stone-600">·</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Takeout</span>
              </div>
              <span aria-hidden="true" className="text-stone-600">·</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Fast Delivery</span>
              </div>
              <span aria-hidden="true" className="text-stone-600">·</span>
              <span className="text-amber-400 font-medium">Closes 1 AM</span>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#menu"
                className="px-6 py-3 text-sm font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-all shadow-md shadow-amber-500/10 active:scale-95 whitespace-nowrap"
              >
                Explore Full Menu
              </a>
              <button
                onClick={onOpenReservation}
                className="px-5 py-3 text-sm font-semibold text-stone-200 hover:text-white bg-stone-900 hover:bg-stone-800 border border-stone-700 rounded-lg transition-all active:scale-95 whitespace-nowrap inline-flex items-center gap-2"
              >
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Reserve a Table</span>
              </button>
              <a
                href={`tel:${RESTAURANT_INFO.phone}`}
                className="px-4 py-3 text-sm font-medium text-stone-300 hover:text-white bg-stone-900/60 hover:bg-stone-800 border border-stone-800 rounded-lg transition-all whitespace-nowrap inline-flex items-center gap-2"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <span className="tabular-nums">{RESTAURANT_INFO.phoneFormatted}</span>
              </a>
            </div>

            {/* Google Maps Actions Strip (Directions, Save, Share, Send to Phone) */}
            <div className="pt-4 border-t border-stone-800/80">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                  onClick={onOpenDirections}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-stone-900 hover:bg-stone-800 border border-stone-700/80 text-stone-200 hover:text-white transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5 text-amber-400" />
                  <span>Directions</span>
                </button>

                <button
                  onClick={onToggleSave}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border transition-colors ${
                    isSaved
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                      : 'bg-stone-900 hover:bg-stone-800 border-stone-700/80 text-stone-200 hover:text-white'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-400 text-amber-400' : 'text-stone-400'}`} />
                  <span>{isSaved ? 'Saved to Places' : 'Save'}</span>
                </button>

                <button
                  onClick={onOpenSendToPhone}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-stone-900 hover:bg-stone-800 border border-stone-700/80 text-stone-200 hover:text-white transition-colors"
                >
                  <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Send to phone</span>
                </button>

                <button
                  onClick={onOpenShare}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-stone-900 hover:bg-stone-800 border border-stone-700/80 text-stone-200 hover:text-white transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 text-stone-400" />
                  <span>Share</span>
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Restaurant Visual Asset */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-stone-800 bg-stone-900 shadow-2xl group">
              <img
                src="/src/assets/images/hero_mehmaan_dining_1793901968860.jpg"
                alt="Mehmaan Restaurant luxury dining hall in Karachi with brass lamps and warm Mughlai hospitality"
                referrerPolicy="no-referrer"
                className="w-full h-[360px] sm:h-[420px] lg:h-[460px] object-cover object-center group-hover:scale-102 transition-transform duration-700"
              />
              
              {/* Subtle Gradient Scrim with Real Review Note */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent pointer-events-none" />
              
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-stone-950/80 backdrop-blur-md border border-stone-800">
                <div className="flex items-center justify-between text-xs text-stone-300">
                  <span className="font-serif italic text-amber-300 text-sm">"Treated like royal guests every visit"</span>
                  <span className="text-amber-400 font-bold tabular-nums">4.6 ★</span>
                </div>
                <p className="text-[11px] text-stone-400 mt-1 line-clamp-1">
                  Plot 20, Shop 4, Alrehman Corner, DMCHS, Tariq Rd, Delhi CHS Karachi
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* 4-Column Quick Verified Metric Strip Below Hero */}
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-xl bg-stone-900/60 border border-stone-800">
          <div>
            <div className="text-xs text-stone-400 font-medium">Google Rating</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-serif text-2xl font-bold text-amber-400 tabular-nums">4.6</span>
              <span className="text-xs text-stone-400">from 231 reviews</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-stone-400 font-medium">Average Spend</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-serif text-2xl font-bold text-stone-100 tabular-nums">Rs 1,000–7,000</span>
              <span className="text-xs text-stone-400">/ person</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-stone-400 font-medium">Daily Hours</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-serif text-2xl font-bold text-emerald-400">Until 1:00 AM</span>
              <span className="text-xs text-stone-400">Late night dining</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-stone-400 font-medium">Location Landmark</div>
            <div className="mt-1 flex items-baseline gap-1.5 truncate">
              <span className="font-medium text-stone-200 text-sm truncate">Opp. Traffic Choki, Tariq Rd</span>
            </div>
            <div className="text-[11px] text-stone-400 truncate">V3H8+H5 Delhi CHS, PECHS</div>
          </div>
        </div>

      </div>
    </section>
  );
};
