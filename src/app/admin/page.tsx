'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign,
  TrendingUp,
  Eye,
  ArrowRight
} from 'lucide-react';
import { productApi, orderApi } from '@/lib/api';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  recentOrders: any[];
  topProducts: any[];
}

export default function AdminDashboard() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    recentOrders: [],
    topProducts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchDashboardStats();
    }
  }, [isAuthenticated, user]);

 const fetchDashboardStats = async () => {
  try {
    setLoading(true);
    
    // Fetch products
    const productsResponse = await productApi.getAllProducts();
    const totalProducts = productsResponse.data?.data?.products?.length || 0;

    // Fetch orders (if available)
    try {
      const ordersResponse = await orderApi.getOrders();
      const orders = ordersResponse.data?.data?.orders || [];
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
      
      setStats({
        totalProducts,
        totalOrders,
        totalCustomers: 0, // You can implement this later
        totalRevenue,
        recentOrders: orders.slice(0, 5), // Latest 5 orders
        topProducts: [], // You can implement this later
      });
    } catch (orderError) {
      // If orders endpoint doesn't exist yet, just set products
      setStats(prev => ({
        ...prev,
        totalProducts,
      }));
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
  } finally {
    setLoading(false);
  }
};

  // Show loading state
  if (loading) {
    return (
      <AdminLayout>
        <div className="grid gap-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="text-center py-8">Loading dashboard...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user?.firstName}! Here's what's happening with your store.</p>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Products
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                Active products in store
              </p>
              <Button variant="outline" size="sm" className="mt-2 w-full">
                <a href="/admin/products" className="flex items-center">
                  Manage Products <ArrowRight className="ml-2 h-3 w-3" />
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                Orders placed
              </p>
              <Button variant="outline" size="sm" className="mt-2 w-full">
                <a href="/admin/orders" className="flex items-center">
                  View Orders <ArrowRight className="ml-2 h-3 w-3" />
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.totalRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total revenue generated
              </p>
              <div className="flex items-center mt-2 text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span className="text-xs">+12% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Customers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">
                Registered customers
              </p>
              <Button variant="outline" size="sm" className="mt-2 w-full">
                <a href="/admin/customers" className="flex items-center">
                  View Customers <ArrowRight className="ml-2 h-3 w-3" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent Orders
                <Button variant="outline" size="sm">
                  <a href="/admin/orders">View All</a>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.recentOrders.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No recent orders</p>
              ) : (
                <div className="space-y-3">
                  {stats.recentOrders.map((order, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                      <div>
                        <p className="font-medium">Order #{order.orderNumber}</p>
                        <p className="text-sm text-gray-500">{order.customerName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${order.total?.toFixed(2) || '0.00'}</p>
                        <p className="text-sm text-gray-500">{order.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Package className="mr-2 h-4 w-4" />
                <a href="/admin/products">Add New Product</a>
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                <a href="/admin/orders">Process Orders</a>
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                <a href="/admin/customers">Manage Customers</a>
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Analytics (Coming Soon)
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Store Health */}
        <Card>
          <CardHeader>
            <CardTitle>Store Health Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 border rounded-lg">
                <h3 className="font-medium">Inventory Status</h3>
                <p className="text-2xl font-bold text-green-600">{stats.totalProducts}</p>
                <p className="text-sm text-gray-500">Products available</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <h3 className="font-medium">Order Fulfillment</h3>
                <p className="text-2xl font-bold text-blue-600">98%</p>
                <p className="text-sm text-gray-500">Success rate</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <h3 className="font-medium">Customer Satisfaction</h3>
                <p className="text-2xl font-bold text-purple-600">4.8/5</p>
                <p className="text-sm text-gray-500">Average rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}