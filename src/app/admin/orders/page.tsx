'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MoreHorizontal, 
  Eye, 
  Truck, 
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  User,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface Order {
  _id: string;
  orderNumber: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  status: 'awaiting_approval' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'rejected';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  adminApproval: {
    status: 'pending' | 'approved' | 'rejected';
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
    approvedAt?: string;
    rejectedAt?: string;
    remarks?: string;
  };
  totalAmount: number;
  items: Array<{
    _id: string;
    product: {
      _id: string;
      name: string;
      images: Array<{ url: string }>;
    };
    quantity: number;
    price: number;
  }>;
  createdAt: string;
  shippingAddress: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: string;
  paymentDetails?: {
    payerName?: string;
    transactionId?: string;
    paymentDate?: string;
    paymentTime?: string;
    amount?: number;
  };
}

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (orderId: string, remarks: string) => void;
  onReject: (orderId: string, remarks: string) => void;
  onUpdateStatus: (orderId: string, status: string) => void;
}

function OrderDetailsModal({ order, isOpen, onClose, onApprove, onReject, onUpdateStatus }: OrderDetailsModalProps) {
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'status' | null>(null);
  const [remarks, setRemarks] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAction = async () => {
    if (!order || !actionType) return;
    
    setIsSubmitting(true);
    try {
      if (actionType === 'approve') {
        await onApprove(order._id, remarks);
      } else if (actionType === 'reject') {
        if (!remarks.trim()) {
          toast({
            title: 'Error',
            description: 'Rejection reason is required',
            variant: 'destructive',
          });
          return;
        }
        await onReject(order._id, remarks);
      } else if (actionType === 'status' && newStatus) {
        await onUpdateStatus(order._id, newStatus);
      }
      
      setActionType(null);
      setRemarks('');
      setNewStatus('');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Order Details - {order.orderNumber}
          </DialogTitle>
          <DialogDescription>
            Complete order information and approval controls
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Order Status & Approval */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="font-medium">Order Status</span>
                </div>
                <Badge variant={order.status === 'awaiting_approval' ? 'secondary' : 'default'}>
                  {order.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span className="font-medium">Approval Status</span>
                </div>
                <Badge variant={
                  order.adminApproval.status === 'pending' ? 'outline' :
                  order.adminApproval.status === 'approved' ? 'default' : 'destructive'
                }>
                  {order.adminApproval.status.toUpperCase()}
                </Badge>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span className="font-medium">Payment</span>
                </div>
                <Badge variant={order.paymentStatus === 'completed' ? 'default' : 'outline'}>
                  {order.paymentStatus.toUpperCase()}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">{order.user.firstName} {order.user.lastName}</p>
                  <p className="text-sm text-muted-foreground">{order.user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p>{order.shippingAddress.phone}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Shipping Address</p>
                <p className="text-sm">
                  {order.shippingAddress.fullName}<br/>
                  {order.shippingAddress.address}<br/>
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                </p>
              </div>
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
                  {order.paymentDetails.payerName && (
                    <div>
                      <p className="text-sm text-muted-foreground">Payer Name</p>
                      <p>{order.paymentDetails.payerName}</p>
                    </div>
                  )}
                  {order.paymentDetails.transactionId && (
                    <div>
                      <p className="text-sm text-muted-foreground">Transaction ID</p>
                      <p className="font-mono text-sm">{order.paymentDetails.transactionId}</p>
                    </div>
                  )}
                  {order.paymentDetails.paymentDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Date & Time</p>
                      <p>{order.paymentDetails.paymentDate} at {order.paymentDetails.paymentTime}</p>
                    </div>
                  )}
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
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item._id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                      {item.product.images?.[0] ? (
                        <img 
                          src={item.product.images[0].url} 
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 rounded-md" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.product.name}</p>
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
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Amount</span>
                  <span className="text-xl font-bold text-primary">
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Approval History */}
          {order.adminApproval.remarks && (
            <Card>
              <CardHeader>
                <CardTitle>Approval History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {order.adminApproval.status === 'approved' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="font-medium">
                      {order.adminApproval.status === 'approved' ? 'Approved' : 'Rejected'} by{' '}
                      {order.adminApproval.approvedBy 
                        ? `${order.adminApproval.approvedBy.firstName} ${order.adminApproval.approvedBy.lastName}`
                        : order.adminApproval.rejectedBy 
                        ? `${order.adminApproval.rejectedBy.firstName} ${order.adminApproval.rejectedBy.lastName}`
                        : 'Admin'
                      }
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    {order.adminApproval.remarks}
                  </p>
                  <p className="text-xs text-muted-foreground pl-6">
                    {order.adminApproval.approvedAt 
                      ? new Date(order.adminApproval.approvedAt).toLocaleString()
                      : order.adminApproval.rejectedAt
                      ? new Date(order.adminApproval.rejectedAt).toLocaleString()
                      : ''
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Dialog */}
          {actionType && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {actionType === 'approve' ? (
                    <ThumbsUp className="w-5 h-5 text-green-500" />
                  ) : actionType === 'reject' ? (
                    <ThumbsDown className="w-5 h-5 text-red-500" />
                  ) : (
                    <Truck className="w-5 h-5 text-blue-500" />
                  )}
                  {actionType === 'approve' ? 'Approve Order' :
                   actionType === 'reject' ? 'Reject Order' : 'Update Order Status'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {actionType === 'status' && (
                  <div>
                    <label className="text-sm font-medium">New Status</label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium">
                    {actionType === 'reject' ? 'Rejection Reason *' : 'Remarks (Optional)'}
                  </label>
                  <Textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder={
                      actionType === 'approve' ? 'Optional approval notes...' :
                      actionType === 'reject' ? 'Please provide a reason for rejection...' :
                      'Optional status update notes...'
                    }
                    className="mt-1"
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setActionType(null);
                      setRemarks('');
                      setNewStatus('');
                    }}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAction}
                    disabled={isSubmitting || (actionType === 'status' && !newStatus)}
                    className="flex-1"
                    variant={actionType === 'reject' ? 'destructive' : 'default'}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      actionType === 'approve' ? 'Approve Order' :
                      actionType === 'reject' ? 'Reject Order' :
                      'Update Status'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          
          {order.adminApproval.status === 'pending' && (
            <>
              <Button
                variant="destructive"
                onClick={() => setActionType('reject')}
                className="flex items-center gap-2"
              >
                <ThumbsDown className="w-4 h-4" />
                Reject Order
              </Button>
              <Button
                onClick={() => setActionType('approve')}
                className="flex items-center gap-2"
              >
                <ThumbsUp className="w-4 h-4" />
                Approve Order
              </Button>
            </>
          )}
          
          {order.adminApproval.status === 'approved' && order.status !== 'delivered' && (
            <Button
              onClick={() => setActionType('status')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Truck className="w-4 h-4" />
              Update Status
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [approvalFilter, setApprovalFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getOrders();
      if (response.data?.data?.orders) {
        setOrders(response.data.data.orders);
      }
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

  const handleApproveOrder = async (orderId: string, remarks: string) => {
    try {
      const response = await adminApi.approveOrder(orderId, remarks);
      if (response.data) {
        await fetchOrders(); // Refresh the orders list
        toast({
          title: 'Success',
          description: 'Order approved successfully',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve order',
        variant: 'destructive',
      });
    }
  };

  const handleRejectOrder = async (orderId: string, remarks: string) => {
    try {
      const response = await adminApi.rejectOrder(orderId, remarks);
      if (response.data) {
        await fetchOrders(); // Refresh the orders list
        toast({
          title: 'Success',
          description: 'Order rejected successfully',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject order',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      const response = await adminApi.updateOrderStatus(orderId, status);
      if (response.data) {
        await fetchOrders(); // Refresh the orders list
        toast({
          title: 'Success',
          description: `Order status updated to ${status}`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'awaiting_approval':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-4 w-4 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'awaiting_approval':
        return 'bg-orange-100 text-orange-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getApprovalStatusBadge = (adminApproval: Order['adminApproval']) => {
    switch (adminApproval.status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${order.user.firstName} ${order.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesApproval = approvalFilter === 'all' || order.adminApproval.status === approvalFilter;
    
    return matchesSearch && matchesStatus && matchesApproval;
  });

  const pendingApprovals = orders.filter(order => order.adminApproval.status === 'pending').length;

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Orders</h1>
          <div className="text-center py-8">Loading orders...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Orders Management</h1>
            <p className="text-gray-600 mt-1">Manage customer orders, approvals, and shipping</p>
          </div>
          {pendingApprovals > 0 && (
            <Badge variant="destructive" className="text-sm">
              {pendingApprovals} Pending Approval{pendingApprovals !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">Awaiting Approval</p>
                  <p className="text-xl font-semibold">
                    {orders.filter(o => o.adminApproval.status === 'pending').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Confirmed</p>
                  <p className="text-xl font-semibold">
                    {orders.filter(o => o.status === 'confirmed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Shipped</p>
                  <p className="text-xl font-semibold">
                    {orders.filter(o => o.status === 'shipped').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Delivered</p>
                  <p className="text-xl font-semibold">
                    {orders.filter(o => o.status === 'delivered').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Revenue</p>
                  <p className="text-xl font-semibold">
                    ₹{orders.filter(o => o.status === 'delivered').reduce((sum, order) => sum + order.totalAmount, 0).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>All Orders ({filteredOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6 flex-wrap">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="awaiting_approval">Awaiting Approval</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={approvalFilter} onValueChange={setApprovalFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by approval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Approvals</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Approval</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        No orders found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-medium">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.user.firstName} {order.user.lastName}</p>
                            <p className="text-sm text-gray-500">{order.user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(order.status)}
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                              {order.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getApprovalStatusBadge(order.adminApproval)}
                        </TableCell>
                        <TableCell>{order.items.length}</TableCell>
                        <TableCell>₹{order.totalAmount.toLocaleString('en-IN')}</TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setSelectedOrder(order);
                                setShowOrderDetails(true);
                              }}>
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                              
                              {order.adminApproval.status === 'pending' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setSelectedOrder(order);
                                      setShowOrderDetails(true);
                                    }}
                                    className="text-green-600"
                                  >
                                    <ThumbsUp className="mr-2 h-4 w-4" /> Approve Order
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setSelectedOrder(order);
                                      setShowOrderDetails(true);
                                    }}
                                    className="text-red-600"
                                  >
                                    <ThumbsDown className="mr-2 h-4 w-4" /> Reject Order
                                  </DropdownMenuItem>
                                </>
                              )}
                              
                              {order.adminApproval.status === 'approved' && order.status !== 'delivered' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedOrder(order);
                                    setShowOrderDetails(true);
                                  }}>
                                    <Truck className="mr-2 h-4 w-4" /> Update Status
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={showOrderDetails}
        onClose={() => {
          setShowOrderDetails(false);
          setSelectedOrder(null);
        }}
        onApprove={handleApproveOrder}
        onReject={handleRejectOrder}
        onUpdateStatus={handleUpdateStatus}
      />
    </AdminLayout>
  );
}