import { api } from './client';
import type { Pagination } from '@/types/order';

export interface Reel {
  _id: string;
  video: { url: string; publicId?: string | null };
  instagramUrl?: string | null;
  product?: {
    _id: string;
    name: string;
    price: number;
    images: Array<{ url: string; alt?: string }>;
    slug?: string;
  } | null;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface ReelListResponse {
  status: string;
  data: {
    reels: Reel[];
    pagination: Pagination;
  };
}

interface ReelResponse {
  status: string;
  message?: string;
  data: { reel: Reel };
}

function buildReelForm(data: { video?: File | null; instagramUrl?: string | null; product?: string | null }) {
  const form = new FormData();
  if (data.video) form.append('video', data.video);
  if (data.instagramUrl !== undefined) form.append('instagramUrl', data.instagramUrl ?? '');
  if (data.product !== undefined) form.append('product', data.product ?? '');
  return form;
}

export const reelApi = {
  /** Public — active reels for the storefront */
  getActiveReels: (page = 1, limit = 20) =>
    api.get<ReelListResponse>(`/reels?page=${page}&limit=${limit}`),

  /** Admin — all reels with search + pagination */
  getAllReels: (params?: { page?: number; limit?: number; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.append('page', String(params.page));
    if (params?.limit) qs.append('limit', String(params.limit));
    if (params?.search) qs.append('search', params.search);
    const query = qs.toString();
    return api.get<ReelListResponse>(`/reels/all${query ? `?${query}` : ''}`);
  },

  getReel: (id: string) => api.get<ReelResponse>(`/reels/${id}`),

  createReel: (data: { video: File; instagramUrl?: string | null; product?: string | null }) =>
    api.post<ReelResponse>('/reels', buildReelForm(data)),

  updateReel: (id: string, data: { video?: File | null; instagramUrl?: string | null; product?: string | null }) =>
    api.put<ReelResponse>(`/reels/${id}`, buildReelForm(data)),

  deleteReel: (id: string) =>
    api.delete<{ status: string; message: string }>(`/reels/${id}`),

  toggleActive: (id: string) =>
    api.patch<ReelResponse>(`/reels/${id}/toggle`, {}),

  reorderReels: (order: string[]) =>
    api.patch<{ status: string; message: string; data: { reels: Reel[] } }>('/reels/reorder', { order }),
};
