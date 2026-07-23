// Shared status -> hex color map so chart colors match the badge colors
// already used by getOrderStatusInfo (src/lib/orderStatus.tsx) elsewhere in
// the admin/order UI.
export const STATUS_HEX: Record<string, string> = {
  pending: '#ea580c', // orange-600
  confirmed: '#2563eb', // blue-600
  processing: '#2563eb',
  shipped: '#9333ea', // purple-600
  delivered: '#16a34a', // green-600
  cancelled: '#dc2626', // red-600
  rejected: '#dc2626',
};

export function statusColor(status: string): string {
  return STATUS_HEX[status] || '#6b7280'; // gray-500 fallback
}

export const PRIMARY_HEX = '#2563eb';
export const SECONDARY_HEX = '#94a3b8'; // slate-400, for the "returning"/second category
