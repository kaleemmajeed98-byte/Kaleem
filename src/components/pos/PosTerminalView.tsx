import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  Wifi,
  WifiOff,
  RefreshCw,
  Split,
  Receipt,
  Clock,
  ChevronRight,
  X,
  CreditCard,
  DollarSign,
  Smartphone,
  History,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import bbqImage from '../../assets/images/food_bbq_platter_1793901968953.jpg';
import karahiImage from '../../assets/images/food_karahi_handi_1793901969642.jpg';
import biryaniImage from '../../assets/images/food_karachi_biryani_1793901970187.jpg';

interface PosItem {
  id: string;
  name: string;
  category?: string;
  categoryId?: string;
  description?: string;
  image?: string;
  basePrice: number;
  station: string;
  preparationMinutes: number;
  variants?: { name: string; price: number }[];
  isAvailable: boolean;
}

interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  station: string;
  variant?: string;
  notes?: string;
}

interface PosOrder {
  id: string;
  orderNumber: string;
  orderType: string;
  customerName: string;
  items: CartItem[];
  grandTotal: number;
  paymentStatus: string;
  paymentMethod: string;
  kdsStatus: string;
  createdAt: string;
  cashierName?: string;
  terminalId?: string;
}

interface PosShift {
  id: string;
  openingCash: number;
  status: 'open' | 'closed';
  openedAt: string;
  transactions: { type: 'cash_in' | 'cash_out'; amount: number; reason: string }[];
}

