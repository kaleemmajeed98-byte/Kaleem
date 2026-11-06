import React, { useState } from 'react';
import {
  X,
  Globe,
  Terminal,
  ShieldCheck,
  CreditCard,
  Printer,
  MessageSquare,
  Check,
  Copy,
  ExternalLink,
  Server,
  Layers,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface GoLiveSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoLiveSetupModal: React.FC<GoLiveSetupModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<
    'domain' | 'env' | 'deploy' | 'payments' | 'sms' | 'hardware'
  >('domain');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const currentDevUrl = window.location.origin;

  const envContent = `# INDOLJ ENTERPRISE - PRODUCTION ENVIRONMENT (.env.production)
NODE_ENV=production
PORT=3000
APP_URL=https://orders.yourbrand.com

# DATABASE PERSISTENCE (Cloud SQL PostgreSQL / Supabase)
DATABASE_URL=postgresql://indolj_user:SecurePassword@127.0.0.1:5432/indolj_prod?sslmode=require

# PAYMENT GATEWAYS (Pakistan)
JAZZCASH_MERCHANT_ID=MC123456
JAZZCASH_PASSWORD=YourJazzPassword
JAZZCASH_INTEGRITY_SALT=9x8y7z6w5v4u
EASYPAISA_STORE_ID=10924
EASYPAISA_HASH_KEY=ep_live_key_991823

# LOGISTICS & DISPATCH API
BYKEA_API_KEY=byk_live_88491028341
BYKEA_CITY_ID=1 # 1: Karachi, 2: Lahore, 3: Rawalpindi/Islamabad

# SMS GATEWAY & WHATSAPP
BRANDVERSE_SMS_KEY=bv_sec_99120
WHATSAPP_CLOUD_TOKEN=EAAxxxx...
WHATSAPP_PHONE_NUMBER_ID=1092837465`;

  const nginxContent = `server {
    listen 80;
    server_name orders.yourbrand.com yourbrand.pk;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name orders.yourbrand.com yourbrand.pk;

    ssl_certificate /etc/letsencrypt/live/orders.yourbrand.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/orders.yourbrand.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-stone-950/85 backdrop-blur-sm transition-opacity"
      />

      <div className="relative w-full max-w-4xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden z-10 text-stone-100 flex flex-col max-h-[92vh]">
        
        {/* Modal Top Header */}
        <div className="p-6 border-b border-stone-800 flex items-center justify-between shrink-0 bg-stone-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-xl font-bold text-white">
                  Production Deployment & Go-Live Blueprint
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                  Step-by-Step
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Complete technical instructions to point your domain, configure Pakistani gateways, and launch.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-stone-800 bg-stone-950 overflow-x-auto no-scrollbar shrink-0 text-xs">
          {[
            { id: 'domain', label: '1. Custom Domain & DNS', icon: Globe },
            { id: 'deploy', label: '2. Build & Deploy Commands', icon: Terminal },
            { id: 'env', label: '3. Production .env & Secrets', icon: ShieldCheck },
            { id: 'payments', label: '4. Pakistani Payment Gateways', icon: CreditCard },
            { id: 'sms', label: '5. SMS & WhatsApp API', icon: MessageSquare },
            { id: 'hardware', label: '6. Kitchen Printers & KDS', icon: Printer },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-4 rounded-t-xl font-semibold flex items-center gap-2 whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
                  isSel
                    ? 'border-emerald-400 text-emerald-300 bg-stone-900'
                    : 'border-transparent text-stone-400 hover:text-white hover:bg-stone-900/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* TAB 1: DOMAIN & DNS */}
          {activeTab === 'domain' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                <span className="font-bold text-emerald-300 block text-sm">
                  Current Instant Live Cloud Run Preview URL:
                </span>
                <p className="font-mono text-xs text-white bg-stone-950 p-2.5 rounded-lg border border-stone-800 select-all flex items-center justify-between">
                  <span>{currentDevUrl}</span>
                  <button
                    onClick={() => handleCopy(currentDevUrl, 'devurl')}
                    className="text-stone-400 hover:text-white"
                  >
                    {copiedKey === 'devurl' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </p>
                <p className="text-[11px] text-emerald-200/80">
                  Your application is already hosted and accessible via HTTPS worldwide on Google Cloud Run.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-white text-sm">
                  Point Your Custom Domain (e.g. orders.yourbrand.com or yourbrand.pk)
                </h4>
                <p className="text-stone-300 leading-relaxed">
                  Log in to your domain registrar (GoDaddy, PKNIC, Namecheap, or Cloudflare DNS) and add these standard DNS records:
                </p>

                <div className="overflow-x-auto rounded-xl border border-stone-800 bg-stone-950">
                  <table className="w-full text-left font-mono text-[11px]">
                    <thead className="border-b border-stone-800 text-stone-400 bg-stone-900/50">
                      <tr>
                        <th className="py-2.5 px-4">Type</th>
                        <th className="py-2.5 px-4">Host / Name</th>
                        <th className="py-2.5 px-4">Target / Value</th>
                        <th className="py-2.5 px-4">TTL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-900 text-stone-200">
                      <tr>
                        <td className="py-2.5 px-4 text-emerald-400 font-bold">CNAME</td>
                        <td className="py-2.5 px-4">orders</td>
                        <td className="py-2.5 px-4">ghs.googlehosted.com</td>
                        <td className="py-2.5 px-4">Automatic / 3600</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 text-emerald-400 font-bold">A</td>
                        <td className="py-2.5 px-4">@ (Apex)</td>
                        <td className="py-2.5 px-4">216.239.32.21</td>
                        <td className="py-2.5 px-4">Automatic / 3600</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-stone-400 space-y-1">
                  <p className="font-semibold text-stone-200">SSL Certificate:</p>
                  <p>Google Cloud Run and Cloudflare automatically provision free auto-renewing Let's Encrypt / Google Managed SSL certificates as soon as DNS propagates (typically within 15 to 45 minutes).</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DEPLOY COMMANDS */}
          {activeTab === 'deploy' && (
            <div className="space-y-5">
              <div>
                <h4 className="font-bold text-white text-sm">
                  1. Production Build Command
                </h4>
                <p className="text-stone-300 mt-1">
                  Builds the optimized production client bundle with tree-shaking and minification:
                </p>
                <div className="mt-2 p-3 bg-stone-950 rounded-xl border border-stone-800 font-mono text-emerald-300 flex items-center justify-between">
                  <code>npm run build</code>
                  <button
                    onClick={() => handleCopy('npm run build', 'build_cmd')}
                    className="text-stone-400 hover:text-white"
                  >
                    {copiedKey === 'build_cmd' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm">
                  2. VPS Deployment (Ubuntu / Nginx / PM2 Cluster)
                </h4>
                <p className="text-stone-300 mt-1">
                  If hosting on your own Linux server (DigitalOcean, AWS EC2, or local Pakistan data center):
                </p>
                <div className="mt-2 p-3 bg-stone-950 rounded-xl border border-stone-800 font-mono text-stone-300 space-y-1 overflow-x-auto">
                  <p># Install Node 20 LTS & PM2</p>
                  <p className="text-emerald-300">curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -</p>
                  <p className="text-emerald-300">sudo apt-get install -y nodejs</p>
                  <p className="text-emerald-300">npm install -g pm2</p>
                  <p className="text-stone-500"># Start background cluster with auto-restart</p>
                  <p className="text-emerald-300">pm2 start server.ts --name "indolj-saas" -i max --interpreter tsx</p>
                  <p className="text-emerald-300">pm2 save && pm2 startup</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">3. Nginx Reverse Proxy Config (nginx.conf)</h4>
                  <button
                    onClick={() => handleCopy(nginxContent, 'nginx')}
                    className="text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    {copiedKey === 'nginx' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy nginx.conf</span>
                  </button>
                </div>
                <pre className="mt-2 p-3 bg-stone-950 rounded-xl border border-stone-800 font-mono text-[11px] text-stone-300 overflow-x-auto max-h-48">
                  {nginxContent}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: ENV VARIABLES */}
          {activeTab === 'env' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">Production Secrets Configuration (.env.production)</h4>
                  <p className="text-stone-400 mt-0.5">
                    Store these securely in your server environment variables or Cloud Run Secrets Manager.
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(envContent, 'env_copy')}
                  className="py-1.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedKey === 'env_copy' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy .env Blueprint</span>
                </button>
              </div>

              <pre className="p-4 bg-stone-950 rounded-2xl border border-stone-800 font-mono text-[11px] text-emerald-300/90 overflow-x-auto max-h-80 leading-relaxed">
                {envContent}
              </pre>
            </div>
          )}

          {/* TAB 4: PAYMENTS */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <h4 className="font-bold text-white text-sm">
                Pakistani Direct Payment Gateway Setup
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="font-bold text-white">JazzCash Merchant Direct IPG</span>
                  </div>
                  <p className="text-stone-400 text-[11px] leading-relaxed">
                    1. Register on <a href="https://sandbox.jazzcash.com.pk" target="_blank" rel="noreferrer" className="text-amber-400 underline">JazzCash Business Portal</a>.
                    <br />
                    2. Obtain your Merchant ID, Password & Integrity Salt.
                    <br />
                    3. Whitelist your production callback URL: <code className="text-emerald-300">/api/payments/jazzcash/callback</code>.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="font-bold text-white">EasyPaisa Corporate IPG</span>
                  </div>
                  <p className="text-stone-400 text-[11px] leading-relaxed">
                    1. Onboard via Telenor Microfinance Bank Corporate Sales.
                    <br />
                    2. Add Store ID and Hash Key to environment.
                    <br />
                    3. Supports Mobile Wallets, OTC vouchers, and Visa/Mastercard direct debit.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="font-bold text-white">PayFast / Bank Alfalah APG</span>
                  </div>
                  <p className="text-stone-400 text-[11px] leading-relaxed">
                    Zero-redirect checkout for UnionPay, PayPak, Raast Instant P2G and 1Link banks across Pakistan.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="font-bold text-white">Cash on Delivery (COD)</span>
                  </div>
                  <p className="text-stone-400 text-[11px] leading-relaxed">
                    Comes enabled out of the box with optional rider cash collection reconciliation in the Merchant Console.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SMS & WHATSAPP */}
          {activeTab === 'sms' && (
            <div className="space-y-4">
              <h4 className="font-bold text-white text-sm">
                Pakistani SMS & WhatsApp Cloud Notifications
              </h4>
              <p className="text-stone-300 leading-relaxed">
                In Pakistan, direct SMS delivers a 98% open rate. Indolj integrates with PTA-approved masked SMS aggregators (e.g., Sender ID: <code>KABABJEES</code> or <code>MEHMAAN</code>):
              </p>

              <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 space-y-3">
                <span className="font-bold text-emerald-300 block">Recommended SMS Vendors in Pakistan:</span>
                <ul className="space-y-2 text-stone-300">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>BrandVerse / Telecard:</strong> Blazing-fast HTTP API with sub-second OTP delivery for Karachi/Lahore.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Telenor Business & Jazz Business SMS:</strong> Direct telco interconnect for high-volume cricket match promos.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Meta WhatsApp Cloud API:</strong> Send branded WhatsApp receipt with interactive live tracking link.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 6: HARDWARE & PRINTERS */}
          {activeTab === 'hardware' && (
            <div className="space-y-4">
              <h4 className="font-bold text-white text-sm">
                Kitchen Display System (KDS) & Thermal KOT Printers
              </h4>
              <div className="space-y-3 text-stone-300 leading-relaxed">
                <p>
                  Indolj connects directly to standard 80mm ESC/POS thermal receipt printers (Epson, Xprinter, Sunmi, Bixolon) over local WiFi/Ethernet.
                </p>
                <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 font-mono text-[11px] text-stone-300 space-y-1">
                  <p className="text-emerald-400"># Kitchen Printer Network IP Configuration</p>
                  <p>PRINTER_TYPE=escpos_network</p>
                  <p>PRINTER_IP=192.168.1.200</p>
                  <p>PRINTER_PORT=9100</p>
                  <p>KOT_AUTO_PRINT_ON_ACCEPT=true</p>
                </div>
                <p className="text-[11px] text-stone-400">
                  Kitchen staff can mount any standard 10-inch Android tablet running Google Chrome in fullscreen mode to operate the live KDS board without purchasing specialized proprietary hardware.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-950 flex items-center justify-between shrink-0">
          <span className="text-stone-400 text-[11px]">
            Need our white-glove engineering onboarding team? Contact <code className="text-emerald-400">support@indolj.pk</code>
          </span>
          <button
            onClick={onClose}
            className="py-2 px-5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold rounded-xl transition-colors cursor-pointer"
          >
            Done & Return to SaaS
          </button>
        </div>

      </div>
    </div>
  );
};
