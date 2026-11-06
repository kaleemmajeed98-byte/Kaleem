import React from 'react';
import { Sparkles, ShieldCheck, Flame, HeartHandshake } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/restaurantData';

export const AboutAndStory: React.FC = () => {
  return (
    <section id="about" className="py-16 sm:py-24 border-t border-stone-800 bg-stone-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Visual Collage & Craftsmanship */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl overflow-hidden border border-stone-800 bg-stone-900 shadow-xl relative group">
              <img
                src="/src/assets/images/food_karahi_handi_1793901969642.jpg"
                alt="Mehmaan Restaurant traditional Shinwari karahi and clay handi"
                referrerPolicy="no-referrer"
                className="w-full h-80 object-cover object-center group-hover:scale-102 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 p-3 bg-stone-950/80 backdrop-blur-md rounded-xl border border-stone-800 text-xs">
                <span className="text-amber-400 font-semibold">Shinwari & Handi Kitchen</span>
                <p className="text-stone-400 text-[11px] mt-0.5">
                  Prepared in heavy black iron woks and unglazed clay pots
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800 flex items-center justify-between text-xs">
              <span className="text-stone-400 font-medium">Karachi Culinary Heritage</span>
              <span className="text-amber-300 font-serif italic text-sm">"مہمان نوازی ہماری روایت ہے"</span>
            </div>
          </div>

          {/* Right Column: Narrative & Values */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="text-xs font-semibold tracking-wider text-amber-400 uppercase">
                Our Story & Philosophy
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-100 mt-1">
                The Sacred Tradition of <span className="italic text-amber-400">Mehmaan Nawazi</span>
              </h2>
            </div>

            <div className="space-y-4 text-stone-300 text-sm leading-relaxed font-light">
              <p>
                In Urdu culture, a <strong className="text-stone-100 font-medium">Mehmaan (مہمان)</strong> is not merely a patron or a table number. A Mehmaan is an honored guest welcomed with warmth, dignity, and the very best feast the household can offer.
              </p>
              <p>
                Founded in the heart of Karachi at <strong className="text-stone-100 font-medium">DMCHS, Tariq Road</strong>, Mehmaan Restaurant was born out of a commitment to celebrate authentic Pakistani recipes without shortcuts. We reject synthetic meat tenderizers, artificial colorings, and commercial pre-mixes.
              </p>
              <p>
                Every skewer of Chicken Malai Boti is slow-charred over natural babool wood charcoal. Every Shinwari Karahi is forged fresh upon your order with hand-cut goat meat, fresh tomatoes, and pure desi ghee. Our tandoor master bakes piping hot Roghani and Garlic naans moments before they arrive at your table.
              </p>
            </div>

            {/* Core Kitchen Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-stone-900/40 border border-stone-800 space-y-2">
                <div className="flex items-center gap-2 text-stone-100 font-semibold text-xs">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Babool Wood Charcoal Grilling</span>
                </div>
                <p className="text-[12px] text-stone-400 leading-normal">
                  Natural hardwood charcoal generates steady radiant heat that seals in juices while delivering deep, authentic smokiness.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-stone-900/40 border border-stone-800 space-y-2">
                <div className="flex items-center gap-2 text-stone-100 font-semibold text-xs">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>100% Fresh Halal Daily Butchery</span>
                </div>
                <p className="text-[12px] text-stone-400 leading-normal">
                  Daily inspected prime cuts of mutton, beef, and farm poultry. Never frozen meats, ensuring unrivaled succulence.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-stone-900/40 border border-stone-800 space-y-2">
                <div className="flex items-center gap-2 text-stone-100 font-semibold text-xs">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Desi Ghee & Terracotta Clay</span>
                </div>
                <p className="text-[12px] text-stone-400 leading-normal">
                  Authentic Shinwari Karahi prepared with pure clarified butter, and creamy White Handis cooked in unglazed clay pots.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-stone-900/40 border border-stone-800 space-y-2">
                <div className="flex items-center gap-2 text-stone-100 font-semibold text-xs">
                  <HeartHandshake className="w-4 h-4 text-amber-400" />
                  <span>Karachi Family Hospitality</span>
                </div>
                <p className="text-[12px] text-stone-400 leading-normal">
                  Respectful family halls, dedicated floor majlis seating, and welcoming service that makes you feel at home until 1 AM.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
