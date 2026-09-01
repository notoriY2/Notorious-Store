// Admin types for the Notorious.Y2 admin dashboard

export interface AdminKPI {
  revenue: number;
  orders: number;
  averageOrderValue: number;
  customers: number;
  conversionRate: number;
  itemsSold: number;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  date: string;
  total: number;
  paymentStatus: 'Paid' | 'Pending' | 'Refunded' | 'Failed';
  fulfillmentStatus: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Pending';
  items: AdminOrderItem[];
  shippingAddress: {
    line1: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone: string;
  };
  subtotal: number;
  shipping: number;
  trackingNumber?: string;
}

export interface AdminOrderItem {
  productId: string;
  name: string;
  size: string;
  quantity: number;
  price: number;
}

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  orders: number;
  totalSpent: number;
  lastOrder: string;
  firstPurchase: string;
  status: 'Active' | 'Inactive' | 'VIP';
  averageOrder: number;
}

export interface AdminInventoryItem {
  productId: string;
  name: string;
  sku: string;
  sizes: {
    size: string;
    available: number;
    reserved: number;
    sold: number;
  }[];
  totalAvailable: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

// src/types/admin.ts

export interface AdminInventoryHistory {
  id: string;
  productId: string;
  productName: string;
  date: string;
  change: number;
  reason: string;
  size?: string;
}

export interface AdminProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  images: string[];
  category: 'top' | 'bottom' | 'accessory';
  status: 'Active' | 'Hidden' | 'Sold Out';
  stock: number;
  views: number;
  carts: number;
  sales: number;
  conversionRate: number;
  position: { top: string; left: string };
  mobilePosition: { top: string; left: string };
  rotation: number;
  scale: number;
  zIndex: number;
  description: string;
  features: string[];
  soldOut: boolean;
  showOnFloor: boolean;
}

export interface AdminActivity {
  id: string;
  time: string;
  action: string;
  user: string;
}

export interface AdminDiscount {
  id: string;
  code: string;
  type: 'Percentage' | 'Fixed' | 'Free Shipping';
  value: number;
  start: string;
  end: string;
  usageLimit: number;
  used: number;
  status: 'Active' | 'Scheduled' | 'Expired';
  minOrder: number;
}

export interface AdminCampaign {
  id: string;
  name: string;
  emailsSent: number;
  openRate: number;
  clicks: number;
  orders: number;
  revenue: number;
  status: 'Active' | 'Completed' | 'Draft';
}

export interface AdminAbandonedCart {
  id: string;
  customerEmail: string;
  cartValue: number;
  abandonedTime: string;
}

export interface AdminAdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Manager' | 'Support' | 'Analyst';
  permissions: string[];
  lastActive: string;
  status: 'Active' | 'Inactive';
}

export interface AdminFinance {
  grossRevenue: number;
  netRevenue: number;
  refunds: number;
  taxes: number;
  shippingCosts: number;
  processingFees: number;
  discounts: number;
  profit: number;
}

export interface AdminChartPoint {
  label: string;
  revenue: number;
  orders: number;
}
