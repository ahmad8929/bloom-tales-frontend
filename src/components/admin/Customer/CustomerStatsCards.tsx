
import { Card, CardContent } from '@/components/ui/card';
import { UserCheck, Mail, UserX, Shield } from 'lucide-react';

interface CustomerStatsCardsProps {
  totalCustomers: number;
  verifiedCount: number;
  unverifiedCount: number;
  adminCount: number;
}

export function CustomerStatsCards({
  totalCustomers,
  verifiedCount,
  unverifiedCount,
  adminCount
}: CustomerStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-xl font-semibold">{totalCustomers}</p>
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
              <p className="text-xl font-semibold">{verifiedCount}</p>
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
              <p className="text-xl font-semibold">{unverifiedCount}</p>
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
              <p className="text-xl font-semibold">{adminCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}