// components/admin/customers/CustomerActionsDropdown.tsx
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Eye, 
  Mail,
  UserCheck,
  UserX,
  Shield,
  ShieldOff,
  History
} from 'lucide-react';

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

interface CustomerActionsDropdownProps {
  customer: Customer;
  onToggleEmailVerification: (id: string, currentStatus: boolean) => void;
  onToggleUserRole: (id: string, currentRole: string) => void;
}

export function CustomerActionsDropdown({ 
  customer, 
  onToggleEmailVerification, 
  onToggleUserRole 
}: CustomerActionsDropdownProps) {
  const handleViewProfile = () => {
    // Navigate to customer profile page
    console.log('View profile for:', customer.id);
  };

  const handleSendEmail = () => {
    // Open email compose modal/page
    console.log('Send email to:', customer.email);
  };

  const handleViewOrders = () => {
    // Navigate to customer orders page
    console.log('View orders for:', customer.id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleViewProfile}>
          <Eye className="mr-2 h-4 w-4" /> 
          View Profile
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleViewOrders}>
          <History className="mr-2 h-4 w-4" /> 
          View Orders ({customer.totalOrders})
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleSendEmail}>
          <Mail className="mr-2 h-4 w-4" /> 
          Send Email
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => onToggleEmailVerification(customer.id, customer.emailVerified)}
        >
          {customer.emailVerified ? (
            <>
              <UserX className="mr-2 h-4 w-4" /> 
              Unverify Email
            </>
          ) : (
            <>
              <UserCheck className="mr-2 h-4 w-4" /> 
              Verify Email
            </>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => onToggleUserRole(customer.id, customer.role)}
        >
          {customer.role === 'admin' ? (
            <>
              <ShieldOff className="mr-2 h-4 w-4" /> 
              Remove Admin
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" /> 
              Make Admin
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}