import React, { useState } from 'react';
import { X, ArrowLeft, ExternalLink, Sparkles } from 'lucide-react';
import { StorefrontView } from '../indolj/StorefrontView';
import { ProductCustomizerModal } from '../indolj/ProductCustomizerModal';
import { StorefrontCartDrawer } from '../indolj/StorefrontCartDrawer';
import { LiveOrderTrackerModal } from '../indolj/LiveOrderTrackerModal';
import { Branch, CartItem, MenuItem, MenuItemVariant, Order, OrderStatus, SelectedAddon } from '../../types/indolj';
import { INDOLJ_BRANCHES, INITIAL_MENU_ITEMS, INITIAL_ORDERS } from '../../data/indoljData';

interface StorefrontModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSentToKds?: (order: Order) => void;
}

export const StorefrontModal: React.FC<StorefrontModalProps> = ({
  isOpen,
  onClose,
  onOrderSentToKds,
}) => {
  const [selectedBranch, setSelectedBranch] = useState<Branch>(INDOLJ_BRANCHES[0]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState<boolean>(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(INITIAL_ORDERS[0]);

  if (!isOpen) return null;

  const handleConfirmAddToCart = (customizedData: {
    item: MenuItem;
    quantity: number;
    selectedVariant?: MenuItemVariant;
    selectedAddons: SelectedAddon[];
    selectedSpice?: string;
    specialInstructions?: string;
    unitPrice: number;
  }) => {
    const cartItemId = `cart-${Date.now()}`;
    setCartItems((prev) => [...prev, { cartItemId, ...customizedData }]);
  };

  const handleUpdateQuantity = (cartItemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((i) => (i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const handleRemoveItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const handleOrderPlaced = (newOrder: Order) => {
    setActiveOrder(newOrder);
    setIsTrackerOpen(true);
    if (onOrderSentToKds) {
      onOrderSentToKds(newOrder);
    }
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    if (activeOrder && activeOrder.id === orderId) {
      setActiveOrder({ ...activeOrder, status });
    }
  };

  const totalCartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-stone-950 text-stone-100 overflow-hidden">
      
      {/* Modal Interactive Header */}
      <div className="h-16 px-4 sm:px-6 bg-stone-900 border-b border-stone-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to SaaS Platform</span>
          </button>
          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-stone-800 text-xs text-stone-400">
            <span>Simulating Customer Storefront:</span>
            <strong className="text-emerald-400">mehmaan.indolj.pk</strong>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCartOpen(true)}
            className="py-1.5 px-3 bg-emerald-400 text-stone-950 font-bold text-xs rounded-lg hover:bg-emerald-300 transition-colors cursor-pointer"
          >
            Food Basket ({totalCartCount})
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Interactive Storefront Body */}
      <div className="flex-1 overflow-y-auto">
        <StorefrontView
          branch={selectedBranch}
          menuItems={menuItems}
          onSelectItemToCustomize={(item) => setCustomizingItem(item)}
          activeOrder={activeOrder}
          onOpenOrderTracker={() => setIsTrackerOpen(true)}
        />
      </div>

      {/* Customizer Modal */}
      <ProductCustomizerModal
        item={customizingItem}
        isOpen={!!customizingItem}
        onClose={() => setCustomizingItem(null)}
        onConfirmAddToCart={handleConfirmAddToCart}
      />

      {/* Cart Drawer */}
      <StorefrontCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        branch={selectedBranch}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={() => setCartItems([])}
        onOrderPlaced={handleOrderPlaced}
      />

      {/* Live Tracker */}
      <LiveOrderTrackerModal
        order={activeOrder}
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        onUpdateOrderStatus={handleUpdateOrderStatus}
      />

    </div>
  );
};
