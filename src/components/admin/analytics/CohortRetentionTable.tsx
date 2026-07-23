'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Cohort } from '@/lib/api/analytics';

interface Props {
  cohorts: Cohort[] | null;
}

// Sequential single-hue ramp (higher retention = darker) — a heatmap table
// reads cohort data far more clearly than a multi-series line/bar chart
// would once there are more than a handful of overlapping cohorts.
function cellBackground(rate: number) {
  const clamped = Math.max(0, Math.min(100, rate));
  const alpha = 0.08 + (clamped / 100) * 0.72;
  return `rgba(37, 99, 235, ${alpha.toFixed(2)})`;
}

export function CohortRetentionTable({ cohorts }: Props) {
  const maxOffset = cohorts && cohorts.length > 0 ? Math.max(...cohorts.map((c) => c.retention.length - 1)) : 0;
  const offsets = Array.from({ length: maxOffset + 1 }, (_, i) => i);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Cohort Retention</CardTitle>
        <p className="text-xs text-gray-500">% of each month&apos;s new customers who ordered again N months later.</p>
      </CardHeader>
      <CardContent>
        {!cohorts || cohorts.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-gray-500">
            No cohort data available yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-xs">
              <thead>
                <tr>
                  <th className="p-2 text-left font-medium text-gray-500">Cohort</th>
                  <th className="p-2 text-right font-medium text-gray-500">Size</th>
                  {offsets.map((o) => (
                    <th key={o} className="p-2 text-center font-medium text-gray-500">M{o}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cohorts.map((cohort) => (
                  <tr key={cohort.cohort} className="border-t border-gray-100">
                    <td className="p-2 font-medium text-gray-700">{cohort.cohort}</td>
                    <td className="p-2 text-right text-gray-500">{cohort.cohortSize}</td>
                    {offsets.map((o) => {
                      const point = cohort.retention.find((r) => r.offset === o);
                      return (
                        <td key={o} className="p-1 text-center">
                          {point ? (
                            <div
                              className="mx-auto flex h-9 w-14 items-center justify-center rounded text-[11px] font-medium text-gray-800"
                              style={{ backgroundColor: cellBackground(point.retentionRate) }}
                            >
                              {point.retentionRate.toFixed(0)}%
                            </div>
                          ) : (
                            <div className="mx-auto h-9 w-14 rounded bg-gray-50" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
