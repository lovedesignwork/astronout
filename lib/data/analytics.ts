import { createAdminClient } from '@/lib/supabase/server';

// Types for analytics data
export interface VisitorStats {
  totalVisits: number;
  uniqueSessions: number;
  uniqueCountries: number;
}

export interface DailyVisitors {
  date: string;
  totalVisits: number;
  uniqueSessions: number;
}

export interface CountryData {
  countryCode: string;
  countryName: string;
  visitCount: number;
  uniqueVisitors: number;
}

export interface TopPage {
  pagePath: string;
  visitCount: number;
  uniqueVisitors: number;
}

export interface DeviceData {
  deviceType: string;
  visitCount: number;
  percentage: number;
}

export interface BrowserData {
  browser: string;
  visitCount: number;
  percentage: number;
}

export interface TrafficSource {
  source: string;
  visitCount: number;
  percentage: number;
}

export interface HourlyData {
  hour: number;
  visitCount: number;
}

export interface AnalyticsSummary {
  todayVisits: number;
  todayUniqueVisitors: number;
  weekVisits: number;
  weekUniqueVisitors: number;
  monthVisits: number;
  monthUniqueVisitors: number;
  yearVisits: number;
  yearUniqueVisitors: number;
  // Comparison with previous period
  todayChange: number;
  weekChange: number;
  monthChange: number;
}

/**
 * Get visitor statistics for a date range
 */
export async function getVisitorStats(
  startDate: string,
  endDate: string
): Promise<VisitorStats> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase.rpc('get_visitor_stats', {
    start_date: startDate,
    end_date: endDate,
  });

  if (error) {
    console.error('Error fetching visitor stats:', error);
    return { totalVisits: 0, uniqueSessions: 0, uniqueCountries: 0 };
  }

  const stats = data?.[0];
  return {
    totalVisits: Number(stats?.total_visits) || 0,
    uniqueSessions: Number(stats?.unique_sessions) || 0,
    uniqueCountries: Number(stats?.unique_countries) || 0,
  };
}

/**
 * Get daily visitor counts for charts
 */
export async function getDailyVisitors(
  startDate: string,
  endDate: string
): Promise<DailyVisitors[]> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase.rpc('get_daily_visitors', {
    start_date: startDate,
    end_date: endDate,
  });

  if (error) {
    console.error('Error fetching daily visitors:', error);
    return [];
  }

  return (data || []).map((row: { visit_date: string; total_visits: number; unique_sessions: number }) => ({
    date: row.visit_date,
    totalVisits: Number(row.total_visits),
    uniqueSessions: Number(row.unique_sessions),
  }));
}

/**
 * Get visitors grouped by country
 */
export async function getVisitorsByCountry(
  startDate: string,
  endDate: string,
  limit: number = 10
): Promise<CountryData[]> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase.rpc('get_visitors_by_country', {
    start_date: startDate,
    end_date: endDate,
    limit_count: limit,
  });

  if (error) {
    console.error('Error fetching visitors by country:', error);
    return [];
  }

  return (data || []).map((row: { country_code: string; country_name: string; visit_count: number; unique_visitors: number }) => ({
    countryCode: row.country_code || 'XX',
    countryName: row.country_name || 'Unknown',
    visitCount: Number(row.visit_count),
    uniqueVisitors: Number(row.unique_visitors),
  }));
}

/**
 * Get top visited pages
 */
export async function getTopPages(
  startDate: string,
  endDate: string,
  limit: number = 10
): Promise<TopPage[]> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase.rpc('get_top_pages', {
    start_date: startDate,
    end_date: endDate,
    limit_count: limit,
  });

  if (error) {
    console.error('Error fetching top pages:', error);
    return [];
  }

  return (data || []).map((row: { page_path: string; visit_count: number; unique_visitors: number }) => ({
    pagePath: row.page_path,
    visitCount: Number(row.visit_count),
    uniqueVisitors: Number(row.unique_visitors),
  }));
}

