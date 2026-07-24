'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { TopCustomer } from '@/lib/api/analytics';

interface Props {
  topCustomers: TopCustomer[] | null;
  averageCLV: number | null;
}

export function TopCustomersTable({ topCustomers, averageCLV }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top Customers by Lifetime Value</CardTitle>
        {averageCLV !== null && (
          <p className="text-xs text-gray-500">
            Average CLV: <span className="font-medium text-gray-700">₹{averageCLV.toLocaleString('en-IN')}</span>
          </p>
        )}
      </CardHeader>
      <CardContent>
        {!topCustomers || topCustomers.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-gray-500">
            No customer data for this range yet.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Lifetime Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topCustomers.map((c) => (
                <TableRow key={c.userId}>
                  <TableCell>
                    <p className="font-medium">{c.name}</p>
                    {c.email && <p className="text-xs text-gray-500">{c.email}</p>}
                  </TableCell>
                  <TableCell className="text-right">{c.orders}</TableCell>
                  <TableCell className="text-right font-medium">₹{c.lifetimeValue.toLocaleString('en-IN')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
