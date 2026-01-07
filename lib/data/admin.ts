import { createAdminClient } from '@/lib/supabase/server';
import type { Booking, BookingStatus, Tour } from '@/types';

interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  totalProfit: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
}

interface BookingFilters {
  status?: BookingStatus;
  tourId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

interface ProfitByTour {
  tourId: string;
  tourSlug: string;
  totalRevenue: number;
  totalNet: number;
  totalProfit: number;
  bookingCount: number;
}

/**
 * Get dashboard statistics for a date range
 */
export async function adminGetDashboardStats(
  startDate: string,
  endDate: string
): Promise<DashboardStats | null> {
  const supabase = await createAdminClient();

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('total_retail, total_net, status, created_at')
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  if (error) {
    console.error('Error fetching dashboard stats:', error);
    return null;
  }

  const stats: DashboardStats = {
    totalBookings: bookings.length,
    totalRevenue: 0,
    totalProfit: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    cancelledBookings: 0,
  };

  for (const booking of bookings) {
    const retail = Number(booking.total_retail);
    const net = Number(booking.total_net);

    stats.totalRevenue += retail;
    stats.totalProfit += retail - net;

    switch (booking.status) {
      case 'confirmed':
      case 'completed':
        stats.confirmedBookings++;
        break;
      case 'pending':
      case 'pending_payment':
        stats.pendingBookings++;
        break;
      case 'cancelled':
        stats.cancelledBookings++;
        break;
    }
  }

  return stats;
}

/**
 * List bookings with filters
 */
export async function adminListBookings(
  filters: BookingFilters = {}
): Promise<{ bookings: Booking[]; total: number }> {
  const supabase = await createAdminClient();

  let query = supabase
    .from('bookings')
    .select(`
      *,
      tour:tours (slug)
    `, { count: 'exact' })
    .order('created_at', { ascending: false });

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.tourId) {
    query = query.eq('tour_id', filters.tourId);
  }

  if (filters.startDate) {
    query = query.gte('created_at', filters.startDate);
  }

  if (filters.endDate) {
    query = query.lte('created_at', filters.endDate);
  }

  if (filters.search) {
    query = query.or(
      `customer_name.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%,reference.ilike.%${filters.search}%`
    );
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching bookings:', error);
    return { bookings: [], total: 0 };
  }

  return { bookings: data || [], total: count || 0 };
}

/**
 * Get profit breakdown by tour
 */
export async function adminGetProfitByTour(
  startDate: string,
  endDate: string
): Promise<ProfitByTour[]> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      tour_id,
      total_retail,
      total_net,
      tour:tours (slug)
    `)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .in('status', ['confirmed', 'completed']);

  if (error) {
    console.error('Error fetching profit by tour:', error);
    return [];
  }

  // Aggregate by tour
  const tourMap = new Map<string, ProfitByTour>();

  for (const booking of data || []) {
    const tourId = booking.tour_id;
    const existing = tourMap.get(tourId);

    const retail = Number(booking.total_retail);
    const net = Number(booking.total_net);

    if (existing) {
      existing.totalRevenue += retail;
      existing.totalNet += net;
      existing.totalProfit += retail - net;
      existing.bookingCount++;
    } else {
      const tourData = booking.tour as unknown;
      const tourSlug = Array.isArray(tourData) 
        ? (tourData[0] as { slug?: string })?.slug 
        : (tourData as { slug?: string })?.slug;
      tourMap.set(tourId, {
        tourId,
        tourSlug: tourSlug || 'unknown',
        totalRevenue: retail,
        totalNet: net,
        totalProfit: retail - net,
        bookingCount: 1,
      });
    }
  }

  return Array.from(tourMap.values()).sort(
    (a, b) => b.totalProfit - a.totalProfit
  );
}

/**
 * Get daily revenue for chart
 */
export async function adminGetDailyRevenue(
  startDate: string,
  endDate: string
): Promise<{ date: string; revenue: number; profit: number }[]> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from('bookings')
    .select('created_at, total_retail, total_net')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .in('status', ['confirmed', 'completed'])
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching daily revenue:', error);
    return [];
  }

  // Aggregate by day
  const dailyMap = new Map<string, { revenue: number; profit: number }>();

  for (const booking of data || []) {
    const date = booking.created_at.split('T')[0];
    const retail = Number(booking.total_retail);
    const net = Number(booking.total_net);

    const existing = dailyMap.get(date);
    if (existing) {
      existing.revenue += retail;
      existing.profit += retail - net;
    } else {
      dailyMap.set(date, {
        revenue: retail,
        profit: retail - net,
      });
    }
  }

  return Array.from(dailyMap.entries()).map(([date, stats]) => ({
    date,
    ...stats,
  }));
}

/**
 * List all tours (including drafts) for admin
 */
export async function adminListTours(): Promise<any[]> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from('tours')
    .select(`
      *,
      blocks:tour_blocks(
        id,
        block_type,
        order,
        enabled,
        config,
        translations:tour_block_translations(
          id,
          language,
          title,
          content
        )
      ),
      pricing:tour_pricing(
        id,
        config
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tours:', error);
    return [];
  }

  const tours = data || [];
  const tourIds = tours.map(t => t.id);

  // Fetch categories for all tours
  const { data: categoryAssignments } = await supabase
    .from('tour_category_assignments')
    .select(`
      tour_id,
      tour_categories (*)
    `)
    .in('tour_id', tourIds);

  // Fetch special labels for all tours
  const { data: labelAssignments } = await supabase
    .from('tour_special_label_assignments')
    .select(`
      tour_id,
      tour_special_labels (*)
    `)
    .in('tour_id', tourIds);

  // Create maps for categories and labels
  const categoriesByTourId = new Map<string, any[]>();
  const labelsByTourId = new Map<string, any[]>();

  (categoryAssignments || []).forEach((assignment: any) => {
    const tourId = assignment.tour_id;
    if (!categoriesByTourId.has(tourId)) {
      categoriesByTourId.set(tourId, []);
    }
    if (assignment.tour_categories) {
      categoriesByTourId.get(tourId)!.push(assignment.tour_categories);
    }
  });

  (labelAssignments || []).forEach((assignment: any) => {
    const tourId = assignment.tour_id;
    if (!labelsByTourId.has(tourId)) {
      labelsByTourId.set(tourId, []);
    }
    if (assignment.tour_special_labels) {
      labelsByTourId.get(tourId)!.push(assignment.tour_special_labels);
    }
  });

  // Transform the data to include pricing config, categories, and labels
  const transformedTours = tours.map(tour => ({
    ...tour,
    blocks: tour.blocks || [],
    pricing: tour.pricing?.[0]?.config || null,
    categories: categoriesByTourId.get(tour.id) || [],
    specialLabels: labelsByTourId.get(tour.id) || [],
  }));

  return transformedTours;
}