/**
 * Get device type breakdown
 */
export async function getDeviceBreakdown(
  startDate: string,
  endDate: string
): Promise<DeviceData[]> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase.rpc('get_device_breakdown', {
    start_date: startDate,
    end_date: endDate,
  });

  if (error) {
    console.error('Error fetching device breakdown:', error);
    return [];
  }

  return (data || []).map((row: { device_type: string; visit_count: number; percentage: number }) => ({
    deviceType: row.device_type || 'unknown',
    visitCount: Number(row.visit_count),
    percentage: Number(row.percentage) || 0,
  }));
}

/**
 * Get browser breakdown
 */
export async function getBrowserBreakdown(
  startDate: string,
  endDate: string
): Promise<BrowserData[]> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase.rpc('get_browser_breakdown', {
    start_date: startDate,
    end_date: endDate,
  });

  if (error) {
    console.error('Error fetching browser breakdown:', error);
    return [];
  }

  return (data || []).map((row: { browser: string; visit_count: number; percentage: number }) => ({
    browser: row.browser || 'Unknown',
    visitCount: Number(row.visit_count),
    percentage: Number(row.percentage) || 0,
  }));
}

/**
 * Get traffic sources
 */
export async function getTrafficSources(
  startDate: string,
  endDate: string,
  limit: number = 10
): Promise<TrafficSource[]> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase.rpc('get_traffic_sources', {
    start_date: startDate,
    end_date: endDate,
    limit_count: limit,
  });

  if (error) {
    console.error('Error fetching traffic sources:', error);
    return [];
  }

  return (data || []).map((row: { source: string; visit_count: number; percentage: number }) => ({
    source: row.source || 'Direct',
    visitCount: Number(row.visit_count),
    percentage: Number(row.percentage) || 0,
  }));
}

/**
 * Get hourly distribution
 */
export async function getHourlyDistribution(
  startDate: string,
  endDate: string
): Promise<HourlyData[]> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase.rpc('get_hourly_distribution', {
    start_date: startDate,
    end_date: endDate,
  });

  if (error) {
    console.error('Error fetching hourly distribution:', error);
    return [];
  }

  // Fill in missing hours with 0
  const hourlyMap = new Map<number, number>();
  for (let i = 0; i < 24; i++) {
    hourlyMap.set(i, 0);
  }

  for (const row of data || []) {
    hourlyMap.set(Number(row.hour_of_day), Number(row.visit_count));
  }

  return Array.from(hourlyMap.entries()).map(([hour, visitCount]) => ({
    hour,
    visitCount,
  }));
}

/**
 * Get active (live) visitor count
 */
export async function getActiveVisitors(): Promise<number> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase.rpc('get_active_visitors');

  if (error) {
    console.error('Error fetching active visitors:', error);
    return 0;
  }

  return Number(data) || 0;
}

