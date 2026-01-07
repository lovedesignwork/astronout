import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient, toStripeAmount, getPaymentMethodTypes } from '@/lib/stripe';
import { getActiveStripeKeys } from '@/lib/data/settings';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      bookingId,
      amount,
      currency,
      customerEmail,
      customerName,
      tourName,
      bookingReference,
    } = body;

    // Validate required fields
    if (!bookingId || !amount || !currency || !customerEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get active Stripe keys
    const stripeKeys = await getActiveStripeKeys();

    if (!stripeKeys) {
      return NextResponse.json(
        { success: false, error: 'Stripe is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    const stripe = getStripeClient(stripeKeys.secretKey);

    // Get enabled payment method types
    const paymentMethodTypes = getPaymentMethodTypes(stripeKeys.paymentMethods);

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: toStripeAmount(amount, currency),
      currency: currency.toLowerCase(),
      payment_method_types: paymentMethodTypes,
      metadata: {
        booking_id: bookingId,
        booking_reference: bookingReference,
        tour_name: tourName,
        customer_name: customerName,
        mode: stripeKeys.mode,
      },
      receipt_email: customerEmail,
      description: `Booking ${bookingReference} - ${tourName}`,
    });

    // Update booking with payment intent ID
    const supabase = await createClient();
    await supabase
      .from('bookings')
      .update({ stripe_payment_intent_id: paymentIntent.id })
      .eq('id', bookingId);

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      publishableKey: stripeKeys.publishableKey,
      paymentMethods: stripeKeys.paymentMethods,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);

    // Handle Stripe-specific errors
    if (error instanceof Error && 'type' in error) {
      const stripeError = error as { type: string; message: string };
      return NextResponse.json(
        { success: false, error: stripeError.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}

