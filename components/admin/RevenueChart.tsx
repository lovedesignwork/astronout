'use client';

import { useMemo } from 'react';
import { formatCurrency } from '@/lib/utils';

interface DailyData {
  date: string;
  revenue: number;
  profit: number;
}

interface RevenueChartProps {
  data: DailyData[];
  currency?: string;
}

export function RevenueChart({ data, currency = 'THB' }: RevenueChartProps) {
  const chartData = useMemo(() => {
    if (data.length === 0) return { bars: [], maxValue: 0 };

    const maxValue = Math.max(...data.map(d => Math.max(d.revenue, d.profit)), 1);
    const bars = data.map(d => ({
      ...d,
      revenueHeight: (d.revenue / maxValue) * 100,
      profitHeight: (d.profit / maxValue) * 100,
      formattedDate: new Date(d.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
    }));

    return { bars, maxValue };
  }, [data]);

  const totals = useMemo(() => {
    return data.reduce(
      (acc, d) => ({
        revenue: acc.revenue + d.revenue,
        profit: acc.profit + d.profit,
      }),
      { revenue: 0, profit: 0 }
    );
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="card bg-white shadow-sm border border-gray-200">
        <div className="card-body p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue & Profit</h3>
          <div className="flex h-56 items-center justify-center">
            <div className="text-center">
              <svg className="mx-auto size-12 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              <p className="mt-3 text-sm text-gray-500">No data available for the selected period</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-white shadow-sm border border-gray-200">
      <div className="card-body p-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-bold text-gray-900">Revenue & Profit</h3>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 shadow-sm" />
              <span className="text-sm text-gray-600">
                Revenue: <span className="font-bold text-gray-900">{formatCurrency(totals.revenue, currency)}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-green-500 shadow-sm" />
              <span className="text-sm text-gray-600">
                Profit: <span className="font-bold text-green-600">{formatCurrency(totals.profit, currency)}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="relative h-56">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 flex h-full w-20 flex-col justify-between text-right text-xs text-gray-500 pr-3 font-medium">
            <span>{formatCurrency(chartData.maxValue, currency)}</span>
            <span>{formatCurrency(chartData.maxValue / 2, currency)}</span>
            <span>0</span>
          </div>

          {/* Grid lines */}
          <div className="absolute left-20 right-0 top-0 h-full">
            <div className="absolute inset-x-0 top-0 border-t border-dashed border-gray-200" />
            <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-gray-200" />
            <div className="absolute inset-x-0 bottom-0 border-t border-gray-300" />
          </div>

          {/* Bars */}
          <div className="ml-20 flex h-full items-end gap-1 pb-6">
            {chartData.bars.map((bar, index) => (
              <div
                key={bar.date}
                className="group relative flex flex-1 flex-col items-center"
                style={{ minWidth: '24px', maxWidth: '60px' }}
              >
                {/* Tooltip */}
                <div className="pointer-events-none absolute bottom-full mb-2 z-10 hidden rounded-lg bg-gray-900 px-3 py-2 text-xs shadow-xl group-hover:block">
                  <div className="font-semibold text-white">{bar.formattedDate}</div>
                  <div className="mt-1.5 space-y-1">
                    <div className="flex items-center gap-2 text-white/90">
                      <span className="size-2 rounded-full bg-purple-400" />
                      {formatCurrency(bar.revenue, currency)}
                    </div>
                    <div className="flex items-center gap-2 text-white/90">
                      <span className="size-2 rounded-full bg-green-400" />
                      {formatCurrency(bar.profit, currency)}
                    </div>
                  </div>
                  {/* Arrow */}
                  <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                </div>

                {/* Bar container */}
                <div className="flex h-full w-full items-end justify-center gap-1">
                  {/* Revenue bar */}
                  <div
                    className="w-3 rounded-t-md bg-gradient-to-t from-purple-600 to-blue-500 transition-all duration-200 hover:from-purple-700 hover:to-blue-600 shadow-sm"
                    style={{ height: `${bar.revenueHeight}%`, minHeight: bar.revenue > 0 ? '4px' : '0' }}
                  />
                  {/* Profit bar */}
                  <div
                    className="w-3 rounded-t-md bg-green-500 transition-all duration-200 hover:bg-green-600 shadow-sm"
                    style={{ height: `${bar.profitHeight}%`, minHeight: bar.profit > 0 ? '4px' : '0' }}
                  />
                </div>

                {/* X-axis label */}
                {(index === 0 || index === chartData.bars.length - 1 || chartData.bars.length <= 10 || index % Math.ceil(chartData.bars.length / 10) === 0) && (
                  <span className="absolute -bottom-1 text-[10px] text-gray-500 whitespace-nowrap font-medium">
                    {bar.formattedDate}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
