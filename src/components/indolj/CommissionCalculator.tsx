import React, { useState } from 'react';
import { Calculator, DollarSign, TrendingUp, ShieldCheck, Sparkles, Check, ArrowRight, Building2, Phone } from 'lucide-react';

export const CommissionCalculator: React.FC = () => {
  const [monthlySales, setMonthlySales] = useState<number>(2500000); // 2.5 Million PKR / mo
  const [aggregatorRate, setAggregatorRate] = useState<number>(28); // 28% Foodpanda
  const [restaurantName, setRestaurantName] = useState<string>('');
  const [ownerPhone, setOwnerPhone] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  // Calculations
  const aggregatorCostMonthly = Math.round((monthlySales * aggregatorRate) / 100);
  const indoljFeeMonthly = 15000; // Flat monthly SaaS fee
  const netMonthlySavings = Math.max(0, aggregatorCostMonthly - indoljFeeMonthly);
  const annualSavings = netMonthlySavings * 12;

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantName || !ownerPhone) return;
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
          The Indolj ROI Calculator
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight">
          How Much Profit Are You Giving Away to Aggregators?
        </h2>
        <p className="text-stone-300 text-sm sm:text-base font-light">
          Third-party aggregators in Pakistan charge between 25% and 32% on every single order. See how much money your restaurant saves with Indolj’s 0% commission direct online ordering system.
        </p>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sliders Input Left Column */}
        <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-stone-900 border border-stone-800 space-y-8 shadow-xl">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-white">
                Monthly Online Delivery Sales (PKR)
              </label>
              <span className="font-mono text-base font-bold text-emerald-400 tabular-nums">
                Rs {monthlySales.toLocaleString()}
              </span>
            </div>
            
            <input
              type="range"
              min={300000}
              max={15000000}
              step={100000}
              value={monthlySales}
              onChange={(e) => setMonthlySales(Number(e.target.value))}
              className="w-full h-2.5 bg-stone-950 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />

            <div className="flex justify-between text-[11px] text-stone-500 font-mono">
              <span>Rs 300,000 (Small Cafe)</span>
              <span>Rs 7.5M (Popular Brand)</span>
              <span>Rs 15,000,000+ (Multi-branch)</span>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-stone-800">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-white">
                Aggregator Commission Rate (%)
              </label>
              <span className="font-mono text-base font-bold text-amber-300 tabular-nums">
                {aggregatorRate}%
              </span>
            </div>

            <input
              type="range"
              min={20}
              max={35}
              step={1}
              value={aggregatorRate}
              onChange={(e) => setAggregatorRate(Number(e.target.value))}
              className="w-full h-2.5 bg-stone-950 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />

            <div className="flex justify-between text-[11px] text-stone-500 font-mono">
              <span>20% (Low tier)</span>
              <span>28% (Typical Foodpanda cut)</span>
              <span>35% (High tier)</span>
            </div>
          </div>

          {/* Quick presets */}
          <div className="space-y-2 pt-2">
            <span className="text-xs text-stone-400 block font-medium">Quick Volume Presets:</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Single Outlet', sales: 1200000 },
                { label: '3 Outlets', sales: 3500000 },
                { label: 'Flagship Chain', sales: 8000000 },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setMonthlySales(p.sales)}
                  className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition-colors ${
                    monthlySales === p.sales
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Calculated Results Right Column */}
        <div className="lg:col-span-6 space-y-6">
          
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-950/60 via-stone-900 to-stone-900 border-2 border-emerald-500/50 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <TrendingUp className="w-48 h-48 text-emerald-400" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                Estimated Annual Savings with Indolj
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-serif text-3xl sm:text-5xl font-bold text-white tabular-nums">
                  Rs {(annualSavings / 1000000).toFixed(2)} Million
                </span>
                <span className="text-stone-400 text-xs">PKR / year</span>
              </div>
              <p className="text-xs text-emerald-300 mt-2 font-medium">
                That is pure bottom-line profit kept in your restaurant’s bank account!
              </p>
            </div>

            {/* Monthly breakdown */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-stone-950/80 border border-stone-800 text-xs">
              <div>
                <span className="text-stone-500 block">Monthly Aggregator Cut</span>
                <span className="font-mono text-base font-bold text-red-400 tabular-nums">
                  -Rs {aggregatorCostMonthly.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-stone-500 block">Monthly Net Savings</span>
                <span className="font-mono text-base font-bold text-emerald-400 tabular-nums">
                  +Rs {netMonthlySavings.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Strategic Comparison Points */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2.5 text-stone-200">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>0% Commission:</strong> Unlimited direct orders for one flat SaaS fee.</span>
              </div>
              <div className="flex items-center gap-2.5 text-stone-200">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>100% Customer Data Ownership:</strong> Full phone numbers for automated SMS promos.</span>
              </div>
              <div className="flex items-center gap-2.5 text-stone-200">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Instant Cash Settlement:</strong> Direct bank / COD payments without 15-day hold.</span>
              </div>
            </div>

          </div>

          {/* Lead capture demo box */}
          <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800">
            {submitted ? (
              <div className="text-center py-4 space-y-2 text-xs">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-white text-base">
                  Onboarding Request Received!
                </h4>
                <p className="text-stone-400 max-w-sm mx-auto">
                  Our Indolj Karachi Solutions Specialist will contact <strong className="text-white">{restaurantName}</strong> at <strong className="text-white font-mono">{ownerPhone}</strong> within 30 minutes.
                </p>
              </div>
            ) : (
              <form onSubmit={handleDemoSubmit} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Launch Your Branded Ordering Website
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <input
                    type="text"
                    required
                    placeholder="Restaurant Name (e.g. Mehmaan / Daily Deli)"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    className="py-2 px-3 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Owner / Manager Phone (03XX-XXXXXXX)"
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    className="py-2 px-3 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 text-xs font-bold text-stone-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Book Free 1-on-1 Indolj System Demo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
