import { Suspense } from 'react';
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import Link from 'next/link';
import { 
  adminGetDashboardStats, 
  adminGetProfitByTour, 
  adminListBookings, 
  adminGetDailyRevenue,
  adminGetBookingsByStatus,
  adminGetTopTours,
  adminGetRecentActivity,
  adminGetDashboardSummary
} from '@/lib/data/admin';
import { formatCurrency } from '@/lib/utils';
import { DashboardDateFilter } from '@/components/admin/DashboardDateFilter';
import { RevenueChart } from '@/components/admin/RevenueChart';
import { QuickActions } from '@/components/admin/QuickActions';
import { BookingStatusChart } from '@/components/admin/BookingStatusChart';
import { TopToursChart } from '@/components/admin/TopToursChart';

type DateRange = 'today' | 'week' | 'month' | 'last30' | 'custom';

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
    case 'custom':
      return {
        startDate: customStart || format(startOfMonth(today), 'yyyy-MM-dd'),
        endDate: customEnd || format(endOfMonth(today), 'yyyy-MM-dd'),
      };
    default:
      return {
        startDate: format(startOfMonth(today), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(today), 'yyyy-MM-dd'),
      };
  }
}

// Stat Card Component with enhanced styling
function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend,
  color = 'primary'
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; positive: boolean };
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
}) {
  const colorClasses = {
    primary: 'bg-gradient-to-br from-purple-500 to-purple-600',
    secondary: 'bg-gradient-to-br from-blue-500 to-blue-600',
    accent: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
    success: 'bg-gradient-to-br from-green-500 to-green-600',
    warning: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
    error: 'bg-gradient-to-br from-red-500 to-red-600',
  };

  const iconBgClasses = {
    primary: 'bg-purple-100 text-purple-600',
    secondary: 'bg-blue-100 text-blue-600',
    accent: 'bg-cyan-100 text-cyan-600',
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
            {subtitle && (
              <p className="text-xs text-gray-500">{subtitle}</p>
            )}
            {trend && (
              <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${trend.positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {trend.positive ? (
                  <svg className="size-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                ) : (
                  <svg className="size-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                )}
                <span>{trend.positive ? '+' : ''}{trend.value}%</span>
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

// Quick Stats Mini Card
function MiniStatCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
      <div className="flex size-10 items-center justify-center rounded-lg bg-white shadow-sm text-gray-500">
        {icon}
      </div>
      <div>
        <p className="text-lg font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default async function AdminDashboard({ searchParams }: PageProps) {
  const params = await searchParams;
  const range = (params.range as DateRange) || 'month';
  const customStart = params.start as string | undefined;
  const customEnd = params.end as string | undefined;

  const { startDate, endDate } = getDateRange(range, customStart, customEnd);

  const [stats, profitByTour, recentBookings, dailyRevenue, bookingsByStatus, topTours, recentActivity, summary] = await Promise.all([
    adminGetDashboardStats(startDate, endDate),
    adminGetProfitByTour(startDate, endDate),
    adminListBookings({ limit: 5 }),
    adminGetDailyRevenue(startDate, endDate),
    adminGetBookingsByStatus(startDate, endDate),
    adminGetTopTours(startDate, endDate, 5),
    adminGetRecentActivity(8),
    adminGetDashboardSummary(),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Welcome back! Here&apos;s what&apos;s happening with your business.
          </p>
        </div>
        <QuickActions />
      </div>

      {/* Date Filter */}
      <div className="card bg-white shadow-sm border border-gray-200">
        <div className="card-body p-4">
          <Suspense fallback={<div className="h-10 animate-pulse rounded-lg bg-gray-100" />}>
            <DashboardDateFilter
              currentRange={range}
              startDate={startDate}
              endDate={endDate}
            />
          </Suspense>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenue || 0, 'THB')}
          subtitle={range === 'today' ? 'Today' : range === 'week' ? 'This week' : range === 'month' ? 'This month' : 'Selected period'}
          color="primary"
          trend={{ value: 12.5, positive: true }}
          icon={
            <svg className="size-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <StatCard
          title="Total Bookings"
          value={stats?.totalBookings || 0}
          subtitle={`${stats?.confirmedBookings || 0} confirmed`}
          color="secondary"
          trend={{ value: 8.2, positive: true }}
          icon={
            <svg className="size-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          }
        />

        <StatCard
          title="Net Profit"
          value={formatCurrency(stats?.totalProfit || 0, 'THB')}
          subtitle={stats?.totalRevenue ? `${((stats.totalProfit / stats.totalRevenue) * 100).toFixed(1)}% margin` : 'Net profit'}
          color="success"
          trend={{ value: 15.3, positive: true }}
          icon={
            <svg className="size-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
            </svg>
          }
        />

        <StatCard
          title="Avg. Order Value"
          value={formatCurrency(summary?.avgOrderValue || 0, 'THB')}
          subtitle="Per booking"
          color="accent"
          icon={
            <svg className="size-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
          }
        />
      </div>

      {/* Quick Stats Row */}
      <div className="card bg-white shadow-sm border border-gray-200">
        <div className="card-body p-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MiniStatCard
              label="Today's Bookings"
              value={summary?.todayBookings || 0}
              icon={
                <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <MiniStatCard
              label="Today's Revenue"
              value={formatCurrency(summary?.todayRevenue || 0, 'THB')}
              icon={
                <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33" />
                </svg>
              }
            />
            <MiniStatCard
              label="Pending Bookings"
              value={summary?.pendingBookings || 0}
              icon={
                <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <MiniStatCard
              label="This Week"
              value={formatCurrency(summary?.weekRevenue || 0, 'THB')}
              icon={
                <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              }
            />
          </div>
        </div>
      </div>

      {/* Revenue Chart - Full Width */}
      <RevenueChart data={dailyRevenue} currency="THB" />

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <BookingStatusChart data={bookingsByStatus} />
        <TopToursChart data={topTours} currency="THB" />
      </div>

      {/* Bottom Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Bookings */}
        <div className="card bg-white shadow-sm border border-gray-200">
          <div className="card-body p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Recent Bookings</h3>
              <Link
                href="/admin/bookings"
                className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                View all
                <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
            
            {recentBookings.bookings.length > 0 ? (
              <div className="space-y-3">
                {recentBookings.bookings.map((booking) => (
                  <div key={booking.id} className="flex items-center gap-4 rounded-xl bg-gray-50 p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex size-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                      <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{booking.customer_name}</p>
                      <p className="text-xs text-gray-500">
                        {booking.reference} • {new Date(booking.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {formatCurrency(Number(booking.total_retail), booking.currency)}
                      </p>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          booking.status === 'confirmed' || booking.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : booking.status === 'cancelled'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-gray-100">
                  <svg className="size-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </div>
                <p className="mt-4 font-semibold text-gray-700">No bookings yet</p>
                <p className="mt-1 text-sm text-gray-500">Bookings will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card bg-white shadow-sm border border-gray-200">
          <div className="card-body p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
            </div>
            
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={activity.id} className="flex gap-4">
                    <div className="relative">
                      <div className={`flex size-8 items-center justify-center rounded-full ${
                        activity.type === 'booking_confirmed' 
                          ? 'bg-green-100 text-green-600'
                          : activity.type === 'booking_cancelled'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {activity.type === 'booking_confirmed' ? (
                          <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        ) : activity.type === 'booking_cancelled' ? (
                          <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        ) : (
                          <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                        )}
                      </div>
                      {index < recentActivity.length - 1 && (
                        <div className="absolute left-1/2 top-8 h-full w-px -translate-x-1/2 bg-gray-200" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-gray-100">
                  <svg className="size-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="mt-4 font-semibold text-gray-700">No recent activity</p>
                <p className="mt-1 text-sm text-gray-500">Activity will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
