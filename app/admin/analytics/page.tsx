import { Suspense } from 'react';
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear } from 'date-fns';
import {
  getAnalyticsSummary,
  getDailyVisitors,
  getVisitorsByCountry,
  getTopPages,
  getDeviceBreakdown,
  getBrowserBreakdown,
  getTrafficSources,
  getHourlyDistribution,
  getActiveVisitors,
  getWeeklyVisitors,
  getMonthlyVisitors,
} from '@/lib/data/analytics';
import { AnalyticsPageClient } from './AnalyticsPageClient';

type DateRange = 'today' | 'week' | 'month' | 'last30' | 'year' | 'custom';
type Period = 'day' | 'week' | 'month' | 'year';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function getDateRange(range: DateRange, customStart?: string, customEnd?: string) {
  const today = new Date();

  switch (range) {
    case 'today':
      const todayStr = format(today, 'yyyy-MM-dd');
      return { startDate: todayStr, endDate: todayStr };
    case 'week':
      return {
        startDate: format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
        endDate: format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
      };
    case 'month':
      return {
        startDate: format(startOfMonth(today), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(today), 'yyyy-MM-dd'),
      };
    case 'last30':
      return {
        startDate: format(subDays(today, 30), 'yyyy-MM-dd'),
        endDate: format(today, 'yyyy-MM-dd'),
      };
    case 'year':
      return {
        startDate: format(startOfYear(today), 'yyyy-MM-dd'),
        endDate: format(today, 'yyyy-MM-dd'),
      };
    case 'custom':
      return {
        startDate: customStart || format(startOfMonth(today), 'yyyy-MM-dd'),
        endDate: customEnd || format(endOfMonth(today), 'yyyy-MM-dd'),
      };
    default:
      return {
        startDate: format(subDays(today, 30), 'yyyy-MM-dd'),
        endDate: format(today, 'yyyy-MM-dd'),
      };
  }
}

export default async function AnalyticsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const range = (params.range as DateRange) || 'last30';
  const period = (params.period as Period) || 'day';
  const customStart = params.start as string | undefined;
  const customEnd = params.end as string | undefined;

  const { startDate, endDate } = getDateRange(range, customStart, customEnd);

  // Fetch all analytics data in parallel
  const [
    summary,
    dailyVisitors,
    weeklyVisitors,
    monthlyVisitors,
    countries,
    topPages,
    devices,
    browsers,
    sources,
    hourlyData,
    liveVisitors,
  ] = await Promise.all([
    getAnalyticsSummary(),
    getDailyVisitors(startDate, endDate),
    getWeeklyVisitors(12),
    getMonthlyVisitors(12),
    getVisitorsByCountry(startDate, endDate, 10),
    getTopPages(startDate, endDate, 10),
    getDeviceBreakdown(startDate, endDate),
    getBrowserBreakdown(startDate, endDate),
    getTrafficSources(startDate, endDate, 10),
    getHourlyDistribution(startDate, endDate),
    getActiveVisitors(),
  ]);

  // Choose trend data based on period
  let trendData;
  switch (period) {
    case 'week':
      trendData = weeklyVisitors;
      break;
    case 'month':
    case 'year':
      trendData = monthlyVisitors;
      break;
    default:
      trendData = dailyVisitors;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-600">
            Track your website visitors and traffic patterns
          </p>
        </div>
      </div>

      <Suspense fallback={<div className="h-screen animate-pulse bg-gray-100 rounded-lg" />}>
        <AnalyticsPageClient
          summary={summary}
          trendData={trendData}
          countries={countries}
          topPages={topPages}
          devices={devices}
          browsers={browsers}
          sources={sources}
          hourlyData={hourlyData}
          liveVisitors={liveVisitors}
          currentRange={range}
          currentPeriod={period}
          startDate={startDate}
          endDate={endDate}
        />
      </Suspense>
    </div>
  );
}



