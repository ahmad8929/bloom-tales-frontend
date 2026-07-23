import { api } from './client';

export interface AnalyticsRange {
  from: string;
  to: string;
}

export interface AnalyticsOverview {
  range: AnalyticsRange;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  newCustomers: number;
  returningCustomers: number;
  repeatPurchaseRate: number;
  conversionRate: number | null;
  conversionRateNote: string;
}

export interface RevenuePoint {
  period: string;
  revenue: number;
  orders: number;
}

export interface AnalyticsRevenue {
  range: AnalyticsRange;
  granularity: 'day' | 'week' | 'month';
  series: RevenuePoint[];
  totals: { totalRevenue: number; orders: number; averageOrderValue: number };
}

export interface CohortRetentionPoint {
  offset: number;
  activeCustomers: number;
  retentionRate: number;
}

export interface Cohort {
  cohort: string;
  cohortSize: number;
  retention: CohortRetentionPoint[];
}

export interface AnalyticsCohorts {
  cohorts: Cohort[];
}

export interface TopCustomer {
  userId: string;
  name: string;
  email: string | null;
  lifetimeValue: number;
  orders: number;
}

export interface AnalyticsCustomers {
  range: AnalyticsRange;
  newCustomers: number;
  returningCustomers: number;
  activeCustomers: number;
  totalCustomersEver: number;
  repeatPurchaseRate: number;
  averageCLV: number;
  totalCustomers: number;
  topCustomers: TopCustomer[];
}

export interface OrderRetentionWindow {
  windowDays: number;
  eligibleCustomers: number;
  retainedCustomers: number;
  retentionRate: number;
}

export interface AnalyticsOrders {
  range: AnalyticsRange;
  statusBreakdown: Record<string, number>;
  totalRevenue: number;
  orders: number;
  averageOrderValue: number;
  retention: OrderRetentionWindow[];
}

const qs = (params: Record<string, string | number | undefined>) =>
  Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(v as string | number)}`)
    .join('&');

export const analyticsApi = {
  getOverview: (from?: string, to?: string) =>
    api.get<{ status: string; data: AnalyticsOverview }>(`/admin/analytics/overview?${qs({ from, to })}`),

  getRevenue: (from?: string, to?: string, granularity: 'day' | 'week' | 'month' = 'day') =>
    api.get<{ status: string; data: AnalyticsRevenue }>(`/admin/analytics/revenue?${qs({ from, to, granularity })}`),

  getCohorts: (months = 6) =>
    api.get<{ status: string; data: AnalyticsCohorts }>(`/admin/analytics/cohorts?${qs({ months })}`),

  getCustomers: (from?: string, to?: string, limit = 10) =>
    api.get<{ status: string; data: AnalyticsCustomers }>(`/admin/analytics/customers?${qs({ from, to, limit })}`),

  getOrders: (from?: string, to?: string, windows = '30,60,90') =>
    api.get<{ status: string; data: AnalyticsOrders }>(`/admin/analytics/orders?${qs({ from, to, windows })}`),
};
