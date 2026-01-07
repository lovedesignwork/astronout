import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import {
  getVisitorStats,
  getDailyVisitors,
  getVisitorsByCountry,
  getTopPages,
  getDeviceBreakdown,
  getBrowserBreakdown,
  getTrafficSources,
  getHourlyDistribution,
  getActiveVisitors,
  getAnalyticsSummary,
  getWeeklyVisitors,
  getMonthlyVisitors,
} from '@/lib/data/analytics';

// Check if user is admin
async function isAdmin(request: NextRequest): Promise<boolean> {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', user.id)
    .single();

  return !!adminUser;
}

export async function GET(request: NextRequest) {
  // Check admin authentication
  if (!await isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'summary';
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const period = searchParams.get('period') || 'day'; // day, week, month, year

  try {
    switch (type) {
      case 'summary':
        const summary = await getAnalyticsSummary();
        return NextResponse.json(summary);

      case 'visitors':
        if (!startDate || !endDate) {
          return NextResponse.json({ error: 'startDate and endDate required' }, { status: 400 });
        }
        const stats = await getVisitorStats(startDate, endDate);
        return NextResponse.json(stats);

      case 'trend':
        if (period === 'week') {
          const weeklyData = await getWeeklyVisitors(12);
          return NextResponse.json(weeklyData);
        } else if (period === 'month') {
          const monthlyData = await getMonthlyVisitors(12);
          return NextResponse.json(monthlyData);
        } else if (period === 'year') {
          const yearlyData = await getMonthlyVisitors(24);
          return NextResponse.json(yearlyData);
        } else {
          // Daily data (default)
          if (!startDate || !endDate) {
            // Default to last 30 days
            const now = new Date();
            const defaultEnd = now.toISOString().split('T')[0];
            const defaultStart = new Date(now.setDate(now.getDate() - 30)).toISOString().split('T')[0];
            const dailyData = await getDailyVisitors(defaultStart, defaultEnd);
            return NextResponse.json(dailyData);
          }
          const dailyData = await getDailyVisitors(startDate, endDate);
          return NextResponse.json(dailyData);
        }

      case 'countries':
        if (!startDate || !endDate) {
          return NextResponse.json({ error: 'startDate and endDate required' }, { status: 400 });
        }
        const limit = parseInt(searchParams.get('limit') || '10');
        const countries = await getVisitorsByCountry(startDate, endDate, limit);
        return NextResponse.json(countries);

      case 'pages':
        if (!startDate || !endDate) {
          return NextResponse.json({ error: 'startDate and endDate required' }, { status: 400 });
        }
        const pageLimit = parseInt(searchParams.get('limit') || '10');
        const pages = await getTopPages(startDate, endDate, pageLimit);
        return NextResponse.json(pages);

      case 'devices':
        if (!startDate || !endDate) {
          return NextResponse.json({ error: 'startDate and endDate required' }, { status: 400 });
        }
        const devices = await getDeviceBreakdown(startDate, endDate);
        return NextResponse.json(devices);

      case 'browsers':
        if (!startDate || !endDate) {
          return NextResponse.json({ error: 'startDate and endDate required' }, { status: 400 });
        }
        const browsers = await getBrowserBreakdown(startDate, endDate);
        return NextResponse.json(browsers);

      case 'sources':
        if (!startDate || !endDate) {
          return NextResponse.json({ error: 'startDate and endDate required' }, { status: 400 });
        }
        const sourceLimit = parseInt(searchParams.get('limit') || '10');
        const sources = await getTrafficSources(startDate, endDate, sourceLimit);
        return NextResponse.json(sources);

      case 'hourly':
        if (!startDate || !endDate) {
          return NextResponse.json({ error: 'startDate and endDate required' }, { status: 400 });
        }
        const hourly = await getHourlyDistribution(startDate, endDate);
        return NextResponse.json(hourly);

      case 'live':
        const activeCount = await getActiveVisitors();
        return NextResponse.json({ count: activeCount });

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}