/**
 * Create a new tour
 */
export async function adminCreateTour(
  slug: string,
  pricingEngine: 'flat_per_person' | 'adult_child' | 'seat_based'
): Promise<{ tour: Tour | null; error: string | null }> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from('tours')
    .insert({
      slug,
      pricing_engine: pricingEngine,
      status: 'draft',
    })
    .select()
    .single();

  if (error) {
    return { tour: null, error: error.message };
  }

  return { tour: data, error: null };
}

/**
 * Update tour status
 */
export async function adminUpdateTourStatus(
  tourId: string,
  status: 'draft' | 'published' | 'archived'
): Promise<boolean> {
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from('tours')
    .update({ status })
    .eq('id', tourId);

  return !error;
}

/**
 * Delete a tour
 */
export async function adminDeleteTour(tourId: string): Promise<boolean> {
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from('tours')
    .delete()
    .eq('id', tourId);

  return !error;
}

/**
 * Get a single booking by ID
 */
export async function adminGetBookingById(bookingId: string): Promise<Booking | null> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      tour:tours (id, slug),
      booking_items (*)
    `)
    .eq('id', bookingId)
    .single();

  if (error) {
    console.error('Error fetching booking:', error);
    return null;
  }

  return data;
}

/**
 * Update booking status
 */
export async function adminUpdateBookingStatus(
  bookingId: string,
  status: BookingStatus
): Promise<boolean> {
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId);

  return !error;
}

/**
 * Delete a booking
 */
export async function adminDeleteBooking(bookingId: string): Promise<boolean> {
  const supabase = await createAdminClient();

  // Delete booking items first
  await supabase
    .from('booking_items')
    .delete()
    .eq('booking_id', bookingId);

  // Delete the booking
  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', bookingId);

  return !error;
}

/**
 * Get bookings grouped by status for chart
 */
export async function adminGetBookingsByStatus(
  startDate?: string,
  endDate?: string
): Promise<{ status: string; count: number }[]> {
  const supabase = await createAdminClient();

  let query = supabase
    .from('bookings')
    .select('status');

  if (startDate) {
    query = query.gte('created_at', startDate);
  }
  if (endDate) {
    query = query.lte('created_at', endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching bookings by status:', error);
    return [];
  }

  // Count by status
  const statusCounts = new Map<string, number>();
  for (const booking of data || []) {
    const count = statusCounts.get(booking.status) || 0;
    statusCounts.set(booking.status, count + 1);
  }

  return Array.from(statusCounts.entries()).map(([status, count]) => ({
    status,
    count,
  }));
}

/**
 * Get top performing tours
 */
export async function adminGetTopTours(
  startDate: string,
  endDate: string,
  limit: number = 5
): Promise<{
  tourId: string;
  tourSlug: string;
  bookingCount: number;
  totalRevenue: number;
  totalProfit: number;
}[]> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      tour_id,
      total_retail,
      total_net,
      tour:tours (slug)
    `)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .in('status', ['confirmed', 'completed']);

  if (error) {
    console.error('Error fetching top tours:', error);
    return [];
  }

  // Aggregate by tour
  const tourMap = new Map<string, {
    tourId: string;
    tourSlug: string;
    bookingCount: number;
    totalRevenue: number;
    totalProfit: number;
  }>();

  for (const booking of data || []) {
    const tourId = booking.tour_id;
    const existing = tourMap.get(tourId);
    const retail = Number(booking.total_retail);
    const net = Number(booking.total_net);

    if (existing) {
      existing.bookingCount++;
      existing.totalRevenue += retail;
      existing.totalProfit += retail - net;
    } else {
      const tourData = booking.tour as unknown;
      const tourSlug = Array.isArray(tourData)
        ? (tourData[0] as { slug?: string })?.slug
        : (tourData as { slug?: string })?.slug;
      tourMap.set(tourId, {
        tourId,
        tourSlug: tourSlug || 'unknown',
        bookingCount: 1,
        totalRevenue: retail,
        totalProfit: retail - net,
      });
    }
  }

  return Array.from(tourMap.values())
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, limit);
}

