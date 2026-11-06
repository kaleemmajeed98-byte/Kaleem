export type OrderType = 'delivery' | 'takeaway' | 'dinein';

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'in_kitchen'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface Branch {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  deliveryTime: string;
  minOrder: number;
  deliveryFee: number;
  isOpen: boolean;
}

export interface MenuItemAddon {
  id: string;
  name: string;
  price: number;
}

export interface MenuItemVariant {
  id: string;
  name: string;
  priceDelta: number;
}

export interface MenuItem {
  id: string;
  name: string;
  urduName?: string;
  category: string;
  description: string;
  basePrice: number;
  image: string;
  isPopular?: boolean;
  isNew?: boolean;
  isDeal?: boolean;
  inStock: boolean;
  variants?: MenuItemVariant[];
  addons?: MenuItemAddon[];
  spiceLevels?: string[];
  serves?: string;
}

export interface SelectedAddon {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  cartItemId: string;
  item: MenuItem;
  quantity: number;
  selectedVariant?: MenuItemVariant;
  selectedAddons: SelectedAddon[];
  selectedSpice?: string;
  specialInstructions?: string;
  unitPrice: number;
}

export interface PromoCode {
  code: string;
  discountType: 'percentage' | 'fixed' | 'free_delivery';
  discountValue: number;
  minOrder: number;
  description: string;
}

export interface DeliveryRider {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  plateNumber: string;
  rating: number;
  status: 'idle' | 'assigned' | 'en_route';
}

export interface Order {
  id: string;
  orderNumber: string;
  orderType: OrderType;
  branch: Branch;
  items: CartItem[];
  customerName: string;
  customerPhone: string;
  deliveryAddress?: string;
  deliveryArea?: string;
  tableNumber?: string;
  specialNotes?: string;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  grandTotal: number;
  paymentMethod: 'cod' | 'jazzcash' | 'easypaisa' | 'card';
  paymentStatus: 'unpaid' | 'paid';
  status: OrderStatus;
  prepTimeMinutes?: number;
  assignedRider?: DeliveryRider;
  createdAt: string;
  estimatedDeliveryTime?: string;
}
