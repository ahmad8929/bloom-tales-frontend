
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CustomerActionsDropdown } from './CustomerActionsDropdown';
import { CustomerStatus } from './CustomerStatus';

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

interface CustomerTableProps {
  customers: Customer[];
  loading: boolean;
  onToggleEmailVerification: (id: string, currentStatus: boolean) => void;
  onToggleUserRole: (id: string, currentRole: string) => void;
}

export function CustomerTable({ 
  customers, 
  loading,
  onToggleEmailVerification, 
  onToggleUserRole 
}: CustomerTableProps) {
  if (loading) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

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
                    {!customer.isActive && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 mt-1">
                        Inactive
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <CustomerStatus
                    type="email"
                    verified={customer.emailVerified}
                  />
                </TableCell>
                <TableCell>
                  <CustomerStatus 
                    type="role"
                    role={customer.role}
                  />
                </TableCell>
                <TableCell>
                  <span className="font-medium">{customer.totalOrders}</span>
                </TableCell>
                <TableCell>
                  <span className="font-medium">${customer.totalSpent.toFixed(2)}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600">
                    {new Date(customer.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600">
                    {customer.lastLoginAt 
                      ? new Date(customer.lastLoginAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                      : 'Never'
                    }
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <CustomerActionsDropdown
                    customer={customer}
                    onToggleEmailVerification={onToggleEmailVerification}
                    onToggleUserRole={onToggleUserRole}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}