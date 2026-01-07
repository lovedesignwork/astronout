'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface TopToursChartProps {
  data: {
    tourId: string;
    tourSlug: string;
    bookingCount: number;
    totalRevenue: number;
    totalProfit: number;
  }[];
  currency?: string;
}

const COLORS = ['#8B5CF6', '#6366F1', '#3B82F6', '#0EA5E9', '#06B6D4'];

export function TopToursChart({ data, currency = 'THB' }: TopToursChartProps) {
  const chartData = data.map((item, index) => ({
    name: item.tourSlug.length > 20 ? item.tourSlug.substring(0, 20) + '...' : item.tourSlug,
    fullName: item.tourSlug,
    revenue: item.totalRevenue,
    profit: item.totalProfit,
    bookings: item.bookingCount,
    color: COLORS[index % COLORS.length],
  }));

  if (data.length === 0) {
    return (
      <div className="card bg-white shadow-sm border border-gray-200">
        <div className="card-body p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Performing Tours</h3>
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <svg className="mx-auto size-12 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              <p className="mt-3 text-sm text-gray-500">No tour data available</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-white shadow-sm border border-gray-200">
      <div className="card-body p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Top Performing Tours</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <XAxis
                type="number"
                tickFormatter={(value) => formatCurrency(value, currency)}
                tick={{ fontSize: 11, fill: '#6B7280' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fontSize: 11, fill: '#374151' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg bg-gray-900 px-4 py-3 shadow-lg">
                        <p className="text-sm font-medium text-white mb-2">{data.fullName}</p>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-300">
                            Revenue: <span className="text-white font-medium">{formatCurrency(data.revenue, currency)}</span>
                          </p>
                          <p className="text-sm text-gray-300">
                            Profit: <span className="text-green-400 font-medium">{formatCurrency(data.profit, currency)}</span>
                          </p>
                          <p className="text-sm text-gray-300">
                            Bookings: <span className="text-white font-medium">{data.bookings}</span>
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="revenue" radius={[0, 4, 4, 0]} barSize={20}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}




