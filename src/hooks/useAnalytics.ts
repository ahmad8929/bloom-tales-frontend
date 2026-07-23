'use client';

import { useCallback, useState } from 'react';
import {
  analyticsApi,
  AnalyticsOverview,
  AnalyticsRevenue,
  AnalyticsCohorts,
  AnalyticsCustomers,
  AnalyticsOrders,
} from '@/lib/api/analytics';

/**
 * Fires all 5 analytics endpoints in parallel. Each is independent — one
 * 404/error shouldn't blank the whole dashboard, so failures are handled
 * per-dataset. `unavailable` is only set when every request failed (e.g. the
 * analytics API isn't deployed on this backend environment yet), so the page
 * can show one calm empty state instead of five separate error messages.
 */
export function useAnalytics() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [revenue, setRevenue] = useState<AnalyticsRevenue | null>(null);
  const [cohorts, setCohorts] = useState<AnalyticsCohorts | null>(null);
  const [customers, setCustomers] = useState<AnalyticsCustomers | null>(null);
  const [orders, setOrders] = useState<AnalyticsOrders | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  const fetchAll = useCallback(async (from: string, to: string, granularity: 'day' | 'week' | 'month' = 'day') => {
    setIsLoading(true);
    const [ov, rev, coh, cus, ord] = await Promise.allSettled([
      analyticsApi.getOverview(from, to),
      analyticsApi.getRevenue(from, to, granularity),
      analyticsApi.getCohorts(6),
      analyticsApi.getCustomers(from, to, 10),
      analyticsApi.getOrders(from, to),
    ]);

    const ok = <T,>(r: PromiseSettledResult<{ data?: { data: T }; error?: string }>): r is PromiseFulfilledResult<{ data: { data: T } }> =>
      r.status === 'fulfilled' && !r.value.error && !!r.value.data;

    let anyOk = false;

    if (ok(ov)) { setOverview(ov.value.data.data); anyOk = true; } else { setOverview(null); }
    if (ok(rev)) { setRevenue(rev.value.data.data); anyOk = true; } else { setRevenue(null); }
    if (ok(coh)) { setCohorts(coh.value.data.data); anyOk = true; } else { setCohorts(null); }
    if (ok(cus)) { setCustomers(cus.value.data.data); anyOk = true; } else { setCustomers(null); }
    if (ok(ord)) { setOrders(ord.value.data.data); anyOk = true; } else { setOrders(null); }

    if (!anyOk) {
      console.error('Analytics API unavailable (all 5 endpoints failed)');
    }
    setUnavailable(!anyOk);
    setIsLoading(false);
  }, []);

  return { overview, revenue, cohorts, customers, orders, isLoading, unavailable, fetchAll };
}
