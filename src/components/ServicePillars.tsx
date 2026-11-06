import React from 'react';
import { Utensils, ShoppingBag, Bike, Users, Clock, Flame } from 'lucide-react';

interface ServicePillarsProps {
  onOpenReservation: () => void;
  onOpenOrder: () => void;
}

export const ServicePillars: React.FC<ServicePillarsProps> = ({
  onOpenReservation,
  onOpenOrder,
}) => {
  return (
    <section className="py-12 border-y border-stone-800/80 bg-stone-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-semibold tracking-wider text-amber-400 uppercase">
            Service Experiences
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-100 mt-1">
            Three Ways to Savor Mehmaan
          </h2>
          <p className="text-stone-400 text-sm mt-2">
            Whether dining with the entire family, picking up a late-night parcel, or getting piping-hot handis delivered home.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Dine-in */}
          <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-6 flex flex-col justify-between hover:border-stone-700 transition-colors">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Utensils className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-100">
                Royal Dine-In Experience
              </h3>
              <p className="text-stone-300 text-sm leading-relaxed">
                Spacious air-conditioned halls, ambient brass lighting, family-friendly seating, and traditional floor majlis options. Dedicated hospitality staff ensuring prompt service.
              </p>
              <div className="text-xs text-stone-400 space-y-1.5 pt-2">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span>Large family & corporate tables (up to 25 people)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Open 12:00 PM – 1:00 AM daily</span>
                </div>
              </div>
            </div>
            <div className="pt-6">
              <button
                onClick={onOpenReservation}
                className="w-full py-2.5 px-4 text-xs font-semibold text-stone-200 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors border border-stone-700"
              >
                Book Your Table
              </button>
            </div>
          </div>

          {/* Card 2: Takeout */}
          <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-6 flex flex-col justify-between hover:border-stone-700 transition-colors">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-100">
                Express Counter Takeout
              </h3>
              <p className="text-stone-300 text-sm leading-relaxed">
                Passing by Tariq Road or Shaheed-e-Millat? Place your order ahead and pick up your sizzling parcels within 20 minutes with dedicated drive-up curbside support.
              </p>
              <div className="text-xs text-stone-400 space-y-1.5 pt-2">
                <div className="flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Thermal foil insulation keeps BBQ smoking hot</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Drive-by curbside pickup opposite traffic choki</span>
                </div>
              </div>
            </div>
            <div className="pt-6">
              <button
                onClick={onOpenOrder}
                className="w-full py-2.5 px-4 text-xs font-semibold text-stone-200 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors border border-stone-700"
              >
                Schedule Takeout
              </button>
            </div>
          </div>

          {/* Card 3: Delivery */}
          <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-6 flex flex-col justify-between hover:border-stone-700 transition-colors">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Bike className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-100">
                Fast Karachi Delivery
              </h3>
              <p className="text-stone-300 text-sm leading-relaxed">
                Direct to your door in PECHS, DMCHS, Bahadurabad, SMCHS, Gulshan, and Clifton/DHA. Savor the authentic aroma of coal BBQ in the comfort of your living room.
              </p>
              <div className="text-xs text-stone-400 space-y-1.5 pt-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Average delivery time 30–45 mins</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Cash on Delivery (COD) & JazzCash accepted</span>
                </div>
              </div>
            </div>
            <div className="pt-6">
              <button
                onClick={onOpenOrder}
                className="w-full py-2.5 px-4 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm"
              >
                Order Delivery Now
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