export const PosTerminalView: React.FC<{ onSignOut: () => void }> = ({ onSignOut }) => {
  const { user, tenant, activeBranch, branches, switchBranch, token } = useAuth();
  const canApplyDiscount = user?.role === 'PLATFORM_SUPER_ADMIN' || user?.permissions.includes('pos.discount.apply');

  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<PosItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway' | 'delivery' | 'drive_thru'>('dine_in');
  const [tableNumber, setTableNumber] = useState<string>('T-01');
  const [customerName, setCustomerName] = useState<string>('Walk-in Guest');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [fixedDiscount, setFixedDiscount] = useState<number>(0);
  const [discountMode, setDiscountMode] = useState<'percentage' | 'fixed'>('percentage');
  const [serviceCharge, setServiceCharge] = useState<number>(0);

  // Offline-First Sync Simulation State
  const [isOffline, setIsOffline] = useState<boolean>(() => !navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('eros_pos_offline_queue') || '[]');
    } catch {
      return [];
    }
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Modals
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<any | null>(null);
  const [isSplitBillOpen, setIsSplitBillOpen] = useState<boolean>(false);
  const [splitCount, setSplitCount] = useState<number>(2);

  // Payment Calculation State
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'card' | 'jazzcash' | 'easypaisa'>('cash');
  const [tenderAmount, setTenderAmount] = useState<number>(0);
  const [heldOrders, setHeldOrders] = useState<any[]>([]);
  const [screen, setScreen] = useState<'order' | 'history'>('order');
  const [orders, setOrders] = useState<PosOrder[]>([]);
  const [orderSearch, setOrderSearch] = useState('');
  const [currentShift, setCurrentShift] = useState<PosShift | null>(null);
  const [shiftDialog, setShiftDialog] = useState<'open' | 'close' | 'cash_in' | 'cash_out' | null>(null);
  const [shiftAmount, setShiftAmount] = useState('');
  const [shiftReason, setShiftReason] = useState('');
  const [isShiftActionPending, setIsShiftActionPending] = useState(false);
  const [posError, setPosError] = useState<string | null>(null);

  const loadOrdersAndShift = async () => {
    if (!token || !activeBranch) return;
    try {
      const headers = { Authorization: ['Bearer', token].join(' ') };
      const [ordersResponse, shiftResponse] = await Promise.all([
        fetch(`/api/v1/orders?branchId=${encodeURIComponent(activeBranch.id)}`, { headers }),
        fetch(`/api/v1/shifts/current?branchId=${encodeURIComponent(activeBranch.id)}`, { headers }),
      ]);
      const [ordersResult, shiftResult] = await Promise.all([ordersResponse.json(), shiftResponse.json()]);
      if (!ordersResponse.ok || !ordersResult.success) {
        throw new Error(ordersResult.error?.message || 'Could not load POS orders');
      }
      if (!shiftResponse.ok || !shiftResult.success) {
        throw new Error(shiftResult.error?.message || 'Could not load cashier shift');
      }
      setOrders(ordersResult.data || []);
      setCurrentShift(shiftResult.data);
    } catch (error) {
      setPosError(error instanceof Error ? error.message : 'Could not load POS data');
    }
  };

  useEffect(() => {
    loadOrdersAndShift();
    const refreshInterval = window.setInterval(loadOrdersAndShift, 15000);
    return () => window.clearInterval(refreshInterval);
  }, [token, activeBranch?.id]);

  const handleShiftAction = async () => {
    if (!token || !activeBranch || !shiftDialog) return;
    const amount = Number(shiftAmount);
    if (!Number.isFinite(amount) || amount < 0 || (shiftDialog !== 'open' && shiftDialog !== 'close' && amount <= 0)) {
      setPosError('Enter a valid cash amount.');
      return;
    }
    if ((shiftDialog === 'cash_in' || shiftDialog === 'cash_out') && !shiftReason.trim()) {
      setPosError('Add a reason for this cash movement.');
      return;
    }
    const endpoint = shiftDialog === 'open'
      ? '/api/v1/shifts'
      : shiftDialog === 'close'
        ? `/api/v1/shifts/${currentShift?.id}/close`
        : `/api/v1/shifts/${currentShift?.id}/cash-transactions`;
    const body = shiftDialog === 'open'
      ? { branchId: activeBranch.id, terminalId: 'POS-01', openingCash: amount }
      : shiftDialog === 'close'
        ? { closingCash: amount }
        : { type: shiftDialog, amount, reason: shiftReason.trim() };
    setIsShiftActionPending(true);
    setPosError(null);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: ['Bearer', token].join(' ') },
        body: JSON.stringify(body),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        if (response.status === 409 && result?.error?.code === 'SHIFT_ALREADY_OPEN' && shiftDialog === 'open') {
          const currentResponse = await fetch(`/api/v1/shifts/current?branchId=${encodeURIComponent(activeBranch.id)}`, {
            headers: { Authorization: ['Bearer', token].join(' ') },
          });
          const currentResult = await currentResponse.json().catch(() => null);
          if (currentResponse.ok && currentResult?.success && currentResult.data) {
            setCurrentShift(currentResult.data);
            setShiftDialog(null);
            setShiftAmount('');
            setPosError(null);
            return;
          }
        }
        throw new Error(
          result?.error?.message ||
          `Cash register action failed (HTTP ${response.status}${result ? '' : ': invalid server response'})`
        );
      }
      if (shiftDialog === 'open') setCurrentShift(result.data);
      setShiftDialog(null);
      setShiftAmount('');
      setShiftReason('');
      await loadOrdersAndShift();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Cash register action failed';
      setPosError(message);
    } finally {
      setIsShiftActionPending(false);
    }
  };

  // Fetch Menu from Real Backend
  const loadMenu = async () => {
    if (!token) return;
    try {
      const res = await fetch(`/api/v1/menu?tenantId=${tenant?.id || ''}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCategories(data.data.categories || []);
        setMenuItems(data.data.items || []);
      }
    } catch (e) {
      console.error('[POS] Failed to fetch menu:', e);
    }
  };

  useEffect(() => {
    loadMenu();
  }, [token, tenant]);

  // Persist offline queue
  useEffect(() => {
    localStorage.setItem('eros_pos_offline_queue', JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  // Handle Automatic Reconnection & Sync
  const handleSyncOfflineOrders = async () => {
    if (offlineQueue.length === 0 || isOffline) return;
    setIsSyncing(true);
    try {
      const res = await fetch('/api/v1/orders/sync-offline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tenantId: tenant?.id,
          queuedOrders: offlineQueue,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setOfflineQueue([]);
        localStorage.removeItem('eros_pos_offline_queue');
      }
    } catch (e) {
      console.error('[POS] Offline sync error:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      void handleSyncOfflineOrders();
    };
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [offlineQueue.length]);

  // Sound Feedback
  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  };

  // Add Item to Cart
  const handleAddToCart = (item: PosItem, variant?: { name: string; price: number }) => {
    playBeep();
    const unitPrice = variant ? variant.price : item.basePrice;
    const cartItemId = `${item.id}-${variant?.name || 'std'}`;

    setCart((prev) => {
      const existing = prev.find((ci) => ci.id === cartItemId);
      if (existing) {
        return prev.map((ci) =>
          ci.id === cartItemId
            ? { ...ci, quantity: ci.quantity + 1, totalPrice: (ci.quantity + 1) * ci.unitPrice }
            : ci
        );
      }
      return [
        ...prev,
        {
          id: cartItemId,
          menuItemId: item.id,
          name: item.name,
          quantity: 1,
          unitPrice,
          totalPrice: unitPrice,
          station: item.station,
          variant: variant?.name,
        },
      ];
    });
  };

  const handleUpdateQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === cartItemId) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            return { ...item, quantity: nextQty, totalPrice: nextQty * item.unitPrice };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const taxAmount = Math.round(subtotal * 0.13); // 13% Sindh SRB GST
  const deliveryFee = orderType === 'delivery' ? 120 : 0;
  const discountAmount = Math.min(
    subtotal,
    discountMode === 'percentage' ? Math.round((subtotal * discountPercent) / 100) : fixedDiscount
  );
  const grandTotal = Math.max(0, subtotal + taxAmount + deliveryFee + serviceCharge - discountAmount);

  // Quick Tender Presets
  const tenderChange = tenderAmount > grandTotal ? tenderAmount - grandTotal : 0;

  // Complete Order
  const handleProcessCheckout = async () => {
    if (cart.length === 0) return;
    if (!currentShift) {
      setIsCheckoutOpen(false);
      setShiftDialog('open');
      return;
    }
    if (selectedPaymentMethod === 'cash' && tenderAmount < grandTotal) {
      setPosError('Cash tendered must cover the order total.');
      return;
    }

    const orderPayload = {
      tenantId: tenant?.id,
      branchId: activeBranch?.id || branches[0]?.id,
      channel: 'pos',
      terminalId: 'POS-01',
      orderType,
      tableNumber: orderType === 'dine_in' ? tableNumber : undefined,
      customerName,
      customerPhone,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined,
      items: cart,
      subtotal,
      taxAmount,
      deliveryFee,
      discountAmount,
      serviceCharge,
      grandTotal,
      paymentMethod: selectedPaymentMethod,
      clientNonce: `offline-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };

    if (isOffline) {
      // Offline-first queueing
      const offlineOrder = {
        ...orderPayload,
        id: `offline-ord-${Date.now()}`,
        orderNumber: `OFF-${Math.floor(1000 + Math.random() * 9000)}`,
        kdsStatus: 'new',
        paymentStatus: 'paid',
      };
      setOfflineQueue((prev) => [...prev, offlineOrder]);
      setLastCompletedOrder(offlineOrder);
      setIsCheckoutOpen(false);
      setIsReceiptOpen(true);
      setCart([]);
      return;
    }

    try {
      const res = await fetch('/api/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });
      const data = await res.json();
      if (data.success) {
        setLastCompletedOrder(data.data);
        setIsCheckoutOpen(false);
        setIsReceiptOpen(true);
        setCart([]);
        await loadOrdersAndShift();
      } else {
        throw new Error(data.error?.message || 'Order could not be completed');
      }
    } catch (e) {
      console.error('[POS] Order request failed:', e);
      if (!isOffline) {
        setPosError(e instanceof Error ? e.message : 'Order could not be completed');
        return;
      }
      // Fallback offline queue
      const offlineOrder = {
        ...orderPayload,
        id: `offline-ord-${Date.now()}`,
        orderNumber: `OFF-${Math.floor(1000 + Math.random() * 9000)}`,
        kdsStatus: 'new',
        paymentStatus: 'paid',
      };
      setOfflineQueue((prev) => [...prev, offlineOrder]);
      setLastCompletedOrder(offlineOrder);
      setIsCheckoutOpen(false);
      setIsReceiptOpen(true);
      setCart([]);
    }
  };

  // Hold / Resume Order
  const handleHoldOrder = () => {
    if (cart.length === 0) return;
    setHeldOrders((prev) => [
      ...prev,
      {
        id: `held-${Date.now()}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        table: tableNumber,
        type: orderType,
        cart,
        total: grandTotal,
      },
    ]);
    setCart([]);
  };

  const handleResumeHeldOrder = (held: any) => {
    setCart(held.cart);
    setTableNumber(held.table);
    setOrderType(held.type);
    setHeldOrders((prev) => prev.filter((h) => h.id !== held.id));
  };

  // Filtered menu items
  const filteredItems = menuItems.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.categoryId === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getProductImage = (item: PosItem) => {
    if (item.image) return item.image;
    const itemText = `${item.name} ${item.category || ''}`.toLowerCase();
    if (/karahi|handi|naan|tandoor/.test(itemText)) return karahiImage;
    if (/rice|biryani|pulao/.test(itemText)) return biryaniImage;
    return bbqImage;
  };
  const getCartItemImage = (item: CartItem) => {
    const menuItem = menuItems.find((candidate) => candidate.id === item.menuItemId);
    return getProductImage(
      menuItem || {
        id: item.menuItemId,
        name: item.name,
        basePrice: item.unitPrice,
        station: item.station,
        preparationMinutes: 0,
        isAvailable: true,
      }
    );
  };

  const todayKey = new Date().toLocaleDateString();
  const todayOrders = orders.filter((order) => new Date(order.createdAt).toLocaleDateString() === todayKey);
  const todaySales = todayOrders
    .filter((order) => order.paymentStatus === 'paid')
    .reduce((sum, order) => sum + order.grandTotal, 0);
  const activeOrders = orders.filter((order) =>
    !['completed', 'cancelled'].includes(order.kdsStatus) && !['refunded', 'voided'].includes(order.paymentStatus)
  );
  const visibleHistory = orders.filter((order) => {
    const query = orderSearch.trim().toLowerCase();
    return !query || order.orderNumber.toLowerCase().includes(query) || order.customerName.toLowerCase().includes(query);
  });
  const shiftExpectedCash = currentShift
    ? currentShift.openingCash +
      orders.filter((order) =>
        order.paymentStatus === 'paid' &&
        order.paymentMethod === 'cash' &&
        order.cashierName === `${user?.firstName || ''} ${user?.lastName || ''}`.trim() &&
        order.terminalId === 'POS-01' &&
        order.createdAt >= currentShift.openedAt
      ).reduce((sum, order) => sum + order.grandTotal, 0) +
      currentShift.transactions.reduce((sum, transaction) =>
        sum + (transaction.type === 'cash_in' ? transaction.amount : -transaction.amount), 0)
    : 0;

  return (
    <div className="flex-1 flex min-h-0 bg-stone-950 text-stone-100 overflow-hidden font-sans">
      <aside className="hidden w-[188px] shrink-0 flex-col border-r border-stone-800 bg-[#171715] p-3 md:flex">
        <div className="mb-8 flex items-center gap-2.5 px-2 pt-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/40 bg-amber-400/10 font-display text-lg font-bold text-amber-300">
            {tenant?.logoInitial || 'P'}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">{tenant?.name || 'Restaurant'}</p>
            <p className="text-[10px] text-stone-500">Restaurant POS</p>
          </div>
        </div>

        <nav aria-label="Cashier navigation" className="space-y-1">
          <button
            onClick={() => setScreen('order')}
            aria-current={screen === 'order' ? 'page' : undefined}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-semibold ${
              screen === 'order' ? 'bg-emerald-900/70 text-white ring-1 ring-emerald-700/50' : 'text-stone-400 hover:bg-stone-800 hover:text-white'
            }`}
          >
            <Plus className="h-4 w-4" /> POS Terminal
          </button>
          <button
            onClick={() => setScreen('history')}
            aria-current={screen === 'history' ? 'page' : undefined}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-xs font-semibold ${
              screen === 'history' ? 'bg-emerald-900/70 text-white ring-1 ring-emerald-700/50' : 'text-stone-400 hover:bg-stone-800 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-3"><History className="h-4 w-4" /> Orders</span>
            {activeOrders.length > 0 && <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] text-white">{activeOrders.length}</span>}
          </button>
        </nav>

        <div className="mt-auto space-y-2">
          <div className="rounded-xl border border-stone-800 bg-stone-900 px-3 py-2.5">
            <p className="truncate text-xs font-semibold text-stone-200">{activeBranch?.name || 'Select branch'}</p>
            <select
              aria-label="Branch"
              value={activeBranch?.id || ''}
              onChange={(event) => {
                const branch = branches.find((entry) => entry.id === event.target.value);
                if (branch) switchBranch(branch);
              }}
              className="mt-1 w-full cursor-pointer bg-transparent text-[10px] text-stone-500 outline-none"
            >
              {branches.map((branch) => <option key={branch.id} value={branch.id} className="bg-stone-900 text-stone-200">{branch.city}</option>)}
            </select>
          </div>
          {!currentShift ? (
            <button onClick={() => setShiftDialog('open')} className="w-full rounded-xl border border-stone-800 bg-stone-900 px-3 py-2 text-left text-[11px] font-semibold text-stone-300 hover:border-amber-400/40">
              ○ Open cashier shift
            </button>
          ) : (
            <div className="rounded-xl border border-stone-800 bg-stone-900 p-2">
              <p className="mb-1.5 px-1 text-[10px] font-semibold text-emerald-300">● Shift open</p>
              <div className="grid grid-cols-3 gap-1">
                <button onClick={() => setShiftDialog('cash_in')} className="rounded-md bg-stone-800 px-1 py-1.5 text-[9px] text-stone-300">Cash in</button>
                <button onClick={() => setShiftDialog('cash_out')} className="rounded-md bg-stone-800 px-1 py-1.5 text-[9px] text-stone-300">Cash out</button>
                <button onClick={() => setShiftDialog('close')} className="rounded-md bg-stone-800 px-1 py-1.5 text-[9px] text-stone-300">Close</button>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between gap-2 rounded-xl border border-stone-800 bg-stone-900 px-2.5 py-2">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">{user?.firstName} {user?.lastName}</p>
              <p className="text-[10px] text-stone-500">Cashier</p>
            </div>
            <button onClick={onSignOut} title="Sign out to login" aria-label="Sign out" className="rounded-lg p-2 text-stone-400 hover:bg-stone-800 hover:text-amber-200">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <header className="relative z-20 flex shrink-0 flex-wrap items-center gap-3 border-b border-stone-800 bg-[#20201e] px-4 py-3 lg:flex-nowrap">
        {screen === 'order' && (
        <>
        <div className="relative min-w-[180px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search menu..."
            aria-label="Search menu"
            className="w-full rounded-xl border border-stone-700 bg-stone-950 px-10 py-3 text-xs text-stone-200 placeholder-stone-500 outline-none focus:border-amber-400/60"
          />
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded-xl bg-stone-950 p-1">
          {[
            { id: 'dine_in', label: 'Dine-In' },
            { id: 'takeaway', label: 'Takeaway' },
            { id: 'delivery', label: 'Delivery' },
            { id: 'drive_thru', label: 'Quick service' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setOrderType(type.id as typeof orderType)}
              className={`rounded-lg px-3 py-2.5 text-[11px] font-semibold transition-colors ${
                orderType === type.id ? 'bg-emerald-800 text-white' : 'text-stone-400 hover:bg-stone-800 hover:text-white'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
        </>
        )}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <select
            aria-label="Branch"
            value={activeBranch?.id || ''}
            onChange={(event) => {
              const branch = branches.find((entry) => entry.id === event.target.value);
              if (branch) switchBranch(branch);
            }}
            className="max-w-28 rounded-lg bg-stone-950 px-2 py-2 text-[10px] text-stone-300 outline-none md:hidden"
          >
            {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
          </select>
          {offlineQueue.length > 0 && (
            <button onClick={handleSyncOfflineOrders} disabled={isSyncing || isOffline} title={`${offlineQueue.length} queued order(s) waiting to sync`} className="flex items-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-400/10 px-2.5 py-2 text-[11px] font-semibold text-amber-200 disabled:opacity-50">
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} /> {offlineQueue.length}
            </button>
          )}
          <span title={isOffline ? 'Offline' : 'Online'} aria-label={isOffline ? 'Offline' : 'Online'} className={`flex h-8 w-8 items-center justify-center rounded-lg ${isOffline ? 'text-amber-300' : 'text-stone-400'}`}>
            {isOffline ? <WifiOff className="h-4 w-4" /> : <Wifi className="h-4 w-4" />}
          </span>
          <span className="hidden text-right text-[11px] text-stone-400 xl:block">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <button onClick={onSignOut} title="Sign out to login" aria-label="Sign out" className="rounded-lg p-2 text-stone-400 hover:bg-stone-800 hover:text-amber-200 md:hidden">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
        <nav aria-label="Mobile cashier navigation" className="order-last flex w-full items-center gap-2 md:hidden">
          <button onClick={() => setScreen('order')} className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold ${screen === 'order' ? 'bg-emerald-800 text-white' : 'bg-stone-950 text-stone-400'}`}>POS Terminal</button>
          <button onClick={() => setScreen('history')} className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold ${screen === 'history' ? 'bg-emerald-800 text-white' : 'bg-stone-950 text-stone-400'}`}>Orders</button>
        </nav>
      </header>

      {posError && (
        <div className="px-4 py-2 bg-red-950/60 border-b border-red-900 text-red-200 text-xs flex items-center justify-between">
          <span>{posError}</span>
          <button onClick={() => setPosError(null)} aria-label="Dismiss error"><X className="w-4 h-4" /></button>
        </div>
      )}

      {screen === 'history' ? (
        <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 bg-stone-950">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
              <div><p className="text-[11px] uppercase tracking-[0.2em] text-amber-400 font-bold">Transactions</p><h1 className="text-2xl font-display font-bold text-white mt-1">Order History</h1></div>
              <div className="relative w-full sm:w-80"><Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" /><input value={orderSearch} onChange={(event) => setOrderSearch(event.target.value)} placeholder="Search order number or customer" className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-400" /></div>
            </div>
            <div className="rounded-2xl border border-stone-800 overflow-x-auto bg-stone-900/50">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="bg-stone-900 text-stone-500 uppercase tracking-wider"><tr><th className="p-3">Order</th><th className="p-3">Customer</th><th className="p-3">Type / Time</th><th className="p-3">Payment</th><th className="p-3">Status</th><th className="p-3 text-right">Total</th><th className="p-3"></th></tr></thead>
                <tbody className="divide-y divide-stone-800">
                  {visibleHistory.map((order) => (
                    <tr key={order.id} className="text-stone-300 hover:bg-stone-900">
                      <td className="p-3 font-bold text-white">#{order.orderNumber}</td><td className="p-3">{order.customerName}</td>
                      <td className="p-3 capitalize">{order.orderType.replace('_', ' ')}<span className="block text-[10px] text-stone-500">{new Date(order.createdAt).toLocaleString()}</span></td>
                      <td className="p-3 capitalize">{order.paymentMethod} · {order.paymentStatus}</td><td className="p-3 uppercase text-[10px]">{order.kdsStatus}</td>
                      <td className="p-3 text-right font-mono text-amber-300">Rs {order.grandTotal.toLocaleString()}</td>
                      <td className="p-3 text-right"><button onClick={() => { setLastCompletedOrder(order); setIsReceiptOpen(true); }} className="text-amber-300 hover:text-amber-200">Receipt</button></td>
                    </tr>
                  ))}
                  {visibleHistory.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-stone-500">No matching orders found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
      <>
      {/* Main Split: Left Catalog + Right Touch Ticket */}
      <div className="flex flex-1 min-h-0 flex-col overflow-hidden sm:flex-row">
        
        {/* LEFT PANE: CATEGORIES & PRODUCT GRID */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col border-r border-stone-800 overflow-hidden bg-stone-950">
          {/* Search & Fast Filters */}
          <div className="min-h-2 border-b border-stone-800 bg-stone-900/30 shrink-0">
            {heldOrders.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto px-3 py-2">
                <span className="shrink-0 text-[11px] text-stone-400 font-medium">Held:</span>
                {heldOrders.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => handleResumeHeldOrder(h)}
                    className="py-1 px-2.5 bg-amber-400/20 border border-amber-400/40 text-amber-300 rounded-lg text-xs font-bold hover:bg-amber-400/30 transition-colors cursor-pointer"
                  >
                    {h.table} (Rs {h.total})
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category Tabs Strip */}
          <div className="flex shrink-0 gap-2 overflow-x-auto border-b border-stone-800 bg-stone-900/30 px-3 py-2.5 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`relative flex h-[82px] w-[76px] shrink-0 flex-col items-center justify-center gap-1 rounded-xl border text-[10px] font-bold transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'border-emerald-500 bg-emerald-900/60 text-white'
                  : 'border-stone-800 bg-stone-900 text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              <span className="text-xl">▦</span>
              All items
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex h-[82px] w-[76px] shrink-0 flex-col overflow-hidden rounded-xl border text-[10px] font-semibold transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'border-emerald-500 bg-emerald-900/60 text-white'
                    : 'border-stone-800 bg-stone-900 text-stone-400 hover:text-white hover:bg-stone-800'
                }`}
              >
                <img
                  src={getProductImage(menuItems.find((item) => item.categoryId === cat.id) || {
                    id: cat.id,
                    name: cat.name,
                    basePrice: 0,
                    station: 'GRILL',
                    preparationMinutes: 0,
                    isAvailable: true,
                  })}
                  alt=""
                  className="h-14 w-full object-cover"
                />
                <span className="w-full truncate px-1 text-center">{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Products Grid Viewport */}
          <div className="flex-1 p-3 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2.5 content-start">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="relative rounded-2xl bg-stone-900/80 border border-stone-800 hover:border-emerald-500/50 hover:bg-stone-900 transition-all flex flex-col select-none cursor-pointer group shadow-sm active:scale-98 overflow-hidden"
                onClick={() => {
                  if (item.variants && item.variants.length > 0) {
                    handleAddToCart(item, item.variants[0]);
                  } else {
                    handleAddToCart(item);
                  }
                }}
              >
                <div className="relative">
                  <img
                    src={getProductImage(item)}
                    alt={item.name}
                    className="w-full h-28 object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1">
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-stone-950 text-stone-400 border border-stone-800">
                      {item.station}
                    </span>
                    <span className="text-[10px] text-white flex items-center gap-0.5 bg-stone-950/80 rounded-md px-1.5 py-1">
                      <Clock className="w-3 h-3" />
                      {item.preparationMinutes}m
                    </span>
                  </div>

                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/75 to-transparent px-2.5 pb-2 pt-8">
                    <h4 className="font-bold text-white text-xs leading-snug line-clamp-1 group-hover:text-amber-200 transition-colors">
                      {item.name}
                    </h4>
                    <p className="mt-0.5 text-[11px] font-semibold text-stone-200">Rs. {item.basePrice.toLocaleString()}</p>
                  </div>
                </div>

                <div className="pointer-events-none absolute bottom-2 right-2">
                  <div>
                    <span className="sr-only">Add {item.name}</span>
                  </div>

                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-900/90 text-white shadow group-hover:bg-amber-400 group-hover:text-stone-950">
                    +
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-2 overflow-x-auto border-t border-stone-800 bg-stone-900/70 px-3 py-2">
            <button onClick={handleHoldOrder} disabled={cart.length === 0} className="shrink-0 rounded-lg bg-stone-800 px-3 py-2 text-[10px] font-semibold text-stone-200 disabled:opacity-40">Ⅱ Hold order</button>
            <button onClick={() => setCart([])} disabled={cart.length === 0} className="shrink-0 rounded-lg bg-stone-800 px-3 py-2 text-[10px] font-semibold text-stone-200 disabled:opacity-40">Clear ticket</button>
            {heldOrders.map((held) => (
              <button key={held.id} onClick={() => handleResumeHeldOrder(held)} className="shrink-0 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-[10px] font-semibold text-amber-200">
                Resume {held.table} · Rs {held.total.toLocaleString()}
              </button>
            ))}
          </div>

        </div>

        {/* RIGHT PANE: ACTIVE ORDER TICKET & DINE-IN TABLE SELECTOR */}
        <div className="flex h-[44%] w-full shrink-0 flex-col justify-between border-t border-stone-800 bg-stone-900 shadow-2xl z-10 sm:h-auto sm:w-[280px] sm:border-l sm:border-t-0 xl:w-[340px]">
          
          {/* Order Header */}
          <div className="p-3 border-b border-stone-800 space-y-2.5 bg-stone-950 shrink-0">
            <div className="flex items-center gap-2 text-xs">
              {orderType === 'dine_in' && (
                <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-stone-900 px-2.5 py-2">
                  <span className="text-sm text-emerald-300">▣</span>
                  <select
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    aria-label="Select table"
                    className="min-w-0 flex-1 cursor-pointer bg-transparent font-bold text-white focus:outline-none"
                  >
                    {['T-01', 'T-02', 'T-03', 'T-04', 'T-05', 'T-06', 'VIP-01', 'VIP-02', 'Family Hall'].map((tbl) => (
                      <option key={tbl} value={tbl} className="bg-stone-900 text-stone-100">
                        {tbl}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <span className="shrink-0 rounded-lg bg-stone-900 px-2.5 py-2 text-[10px] text-stone-400">{orderType.replace('_', ' ')}</span>
            </div>

            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Guest name"
              aria-label="Guest name"
              className="w-full rounded-lg border border-stone-800 bg-stone-900 px-2.5 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
            />
            {orderType === 'delivery' && (
              <div className="space-y-2">
                <input type="text" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Phone number" aria-label="Customer phone" className="w-full rounded-lg border border-stone-800 bg-stone-900 px-2.5 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500" />
                <input type="text" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="Delivery address" aria-label="Delivery address" className="w-full rounded-lg border border-stone-800 bg-stone-900 px-2.5 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500" />
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="px-3 pt-2.5 flex items-center justify-between bg-stone-900">
            <span className="text-xs font-semibold text-white">Items ({cart.length})</span>
            <button
              type="button"
              onClick={() => setCart([])}
              disabled={cart.length === 0}
              className="text-[10px] font-semibold text-amber-400 hover:text-amber-300 disabled:opacity-40 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Clear all
            </button>
          </div>
          <div className="flex-1 p-3 overflow-y-auto space-y-2 divide-y divide-stone-800/40">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500 space-y-2">
                <Receipt className="w-10 h-10 stroke-[1.2] text-stone-600" />
                <p className="text-xs">Tap any dish from the left catalog to start building the ticket.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="p-2 rounded-xl bg-stone-800/50 space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <img
                      src={getCartItemImage(item)}
                      alt=""
                      className="w-14 h-12 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-semibold text-white block line-clamp-1">{item.name}</span>
                          {item.variant && (
                            <span className="text-[10px] text-amber-300 font-mono">[{item.variant}]</span>
                          )}
                          <span className="text-[10px] text-stone-400 block font-mono">
                            Rs {item.unitPrice} each
                          </span>
                        </div>
                        <span className="font-mono font-bold text-white tabular-nums whitespace-nowrap">
                          Rs {item.totalPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity Stepper & Notes */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1 bg-stone-950 rounded-lg p-0.5 border border-stone-800">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, -1)}
                        className="w-6 h-6 rounded bg-stone-900 hover:bg-stone-800 text-stone-300 flex items-center justify-center font-bold text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-mono font-bold text-xs text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, 1)}
                        className="w-6 h-6 rounded bg-stone-900 hover:bg-stone-800 text-stone-300 flex items-center justify-center font-bold text-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemoveFromCart(item.id)}
                      className="p-1 rounded text-stone-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Ticket Footer & Summary */}
          <div className="p-3 bg-stone-950 border-t border-stone-800 space-y-3 shrink-0">
            {/* Discount & Hold row */}
            <div className="flex items-center justify-between gap-2 text-xs">
              <button
                onClick={() => setIsSplitBillOpen(true)}
                disabled={cart.length === 0}
                className="py-1.5 px-3 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 text-[11px] font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                <Split className="w-3 h-3" />
                <span>Split Bill</span>
              </button>

              {canApplyDiscount ? (
                <div className="flex items-center gap-1 text-[11px] text-stone-400">
                  <select
                    value={discountMode}
                    onChange={(event) => setDiscountMode(event.target.value as 'percentage' | 'fixed')}
                    aria-label="Discount type"
                    className="bg-stone-900 border border-stone-800 rounded px-1.5 py-1 text-amber-300"
                  >
                    <option value="percentage">%</option>
                    <option value="fixed">Rs</option>
                  </select>
                  {discountMode === 'percentage' ? (
                    <select
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Number(e.target.value))}
                      className="bg-stone-900 border border-stone-800 rounded px-1.5 py-1 text-amber-300 font-mono font-bold"
                    >
                      <option value={0}>0%</option>
                      <option value={5}>5%</option>
                      <option value={10}>10%</option>
                      <option value={15}>15%</option>
                      <option value={20}>20%</option>
                    </select>
                  ) : (
                    <input
                      type="number"
                      min="0"
                      max={Math.round(subtotal * 0.2)}
                      value={fixedDiscount}
                      onChange={(event) => setFixedDiscount(Number(event.target.value))}
                      aria-label="Fixed discount amount"
                      className="w-16 bg-stone-900 border border-stone-800 rounded px-1.5 py-1 text-amber-300 font-mono"
                    />
                  )}
                </div>
              ) : (
                <span className="text-[10px] text-stone-500">Manager approval required</span>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1 text-xs text-stone-400 pt-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono text-stone-200">Rs {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Sindh Sales Tax (SRB 13%)</span>
                <span className="font-mono text-stone-200">Rs {taxAmount.toLocaleString()}</span>
              </div>
              {orderType === 'delivery' && (
                <div className="flex justify-between">
                  <span>Standard Delivery Fee</span>
                  <span className="font-mono text-stone-200">Rs {deliveryFee}</span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount ({discountMode === 'percentage' ? `${discountPercent}%` : 'fixed'})</span>
                  <span className="font-mono">-Rs {discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-1.5 border-t border-stone-800 text-white font-bold text-sm">
                <span>Grand Total</span>
                <span className="font-mono text-emerald-400 text-lg">
                  Rs {grandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'cash', label: 'Cash', Icon: DollarSign },
                { id: 'card', label: 'Card', Icon: CreditCard },
                { id: 'jazzcash', label: 'JazzCash', Icon: Smartphone },
              ].map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => {
                    setSelectedPaymentMethod(id as 'cash' | 'card' | 'jazzcash');
                    setPosError(null);
                    if (cart.length === 0) return;
                    if (!currentShift) {
                      setShiftDialog('open');
                      return;
                    }
                    setTenderAmount(grandTotal);
                    setIsCheckoutOpen(true);
                  }}
                  className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-[10px] font-semibold ${
                    selectedPaymentMethod === id ? 'border-emerald-500 bg-emerald-900/50 text-emerald-200' : 'border-stone-800 bg-stone-900 text-stone-400'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setPosError(null);
                if (!currentShift) {
                  setShiftDialog('open');
                  return;
                }
                setTenderAmount(grandTotal);
                setIsCheckoutOpen(true);
              }}
              disabled={cart.length === 0}
              className="w-full py-3.5 bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-bold rounded-2xl text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
            >
              <span>{currentShift ? 'Process payment' : 'Open shift to pay'}</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>

        </div>

      </div>

      {screen === 'order' && (
        <footer className="grid shrink-0 grid-cols-3 gap-2 border-t border-stone-800 bg-[#171715] px-3 py-2.5">
          <div className="rounded-lg bg-stone-900 px-3 py-2">
            <p className="text-[9px] text-stone-500">Today’s sales</p>
            <p className="mt-0.5 text-xs font-bold text-white">Rs. {todaySales.toLocaleString()}</p>
          </div>
          <div className="rounded-lg bg-stone-900 px-3 py-2">
            <p className="text-[9px] text-stone-500">Total orders</p>
            <p className="mt-0.5 text-xs font-bold text-white">{todayOrders.length}</p>
          </div>
          <div className="rounded-lg bg-stone-900 px-3 py-2">
            <p className="text-[9px] text-stone-500">Avg. order</p>
            <p className="mt-0.5 text-xs font-bold text-white">Rs. {todayOrders.length ? Math.round(todaySales / todayOrders.filter((order) => order.paymentStatus === 'paid').length || 0).toLocaleString() : 0}</p>
          </div>
        </footer>
      )}
      </>
      )}

      {shiftDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => { if (!isShiftActionPending) setShiftDialog(null); }} className="absolute inset-0 bg-stone-950/85 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm rounded-2xl border border-stone-700 bg-stone-900 p-5 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-amber-400 font-bold">Cash register</p>
                <h2 className="text-lg text-white font-bold mt-1">
                  {shiftDialog === 'open' ? 'Open Shift' : shiftDialog === 'close' ? 'Close Shift' : shiftDialog === 'cash_in' ? 'Cash In' : 'Cash Out'}
                </h2>
              </div>
              <button onClick={() => setShiftDialog(null)} disabled={isShiftActionPending} aria-label="Close dialog" className="disabled:opacity-40"><X className="w-4 h-4 text-stone-400" /></button>
            </div>
            <label className="block text-xs text-stone-400">
              {shiftDialog === 'open' ? 'Opening cash' : shiftDialog === 'close' ? 'Actual closing cash' : 'Cash amount'}
              <input autoFocus type="number" min="0" value={shiftAmount} onChange={(event) => setShiftAmount(event.target.value)} disabled={isShiftActionPending} className="mt-1.5 w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 disabled:opacity-60" />
            </label>
            {(shiftDialog === 'cash_in' || shiftDialog === 'cash_out') && (
              <label className="block text-xs text-stone-400">
                Reason
                <input value={shiftReason} onChange={(event) => setShiftReason(event.target.value)} disabled={isShiftActionPending} placeholder="e.g. Petty cash / supplier payment" className="mt-1.5 w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 disabled:opacity-60" />
              </label>
            )}
            {shiftDialog === 'close' && <p className="text-xs text-stone-400">Expected cash: <strong className="text-amber-300">Rs {shiftExpectedCash.toLocaleString()}</strong></p>}
            {posError && <p role="alert" className="rounded-lg border border-red-900 bg-red-950/60 px-3 py-2 text-xs text-red-200">{posError}</p>}
            <button onClick={handleShiftAction} disabled={isShiftActionPending} className="w-full rounded-lg bg-amber-400 py-2.5 text-sm font-bold text-stone-950 hover:bg-amber-300 disabled:cursor-wait disabled:opacity-60">
              {isShiftActionPending ? 'Saving shift…' : 'Confirm'}
            </button>
          </div>
        </div>
      )}

      {/* CHECKOUT & CASH TENDER MODAL */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsCheckoutOpen(false)} className="absolute inset-0 bg-stone-950/85 backdrop-blur-sm" />

          <div className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl p-6 z-10 space-y-6">
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-white">Payment Settlement</h3>
                <p className="text-xs text-stone-400">Order Total: <strong className="text-emerald-400 font-mono text-sm">Rs {grandTotal.toLocaleString()}</strong></p>
              </div>
              <button onClick={() => setIsCheckoutOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'cash', label: 'Cash PKR', icon: DollarSign },
                { id: 'card', label: 'Bank Card', icon: CreditCard },
                { id: 'jazzcash', label: 'JazzCash', icon: Smartphone },
                { id: 'easypaisa', label: 'EasyPaisa', icon: Smartphone },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedPaymentMethod(m.id as any)}
                    className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                      selectedPaymentMethod === m.id
                        ? 'bg-emerald-500 text-stone-950 border-emerald-400 shadow-md'
                        : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Cash Denominations Helper */}
            {selectedPaymentMethod === 'cash' && (
              <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-3 text-xs">
                <div className="flex items-center justify-between text-stone-400">
                  <span>Amount Tendered by Customer:</span>
                  <span className="font-mono text-emerald-400 font-bold text-sm">Rs {tenderAmount.toLocaleString()}</span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[grandTotal, 1000, 2000, 5000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setTenderAmount(amt)}
                      className="py-2 bg-stone-900 hover:bg-stone-800 text-white font-mono font-bold rounded-xl border border-stone-800"
                    >
                      Rs {amt}
                    </button>
                  ))}
                </div>

                {tenderChange > 0 && (
                  <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center justify-between text-emerald-300 font-bold">
                    <span>Return Change:</span>
                    <span className="font-mono text-base">Rs {tenderChange.toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="flex-1 py-3 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-semibold"
              >
                Back to Ticket
              </button>
              <button
                onClick={handleProcessCheckout}
                className="flex-1 py-3 bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-bold rounded-xl text-xs transition-colors shadow-md cursor-pointer"
              >
                Confirm Settlement →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT RECEIPT / KOT PREVIEW MODAL */}
      {isReceiptOpen && lastCompletedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsReceiptOpen(false)} className="absolute inset-0 bg-stone-950/85 backdrop-blur-sm" />

          <div className="relative w-full max-w-sm bg-white text-stone-900 rounded-2xl shadow-2xl p-6 z-10 space-y-4 font-mono text-xs">
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-stone-400">
              <span className="font-bold text-base block font-sans">{tenant?.name}</span>
              <p className="text-[10px] text-stone-600">{activeBranch?.address || 'Karachi, Pakistan'}</p>
              <p className="text-[10px] text-stone-600">Tel: {activeBranch?.phone} · NTN: {tenant?.taxIdentifier}</p>
              <div className="pt-2 text-stone-800 font-bold text-sm">
                ORDER #{lastCompletedOrder.orderNumber}
              </div>
              <span className="text-[10px] text-stone-500">
                {new Date(lastCompletedOrder.createdAt).toLocaleString()} · {lastCompletedOrder.orderType.toUpperCase()}
              </span>
            </div>

            {/* Line items */}
            <div className="space-y-1.5 py-2 border-b border-dashed border-stone-400 text-[11px]">
              {lastCompletedOrder.items.map((it: any, idx: number) => (
                <div key={idx} className="flex justify-between">
                  <span>{it.quantity}x {it.name}</span>
                  <span>Rs {it.totalPrice}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>Rs {lastCompletedOrder.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>SRB GST (13%):</span>
                <span>Rs {lastCompletedOrder.taxAmount}</span>
              </div>
              <div className="flex justify-between font-bold text-sm pt-1 border-t border-stone-300">
                <span>TOTAL PAID:</span>
                <span>Rs {lastCompletedOrder.grandTotal}</span>
              </div>
            </div>

            <div className="text-center text-[10px] text-stone-500 pt-2 border-t border-dashed border-stone-400">
              <p>Powered by Indolj Enterprise OS</p>
              <p>Direct Food Commerce · 0% Aggregator Fee</p>
            </div>

            <div className="pt-3 flex gap-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2 bg-stone-900 text-white rounded-lg font-sans font-bold flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Thermal Receipt</span>
              </button>
              <button
                onClick={() => setIsReceiptOpen(false)}
                className="py-2 px-4 bg-stone-200 text-stone-800 rounded-lg font-sans font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      </main>
    </div>
  );
};
