// 'use client';

// import { useState, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { Separator } from "@/components/ui/separator";
// import { 
//   Package, 
//   Clock, 
//   CheckCircle, 
//   XCircle, 
//   Eye, 
//   RefreshCw, 
//   Truck,
//   MapPin,
//   Calendar,
//   CreditCard,
//   ShoppingBag
// } from 'lucide-react';
// import { toast } from '@/hooks/use-toast';
// import { orderApi } from '@/lib/api';
// import { Skeleton } from "@/components/ui/skeleton";
// import Image from 'next/image';

// interface OrderItem {
//   _id: string;
//   productId: string;
//   quantity: number;
//   price: number;
//   size?: string;
//   product: {
//     _id: string;
//     name: string;
//     price: number;
//     images: Array<{ url: string; alt?: string }>;
//     size: string;
//     material: string;
//     slug?: string;
//   };
// }

// interface Order {
//   _id: string;
//   orderNumber: string;
//   userId: string;
//   items: OrderItem[];
//   totalAmount: number;
//   status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
//   paymentMethod: string;
//   paymentStatus: 'pending' | 'completed' | 'failed';
//   paymentDetails?: {
//     payerName: string;
//     transactionId: string;
//     paymentDate: string;
//     paymentTime: string;
//     amount: number;
//   };
//   shippingAddress: {
//     fullName: string;
//     email: string;
//     phone: string;
//     address: string;
//     city: string;
//     state: string;
//     pincode: string;
//     nearbyPlaces?: string;
//   };
//   createdAt: string;
//   updatedAt: string;
//   estimatedDelivery?: string;
//   trackingNumber?: string;
// }

// const getStatusColor = (status: string) => {
//   switch (status) {
//     case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
//     case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
//     case 'processing': return 'bg-purple-100 text-purple-800 border-purple-200';
//     case 'shipped': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
//     case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
//     case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
//     default: return 'bg-gray-100 text-gray-800 border-gray-200';
//   }
// };

// const getStatusIcon = (status: string) => {
//   switch (status) {
//     case 'pending': return Clock;
//     case 'confirmed': return CheckCircle;
//     case 'processing': return Package;
//     case 'shipped': return Truck;
//     case 'delivered': return CheckCircle;
//     case 'cancelled': return XCircle;
//     default: return Package;
//   }
// };

// const getPaymentStatusColor = (status: string) => {
//   switch (status) {
//     case 'completed': return 'bg-green-100 text-green-800 border-green-200';
//     case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
//     case 'failed': return 'bg-red-100 text-red-800 border-red-200';
//     default: return 'bg-gray-100 text-gray-800 border-gray-200';
//   }
// };

// export default function OrdersPage() {
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState('ongoing');
//   const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const fetchOrders = async () => {
//     try {
//       setIsLoading(true);
//       const response = await orderApi.getOrders();
      
//       if (response.error) {
//         throw new Error(response.error);
//       }

