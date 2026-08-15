// Shared types/constants for the /checkout/* pages (address, delivery,
// payment, review) — lifted out of the old single-page checkout so every
// route file can use the same shapes.

export interface CartItem {
  _id: string;
  productId: string;
  quantity: number;
  size?: string;
  product: {
    _id: string;
    name: string;
    price: number;
    comparePrice?: number;
    images: Array<{ url: string; alt?: string }>;
    size: string;
    material: string;
    slug?: string;
  };
}

export interface CartData {
  _id: string;
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

export interface Address {
  _id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  nearbyPlaces?: string;
  isDefault: boolean;
  addressType?: 'home' | 'work' | 'other';
}

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh'
];

export const DELIVERY_WINDOWS = ['10am–1pm', '1pm–4pm', '4pm–8pm'];

export const ADDRESS_FIELD_ORDER = ['fullName', 'phone', 'street', 'city', 'state', 'zipCode'] as const;

export type CheckoutStep = 'address' | 'delivery' | 'payment' | 'review';

export const CHECKOUT_STEPS: Array<{ key: CheckoutStep; label: string; path: string }> = [
  { key: 'address', label: 'Address', path: '/checkout/address' },
  { key: 'delivery', label: 'Delivery', path: '/checkout/delivery' },
  { key: 'payment', label: 'Payment', path: '/checkout/payment' },
  { key: 'review', label: 'Review', path: '/checkout/review' },
];
