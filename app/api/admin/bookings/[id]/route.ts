import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// GET /api/admin/bookings/[id] - Get a single booking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createAdminClient();

    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        *,
        tour:tours (id, slug, pricing_engine),
        booking_items (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }
      console.error('Error fetching booking:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Error in GET /api/admin/bookings/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/bookings/[id] - Update a booking
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createAdminClient();
    const body = await request.json();

    const {
      bookingDate,
      customerName,
      customerEmail,
      customerPhone,
      customerNationality,
      status,
      notes,
      items,
    } = body;

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {};
    if (bookingDate !== undefined) updateData.booking_date = bookingDate;
    if (customerName !== undefined) updateData.customer_name = customerName;
    if (customerEmail !== undefined) updateData.customer_email = customerEmail;
    if (customerPhone !== undefined) updateData.customer_phone = customerPhone;
    if (customerNationality !== undefined) updateData.customer_nationality = customerNationality;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    // If items are provided, recalculate totals
    if (items && Array.isArray(items)) {
      let totalRetail = 0;
      let totalNet = 0;
      for (const item of items) {
        totalRetail += item.subtotal_retail || 0;
        totalNet += item.subtotal_net || 0;
      }
      updateData.total_retail = totalRetail;
      updateData.total_net = totalNet;
    }

    // Update booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (bookingError) {
      if (bookingError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }
      console.error('Error updating booking:', bookingError);
      return NextResponse.json({ error: bookingError.message }, { status: 500 });
    }

    // If items are provided, update them
    if (items && Array.isArray(items)) {
      // Delete existing items
      await supabase
        .from('booking_items')
        .delete()
        .eq('booking_id', id);

      // Insert new items
      if (items.length > 0) {
        const bookingItems = items.map((item: {
          item_type: string;
          item_id: string;
          item_name: string;
          quantity: number;
          retail_price_snapshot: number;
          net_price_snapshot: number;
          subtotal_retail: number;
          subtotal_net: number;
          metadata?: Record<string, unknown>;
        }) => ({
          booking_id: id,
          item_type: item.item_type,
          item_id: item.item_id,
          item_name: item.item_name,
          quantity: item.quantity,
          retail_price_snapshot: item.retail_price_snapshot,
          net_price_snapshot: item.net_price_snapshot,
          subtotal_retail: item.subtotal_retail,
          subtotal_net: item.subtotal_net,
          metadata: item.metadata || null,
        }));

        await supabase.from('booking_items').insert(bookingItems);
      }
    }

    // Fetch complete booking with items
    const { data: completeBooking } = await supabase
      .from('bookings')
      .select(`
        *,
        tour:tours (id, slug),
        booking_items (*)
      `)
      .eq('id', id)
      .single();

    return NextResponse.json({ booking: completeBooking });
  } catch (error) {
    console.error('Error in PUT /api/admin/bookings/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/bookings/[id] - Delete a booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createAdminClient();

    // First delete booking items (cascade should handle this, but being explicit)
    await supabase
      .from('booking_items')
      .delete()
      .eq('booking_id', id);

    // Delete the booking
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting booking:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/bookings/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}





