'use client';

import { useMemo, useState } from 'react';

interface TrendData {
  date: string;
  totalVisits: number;
  uniqueSessions: number;
}

interface VisitorTrendChartProps {
  data: TrendData[];
  period: 'day' | 'week' | 'month' | 'year';
  onPeriodChange: (period: 'day' | 'week' | 'month' | 'year') => void;
}

export function VisitorTrendChart({ data, period, onPeriodChange }: VisitorTrendChartProps) {
  const [showUnique, setShowUnique] = useState(true);

  const chartData = useMemo(() => {
    if (data.length === 0) return { bars: [], maxValue: 0 };

    const maxValue = Math.max(
      ...data.map(d => showUnique ? d.uniqueSessions : d.totalVisits),
      1
    );

    const bars = data.map(d => {
      const value = showUnique ? d.uniqueSessions : d.totalVisits;
      let formattedDate = '';
      
      const date = new Date(d.date);
      if (period === 'day') {
        formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (period === 'week') {
        formattedDate = `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      } else if (period === 'month' || period === 'year') {
        formattedDate = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      }

      return {
        ...d,
        value,
        height: (value / maxValue) * 100,
        formattedDate,
      };
    });

    return { bars, maxValue };
  }, [data, showUnique, period]);

  const totals = useMemo(() => {
    return data.reduce(
      (acc, d) => ({
        totalVisits: acc.totalVisits + d.totalVisits,
        uniqueSessions: acc.uniqueSessions + d.uniqueSessions,
      }),
      { totalVisits: 0, uniqueSessions: 0 }
    );
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="card bg-white shadow-sm border border-gray-200">
        <div className="card-body p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Visitor Trends</h3>
          <div className="flex h-56 items-center justify-center">
            <div className="text-center">
              <svg className="mx-auto size-12 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              <p className="mt-3 text-sm text-gray-500">No visitor data available yet</p>
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
          <div>
            <h3 className="text-lg font-bold text-gray-900">Visitor Trends</h3>
            <p className="text-sm text-gray-500 mt-1">
              {showUnique ? 'Unique visitors' : 'Total page views'} over time
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Period Toggle */}
            <div className="flex rounded-lg bg-gray-100 p-1">
              {(['day', 'week', 'month', 'year'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => onPeriodChange(p)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    period === p
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>

            {/* Metric Toggle */}
            <div className="flex rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => setShowUnique(true)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  showUnique
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Visitors
              </button>
              <button
                onClick={() => setShowUnique(false)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  !showUnique
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Views
              </button>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="flex items-center gap-6 mb-6">
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-sm" />
            <span className="text-sm text-gray-600">
              Unique Visitors: <span className="font-bold text-gray-900">{totals.uniqueSessions.toLocaleString()}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-purple-500 shadow-sm" />
            <span className="text-sm text-gray-600">
              Page Views: <span className="font-bold text-gray-900">{totals.totalVisits.toLocaleString()}</span>
            </span>
          </div>
        </div>

        {/* Chart */}
        <div className="relative h-64">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 flex h-full w-16 flex-col justify-between text-right text-xs text-gray-500 pr-3 font-medium">
            <span>{chartData.maxValue.toLocaleString()}</span>
            <span>{Math.round(chartData.maxValue / 2).toLocaleString()}</span>
            <span>0</span>
          </div>

          {/* Grid lines */}
          <div className="absolute left-16 right-0 top-0 h-full">
            <div className="absolute inset-x-0 top-0 border-t border-dashed border-gray-200" />
            <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-gray-200" />
            <div className="absolute inset-x-0 bottom-0 border-t border-gray-300" />
          </div>

          {/* Bars */}
          <div className="ml-16 flex h-full items-end gap-1 pb-6">
            {chartData.bars.map((bar, index) => (
              <div
                key={bar.date}
                className="group relative flex flex-1 flex-col items-center"
                style={{ minWidth: '16px', maxWidth: '50px' }}
              >
                {/* Tooltip */}
                <div className="pointer-events-none absolute bottom-full mb-2 z-10 hidden rounded-lg bg-gray-900 px-3 py-2 text-xs shadow-xl group-hover:block whitespace-nowrap">
                  <div className="font-semibold text-white">{bar.formattedDate}</div>
                  <div className="mt-1.5 space-y-1">
                    <div className="flex items-center gap-2 text-white/90">
                      <span className="size-2 rounded-full bg-cyan-400" />
                      {bar.uniqueSessions.toLocaleString()} visitors
                    </div>
                    <div className="flex items-center gap-2 text-white/90">
                      <span className="size-2 rounded-full bg-purple-400" />
                      {bar.totalVisits.toLocaleString()} views
                    </div>
                  </div>
                  <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                </div>

                {/* Bar */}
                <div
                  className={`w-full max-w-[20px] rounded-t-md transition-all duration-200 shadow-sm ${
                    showUnique
                      ? 'bg-gradient-to-t from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600'
                      : 'bg-gradient-to-t from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                  }`}
                  style={{ height: `${bar.height}%`, minHeight: bar.value > 0 ? '4px' : '0' }}
                />

                {/* X-axis label */}
                {(index === 0 || 
                  index === chartData.bars.length - 1 || 
                  chartData.bars.length <= 10 || 
                  index % Math.ceil(chartData.bars.length / 8) === 0) && (
                  <span className="absolute -bottom-1 text-[10px] text-gray-500 whitespace-nowrap font-medium">
                    {bar.formattedDate.split(' ')[0]}
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




