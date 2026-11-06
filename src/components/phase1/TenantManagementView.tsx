import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  ShieldCheck,
  Search,
  Filter,
  Check,
  AlertTriangle,
  History,
  TrendingUp,
  X,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Sliders,
  DollarSign,
  AlertCircle,
  FileText,
  Store,
} from 'lucide-react';
import { useAuth, AuthTenant } from '../../context/AuthContext';
import { Button, PageHeader } from '../ui/EnterpriseUI';

interface TenantManagementViewProps {
  onOpenStorefront?: (slug: string) => void;
}

export const TenantManagementView: React.FC<TenantManagementViewProps> = ({ onOpenStorefront }) => {
  const { token, user } = useAuth();
  const [tenants, setTenants] = useState<AuthTenant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState<boolean>(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState<boolean>(false);

  // New Tenant Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    legalBusinessName: '',
    taxIdentifier: '',
    currency: 'PKR',
    subscriptionTier: 'growth',
    primaryContactName: '',
    primaryContactEmail: '',
    primaryContactPhone: '',
    initialBranchName: '',
    initialBranchCity: 'Karachi',
    initialBranchAddress: '',
    adminPassword: '',
    adminPin: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchTenants = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/v1/tenants', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setTenants(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      setAuditLoading(true);
      const res = await fetch('/api/v1/audit-logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setAuditLogs(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchTenants();
  }, [token]);

  const handleStatusToggle = async (tenant: AuthTenant) => {
    const nextStatus = tenant.status === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch(`/api/v1/tenants/${tenant.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setTenants((prev) =>
          prev.map((t) => (t.id === tenant.id ? { ...t, status: nextStatus } : t))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTierChange = async (tenantId: string, newTier: 'starter' | 'growth' | 'enterprise') => {
    try {
      const res = await fetch(`/api/v1/tenants/${tenantId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subscriptionTier: newTier }),
      });
      const data = await res.json();
      if (data.success) {
        setTenants((prev) =>
          prev.map((t) =>
            t.id === tenantId
              ? {
                  ...t,
                  subscriptionTier: newTier,
                  maxBranches: newTier === 'starter' ? 1 : newTier === 'growth' ? 5 : 25,
                }
              : t
          )
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/v1/tenants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!data.success) {
        setFormError(data.error?.message || 'Failed to onboard restaurant tenant');
        setIsSubmitting(false);
        return;
      }

      setFormSuccess(`🎉 Restaurant "${formData.name}" onboarded! Live website ready at /store/${formData.slug.toLowerCase()}`);
      setTimeout(() => {
        setIsOnboardModalOpen(false);
        setFormSuccess(null);
        fetchTenants();
      }, 2200);
    } catch (e: any) {
      setFormError(e.message || 'Network communication error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.primaryContactEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalBranches = tenants.reduce((sum, t) => sum + (t.branchCount || 0), 0);
  const totalGmv = tenants.reduce((sum, t) => sum + (t.monthlyGmv || 0), 0);

  return (
    <div className="erp-page space-y-8">
      
      {/* Platform Level Header & KPI Strip */}
      <PageHeader
        eyebrow="Platform administration"
        title="Restaurant tenants"
        description="Manage tenant accounts, subscription tiers, branch limits, business details, and recorded audit events."
        actions={
          <>
            <Button
              variant="secondary"
              icon={<History className="h-4 w-4" />}
            onClick={() => {
              fetchAuditLogs();
              setIsAuditModalOpen(true);
            }}
            >
              Audit logs
            </Button>
            <Button
              variant="primary"
              icon={<Plus className="h-4 w-4" />}
            onClick={() => setIsOnboardModalOpen(true)}
            >
              Onboard restaurant
            </Button>
          </>
        }
      />

      {/* 4-Column Platform Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-stone-900/90 to-stone-950 border border-white/[0.08] hover:border-emerald-500/30 transition-all shadow-xl group space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-400 font-medium">Registered Brands</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-mono text-3xl font-bold text-white tabular-nums tracking-tight">
              {tenants.length}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-emerald-400 font-medium">
              {tenants.filter((t) => t.status === 'active').length} active accounts
              </span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-stone-900/90 to-stone-950 border border-white/[0.08] hover:border-emerald-500/30 transition-all shadow-xl group space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-400 font-medium">Registered outlets</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-mono text-3xl font-bold text-white tabular-nums tracking-tight">
              {totalBranches}
            </div>
            <span className="text-[11px] text-stone-400 block mt-1">
              Across tenant accounts
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-stone-900/90 to-stone-950 border border-white/[0.08] hover:border-emerald-500/30 transition-all shadow-xl group space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-400 font-medium">Reported monthly GMV</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-mono text-3xl font-bold text-emerald-400 tabular-nums tracking-tight">
              Rs {(totalGmv / 1000000).toFixed(1)}M
            </div>
            <span className="text-[11px] text-stone-400 block mt-1">
              Sum of tenant profile values
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-stone-900/90 to-stone-950 border border-white/[0.08] hover:border-emerald-500/30 transition-all shadow-xl group space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-400 font-medium">Security & Tenant Partition</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-display text-xl font-bold text-white mt-1">
              Tenant-aware API
            </div>
            <span className="text-[11px] text-emerald-400 block mt-1">
              Role-checked workspace access
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 bg-stone-900/80 rounded-2xl border border-white/[0.06] backdrop-blur-md">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company name, slug, email..."
            className="w-full pl-10 pr-4 py-2 bg-stone-950/80 border border-stone-800 rounded-xl text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-stone-400 font-medium">Status:</span>
          {['all', 'active', 'trial', 'suspended'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`py-1.5 px-3 rounded-lg capitalize transition-all cursor-pointer font-medium ${
                statusFilter === st
                  ? 'bg-emerald-500 text-stone-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-stone-950/80 text-stone-400 hover:text-white border border-stone-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* High-Density Restaurant Company Table */}
      <div className="rounded-2xl border border-stone-800 bg-stone-900/40 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-950 border-b border-stone-800 text-stone-400 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Restaurant Company</th>
                <th className="py-3.5 px-4">Plan & Outlets</th>
                <th className="py-3.5 px-4">Tax ID (NTN)</th>
                <th className="py-3.5 px-4">Primary Contact</th>
                <th className="py-3.5 px-4">Reported GMV</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 text-stone-300">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-500">
                    No restaurant companies match your search.
                  </td>
                </tr>
              ) : (
                filteredTenants.map((t) => (
                  <tr key={t.id} className="hover:bg-stone-900/60 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-400 font-display">
                          {t.logoInitial}
                        </div>
                        <div>
                          <span className="font-bold text-white block text-sm">{t.name}</span>
                          <span className="text-[11px] font-mono text-stone-400">
                            {t.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <select
                          value={t.subscriptionTier}
                          onChange={(e) => handleTierChange(t.id, e.target.value as any)}
                          className="bg-stone-950 border border-stone-800 rounded px-2 py-1 text-[11px] font-semibold text-emerald-300 capitalize cursor-pointer focus:outline-none focus:border-emerald-500"
                        >
                          <option value="starter">Starter (1 Branch)</option>
                          <option value="growth">Growth (5 Branches)</option>
                          <option value="enterprise">Enterprise (25 Branches)</option>
                        </select>
                        <span className="text-[11px] text-stone-400 block">
                          {t.branchCount || 0} / {t.maxBranches} branches active
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono text-[11px] text-stone-300">
                      {t.taxIdentifier || 'NTN-PENDING'}
                    </td>

                    <td className="py-4 px-4 text-xs">
                      <span className="text-white font-medium block">{t.primaryContactName}</span>
                      <span className="text-stone-400 text-[11px]">{t.primaryContactEmail}</span>
                    </td>

                    <td className="py-4 px-4 font-mono font-bold text-white tabular-nums">
                      Rs {(t.monthlyGmv || 0).toLocaleString()}
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
                          t.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : t.status === 'trial'
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{t.status}</span>
                      </span>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (onOpenStorefront) {
                              onOpenStorefront(t.slug);
                            } else {
                              window.history.pushState({}, '', `/store/${t.slug}`);
                              window.dispatchEvent(new PopStateEvent('popstate'));
                            }
                          }}
                          className="py-1 px-2.5 text-[11px] font-semibold rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                          title={`View ${t.name} Customer Storefront`}
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Website</span>
                        </button>

                        <button
                          onClick={() => handleStatusToggle(t)}
                          className={`py-1 px-3 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                            t.status === 'active'
                              ? 'bg-stone-800 hover:bg-red-500/20 text-stone-300 hover:text-red-300 border border-stone-700'
                              : 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold'
                          }`}
                        >
                          {t.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ONBOARD RESTAURANT COMPANY MODAL */}
      {isOnboardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsOnboardModalOpen(false)}
            className="absolute inset-0 bg-stone-950/85 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden z-10 text-stone-100 flex flex-col max-h-[90vh]">
            
            <div className="p-6 border-b border-stone-800 flex items-center justify-between shrink-0 bg-stone-950">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-white">
                    Onboard New Restaurant Company
                  </h3>
                  <p className="text-xs text-stone-400">
                    Creates a restaurant account with business details and the selected subscription tier.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOnboardModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              
              {formError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-300 font-medium block mb-1">Company / Brand Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vintage Cafe"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''),
                      })
                    }
                    className="w-full py-2 px-3 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-stone-300 font-medium block mb-1">Tenant Subdomain Slug</label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      required
                      placeholder="vintage"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
                      className="w-full py-2 px-3 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-300 font-medium block mb-1">Legal Registered Business Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Vintage Hospitality (Pvt) Ltd"
                    value={formData.legalBusinessName}
                    onChange={(e) => setFormData({ ...formData, legalBusinessName: e.target.value })}
                    className="w-full py-2 px-3 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-stone-300 font-medium block mb-1">Tax NTN / STRN</label>
                  <input
                    type="text"
                    placeholder="NTN-XXXXXXX-X"
                    value={formData.taxIdentifier}
                    onChange={(e) => setFormData({ ...formData, taxIdentifier: e.target.value })}
                    className="w-full py-2 px-3 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-300 font-medium block mb-1">Subscription Plan Tier</label>
                  <select
                    value={formData.subscriptionTier}
                    onChange={(e) => setFormData({ ...formData, subscriptionTier: e.target.value as any })}
                    className="w-full py-2 px-3 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="starter">Starter (1 Branch · Rs 14,999/mo)</option>
                    <option value="growth">Growth (5 Branches · Rs 29,999/mo)</option>
                    <option value="enterprise">Enterprise (25 Branches · Rs 59,999/mo)</option>
                  </select>
                </div>

                <div>
                  <label className="text-stone-300 font-medium block mb-1">Primary Contact Email</label>
                  <input
                    type="email"
                    required
                    placeholder="owner@vintage.pk"
                    value={formData.primaryContactEmail}
                    onChange={(e) => setFormData({ ...formData, primaryContactEmail: e.target.value })}
                    className="w-full py-2 px-3 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-stone-800 space-y-3">
                <span className="font-bold text-white block">Initial Branch & Owner Account</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-stone-400 block mb-1">Branch Name</label>
                    <input
                      type="text"
                      placeholder="e.g. DHA Phase 5 Branch"
                      value={formData.initialBranchName}
                      onChange={(e) => setFormData({ ...formData, initialBranchName: e.target.value })}
                      className="w-full py-2 px-3 bg-stone-950 border border-stone-800 rounded-lg text-stone-200"
                    />
                  </div>
                  <div>
                    <label className="text-stone-400 block mb-1">City</label>
                    <input
                      type="text"
                      placeholder="Karachi / Lahore"
                      value={formData.initialBranchCity}
                      onChange={(e) => setFormData({ ...formData, initialBranchCity: e.target.value })}
                      className="w-full py-2 px-3 bg-stone-950 border border-stone-800 rounded-lg text-stone-200"
                    />
                  </div>
                  <div>
                    <label className="text-stone-400 block mb-1">Owner Password</label>
                    <input
                      type="password"
                      required
                      minLength={12}
                      placeholder="At least 12 characters"
                      value={formData.adminPassword}
                      onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                      className="w-full py-2 px-3 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-stone-400 block mb-1">Owner 6-Digit Quick PIN</label>
                    <input
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      required
                      placeholder="6 digits"
                      value={formData.adminPin}
                      onChange={(e) => setFormData({ ...formData, adminPin: e.target.value.replace(/\D/g, '') })}
                      className="w-full py-2 px-3 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOnboardModalOpen(false)}
                  className="py-2.5 px-4 bg-stone-800 text-stone-400 hover:text-white rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2.5 px-6 bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Onboarding Tenant...' : 'Confirm & Launch Tenant'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* AUDIT TRAIL LOGS MODAL */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsAuditModalOpen(false)}
            className="absolute inset-0 bg-stone-950/85 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-4xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden z-10 text-stone-100 flex flex-col max-h-[85vh]">
            
            <div className="p-6 border-b border-stone-800 flex items-center justify-between shrink-0 bg-stone-950">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-white">
                    Recorded audit logs
                  </h3>
                  <p className="text-xs text-stone-400">
                    Audit events currently available to this platform account.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3 flex-1 text-xs">
              {auditLoading ? (
                <div className="py-12 text-center text-stone-500">Loading audit records...</div>
              ) : auditLogs.length === 0 ? (
                <div className="py-12 text-center text-stone-500">No audit events recorded yet.</div>
              ) : (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 bg-stone-950 rounded-xl border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-400">{log.action}</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-stone-900 text-stone-300 rounded font-mono">
                          {log.entityType} #{log.entityId.slice(0, 8)}
                        </span>
                      </div>
                      <p className="text-stone-400 text-[11px]">
                        Triggered by: <strong className="text-white">{log.userEmail}</strong> · IP: {log.ipAddress}
                      </p>
                      {log.details && (
                        <p className="font-mono text-[10px] text-stone-500 truncate max-w-lg">
                          {JSON.stringify(log.details)}
                        </p>
                      )}
                    </div>

                    <span className="text-[10px] text-stone-500 font-mono shrink-0">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
