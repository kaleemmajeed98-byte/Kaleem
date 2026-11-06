import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  Bike,
  Store,
  QrCode,
  Tag,
  Check,
  AlertCircle,
  Clock,
  Sparkles,
  Phone,
  CreditCard,
  Banknote,
  Wallet,
} from 'lucide-react';
import {
  CartItem,
  OrderType,
  Branch,
  PromoCode,
  Order,
} from '../../types/indolj';
import { KARACHI_AREAS, PROMO_CODES } from '../../data/indoljData';

interface StorefrontCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  branch: Branch;
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onOrderPlaced: (order: Order) => void;
}

export const StorefrontCartDrawer: React.FC<StorefrontCartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  branch,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderPlaced,
}) => {
  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [deliveryArea, setDeliveryArea] = useState<string>(KARACHI_AREAS[0]);
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [tableNumber, setTableNumber] = useState<string>('T-12');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [specialNotes, setSpecialNotes] = useState<string>('');
  const [promoInput, setPromoInput] = useState<string>('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'jazzcash' | 'easypaisa' | 'card'>('cod');

  if (!isOpen) return null;

  // Pricing math
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  let discount = 0;
  if (appliedPromo) {
    if (appliedPromo.discountType === 'percentage') {
      discount = Math.round((subtotal * appliedPromo.discountValue) / 100);
    } else if (appliedPromo.discountType === 'fixed') {
      discount = appliedPromo.discountValue;
    }
  }

  const rawDeliveryFee = orderType === 'delivery' ? branch.deliveryFee : 0;
  const deliveryFee = appliedPromo?.discountType === 'free_delivery' ? 0 : rawDeliveryFee;
  const grandTotal = Math.max(0, subtotal - discount + deliveryFee);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError(null);
    const cleanCode = promoInput.trim().toUpperCase();
    const found = PROMO_CODES.find((p) => p.code === cleanCode);

    if (!found) {
      setPromoError('Invalid promo code. Try INDOLJ20 or FREEDEL');
      return;
    }
    if (subtotal < found.minOrder) {
      setPromoError(`Minimum order of Rs ${found.minOrder} required for ${found.code}`);
      return;
    }

    setAppliedPromo(found);
    setPromoInput('');
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      alert('Please enter your name and contact phone number.');
      return;
    }
    if (orderType === 'delivery' && !deliveryAddress) {
      alert('Please enter your delivery street address in Karachi.');
      return;
    }

    const orderNumber = `IND-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      orderType,
      branch,
      items: [...items],
      customerName,
      customerPhone,
      deliveryArea: orderType === 'delivery' ? deliveryArea : undefined,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined,
      tableNumber: orderType === 'dinein' ? tableNumber : undefined,
      specialNotes: specialNotes.trim() || undefined,
      subtotal,
      discount,
      deliveryFee,
      grandTotal,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'unpaid' : 'paid',
      status: 'pending',
      createdAt: 'Just now',
      estimatedDeliveryTime: orderType === 'delivery' ? '30–40 mins' : '20 mins',
    };

    onOrderPlaced(newOrder);
    onClearCart();
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
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-bold text-white">Your Food Basket</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium">
                  {branch.name}
                </span>
              </div>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Powered by Indolj Direct Online Ordering
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 rounded-full bg-stone-800 flex items-center justify-center text-stone-500 mx-auto">
                  <Store className="w-8 h-8" />
                </div>
                <h4 className="font-serif text-lg font-bold text-stone-200">
                  Your cart is empty
                </h4>
                <p className="text-xs text-stone-400 max-w-xs mx-auto">
                  Select your favorite charcoal BBQ, handis, or biryani to start your direct order.
                </p>
              </div>
            ) : (
              <form id="checkout-form" onSubmit={handleCheckout} className="space-y-5">
                
                {/* Order Type Tabs */}
                <div className="grid grid-cols-3 p-1 bg-stone-950 rounded-xl border border-stone-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setOrderType('delivery')}
                    className={`py-2 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      orderType === 'delivery'
                        ? 'bg-emerald-500 text-stone-950 shadow-sm'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <Bike className="w-3.5 h-3.5" />
                    <span>Delivery</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('takeaway')}
                    className={`py-2 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      orderType === 'takeaway'
                        ? 'bg-emerald-500 text-stone-950 shadow-sm'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>Takeaway</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('dinein')}
                    className={`py-2 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      orderType === 'dinein'
                        ? 'bg-emerald-500 text-stone-950 shadow-sm'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Dine-In QR</span>
                  </button>
                </div>

                {/* Items List */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-stone-400">
                    <span>Order Items ({items.length})</span>
                    <button
                      type="button"
                      onClick={onClearCart}
                      className="text-stone-500 hover:text-red-400 transition-colors"
                    >
                      Clear all
                    </button>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {items.map((cartItem) => (
                      <div
                        key={cartItem.cartItemId}
                        className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-xs space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-semibold text-stone-200 block">
                              {cartItem.item.name}
                            </span>
                            {cartItem.selectedVariant && (
                              <span className="text-[11px] text-emerald-400 block">
                                Portion: {cartItem.selectedVariant.name}
                              </span>
                            )}
                            {cartItem.selectedSpice && (
                              <span className="text-[11px] text-amber-400/90 block">
                                Spice: {cartItem.selectedSpice}
                              </span>
                            )}
                            {cartItem.selectedAddons.length > 0 && (
                              <span className="text-[11px] text-stone-400 block">
                                Extras: {cartItem.selectedAddons.map((a) => a.name).join(', ')}
                              </span>
                            )}
                            {cartItem.specialInstructions && (
                              <span className="text-[11px] text-stone-500 italic block">
                                Note: {cartItem.specialInstructions}
                              </span>
                            )}
                          </div>

                          <span className="font-mono font-bold text-stone-200 tabular-nums">
                            Rs {(cartItem.unitPrice * cartItem.quantity).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-stone-900">
                          <span className="text-[11px] text-stone-500 font-mono">
                            Rs {cartItem.unitPrice.toLocaleString()} each
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 bg-stone-900 border border-stone-800 rounded-lg px-2 py-0.5">
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(cartItem.cartItemId, -1)}
                                className="text-stone-400 hover:text-white"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-bold text-stone-100 tabular-nums w-4 text-center">
                                {cartItem.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(cartItem.cartItemId, 1)}
                                className="text-stone-400 hover:text-white"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => onRemoveItem(cartItem.cartItemId)}
                              className="text-stone-500 hover:text-red-400 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>

                {/* Promo Code Input */}
                <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-300 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Indolj Promo Voucher</span>
                    </span>
                    {appliedPromo && (
                      <button
                        type="button"
                        onClick={() => setAppliedPromo(null)}
                        className="text-[10px] text-stone-400 hover:text-red-400"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {appliedPromo ? (
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="font-mono font-bold">{appliedPromo.code}</span>
                      </div>
                      <span className="text-[11px]">{appliedPromo.description}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Try INDOLJ20 or FREEDEL"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        className="flex-1 py-1.5 px-3 bg-stone-900 border border-stone-800 rounded-lg text-xs text-stone-200 uppercase tracking-wider focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        className="py-1.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                  )}

                  {promoError && (
                    <p className="text-[11px] text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{promoError}</span>
                    </p>
                  )}
                </div>

                {/* Delivery Area & Address or Table Selection */}
                {orderType === 'delivery' && (
                  <div className="space-y-2 text-xs">
                    <label className="font-semibold text-stone-300 block">
                      Karachi Delivery Area
                    </label>
                    <select
                      value={deliveryArea}
                      onChange={(e) => setDeliveryArea(e.target.value)}
                      className="w-full py-2 px-3 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 focus:outline-none focus:border-emerald-500"
                    >
                      {KARACHI_AREAS.map((area) => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      required
                      placeholder="Complete House / Flat / Street Address..."
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full py-2 px-3 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}

                {orderType === 'dinein' && (
                  <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 space-y-2 text-xs">
                    <label className="font-semibold text-stone-300 block">
                      Table Number (from QR Standee)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Table 14"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      className="w-full py-2 px-3 bg-stone-900 border border-stone-800 rounded-lg text-stone-200 focus:outline-none focus:border-emerald-500"
                    />
                    <p className="text-[11px] text-stone-500">
                      Food will be delivered straight to your table by restaurant captains.
                    </p>
                  </div>
                )}

                {/* Customer Contact */}
                <div className="space-y-2 text-xs">
                  <label className="font-semibold text-stone-300 block">
                    Customer Information
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Your Full Name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="py-2 px-3 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="0321-XXXXXXX"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="py-2 px-3 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Delivery notes for rider (e.g. near mosque, ring bell)..."
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    className="w-full py-2 px-3 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Payment Option */}
                <div className="space-y-2 text-xs">
                  <label className="font-semibold text-stone-300 block">
                    Payment Gateway
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'cod', label: 'Cash on Delivery', icon: Banknote },
                      { id: 'jazzcash', label: 'JazzCash Wallet', icon: Wallet },
                      { id: 'easypaisa', label: 'EasyPaisa Wallet', icon: Wallet },
                      { id: 'card', label: 'Card on Delivery', icon: CreditCard },
                    ].map((m) => {
                      const Icon = m.icon;
                      const isSel = paymentMethod === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setPaymentMethod(m.id as any)}
                          className={`p-2.5 rounded-lg border flex items-center gap-2 text-left transition-colors ${
                            isSel
                              ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                              : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                          }`}
                        >
                          <Icon className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="text-[11px] font-medium">{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </form>
            )}
          </div>

          {/* Footer Checkout Bar */}
          {items.length > 0 && (
            <div className="p-5 border-t border-stone-800 bg-stone-950 space-y-3">
              <div className="space-y-1.5 text-xs text-stone-400">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="text-stone-200 font-mono tabular-nums">
                    Rs {subtotal.toLocaleString()}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount ({appliedPromo?.code}):</span>
                    <span className="font-mono tabular-nums">-Rs {discount.toLocaleString()}</span>
                  </div>
                )}
                {orderType === 'delivery' && (
                  <div className="flex justify-between">
                    <span>Delivery Fee ({branch.name.split(' ')[0]}):</span>
                    <span className="text-stone-200 font-mono tabular-nums">
                      {deliveryFee === 0 ? 'FREE' : `Rs ${deliveryFee}`}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-stone-100 pt-1.5 border-t border-stone-800">
                  <span>Grand Total:</span>
                  <span className="text-emerald-400 font-mono text-base tabular-nums">
                    Rs {grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                className="w-full py-3 px-4 text-xs font-bold text-stone-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-lg shadow-emerald-500/10 cursor-pointer flex items-center justify-between active:scale-95"
              >
                <span>Place Order with Indolj</span>
                <span className="font-mono tabular-nums">Rs {grandTotal.toLocaleString()}</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
