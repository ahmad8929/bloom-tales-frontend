'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign,
  TrendingUp,
  Eye,
  ArrowRight,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { adminApi } from '@/lib/api';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  pendingApprovals: number;
  totalUsers: number;
  totalRevenue: number;
  averageOrderValue: number;
  recentOrders: any[];
  ordersByStatus: Record<string, number>;
}

export default function AdminDashboard() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    pendingApprovals: 0,
    totalUsers: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    recentOrders: [],
    ordersByStatus: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchDashboardStats();
    }
  }, [isAuthenticated, user]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await adminApi.getDashboard();
      
      if (response.data?.data?.stats) {
        const statsData = response.data.data.stats;
        setStats({
          totalProducts: statsData.totalProducts || 0,
          totalOrders: statsData.totalOrders || 0,
          pendingApprovals: statsData.pendingApprovals || 0,
          totalUsers: statsData.totalUsers || 0,
          totalRevenue: statsData.revenue?.totalRevenue || 0,
          averageOrderValue: statsData.revenue?.averageOrderValue || 0,
          recentOrders: statsData.recentOrders || [],
          ordersByStatus: statsData.ordersByStatus || {},
        });
      }
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'default';
      case 'processing':
      case 'shipped':
        return 'secondary';
      case 'awaiting_approval':
        return 'outline';
      case 'cancelled':
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-lg">Loading dashboard...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Dashboard</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchDashboardStats}>
              Try Again
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {user?.firstName}! Here's what's happening with your store.
            </p>
          </div>
          <Button onClick={fetchDashboardStats} variant="outline">
            Refresh Data
          </Button>
        </div>
        
        {/* Main Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Products */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">Active products in store</p>
              <Button variant="outline" size="sm" className="mt-2 w-full" asChild>
                <a href="/admin/products" className="flex items-center justify-center">
                  Manage Products <ArrowRight className="ml-2 h-3 w-3" />
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Total Orders */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">Orders received</p>
              <Button variant="outline" size="sm" className="mt-2 w-full" asChild>
                <a href="/admin/orders" className="flex items-center justify-center">
                  View Orders <ArrowRight className="ml-2 h-3 w-3" />
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Pending Approvals */}
          <Card className="hover:shadow-lg transition-shadow border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingApprovals}</div>
              <p className="text-xs text-muted-foreground">Orders awaiting approval</p>
              <Button 
                variant={stats.pendingApprovals > 0 ? "default" : "outline"} 
                size="sm" 
                className="mt-2 w-full" 
                asChild
              >
                <a href="/admin/orders?approvalStatus=pending" className="flex items-center justify-center">
                  {stats.pendingApprovals > 0 ? 'Review Now' : 'View Orders'} 
                  <ArrowRight className="ml-2 h-3 w-3" />
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Total Revenue */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                Avg: {formatCurrency(stats.averageOrderValue)} per order
              </p>
              <div className="flex items-center mt-2 text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span className="text-xs">From delivered orders</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Order Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.ordersByStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {status === 'delivered' && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {status === 'cancelled' && <XCircle className="h-4 w-4 text-red-500" />}
                      {status === 'awaiting_approval' && <Clock className="h-4 w-4 text-orange-500" />}
                      {!['delivered', 'cancelled', 'awaiting_approval'].includes(status) && (
                        <div className="h-4 w-4 rounded-full bg-blue-500" />
                      )}
                      <span className="text-sm capitalize">{status.replace('_', ' ')}</span>
                    </div>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent Orders
                <Button variant="outline" size="sm" asChild>
                  <a href="/admin/orders">View All</a>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.recentOrders.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No recent orders</p>
              ) : (
                <div className="space-y-3">
                  {stats.recentOrders.slice(0, 5).map((order) => (
                    <div key={order._id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-medium">#{order.orderNumber}</p>
                          <Badge variant={getStatusBadgeVariant(order.status)}>
                            {order.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {order.user?.firstName} {order.user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(order.totalAmount)}</p>
                        <p className="text-sm text-gray-500">{order.items?.length || 0} items</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Button className="w-full justify-start" variant="outline" asChild>
                <a href="/admin/products">
                  <Package className="mr-2 h-4 w-4" />
                  Add New Product
                </a>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <a href="/admin/orders?approvalStatus=pending">
                  <Clock className="mr-2 h-4 w-4" />
                  Process Approvals
                </a>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <a href="/admin/orders">
                  <Eye className="mr-2 h-4 w-4" />
                  Manage Orders
                </a>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <a href="/admin/customers">
                  <Users className="mr-2 h-4 w-4" />
                  View Customers
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>User Management</span>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-sm text-muted-foreground">Registered customers</p>
              </div>
              <Button variant="outline" asChild>
                <a href="/admin/customers" className="flex items-center">
                  Manage Users <ArrowRight className="ml-2 h-3 w-3" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}