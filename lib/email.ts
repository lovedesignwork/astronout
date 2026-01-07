import { Resend } from 'resend';
import { BookingConfirmationEmail } from './email-templates/booking-confirmation';
import { PickupConfirmationEmail } from './email-templates/pickup-confirmation';

// Lazy initialize Resend client to avoid build-time errors
let resend: Resend | null = null;

function getResendClient(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    resend = new Resend(apiKey);
  }
  return resend;
}

// Default sender email - update this after verifying your domain
const DEFAULT_FROM_EMAIL = 'Astronout <noreply@resend.dev>';

export interface BookingEmailData {
  customerName: string;
  customerEmail: string;
  bookingReference: string;
  tourName: string;
  tourDate: string;
  tourTime?: string;
  priceBreakdown: {
    label: string;
    quantity: number;
    amount: number;
  }[];
  upsells?: {
    title: string;
    amount: number;
  }[];
  totalAmount: number;
  currency: string;
  voucherUrl: string;
  language?: string;
}

export interface PickupEmailData {
  customerName: string;
  customerEmail: string;
  bookingReference: string;
  tourName: string;
  tourDate: string;
  tourTime: string;
  pickupLocation?: string;
  pickupInstructions?: string;
  whatToBring?: string[];
  emergencyContact?: string;
  language?: string;
}

/**
 * Send booking confirmation email with receipt
 */
export async function sendBookingConfirmationEmail(data: BookingEmailData): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
}> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured, skipping email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const client = getResendClient();
    const { data: result, error } = await client.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: data.customerEmail,
      subject: `Booking Confirmed - ${data.bookingReference}`,
      react: BookingConfirmationEmail(data),
    });

    if (error) {
      console.error('Error sending booking confirmation email:', error);
      return { success: false, error: error.message };
    }

    console.log(`Booking confirmation email sent to ${data.customerEmail}, ID: ${result?.id}`);
    return { success: true, messageId: result?.id };
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send pickup time confirmation email
 */
export async function sendPickupConfirmationEmail(data: PickupEmailData): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
}> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured, skipping email');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const client = getResendClient();
    const { data: result, error } = await client.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: data.customerEmail,
      subject: `Pickup Details - ${data.tourName} on ${data.tourDate}`,
      react: PickupConfirmationEmail(data),
    });

    if (error) {
      console.error('Error sending pickup confirmation email:', error);
      return { success: false, error: error.message };
    }

    console.log(`Pickup confirmation email sent to ${data.customerEmail}, ID: ${result?.id}`);
    return { success: true, messageId: result?.id };
  } catch (error) {
    console.error('Error sending pickup confirmation email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send both booking and pickup confirmation emails
 */
export async function sendAllBookingEmails(
  bookingData: BookingEmailData,
  pickupData?: Partial<PickupEmailData>
): Promise<{
  bookingEmail: { success: boolean; error?: string };
  pickupEmail?: { success: boolean; error?: string };
}> {
  // Send booking confirmation
  const bookingResult = await sendBookingConfirmationEmail(bookingData);

  // Send pickup confirmation if pickup data is provided
  let pickupResult;
  if (pickupData?.tourTime) {
    pickupResult = await sendPickupConfirmationEmail({
      customerName: bookingData.customerName,
      customerEmail: bookingData.customerEmail,
      bookingReference: bookingData.bookingReference,
      tourName: bookingData.tourName,
      tourDate: bookingData.tourDate,
      tourTime: pickupData.tourTime || bookingData.tourTime || '',
      pickupLocation: pickupData.pickupLocation,
      pickupInstructions: pickupData.pickupInstructions,
      whatToBring: pickupData.whatToBring,
      emergencyContact: pickupData.emergencyContact,
      language: bookingData.language,
    });
  }

  return {
    bookingEmail: bookingResult,
    pickupEmail: pickupResult,
  };
}

