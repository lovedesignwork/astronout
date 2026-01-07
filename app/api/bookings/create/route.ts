import { NextRequest, NextResponse } from 'next/server';
import { createBooking } from '@/lib/data/bookings';
import type { CreateBookingPayload } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.tourId || !body.bookingDate || !body.customerName || !body.customerEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.customerEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate selection
    if (!body.selection || !body.selection.tour) {
      return NextResponse.json(
        { success: false, error: 'Invalid booking selection' },
        { status: 400 }
      );
    }

    const payload: CreateBookingPayload = {
      tourId: body.tourId,
      availabilityId: body.availabilityId,
      bookingDate: body.bookingDate,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      customerNationality: body.customerNationality,
      language: body.language || 'en',
      selection: body.selection,
      notes: body.notes,
    };

    const { booking, error } = await createBooking(payload);

    if (error) {
      return NextResponse.json(
        { success: false, error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        reference: booking.reference,
        status: booking.status,
      },
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}





