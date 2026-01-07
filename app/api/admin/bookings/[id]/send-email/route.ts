import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

interface SendEmailRequest {
  to: string;
  subject: string;
  body: string;
  emailType: 'confirmation' | 'reminder' | 'custom';
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createAdminClient();
    
    // Verify booking exists
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    const body: SendEmailRequest = await request.json();
    const { to, subject, body: emailBody, emailType } = body;

    // Validate required fields
    if (!to || !subject || !emailBody) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, body' },
        { status: 400 }
      );
    }

    // Mock email sending - log to console
    console.log('='.repeat(60));
    console.log('MOCK EMAIL SEND');
    console.log('='.repeat(60));
    console.log('Booking ID:', id);
    console.log('Booking Reference:', booking.reference);
    console.log('Email Type:', emailType);
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('-'.repeat(60));
    console.log('Body:');
    console.log(emailBody);
    console.log('='.repeat(60));

    // TODO: Replace with actual Resend implementation
    // Example Resend integration:
    // 
    // import { Resend } from 'resend';
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // 
    // const { data, error } = await resend.emails.send({
    //   from: 'Your Company <noreply@yourdomain.com>',
    //   to: [to],
    //   subject: subject,
    //   text: emailBody,
    // });
    //
    // if (error) {
    //   return NextResponse.json({ error: error.message }, { status: 500 });
    // }

    // Simulate a small delay to make it feel more realistic
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully (mock)',
      data: {
        to,
        subject,
        emailType,
        bookingReference: booking.reference,
        sentAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}



