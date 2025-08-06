// components/admin/customers/CustomerStatus.tsx
import { UserCheck, UserX, Shield, ShieldOff } from 'lucide-react';

interface CustomerStatusProps {
  type: 'email' | 'role';
  verified?: boolean;
  role?: 'user' | 'admin';
}

export function CustomerStatus({ type, verified, role }: CustomerStatusProps) {
  if (type === 'email') {
    return (
      <div className="flex items-center gap-2">
        {verified ? (
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
    );
  }

  if (type === 'role') {
    return (
      <div className="flex items-center gap-2">
        {role === 'admin' ? (
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
    );
  }

  return null;
}