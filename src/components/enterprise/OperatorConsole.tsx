import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Check, CircleDollarSign, ClipboardList, PackageSearch, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button, EmptyState, ErrorState, LoadingState, PageHeader, Panel, StatusBadge } from '../ui/EnterpriseUI';

type Module = 'overview' | 'orders' | 'menu';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  channel: string;
  orderType: string;
  items: Array<{ name: string; quantity: number }>;
  grandTotal: number;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'voided';
  kdsStatus: 'new' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  createdAt: string;
}

interface MenuItem {
  id: string;
  name: string;
  categoryName: string;
  basePrice: number;
  isAvailable: boolean;
}

interface OperatorConsoleProps {
  onOpenStorefront: () => void;
  permissions: string[];
}

const readError = async (response: Response) => {
  const result = await response.json().catch(() => null);
  return result?.error?.message || `Request failed (${response.status})`;
};

const statusTone = (status: Order['kdsStatus']): 'neutral' | 'success' | 'warning' | 'danger' => {
  if (status === 'ready' || status === 'completed') return 'success';
  if (status === 'preparing' || status === 'accepted') return 'warning';
  if (status === 'cancelled') return 'danger';
  return 'neutral';
};

export const OperatorConsole: React.FC<OperatorConsoleProps> = ({
  onOpenStorefront,
  permissions,
}) => {
  const { tenant, activeBranch, token, user } = useAuth();
  const [activeModule, setActiveModule] = useState<Module>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const isPlatformAdmin = user?.role === 'PLATFORM_SUPER_ADMIN';
  const canManageMenu = permissions.includes('*') || permissions.includes('menu.manage');
  const currency = tenant?.currency || 'PKR';
  const branchQuery = activeBranch && !isPlatformAdmin ? `?branchId=${encodeURIComponent(activeBranch.id)}` : '';

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      if (activeModule === 'menu') {
        const response = await fetch('/api/v1/menu', { headers });
        if (!response.ok) throw new Error(await readError(response));
        const result = await response.json();
        setMenuItems(result.data?.items || []);
      } else {
        const response = await fetch(`/api/v1/orders${branchQuery}`, { headers });
        if (!response.ok) throw new Error(await readError(response));
        const result = await response.json();
        setOrders(result.data || []);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load workspace data.');
    } finally {
      setLoading(false);
    }
  }, [activeModule, branchQuery, token]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const todayOrders = useMemo(() => {
    const today = new Date();
    return orders.filter((order) => {
      const created = new Date(order.createdAt);
      return created.getFullYear() === today.getFullYear() &&
        created.getMonth() === today.getMonth() &&
        created.getDate() === today.getDate();
    });
  }, [orders]);
  const paidToday = todayOrders.filter((order) => order.paymentStatus === 'paid');
  const paidSales = paidToday.reduce((sum, order) => sum + order.grandTotal, 0);
  const openOrders = todayOrders.filter((order) => !['completed', 'cancelled'].includes(order.kdsStatus));
  const averageOrder = paidToday.length ? paidSales / paidToday.length : 0;
  const sortedOrders = [...orders].sort(
    (first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
  );
  const filteredOrders = orders.filter((order) => {
    const query = search.trim().toLowerCase();
    return !query || [order.orderNumber, order.customerName, order.channel, order.orderType]
      .some((value) => value?.toLowerCase().includes(query));
  });
  const filteredMenu = menuItems.filter((item) =>
    `${item.name} ${item.categoryName}`.toLowerCase().includes(search.trim().toLowerCase())
  );
  const formatMoney = (value: number) => new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);

  const updateAvailability = async (item: MenuItem) => {
    setUpdatingItemId(item.id);
    setActionError(null);
    setNotice(null);
    try {
      const response = await fetch(`/api/v1/menu/items/${encodeURIComponent(item.id)}/availability`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isAvailable: !item.isAvailable }),
      });
      if (!response.ok) throw new Error(await readError(response));
      const result = await response.json();
      if (!result.success || !result.data) throw new Error('The availability change was not confirmed by the server.');
      setMenuItems((items) => items.map((record) => record.id === item.id ? result.data : record));
      setNotice(`${item.name} is now ${result.data.isAvailable ? 'available' : 'sold out'}.`);
    } catch (requestError) {
      setActionError(requestError instanceof Error ? requestError.message : 'Unable to update item availability.');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const modules: Array<{ id: Module; label: string }> = [
    { id: 'overview', label: isPlatformAdmin ? 'Platform overview' : 'Overview' },
    { id: 'orders', label: 'Orders' },
    ...(canManageMenu && !isPlatformAdmin ? [{ id: 'menu' as const, label: 'Menu availability' }] : []),
  ];

  return (
    <div className="erp-page space-y-6">
      <PageHeader
        eyebrow={isPlatformAdmin ? 'Platform' : 'Restaurant operations'}
        title={modules.find((module) => module.id === activeModule)?.label || 'Overview'}
        description={isPlatformAdmin
          ? 'Live order activity across the platform.'
          : `Operational data${activeBranch ? ` for ${activeBranch.name}` : ''} from your workspace.`}
        actions={!isPlatformAdmin ? (
          <Button variant="secondary" icon={<ArrowUpRight className="h-4 w-4" />}           onClick={onOpenStorefront}>
            View storefront
          </Button>
        ) : undefined}
      />

      <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Workspace sections">
        {modules.map((module) => (
          <button
            key={module.id}
            type="button"
            role="tab"
            aria-selected={activeModule === module.id}
            onClick={() => {
              setActiveModule(module.id);
              setSearch('');
              setActionError(null);
              setNotice(null);
            }}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              activeModule === module.id
                ? 'bg-stone-900 text-white'
                : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            {module.label}
          </button>
        ))}
      </div>

      {actionError && <ErrorState message={actionError} />}
      {notice && (
        <div role="status" className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          <Check className="h-4 w-4" />
          {notice}
        </div>
      )}

      {activeModule === 'overview' && (
        <div className="space-y-6">
          {error ? <ErrorState message={error} onRetry={() => void loadData()} /> : loading ? (
            <LoadingState label="Loading sales and order activity" />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: 'Paid sales today', value: formatMoney(paidSales), icon: CircleDollarSign },
                  { label: 'Orders today', value: String(todayOrders.length), icon: ClipboardList },
                  { label: 'Average paid order', value: formatMoney(averageOrder), icon: CircleDollarSign },
                  { label: 'Open kitchen orders', value: String(openOrders.length), icon: PackageSearch },
                ].map(({ label, value, icon: Icon }) => (
                  <Panel key={label} className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="m-0 text-sm text-stone-500">{label}</p>
                      <Icon className="h-4 w-4 text-emerald-600" />
                    </div>
                    <p className="mb-0 mt-3 text-2xl font-semibold tracking-tight text-stone-100">{value}</p>
                    <p className="mb-0 mt-1 text-xs text-stone-500">Based on recorded orders for today</p>
                  </Panel>
                ))}
              </div>

              <Panel title="Recent orders" description="Latest orders recorded in this workspace">
                {orders.length === 0 ? (
                  <EmptyState title="No orders yet" description="Orders will appear here after they are placed." />
                ) : (
                  <OrderTable orders={sortedOrders.slice(0, 8)} formatMoney={formatMoney} />
                )}
              </Panel>
            </>
          )}
        </div>
      )}

      {activeModule === 'orders' && (
        <Panel
          title="Order activity"
          description="Search and review orders from this workspace."
          action={
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search orders"
                aria-label="Search orders"
                className="h-10 w-48 rounded-lg border border-stone-800 bg-stone-950 pl-9 pr-3 text-sm text-stone-200 outline-none focus:border-emerald-500 sm:w-60"
              />
            </label>
          }
        >
          {error ? <ErrorState message={error} onRetry={() => void loadData()} /> : loading ? (
            <LoadingState label="Loading orders" />
          ) : filteredOrders.length === 0 ? (
            <EmptyState title={search ? 'No matching orders' : 'No orders recorded'} description={search ? 'Try another order number or customer name.' : 'Orders will appear here when available.'} />
          ) : (
            <OrderTable
              orders={sortedOrders.filter((order) => filteredOrders.includes(order))}
              formatMoney={formatMoney}
            />
          )}
        </Panel>
      )}

      {activeModule === 'menu' && (
        <Panel title="Menu availability" description="Review menu items and mark items available or sold out.">
          <div className="flex items-center justify-between gap-3 border-b border-stone-800 px-4 py-3">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search menu"
                aria-label="Search menu items"
                className="h-10 w-52 rounded-lg border border-stone-800 bg-stone-950 pl-9 pr-3 text-sm text-stone-200 outline-none focus:border-emerald-500"
              />
            </label>
            <span className="text-xs text-stone-500">{menuItems.length} items</span>
          </div>
          {error ? <ErrorState message={error} onRetry={() => void loadData()} /> : loading ? (
            <LoadingState label="Loading menu" />
          ) : filteredMenu.length === 0 ? (
            <EmptyState title={search ? 'No matching menu items' : 'No menu items configured'} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[36rem] text-left text-sm">
                <thead className="bg-stone-950 text-xs uppercase tracking-wide text-stone-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Item</th>
                    <th className="px-5 py-3 font-semibold">Category</th>
                    <th className="px-5 py-3 font-semibold">Price</th>
                    <th className="px-5 py-3 font-semibold">Availability</th>
                    <th className="px-5 py-3 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800">
                  {filteredMenu.map((item) => (
                    <tr key={item.id} className="text-stone-300">
                      <td className="px-5 py-4 font-medium text-stone-100">{item.name}</td>
                      <td className="px-5 py-4">{item.categoryName || '—'}</td>
                      <td className="px-5 py-4 tabular-nums">{formatMoney(item.basePrice)}</td>
                      <td className="px-5 py-4">
                        <StatusBadge tone={item.isAvailable ? 'success' : 'danger'}>
                          {item.isAvailable ? 'Available' : 'Sold out'}
                        </StatusBadge>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button
                          variant={item.isAvailable ? 'danger' : 'primary'}
                          disabled={updatingItemId === item.id}
                          onClick={() => void updateAvailability(item)}
                          icon={<Check className="h-4 w-4" />}
                        >
                          {updatingItemId === item.id ? 'Saving…' : item.isAvailable ? 'Mark sold out' : 'Mark available'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      )}
    </div>
  );
};

const OrderTable: React.FC<{
  orders: Order[];
  formatMoney: (value: number) => string;
}> = ({ orders, formatMoney }) => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[44rem] text-left text-sm">
      <thead className="bg-stone-950 text-xs uppercase tracking-wide text-stone-500">
        <tr>
          <th className="px-5 py-3 font-semibold">Order</th>
          <th className="px-5 py-3 font-semibold">Customer</th>
          <th className="px-5 py-3 font-semibold">Type</th>
          <th className="px-5 py-3 font-semibold">Status</th>
          <th className="px-5 py-3 font-semibold">Payment</th>
          <th className="px-5 py-3 text-right font-semibold">Total</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-stone-800">
        {orders.map((order) => (
          <tr key={order.id} className="text-stone-300">
            <td className="px-5 py-4">
              <span className="font-semibold text-stone-100">#{order.orderNumber}</span>
              <span className="mt-1 block text-xs text-stone-500">
                {new Date(order.createdAt).toLocaleString()}
              </span>
            </td>
            <td className="px-5 py-4">{order.customerName || 'Guest'}</td>
            <td className="px-5 py-4 capitalize">{order.orderType.replace(/_/g, ' ')}</td>
            <td className="px-5 py-4">
              <StatusBadge tone={statusTone(order.kdsStatus)}>{order.kdsStatus}</StatusBadge>
            </td>
            <td className="px-5 py-4 capitalize">{order.paymentStatus}</td>
            <td className="px-5 py-4 text-right font-medium tabular-nums text-stone-100">{formatMoney(order.grandTotal)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
