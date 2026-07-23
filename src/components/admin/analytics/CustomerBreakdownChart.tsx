'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PRIMARY_HEX, SECONDARY_HEX } from './chartColors';

interface Props {
  newCustomers: number | null;
  returningCustomers: number | null;
}

export function CustomerBreakdownChart({ newCustomers, returningCustomers }: Props) {
  const hasData = newCustomers !== null && returningCustomers !== null;
  const data = hasData
    ? [
        { label: 'New', count: newCustomers },
        { label: 'Returning', count: returningCustomers },
      ]
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">New vs Returning Customers</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData || (newCustomers === 0 && returningCustomers === 0) ? (
          <div className="flex h-56 items-center justify-center text-sm text-gray-500">
            No customer data for this range yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="#9ca3af" allowDecimals={false} />
              <YAxis type="category" dataKey="label" tick={{ fontSize: 12 }} stroke="#9ca3af" width={80} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                <Cell fill={PRIMARY_HEX} />
                <Cell fill={SECONDARY_HEX} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
