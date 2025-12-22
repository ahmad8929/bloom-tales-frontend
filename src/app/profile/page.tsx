'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { profileApi } from '@/lib/api';
import { User, MapPin, Plus, Edit, Trash2, Save, X, Clock, Mail, Phone } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Address {
  _id: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  nearbyPlaces?: string;
  isDefault: boolean;
  addressType: 'home' | 'work' | 'other';
}

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  lastLogin?: string;
  addresses: Address[];
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh'
];

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    age: '',
    gender: '' as 'male' | 'female' | 'other' | 'prefer-not-to-say' | ''
  });

  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    nearbyPlaces: '',
    isDefault: false,
    addressType: 'home' as 'home' | 'work' | 'other'
  });

  const [addressFormErrors, setAddressFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Check authentication state
    if (!isAuthenticated) {
      // Add returnUrl to preserve navigation intent
      router.push('/login?returnUrl=/profile&reason=auth-required');
      return;
    }
    fetchProfile();
  }, [isAuthenticated, router]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await profileApi.getProfile();
      
      if (response.error) {
        // Handle authentication errors specifically
        if (response.error.includes('401') || response.error.includes('expired') || response.error.includes('token')) {
          toast({
            title: 'Session Expired',
            description: 'Your session has expired. Please log in again to continue.',
            variant: 'destructive',
          });
          // Redirect to login with return URL
          setTimeout(() => {
            router.push('/login?returnUrl=/profile&reason=session-expired');
          }, 2000);
          return;
        }
        throw new Error(response.error);
      }

      const user = response.data?.data?.user;
      if (user) {
        setProfile(user);
        setFormData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phone || '',
          age: user.age?.toString() || '',
          gender: user.gender || ''
        });
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      const errorMessage = error.message || 'Failed to load profile';
      
      // Check if it's an auth-related error
      if (errorMessage.includes('401') || errorMessage.includes('expired') || errorMessage.includes('token')) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to view your profile.',
          variant: 'destructive',
        });
        router.push('/login?returnUrl=/profile&reason=auth-required');
      } else {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const updateData: any = {};
      
      if (formData.firstName) updateData.firstName = formData.firstName;
      if (formData.lastName) updateData.lastName = formData.lastName;
      if (formData.phone) updateData.phone = formData.phone;
      if (formData.age) updateData.age = parseInt(formData.age);
      if (formData.gender) updateData.gender = formData.gender;

      const response = await profileApi.updateProfile(updateData);
      
      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });

      setIsEditing(false);
      await fetchProfile();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      fullName: profile?.firstName && profile?.lastName ? `${profile.firstName} ${profile.lastName}` : '',
      phone: profile?.phone || '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
      nearbyPlaces: '',
      isDefault: profile?.addresses.length === 0,
      addressType: 'home'
    });
    setAddressFormErrors({});
    setShowAddressModal(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressForm({
      fullName: address.fullName,
      phone: address.phone,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      nearbyPlaces: address.nearbyPlaces || '',
      isDefault: address.isDefault,
      addressType: address.addressType
    });
    setAddressFormErrors({});
    setShowAddressModal(true);
  };

  const validateAddressForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Full Name validation
    if (!addressForm.fullName.trim()) {
      errors.fullName = 'Full name is required';
    } else if (addressForm.fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters';
    }

    // Phone validation (Indian format)
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanedPhone = addressForm.phone.replace(/\D/g, '').slice(-10);
    if (!addressForm.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(cleanedPhone)) {
      errors.phone = 'Please enter a valid 10-digit Indian phone number';
    }

    // Street validation
    if (!addressForm.street.trim()) {
      errors.street = 'Street address is required';
    } else if (addressForm.street.trim().length < 5) {
      errors.street = 'Street address must be at least 5 characters';
    }

    // City validation
    if (!addressForm.city.trim()) {
      errors.city = 'City is required';
    } else if (addressForm.city.trim().length < 2) {
      errors.city = 'City must be at least 2 characters';
    }

    // State validation
    if (!addressForm.state.trim()) {
      errors.state = 'State is required';
    }

    // ZIP Code validation (Indian pincode)
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!addressForm.zipCode.trim()) {
      errors.zipCode = 'Pincode is required';
    } else if (!pincodeRegex.test(addressForm.zipCode.trim())) {
      errors.zipCode = 'Please enter a valid 6-digit pincode';
    }

    setAddressFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveAddress = async () => {
    // Validate form before submission
    if (!validateAddressForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSaving(true);
      setAddressFormErrors({});
      
      if (editingAddress) {
        const response = await profileApi.updateAddress(editingAddress._id, addressForm);
        if (response.error) {
          throw new Error(response.error);
        }
        toast({
          title: 'Success',
          description: 'Address updated successfully',
        });
      } else {
        const response = await profileApi.addAddress(addressForm);
        if (response.error) {
          throw new Error(response.error);
        }
        toast({
          title: 'Success',
          description: 'Address added successfully',
        });
      }

      setShowAddressModal(false);
      setEditingAddress(null);
      setAddressFormErrors({});
      await fetchProfile();
    } catch (error: any) {
      console.error('Error saving address:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save address',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      setIsSaving(true);
      const response = await profileApi.deleteAddress(addressId);
      
      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: 'Success',
        description: 'Address deleted successfully',
      });

      await fetchProfile();
    } catch (error: any) {
      console.error('Error deleting address:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete address',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-8">
        <h1 className="font-headline text-4xl md:text-5xl font-bold mb-2">My Profile</h1>
        <p className="text-muted-foreground">Manage your personal information and addresses</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-headline flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>Your account details and preferences</CardDescription>
              </div>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Contact Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      min="13"
                      max="120"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value: any) => setFormData({ ...formData, gender: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        firstName: profile.firstName || '',
                        lastName: profile.lastName || '',
                        email: profile.email || '',
                        phone: profile.phone || '',
                        age: profile.age?.toString() || '',
                        gender: profile.gender || ''
                      });
                    }}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Email:</span>
                    <span>{profile.email}</span>
                  </div>
                  {profile.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Phone:</span>
                      <span>{profile.phone}</span>
                    </div>
                  )}
                  {profile.age && (
                    <div>
                      <span className="font-medium">Age:</span> {profile.age}
                    </div>
                  )}
                  {profile.gender && (
                    <div>
                      <span className="font-medium">Gender:</span>{' '}
                      {profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1).replace(/-/g, ' ')}
                    </div>
                  )}
                  <Separator />
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Last Login:</span>
                    <span className="text-muted-foreground">{formatDate(profile.lastLogin)}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Addresses */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-headline flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Saved Addresses
                </CardTitle>
                <CardDescription>Manage your delivery addresses</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleAddAddress}>
                <Plus className="w-4 h-4 mr-2" />
                Add Address
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {profile.addresses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No addresses saved yet</p>
                <Button variant="outline" className="mt-4" onClick={handleAddAddress}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Address
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {profile.addresses.map((address) => (
                  <div
                    key={address._id}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{address.fullName}</span>
                          {address.isDefault && (
                            <Badge variant="default" className="text-xs">Default</Badge>
                          )}
                          <Badge variant="outline" className="text-xs capitalize">
                            {address.addressType}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {address.street}, {address.city}, {address.state} - {address.zipCode}
                        </p>
                        <p className="text-sm text-muted-foreground">{address.country}</p>
                        {address.phone && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Phone: {address.phone}
                          </p>
                        )}
                        {address.nearbyPlaces && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Landmark: {address.nearbyPlaces}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditAddress(address)}
                          disabled={isSaving}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAddress(address._id)}
                          disabled={isSaving}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Address Modal */}
      <Dialog open={showAddressModal} onOpenChange={setShowAddressModal}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </DialogTitle>
            <DialogDescription>
              {editingAddress
                ? 'Update your address details below'
                : 'Add a new delivery address to your profile'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="addressFullName">Full Name *</Label>
              <Input
                id="addressFullName"
                value={addressForm.fullName}
                onChange={(e) => {
                  setAddressForm({ ...addressForm, fullName: e.target.value });
                  if (addressFormErrors.fullName) {
                    setAddressFormErrors({ ...addressFormErrors, fullName: '' });
                  }
                }}
                placeholder="Enter full name"
                className={addressFormErrors.fullName ? 'border-destructive' : ''}
              />
              {addressFormErrors.fullName && (
                <p className="text-sm text-destructive">{addressFormErrors.fullName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressPhone">Phone Number *</Label>
              <Input
                id="addressPhone"
                type="tel"
                value={addressForm.phone}
                onChange={(e) => {
                  setAddressForm({ ...addressForm, phone: e.target.value });
                  if (addressFormErrors.phone) {
                    setAddressFormErrors({ ...addressFormErrors, phone: '' });
                  }
                }}
                placeholder="+91 XXXXX XXXXX"
                className={addressFormErrors.phone ? 'border-destructive' : ''}
              />
              {addressFormErrors.phone && (
                <p className="text-sm text-destructive">{addressFormErrors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressStreet">Street Address *</Label>
              <Input
                id="addressStreet"
                value={addressForm.street}
                onChange={(e) => {
                  setAddressForm({ ...addressForm, street: e.target.value });
                  if (addressFormErrors.street) {
                    setAddressFormErrors({ ...addressFormErrors, street: '' });
                  }
                }}
                placeholder="House no, Street, Area"
                className={addressFormErrors.street ? 'border-destructive' : ''}
              />
              {addressFormErrors.street && (
                <p className="text-sm text-destructive">{addressFormErrors.street}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="addressCity">City *</Label>
                <Input
                  id="addressCity"
                  value={addressForm.city}
                  onChange={(e) => {
                    setAddressForm({ ...addressForm, city: e.target.value });
                    if (addressFormErrors.city) {
                      setAddressFormErrors({ ...addressFormErrors, city: '' });
                    }
                  }}
                  placeholder="Enter city"
                  className={addressFormErrors.city ? 'border-destructive' : ''}
                />
                {addressFormErrors.city && (
                  <p className="text-sm text-destructive">{addressFormErrors.city}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="addressState">State *</Label>
                <Select
                  value={addressForm.state}
                  onValueChange={(value) => {
                    setAddressForm({ ...addressForm, state: value });
                    if (addressFormErrors.state) {
                      setAddressFormErrors({ ...addressFormErrors, state: '' });
                    }
                  }}
                >
                  <SelectTrigger className={addressFormErrors.state ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {addressFormErrors.state && (
                  <p className="text-sm text-destructive">{addressFormErrors.state}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="addressZipCode">Pincode *</Label>
                <Input
                  id="addressZipCode"
                  value={addressForm.zipCode}
                  onChange={(e) => {
                    setAddressForm({ ...addressForm, zipCode: e.target.value });
                    if (addressFormErrors.zipCode) {
                      setAddressFormErrors({ ...addressFormErrors, zipCode: '' });
                    }
                  }}
                  placeholder="000000"
                  className={addressFormErrors.zipCode ? 'border-destructive' : ''}
                />
                {addressFormErrors.zipCode && (
                  <p className="text-sm text-destructive">{addressFormErrors.zipCode}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="addressType">Address Type</Label>
                <Select
                  value={addressForm.addressType}
                  onValueChange={(value: any) => setAddressForm({ ...addressForm, addressType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressNearbyPlaces">Nearby Places/Landmarks</Label>
              <Input
                id="addressNearbyPlaces"
                value={addressForm.nearbyPlaces}
                onChange={(e) => setAddressForm({ ...addressForm, nearbyPlaces: e.target.value })}
                placeholder="Hospital, Mall, etc. (Optional)"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={addressForm.isDefault}
                onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isDefault" className="cursor-pointer">
                Set as default address
              </Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddressModal(false);
                  setEditingAddress(null);
                }}
                className="flex-1"
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveAddress} disabled={isSaving} className="flex-1">
                {isSaving ? 'Saving...' : editingAddress ? 'Update Address' : 'Add Address'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

