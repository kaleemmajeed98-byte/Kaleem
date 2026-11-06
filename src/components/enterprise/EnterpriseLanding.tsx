import React, { useState } from 'react';
import {
  Flame,
  Check,
  ArrowRight,
  TrendingUp,
  Store,
  Smartphone,
  Cpu,
  Bike,
  MessageSquare,
  ShieldCheck,
  Building2,
  Users,
  ChevronRight,
  Sparkles,
  Calculator,
  Rocket,
} from 'lucide-react';
import { PRICING_TIERS } from '../../data/saasData';

interface EnterpriseLandingProps {
  onOpenConsole: () => void;
  onOpenStorefrontDemo: () => void;
  onOpenGoLiveModal: () => void;
}

export const EnterpriseLanding: React.FC<EnterpriseLandingProps> = ({
  onOpenConsole,
  onOpenStorefrontDemo,
  onOpenGoLiveModal,
}) => {
  const [isAnnual, setIsAnnual] = useState<boolean>(true);
  const [calculatorSales, setCalculatorSales] = useState<number>(3000000); // 3M PKR / mo
  const [calculatorRate, setCalculatorRate] = useState<number>(28); // 28% Foodpanda
  const [activePreviewTab, setActivePreviewTab] = useState<'storefront' | 'kds' | 'fleet' | 'crm'>('storefront');

  // ROI math
  const monthlyAggregatorFee = Math.round((calculatorSales * calculatorRate) / 100);
  const monthlyNetSavings = Math.max(0, monthlyAggregatorFee - 24999);
  const annualSavings = monthlyNetSavings * 12;

  const brands = [
    'Kababjees Group',
    'Ginsoy Extreme Chinese',
    'California Pizza',
    'Mehmaan Restaurant',
    'Daily Deli Co.',
    'Kaybees',
  ];

  return (
    <div className="space-y-24 pb-24 overflow-hidden">
      
      {/* HERO SECTION */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-12 lg:pt-20">
        {/* Ambient Radial Lighting Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-emerald-500/15 via-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-4xl mx-auto space-y-6">
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-lg shadow-emerald-500/5 backdrop-blur-md">
              <Flame className="w-4 h-4 fill-emerald-400 animate-pulse" />
              <span>Pakistan’s #1 Direct Restaurant Online Ordering & Cloud POS Architecture</span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] text-balance">
              Take Back Your Brand. <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent italic">Retain 100% of Your Revenue.</span>
            </h1>

            <p className="text-base sm:text-xl text-stone-300 font-light max-w-2xl mx-auto leading-relaxed">
              Indolj equips restaurant chains across Pakistan with custom branded web storefronts, native iOS & Android apps, kitchen display systems (KDS), and rider dispatch—with <strong className="font-semibold text-white">0% commission</strong>.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                onClick={onOpenConsole}
                className="py-3.5 px-7 text-xs sm:text-sm font-bold text-stone-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-xl shadow-emerald-500/20 cursor-pointer flex items-center gap-2 active:scale-95"
              >
                <span>Launch Live Operator Console</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenStorefrontDemo}
                className="py-3.5 px-6 text-xs sm:text-sm font-bold text-white hover:text-emerald-300 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-xl transition-all cursor-pointer flex items-center gap-2 active:scale-95"
              >
                <Store className="w-4 h-4 text-emerald-400" />
                <span>Experience Customer Storefront</span>
              </button>

              <button
                onClick={onOpenGoLiveModal}
                className="py-3.5 px-5 text-xs sm:text-sm font-semibold text-stone-300 hover:text-white bg-emerald-950/40 hover:bg-emerald-950/80 border border-emerald-900/60 rounded-xl transition-all cursor-pointer flex items-center gap-2"
              >
                <Rocket className="w-4 h-4 text-emerald-400" />
                <span>Go-Live Setup Guide</span>
              </button>
            </div>

          </div>

          {/* Interactive Live Product Preview Showcase */}
          <div className="rounded-3xl border border-stone-800 bg-stone-900 shadow-2xl overflow-hidden">
            
            {/* Window Top Bar with Tabs */}
            <div className="px-6 py-4 bg-stone-950 border-b border-stone-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-stone-400 text-xs font-mono ml-2">indolj.enterprise.cloud</span>
              </div>

              {/* Showcase switcher */}
              <div className="flex items-center gap-1 p-1 bg-stone-900 rounded-lg text-xs">
                {[
                  { id: 'storefront', label: '1. Customer Web Store' },
                  { id: 'kds', label: '2. Kitchen KDS Display' },
                  { id: 'fleet', label: '3. Rider Geofence Dispatch' },
                  { id: 'crm', label: '4. Automated SMS Studio' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActivePreviewTab(t.id as any)}
                    className={`py-1 px-3 rounded-md font-semibold transition-colors cursor-pointer ${
                      activePreviewTab === t.id
                        ? 'bg-emerald-500 text-stone-950 shadow-sm'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Preview Canvas */}
            <div className="p-6 sm:p-10 bg-stone-900/40 min-h-[380px] flex items-center justify-center">
              
              {activePreviewTab === 'storefront' && (
                <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  <div className="md:col-span-6 space-y-4">
                    <span className="px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-300 font-mono text-xs font-bold">
                      Direct Web & Native App Storefront
                    </span>
                    <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
                      Instant Sub-Second Ordering Experience
                    </h3>
                    <p className="text-xs text-stone-300 leading-relaxed font-light">
                      Equip your restaurant brand with a branded digital storefront. Direct branch routing across Karachi, live deal vouchers, and 1-click checkout via JazzCash and EasyPaisa.
                    </p>
                    <button
                      onClick={onOpenStorefrontDemo}
                      className="py-2 px-4 bg-emerald-400 text-stone-950 font-bold text-xs rounded-xl hover:bg-emerald-300 transition-colors cursor-pointer"
                    >
                      Try Interactive Storefront Demo →
                    </button>
                  </div>
                  <div className="md:col-span-6 rounded-2xl overflow-hidden border border-stone-800 shadow-xl">
                    <img
                      src="/src/assets/images/food_bbq_platter_1793901968953.jpg"
                      alt="Indolj Direct Ordering Storefront Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                </div>
              )}

              {activePreviewTab === 'kds' && (
                <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  <div className="md:col-span-6 space-y-4">
                    <span className="px-2.5 py-1 rounded bg-amber-500/15 text-amber-300 font-mono text-xs font-bold">
                      Kitchen Display System (KDS)
                    </span>
                    <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
                      Eliminate Paper Delays & Human Errors
                    </h3>
                    <p className="text-xs text-stone-300 leading-relaxed font-light">
                      Incoming orders flash on kitchen tablet screens with loud sound chimes. Chefs track cooking times on charcoal grills and tandoors while orders auto-route to thermal packing counters.
                    </p>
                    <button
                      onClick={onOpenConsole}
                      className="py-2 px-4 bg-emerald-400 text-stone-950 font-bold text-xs rounded-xl hover:bg-emerald-300 transition-colors cursor-pointer"
                    >
                      View Live KDS Screen →
                    </button>
                  </div>
                  <div className="md:col-span-6 p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-3 font-mono text-xs">
                    <div className="flex justify-between text-stone-400 border-b border-stone-800 pb-2">
                      <span className="text-emerald-400 font-bold">KOT #IND-9041</span>
                      <span className="text-amber-400">Cooking: 18m left</span>
                    </div>
                    <p className="text-white font-sans font-bold">1x Royal Charcoal Mixed BBQ Platter</p>
                    <p className="text-stone-400 font-sans">4x Special Sesame Roghani Naan</p>
                    <p className="text-stone-400 font-sans">2x Fresh Mint Lemonade Cooler</p>
                    <div className="pt-2 text-[10px] text-stone-500 border-t border-stone-900">
                      Destination: PECHS Block 2 · JazzCash Paid
                    </div>
                  </div>
                </div>
              )}

              {activePreviewTab === 'fleet' && (
                <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  <div className="md:col-span-6 space-y-4">
                    <span className="px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-300 font-mono text-xs font-bold">
                      Fleet Management & Geofencing
                    </span>
                    <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
                      Own Your Logistics or Tap Bykea on Demand
                    </h3>
                    <p className="text-xs text-stone-300 leading-relaxed font-light">
                      Dispatch your in-house motorcycle delivery riders with turnkey turn-by-turn mobile navigation. When rush-hour cricket matches hit, trigger automated Bykea Express riders via API.
                    </p>
                  </div>
                  <div className="md:col-span-6 p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                      <span className="font-bold text-white">Active Motorcycle Fleet</span>
                      <span className="text-emerald-400 font-mono font-bold">4 Riders Online</span>
                    </div>
                    <div className="space-y-2">
                      <div className="p-2.5 bg-stone-900 rounded-lg flex justify-between items-center">
                        <span>Tariq Khan (Honda 125)</span>
                        <span className="text-emerald-400 font-mono">En Route (PECHS)</span>
                      </div>
                      <div className="p-2.5 bg-stone-900 rounded-lg flex justify-between items-center">
                        <span>Farhan Saeed (YBR 125)</span>
                        <span className="text-emerald-400 font-mono">En Route (DHA)</span>
                      </div>
                      <div className="p-2.5 bg-stone-900 rounded-lg flex justify-between items-center text-stone-400">
                        <span>Bykea API Backup</span>
                        <span className="text-stone-500 font-mono">Standby</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activePreviewTab === 'crm' && (
                <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  <div className="md:col-span-6 space-y-4">
                    <span className="px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-300 font-mono text-xs font-bold">
                      Customer Retention & SMS CRM
                    </span>
                    <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
                      Your Customers. Your Data. Zero Masking.
                    </h3>
                    <p className="text-xs text-stone-300 leading-relaxed font-light">
                      Third-party aggregators hide customer phone numbers. With Indolj, you own 100% of customer contact records, enabling automated Friday SMS campaigns and VIP rewards.
                    </p>
                  </div>
                  <div className="md:col-span-6 p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-3 text-xs">
                    <div className="flex justify-between items-center border-b border-stone-800 pb-2">
                      <span className="font-bold text-white">PTA Masked SMS Campaign</span>
                      <span className="text-emerald-400 font-mono font-bold">98% Open Rate</span>
                    </div>
                    <div className="p-3 bg-stone-900 rounded-xl text-stone-300 text-xs italic">
                      "Salam! Savor your weekend with Royal BBQ. Use code INDOLJ20 for flat 20% OFF on direct delivery. Order now: orders.kababjees.com"
                    </div>
                    <div className="flex justify-between text-[11px] text-stone-400 pt-1">
                      <span>Audience: 14,820 VIP Diners</span>
                      <span className="text-emerald-300 font-bold">Revenue: Rs 1.41M</span>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* Social Proof Brand Logos Strip */}
          <div className="pt-4 border-t border-stone-800/80">
            <span className="text-[11px] text-stone-500 uppercase tracking-widest font-semibold block text-center mb-6">
              Empowering High-Volume Food Chains Across Karachi, Lahore & Islamabad
            </span>
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-stone-400 font-serif text-sm">
              {brands.map((brand) => (
                <span key={brand} className="hover:text-white transition-colors cursor-default">
                  {brand}
                </span>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* METRIC IMPACT BANNER */}
      <section className="border-y border-stone-800 bg-stone-900/30 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="font-mono text-3xl sm:text-5xl font-bold text-white tabular-nums">
                Rs 4.8B+
              </div>
              <span className="text-xs text-stone-400 mt-1 block">GMV Processed in Pakistan</span>
            </div>
            <div>
              <div className="font-mono text-3xl sm:text-5xl font-bold text-emerald-400 tabular-nums">
                0%
              </div>
              <span className="text-xs text-stone-400 mt-1 block">Aggregator Commission</span>
            </div>
            <div>
              <div className="font-mono text-3xl sm:text-5xl font-bold text-white tabular-nums">
                2,500+
              </div>
              <span className="text-xs text-stone-400 mt-1 block">Restaurant Outlets Active</span>
            </div>
            <div>
              <div className="font-mono text-3xl sm:text-5xl font-bold text-amber-300 tabular-nums">
                18M+
              </div>
              <span className="text-xs text-stone-400 mt-1 block">Direct Meals Delivered</span>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE COMMISSION ROI CALCULATOR */}
      <section id="roi" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            Interactive Commission Calculator
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
            Calculate Exactly What You Save vs. Foodpanda
          </h2>
          <p className="text-stone-300 text-sm font-light">
            Third-party delivery aggregators take 28% from your hard-earned restaurant turnover. See what happens when that money stays in your bank.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-6 p-8 rounded-3xl bg-stone-900 border border-stone-800 space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-white">Monthly Delivery Sales (PKR)</span>
                <span className="font-mono font-bold text-emerald-400 text-sm tabular-nums">
                  Rs {calculatorSales.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={500000}
                max={15000000}
                step={100000}
                value={calculatorSales}
                onChange={(e) => setCalculatorSales(Number(e.target.value))}
                className="w-full h-2.5 bg-stone-950 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            <div className="space-y-3 pt-3 border-t border-stone-800">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-white">Aggregator Commission Rate (%)</span>
                <span className="font-mono font-bold text-amber-300 text-sm tabular-nums">
                  {calculatorRate}%
                </span>
              </div>
              <input
                type="range"
                min={20}
                max={32}
                step={1}
                value={calculatorRate}
                onChange={(e) => setCalculatorRate(Number(e.target.value))}
                className="w-full h-2.5 bg-stone-950 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>
          </div>

          <div className="lg:col-span-6 p-8 rounded-3xl bg-gradient-to-br from-emerald-950/70 via-stone-900 to-stone-900 border-2 border-emerald-500/50 space-y-6 shadow-2xl">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                Net Annual Profit Kept With Indolj
              </span>
              <div className="font-display text-4xl sm:text-6xl font-bold text-white tabular-nums mt-1">
                Rs {(annualSavings / 1000000).toFixed(2)} Million
              </div>
              <span className="text-stone-300 text-xs mt-1 block">
                Pure bottom-line profit retained in your restaurant’s bank account every single year.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-stone-950/80 border border-stone-800 text-xs">
              <div>
                <span className="text-stone-500 block">Monthly Aggregator Loss</span>
                <span className="font-mono text-base font-bold text-red-400 tabular-nums">
                  -Rs {monthlyAggregatorFee.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-stone-500 block">Monthly Savings with Indolj</span>
                <span className="font-mono text-base font-bold text-emerald-400 tabular-nums">
                  +Rs {monthlyNetSavings.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={onOpenConsole}
              className="w-full py-3 px-4 bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
            >
              Start Retaining 100% of Your Revenue →
            </button>
          </div>

        </div>
      </section>

      {/* PRICING PLANS */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            Transparent Pricing
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
            0% Commission. Flat SaaS Subscription.
          </h2>
          <p className="text-stone-400 text-xs sm:text-sm">
            Keep every rupee of your customer orders. Choose monthly billing or save 20% on annual commitments.
          </p>

          {/* Billing Switcher */}
          <div className="inline-flex items-center gap-2 p-1 bg-stone-900 rounded-xl border border-stone-800 text-xs mt-4">
            <button
              onClick={() => setIsAnnual(false)}
              className={`py-1.5 px-4 rounded-lg font-semibold transition-colors ${
                !isAnnual ? 'bg-emerald-500 text-stone-950' : 'text-stone-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`py-1.5 px-4 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                isAnnual ? 'bg-emerald-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-400 text-stone-950 font-bold">
                20% OFF
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {PRICING_TIERS.map((tier) => {
            const price = isAnnual ? tier.annualPricePkr : tier.monthlyPricePkr;
            return (
              <div
                key={tier.id}
                className={`p-8 rounded-3xl border flex flex-col justify-between transition-all ${
                  tier.popular
                    ? 'bg-stone-900/90 border-emerald-500/80 shadow-2xl relative scale-102'
                    : 'bg-stone-900/50 border-stone-800 hover:border-stone-700'
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-400 text-stone-950 font-bold text-[10px] rounded-full uppercase tracking-wider shadow-md">
                    Most Popular for Growing Chains
                  </span>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="font-display text-xl font-bold text-white">{tier.name}</h3>
                    <p className="text-stone-400 text-xs mt-1 leading-relaxed">{tier.audience}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-3xl sm:text-4xl font-bold text-white tabular-nums">
                        Rs {price.toLocaleString()}
                      </span>
                      <span className="text-stone-400 text-xs">/ month</span>
                    </div>
                    <span className="text-xs font-semibold text-emerald-400 block">
                      {tier.commission}
                    </span>
                  </div>

                  <div className="space-y-2.5 pt-4 border-t border-stone-800 text-xs">
                    {tier.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-stone-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8">
                  <button
                    onClick={onOpenConsole}
                    className={`w-full py-3 px-4 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      tier.popular
                        ? 'bg-emerald-400 hover:bg-emerald-300 text-stone-950 shadow-md'
                        : 'bg-stone-800 hover:bg-stone-700 text-white border border-stone-700'
                    }`}
                  >
                    Select {tier.name} Plan
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* PAKISTAN RESTAURANT CASE STUDIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-stone-900 border border-stone-800 space-y-8">
          <div className="max-w-xl">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Verified Case Study
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mt-1">
              "We Retained Rs 8.4 Million in Margin During Our First 6 Months with Indolj."
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="p-5 bg-stone-950 rounded-2xl border border-stone-800/80 space-y-1">
              <span className="text-stone-500 block">Direct Order Volume</span>
              <span className="font-mono text-2xl font-bold text-white tabular-nums">64%</span>
              <p className="text-stone-400 text-[11px]">Shifted from Foodpanda to direct website</p>
            </div>

            <div className="p-5 bg-stone-950 rounded-2xl border border-stone-800/80 space-y-1">
              <span className="text-stone-500 block">Average Order Value</span>
              <span className="font-mono text-2xl font-bold text-emerald-400 tabular-nums">+42%</span>
              <p className="text-stone-400 text-[11px]">Bigger family deals via direct storefront</p>
            </div>

            <div className="p-5 bg-stone-950 rounded-2xl border border-stone-800/80 space-y-1">
              <span className="text-stone-500 block">Kitchen Ticket SLA</span>
              <span className="font-mono text-2xl font-bold text-amber-300 tabular-nums">18 Mins</span>
              <p className="text-stone-400 text-[11px]">Direct thermal KOT printing on arrival</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
