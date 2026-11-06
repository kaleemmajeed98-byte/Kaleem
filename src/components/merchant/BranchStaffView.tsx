import React, { useState, useEffect } from 'react';
import {
  Building,
  Users,
  Plus,
  MapPin,
  Phone,
  Clock,
  Lock,
  Check,
  AlertCircle,
  X,
  Shield,
  Smartphone,
  ChevronRight,
} from 'lucide-react';
import { useAuth, AuthBranch } from '../../context/AuthContext';

export const BranchStaffView: React.FC = () => {
  const { user, tenant, branches, switchBranch, token, refreshProfile } = useAuth();
  const hasPermission = (...permissions: string[]) =>
    !!user &&
    (user.permissions.includes('*') ||
      permissions.some((permission) => user.permissions.includes(permission)));
  const canManageBranches = hasPermission('branches.create');
  const canManageStaff = hasPermission('tenants.manage');

  const [activeTab, setActiveTab] = useState<'branches' | 'staff'>('branches');
  const [staffList, setStaffList] = useState<any[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState<boolean>(true);

  // New Branch Modal
  const [isAddBranchOpen, setIsAddBranchOpen] = useState<boolean>(false);
  const [branchFormData, setBranchFormData] = useState({
    name: '',
    code: '',
    city: 'Karachi',
    address: '',
    phone: '',
    email: '',
    deliveryRadiusKm: 8.5,
    minOrderAmount: 800,
    standardDeliveryFee: 120,
    openingTime: '12:00:00',
    closingTime: '01:30:00',
  });
  const [branchError, setBranchError] = useState<string | null>(null);
  const [branchSuccess, setBranchSuccess] = useState<string | null>(null);

  // New Staff Modal
  const [isAddStaffOpen, setIsAddStaffOpen] = useState<boolean>(false);
  const [staffFormData, setStaffFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'CASHIER',
    pin: '',
    password: '',
    primaryBranchId: '',
  });
  const [staffError, setStaffError] = useState<string | null>(null);
  const [staffSuccess, setStaffSuccess] = useState<string | null>(null);

  const fetchStaff = async () => {
    if (!token) return;
    try {
      setIsLoadingStaff(true);
      const res = await fetch(`/api/v1/users?tenantId=${tenant?.id || ''}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setStaffList(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingStaff(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [token, tenant]);

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    setBranchError(null);
    setBranchSuccess(null);

    try {
      const res = await fetch('/api/v1/branches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...branchFormData,
          tenantId: tenant?.id,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setBranchError(data.error?.message || 'Failed to create branch');
        return;
      }

      setBranchSuccess(data.message || 'Branch added successfully!');
      setTimeout(() => {
        setIsAddBranchOpen(false);
        setBranchSuccess(null);
        refreshProfile();
      }, 1200);
    } catch (e: any) {
      setBranchError(e.message || 'Network error');
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffError(null);
    setStaffSuccess(null);

    try {
      const res = await fetch('/api/v1/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...staffFormData,
          tenantId: tenant?.id,
          ...(staffFormData.role === 'AUDITOR'
            ? { permissions: ['audit.view', 'reports.financial.view', 'compliance.export'] }
            : {}),
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setStaffError(data.error?.message || 'Failed to create staff');
        return;
      }

      setStaffSuccess(data.message || 'Staff member created successfully!');
      setTimeout(() => {
        setIsAddStaffOpen(false);
        setStaffSuccess(null);
        fetchStaff();
      }, 1200);
    } catch (e: any) {
      setStaffError(e.message || 'Network error');
    }
  };

  return (
    <div className="erp-page space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Restaurant ERP Controls
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300 font-bold">
              {tenant?.subscriptionTier?.toUpperCase()} PLAN
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mt-1">
            Branches & Staff Accounts
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Manage multi-outlet locations, delivery geofences, staff roles, and outlet assignments.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-stone-900 rounded-xl border border-stone-800 text-xs">
            <button
              onClick={() => setActiveTab('branches')}
              className={`py-1.5 px-3.5 rounded-lg font-bold transition-colors cursor-pointer ${
                activeTab === 'branches'
                  ? 'bg-emerald-500 text-stone-950 shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Branches ({branches.length})
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`py-1.5 px-3.5 rounded-lg font-bold transition-colors cursor-pointer ${
                activeTab === 'staff'
                  ? 'bg-emerald-500 text-stone-950 shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Staff & Cashiers ({staffList.length})
            </button>
          </div>

          {activeTab === 'branches' && canManageBranches ? (
            <button
              onClick={() => setIsAddBranchOpen(true)}
              className="py-2.5 px-4 bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-bold rounded-xl text-xs transition-colors shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Outlet</span>
            </button>
          ) : activeTab === 'staff' && canManageStaff ? (
            <button
              onClick={() => setIsAddStaffOpen(true)}
              className="py-2.5 px-4 bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-bold rounded-xl text-xs transition-colors shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Staff / Cashier</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* TAB 1: BRANCHES VIEW */}
      {activeTab === 'branches' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((b) => (
            <div
              key={b.id}
              className="p-6 bg-stone-900/80 rounded-3xl border border-stone-800 hover:border-emerald-500/40 transition-all space-y-4 shadow-xl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-stone-950 text-emerald-400 font-bold border border-stone-800">
                    {b.code}
                  </span>
                  <h3 className="font-display font-bold text-white text-base mt-2">
                    {b.name}
                  </h3>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" title="Active" />
              </div>

              <div className="space-y-2 text-xs text-stone-400">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                  <span>{b.address}, {b.city}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-stone-500 shrink-0" />
                  <span className="font-mono">{b.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-stone-500 shrink-0" />
                  <span>{b.openingTime} - {b.closingTime}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-800/80 grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 bg-stone-950 rounded-xl">
                  <span className="text-stone-500 block">Delivery Radius</span>
                  <span className="font-mono font-bold text-white text-xs">{b.deliveryRadiusKm} km</span>
                </div>
                <div className="p-2.5 bg-stone-950 rounded-xl">
                  <span className="text-stone-500 block">Min Order</span>
                  <span className="font-mono font-bold text-emerald-400 text-xs">Rs {b.minOrderAmount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: STAFF & CASHIERS VIEW */}
      {activeTab === 'staff' && (
        <div className="rounded-2xl border border-stone-800 bg-stone-900/40 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-950 border-b border-stone-800 text-stone-400 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Staff Member</th>
                <th className="py-3.5 px-4">Role & Permissions</th>
                <th className="py-3.5 px-4">Assigned Outlet</th>
                <th className="py-3.5 px-4">Touchscreen Quick PIN</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 text-stone-300">
              {staffList.map((st) => (
                <tr key={st.id} className="hover:bg-stone-900/60 transition-colors">
                  <td className="py-4 px-5">
                    <span className="font-bold text-white block text-sm">
                      {st.firstName} {st.lastName}
                    </span>
                    <span className="text-[11px] text-stone-400 font-mono">{st.email}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300">
                      {st.role.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-stone-500 block mt-0.5">
                      {st.permissions.length} authorization scopes
                    </span>
                  </td>
                  <td className="py-4 px-4 text-xs text-stone-300">
                    {branches.find((b) => b.id === st.primaryBranchId)?.name || 'All Outlets'}
                  </td>
                  <td className="py-4 px-4 font-mono text-amber-300">
                    •••• (4-digit active)
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>Active</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD OUTLET MODAL */}
      {isAddBranchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsAddBranchOpen(false)} className="absolute inset-0 bg-stone-950/85 backdrop-blur-sm" />

          <div className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl p-6 z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-display font-bold text-white text-base">Add Restaurant Outlet</h3>
              <button onClick={() => setIsAddBranchOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {branchError && <p className="text-red-400 text-xs font-semibold">{branchError}</p>}
            {branchSuccess && <p className="text-emerald-400 text-xs font-semibold">{branchSuccess}</p>}

            <form onSubmit={handleCreateBranch} className="space-y-3 text-xs">
              <div>
                <label className="text-stone-300 block mb-1">Outlet Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bahadurabad Food Street"
                  value={branchFormData.name}
                  onChange={(e) => setBranchFormData({ ...branchFormData, name: e.target.value })}
                  className="w-full py-2 px-3 bg-stone-950 border border-stone-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-300 block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={branchFormData.city}
                    onChange={(e) => setBranchFormData({ ...branchFormData, city: e.target.value })}
                    className="w-full py-2 px-3 bg-stone-950 border border-stone-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="text-stone-300 block mb-1">Branch Code</label>
                  <input
                    type="text"
                    placeholder="KHI-04"
                    value={branchFormData.code}
                    onChange={(e) => setBranchFormData({ ...branchFormData, code: e.target.value })}
                    className="w-full py-2 px-3 bg-stone-950 border border-stone-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-300 block mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  placeholder="Plot 12-B, Main Commercial..."
                  value={branchFormData.address}
                  onChange={(e) => setBranchFormData({ ...branchFormData, address: e.target.value })}
                  className="w-full py-2 px-3 bg-stone-950 border border-stone-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-stone-400 block mb-1">Radius (km)</label>
                  <input
                    type="number"
                    value={branchFormData.deliveryRadiusKm}
                    onChange={(e) => setBranchFormData({ ...branchFormData, deliveryRadiusKm: Number(e.target.value) })}
                    className="w-full py-2 px-3 bg-stone-950 border border-stone-800 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-stone-400 block mb-1">Min Order (Rs)</label>
                  <input
                    type="number"
                    value={branchFormData.minOrderAmount}
                    onChange={(e) => setBranchFormData({ ...branchFormData, minOrderAmount: Number(e.target.value) })}
                    className="w-full py-2 px-3 bg-stone-950 border border-stone-800 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-stone-400 block mb-1">Delivery (Rs)</label>
                  <input
                    type="number"
                    value={branchFormData.standardDeliveryFee}
                    onChange={(e) => setBranchFormData({ ...branchFormData, standardDeliveryFee: Number(e.target.value) })}
                    className="w-full py-2 px-3 bg-stone-950 border border-stone-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddBranchOpen(false)}
                  className="py-2 px-4 bg-stone-800 text-stone-400 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-bold rounded-xl"
                >
                  Save Outlet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD STAFF MODAL */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsAddStaffOpen(false)} className="absolute inset-0 bg-stone-950/85 backdrop-blur-sm" />

          <div className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl p-6 z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-display font-bold text-white text-base">Add Staff / Cashier</h3>
              <button onClick={() => setIsAddStaffOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {staffError && <p className="text-red-400 text-xs font-semibold">{staffError}</p>}
            {staffSuccess && <p className="text-emerald-400 text-xs font-semibold">{staffSuccess}</p>}

            <form onSubmit={handleCreateStaff} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-300 block mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={staffFormData.firstName}
                    onChange={(e) => setStaffFormData({ ...staffFormData, firstName: e.target.value })}
                    className="w-full py-2 px-3 bg-stone-950 border border-stone-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="text-stone-300 block mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={staffFormData.lastName}
                    onChange={(e) => setStaffFormData({ ...staffFormData, lastName: e.target.value })}
                    className="w-full py-2 px-3 bg-stone-950 border border-stone-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-300 block mb-1">Email (Login Identity)</label>
                <input
                  type="email"
                  required
                  value={staffFormData.email}
                  onChange={(e) => setStaffFormData({ ...staffFormData, email: e.target.value })}
                  className="w-full py-2 px-3 bg-stone-950 border border-stone-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-300 block mb-1">Role</label>
                  <select
                    value={staffFormData.role}
                    onChange={(e) => setStaffFormData({ ...staffFormData, role: e.target.value })}
                    className="w-full py-2 px-3 bg-stone-950 border border-stone-800 rounded-xl text-white"
                  >
                    <option value="CASHIER">Cashier</option>
                    <option value="BRANCH_MANAGER">Branch Manager</option>
                    <option value="KITCHEN_STAFF">Kitchen Chef / Cook</option>
                    <option value="AUDITOR">Auditor (Read-Only)</option>
                  </select>
                </div>
                <div>
                  <label className="text-stone-300 block mb-1">6-Digit Quick PIN</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    required
                    value={staffFormData.pin}
                    onChange={(e) => setStaffFormData({ ...staffFormData, pin: e.target.value.replace(/\D/g, '') })}
                    className="w-full py-2 px-3 bg-stone-950 border border-stone-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-300 block mb-1">Initial Password</label>
                <input
                  type="password"
                  required
                  minLength={12}
                  autoComplete="new-password"
                  value={staffFormData.password}
                  onChange={(e) => setStaffFormData({ ...staffFormData, password: e.target.value })}
                  className="w-full py-2 px-3 bg-stone-950 border border-stone-800 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="text-stone-300 block mb-1">Assigned Primary Outlet</label>
                <select
                  value={staffFormData.primaryBranchId}
                  onChange={(e) => setStaffFormData({ ...staffFormData, primaryBranchId: e.target.value })}
                  className="w-full py-2 px-3 bg-stone-950 border border-stone-800 rounded-xl text-white"
                >
                  <option value="">All Outlets</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddStaffOpen(false)}
                  className="py-2 px-4 bg-stone-800 text-stone-400 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-bold rounded-xl"
                >
                  Register Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
