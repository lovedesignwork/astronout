'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { VisitorTrendChart } from '@/components/admin/VisitorTrendChart';
import { CountryBreakdown } from '@/components/admin/CountryBreakdown';
import { TopPagesChart } from '@/components/admin/TopPagesChart';
import { DeviceBreakdown } from '@/components/admin/DeviceBreakdown';
import { TrafficSourcesChart } from '@/components/admin/TrafficSourcesChart';
import { LiveVisitorsCard } from '@/components/admin/LiveVisitorsCard';
import type {
  AnalyticsSummary,
  DailyVisitors,
  CountryData,
  TopPage,
  DeviceData,
  BrowserData,
  TrafficSource,
  HourlyData,
} from '@/lib/data/analytics';

type DateRange = 'today' | 'week' | 'month' | 'last30' | 'year' | 'custom';
type Period = 'day' | 'week' | 'month' | 'year';

interface AnalyticsPageClientProps {
  summary: AnalyticsSummary;
  trendData: DailyVisitors[];
  countries: CountryData[];
  topPages: TopPage[];
  devices: DeviceData[];
  browsers: BrowserData[];
  sources: TrafficSource[];
  hourlyData: HourlyData[];
  liveVisitors: number;
  currentRange: DateRange;
  currentPeriod: Period;
  startDate: string;
  endDate: string;
}

// Stat Card Component
function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'primary',
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; positive: boolean };
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
}) {
  const iconBgClasses = {
    primary: 'bg-cyan-100 text-cyan-600',
    secondary: 'bg-blue-100 text-blue-600',
    accent: 'bg-purple-100 text-purple-600',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-yellow-100 text-yellow-600',
    error: 'bg-red-100 text-red-600',
  };

  return (
    <div className="card bg-white shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
      <div className="card-body p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
            {trend && (
              <div
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                  trend.positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {trend.positive ? (
                  <svg className="size-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                ) : (
                  <svg className="size-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                )}
                <span>
                  {trend.positive ? '+' : ''}
                  {trend.value}%
                </span>
              </div>
            )}
          </div>
          <div className={`flex size-14 items-center justify-center rounded-2xl ${iconBgClasses[color]} shadow-sm`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

// Peak Hours Heatmap
function PeakHoursHeatmap({ data }: { data: HourlyData[] }) {
  const maxVisits = Math.max(...data.map(d => d.visitCount), 1);

  const getIntensity = (count: number) => {
    const ratio = count / maxVisits;
    if (ratio > 0.8) return 'bg-cyan-600';
    if (ratio > 0.6) return 'bg-cyan-500';
    if (ratio > 0.4) return 'bg-cyan-400';
    if (ratio > 0.2) return 'bg-cyan-300';
    if (ratio > 0) return 'bg-cyan-200';
    return 'bg-gray-100';
  };

  return (
    <div className="card bg-white shadow-sm border border-gray-200">
      <div className="card-body p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Peak Hours</h3>
        <p className="text-sm text-gray-500 mb-4">When your visitors are most active</p>

        <div className="grid grid-cols-12 gap-1">
          {data.map((hour) => (
            <div key={hour.hour} className="text-center">
              <div
                className={`h-8 rounded ${getIntensity(hour.visitCount)} transition-colors`}
                title={`${hour.hour}:00 - ${hour.visitCount} visits`}
              />
              <span className="text-[10px] text-gray-400 mt-1 block">
                {hour.hour % 3 === 0 ? `${hour.hour}h` : ''}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-2 mt-4">
          <span className="text-xs text-gray-500">Less</span>
          <div className="flex gap-1">
            <div className="size-3 rounded bg-gray-100" />
            <div className="size-3 rounded bg-cyan-200" />
            <div className="size-3 rounded bg-cyan-300" />
            <div className="size-3 rounded bg-cyan-400" />
            <div className="size-3 rounded bg-cyan-500" />
            <div className="size-3 rounded bg-cyan-600" />
          </div>
          <span className="text-xs text-gray-500">More</span>
        </div>
      </div>
    </div>
  );
}

export function AnalyticsPageClient({
  summary,
  trendData,
  countries,
  topPages,
  devices,
  browsers,
  sources,
  hourlyData,
  liveVisitors,
  currentRange,
  currentPeriod,
  startDate,
  endDate,
}: AnalyticsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [period, setPeriod] = useState<Period>(currentPeriod);

  const handleRangeChange = (newRange: DateRange) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('range', newRange);
    router.push(`/admin/analytics?${params.toString()}`);
  };

  const handlePeriodChange = (newPeriod: Period) => {
    setPeriod(newPeriod);
    const params = new URLSearchParams(searchParams.toString());
    params.set('period', newPeriod);
    router.push(`/admin/analytics?${params.toString()}`);
  };

  return (
    <>
      {/* Date Filter */}
      <div className="card bg-white shadow-sm border border-gray-200">
        <div className="card-body p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Period:</span>
              <div className="flex rounded-lg bg-gray-100 p-1">
                {(['today', 'week', 'month', 'last30', 'year'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => handleRangeChange(range)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      currentRange === range
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {range === 'last30' ? 'Last 30 Days' : range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {startDate} to {endDate}
            </div>
          </div>
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Live Visitors Card */}
        <LiveVisitorsCard initialCount={liveVisitors} />

        <StatCard
          title="Today's Visitors"
          value={summary.todayUniqueVisitors.toLocaleString()}
          subtitle={`${summary.todayVisits.toLocaleString()} page views`}
          color="primary"
          trend={summary.todayChange !== 0 ? { value: summary.todayChange, positive: summary.todayChange > 0 } : undefined}
          icon={
            <svg className="size-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          }
        />

        <StatCard
          title="This Week"
          value={summary.weekUniqueVisitors.toLocaleString()}
          subtitle={`${summary.weekVisits.toLocaleString()} page views`}
          color="secondary"
          trend={summary.weekChange !== 0 ? { value: summary.weekChange, positive: summary.weekChange > 0 } : undefined}
          icon={
            <svg className="size-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          }
        />

        <StatCard
          title="This Month"
          value={summary.monthUniqueVisitors.toLocaleString()}
          subtitle={`${summary.monthVisits.toLocaleString()} page views`}
          color="accent"
          trend={summary.monthChange !== 0 ? { value: summary.monthChange, positive: summary.monthChange > 0 } : undefined}
          icon={
            <svg className="size-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          }
        />

        <StatCard
          title="This Year"
          value={summary.yearUniqueVisitors.toLocaleString()}
          subtitle={`${summary.yearVisits.toLocaleString()} page views`}
          color="success"
          icon={
            <svg className="size-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
            </svg>
          }
        />
      </div>

      {/* Visitor Trend Chart */}
      <VisitorTrendChart data={trendData} period={period} onPeriodChange={handlePeriodChange} />

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CountryBreakdown data={countries} />
        <TopPagesChart data={topPages} />
      </div>

      {/* Three Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        <DeviceBreakdown devices={devices} browsers={browsers} />
        <TrafficSourcesChart data={sources} />
        <PeakHoursHeatmap data={hourlyData} />
      </div>
    </>
  );
}




