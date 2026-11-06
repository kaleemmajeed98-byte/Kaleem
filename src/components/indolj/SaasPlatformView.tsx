import React from 'react';
import {
  Store,
  Smartphone,
  Cpu,
  Bike,
  MessageSquare,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  Flame,
  ArrowRight,
} from 'lucide-react';

interface SaasPlatformViewProps {
  onGoToStorefront: () => void;
  onGoToMerchant: () => void;
  onGoToCalculator: () => void;
}

export const SaasPlatformView: React.FC<SaasPlatformViewProps> = ({
  onGoToStorefront,
  onGoToMerchant,
  onGoToCalculator,
}) => {
  const brands = [
    'Kababjees Express',
    'Ginsoy Extreme Chinese',
    'California Pizza',
    'Mehmaan Restaurant',
    'Daily Deli Co.',
    'Kaybees',
  ];

  return (
    <div className="space-y-20 pb-20">
      
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-10 text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
          <Flame className="w-3.5 h-3.5 fill-emerald-400" />
          <span>Pakistan's #1 Restaurant Online Ordering & Management System</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
          Own Your Customers. <br />
          <span className="text-emerald-400 italic">Pay 0% Commission.</span>
        </h1>

        <p className="text-sm sm:text-lg text-stone-300 font-light max-w-2xl mx-auto leading-relaxed">
          Indolj equips top restaurant brands with their own branded web storefronts, native mobile apps, Kitchen Display Systems (KDS), rider dispatch, and POS integration.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={onGoToStorefront}
            className="py-3 px-6 text-xs font-bold text-stone-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-lg shadow-emerald-500/10 cursor-pointer"
          >
            Experience Live Ordering Storefront
          </button>
          <button
            onClick={onGoToMerchant}
            className="py-3 px-6 text-xs font-bold text-stone-200 hover:text-white bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-xl transition-all cursor-pointer"
          >
            View Merchant KDS Dashboard
          </button>
          <button
            onClick={onGoToCalculator}
            className="py-3 px-5 text-xs font-semibold text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-all cursor-pointer"
          >
            Calculate 0% Commission Savings
          </button>
        </div>

        {/* Brand Logos Bar */}
        <div className="pt-10 border-t border-stone-800/80">
          <span className="text-[11px] text-stone-500 uppercase tracking-widest font-semibold block mb-4">
            Trusted by Top Food Chains Across Karachi, Lahore & Islamabad
          </span>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-stone-400 font-serif text-sm">
            {brands.map((brand) => (
              <span key={brand} className="hover:text-stone-200 transition-colors">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Pillars Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            All-In-One Ecosystem
          </span>
          <h2 className="font-serif text-3xl font-bold text-white mt-1">
            Everything You Need to Scale Direct Delivery
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Store className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-white">
              Branded Web & Mobile Ordering
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Your logo, colors, and direct URL. Customers order directly without seeing competitor listings or discounts on third-party aggregators.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-white">
              Seamless POS & Kitchen Sync
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Online orders print directly to thermal kitchen printers and route into your existing Point of Sale. Zero manual re-punching of orders.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-white">
              Indolj Merchant App & KDS
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Manage preparation times, 86 out-of-stock items, accept or modify orders, and notify customers in real time with high-visibility sound chimes.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Bike className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-white">
              Rider Dispatch & Live Tracking
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Dispatch orders to your own in-house motorcycle delivery riders or 3rd-party logistics APIs. Customers watch live progress on an interactive map.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-white">
              Customer CRM & Automated SMS
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              You own 100% of customer phone numbers and dining habits. Trigger automated promotional SMS on weekends and cricket matches to boost repeat orders.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-white">
              Multi-Branch Central Reporting
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Consolidated sales dashboards for multi-branch operations across Karachi, Lahore, and Islamabad with drill-downs on peak hours and top items.
            </p>
          </div>

        </div>
      </section>

      {/* Pricing Comparison Table */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="p-8 rounded-3xl bg-stone-900 border border-stone-800">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h3 className="font-serif text-2xl font-bold text-white">
              Compare Aggregators vs. Indolj Direct
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-800 text-stone-400">
                  <th className="py-3 px-4 font-semibold">Features & Benefits</th>
                  <th className="py-3 px-4 font-semibold text-red-400">Foodpanda / Aggregators</th>
                  <th className="py-3 px-4 font-semibold text-emerald-400">Indolj Direct Platform</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60 text-stone-300">
                <tr>
                  <td className="py-3.5 px-4 font-medium">Order Commission</td>
                  <td className="py-3.5 px-4 text-red-400">25% – 32% on gross sales</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold">0% Commission (Flat Fee)</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium">Customer Phone Numbers</td>
                  <td className="py-3.5 px-4 text-stone-500">Masked (No data owned)</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold">100% Owned by Restaurant</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium">Custom Branded Mobile App</td>
                  <td className="py-3.5 px-4 text-stone-500">No (Listed alongside rivals)</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold">Dedicated iOS & Android App</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium">Direct Marketing & SMS</td>
                  <td className="py-3.5 px-4 text-stone-500">Not allowed</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold">Built-in SMS Campaigns</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium">Payment Settlement</td>
                  <td className="py-3.5 px-4 text-stone-500">15–30 days delayed</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold">Direct Cash & Instant Bank</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

    </div>
  );
};
