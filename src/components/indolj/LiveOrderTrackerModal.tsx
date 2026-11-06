import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  Bike,
  ChefHat,
  Phone,
  MessageCircle,
  MapPin,
  ExternalLink,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types/indolj';

interface LiveOrderTrackerModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

export const LiveOrderTrackerModal: React.FC<LiveOrderTrackerModalProps> = ({
  order,
  isOpen,
  onClose,
  onUpdateOrderStatus,
}) => {
  if (!isOpen || !order) return null;

  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order.status);

  // Sync internal state with order status
  useEffect(() => {
    setCurrentStatus(order.status);
  }, [order.status]);

  const stages: { key: OrderStatus; label: string; description: string; icon: any }[] = [
    {
      key: 'pending',
      label: 'Order Placed',
      description: 'Received by Indolj Cloud Server',
      icon: Clock,
    },
    {
      key: 'in_kitchen',
      label: 'Kitchen Accepted',
      description: 'Sizzling on babool coals & tandoor',
      icon: ChefHat,
    },
    {
      key: 'out_for_delivery',
      label: 'Rider Dispatched',
      description: 'Thermal insulated parcel on motorcycle',
      icon: Bike,
    },
    {
      key: 'delivered',
      label: 'Delivered Hot',
      description: 'Enjoy your royal feast!',
      icon: CheckCircle2,
    },
  ];

  const getStageIndex = (status: OrderStatus) => {
    if (status === 'pending') return 0;
    if (status === 'accepted' || status === 'in_kitchen') return 1;
    if (status === 'ready' || status === 'out_for_delivery') return 2;
    if (status === 'delivered') return 3;
    return 0;
  };

  const currentStageIndex = getStageIndex(currentStatus);

  const advanceStatus = () => {
    let nextStatus: OrderStatus = 'in_kitchen';
    if (currentStatus === 'pending') nextStatus = 'in_kitchen';
    else if (currentStatus === 'in_kitchen' || currentStatus === 'accepted') nextStatus = 'out_for_delivery';
    else if (currentStatus === 'out_for_delivery' || currentStatus === 'ready') nextStatus = 'delivered';
    else nextStatus = 'delivered';

    setCurrentStatus(nextStatus);
    onUpdateOrderStatus(order.id, nextStatus);
  };

  const rider = order.assignedRider || {
    name: 'Tariq Khan',
    phone: '+92 333 1245789',
    vehicle: 'Honda CG 125',
    plateNumber: 'KHI-7821',
    rating: 4.9,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-stone-950/85 backdrop-blur-sm transition-opacity"
      />

      <div className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden z-10 text-stone-100 p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl font-bold text-white">
                Live Order Tracking
              </span>
              <span className="px-2 py-0.5 text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                #{order.orderNumber}
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Branch: {order.branch.name} · {order.orderType.toUpperCase()}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Stepper */}
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-stone-800">
          {stages.map((stg, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            const Icon = stg.icon;

            return (
              <div key={stg.key} className="relative flex items-start gap-4">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center -ml-6 z-10 transition-colors ${
                    isCompleted
                      ? 'bg-emerald-500 text-stone-950 font-bold'
                      : isCurrent
                      ? 'bg-amber-400 text-stone-950 animate-pulse'
                      : 'bg-stone-800 text-stone-500 border border-stone-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>

                <div className="flex-1 -mt-0.5">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isCurrent
                          ? 'text-amber-300'
                          : isCompleted
                          ? 'text-emerald-300'
                          : 'text-stone-500'
                      }`}
                    >
                      {stg.label}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-semibold animate-pulse">
                        In Progress
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-400">{stg.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rider Profile Card (Active if out for delivery) */}
        {currentStageIndex >= 2 && (
          <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-stone-100">{rider.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-stone-800 text-amber-400 rounded">
                      ★ {rider.rating}
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-400 font-mono">
                    {rider.vehicle} · {rider.plateNumber}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${rider.phone}`}
                  className="p-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-emerald-400 border border-stone-800 transition-colors"
                  title="Call Delivery Rider"
                >
                  <Phone className="w-4 h-4" />
                </a>
                <a
                  href={`https://wa.me/${rider.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-emerald-500 text-stone-950 hover:bg-emerald-400 transition-colors"
                  title="WhatsApp Rider"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="text-[11px] text-stone-400 flex items-center gap-2 pt-1 border-t border-stone-900">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">
                Delivering to: {order.deliveryAddress || order.deliveryArea || 'Customer Location'}
              </span>
            </div>
          </div>
        )}

        {/* Simulated Map Route Graphic */}
        <div className="h-32 rounded-xl bg-stone-950 border border-stone-800 relative overflow-hidden flex items-center justify-center p-4">
          <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
            <line x1="10%" y1="70%" x2="90%" y2="30%" stroke="#10b981" strokeWidth="3" strokeDasharray="6,6" />
          </svg>
          <div className="flex items-center justify-between w-full relative z-10 text-xs">
            <div className="text-center">
              <div className="w-8 h-8 rounded-full bg-stone-800 border border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto">
                <ChefHat className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-stone-400 mt-1 block">Kitchen</span>
            </div>

            <div className="text-center animate-pulse">
              <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-stone-950 mx-auto shadow-lg">
                <Bike className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-amber-300 font-mono mt-1 block">
                {currentStageIndex === 3 ? 'Arrived!' : 'En Route (8 mins)'}
              </span>
            </div>

            <div className="text-center">
              <div className="w-8 h-8 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-400 mx-auto">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-stone-400 mt-1 block">Your Door</span>
            </div>
          </div>
        </div>

        {/* Demo Fast-Forward Stepper Button */}
        <div className="pt-2 flex items-center justify-between text-xs">
          <button
            onClick={advanceStatus}
            disabled={currentStatus === 'delivered'}
            className="w-full py-2.5 px-4 bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-stone-200 font-semibold rounded-lg border border-stone-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Advance Next Tracker Stage</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
          </button>
        </div>

      </div>
    </div>
  );
};
