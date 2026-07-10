import { api } from './client';

function toQueryString(params?: Record<string, string | number>): string {
  if (!params) return '';
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, String(value));
    }
  });
  const qs = queryParams.toString();
  return qs ? `?${qs}` : '';
}

export const productApi = {
  getAllProducts: (params?: Record<string, string | number>) =>
    api.get<{
      status: string;
      data: {
        products: any[];
        pagination?: any;
      };
    }>(`/products${toQueryString(params)}`),

  getCategories: () =>
    api.get<{
      status: string;
      data: {
        categories: Array<{
          name: string;
          count: number;
          slug: string;
        }>;
        metadata?: {
          totalProducts: number;
          productsWithoutCategory: number;
        };
      };
    }>('/products/categories'),

  getProductsByCategory: (categoryId: string, params?: Record<string, string | number>) =>
    api.get<{
      status: string;
      data: {
        products: any[];
        category: string;
        pagination?: any;
      };
    }>(`/categories/${categoryId}${toQueryString(params)}`),

  // Alternative method using products endpoint with category filter (fallback)
  getProductsByCategoryFallback: (categoryName: string, params?: Record<string, string | number>) =>
    api.get<{
      status: string;
      data: {
        products: any[];
        pagination?: any;
      };
    }>(`/products${toQueryString({ category: categoryName, ...params })}`),

  getProduct: (id: string) =>
    api.get(`/products/${id}`),

  createProduct: (formData: FormData) =>
    api.post('/products', formData),

  updateProduct: (id: string, formData: FormData) =>
    api.put(`/products/${id}`, formData),

  deleteProduct: (id: string) =>
    api.delete(`/products/${id}`),

  searchProducts: (query: string, filters?: Record<string, string>) => {
    const params = new URLSearchParams({ q: query, ...filters });
    return api.get(`/products/search?${params.toString()}`);
  },

  getNewArrivals: (limit = 10) =>
    api.get(`/products/new-arrivals?limit=${limit}`),

  getSaleProducts: (limit = 10) =>
    api.get(`/products/sale?limit=${limit}`),

  getProductsBySize: (size: string) =>
    productApi.getAllProducts({ size }),
};
