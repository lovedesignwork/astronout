import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { getStripeClient } from '@/lib/stripe';
import { getActiveStripeKeys } from '@/lib/data/settings';
import { createAdminClient } from '@/lib/supabase/server';
import { sendAllBookingEmails } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Get Stripe keys
    const stripeKeys = await getActiveStripeKeys();

    if (!stripeKeys || !stripeKeys.webhookSecret) {
      console.error('Stripe webhook secret not configured');
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      );
    }

    const stripe = getStripeClient(stripeKeys.secretKey);

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        stripeKeys.webhookSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    const supabase = await createAdminClient();

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const bookingId = paymentIntent.metadata?.booking_id;

        if (bookingId) {
          // Update booking status to confirmed
          const { error } = await supabase
            .from('bookings')
            .update({
              status: 'confirmed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', bookingId);

          if (error) {
            console.error('Error updating booking status:', error);
          } else {
            console.log(`Booking ${bookingId} confirmed via webhook`);
          }

          // Fetch full booking details for email
          const { data: bookingData } = await supabase
            .from('bookings')
            .select(`
              *,
              items:booking_items(*),
              tour:tours(slug)
            `)
            .eq('id', bookingId)
            .single();

          // Update availability if applicable
          if (bookingData?.availability_id) {
            const tourItem = bookingData.items?.find(
              (item: { item_type: string }) => item.item_type === 'tour'
            );
            if (tourItem) {
              await supabase.rpc('increment_booked_count', {
                availability_id: bookingData.availability_id,
                increment_by: tourItem.quantity,
              });
            }
          }

          // Send confirmation emails
          if (bookingData) {
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
            const voucherUrl = `${siteUrl}/${bookingData.language || 'en'}/voucher/${bookingId}?token=${bookingData.voucher_token}`;

            // Extract tour item for price breakdown
            const tourItem = bookingData.items?.find(
              (item: { item_type: string }) => item.item_type === 'tour'
            );
            const upsellItems = bookingData.items?.filter(
              (item: { item_type: string }) => item.item_type === 'upsell'
            );

            // Build price breakdown from tour item metadata
            const priceBreakdown: { label: string; quantity: number; amount: number }[] = [];
            if (tourItem?.metadata?.priceBreakdown) {
              const breakdown = tourItem.metadata.priceBreakdown as Array<{
                label: string;
                quantity: number;
                amount: number;
              }>;
              priceBreakdown.push(...breakdown);
            } else if (tourItem) {
              priceBreakdown.push({
                label: 'Tour',
                quantity: tourItem.quantity,
                amount: Number(tourItem.subtotal_retail),
              });
            }

            // Build upsells array
            const upsells = upsellItems?.map((item: {
              item_name: string;
              subtotal_retail: number;
            }) => ({
              title: item.item_name,
              amount: Number(item.subtotal_retail),
            })) || [];

            // Get tour time from metadata
            const tourTime = tourItem?.metadata?.time as string | undefined;

            try {
              await sendAllBookingEmails(
                {
                  customerName: bookingData.customer_name,
                  customerEmail: bookingData.customer_email,
                  bookingReference: bookingData.reference,
                  tourName: paymentIntent.metadata?.tour_name || tourItem?.item_name || 'Tour',
                  tourDate: bookingData.booking_date,
                  tourTime,
                  priceBreakdown,
                  upsells,
                  totalAmount: Number(bookingData.total_retail),
                  currency: bookingData.currency,
                  voucherUrl,
                  language: bookingData.language,
                },
                {
                  tourTime,
                  // These can be populated from tour settings if available
                  whatToBring: ['Comfortable clothing', 'Sunscreen', 'Camera', 'Valid ID/Passport'],
                  emergencyContact: '+66 123 456 789',
                }
              );
              console.log(`Confirmation emails sent for booking ${bookingId}`);
            } catch (emailError) {
              console.error('Error sending confirmation emails:', emailError);
              // Don't fail the webhook if email fails
            }
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const bookingId = paymentIntent.metadata?.booking_id;

        if (bookingId) {
          // Keep status as pending_payment, but log the failure
          console.log(`Payment failed for booking ${bookingId}`);
          
          // Optionally update with failure info
          await supabase
            .from('bookings')
            .update({
              notes: `Payment failed: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`,
              updated_at: new Date().toISOString(),
            })
            .eq('id', bookingId);
        }
        break;
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const bookingId = paymentIntent.metadata?.booking_id;

        if (bookingId) {
          // Update booking status to cancelled
          await supabase
            .from('bookings')
            .update({
              status: 'cancelled',
              updated_at: new Date().toISOString(),
            })
            .eq('id', bookingId);

          console.log(`Booking ${bookingId} cancelled via webhook`);
        }
        break;
      }

      default:
        // Unhandled event type
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

