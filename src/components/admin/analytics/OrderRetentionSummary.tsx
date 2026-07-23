'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { OrderRetentionWindow } from '@/lib/api/analytics';

export function OrderRetentionSummary({ retention }: { retention: OrderRetentionWindow[] | null }) {
  if (!retention || retention.length === 0) {
    return (
      <Card>
        <CardContent className="flex h-24 items-center justify-center text-sm text-gray-500">
          No retention data for this range yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {retention.map((w) => (
        <Card key={w.windowDays}>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">{w.windowDays}-Day Retention</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{w.retentionRate.toFixed(1)}%</p>
            <p className="mt-1 text-xs text-gray-500">
              {w.retainedCustomers} of {w.eligibleCustomers} eligible customers
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
