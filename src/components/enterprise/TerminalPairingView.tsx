import React, { useState } from 'react';
import {
  Monitor,
  ChefHat,
  Smartphone,
  Plus,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Store,
  RefreshCw,
  QrCode,
  Laptop,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const TerminalPairingView: React.FC = () => {
  const { tenant, branches } = useAuth();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const terminals = [
    {
      id: 'term-pos-01',
      name: 'Counter 01 - Cashier Touch POS',
      branch: branches[0]?.name || 'Main Flagship',
      type: 'POS',
      status: 'active',
      pairingCode: 'POS-8921',
      url: `${window.location.origin}/pos`,
      lastHeartbeat: '2 minutes ago',
    },
    {
      id: 'term-kds-01',
      name: 'Kitchen Display Screen (Grill & Karahi)',
      branch: branches[0]?.name || 'Main Flagship',
      type: 'KDS',
      status: 'active',
      pairingCode: 'KDS-3419',
      url: `${window.location.origin}/kds`,
      lastHeartbeat: 'Live streaming',
    },
    {
      id: 'term-storefront-01',
      name: 'Public Customer Storefront Website',
      branch: 'All Outlets',
      type: 'WEB',
      status: 'active',
      pairingCode: 'WEB-DIRECT',
      url: `${window.location.origin}/store/${tenant?.slug || 'mehmaan'}`,
      lastHeartbeat: 'Public CDN Active',
    },
  ];

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Terminal Infrastructure
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300 font-bold border border-emerald-500/20">
              Hardware Pairing Manager
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mt-1">
            Connected POS & Kitchen Display Devices
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Assign physical touch terminals and kitchen screens to branches. Separate dedicated applications for billing and kitchen stations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/pos"
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold rounded-xl text-xs transition-colors shadow-md shadow-emerald-500/15 flex items-center gap-2"
          >
            <Monitor className="w-4 h-4" />
            <span>Launch Standalone POS App</span>
          </a>

          <a
            href="/kds"
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-xl text-xs transition-colors shadow-md shadow-amber-400/15 flex items-center gap-2"
          >
            <ChefHat className="w-4 h-4" />
            <span>Launch Standalone KDS Screen</span>
          </a>
        </div>
      </div>

      {/* Terminal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {terminals.map((term) => (
          <div
            key={term.id}
            className="p-6 rounded-2xl bg-gradient-to-b from-stone-900/80 to-stone-950 border border-white/[0.08] hover:border-emerald-500/30 transition-all shadow-xl flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    term.type === 'POS'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : term.type === 'KDS'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  }`}
                >
                  {term.type === 'POS' && <Monitor className="w-5 h-5" />}
                  {term.type === 'KDS' && <ChefHat className="w-5 h-5" />}
                  {term.type === 'WEB' && <Store className="w-5 h-5" />}
                </div>

                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{term.status.toUpperCase()}</span>
                </span>
              </div>

              <div>
                <h3 className="font-bold text-white text-base">{term.name}</h3>
                <span className="text-xs text-stone-400 block mt-0.5">Outlet: {term.branch}</span>
              </div>

              <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1 text-xs">
                <span className="text-[10px] uppercase text-stone-500 font-mono block">Direct Terminal URL</span>
                <span className="font-mono text-emerald-400 font-bold block truncate">{term.url}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between gap-2">
              <button
                onClick={() => copyToClipboard(term.url, term.id)}
                className="py-1.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer flex-1 justify-center"
              >
                {copiedKey === term.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === term.id ? 'URL Copied!' : 'Copy Device URL'}</span>
              </button>

              <a
                href={term.url}
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1 border border-emerald-500/30 transition-colors"
                title="Open in standalone window"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
