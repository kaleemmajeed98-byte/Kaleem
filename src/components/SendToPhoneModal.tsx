import React, { useState } from 'react';
import { X, Smartphone, MessageCircle, Send, Check } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/restaurantData';

interface SendToPhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SendToPhoneModal: React.FC<SendToPhoneModalProps> = ({ isOpen, onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [sentSuccess, setSentSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const shareText = `*${RESTAURANT_INFO.name}* (Rated 4.6★)
📍 Address: ${RESTAURANT_INFO.address}
🗺️ Plus Code: ${RESTAURANT_INFO.plusCode}
🕒 Hours: ${RESTAURANT_INFO.hours}
📞 Phone: ${RESTAURANT_INFO.phoneFormatted}
Dine-in · Takeout · Delivery`;

  const handleWhatsAppSend = () => {
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    const url = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(shareText)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setSentSuccess(true);
  };

  const handleSmsSend = () => {
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    const url = `sms:${cleanPhone}?body=${encodeURIComponent(shareText)}`;
    window.location.href = url;
    setSentSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm transition-opacity"
      />

      <div className="relative w-full max-w-md bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden z-10 text-stone-100 p-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-100">Send to Phone</h3>
              <p className="text-xs text-stone-400">Save location & directions on your mobile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info summary */}
        <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800/80 text-xs text-stone-300 space-y-1">
          <p className="font-semibold text-stone-100">{RESTAURANT_INFO.name}</p>
          <p className="text-stone-400 text-[11px]">{RESTAURANT_INFO.shortAddress}</p>
          <p className="text-amber-400 text-[11px] font-mono">{RESTAURANT_INFO.phoneFormatted} · Open till 1 AM</p>
        </div>

        {/* Input */}
        <div className="space-y-1.5">
          <label className="text-xs text-stone-300 font-medium block">
            Enter Mobile Number (Optional)
          </label>
          <input
            type="tel"
            placeholder="0321XXXXXXX or +92321XXXXXXX"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full py-2.5 px-3 bg-stone-950 border border-stone-800 rounded-lg text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={handleWhatsAppSend}
            className="py-2.5 px-4 text-xs font-semibold text-stone-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Send to WhatsApp</span>
          </button>

          <button
            onClick={handleSmsSend}
            className="py-2.5 px-4 text-xs font-semibold text-stone-200 hover:text-white bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4 text-amber-400" />
            <span>Send via SMS</span>
          </button>
        </div>

        {sentSuccess && (
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2 justify-center">
            <Check className="w-4 h-4" />
            <span>Details opened on your phone messaging app!</span>
          </div>
        )}

      </div>
    </div>
  );
};
