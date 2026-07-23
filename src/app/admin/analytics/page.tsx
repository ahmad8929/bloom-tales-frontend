'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ErrorState';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DollarSign, ShoppingCart, TrendingUp, Repeat, Users } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

const RevenueTrendChart = dynamic(
  () => import('@/components/admin/analytics/RevenueTrendChart').then((m) => m.RevenueTrendChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
const OrderStatusChart = dynamic(
  () => import('@/components/admin/analytics/OrderStatusChart').then((m) => m.OrderStatusChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
const CustomerBreakdownChart = dynamic(
  () => import('@/components/admin/analytics/CustomerBreakdownChart').then((m) => m.CustomerBreakdownChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
const TopCustomersTable = dynamic(
  () => import('@/components/admin/analytics/TopCustomersTable').then((m) => m.TopCustomersTable),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
const CohortRetentionTable = dynamic(
  () => import('@/components/admin/analytics/CohortRetentionTable').then((m) => m.CohortRetentionTable),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
const OrderRetentionSummary = dynamic(
  () => import('@/components/admin/analytics/OrderRetentionSummary').then((m) => m.OrderRetentionSummary),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

function ChartSkeleton() {
  return <Skeleton className="h-64 w-full rounded-lg" />;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function isoDateDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export default function AdminAnalyticsPage() {
  const { overview, revenue, cohorts, customers, orders, isLoading, unavailable, fetchAll } = useAnalytics();

  const [from, setFrom] = useState(() => isoDateDaysAgo(30));
  const [to, setTo] = useState(() => isoDateDaysAgo(0));
  const [granularity, setGranularity] = useState<'day' | 'week' | 'month'>('day');

  useEffect(() => {
    fetchAll(from, to, granularity);
    // Only on mount — subsequent runs are triggered explicitly via Apply.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const kpis = useMemo(
    () => [
      {
        label: 'Total Revenue',
        value: overview ? formatCurrency(overview.totalRevenue) : '—',
        icon: DollarSign,
      },
      {
        label: 'Total Orders',
        value: overview ? overview.totalOrders.toLocaleString('en-IN') : '—',
        icon: ShoppingCart,
      },
      {
        label: 'Average Order Value',
        value: overview ? formatCurrency(overview.averageOrderValue) : '—',
        icon: TrendingUp,
      },
      {
        label: 'Repeat Purchase Rate',
        value: overview ? `${overview.repeatPurchaseRate.toFixed(1)}%` : '—',
        icon: Repeat,
      },
      {
        label: 'New / Returning',
        value: overview ? `${overview.newCustomers} / ${overview.returningCustomers}` : '—',
        icon: Users,
      },
    ],
    [overview]
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="mt-1 text-gray-600">Revenue, customer growth, and order trends.</p>
          </div>
        </div>

        <Card>
          <CardContent className="flex flex-wrap items-end gap-3 p-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">From</label>
              <input
                type="date"
                value={from}
                max={to}
                onChange={(e) => setFrom(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">To</label>
              <input
                type="date"
                value={to}
                min={from}
                max={isoDateDaysAgo(0)}
                onChange={(e) => setTo(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Revenue granularity</label>
              <Select value={granularity} onValueChange={(v) => setGranularity(v as typeof granularity)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => fetchAll(from, to, granularity)} disabled={isLoading}>
              {isLoading ? 'Loading…' : 'Apply'}
            </Button>
          </CardContent>
        </Card>

        {unavailable ? (
          <ErrorState
            compact
            title="Analytics data isn't available yet"
            message="We couldn't reach the analytics service. This dashboard will populate automatically once it's available."
            onRetry={() => fetchAll(from, to, granularity)}
          />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {kpis.map((kpi) => (
                <Card key={kpi.label}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">{kpi.label}</CardTitle>
                    <kpi.icon className="h-4 w-4 text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    {isLoading && !overview ? (
                      <Skeleton className="h-7 w-20" />
                    ) : (
                      <div className="text-xl font-bold">{kpi.value}</div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {overview?.conversionRateNote && (
              <p className="text-xs text-gray-400">{overview.conversionRateNote}</p>
            )}

            <div className="grid gap-4 lg:grid-cols-2">
              {isLoading && !revenue ? <ChartSkeleton /> : <RevenueTrendChart series={revenue?.series ?? null} />}
              {isLoading && !orders ? (
                <ChartSkeleton />
              ) : (
                <OrderStatusChart statusBreakdown={orders?.statusBreakdown ?? null} />
              )}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {isLoading && !overview ? (
                <ChartSkeleton />
              ) : (
                <CustomerBreakdownChart
                  newCustomers={overview?.newCustomers ?? null}
                  returningCustomers={overview?.returningCustomers ?? null}
                />
              )}
              {isLoading && !customers ? (
                <ChartSkeleton />
              ) : (
                <TopCustomersTable
                  topCustomers={customers?.topCustomers ?? null}
                  averageCLV={customers?.averageCLV ?? null}
                />
              )}
            </div>

            {isLoading && !cohorts ? <ChartSkeleton /> : <CohortRetentionTable cohorts={cohorts?.cohorts ?? null} />}

            {isLoading && !orders ? <ChartSkeleton /> : <OrderRetentionSummary retention={orders?.retention ?? null} />}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
