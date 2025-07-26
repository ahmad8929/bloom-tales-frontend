'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  MoreHorizontal, 
  Eye, 
  Mail,
  UserCheck,
  UserX,
  Shield,
  ShieldOff
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { adminApi } from '@/lib/api';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  role: 'user' | 'admin';
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

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getCustomers();
      
      if (response.data?.customers) {
        setCustomers(response.data.customers);
      } else {
        // Fallback to mock data if API doesn't return expected structure
        console.log('API Response:', response);
        setCustomers([
          {
            id: '1',
            firstName: 'Alice',
            lastName: 'Johnson',
            email: 'alice@example.com',
            emailVerified: true,
            role: 'user',
            totalOrders: 5,
            totalSpent: 450.75,
            createdAt: '2024-01-10T10:30:00Z',
            lastLoginAt: '2024-01-15T14:22:00Z'
          },
          {
            id: '2',
            firstName: 'Bob',
            lastName: 'Smith',
            email: 'bob@example.com',
            emailVerified: false,
            role: 'user',
            totalOrders: 2,
            totalSpent: 189.50,
            createdAt: '2024-01-12T09:15:00Z',
            lastLoginAt: '2024-01-14T16:45:00Z'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch customers. Using demo data.',
        variant: 'destructive',
      });
      
      // Use mock data on error
      setCustomers([
        {
          id: '1',
          firstName: 'Demo',
          lastName: 'User',
          email: 'demo@example.com',
          emailVerified: true,
          role: 'user',
          totalOrders: 3,
          totalSpent: 299.99,
          createdAt: '2024-01-10T10:30:00Z',
          lastLoginAt: '2024-01-15T14:22:00Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleEmailVerification = async (customerId: string, currentStatus: boolean) => {
    try {
      const response = await adminApi.toggleEmailVerification(customerId, !currentStatus);
      
      if (response.data) {
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
      
      if (response.data) {
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

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'verified') {
      return matchesSearch && customer.emailVerified;
    } else if (activeTab === 'unverified') {
      return matchesSearch && !customer.emailVerified;
    }
    
    return matchesSearch;
  });

  const verifiedCustomers = customers.filter(c => c.emailVerified);
  const unverifiedCustomers = customers.filter(c => !c.emailVerified);

  if (loading) {
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
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Total Customers</p>
                  <p className="text-xl font-semibold">{customers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Verified</p>
                  <p className="text-xl font-semibold">{verifiedCustomers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <UserX className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">Unverified</p>
                  <p className="text-xl font-semibold">{unverifiedCustomers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Admins</p>
                  <p className="text-xl font-semibold">
                    {customers.filter(c => c.role === 'admin').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Lists */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Customer Management</CardTitle>
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All Customers ({customers.length})</TabsTrigger>
                <TabsTrigger value="verified">Verified ({verifiedCustomers.length})</TabsTrigger>
                <TabsTrigger value="unverified">Unverified ({unverifiedCustomers.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <CustomerTable 
                  customers={filteredCustomers}
                  onToggleEmailVerification={toggleEmailVerification}
                  onToggleUserRole={toggleUserRole}
                />
              </TabsContent>

              <TabsContent value="verified" className="mt-6">
                <CustomerTable 
                  customers={filteredCustomers}
                  onToggleEmailVerification={toggleEmailVerification}
                  onToggleUserRole={toggleUserRole}
                />
              </TabsContent>

              <TabsContent value="unverified" className="mt-6">
                <CustomerTable 
                  customers={filteredCustomers}
                  onToggleEmailVerification={toggleEmailVerification}
                  onToggleUserRole={toggleUserRole}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

interface CustomerTableProps {
  customers: Customer[];
  onToggleEmailVerification: (id: string, currentStatus: boolean) => void;
  onToggleUserRole: (id: string, currentRole: string) => void;
}

function CustomerTable({ customers, onToggleEmailVerification, onToggleUserRole }: CustomerTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Email Status</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Orders</TableHead>
            <TableHead>Total Spent</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                No customers found.
              </TableCell>
            </TableRow>
          ) : (
            customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{customer.firstName} {customer.lastName}</p>
                    <p className="text-sm text-gray-500">{customer.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {customer.emailVerified ? (
                      <>
                        <UserCheck className="h-4 w-4 text-green-500" />
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          Verified
                        </span>
                      </>
                    ) : (
                      <>
                        <UserX className="h-4 w-4 text-orange-500" />
                        <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                          Unverified
                        </span>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {customer.role === 'admin' ? (
                      <>
                        <Shield className="h-4 w-4 text-purple-500" />
                        <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                          Admin
                        </span>
                      </>
                    ) : (
                      <>
                        <ShieldOff className="h-4 w-4 text-gray-500" />
                        <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                          User
                        </span>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell>{customer.totalOrders}</TableCell>
                <TableCell>${customer.totalSpent.toFixed(2)}</TableCell>
                <TableCell>
                  {new Date(customer.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {customer.lastLoginAt 
                    ? new Date(customer.lastLoginAt).toLocaleDateString()
                    : 'Never'
                  }
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" /> View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Mail className="mr-2 h-4 w-4" /> Send Email
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onToggleEmailVerification(customer.id, customer.emailVerified)}
                      >
                        {customer.emailVerified ? (
                          <>
                            <UserX className="mr-2 h-4 w-4" /> Unverify Email
                          </>
                        ) : (
                          <>
                            <UserCheck className="mr-2 h-4 w-4" /> Verify Email
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onToggleUserRole(customer.id, customer.role)}
                      >
                        {customer.role === 'admin' ? (
                          <>
                            <ShieldOff className="mr-2 h-4 w-4" /> Remove Admin
                          </>
                        ) : (
                          <>
                            <Shield className="mr-2 h-4 w-4" /> Make Admin
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}