/**
 * Get comprehensive analytics summary
 */
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  // Calculate date ranges
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 6);
  const weekStartStr = weekStart.toISOString().split('T')[0];
  
  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(weekStart);
  lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
  const lastWeekStartStr = lastWeekStart.toISOString().split('T')[0];
  const lastWeekEndStr = lastWeekEnd.toISOString().split('T')[0];
  
  const monthStart = new Date(now);
  monthStart.setDate(monthStart.getDate() - 29);
  const monthStartStr = monthStart.toISOString().split('T')[0];
  
  const lastMonthStart = new Date(monthStart);
  lastMonthStart.setDate(lastMonthStart.getDate() - 30);
  const lastMonthEnd = new Date(monthStart);
  lastMonthEnd.setDate(lastMonthEnd.getDate() - 1);
  const lastMonthStartStr = lastMonthStart.toISOString().split('T')[0];
  const lastMonthEndStr = lastMonthEnd.toISOString().split('T')[0];
  
  const yearStart = new Date(now);
  yearStart.setFullYear(yearStart.getFullYear(), 0, 1);
  const yearStartStr = yearStart.toISOString().split('T')[0];

  // Fetch all stats in parallel
  const [
    todayStats,
    yesterdayStats,
    weekStats,
    lastWeekStats,
    monthStats,
    lastMonthStats,
    yearStats,
  ] = await Promise.all([
    getVisitorStats(today, today),
    getVisitorStats(yesterdayStr, yesterdayStr),
    getVisitorStats(weekStartStr, today),
    getVisitorStats(lastWeekStartStr, lastWeekEndStr),
    getVisitorStats(monthStartStr, today),
    getVisitorStats(lastMonthStartStr, lastMonthEndStr),
    getVisitorStats(yearStartStr, today),
  ]);

  // Calculate percentage changes
  const calcChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  return {
    todayVisits: todayStats.totalVisits,
    todayUniqueVisitors: todayStats.uniqueSessions,
    weekVisits: weekStats.totalVisits,
    weekUniqueVisitors: weekStats.uniqueSessions,
    monthVisits: monthStats.totalVisits,
    monthUniqueVisitors: monthStats.uniqueSessions,
    yearVisits: yearStats.totalVisits,
    yearUniqueVisitors: yearStats.uniqueSessions,
    todayChange: calcChange(todayStats.uniqueSessions, yesterdayStats.uniqueSessions),
    weekChange: calcChange(weekStats.uniqueSessions, lastWeekStats.uniqueSessions),
    monthChange: calcChange(monthStats.uniqueSessions, lastMonthStats.uniqueSessions),
  };
}

/**
 * Get weekly visitor data (aggregated by week)
 */
export async function getWeeklyVisitors(weeks: number = 12): Promise<DailyVisitors[]> {
  const supabase = await createAdminClient();
  
  const now = new Date();
  const endDate = now.toISOString().split('T')[0];
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - (weeks * 7));
  const startDateStr = startDate.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('page_visits')
    .select('created_at, session_id')
    .gte('created_at', startDateStr)
    .lte('created_at', endDate);

  if (error) {
    console.error('Error fetching weekly visitors:', error);
    return [];
  }

  // Aggregate by week
  const weeklyMap = new Map<string, { totalVisits: number; sessions: Set<string> }>();

  for (const row of data || []) {
    const date = new Date(row.created_at);
    // Get the Monday of the week
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    const weekKey = date.toISOString().split('T')[0];

    if (!weeklyMap.has(weekKey)) {
      weeklyMap.set(weekKey, { totalVisits: 0, sessions: new Set() });
    }
    const week = weeklyMap.get(weekKey)!;
    week.totalVisits++;
    week.sessions.add(row.session_id);
  }

  return Array.from(weeklyMap.entries())
    .map(([date, data]) => ({
      date,
      totalVisits: data.totalVisits,
      uniqueSessions: data.sessions.size,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get monthly visitor data
 */
export async function getMonthlyVisitors(months: number = 12): Promise<DailyVisitors[]> {
  const supabase = await createAdminClient();
  
  const now = new Date();
  const endDate = now.toISOString().split('T')[0];
  const startDate = new Date(now);
  startDate.setMonth(startDate.getMonth() - months);
  const startDateStr = startDate.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('page_visits')
    .select('created_at, session_id')
    .gte('created_at', startDateStr)
    .lte('created_at', endDate);

  if (error) {
    console.error('Error fetching monthly visitors:', error);
    return [];
  }

  // Aggregate by month
  const monthlyMap = new Map<string, { totalVisits: number; sessions: Set<string> }>();

  for (const row of data || []) {
    const date = new Date(row.created_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;

    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, { totalVisits: 0, sessions: new Set() });
    }
    const month = monthlyMap.get(monthKey)!;
    month.totalVisits++;
    month.sessions.add(row.session_id);
  }

  return Array.from(monthlyMap.entries())
    .map(([date, data]) => ({
      date,
      totalVisits: data.totalVisits,
      uniqueSessions: data.sessions.size,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}



