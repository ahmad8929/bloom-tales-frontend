// Domain-split API client. Import from '@/lib/api' as before —
// this index preserves the original public surface.

export { api, fetchApi, getAuthToken, setAuthTokenCache, API_URL } from './client';
export type { ApiResponse } from './client';

export { authApi } from './auth';
export { productApi } from './products';
export { cartApi } from './cart';
export { orderApi } from './orders';
export { adminApi } from './admin';
export { paymentApi } from './payments';
export { profileApi } from './profile';
export { couponApi } from './coupons';
export { reelApi } from './reels';
export type { Reel } from './reels';
