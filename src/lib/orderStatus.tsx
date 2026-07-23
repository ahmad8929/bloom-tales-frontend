import { AlertTriangle, CheckCircle, Clock, Truck, XCircle } from 'lucide-react';

export interface OrderStatusInfo {
  color: string;
  icon: JSX.Element;
  text: string;
}

/** Status -> badge color / icon / label, shared by order list, order detail, and order confirmation UI. */
export function getOrderStatusInfo(status: string): OrderStatusInfo {
  if (status === 'pending') {
    return {
      color: 'bg-orange-100 text-orange-800',
      icon: <AlertTriangle className="w-4 h-4" />,
      text: 'Pending',
    };
  }

  if (status === 'rejected') {
    return {
      color: 'bg-red-100 text-red-800',
      icon: <XCircle className="w-4 h-4" />,
      text: 'Rejected',
    };
  }

  switch (status) {
    case 'confirmed':
      return {
        color: 'bg-blue-100 text-blue-800',
        icon: <CheckCircle className="w-4 h-4" />,
        text: 'Confirmed',
      };
    case 'processing':
      return {
        color: 'bg-blue-100 text-blue-800',
        icon: <Clock className="w-4 h-4" />,
        text: 'Processing',
      };
    case 'shipped':
      return {
        color: 'bg-purple-100 text-purple-800',
        icon: <Truck className="w-4 h-4" />,
        text: 'Shipped',
      };
    case 'delivered':
      return {
        color: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="w-4 h-4" />,
        text: 'Delivered',
      };
    case 'cancelled':
      return {
        color: 'bg-red-100 text-red-800',
        icon: <XCircle className="w-4 h-4" />,
        text: 'Cancelled',
      };
    default:
      return {
        color: 'bg-gray-100 text-gray-800',
        icon: <Clock className="w-4 h-4" />,
        text: status,
      };
  }
}
