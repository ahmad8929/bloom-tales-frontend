'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Truck,
  AlertTriangle,
  Calendar,
  MapPin,
  CreditCard,
  RefreshCw,
} from 'lucide-react';
import { orderApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { getOrderStatusInfo } from '@/lib/orderStatus';
import Image from 'next/image';

interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  items: Array<{
    _id: string;
    productId: string;
    quantity: number;
    price: number;
    size?: string;
    // Snapshot of the product taken when the order was placed. Order history
    // has to survive the catalogue changing, so read these when `product` is
    // gone rather than treating the item as broken.
    name?: string;
    image?: string;
    // Populated ref — Mongoose resolves this to null once the underlying
    // product is deleted, so it is genuinely nullable on the wire.
    product: {
      _id: string;
      name: string;
      price: number;
      images: Array<{ url: string; alt?: string }>;
      size: string;
      material: string;
      slug?: string;
    } | null;
  }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'rejected';
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentDetails?: {
    payerName: string;
    transactionId?: string;
    paymentDate: string;
    paymentTime: string;
    amount: number;
  };
  shippingAddress: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    nearbyPlaces?: string;
  };
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  category: 'ongoing' | 'completed' | 'cancelled';
  timeline?: Array<{
    status: string;
    note: string;
    timestamp: string;
    updatedBy?: {
      _id: string;
      firstName: string;
      lastName: string;
    };
  }>;
}

type OrderItem = Order['items'][number];

// Prefer the live product, fall back to the purchase-time snapshot. Both can be
// absent on very old orders, hence the final literals.
function itemName(item: OrderItem) {
  return item.product?.name || item.name || 'Item no longer available';
}

function itemImage(item: OrderItem) {
  return item.product?.images?.[0]?.url || item.image || '/placeholder-product.jpg';
}

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

