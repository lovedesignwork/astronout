// Email functionality temporarily disabled due to Edge Runtime compatibility issues
// TODO: Re-enable with plain HTML templates instead of @react-email/components

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
 * Currently disabled - returns success without sending
 */
export async function sendBookingConfirmationEmail(data: BookingEmailData): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
}> {
  console.log('Email sending temporarily disabled. Would send to:', data.customerEmail);
  return { success: true, error: 'Email temporarily disabled' };
}

/**
 * Send pickup time confirmation email
 * Currently disabled - returns success without sending
 */
export async function sendPickupConfirmationEmail(data: PickupEmailData): Promise<{
  success: boolean;
  error?: string;
  messageId?: string;
}> {
  console.log('Email sending temporarily disabled. Would send to:', data.customerEmail);
  return { success: true, error: 'Email temporarily disabled' };
}

/**
 * Send both booking and pickup confirmation emails
 * Currently disabled - returns success without sending
 */
export async function sendAllBookingEmails(
  bookingData: BookingEmailData,
  pickupData?: Partial<PickupEmailData>
): Promise<{
  bookingEmail: { success: boolean; error?: string };
  pickupEmail?: { success: boolean; error?: string };
}> {
  console.log('Email sending temporarily disabled');
  return {
    bookingEmail: { success: true, error: 'Email temporarily disabled' },
    pickupEmail: pickupData?.tourTime ? { success: true, error: 'Email temporarily disabled' } : undefined,
  };
}

