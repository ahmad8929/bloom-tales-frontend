'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, ShoppingBag, ArrowRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { profileApi } from '@/lib/api';
import { validateAddressFields } from '@/lib/validation';
import { useCheckoutContext } from '../checkout-context';
import { useCouponUI } from '@/hooks/useCouponUI';
import { CheckoutStepIndicator } from '@/components/checkout/CheckoutStepIndicator';
import { OrderSummaryCard } from '@/components/checkout/OrderSummaryCard';
import { resolveCheckoutPricing } from '@/lib/checkout/pricing';
import { INDIAN_STATES, ADDRESS_FIELD_ORDER, type Address } from '@/types/checkout-ui';

export default function CheckoutAddressPage() {
  const router = useRouter();
  const { cart, checkoutState, pricing, selectAddress: persistAddressSelection, applyCoupon } = useCheckoutContext();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingPincode, setIsFetchingPincode] = useState(false);
  const hasReconciledRef = useRef(false);

  const [addressForm, setAddressForm] = useState({
    fullName: '', phone: '', street: '', city: '', state: '', zipCode: '', country: 'India', nearbyPlaces: '', isDefault: false
  });
  const [addressFormErrors, setAddressFormErrors] = useState<Record<string, string>>({});

  const addressFieldRefs = {
    fullName: useRef<HTMLInputElement | null>(null),
    phone: useRef<HTMLInputElement | null>(null),
    street: useRef<HTMLInputElement | null>(null),
    city: useRef<HTMLInputElement | null>(null),
    state: useRef<HTMLButtonElement | null>(null),
    zipCode: useRef<HTMLInputElement | null>(null),
  };

  const scrollToFirstError = (errors: Record<string, string>) => {
    const firstKey = ADDRESS_FIELD_ORDER.find((key) => errors[key]);
    if (!firstKey) return;
    const el = addressFieldRefs[firstKey].current;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.focus();
    }
  };

  const coupon = useCouponUI(applyCoupon, cart, checkoutState?.couponCode);

  const fetchAddresses = async () => {
    try {
      const response = await profileApi.getAddresses();
      if (response.error) {
        console.error('Error fetching addresses:', response.error);
        return;
      }
      const fetched = response.data?.data?.addresses || [];
      setAddresses(fetched);
      const defaultAddress = fetched.find((a: Address) => a.isDefault) || fetched[0];
      if (defaultAddress) setSelectedAddressId((prev) => prev || defaultAddress._id);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  useEffect(() => {
    fetchAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reconcile locally-picked default/first address with whatever was
  // already persisted server-side, once both have loaded.
  useEffect(() => {
    if (hasReconciledRef.current) return;
    if (addresses.length === 0 || checkoutState === null) return;
    hasReconciledRef.current = true;

    const persistedId = checkoutState.addressId;
    if (persistedId && addresses.some((a) => a._id === persistedId)) {
      setSelectedAddressId(persistedId);
    } else if (selectedAddressId) {
      persistAddressSelection(selectedAddressId);
    }
  }, [addresses, checkoutState, selectedAddressId, persistAddressSelection]);

  const handleAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({ fullName: '', phone: '', street: '', city: '', state: '', zipCode: '', country: 'India', nearbyPlaces: '', isDefault: addresses.length === 0 });
    setAddressFormErrors({});
    setShowAddressModal(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressForm({
      fullName: address.fullName, phone: address.phone, street: address.street, city: address.city,
      state: address.state, zipCode: address.zipCode, country: address.country, nearbyPlaces: address.nearbyPlaces || '', isDefault: address.isDefault
    });
    setAddressFormErrors({});
    setShowAddressModal(true);
  };

  const fetchPincodeDetails = async (pincode: string) => {
    if (pincode.length !== 6 || !/^\d{6}$/.test(pincode)) return;
    try {
      setIsFetchingPincode(true);
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();
      if (data?.[0]?.Status === 'Success' && data[0].PostOffice?.length > 0) {
        const deliveryOffice = data[0].PostOffice.find((po: any) => po.DeliveryStatus === 'Delivery') || data[0].PostOffice[0];
        if (deliveryOffice) {
          setAddressForm((prev) => ({ ...prev, city: deliveryOffice.District || prev.city, state: deliveryOffice.State || prev.state }));
        }
      }
    } catch (error) {
      console.error('Error fetching pincode details:', error);
    } finally {
      setIsFetchingPincode(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (addressForm.zipCode && addressForm.zipCode.length === 6) fetchPincodeDetails(addressForm.zipCode);
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressForm.zipCode]);

  const handleSaveAddress = async () => {
    const errors = validateAddressFields(addressForm);
    setAddressFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast({ title: 'Please fix the highlighted fields', description: 'Some address details are missing or invalid.', variant: 'destructive' });
      scrollToFirstError(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      setAddressFormErrors({});

      if (editingAddress) {
        const response = await profileApi.updateAddress(editingAddress._id, addressForm);
        if (response.error) throw new Error(response.error);
        toast({ title: 'Success', description: 'Address updated successfully' });
      } else {
        const response = await profileApi.addAddress(addressForm);
        if (response.error) throw new Error(response.error);
        toast({ title: 'Success', description: 'Address added successfully' });
      }

      setShowAddressModal(false);
      setEditingAddress(null);
      setAddressFormErrors({});
      await fetchAddresses();
    } catch (error: any) {
      console.error('Error saving address:', error);
      toast({ title: 'Error', description: error.message || 'Failed to save address', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = async () => {
    if (!selectedAddressId) {
      toast({ title: 'Address Required', description: 'Please select or add a delivery address', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    await persistAddressSelection(selectedAddressId);
    setIsSubmitting(false);
    router.push('/checkout/delivery');
  };

  if (!cart) return null; // guarded by CheckoutLoadingGuard in the layout

  const pricingData = resolveCheckoutPricing(cart, pricing, 'cod', coupon.localCouponDiscount);

  return (
    <>
      <CheckoutStepIndicator currentStep="address" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-2 space-y-3 sm:space-y-4 md:space-y-6 order-2 lg:order-1">
          <Card>
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 md:gap-0">
                <div className="flex-1 min-w-0">
                  <CardTitle className="font-headline flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base md:text-lg">
                    <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
                    <span className="break-words">Delivery Address</span>
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm mt-1">Select or add a delivery address</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleAddAddress} className="w-full sm:w-auto mt-2 sm:mt-0 flex-shrink-0">
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  <span className="text-xs sm:text-sm">Add Address</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
              {addresses.length === 0 ? (
                <div className="text-center py-6 sm:py-8 border-2 border-dashed rounded-lg px-3">
                  <p className="text-muted-foreground mb-3 sm:mb-4 text-sm sm:text-base">No addresses saved</p>
                  <Button variant="outline" onClick={handleAddAddress} size="sm" className="text-xs sm:text-sm">
                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    Add Your First Address
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {addresses.map((address) => (
                    <div
                      key={address._id}
                      className={`p-2.5 sm:p-3 md:p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedAddressId === address._id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => {
                        setSelectedAddressId(address._id);
                        persistAddressSelection(address._id);
                      }}
                    >
                      <div className="flex items-start justify-between gap-2 sm:gap-3">
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                            <input
                              type="radio"
                              checked={selectedAddressId === address._id}
                              onChange={() => {
                                setSelectedAddressId(address._id);
                                persistAddressSelection(address._id);
                              }}
                              className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5"
                            />
                            <span className="font-medium text-xs sm:text-sm md:text-base break-words">{address.fullName}</span>
                            {address.isDefault && <Badge variant="default" className="text-[10px] sm:text-xs px-1 sm:px-1.5 py-0">Default</Badge>}
                          </div>
                          <div className="ml-4 sm:ml-5 md:ml-6 space-y-0.5 sm:space-y-1">
                            <p className="text-xs sm:text-sm text-muted-foreground break-words leading-relaxed">
                              {address.street}, {address.city}, {address.state} - {address.zipCode}
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground">{address.country}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">Phone: <span className="break-all">{address.phone}</span></p>
                            {address.nearbyPlaces && <p className="text-xs sm:text-sm text-muted-foreground break-words">Landmark: {address.nearbyPlaces}</p>}
                          </div>
                        </div>
                        <Button
                          variant="ghost" size="sm" className="flex-shrink-0 h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 p-0"
                          onClick={(e) => { e.stopPropagation(); handleEditAddress(address); }}
                        >
                          <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Button className="w-full text-xs sm:text-sm md:text-base" size="lg" onClick={handleContinue} disabled={isSubmitting || !selectedAddressId}>
            Continue to Delivery <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="order-1 lg:order-2">
          <OrderSummaryCard
            cart={cart}
            pricingData={pricingData}
            couponCode={coupon.couponCode}
            setCouponCode={coupon.setCouponCode}
            effectiveCouponCode={coupon.effectiveCouponCode}
            isValidatingCoupon={coupon.isValidatingCoupon}
            couponError={coupon.couponError}
            onValidateCoupon={coupon.handleValidateCoupon}
            onRemoveCoupon={coupon.handleRemoveCoupon}
          />
        </div>
      </div>

      <Dialog open={showAddressModal} onOpenChange={setShowAddressModal}>
        <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-3 sm:p-4 md:p-6">
          <DialogHeader className="pb-2 sm:pb-4">
            <DialogTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base md:text-lg">
              <span className="break-words">{editingAddress ? 'Edit Address' : 'Add New Address'}</span>
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm mt-1">
              {editingAddress ? 'Update your address details below' : 'Add a new delivery address to your profile'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-5">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-heading border-b border-border pb-1">Personal Information</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="addressFullName" className="text-sm font-medium">Full Name *</Label>
                  <Input
                    id="addressFullName" ref={addressFieldRefs.fullName} value={addressForm.fullName}
                    onChange={(e) => {
                      setAddressForm({ ...addressForm, fullName: e.target.value });
                      if (addressFormErrors.fullName) setAddressFormErrors({ ...addressFormErrors, fullName: '' });
                    }}
                    placeholder="Enter full name" disabled={isSubmitting} aria-invalid={!!addressFormErrors.fullName} className="text-sm sm:text-base"
                  />
                  {addressFormErrors.fullName && <p className="text-xs sm:text-sm text-destructive">{addressFormErrors.fullName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressPhone" className="text-sm font-medium">Phone Number *</Label>
                  <Input
                    id="addressPhone" ref={addressFieldRefs.phone} type="tel" value={addressForm.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setAddressForm({ ...addressForm, phone: value });
                      if (addressFormErrors.phone) setAddressFormErrors({ ...addressFormErrors, phone: '' });
                    }}
                    placeholder="10-digit mobile number" maxLength={10} disabled={isSubmitting} aria-invalid={!!addressFormErrors.phone} className="text-sm sm:text-base"
                  />
                  {addressFormErrors.phone && <p className="text-xs sm:text-sm text-destructive">{addressFormErrors.phone}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-heading border-b border-border pb-1">Address Details</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="addressStreet" className="text-sm font-medium">Street Address *</Label>
                  <Input
                    id="addressStreet" ref={addressFieldRefs.street} value={addressForm.street}
                    onChange={(e) => {
                      setAddressForm({ ...addressForm, street: e.target.value });
                      if (addressFormErrors.street) setAddressFormErrors({ ...addressFormErrors, street: '' });
                    }}
                    placeholder="House no, Street, Area" disabled={isSubmitting} aria-invalid={!!addressFormErrors.street} className="text-sm sm:text-base"
                  />
                  {addressFormErrors.street && <p className="text-xs sm:text-sm text-destructive">{addressFormErrors.street}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="addressCity" className="text-sm font-medium">City *</Label>
                    <Input
                      id="addressCity" ref={addressFieldRefs.city} value={addressForm.city}
                      onChange={(e) => {
                        setAddressForm({ ...addressForm, city: e.target.value });
                        if (addressFormErrors.city) setAddressFormErrors({ ...addressFormErrors, city: '' });
                      }}
                      placeholder="Enter city" disabled={isSubmitting} aria-invalid={!!addressFormErrors.city} className="text-sm sm:text-base"
                    />
                    {addressFormErrors.city && <p className="text-xs sm:text-sm text-destructive">{addressFormErrors.city}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addressState" className="text-sm font-medium">State *</Label>
                    <Select
                      value={addressForm.state}
                      onValueChange={(value) => {
                        setAddressForm({ ...addressForm, state: value });
                        if (addressFormErrors.state) setAddressFormErrors({ ...addressFormErrors, state: '' });
                      }}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger ref={addressFieldRefs.state} aria-invalid={!!addressFormErrors.state} className="text-sm sm:text-base bg-input-bg hover:bg-sand border-input aria-[invalid=true]:border-destructive">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDIAN_STATES.map((state) => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {addressFormErrors.state && <p className="text-xs sm:text-sm text-destructive">{addressFormErrors.state}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressZipCode" className="text-sm font-medium">Pincode *</Label>
                  <div className="relative">
                    <Input
                      id="addressZipCode" ref={addressFieldRefs.zipCode} value={addressForm.zipCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setAddressForm({ ...addressForm, zipCode: value });
                        if (addressFormErrors.zipCode) setAddressFormErrors({ ...addressFormErrors, zipCode: '' });
                      }}
                      placeholder="000000" maxLength={6} disabled={isSubmitting} aria-invalid={!!addressFormErrors.zipCode} className="text-sm sm:text-base"
                    />
                    {isFetchingPincode && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gold" />
                      </div>
                    )}
                  </div>
                  {addressFormErrors.zipCode && <p className="text-xs sm:text-sm text-destructive">{addressFormErrors.zipCode}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-heading border-b border-border pb-1">Additional Information</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="addressNearbyPlaces" className="text-sm font-medium">Nearby Places/Landmarks</Label>
                  <Input
                    id="addressNearbyPlaces" value={addressForm.nearbyPlaces}
                    onChange={(e) => setAddressForm({ ...addressForm, nearbyPlaces: e.target.value })}
                    placeholder="Hospital, Mall, etc. (Optional)" disabled={isSubmitting} className="text-sm sm:text-base"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox" id="isDefault" checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    className="h-4 w-4 cursor-pointer rounded border-input accent-primary" disabled={isSubmitting}
                  />
                  <Label htmlFor="isDefault" className="cursor-pointer text-sm font-medium">Set as default address</Label>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
              <Button
                variant="outline"
                onClick={() => { setShowAddressModal(false); setEditingAddress(null); }}
                className="flex-1 w-full sm:w-auto text-xs sm:text-sm"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveAddress} disabled={isSubmitting} className="flex-1 w-full sm:w-auto text-xs sm:text-sm">
                {isSubmitting ? (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : editingAddress ? 'Update Address' : 'Add Address'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