//       setOrders(response.data?.orders || []);
//     } catch (error: any) {
//       console.error('Error fetching orders:', error);
//       toast({
//         title: 'Error',
//         description: 'Failed to load orders',
//         variant: 'destructive',
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const filterOrdersByStatus = (status: string) => {
//     switch (status) {
//       case 'ongoing':
//         return orders.filter(order => 
//           ['pending', 'confirmed', 'processing', 'shipped'].includes(order.status)
//         );
//       case 'completed':
//         return orders.filter(order => order.status === 'delivered');
//       case 'cancelled':
//         return orders.filter(order => order.status === 'cancelled');
//       default:
//         return orders;
//     }
//   };

//   const handleCancelOrder = async (orderId: string) => {
//     try {
//       const response = await orderApi.cancelOrder(orderId);
      
//       if (response.error) {
//         throw new Error(response.error);
//       }

//       toast({
//         title: 'Order Cancelled',
//         description: 'Your order has been cancelled successfully',
//       });

//       // Refresh orders
//       fetchOrders();
//     } catch (error: any) {
//       console.error('Error cancelling order:', error);
//       toast({
//         title: 'Error',
//         description: 'Failed to cancel order',
//         variant: 'destructive',
//       });
//     }
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-IN', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const OrderDetailsModal = ({ order }: { order: Order }) => (
//     <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//       <DialogHeader>
//         <DialogTitle className="flex items-center gap-2">
//           <Package className="w-5 h-5" />
//           Order Details - #{order.orderNumber}
//         </DialogTitle>
//         <DialogDescription>
//           Placed on {formatDate(order.createdAt)}
//         </DialogDescription>
//       </DialogHeader>

//       <div className="space-y-6">
//         {/* Order Status */}
//         <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
//           <div className="flex items-center gap-3">
//             {(() => {
//               const StatusIcon = getStatusIcon(order.status);
//               return <StatusIcon className="w-6 h-6 text-primary" />;
//             })()}
//             <div>
//               <p className="font-semibold">Order Status</p>
//               <Badge className={getStatusColor(order.status)}>
//                 {order.status.toUpperCase()}
//               </Badge>
//             </div>
//           </div>
//           <div className="text-right">
//             <p className="text-sm text-muted-foreground">Total Amount</p>
//             <p className="text-xl font-bold">₹{order.totalAmount.toLocaleString('en-IN')}</p>
//           </div>
//         </div>

//         {/* Order Items */}
//         <div>
//           <h3 className="font-semibold mb-4 flex items-center gap-2">
//             <ShoppingBag className="w-4 h-4" />
//             Order Items ({order.items.length})
//           </h3>
//           <div className="space-y-3">
//             {order.items.map((item) => (
//               <div key={item._id} className="flex gap-4 p-4 border rounded-lg">
//                 <div className="relative h-16 w-16 flex-shrink-0">
//                   <Image
//                     src={item.product.images?.[0]?.url || '/placeholder-product.jpg'}
//                     alt={item.product.name}
//                     fill
//                     className="object-cover rounded"
//                     sizes="64px"
//                   />
//                 </div>
//                 <div className="flex-1">
//                   <h4 className="font-medium">{item.product.name}</h4>
//                   <div className="text-sm text-muted-foreground mt-1">
//                     <p>Size: {item.size || item.product.size}</p>
//                     <p>Material: {item.product.material}</p>
//                     <p>Quantity: {item.quantity}</p>
//                   </div>
//                 </div>
//                 <div className="text-right">
//                   <p className="font-medium">₹{item.price.toLocaleString('en-IN')}</p>
//                   <p className="text-sm text-muted-foreground">
//                     ₹{(item.price * item.quantity).toLocaleString('en-IN')} total
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         <Separator />

//         {/* Shipping Address */}
//         <div>
//           <h3 className="font-semibold mb-4 flex items-center gap-2">
//             <MapPin className="w-4 h-4" />
//             Shipping Address
//           </h3>
//           <div className="p-4 bg-muted/30 rounded-lg">
//             <p className="font-medium">{order.shippingAddress.fullName}</p>
//             <p className="text-sm text-muted-foreground mt-1">
//               {order.shippingAddress.address}<br />
//               {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}<br />
//               {order.shippingAddress.nearbyPlaces && `Near: ${order.shippingAddress.nearbyPlaces}`}<br />
//               Phone: {order.shippingAddress.phone}<br />
//               Email: {order.shippingAddress.email}
//             </p>
//           </div>
//         </div>

//         {/* Payment Details */}
//         <div>
//           <h3 className="font-semibold mb-4 flex items-center gap-2">
//             <CreditCard className="w-4 h-4" />
//             Payment Information
//           </h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="p-4 bg-muted/30 rounded-lg">
//               <p className="text-sm text-muted-foreground">Payment Method</p>
//               <p className="font-medium capitalize">{order.paymentMethod}</p>
//             </div>
//             <div className="p-4 bg-muted/30 rounded-lg">
//               <p className="text-sm text-muted-foreground">Payment Status</p>
//               <Badge className={getPaymentStatusColor(order.paymentStatus)}>
//                 {order.paymentStatus.toUpperCase()}
//               </Badge>
//             </div>
//           </div>

//           {order.paymentDetails && (
//             <div className="mt-4 p-4 bg-muted/30 rounded-lg">
//               <p className="font-medium mb-2">Payment Details</p>
//               <div className="grid grid-cols-2 gap-4 text-sm">
//                 <div>
//                   <p className="text-muted-foreground">Payer Name</p>
//                   <p>{order.paymentDetails.payerName}</p>
//                 </div>
//                 <div>
//                   <p className="text-muted-foreground">Transaction ID</p>
//                   <p className="font-mono">{order.paymentDetails.transactionId}</p>
//                 </div>
//                 <div>
//                   <p className="text-muted-foreground">Payment Date</p>
//                   <p>{order.paymentDetails.paymentDate}</p>
//                 </div>
//                 <div>
//                   <p className="text-muted-foreground">Payment Time</p>
//                   <p>{order.paymentDetails.paymentTime}</p>
//                 </div>
//               </div>
              
//               {/* Payment Proof */}
//               {order.paymentDetails.paymentProof && (
//                 <div className="mt-4">
//                   <p className="text-sm text-muted-foreground mb-2">Payment Proof</p>
//                   <div className="relative inline-block">
//                     <img 
//                       src={order.paymentDetails.paymentProof.url}
//                       alt="Payment proof"
//                       className="w-48 h-32 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity shadow-md hover:shadow-lg"
//                       onClick={() => {
//                         // Open image in new tab for full view
//                         window.open(order.paymentDetails.paymentProof.url, '_blank');
//                       }}
//                     />
//                     <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20 rounded-lg">
//                       <div className="bg-white/90 text-black text-xs px-2 py-1 rounded shadow-lg">
//                         Click to view full size
//                       </div>
//                     </div>
//                   </div>
//                   <p className="text-xs text-muted-foreground mt-1">
//                     Uploaded on {new Date(order.paymentDetails.paymentProof.uploadedAt).toLocaleDateString('en-IN', {
//                       year: 'numeric',
//                       month: 'short',
//                       day: 'numeric'
//                     })}
//                   </p>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Tracking Information */}
//         {order.trackingNumber && (
//           <div>
//             <h3 className="font-semibold mb-4 flex items-center gap-2">
//               <Truck className="w-4 h-4" />
//               Tracking Information
//             </h3>
//             <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
//               <p className="text-sm text-muted-foreground">Tracking Number</p>
//               <p className="font-mono font-medium">{order.trackingNumber}</p>
//               {order.estimatedDelivery && (
//                 <p className="text-sm text-muted-foreground mt-2">
//                   Estimated Delivery: {formatDate(order.estimatedDelivery)}
//                 </p>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </DialogContent>
//   );

//   const OrdersTable = ({ orders }: { orders: Order[] }) => (
//     <div className="border rounded-lg">
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead>Order</TableHead>
//             <TableHead>Date</TableHead>
//             <TableHead>Items</TableHead>
//             <TableHead>Total</TableHead>
//             <TableHead>Status</TableHead>
//             <TableHead>Payment</TableHead>
//             <TableHead>Actions</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {orders.length === 0 ? (
//             <TableRow>
//               <TableCell colSpan={7} className="text-center py-8">
//                 <div className="flex flex-col items-center gap-2">
//                   <Package className="w-12 h-12 text-muted-foreground" />
//                   <p className="text-muted-foreground">No orders found</p>
//                 </div>
//               </TableCell>
//             </TableRow>
//           ) : (
//             orders.map((order) => (
//               <TableRow key={order._id} className="hover:bg-muted/50">
//                 <TableCell>
//                   <div>
//                     <p className="font-medium">#{order.orderNumber}</p>
//                     <p className="text-sm text-muted-foreground">
//                       {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
//                     </p>
//                   </div>
//                 </TableCell>
//                 <TableCell>
//                   <div className="flex items-center gap-2">
//                     <Calendar className="w-4 h-4 text-muted-foreground" />
//                     <span className="text-sm">{formatDate(order.createdAt)}</span>
//                   </div>
//                 </TableCell>
//                 <TableCell>
//                   <div className="flex -space-x-2">
//                     {order.items.slice(0, 3).map((item, index) => (
//                       <div key={index} className="relative h-8 w-8 rounded-full border-2 border-background">
//                         <Image
//                           src={item.product.images?.[0]?.url || '/placeholder-product.jpg'}
//                           alt={item.product.name}
//                           fill
//                           className="object-cover rounded-full"
//                           sizes="32px"
//                         />
//                       </div>
//                     ))}
//                     {order.items.length > 3 && (
//                       <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
//                         <span className="text-xs font-medium">+{order.items.length - 3}</span>
//                       </div>
//                     )}
//                   </div>
//                 </TableCell>
//                 <TableCell>
//                   <p className="font-medium">₹{order.totalAmount.toLocaleString('en-IN')}</p>
//                 </TableCell>
//                 <TableCell>
//                   <Badge className={getStatusColor(order.status)}>
//                     {order.status.toUpperCase()}
//                   </Badge>
//                 </TableCell>
//                 <TableCell>
//                   <Badge className={getPaymentStatusColor(order.paymentStatus)}>
//                     {order.paymentStatus.toUpperCase()}
//                   </Badge>
//                 </TableCell>
//                 <TableCell>
//                   <div className="flex items-center gap-2">
//                     <Dialog>
//                       <DialogTrigger asChild>
//                         <Button 
//                           variant="outline" 
//                           size="sm"
//                           onClick={() => setSelectedOrder(order)}
//                         >
//                           <Eye className="w-4 h-4" />
//                         </Button>
//                       </DialogTrigger>
//                       {selectedOrder && <OrderDetailsModal order={selectedOrder} />}
//                     </Dialog>
                    
//                     {order.status === 'pending' && (
//                       <Button 
//                         variant="destructive" 
//                         size="sm"
//                         onClick={() => handleCancelOrder(order._id)}
//                       >
//                         Cancel
//                       </Button>
//                     )}
//                   </div>
//                 </TableCell>
//               </TableRow>
//             ))
//           )}
//         </TableBody>
//       </Table>
//     </div>
//   );

//   const OrdersSkeleton = () => (
//     <div className="space-y-4">
//       {[1, 2, 3].map(i => (
//         <div key={i} className="border rounded-lg p-4">
//           <div className="flex items-center justify-between">
//             <div className="space-y-2">
//               <Skeleton className="h-4 w-32" />
//               <Skeleton className="h-3 w-24" />
//             </div>
//             <div className="space-y-2">
//               <Skeleton className="h-4 w-20" />
//               <Skeleton className="h-6 w-16" />
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );

//   const ongoingOrders = filterOrdersByStatus('ongoing');
//   const completedOrders = filterOrdersByStatus('completed');
//   const cancelledOrders = filterOrdersByStatus('cancelled');

//   return (
//     <div className="container mx-auto px-4 py-12 min-h-screen">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-8">
//           <div>
//             <h1 className="font-headline text-4xl md:text-5xl font-bold mb-2">My Orders</h1>
//             <p className="text-muted-foreground">Track and manage your orders</p>
//           </div>
//           <Button onClick={fetchOrders} variant="outline" className="flex items-center gap-2">
//             <RefreshCw className="w-4 h-4" />
//             Refresh
//           </Button>
//         </div>

//         {/* Order Stats */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Ongoing Orders</CardTitle>
//               <Clock className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{ongoingOrders.length}</div>
//               <p className="text-xs text-muted-foreground">
//                 {ongoingOrders.filter(o => o.status === 'shipped').length} shipped
//               </p>
//             </CardContent>
//           </Card>
          
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
//               <CheckCircle className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{completedOrders.length}</div>
//               <p className="text-xs text-muted-foreground">
//                 Successfully delivered
//               </p>
//             </CardContent>
//           </Card>
          
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Cancelled Orders</CardTitle>
//               <XCircle className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{cancelledOrders.length}</div>
//               <p className="text-xs text-muted-foreground">
//                 Cancelled or returned
//               </p>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Orders Tabs */}
//         <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
//           <TabsList className="grid w-full grid-cols-3">
//             <TabsTrigger value="ongoing" className="flex items-center gap-2">
//               <Clock className="w-4 h-4" />
//               Ongoing ({ongoingOrders.length})
//             </TabsTrigger>
//             <TabsTrigger value="completed" className="flex items-center gap-2">
//               <CheckCircle className="w-4 h-4" />
//               Completed ({completedOrders.length})
//             </TabsTrigger>
//             <TabsTrigger value="cancelled" className="flex items-center gap-2">
//               <XCircle className="w-4 h-4" />
//               Cancelled ({cancelledOrders.length})
//             </TabsTrigger>
//           </TabsList>

