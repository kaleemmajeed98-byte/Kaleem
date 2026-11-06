import React, { useState } from 'react';
import {
  ChefHat,
  Volume2,
  VolumeX,
  Clock,
  Bike,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  User,
  Phone,
  DollarSign,
  TrendingUp,
  Percent,
  Search,
  Check,
  RefreshCw,
} from 'lucide-react';
import { Order, OrderStatus, MenuItem, DeliveryRider } from '../../types/indolj';
import { DELIVERY_RIDERS } from '../../data/indoljData';

interface MerchantPortalProps {
  orders: Order[];
  menuItems: MenuItem[];
  onUpdateOrderStatus: (
    orderId: string,
    status: OrderStatus,
    meta?: { prepTime?: number; rider?: DeliveryRider }
  ) => void;
  onToggleMenuItemStock: (itemId: string) => void;
  onAddNewDemoOrder: () => void;
}

export const MerchantPortal: React.FC<MerchantPortalProps> = ({
  orders,
  menuItems,
  onUpdateOrderStatus,
  onToggleMenuItemStock,
  onAddNewDemoOrder,
}) => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [selectedKdsTab, setSelectedKdsTab] = useState<'kds' | 'menu_stock'>('kds');
  const [selectedRiderMap, setSelectedRiderMap] = useState<Record<string, string>>({});

  // Audio chime feedback
  const playAlertSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch {
      // Audio fallback
    }
  };

  const handleAcceptOrder = (orderId: string, minutes: number) => {
    if (soundEnabled) playAlertSound();
    onUpdateOrderStatus(orderId, 'in_kitchen', { prepTime: minutes });
  };

  const handleMarkReady = (orderId: string) => {
    onUpdateOrderStatus(orderId, 'ready');
  };

  const handleDispatchRider = (orderId: string) => {
    const riderId = selectedRiderMap[orderId] || DELIVERY_RIDERS[0].id;
    const rider = DELIVERY_RIDERS.find((r) => r.id === riderId) || DELIVERY_RIDERS[0];
    onUpdateOrderStatus(orderId, 'out_for_delivery', { rider });
  };

  const handleMarkDelivered = (orderId: string) => {
    onUpdateOrderStatus(orderId, 'delivered');
  };

  const handleRejectOrder = (orderId: string) => {
    if (confirm('Are you sure you want to cancel and reject this order?')) {
      onUpdateOrderStatus(orderId, 'cancelled');
    }
  };

  // Group orders for KDS
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const kitchenOrders = orders.filter((o) => o.status === 'accepted' || o.status === 'in_kitchen');
  const readyOrders = orders.filter((o) => o.status === 'ready');
  const outOrders = orders.filter((o) => o.status === 'out_for_delivery');
  const completedOrders = orders.filter((o) => o.status === 'delivered');

  // Business metrics
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.grandTotal, 0);

  // 28% typical commission charged by Foodpanda
  const commissionSaved = Math.round(totalRevenue * 0.28);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner with Merchant Branding & Sound Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-stone-900 border border-stone-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-2xl font-bold text-white">
                Indolj Merchant KDS & POS
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                Live Kitchen Sync
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Real-time incoming orders, kitchen ticket display, rider dispatch & stock control.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playAlertSound();
            }}
            className={`py-2 px-3 text-xs font-semibold rounded-xl border flex items-center gap-2 transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
                : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundEnabled ? 'Order Sound ON' : 'Sound Muted'}</span>
          </button>

          <button
            onClick={() => {
              playAlertSound();
              onAddNewDemoOrder();
            }}
            className="py-2 px-3.5 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Simulate Incoming Order</span>
          </button>
        </div>
      </div>

      {/* Real-Time Business Performance Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-stone-900/70 border border-stone-800">
          <span className="text-xs text-stone-400 block font-medium">Today's Direct Revenue</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-white tabular-nums">
              Rs {totalRevenue.toLocaleString()}
            </span>
          </div>
          <span className="text-[11px] text-emerald-400 mt-1 block font-medium">
            100% Retained via Indolj
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-stone-900/70 border border-stone-800">
          <span className="text-xs text-stone-400 block font-medium">Commission Saved</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-emerald-400 tabular-nums">
              Rs {commissionSaved.toLocaleString()}
            </span>
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">
            Saved vs 28% Foodpanda cut
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-stone-900/70 border border-stone-800">
          <span className="text-xs text-stone-400 block font-medium">Total Orders Today</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-white tabular-nums">
              {orders.length}
            </span>
            <span className="text-xs text-stone-400">orders</span>
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">
            {pendingOrders.length} awaiting kitchen
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-stone-900/70 border border-stone-800">
          <span className="text-xs text-stone-400 block font-medium">Avg Kitchen Prep Time</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-amber-300 tabular-nums">
              24 mins
            </span>
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">
            Target SLA: &lt; 30 mins
          </span>
        </div>

      </div>

      {/* View Switcher: Kitchen KDS vs Menu Stock Manager */}
      <div className="flex items-center gap-2 border-b border-stone-800 pb-3">
        <button
          onClick={() => setSelectedKdsTab('kds')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            selectedKdsTab === 'kds'
              ? 'bg-emerald-400 text-stone-950'
              : 'text-stone-400 hover:text-white bg-stone-900'
          }`}
        >
          Kitchen Display System (KDS Board)
        </button>

        <button
          onClick={() => setSelectedKdsTab('menu_stock')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            selectedKdsTab === 'menu_stock'
              ? 'bg-emerald-400 text-stone-950'
              : 'text-stone-400 hover:text-white bg-stone-900'
          }`}
        >
          Menu Inventory & Stock Control ({menuItems.filter((i) => !i.inStock).length} Sold Out)
        </button>
      </div>

      {/* KDS Board View */}
      {selectedKdsTab === 'kds' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Column 1: New Incoming Orders (Pending) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
              <span className="text-xs font-bold uppercase tracking-wider">
                1. New Incoming
              </span>
              <span className="font-mono font-bold text-xs tabular-nums">
                ({pendingOrders.length})
              </span>
            </div>

            {pendingOrders.length === 0 ? (
              <div className="p-8 rounded-xl bg-stone-900/40 border border-stone-800/80 text-center text-xs text-stone-500">
                No pending orders
              </div>
            ) : (
              pendingOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-4 rounded-xl bg-stone-900 border-2 border-amber-500/60 shadow-lg space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono font-bold text-amber-300 text-sm">
                        #{ord.orderNumber}
                      </span>
                      <span className="text-[11px] text-stone-400 block capitalize">
                        {ord.orderType} · {ord.createdAt}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-white text-xs tabular-nums">
                      Rs {ord.grandTotal.toLocaleString()}
                    </span>
                  </div>

                  {/* Customer info */}
                  <div className="text-xs text-stone-300 space-y-0.5">
                    <p className="font-semibold text-white">{ord.customerName}</p>
                    <p className="text-stone-400 font-mono text-[11px]">{ord.customerPhone}</p>
                    {ord.deliveryAddress && (
                      <p className="text-[11px] text-stone-400 line-clamp-2">
                        {ord.deliveryAddress}
                      </p>
                    )}
                  </div>

                  {/* Items list */}
                  <div className="p-2.5 rounded-lg bg-stone-950 text-xs space-y-1">
                    {ord.items.map((i, idx) => (
                      <div key={idx} className="flex justify-between text-stone-300">
                        <span>
                          <strong className="text-amber-400">{i.quantity}x</strong> {i.item.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  {ord.specialNotes && (
                    <p className="text-[11px] text-amber-300/80 italic">
                      Note: {ord.specialNotes}
                    </p>
                  )}

                  {/* Accept / Reject Buttons */}
                  <div className="pt-2 space-y-2">
                    <span className="text-[10px] text-stone-400 block font-medium">
                      Accept & Set Kitchen Time:
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => handleAcceptOrder(ord.id, 20)}
                        className="py-1.5 px-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-[11px] rounded-lg transition-colors"
                      >
                        20 Mins
                      </button>
                      <button
                        onClick={() => handleAcceptOrder(ord.id, 30)}
                        className="py-1.5 px-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-[11px] rounded-lg transition-colors"
                      >
                        30 Mins
                      </button>
                      <button
                        onClick={() => handleAcceptOrder(ord.id, 45)}
                        className="py-1.5 px-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-[11px] rounded-lg transition-colors"
                      >
                        45 Mins
                      </button>
                    </div>

                    <button
                      onClick={() => handleRejectOrder(ord.id)}
                      className="w-full py-1 text-[11px] text-red-400 hover:text-red-300 transition-colors"
                    >
                      Reject Order
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>

          {/* Column 2: In Kitchen Cooking */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-stone-900 border border-stone-800 text-stone-300">
              <span className="text-xs font-bold uppercase tracking-wider">
                2. Cooking / Prep
              </span>
              <span className="font-mono font-bold text-xs tabular-nums">
                ({kitchenOrders.length})
              </span>
            </div>

            {kitchenOrders.length === 0 ? (
              <div className="p-8 rounded-xl bg-stone-900/40 border border-stone-800/80 text-center text-xs text-stone-500">
                No orders in kitchen
              </div>
            ) : (
              kitchenOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono font-bold text-white text-sm">
                        #{ord.orderNumber}
                      </span>
                      <span className="text-[11px] text-amber-400 block">
                        Prep Time: {ord.prepTimeMinutes || 25} mins
                      </span>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] rounded bg-amber-400/20 text-amber-300 font-semibold">
                      In Tandoor/Grill
                    </span>
                  </div>

                  <div className="text-xs text-stone-300">
                    <p className="font-medium text-white">{ord.customerName}</p>
                    <p className="text-[11px] text-stone-400">{ord.items.length} items</p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-stone-950 text-xs space-y-1">
                    {ord.items.map((i, idx) => (
                      <div key={idx} className="flex justify-between text-stone-300">
                        <span>
                          <strong>{i.quantity}x</strong> {i.item.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleMarkReady(ord.id)}
                    className="w-full py-2 px-3 bg-stone-800 hover:bg-stone-700 text-white font-semibold text-xs rounded-lg transition-colors border border-stone-700 cursor-pointer"
                  >
                    Mark Ready for Dispatch
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Column 3: Ready / Dispatch Rider Assignment */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-stone-900 border border-stone-800 text-stone-300">
              <span className="text-xs font-bold uppercase tracking-wider">
                3. Ready / Dispatch
              </span>
              <span className="font-mono font-bold text-xs tabular-nums">
                ({readyOrders.length})
              </span>
            </div>

            {readyOrders.length === 0 ? (
              <div className="p-8 rounded-xl bg-stone-900/40 border border-stone-800/80 text-center text-xs text-stone-500">
                No orders ready for packing
              </div>
            ) : (
              readyOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono font-bold text-white text-sm">
                        #{ord.orderNumber}
                      </span>
                      <span className="text-[11px] text-emerald-400 block font-medium">
                        Packed & Insulated
                      </span>
                    </div>
                    <span className="font-mono text-xs text-stone-300">
                      Rs {ord.grandTotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <label className="text-stone-400 block text-[11px]">Assign Rider:</label>
                    <select
                      value={selectedRiderMap[ord.id] || DELIVERY_RIDERS[0].id}
                      onChange={(e) =>
                        setSelectedRiderMap({ ...selectedRiderMap, [ord.id]: e.target.value })
                      }
                      className="w-full py-1.5 px-2 bg-stone-950 border border-stone-800 rounded text-xs text-stone-200"
                    >
                      {DELIVERY_RIDERS.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.vehicle})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => handleDispatchRider(ord.id)}
                    className="w-full py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Dispatch with Rider
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Column 4: Out for Delivery / Completed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-stone-900 border border-stone-800 text-stone-300">
              <span className="text-xs font-bold uppercase tracking-wider">
                4. Out / Completed
              </span>
              <span className="font-mono font-bold text-xs tabular-nums">
                ({outOrders.length + completedOrders.length})
              </span>
            </div>

            {outOrders.length === 0 && completedOrders.length === 0 ? (
              <div className="p-8 rounded-xl bg-stone-900/40 border border-stone-800/80 text-center text-xs text-stone-500">
                No orders on road
              </div>
            ) : (
              [...outOrders, ...completedOrders].map((ord) => (
                <div
                  key={ord.id}
                  className="p-4 rounded-xl bg-stone-900/60 border border-stone-800 space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <span className="font-mono font-bold text-white">
                      #{ord.orderNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ord.status === 'delivered'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-400/20 text-amber-300'
                      }`}
                    >
                      {ord.status === 'delivered' ? 'Delivered' : 'On Bike'}
                    </span>
                  </div>

                  <div className="text-stone-300">
                    <p className="font-semibold">{ord.customerName}</p>
                    <p className="text-[11px] text-stone-400">
                      Rider: {ord.assignedRider?.name || 'Tariq Khan'} ({ord.assignedRider?.plateNumber || 'KHI-7821'})
                    </p>
                  </div>

                  {ord.status === 'out_for_delivery' && (
                    <button
                      onClick={() => handleMarkDelivered(ord.id)}
                      className="w-full py-1.5 px-3 bg-stone-800 hover:bg-stone-700 text-emerald-400 font-semibold rounded transition-colors text-xs cursor-pointer"
                    >
                      Confirm Delivered
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* Menu Stock / Inventory Control View */}
      {selectedKdsTab === 'menu_stock' && (
        <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-white">
              Real-Time Dish Availability & 86 List
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              Toggle items out of stock instantly. Changes reflect immediately on customer web and mobile ordering apps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-stone-200 truncate">{item.name}</p>
                  <p className="text-[11px] text-stone-500 font-mono">
                    Rs {item.basePrice.toLocaleString()} · {item.category}
                  </p>
                </div>

                <button
                  onClick={() => onToggleMenuItemStock(item.id)}
                  className={`py-1.5 px-3 rounded-lg font-bold text-xs transition-colors cursor-pointer shrink-0 ${
                    item.inStock
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/40'
                      : 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-emerald-500/20 hover:text-emerald-300'
                  }`}
                >
                  {item.inStock ? 'In Stock' : 'Sold Out'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
