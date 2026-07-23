// Shared order-domain types used by the order, admin and payment APIs.

export interface OrderUserSummary {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  nearbyPlaces?: string;
}

export interface PaymentDetails {
  payerName?: string;
  transactionId?: string;
  paymentDate?: string;
  paymentTime?: string;
  amount?: number;
  paymentProof?: {
    url: string;
    publicId: string;
    uploadedAt: string;
  };
}

export interface AdminApproval {
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: OrderUserSummary;
  rejectedBy?: OrderUserSummary;
  approvedAt?: string;
  rejectedAt?: string;
  remarks?: string;
}

export interface OrderItem {
  _id: string;
  productId: string;
  quantity: number;
  price: number;
  size?: string;
  product: {
    _id: string;
    name: string;
    price: number;
    images: Array<{ url: string; alt?: string }>;
    size: string;
    material: string;
    slug?: string;
  };
}

export interface OrderTimelineEntry {
  status: string;
  note: string;
  timestamp: string;
  updatedBy?: OrderUserSummary;
}

export type OrderStatus =
  | 'awaiting_approval'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'rejected';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface EmiPlanSnapshot {
  provider: string;
  bankName: string | null;
  tenureMonths: number;
  interestRate: number;
  processingFee: number;
  monthlyInstallment: number;
  totalPayable: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId?: string;
  user?: OrderUserSummary;
  items: OrderItem[];
  subtotal?: number;
  tax?: number;
  shipping?: number;
  discount?: number;
  totalAmount: number;
  status: OrderStatus | string;
  paymentMethod: string;
  paymentGateway?: string;
  paymentStatus: PaymentStatus | string;
  adminApproval: AdminApproval;
  paymentDetails?: PaymentDetails;
  shippingAddress: ShippingAddress;
  timeline?: OrderTimelineEntry[];
  createdAt: string;
  updatedAt?: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  couponCode?: string;
  emiEnabled?: boolean;
  emiPlan?: EmiPlanSnapshot;
  category?: 'ongoing' | 'completed' | 'cancelled';
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
