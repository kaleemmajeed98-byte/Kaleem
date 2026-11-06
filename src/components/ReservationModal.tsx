import React, { useState } from 'react';
import { X, Calendar, Clock, Users, CheckCircle2, Phone, Sparkles } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/restaurantData';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({ isOpen, onClose }) => {
  const [guestCount, setGuestCount] = useState<number>(4);
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [time, setTime] = useState<string>('20:30'); // 8:30 PM (prime Karachi dinner hour)
  const [seatingArea, setSeatingArea] = useState<string>('family_hall');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [reservationCode, setReservationCode] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      alert("Please provide your name and phone number.");
      return;
    }
    const code = `RSV-${Math.floor(10000 + Math.random() * 90000)}`;
    setReservationCode(code);
    setIsSuccess(true);
  };

  const handleReset = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden z-10 text-stone-100">
        
        {/* Header */}
        <div className="p-6 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-stone-100">
                Reserve a Table
              </h3>
              <p className="text-xs text-stone-400">
                Experience royal hospitality at Mehmaan Tariq Road
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Reservation Confirmed
                </span>
                <h4 className="font-serif text-2xl font-bold text-stone-100 mt-1">
                  Table Booked for {name}
                </h4>
                <p className="text-xs text-stone-300 mt-2 max-w-sm mx-auto">
                  Your reservation reference is <strong className="text-amber-400 font-mono">#{reservationCode}</strong>.
                  We look forward to honoring you as our Mehmaan.
                </p>
              </div>

              <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 text-left text-xs space-y-2">
                <div className="flex justify-between text-stone-400">
                  <span>Date & Time:</span>
                  <span className="text-stone-200 font-medium">{date} at {time}</span>
                </div>
                <div className="flex justify-between text-stone-400">
                  <span>Number of Guests:</span>
                  <span className="text-amber-400 font-medium">{guestCount} Persons</span>
                </div>
                <div className="flex justify-between text-stone-400">
                  <span>Seating Arrangement:</span>
                  <span className="text-stone-200 capitalize">
                    {seatingArea.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between text-stone-400">
                  <span>Location:</span>
                  <span className="text-stone-200">Shop 4 Alrehman Corner, DMCHS, Karachi</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-stone-950 border border-stone-800 text-[11px] text-stone-400 text-left">
                Running late? Please notify our reception at{' '}
                <a href={`tel:${RESTAURANT_INFO.phone}`} className="text-amber-300 underline font-medium">
                  {RESTAURANT_INFO.phoneFormatted}
                </a>
                . Tables are held for 20 minutes past reservation time.
              </div>

              <button
                onClick={handleReset}
                className="w-full py-2.5 px-4 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
              >
                Close & Return
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Date and Time Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-stone-300 font-medium flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>Select Date</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full py-2 px-3 bg-stone-950 border border-stone-800 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-stone-300 font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Time Slot</span>
                  </label>
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full py-2 px-3 bg-stone-950 border border-stone-800 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="13:00">1:00 PM (Lunch)</option>
                    <option value="14:00">2:00 PM (Lunch)</option>
                    <option value="15:00">3:00 PM (Late Lunch)</option>
                    <option value="19:30">7:30 PM (Early Dinner)</option>
                    <option value="20:30">8:30 PM (Dinner)</option>
                    <option value="21:30">9:30 PM (Peak Dinner)</option>
                    <option value="22:30">10:30 PM (Late Dinner)</option>
                    <option value="23:30">11:30 PM (Night Feast)</option>
                    <option value="00:15">12:15 AM (Midnight)</option>
                  </select>
                </div>
              </div>

              {/* Guest Count */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="text-stone-300 font-medium flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    <span>Party Size</span>
                  </label>
                  <span className="text-amber-400 font-semibold">{guestCount} Guests</span>
                </div>
                <div className="grid grid-cols-6 gap-1.5">
                  {[2, 4, 6, 8, 12, 16].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setGuestCount(num)}
                      className={`py-1.5 text-xs font-semibold rounded-md border transition-colors ${
                        guestCount === num
                          ? 'bg-amber-400 text-stone-950 border-amber-400'
                          : 'bg-stone-950 border-stone-800 text-stone-300 hover:text-white'
                      }`}
                    >
                      {num === 16 ? '16+' : num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seating Preference */}
              <div className="space-y-1.5">
                <label className="text-xs text-stone-300 font-medium block">
                  Seating Ambience
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'family_hall', label: 'AC Family Hall' },
                    { id: 'majlis_baithak', label: 'Traditional Baithak' },
                    { id: 'executive_table', label: 'Executive Table' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSeatingArea(s.id)}
                      className={`py-2 px-2 text-[11px] font-medium rounded-lg border text-center transition-colors ${
                        seatingArea === s.id
                          ? 'bg-amber-400/20 border-amber-500 text-amber-300 font-semibold'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs text-stone-300 font-medium">Guest Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Asif Farooqi"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full py-2 px-3 bg-stone-950 border border-stone-800 rounded-lg text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-stone-300 font-medium">Mobile Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="+92 3XX XXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full py-2 px-3 bg-stone-950 border border-stone-800 rounded-lg text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs text-stone-300 font-medium">
                  Occasion or Dietary Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Birthday dinner, high chair needed, mild spices for kids..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full py-2 px-3 bg-stone-950 border border-stone-800 rounded-lg text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer shadow-md shadow-amber-500/10 active:scale-95"
                >
                  Confirm Table Reservation
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
