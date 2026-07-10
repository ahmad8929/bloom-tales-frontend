import { api } from './client';

export interface ProfileAddress {
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

export interface ProfileUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  role: string;
  avatar?: string;
  bio?: string;
  dateOfBirth?: string;
  lastLogin?: string;
  addresses: ProfileAddress[];
  createdAt: string;
  updatedAt: string;
}

type AddressInput = Omit<ProfileAddress, '_id' | 'country' | 'isDefault' | 'addressType'> & {
  country?: string;
  isDefault?: boolean;
  addressType?: 'home' | 'work' | 'other';
};

export const profileApi = {
  // Get user profile
  getProfile: () =>
    api.get<{
      status: string;
      data: { user: ProfileUser };
    }>('/profile'),

  // Update user profile
  updateProfile: (data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    age?: number;
    gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  }) =>
    api.put<{
      status: string;
      message: string;
      data: { user: ProfileUser };
    }>('/profile', data),

  // Get all addresses
  getAddresses: () =>
    api.get<{
      status: string;
      data: { addresses: ProfileAddress[] };
    }>('/profile/addresses'),

  // Add new address
  addAddress: (data: AddressInput) =>
    api.post<{
      status: string;
      message: string;
      data: { address: ProfileAddress };
    }>('/profile/addresses', data),

  // Update address
  updateAddress: (addressId: string, data: Partial<AddressInput>) =>
    api.put<{
      status: string;
      message: string;
      data: { address: ProfileAddress };
    }>(`/profile/addresses/${addressId}`, data),

  // Delete address
  deleteAddress: (addressId: string) =>
    api.delete<{
      status: string;
      message: string;
    }>(`/profile/addresses/${addressId}`),
};
