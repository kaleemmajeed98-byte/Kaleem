import React, { useState } from 'react';
import { MapPin, Navigation, Phone, Clock, Copy, Check, ExternalLink, Share2, Compass } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/restaurantData';

interface LocationAndDirectionsProps {
  onOpenSendToPhone: () => void;
  onOpenShare: () => void;
}

export const LocationAndDirections: React.FC<LocationAndDirectionsProps> = ({
  onOpenSendToPhone,
  onOpenShare,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(RESTAURANT_INFO.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${RESTAURANT_INFO.name} Plot no 20 Shop4 alrehman corner D M C H society shaheed e millat Tariq Rd Karachi`
  )}`;

  return (
    <section id="location" className="py-16 sm:py-24 border-t border-stone-800 bg-stone-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-semibold tracking-wider text-amber-400 uppercase">
            Finding Us
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-100 mt-1">
            Location, Landmarks & Directions
          </h2>
          <p className="text-stone-400 text-sm mt-2">
            Located in Delhi CHS / DMCHS, right off Tariq Road and Shaheed-e-Millat Road. Directly opposite the Traffic Police Choki for effortless arrival.
          </p>
        </div>

        {/* 2-Column Split: Detailed Info Left, Interactive Map Canvas Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Coordinates, Address, Plus Code, Hours */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Address Card */}
            <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-xs text-stone-400 font-medium block">Exact Physical Address</span>
                  <p className="text-sm text-stone-100 font-medium leading-relaxed">
                    {RESTAURANT_INFO.address}
                  </p>
                </div>
              </div>

              {/* Plus Code Badge */}
              <div className="p-3 bg-stone-950 rounded-lg border border-stone-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-stone-500 uppercase tracking-wider block">Google Maps Plus Code</span>
                  <span className="font-mono text-amber-300 font-semibold">{RESTAURANT_INFO.plusCode}</span>
                </div>
                <button
                  onClick={handleCopyAddress}
                  className="p-1.5 text-stone-400 hover:text-white transition-colors"
                  title="Copy address"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Contact and Hours */}
              <div className="pt-2 border-t border-stone-800 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-stone-400 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Operating Hours:</span>
                  </span>
                  <span className="font-semibold text-emerald-400">12:00 PM – 1:00 AM Daily</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-stone-400 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-amber-400" />
                    <span>Phone:</span>
                  </span>
                  <a
                    href={`tel:${RESTAURANT_INFO.phone}`}
                    className="font-semibold text-stone-200 hover:text-amber-400 transition-colors tabular-nums"
                  >
                    {RESTAURANT_INFO.phoneFormatted}
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-4 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm text-center"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>

                <button
                  onClick={handleCopyAddress}
                  className="py-2.5 px-3 text-xs font-medium text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Address</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Landmarks & Navigation Guide */}
            <div className="p-5 rounded-2xl bg-stone-900/50 border border-stone-800 space-y-3">
              <h4 className="text-xs font-semibold text-stone-200 uppercase tracking-wider flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-400" />
                <span>Navigational Landmarks</span>
              </h4>
              <ul className="text-xs text-stone-300 space-y-2">
                {RESTAURANT_INFO.landmarks.map((landmark, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span>{landmark}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Right Column: Visual Map Representation */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Styled Map Container */}
            <div className="rounded-2xl border border-stone-800 bg-stone-900 overflow-hidden shadow-xl relative">
              
              {/* Map Canvas Visual Representation with Karachi Street Grid */}
              <div className="h-96 w-full bg-stone-950 relative overflow-hidden flex items-center justify-center">
                {/* Street Grid Graphic Pattern */}
                <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#eab308" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid-pattern)" />
                  {/* Major Thoroughfares */}
                  <line x1="0" y1="120" x2="800" y2="120" stroke="#f59e0b" strokeWidth="3" opacity="0.4" />
                  <line x1="280" y1="0" x2="280" y2="500" stroke="#f59e0b" strokeWidth="3" opacity="0.4" />
                  <line x1="0" y1="280" x2="800" y2="280" stroke="#78716c" strokeWidth="2" opacity="0.3" />
                  <line x1="520" y1="0" x2="520" y2="500" stroke="#78716c" strokeWidth="2" opacity="0.3" />
                </svg>

                {/* Road Labels */}
                <div className="absolute top-24 left-8 text-[11px] font-mono text-amber-500/80 tracking-wider">
                  Shaheed-e-Millat Expressway →
                </div>
                <div className="absolute bottom-28 right-8 text-[11px] font-mono text-amber-500/80 tracking-wider">
                  ← Tariq Road Main Commercial
                </div>
                <div className="absolute top-8 right-12 text-[10px] text-stone-500">
                  Delhi CHS / DMCHS Block
                </div>

                {/* Center Pin for Mehmaan Restaurant */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 animate-ping absolute inset-0" />
                    <div className="w-12 h-12 rounded-full bg-amber-400 border-2 border-stone-950 flex items-center justify-center text-stone-950 shadow-lg font-bold text-lg">
                      <MapPin className="w-6 h-6 fill-stone-950 text-stone-950" />
                    </div>
                  </div>

                  <div className="mt-2 px-3 py-1.5 rounded-lg bg-stone-900/90 backdrop-blur-md border border-amber-500/40 text-center shadow-lg">
                    <span className="font-serif font-bold text-stone-100 text-xs block">
                      Mehmaan Restaurant
                    </span>
                    <span className="text-[10px] text-amber-400 font-medium">
                      Plot 20, Shop 4 · Opp. Traffic Choki
                    </span>
                  </div>
                </div>

                {/* Traffic Police Choki Reference Landmark */}
                <div className="absolute top-1/3 left-1/4 px-2 py-1 rounded bg-stone-900/80 border border-stone-700 text-[10px] text-stone-300">
                  Traffic Police Choki
                </div>

                {/* Quick Overlay Action Bar on Map */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between p-2 rounded-xl bg-stone-950/85 backdrop-blur-md border border-stone-800 text-xs">
                  <div className="text-stone-300 font-medium truncate pr-2">
                    24.8724° N, 67.0658° E · Delhi CHS, PECHS
                  </div>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-amber-400 text-stone-950 font-semibold hover:bg-amber-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1"
                  >
                    <span>View Live Map</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

              </div>

            </div>

            {/* Travel Time from Key Karachi Areas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-stone-900 border border-stone-800">
                <span className="text-stone-400 block text-[11px]">From Tariq Road</span>
                <span className="font-semibold text-stone-100 mt-0.5 block">2–3 mins</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-900 border border-stone-800">
                <span className="text-stone-400 block text-[11px]">From Bahadurabad</span>
                <span className="font-semibold text-stone-100 mt-0.5 block">5–7 mins</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-900 border border-stone-800">
                <span className="text-stone-400 block text-[11px]">From Sharea Faisal</span>
                <span className="font-semibold text-stone-100 mt-0.5 block">6–8 mins</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-900 border border-stone-800">
                <span className="text-stone-400 block text-[11px]">From Clifton / DHA</span>
                <span className="font-semibold text-stone-100 mt-0.5 block">15–20 mins</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