/**
 * Get recent activity for dashboard
 */
export async function adminGetRecentActivity(
  limit: number = 10
): Promise<{
  id: string;
  type: 'booking_created' | 'booking_confirmed' | 'booking_cancelled';
  message: string;
  timestamp: string;
}[]> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from('bookings')
    .select('id, reference, customer_name, status, created_at, updated_at')
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }

  return (data || []).map((booking) => {
    let type: 'booking_created' | 'booking_confirmed' | 'booking_cancelled' = 'booking_created';
    let message = `New booking ${booking.reference} by ${booking.customer_name}`;

    if (booking.status === 'confirmed' || booking.status === 'completed') {
      type = 'booking_confirmed';
      message = `Booking ${booking.reference} confirmed`;
    } else if (booking.status === 'cancelled') {
      type = 'booking_cancelled';
      message = `Booking ${booking.reference} cancelled`;
    }

    return {
      id: booking.id,
      type,
      message,
      timestamp: booking.updated_at,
    };
  });
}

/**
 * Get dashboard summary stats
 */
export async function adminGetDashboardSummary(): Promise<{
  todayBookings: number;
  todayRevenue: number;
  weekBookings: number;
  weekRevenue: number;
  monthBookings: number;
  monthRevenue: number;
  pendingBookings: number;
  avgOrderValue: number;
}> {
  const supabase = await createAdminClient();
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const { data: allBookings } = await supabase
    .from('bookings')
    .select('total_retail, status, created_at')
    .gte('created_at', monthAgo);

  const bookings = allBookings || [];

  let todayBookings = 0;
  let todayRevenue = 0;
  let weekBookings = 0;
  let weekRevenue = 0;
  let monthBookings = 0;
  let monthRevenue = 0;
  let pendingBookings = 0;
  let totalRevenue = 0;
  let confirmedCount = 0;

  for (const booking of bookings) {
    const bookingDate = booking.created_at.split('T')[0];
    const retail = Number(booking.total_retail);

    monthBookings++;
    monthRevenue += retail;

    if (bookingDate === today) {
      todayBookings++;
      todayRevenue += retail;
    }

    if (bookingDate >= weekAgo) {
      weekBookings++;
      weekRevenue += retail;
    }

    if (booking.status === 'pending' || booking.status === 'pending_payment') {
      pendingBookings++;
    }

    if (booking.status === 'confirmed' || booking.status === 'completed') {
      totalRevenue += retail;
      confirmedCount++;
    }
  }

  const avgOrderValue = confirmedCount > 0 ? totalRevenue / confirmedCount : 0;

  return {
    todayBookings,
    todayRevenue,
    weekBookings,
    weekRevenue,
    monthBookings,
    monthRevenue,
    pendingBookings,
    avgOrderValue,
  };
}

/**
 * List all staff users
 */
export async function adminListStaff(): Promise<{
  id: string;
  email: string;
  role: string;
  created_at: string;
}[]> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from('admin_users')
    .select('id, email, role, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching staff:', error);
    return [];
  }

  return data || [];
}