function OrderDetailsModal({ order, isOpen, onClose }: OrderDetailsModalProps) {

  if (!order) return null;

  const statusInfo = getOrderStatusInfo(order.status);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order Details - {order.orderNumber}
            </DialogTitle>
            <DialogDescription>
              Complete information about your order
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Order Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {statusInfo.icon}
                    <span className="font-medium">Order Status</span>
                  </div>
                  <Badge className={statusInfo.color}>
                    {statusInfo.text}
                  </Badge>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-4 h-4 text-green-500" />
                    <span className="font-medium">Payment</span>
                  </div>
                  <Badge variant={order.paymentStatus === 'completed' ? 'default' : 'outline'}>
                    {order.paymentStatus.toUpperCase()}
                  </Badge>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">Order Date</span>
                  </div>
                  <p className="text-sm">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Rejection Notice */}
            {order.status === 'rejected' && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-red-800">Order Rejected</span>
                  </div>
                  <p className="text-sm text-red-700">
                    This order has been rejected. Please contact support for more information.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Order Timeline */}
            {order.timeline && order.timeline.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Order Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    {order.timeline
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .filter((entry, index, self) => {
                        // Remove duplicates - keep only the first occurrence of each status
                        return index === self.findIndex(e => e.status === entry.status);
                      })
                      .map((entry, index, filteredArray) => {
                        const isLast = index === filteredArray.length - 1;
                        const getStatusIcon = (status: string) => {
                          switch (status) {
                            case 'pending':
                              return <AlertTriangle className="w-4 h-4 text-orange-500" />;
                            case 'confirmed':
                              return <CheckCircle className="w-4 h-4 text-blue-500" />;
                            case 'processing':
                              return <Clock className="w-4 h-4 text-blue-500" />;
                            case 'shipped':
                              return <Truck className="w-4 h-4 text-purple-500" />;
                            case 'delivered':
                              return <CheckCircle className="w-4 h-4 text-green-500" />;
                            case 'rejected':
                            case 'cancelled':
                              return <XCircle className="w-4 h-4 text-red-500" />;
                            default:
                              return <Clock className="w-4 h-4 text-gray-500" />;
                          }
                        };

                        const getStatusLabel = (status: string) => {
                          const labels: Record<string, string> = {
                            'pending': 'Pending',
                            'confirmed': 'Order Confirmed',
                            'processing': 'Processing',
                            'shipped': 'Shipped',
                            'delivered': 'Delivered',
                            'rejected': 'Rejected',
                            'cancelled': 'Cancelled'
                          };
                          return labels[status] || status;
                        };

                        return (
                          <div key={`${entry.status}-${entry.timestamp}`} className="relative pb-6">
                            {!isLast && (
                              <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-border" />
                            )}
                            <div className="flex gap-4">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-card border-2 border-primary flex items-center justify-center">
                                {getStatusIcon(entry.status)}
                              </div>
                              <div className="flex-1 pb-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">
                                    {getStatusLabel(entry.status)}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(entry.timestamp).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">{order.shippingAddress.fullName}</p>
                    <p className="text-sm text-muted-foreground">{order.shippingAddress.phone}</p>
                    <p className="text-sm text-muted-foreground">{order.shippingAddress.email}</p>
                  </div>
                  <div>
                    <p className="text-sm">
                      {order.shippingAddress.address}<br/>
                      {order.shippingAddress.city}, {order.shippingAddress.state}<br/>
                      {order.shippingAddress.pincode}
                    </p>
                    {order.shippingAddress.nearbyPlaces && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Near: {order.shippingAddress.nearbyPlaces}
                      </p>
                    )}
                  </div>
                </div>
                
                {order.trackingNumber && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Tracking Number</p>
                    <p className="font-mono text-sm">{order.trackingNumber}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Information */}
            {order.paymentDetails && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Method</p>
                      <p className="font-medium">{order.paymentMethod.toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payer Name</p>
                      <p>{order.paymentDetails.payerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Transaction ID</p>
                      <p className="font-mono text-sm">{order.paymentDetails.transactionId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Date</p>
                      <p>{order.paymentDetails.paymentDate} at {order.paymentDetails.paymentTime}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items ({order.items.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item._id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <Image
                          src={itemImage(item)}
                          alt={itemName(item)}
                          fill
                          className="object-cover rounded-md"
                          sizes="64px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{itemName(item)}</p>
                        <p className="text-sm text-muted-foreground">
                          Size: {item.size || item.product?.size || '—'}
                          {item.product?.material && ` • Material: ${item.product.material}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ₹{(item.quantity * item.price).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Amount</span>
                    <span className="text-xl font-bold text-primary">
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function OrderCard({ order, onViewDetails }: { order: Order; onViewDetails: (order: Order) => void }) {
  const statusInfo = getOrderStatusInfo(order.status);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            {/* Order numbers are long enough to crowd the status badge on a
                phone, so let them wrap instead of pushing it off the card. */}
            <h3 className="font-semibold text-lg break-all">{order.orderNumber}</h3>
            <p className="text-sm text-muted-foreground">
              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <Badge className={`${statusInfo.color} shrink-0`}>
            <div className="flex items-center gap-1">
              {statusInfo.icon}
              {statusInfo.text}
            </div>
          </Badge>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex -space-x-2">
            {order.items.slice(0, 3).map((item, index) => (
              <div key={item._id} className="relative w-10 h-10 rounded-md border-2 border-white overflow-hidden">
                <Image
                  src={itemImage(item)}
                  alt={itemName(item)}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
            ))}
            {order.items.length > 3 && (
              <div className="w-10 h-10 rounded-md border-2 border-white bg-muted flex items-center justify-center text-xs font-medium">
                +{order.items.length - 3}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
            </p>
            <p className="text-sm text-muted-foreground truncate">
              {order.items[0] ? itemName(order.items[0]) : 'No items'}
              {order.items.length > 1 && ` +${order.items.length - 1} more`}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold">₹{order.totalAmount.toLocaleString('en-IN')}</p>
            <p className="text-xs text-muted-foreground">
              via {order.paymentMethod.toUpperCase()}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(order)}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View Details
          </Button>
        </div>

        {/* Special notices */}
        {order.status === 'rejected' && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <XCircle className="w-4 h-4 inline mr-1" />
              This order has been rejected. Please contact support for more information.
            </p>
          </div>
        )}

        {order.trackingNumber && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <Truck className="w-4 h-4 inline mr-1" />
              Tracking: {order.trackingNumber}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Shared across all three tabs. The mobile sizes keep every label plus its
// count badge inside the list at ~320px viewports; `group` is what lets the
// badge react to the trigger's active state (see TAB_BADGE_CLASS).
const TAB_TRIGGER_CLASS = `
  group relative min-w-0 overflow-hidden px-1.5 text-xs font-medium
  !text-white
  data-[state=active]:!text-black
  sm:px-3 sm:text-sm
`;

// data-state lives on the trigger, not the badge, so the active variant has to
// be read from the parent via group-data-* or it never matches.
const TAB_BADGE_CLASS = `
  ml-1 px-1.5 text-xs
  bg-white text-black
  group-data-[state=active]:bg-secondary
  group-data-[state=active]:text-secondary-foreground
  sm:ml-2 sm:px-2
`;

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<{
    ongoing: Order[];
    completed: Order[];
    cancelled: Order[];
  }>({
    ongoing: [],
    completed: [],
    cancelled: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('ongoing');

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      
      // Fetch all categories
      const [ongoingRes, completedRes, cancelledRes] = await Promise.all([
        orderApi.getOrders('ongoing'),
        orderApi.getOrders('completed'),
        orderApi.getOrders('cancelled')
      ]);

      // Map awaiting_approval to pending for compatibility
      const mapOrderStatus = (order: any) => ({
        ...order,
        status: order.status === 'awaiting_approval' ? 'pending' : order.status
      });

      setOrders({
        ongoing: (ongoingRes.data?.data?.orders || []).map(mapOrderStatus),
        completed: (completedRes.data?.data?.orders || []).map(mapOrderStatus),
        cancelled: (cancelledRes.data?.data?.orders || []).map(mapOrderStatus)
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };


  const totalOrders = orders.ongoing.length + orders.completed.length + orders.cancelled.length;

  if (loading) {
    return (
      // Matches the loaded state's height so the footer doesn't jump up the
      // viewport (and back) while orders are in flight.
      <div className="container mx-auto px-4 py-12 min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold mb-4">My Orders</h1>
        {/* <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Track and manage all your orders in one place
        </p> */}
      </div>

      <div className="max-w-6xl mx-auto">
        {totalOrders === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-4">No orders yet</h2>
              <p className="text-muted-foreground mb-6">
                When you place your first order, it will appear here.
              </p>
              <Button asChild>
                <a href="/products">Start Shopping</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Tabs and Refresh share a row from sm up; on a phone the row
                would squeeze the list far below the width its three labels
                need, so they stack instead. */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <TabsList className="grid h-auto w-full grid-cols-3 sm:max-w-md">
                <TabsTrigger value="ongoing" className={TAB_TRIGGER_CLASS}>
                  Ongoing
                  {orders.ongoing.length > 0 && (
                    <Badge className={TAB_BADGE_CLASS}>{orders.ongoing.length}</Badge>
                  )}
                </TabsTrigger>

                <TabsTrigger value="completed" className={TAB_TRIGGER_CLASS}>
                  Completed
                  {orders.completed.length > 0 && (
                    <Badge className={TAB_BADGE_CLASS}>{orders.completed.length}</Badge>
                  )}
                </TabsTrigger>

                <TabsTrigger value="cancelled" className={TAB_TRIGGER_CLASS}>
                  Cancelled
                  {orders.cancelled.length > 0 && (
                    <Badge className={TAB_BADGE_CLASS}>{orders.cancelled.length}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <Button
                variant="outline"
                size="sm"
                onClick={fetchAllOrders}
                className="flex w-full items-center justify-center gap-2 sm:w-auto"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>

            <TabsContent value="ongoing" className="space-y-4">
              {orders.ongoing.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No ongoing orders</h3>
                    <p className="text-muted-foreground">
                      Your active orders will appear here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {orders.ongoing.map((order) => (
                    <OrderCard
                      key={order._id}
                      order={order}
                      onViewDetails={(order) => {
                        setSelectedOrder(order);
                        setShowOrderDetails(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {orders.completed.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No completed orders</h3>
                    <p className="text-muted-foreground">
                      Your delivered orders will appear here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {orders.completed.map((order) => (
                    <OrderCard
                      key={order._id}
                      order={order}
                      onViewDetails={(order) => {
                        setSelectedOrder(order);
                        setShowOrderDetails(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="cancelled" className="space-y-4">
              {orders.cancelled.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <XCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No cancelled orders</h3>
                    <p className="text-muted-foreground">
                      Your cancelled or rejected orders will appear here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {orders.cancelled.map((order) => (
                    <OrderCard
                      key={order._id}
                      order={order}
                      onViewDetails={(order) => {
                        setSelectedOrder(order);
                        setShowOrderDetails(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={showOrderDetails}
        onClose={() => {
          setShowOrderDetails(false);
          setSelectedOrder(null);
        }}
      />
    </div>
  );
}