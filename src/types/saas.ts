export interface RestaurantTenant {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  logoInitial: string;
  activeBranches: number;
  monthlyGmv: number;
  currency: string;
  plan: 'Starter' | 'Growth' | 'Enterprise';
  status: 'active' | 'trial' | 'setup';
}

export interface KdsOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  channel: 'Web Store' | 'iOS App' | 'Android App' | 'QR Dine-in' | 'WhatsApp Bot';
  orderType: 'Delivery' | 'Takeaway' | 'Dine-In';
  items: { name: string; quantity: number; notes?: string; price: number }[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  grandTotal: number;
  paymentMethod: 'Cash on Delivery' | 'JazzCash' | 'EasyPaisa' | 'Card Online';
  paymentStatus: 'Paid' | 'Unpaid';
  kdsStatus: 'New Incoming' | 'Cooking' | 'Ready for Dispatch' | 'Out with Rider' | 'Completed';
  createdAt: string;
  prepTimeMinutes: number;
  assignedRider?: {
    name: string;
    phone: string;
    vehicle: string;
    plate: string;
  };
  deliveryArea: string;
}

export interface CustomerSegment {
  id: string;
  title: string;
  customerCount: number;
  avgOrderValue: number;
  description: string;
  growth: string;
}

export interface SmsCampaign {
  id: string;
  title: string;
  targetSegment: string;
  message: string;
  scheduledTime: string;
  status: 'Sent' | 'Scheduled' | 'Draft';
  sentCount: number;
  conversionRate: string;
  revenueGenerated: number;
}

export interface IntegrationService {
  id: string;
  name: string;
  category: 'POS' | 'Payment' | 'Logistics' | 'Messaging' | 'Hardware';
  status: 'connected' | 'available' | 'configuring';
  latency: string;
  description: string;
}

export interface PricingTier {
  id: string;
  name: string;
  audience: string;
  monthlyPricePkr: number;
  annualPricePkr: number;
  commission: string;
  ordersLimit: string;
  branchesLimit: string;
  features: string[];
  popular?: boolean;
}
