'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp, 
  DollarSign,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2,
  Ticket
} from 'lucide-react';
import { couponApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface Coupon {
  _id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchaseAmount: number;
  maxDiscountAmount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
  usageCount: number;
  userUsageLimit: number;
  isActive: boolean;
  totalDiscountGiven: number;
  isExpired: boolean;
  isCurrentlyValid: boolean;
  createdAt: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function AdminCouponsPage() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    minPurchaseAmount: '',
    maxDiscountAmount: '',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
    usageLimit: '',
    userUsageLimit: '1',
  });

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchCoupons();
      fetchAnalytics();
    }
  }, [isAuthenticated, user]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await couponApi.getCoupons();
      if (response.data?.data?.coupons) {
        setCoupons(response.data.data.coupons);
      }
    } catch (error: any) {
      console.error('Error fetching coupons:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load coupons',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await couponApi.getCouponAnalytics();
      if (response.data?.data) {
        setAnalytics(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleOpenDialog = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code,
        description: coupon.description || '',
        discountType: coupon.discountType,
        discountValue: coupon.discountValue.toString(),
        minPurchaseAmount: coupon.minPurchaseAmount.toString(),
        maxDiscountAmount: coupon.maxDiscountAmount?.toString() || '',
        validFrom: new Date(coupon.validFrom).toISOString().split('T')[0],
        validUntil: new Date(coupon.validUntil).toISOString().split('T')[0],
        usageLimit: coupon.usageLimit?.toString() || '',
        userUsageLimit: coupon.userUsageLimit.toString(),
      });
    } else {
      setEditingCoupon(null);
      setFormData({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        minPurchaseAmount: '',
        maxDiscountAmount: '',
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: '',
        usageLimit: '',
        userUsageLimit: '1',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const couponData = {
        code: formData.code.toUpperCase(),
        description: formData.description || undefined,
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        minPurchaseAmount: parseFloat(formData.minPurchaseAmount) || 0,
        maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : undefined,
        validFrom: formData.validFrom,
        validUntil: formData.validUntil,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
        userUsageLimit: parseInt(formData.userUsageLimit) || 1,
      };

      if (editingCoupon) {
        await couponApi.updateCoupon(editingCoupon._id, couponData);
        toast({
          title: 'Success',
          description: 'Coupon updated successfully',
        });
      } else {
        await couponApi.createCoupon(couponData);
        toast({
          title: 'Success',
          description: 'Coupon created successfully',
        });
      }

      setIsDialogOpen(false);
      fetchCoupons();
      fetchAnalytics();
    } catch (error: any) {
      console.error('Error saving coupon:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save coupon',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      await couponApi.deleteCoupon(couponId);
      toast({
        title: 'Success',
        description: 'Coupon deleted successfully',
      });
      fetchCoupons();
      fetchAnalytics();
    } catch (error: any) {
      console.error('Error deleting coupon:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete coupon',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (coupon: Coupon) => {
    if (!coupon.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    if (coupon.isExpired) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (coupon.isCurrentlyValid) {
      return <Badge variant="default" className="bg-green-500">Active</Badge>;
    }
    return <Badge variant="secondary">Upcoming</Badge>;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Coupon Management</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage discount coupons for your customers
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAnalytics(!showAnalytics)}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Create Coupon
            </Button>
          </div>
        </div>

        {showAnalytics && analytics && (
          <Card>
            <CardHeader>
              <CardTitle>Coupon Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Coupons</p>
                  <p className="text-2xl font-bold">{analytics.overallStats.totalCoupons}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Active Coupons</p>
                  <p className="text-2xl font-bold text-green-600">{analytics.overallStats.activeCoupons}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Usage</p>
                  <p className="text-2xl font-bold">{analytics.overallStats.totalUsage}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Discount Given</p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{analytics.overallStats.totalDiscountGiven.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>All Coupons</CardTitle>
            <CardDescription>
              View and manage all discount coupons
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Validity</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Total Discount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No coupons found</p>
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() => handleOpenDialog()}
                        >
                          Create Your First Coupon
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    coupons.map((coupon) => (
                      <TableRow key={coupon._id}>
                        <TableCell className="font-mono font-semibold">
                          {coupon.code}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {coupon.discountType === 'percentage' ? '%' : '₹'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {coupon.discountType === 'percentage'
                            ? `${coupon.discountValue}%`
                            : `₹${coupon.discountValue}`}
                          {coupon.minPurchaseAmount > 0 && (
                            <p className="text-xs text-muted-foreground">
                              Min: ₹{coupon.minPurchaseAmount}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{new Date(coupon.validFrom).toLocaleDateString()}</p>
                            <p className="text-muted-foreground">
                              to {new Date(coupon.validUntil).toLocaleDateString()}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {coupon.usageCount}
                          {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                        </TableCell>
                        <TableCell className="font-semibold text-green-600">
                          ₹{coupon.totalDiscountGiven.toLocaleString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(coupon)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog(coupon)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(coupon._id)}
                              disabled={coupon.usageCount > 0}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
              </DialogTitle>
              <DialogDescription>
                {editingCoupon
                  ? 'Update coupon details'
                  : 'Create a new discount coupon for your customers'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Coupon Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    placeholder="SAVE20"
                    required
                    disabled={!!editingCoupon}
                    pattern="[A-Z0-9]+"
                  />
                  <p className="text-xs text-muted-foreground">
                    Uppercase letters and numbers only
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountType">Discount Type *</Label>
                  <Select
                    value={formData.discountType}
                    onValueChange={(value: 'percentage' | 'fixed') =>
                      setFormData({ ...formData, discountType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discountValue">
                    Discount Value * ({formData.discountType === 'percentage' ? '1-100%' : '₹'})
                  </Label>
                  <Input
                    id="discountValue"
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData({ ...formData, discountValue: e.target.value })
                    }
                    required
                    min={formData.discountType === 'percentage' ? 1 : 0.01}
                    max={formData.discountType === 'percentage' ? 100 : undefined}
                    step={formData.discountType === 'percentage' ? 1 : 0.01}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minPurchaseAmount">Minimum Purchase (₹)</Label>
                  <Input
                    id="minPurchaseAmount"
                    type="number"
                    value={formData.minPurchaseAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, minPurchaseAmount: e.target.value })
                    }
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {formData.discountType === 'percentage' && (
                <div className="space-y-2">
                  <Label htmlFor="maxDiscountAmount">Maximum Discount (₹)</Label>
                  <Input
                    id="maxDiscountAmount"
                    type="number"
                    value={formData.maxDiscountAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, maxDiscountAmount: e.target.value })
                    }
                    min="0"
                    step="0.01"
                    placeholder="Optional"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="validFrom">Valid From *</Label>
                  <Input
                    id="validFrom"
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) =>
                      setFormData({ ...formData, validFrom: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validUntil">Valid Until *</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) =>
                      setFormData({ ...formData, validUntil: e.target.value })
                    }
                    required
                    min={formData.validFrom}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="usageLimit">Usage Limit</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, usageLimit: e.target.value })
                    }
                    min="1"
                    placeholder="Unlimited if empty"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userUsageLimit">Per User Limit *</Label>
                  <Input
                    id="userUsageLimit"
                    type="number"
                    value={formData.userUsageLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, userUsageLimit: e.target.value })
                    }
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Optional description for this coupon"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingCoupon ? 'Update' : 'Create'} Coupon
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}






