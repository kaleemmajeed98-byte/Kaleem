import React, { useState } from 'react';
import { X, Plus, Minus, Check, Flame, Users, Sparkles } from 'lucide-react';
import { MenuItem, MenuItemVariant, SelectedAddon } from '../../types/indolj';

interface ProductCustomizerModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmAddToCart: (customizedData: {
    item: MenuItem;
    quantity: number;
    selectedVariant?: MenuItemVariant;
    selectedAddons: SelectedAddon[];
    selectedSpice?: string;
    specialInstructions?: string;
    unitPrice: number;
  }) => void;
}

export const ProductCustomizerModal: React.FC<ProductCustomizerModalProps> = ({
  item,
  isOpen,
  onClose,
  onConfirmAddToCart,
}) => {
  if (!isOpen || !item) return null;

  const [quantity, setQuantity] = useState<number>(1);
  const [selectedVariant, setSelectedVariant] = useState<MenuItemVariant | undefined>(
    item.variants?.[0]
  );
  const [selectedSpice, setSelectedSpice] = useState<string | undefined>(
    item.spiceLevels?.[0]
  );
  const [selectedAddons, setSelectedAddons] = useState<SelectedAddon[]>([]);
  const [instructions, setInstructions] = useState<string>('');

  // Calculate Unit Price
  const base = item.basePrice;
  const variantDelta = selectedVariant ? selectedVariant.priceDelta : 0;
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const unitPrice = base + variantDelta + addonsTotal;
  const grandTotal = unitPrice * quantity;

  const toggleAddon = (addon: { id: string; name: string; price: number }) => {
    setSelectedAddons((prev) => {
      const exists = prev.some((a) => a.id === addon.id);
      if (exists) {
        return prev.filter((a) => a.id !== addon.id);
      } else {
        return [...prev, addon];
      }
    });
  };

  const handleConfirm = () => {
    onConfirmAddToCart({
      item,
      quantity,
      selectedVariant,
      selectedAddons,
      selectedSpice,
      specialInstructions: instructions.trim() || undefined,
      unitPrice,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm transition-opacity"
      />

      <div className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden z-10 text-stone-100 flex flex-col max-h-[90vh]">
        
        {/* Header with image */}
        <div className="relative h-44 sm:h-52 bg-stone-950 overflow-hidden shrink-0">
          <img
            src={item.image}
            alt={item.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-stone-950/70 hover:bg-stone-950 text-stone-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-3 left-4 right-4">
            {item.isDeal && (
              <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-400 text-stone-950 rounded uppercase tracking-wider mb-1 inline-block">
                Special Combo Deal
              </span>
            )}
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white drop-shadow-md">
              {item.name}
            </h3>
            {item.urduName && (
              <span className="text-xs text-amber-300 font-serif font-medium drop-shadow">
                {item.urduName}
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Customization Options */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          
          <p className="text-xs text-stone-300 leading-relaxed">
            {item.description}
          </p>

          {item.serves && (
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Recommended for: <strong className="text-stone-200">{item.serves}</strong></span>
            </div>
          )}

          {/* Variant Selector (if item has variants) */}
          {item.variants && item.variants.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-stone-800">
              <label className="text-xs font-semibold text-stone-200 flex items-center justify-between">
                <span>Select Portion Size</span>
                <span className="text-[10px] text-amber-400 font-medium">Required</span>
              </label>
              <div className="grid grid-cols-1 gap-2">
                {item.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300'
                          : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700'
                      }`}
                    >
                      <span className="text-xs font-medium">{v.name}</span>
                      <span className="text-xs font-mono font-semibold tabular-nums">
                        {v.priceDelta > 0 ? `+Rs ${v.priceDelta.toLocaleString()}` : 'Base Price'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Spice Level Selector */}
          {item.spiceLevels && item.spiceLevels.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-stone-800">
              <label className="text-xs font-semibold text-stone-200 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Spice Preference</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {item.spiceLevels.map((spice) => {
                  const isSelected = selectedSpice === spice;
                  return (
                    <button
                      key={spice}
                      type="button"
                      onClick={() => setSelectedSpice(spice)}
                      className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-colors ${
                        isSelected
                          ? 'bg-amber-400/15 border-amber-500 text-amber-300 font-semibold'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {spice}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add-ons Selector */}
          {item.addons && item.addons.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-stone-800">
              <label className="text-xs font-semibold text-stone-200 flex items-center justify-between">
                <span>Frequently Added Extras</span>
                <span className="text-[10px] text-stone-500 font-medium">Optional</span>
              </label>
              <div className="space-y-2">
                {item.addons.map((addon) => {
                  const isChecked = selectedAddons.some((a) => a.id === addon.id);
                  return (
                    <label
                      key={addon.id}
                      onClick={() => toggleAddon(addon)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-emerald-500/10 border-emerald-500/60 text-emerald-200'
                          : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border ${
                            isChecked
                              ? 'bg-emerald-500 border-emerald-500 text-stone-950'
                              : 'border-stone-600 bg-stone-900'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="text-xs">{addon.name}</span>
                      </div>
                      <span className="text-xs font-mono font-medium text-stone-400">
                        +Rs {addon.price}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cooking Instructions */}
          <div className="space-y-1.5 pt-2 border-t border-stone-800">
            <label className="text-xs font-semibold text-stone-300">
              Cooking Notes for Chef (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Less oil, well-done charcoal char, extra lemon..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full py-2 px-3 bg-stone-950 border border-stone-800 rounded-lg text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

        </div>

        {/* Footer with Quantity Stepper & Add to Order CTA */}
        <div className="p-4 border-t border-stone-800 bg-stone-950 flex items-center justify-between gap-4 shrink-0">
          
          {/* Quantity Stepper */}
          <div className="flex items-center gap-3 bg-stone-900 border border-stone-800 rounded-xl px-2.5 py-1.5">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="p-1 text-stone-400 hover:text-white transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-bold text-sm text-stone-100 tabular-nums w-5 text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="p-1 text-stone-400 hover:text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Order Button */}
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 px-5 text-xs font-bold text-stone-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-md shadow-emerald-500/10 cursor-pointer flex items-center justify-between active:scale-95"
          >
            <span>Add to Cart</span>
            <span className="font-mono tabular-nums text-sm">
              Rs {grandTotal.toLocaleString()}
            </span>
          </button>

        </div>

      </div>
    </div>
  );
};