//           <TabsContent value="ongoing" className="space-y-6">
//             {isLoading ? (
//               <OrdersSkeleton />
//             ) : (
//               <OrdersTable orders={ongoingOrders} />
//             )}
//           </TabsContent>

//           <TabsContent value="completed" className="space-y-6">
//             {isLoading ? (
//               <OrdersSkeleton />
//             ) : (
//               <OrdersTable orders={completedOrders} />
//             )}
//           </TabsContent>

//           <TabsContent value="cancelled" className="space-y-6">
//             {isLoading ? (
//               <OrdersSkeleton />
//             ) : (
//               <OrdersTable orders={cancelledOrders} />
//             )}
//           </TabsContent>
//         </Tabs>
//       </div>
//     </div>
//   );
// }

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
  Ban
} from 'lucide-react';
import { orderApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
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
    product: {
      _id: string;
      name: string;
      price: number;
      images: Array<{ url: string; alt?: string }>;
      size: string;
      material: string;
      slug?: string;
    };
  }>;
  totalAmount: number;
  status: 'awaiting_approval' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'rejected';
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  adminApproval: {
    status: 'pending' | 'approved' | 'rejected';
    remarks?: string;
    approvedAt?: string;
    rejectedAt?: string;
    approvedBy?: {
      _id: string;
      firstName: string;
      lastName: string;
    };
    rejectedBy?: {
      _id: string;
      firstName: string;
      lastName: string;
    };
  };
  paymentDetails?: {
    payerName: string;
    transactionId: string;
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

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onCancelOrder: (orderId: string, reason: string) => void;
}

