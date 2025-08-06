'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, UserCheck, Mail, UserX, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { adminApi } from '@/lib/api';
import { CustomerStatsCards } from '@/components/admin/Customer/CustomerStatsCards';
import { CustomerTable } from '@/components/admin/Customer/CustomerTable';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  role: 'user' | 'admin';
  isActive: boolean;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
  lastLoginAt?: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, searchTerm]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });
      
      if (searchTerm.trim()) {
        params.append('search', searchTerm);
      }

      const response = await adminApi.getCustomers(params.toString());
      
      if (response.data?.data?.customers) {
        // Map API response to match Customer interface
        const mappedCustomers = response.data.data.customers.map(customer => ({
          id: customer._id,
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          emailVerified: customer.isEmailVerified || false, // Note: backend uses isEmailVerified
          role: customer.role as 'user' | 'admin',
          isActive: customer.isActive || true,
          totalOrders: customer.orderCount || 0,
          totalSpent: customer.totalSpent || 0,
          createdAt: customer.createdAt,
          lastLoginAt: customer.lastLogin // backend uses lastLogin
        }));
        setCustomers(mappedCustomers);
        
        // Set pagination
        if (response.data.data.pagination) {
          setTotalPages(response.data.data.pagination.totalPages);
        }
      } else {
        console.log('Unexpected API response structure:', response.data);
        setCustomers([]);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch customers. Please try again.',
        variant: 'destructive',
      });
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleEmailVerification = async (customerId: string, currentStatus: boolean) => {
    try {
      // Note: backend expects isEmailVerified field
      const response = await adminApi.toggleEmailVerification(customerId, !currentStatus);
      
      if (response.data?.data?.user) {
        setCustomers(prev => prev.map(customer => 
          customer.id === customerId 
            ? { ...customer, emailVerified: !currentStatus }
            : customer
        ));
        
        toast({
          title: 'Success',
          description: `Email verification ${!currentStatus ? 'enabled' : 'disabled'}`,
        });
      }
    } catch (error) {
      console.error('Error updating email verification:', error);
      toast({
        title: 'Error',
        description: 'Failed to update email verification',
        variant: 'destructive',
      });
    }
  };

  const toggleUserRole = async (customerId: string, currentRole: string) => {
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      const response = await adminApi.updateUserRole(customerId, newRole);
      
      if (response.data?.data?.user) {
        setCustomers(prev => prev.map(customer => 
          customer.id === customerId 
            ? { ...customer, role: newRole as 'user' | 'admin' }
            : customer
        ));
        
        toast({
          title: 'Success',
          description: `User role updated to ${newRole}`,
        });
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      });
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on search
  };

  const filteredCustomers = customers.filter(customer => {
    if (activeTab === 'verified') {
      return customer.emailVerified;
    } else if (activeTab === 'unverified') {
      return !customer.emailVerified;
    } else if (activeTab === 'admins') {
      return customer.role === 'admin';
    }
    return true; // 'all' tab
  });

  // Calculate stats
  const verifiedCustomers = customers.filter(c => c.emailVerified);
  const unverifiedCustomers = customers.filter(c => !c.emailVerified);
  const adminCustomers = customers.filter(c => c.role === 'admin');

  if (loading && customers.length === 0) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Customers</h1>
          <div className="text-center py-8">Loading customers...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Customers</h1>
            <p className="text-gray-600 mt-1">Manage customer accounts and verification</p>
          </div>
        </div>

        {/* Stats Cards */}
        <CustomerStatsCards
          totalCustomers={customers.length}
          verifiedCount={verifiedCustomers.length}
          unverifiedCount={unverifiedCustomers.length}
          adminCount={adminCustomers.length}
        />

        {/* Customer Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Customer Management</CardTitle>
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All ({customers.length})</TabsTrigger>
                <TabsTrigger value="verified">Verified ({verifiedCustomers.length})</TabsTrigger>
                <TabsTrigger value="unverified">Unverified ({unverifiedCustomers.length})</TabsTrigger>
                <TabsTrigger value="admins">Admins ({adminCustomers.length})</TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <CustomerTable
                  customers={filteredCustomers}
                  loading={loading}
                  onToggleEmailVerification={toggleEmailVerification}
                  onToggleUserRole={toggleUserRole}
                />
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-6 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}