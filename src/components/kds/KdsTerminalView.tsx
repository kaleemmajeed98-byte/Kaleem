import React, { useState, useEffect, useRef } from 'react';
import {
  ChefHat,
  Clock,
  Check,
  AlertTriangle,
  Volume2,
  VolumeX,
  RefreshCw,
  Maximize2,
  Filter,
  Flame,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface KdsOrder {
  id: string;
  orderNumber: string;
  channel: string;
  orderType: string;
  tableNumber?: string;
  customerName: string;
  customerPhone: string;
  items: {
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    station: string;
    notes?: string;
    variant?: string;
    itemStatus: 'pending' | 'cooking' | 'ready';
  }[];
  subtotal: number;
  grandTotal: number;
  kdsStatus: 'new' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export const KdsTerminalView: React.FC = () => {
  const { tenant, activeBranch, branches, switchBranch, token } = useAuth();

  const [orders, setOrders] = useState<KdsOrder[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>('ALL');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showCompleted, setShowCompleted] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const [soundError, setSoundError] = useState<string | null>(null);
  const hasLoadedOrders = useRef(false);
  const newOrderIds = useRef<Set<string>>(new Set());

  // Web Audio synthesizer chime for new incoming KDS tickets
  const playKitchenChime = () => {
    try {
      const audioCtx = new window.AudioContext();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, audioCtx.currentTime + 0.15); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, audioCtx.currentTime + 0.3); // G5
      gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.onended = () => void audioCtx.close();
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
      setSoundError(null);
    } catch (error) {
      console.warn('[KDS] Kitchen chime could not be played:', error);
      setSoundError('Kitchen sound could not be played. Check browser audio permissions.');
    }
  };

  const fetchOrders = async () => {
    if (!token) {
      setIsLoading(false);
      setRequestError('You must sign in to load kitchen tickets.');
      return;
    }
    try {
      const query = new URLSearchParams();
      if (tenant?.id) query.set('tenantId', tenant.id);
      if (activeBranch?.id) query.set('branchId', activeBranch.id);
      const res = await fetch(`/api/v1/orders?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success || !Array.isArray(data.data)) {
        throw new Error(data.error?.message || `Unable to load kitchen tickets (${res.status})`);
      }
      const currentNewOrderIds = new Set<string>(
        data.data.filter((order: KdsOrder) => order.kdsStatus === 'new').map((order: KdsOrder) => order.id)
      );
      const hasIncomingOrders = [...currentNewOrderIds].some((id) => !newOrderIds.current.has(id));
      if (hasLoadedOrders.current && soundEnabled && hasIncomingOrders) playKitchenChime();
      newOrderIds.current = currentNewOrderIds;
      hasLoadedOrders.current = true;
      setOrders(data.data);
      setRequestError(null);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'Unable to load kitchen tickets.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      void fetchOrders();
      return;
    }
    fetchOrders();
    const interval = setInterval(fetchOrders, 4000); // Poll every 4 seconds for live kitchen updates
    return () => clearInterval(interval);
  }, [token, tenant, activeBranch, soundEnabled]);

  // Advance Order Status
  const handleAdvanceOrder = async (order: KdsOrder) => {
    setIsMutating(true);
    let nextStatus: KdsOrder['kdsStatus'] = 'accepted';
    if (order.kdsStatus === 'new') nextStatus = 'accepted';
    else if (order.kdsStatus === 'accepted') nextStatus = 'preparing';
    else if (order.kdsStatus === 'preparing') nextStatus = 'ready';
    else if (order.kdsStatus === 'ready') nextStatus = 'completed';

    try {
      const response = await fetch(`/api/v1/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || `Unable to update ticket (${response.status})`);
      }
      await fetchOrders();
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'Unable to update ticket status.');
    } finally {
      setIsMutating(false);
    }
  };

  // Toggle item-level checkoff
  const handleToggleItemStatus = async (
    orderId: string,
    itemId: string,
    currentStatus: 'pending' | 'cooking' | 'ready'
  ) => {
    const nextStatus: 'cooking' | 'ready' = currentStatus === 'ready' ? 'cooking' : 'ready';

    setIsMutating(true);
    try {
      const response = await fetch(`/api/v1/orders/${orderId}/items/${itemId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || `Unable to update kitchen item (${response.status})`);
      }
      await fetchOrders();
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'Unable to update kitchen item.');
    } finally {
      setIsMutating(false);
    }
  };

  // Order aging timer calculation (minutes elapsed)
  const getElapsedMinutes = (createdAt: string) => {
    const diffMs = Date.now() - new Date(createdAt).getTime();
    return Math.max(0, Math.floor(diffMs / 60000));
  };

  // Filter orders by station
  const filteredOrders = orders.filter((order) => {
    if (showCompleted ? order.kdsStatus !== 'completed' : ['completed', 'cancelled'].includes(order.kdsStatus)) return false;
    if (selectedStation === 'ALL') return true;
    return order.items.some((it) => it.station === selectedStation);
  });

  return (
    <div className="min-h-0 flex-1 flex flex-col bg-stone-950 text-stone-100 overflow-hidden font-sans">
      
      {/* KDS Header Bar */}
      <div className="bg-stone-900 border-b border-stone-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        
        {/* Left: Brand & Station Selector */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center font-bold text-amber-400">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white text-sm block">
                {tenant?.name} KDS
              </span>
              <span className="text-[10px] text-stone-400 font-mono">
                Outlet: {activeBranch?.name || 'All'} · Station Routing Active
              </span>
            </div>
          </div>

          {/* Station Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-950 rounded-xl border border-stone-800 text-xs">
            {[
              { id: 'ALL', label: 'All Stations' },
              { id: 'GRILL', label: 'Charcoal Grill' },
              { id: 'KARAHI_WOK', label: 'Karahi & Handi' },
              { id: 'TANDOOR', label: 'Tandoor Breads' },
              { id: 'BEVERAGE_DESSERT', label: 'Drinks & Desserts' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStation(st.id)}
                aria-pressed={selectedStation === st.id}
                className={`py-1 px-2.5 rounded-lg font-bold text-[11px] transition-colors cursor-pointer whitespace-nowrap ${
                  selectedStation === st.id
                    ? 'bg-amber-400 text-stone-950 shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowCompleted((current) => !current)}
            aria-pressed={showCompleted}
            className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
              showCompleted
                ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                : 'border-stone-800 bg-stone-950 text-stone-400 hover:text-white'
            }`}
          >
            Completed ({orders.filter((order) => order.kdsStatus === 'completed').length})
          </button>
        </div>

        {/* Right: Audio Chime & Controls */}
        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) {
                setSoundError(null);
                playKitchenChime();
              }
            }}
            className={`py-1.5 px-3 rounded-lg border flex items-center gap-1.5 cursor-pointer ${
              soundEnabled
                ? 'bg-amber-400/20 border-amber-400/40 text-amber-300'
                : 'bg-stone-950 border-stone-800 text-stone-400'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundEnabled ? 'Kitchen Bell ON' : 'Muted'}</span>
          </button>

          <button
            onClick={fetchOrders}
            className="p-2 rounded-lg bg-stone-800 text-stone-300 hover:text-white"
            title="Refresh Tickets"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {requestError && (
        <div role="alert" className="flex shrink-0 items-center gap-3 border-b border-red-500/30 bg-red-950/60 px-4 py-2 text-sm text-red-200">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span className="flex-1">{requestError}</span>
          <button type="button" onClick={fetchOrders} className="rounded border border-red-400/40 px-2.5 py-1 text-xs font-semibold hover:bg-red-900/50">
            Retry
          </button>
        </div>
      )}
      {soundError && (
        <div role="status" className="flex shrink-0 items-center gap-2 border-b border-amber-500/30 bg-amber-950/50 px-4 py-2 text-sm text-amber-200">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{soundError}</span>
        </div>
      )}

      {/* Main 4-Stage Kanban Screen */}
      <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-hidden bg-stone-950">
        {isLoading && orders.length === 0 ? (
          <div className="col-span-full flex items-center justify-center text-sm text-stone-400" role="status">
            Loading kitchen tickets…
          </div>
        ) : [
          {
            title: '1. New Incoming',
            status: 'new',
            badgeBg: 'bg-amber-400 text-stone-950',
            borderColor: 'border-amber-500/80',
            nextAction: 'Accept to Cook →',
          },
          {
            title: '2. Accepted in Queue',
            status: 'accepted',
            badgeBg: 'bg-sky-400 text-stone-950',
            borderColor: 'border-sky-500/80',
            nextAction: 'Fire to Stove / Grill →',
          },
          {
            title: '3. Cooking / Preparing',
            status: 'preparing',
            badgeBg: 'bg-orange-500 text-white',
            borderColor: 'border-orange-500/80',
            nextAction: 'Mark All Ready →',
          },
          {
            title: '4. Ready for Expediter',
            status: 'ready',
            badgeBg: 'bg-emerald-400 text-stone-950',
            borderColor: 'border-emerald-500/80',
            nextAction: 'Dispatch & Complete ✓',
          },
          ...(showCompleted ? [{
            title: 'Completed Orders',
            status: 'completed',
            badgeBg: 'bg-stone-700 text-stone-100',
            borderColor: 'border-stone-700',
            nextAction: '',
          }] : []),
        ].map((col) => {
          const colOrders = filteredOrders.filter((o) => o.kdsStatus === col.status);
          return (
            <div
              key={col.status}
              className="flex flex-col bg-stone-900/40 rounded-2xl border border-stone-800/80 overflow-hidden"
            >
              {/* Column Header */}
              <div className="p-3 bg-stone-900 border-b border-stone-800 flex items-center justify-between shrink-0">
                <span className="font-bold text-white text-xs">{col.title}</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold font-mono ${col.badgeBg}`}>
                  {colOrders.length}
                </span>
              </div>

              {/* Order Cards Stream */}
              <div className="flex-1 p-3 overflow-y-auto space-y-3">
                {colOrders.length === 0 ? (
                  <div className="h-40 flex items-center justify-center text-center text-stone-600 text-xs">
                    No active tickets
                  </div>
                ) : (
                  colOrders.map((order) => {
                    const elapsedMin = getElapsedMinutes(order.createdAt);
                    const isDelayed = elapsedMin > 20;
                    const isWarning = elapsedMin > 10;

                    return (
                      <div
                        key={order.id}
                        className={`p-3.5 rounded-2xl bg-stone-900 border ${
                          isDelayed ? 'border-red-500 animate-pulse' : col.borderColor
                        } space-y-3 shadow-xl transition-all`}
                      >
                        {/* Ticket Top Meta */}
                        <div className="flex items-start justify-between gap-2 text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-base text-white">
                                #{order.orderNumber}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded font-bold uppercase bg-stone-950 text-stone-300 border border-stone-800">
                                {order.orderType}
                              </span>
                            </div>
                            <span className="text-[11px] text-stone-400">
                              {order.tableNumber ? `Table: ${order.tableNumber}` : order.customerName}
                            </span>
                          </div>

                          {/* Elapsed Timer */}
                          <div
                            className={`px-2 py-1 rounded-lg font-mono font-bold text-xs flex items-center gap-1 ${
                              isDelayed
                                ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                                : isWarning
                                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                                : 'bg-stone-950 text-emerald-400 border border-stone-800'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>{elapsedMin}m</span>
                          </div>
                        </div>

                        {/* Item Checklist for Kitchen Cooks */}
                        <div className="space-y-1.5 bg-stone-950 p-2.5 rounded-xl border border-stone-800 text-xs">
                          {order.items
                            .filter((it) => selectedStation === 'ALL' || it.station === selectedStation)
                            .map((it) => {
                              const isItemDone = it.itemStatus === 'ready';
                              return (
                                <button
                                  key={it.id}
                                  type="button"
                                  disabled={showCompleted || isMutating}
                                  onClick={() => void handleToggleItemStatus(order.id, it.id, it.itemStatus)}
                                  className={`flex w-full items-start justify-between p-1.5 text-left rounded-lg transition-colors select-none disabled:cursor-default ${
                                    isItemDone
                                      ? 'bg-emerald-950/40 text-emerald-400 line-through opacity-70'
                                      : `text-stone-200 ${showCompleted ? '' : 'cursor-pointer hover:bg-stone-900'}`
                                  }`}
                                >
                                  <div className="space-y-0.5">
                                    <span className="font-semibold block">
                                      <strong className="text-amber-400 font-bold">{it.quantity}x</strong> {it.name}
                                    </span>
                                    {it.variant && (
                                      <span className="text-[10px] text-stone-400 font-mono block">
                                        [{it.variant}]
                                      </span>
                                    )}
                                    {it.notes && (
                                      <span className="text-[10px] text-amber-300 block font-medium">
                                        Note: {it.notes}
                                      </span>
                                    )}
                                  </div>

                                  <div
                                    className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border ${
                                      isItemDone
                                        ? 'bg-emerald-500 border-emerald-400 text-stone-950'
                                        : 'border-stone-700 bg-stone-900'
                                    }`}
                                  >
                                    {isItemDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                  </div>
                                </button>
                              );
                            })}
                        </div>

                        {/* Bump Action Button */}
                        {!showCompleted && <button
                          disabled={isMutating}
                          onClick={() => handleAdvanceOrder(order)}
                          className="w-full py-2.5 bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <span>{col.nextAction}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}

      </div>

    </div>
  );
};