function OrderDetailsModal({ order, isOpen, onClose, onCancelOrder }: OrderDetailsModalProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelOrder = async () => {
    if (!order || !cancelReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for cancellation',
        variant: 'destructive',
      });
      return;
    }

    setIsCancelling(true);
    try {
      await onCancelOrder(order._id, cancelReason);
      setShowCancelDialog(false);
      setCancelReason('');
      onClose();
    } finally {
      setIsCancelling(false);
    }
  };

  if (!order) return null;

  const getStatusInfo = (status: string, adminApproval: Order['adminApproval']) => {
    if (status === 'awaiting_approval') {
      return {
        color: 'bg-orange-100 text-orange-800',
        icon: <AlertTriangle className="w-4 h-4" />,
        text: 'Awaiting Admin Approval'
      };
    }
    
    if (status === 'rejected') {
      return {
        color: 'bg-red-100 text-red-800',
        icon: <XCircle className="w-4 h-4" />,
        text: 'Rejected'
      };
    }

    switch (status) {
      case 'confirmed':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: <CheckCircle className="w-4 h-4" />,
          text: 'Confirmed'
        };
      case 'processing':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: <Clock className="w-4 h-4" />,
          text: 'Processing'
        };
      case 'shipped':
        return {
          color: 'bg-purple-100 text-purple-800',
          icon: <Truck className="w-4 h-4" />,
          text: 'Shipped'
        };
      case 'delivered':
        return {
          color: 'bg-green-100 text-green-800',
          icon: <CheckCircle className="w-4 h-4" />,
          text: 'Delivered'
        };
      case 'cancelled':
        return {
          color: 'bg-red-100 text-red-800',
          icon: <XCircle className="w-4 h-4" />,
          text: 'Cancelled'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: <Clock className="w-4 h-4" />,
          text: status
        };
    }
  };

  const canBeCancelled = order.status === 'awaiting_approval' || order.status === 'confirmed';
  const statusInfo = getStatusInfo(order.status, order.adminApproval);

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

            {/* Admin Approval Status */}
            {order.status === 'awaiting_approval' && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <span className="font-medium text-orange-800">Awaiting Admin Approval</span>
                  </div>
                  <p className="text-sm text-orange-700">
                    Your order is currently being reviewed by our team. You will be notified once it's approved or if any additional information is needed.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Approval Remarks */}
            {order.adminApproval.status === 'approved' && order.adminApproval.remarks && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">Admin Remarks</span>
                  </div>
                  <p className="text-sm text-green-700">
                    {order.adminApproval.remarks}
                  </p>
                  {order.adminApproval.approvedAt && (
                    <p className="text-xs text-green-600 mt-2">
                      Approved on {new Date(order.adminApproval.approvedAt).toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Rejection Notice */}
            {order.status === 'rejected' && order.adminApproval.remarks && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-red-800">Order Rejected</span>
                  </div>
                  <p className="text-sm text-red-700">
                    <strong>Reason:</strong> {order.adminApproval.remarks}
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
                            case 'awaiting_approval':
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
                            'awaiting_approval': 'Awaiting Approval',
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
                          src={item.product.images?.[0]?.url || '/placeholder-product.jpg'}
                          alt={item.product.name}
                          fill
                          className="object-cover rounded-md"
                          sizes="64px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Size: {item.size || item.product.size} • Material: {item.product.material}
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
            
            {canBeCancelled && (
              <Button
                variant="destructive"
                onClick={() => setShowCancelDialog(true)}
                className="flex items-center gap-2"
              >
                <Ban className="w-4 h-4" />
                Cancel Order
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ban className="w-5 h-5 text-red-500" />
              Cancel Order
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Reason for cancellation *</label>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason for cancelling this order..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCancelDialog(false);
                setCancelReason('');
              }}
              disabled={isCancelling}
            >
              Keep Order
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelOrder}
              disabled={isCancelling || !cancelReason.trim()}
            >
              {isCancelling ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Cancelling...
                </div>
              ) : (
                'Cancel Order'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function OrderCard({ order, onViewDetails }: { order: Order; onViewDetails: (order: Order) => void }) {
  const getStatusInfo = (status: string, adminApproval: Order['adminApproval']) => {
    if (status === 'awaiting_approval') {
      return {
        color: 'bg-orange-100 text-orange-800',
        icon: <AlertTriangle className="w-4 h-4" />,
        text: 'Awaiting Approval'
      };
    }
    
    if (status === 'rejected') {
      return {
        color: 'bg-red-100 text-red-800',
        icon: <XCircle className="w-4 h-4" />,
        text: 'Rejected'
      };
    }

    switch (status) {
      case 'confirmed':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: <CheckCircle className="w-4 h-4" />,
          text: 'Confirmed'
        };
      case 'processing':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: <Clock className="w-4 h-4" />,
          text: 'Processing'
        };
      case 'shipped':
        return {
          color: 'bg-purple-100 text-purple-800',
          icon: <Truck className="w-4 h-4" />,
          text: 'Shipped'
        };
      case 'delivered':
        return {
          color: 'bg-green-100 text-green-800',
          icon: <CheckCircle className="w-4 h-4" />,
          text: 'Delivered'
        };
      case 'cancelled':
        return {
          color: 'bg-red-100 text-red-800',
          icon: <XCircle className="w-4 h-4" />,
          text: 'Cancelled'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: <Clock className="w-4 h-4" />,
          text: status
        };
    }
  };

  const statusInfo = getStatusInfo(order.status, order.adminApproval);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
            <p className="text-sm text-muted-foreground">
              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <Badge className={statusInfo.color}>
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
                  src={item.product.images?.[0]?.url || '/placeholder-product.jpg'}
                  alt={item.product.name}
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
              {order.items[0].product.name}
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
        {order.status === 'awaiting_approval' && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              <AlertTriangle className="w-4 h-4 inline mr-1" />
              Your order is awaiting admin approval
            </p>
          </div>
        )}

        {order.status === 'rejected' && order.adminApproval.remarks && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <XCircle className="w-4 h-4 inline mr-1" />
              Rejected: {order.adminApproval.remarks}
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

      setOrders({
        ongoing: ongoingRes.data?.data?.orders || [],
        completed: completedRes.data?.data?.orders || [],
        cancelled: cancelledRes.data?.data?.orders || []
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

  const handleCancelOrder = async (orderId: string, reason: string) => {
    try {
      const response = await orderApi.cancelOrder(orderId, reason);
      if (response.data) {
        await fetchAllOrders(); // Refresh all orders
        toast({
          title: 'Success',
          description: 'Order cancelled successfully',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel order',
        variant: 'destructive',
      });
    }
  };

  const totalOrders = orders.ongoing.length + orders.completed.length + orders.cancelled.length;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
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
            <div className="flex items-center justify-between">
            <TabsList className="grid w-full max-w-md grid-cols-3">
  <TabsTrigger
    value="ongoing"
    className="
      relative font-medium text-sm
      !text-white
      data-[state=active]:!text-black
    "
  >
    Ongoing
    {orders.ongoing.length > 0 && (
      <Badge
        className="
          ml-2 text-xs
          !bg-white !text-black
          data-[state=active]:!bg-secondary data-[state=active]:!text-secondary-foreground
        "
      >
        {orders.ongoing.length}
      </Badge>
    )}
  </TabsTrigger>

  <TabsTrigger
    value="completed"
    className="
      relative font-medium text-sm
      !text-white
      data-[state=active]:!text-black
    "
  >
    Completed
    {orders.completed.length > 0 && (
      <Badge
        className="
          ml-2 text-xs
          !bg-white !text-black
          data-[state=active]:!bg-secondary data-[state=active]:!text-secondary-foreground
        "
      >
        {orders.completed.length}
      </Badge>
    )}
  </TabsTrigger>

  <TabsTrigger
    value="cancelled"
    className="
      relative font-medium text-sm
      !text-white
      data-[state=active]:!text-black
    "
  >
    Cancelled
    {orders.cancelled.length > 0 && (
      <Badge
        className="
          ml-2 text-xs
          !bg-white !text-black
          data-[state=active]:!bg-secondary data-[state=active]:!text-secondary-foreground
        "
      >
        {orders.cancelled.length}
      </Badge>
    )}
  </TabsTrigger>
</TabsList>

              <Button
                variant="outline"
                size="sm"
                onClick={fetchAllOrders}
                className="flex items-center gap-2"
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
        onCancelOrder={handleCancelOrder}
      />
    </div>
  );
}