import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, Bike, Store, CheckCircle2, Clock, MapPin, Phone } from 'lucide-react';
import { MenuItem, KARACHI_DELIVERY_ZONES, RESTAURANT_INFO } from '../data/restaurantData';

export interface CartItem {
  item: MenuItem;
  quantity: number;
  notes?: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [orderType, setOrderType] = useState<'delivery' | 'takeout'>('delivery');
  const [selectedZone, setSelectedZone] = useState<string>(KARACHI_DELIVERY_ZONES[1].name); // DMCHS default
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'jazzcash' | 'easypaisa'>('cod');
  const [orderPlaced, setOrderPlaced] = useState<{ id: string; time: string } | null>(null);

  if (!isOpen) return null;

  const currentZone = KARACHI_DELIVERY_ZONES.find((z) => z.name === selectedZone) || KARACHI_DELIVERY_ZONES[0];
  const subtotal = items.reduce((sum, i) => sum + i.item.price * i.quantity, 0);
  const deliveryFee = orderType === 'delivery' ? currentZone.fee : 0;
  const grandTotal = subtotal + deliveryFee;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      alert("Please enter your name and contact phone number.");
      return;
    }
    if (orderType === 'delivery' && !deliveryAddress) {
      alert("Please provide your delivery address.");
      return;
    }

    const orderRef = `MHM-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    setOrderPlaced({
      id: orderRef,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    onClearCart();
  };

  const handleReset = () => {
    setOrderPlaced(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-stone-900 border-l border-stone-800 text-stone-100 flex flex-col justify-between shadow-2xl">
          
          {/* Header */}
          <div className="p-5 border-b border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-100">Your Mehmaan Order</h3>
                <span className="text-[11px] text-stone-400">
                  {orderPlaced ? 'Order Status' : `${items.length} unique items selected`}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {orderPlaced ? (
              /* Order Confirmation Screen */
              <div className="text-center py-8 space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                    Order Received & Sent to Kitchen
                  </span>
                  <h4 className="font-serif text-2xl font-bold text-stone-100 mt-1">
                    Shukriya, {customerName}!
                  </h4>
                  <p className="text-xs text-stone-300 mt-2 max-w-xs mx-auto">
                    Your order reference is <strong className="text-amber-400 font-mono">#{orderPlaced.id}</strong>.
                    Our kitchen chef on Tariq Road is preparing your meal over live coal.
                  </p>
                </div>

                <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 text-left text-xs space-y-2">
                  <div className="flex justify-between text-stone-400">
                    <span>Order Type:</span>
                    <span className="text-stone-200 font-medium capitalize">{orderType}</span>
                  </div>
                  {orderType === 'delivery' ? (
                    <>
                      <div className="flex justify-between text-stone-400">
                        <span>Delivery Sector:</span>
                        <span className="text-stone-200">{selectedZone}</span>
                      </div>
                      <div className="flex justify-between text-stone-400">
                        <span>Est. Delivery Time:</span>
                        <span className="text-amber-400 font-medium">{currentZone.time}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-stone-400">
                      <span>Pickup Ready in:</span>
                      <span className="text-amber-400 font-medium">20–25 minutes</span>
                    </div>
                  )}
                  <div className="flex justify-between text-stone-400">
                    <span>Payment Method:</span>
                    <span className="text-stone-200 uppercase">{paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-stone-400 pt-2 border-t border-stone-800">
                    <span className="font-semibold text-stone-200">Total Payable:</span>
                    <span className="font-bold text-amber-400 tabular-nums">Rs {grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-stone-300 flex items-start gap-2 text-left">
                  <Phone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Our order dispatch rider may contact you at <strong className="text-stone-100">{customerPhone}</strong> for location verification. Questions? Call <a href={`tel:${RESTAURANT_INFO.phone}`} className="underline text-amber-300">{RESTAURANT_INFO.phone}</a>.
                  </span>
                </div>

                <button
                  onClick={handleReset}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
                >
                  Done & Back to Menu
                </button>
              </div>
            ) : items.length === 0 ? (
              /* Empty Cart State */
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-stone-800 flex items-center justify-center text-stone-500 mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-serif text-lg font-bold text-stone-200">Your basket is empty</h4>
                <p className="text-xs text-stone-400 max-w-xs mx-auto">
                  Browse our charcoal BBQ, Shinwari karahi, and fresh tandoori naans to build your feast.
                </p>
                <button
                  onClick={onClose}
                  className="inline-block py-2 px-5 text-xs font-medium text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              /* Populated Cart Form */
              <form id="order-form" onSubmit={handleSubmitOrder} className="space-y-6">
                
                {/* Order Type Selector */}
                <div className="grid grid-cols-2 p-1 bg-stone-950 rounded-lg border border-stone-800">
                  <button
                    type="button"
                    onClick={() => setOrderType('delivery')}
                    className={`py-2 px-3 text-xs font-semibold rounded-md flex items-center justify-center gap-2 transition-colors ${
                      orderType === 'delivery'
                        ? 'bg-amber-400 text-stone-950 shadow-sm'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <Bike className="w-3.5 h-3.5" />
                    <span>Home Delivery</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('takeout')}
                    className={`py-2 px-3 text-xs font-semibold rounded-md flex items-center justify-center gap-2 transition-colors ${
                      orderType === 'takeout'
                        ? 'bg-amber-400 text-stone-950 shadow-sm'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>Takeaway Pickup</span>
                  </button>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-stone-400">
                    <span>Selected Items</span>
                    <button
                      type="button"
                      onClick={onClearCart}
                      className="text-stone-500 hover:text-red-400 transition-colors"
                    >
                      Clear all
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {items.map((cartItem) => (
                      <div
                        key={cartItem.item.id}
                        className="p-3 bg-stone-950 rounded-lg border border-stone-800/80 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-stone-200 truncate">{cartItem.item.name}</p>
                          <p className="text-[11px] text-stone-400 font-mono tabular-nums">
                            Rs {cartItem.item.price.toLocaleString()} × {cartItem.quantity} = Rs {(cartItem.item.price * cartItem.quantity).toLocaleString()}
                          </p>
                        </div>

                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-2 bg-stone-900 border border-stone-800 rounded-md px-1.5 py-1">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(cartItem.item.id, -1)}
                            className="text-stone-400 hover:text-white p-0.5"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-semibold text-stone-100 tabular-nums w-4 text-center">
                            {cartItem.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(cartItem.item.id, 1)}
                            className="text-stone-400 hover:text-white p-0.5"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveItem(cartItem.item.id)}
                          className="text-stone-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Zone / Takeout Info */}
                {orderType === 'delivery' ? (
                  <div className="space-y-2">
                    <label className="text-xs text-stone-300 font-medium block">
                      Select Karachi Delivery Zone
                    </label>
                    <select
                      value={selectedZone}
                      onChange={(e) => setSelectedZone(e.target.value)}
                      className="w-full py-2 px-3 bg-stone-950 border border-stone-800 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                    >
                      {KARACHI_DELIVERY_ZONES.map((zone) => (
                        <option key={zone.name} value={zone.name}>
                          {zone.name} (+Rs {zone.fee} fee · {zone.time})
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      required
                      placeholder="Street address, house/flat #, landmark..."
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full py-2 px-3 bg-stone-950 border border-stone-800 rounded-lg text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                ) : (
                  <div className="p-3 bg-stone-950 rounded-lg border border-stone-800 text-xs text-stone-300 space-y-1">
                    <p className="font-semibold text-amber-300">Takeout Pickup Counter</p>
                    <p className="text-stone-400">
                      Plot 20, Shop 4, Alrehman Corner, DMCHS, Tariq Rd (Opposite Traffic Choki), Karachi.
                    </p>
                    <p className="text-[11px] text-stone-500">
                      Ready for pickup in approx. 20 minutes from placement.
                    </p>
                  </div>
                )}

                {/* Customer Contact */}
                <div className="space-y-2">
                  <label className="text-xs text-stone-300 font-medium block">
                    Contact Details
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Your Name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full py-2 px-3 bg-stone-950 border border-stone-800 rounded-lg text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="0321-XXXXXXX"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full py-2 px-3 bg-stone-950 border border-stone-800 rounded-lg text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Cooking notes (e.g. extra mint raita, less spicy)..."
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    className="w-full py-2 px-3 bg-stone-950 border border-stone-800 rounded-lg text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Payment Option */}
                <div className="space-y-1.5">
                  <label className="text-xs text-stone-300 font-medium block">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'cod', label: 'Cash on Deliv.' },
                      { id: 'jazzcash', label: 'JazzCash' },
                      { id: 'easypaisa', label: 'EasyPaisa' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as any)}
                        className={`py-1.5 px-2 text-[11px] font-medium rounded border transition-colors ${
                          paymentMethod === m.id
                            ? 'bg-amber-400/20 border-amber-500 text-amber-300'
                            : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

              </form>
            )}
          </div>

          {/* Footer Checkout Bar */}
          {!orderPlaced && items.length > 0 && (
            <div className="p-5 border-t border-stone-800 bg-stone-950 space-y-3">
              <div className="space-y-1.5 text-xs text-stone-400">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="text-stone-200 font-mono tabular-nums">Rs {subtotal.toLocaleString()}</span>
                </div>
                {orderType === 'delivery' && (
                  <div className="flex justify-between">
                    <span>Karachi Delivery ({selectedZone}):</span>
                    <span className="text-stone-200 font-mono tabular-nums">Rs {deliveryFee}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-semibold text-stone-100 pt-1 border-t border-stone-800">
                  <span>Total Amount:</span>
                  <span className="text-amber-400 font-mono font-bold tabular-nums">Rs {grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                form="order-form"
                className="w-full py-3 px-4 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer shadow-md shadow-amber-500/10 active:scale-95"
              >
                Place {orderType === 'delivery' ? 'Delivery' : 'Takeout'} Order (Rs {grandTotal.toLocaleString()})
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
