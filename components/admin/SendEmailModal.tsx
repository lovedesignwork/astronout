'use client';

import { useState, useEffect } from 'react';
import type { Booking, Tour } from '@/types';

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  tours: Tour[];
}

type EmailType = 'confirmation' | 'reminder' | 'custom';

const EMAIL_TEMPLATES: Record<EmailType, { subject: string; body: string }> = {
  confirmation: {
    subject: 'Booking Confirmation - {{reference}}',
    body: `Dear {{customerName}},

Thank you for your booking! Your reservation has been confirmed.

Booking Reference: {{reference}}
Tour: {{tourName}}
Date: {{tourDate}}
Total: {{total}}

If you have any questions, please don't hesitate to contact us.

Best regards,
The Team`,
  },
  reminder: {
    subject: 'Reminder: Your Tour is Coming Up - {{reference}}',
    body: `Dear {{customerName}},

This is a friendly reminder about your upcoming tour.

Booking Reference: {{reference}}
Tour: {{tourName}}
Date: {{tourDate}}

Please arrive at least 15 minutes before the scheduled time.

We look forward to seeing you!

Best regards,
The Team`,
  },
  custom: {
    subject: '',
    body: '',
  },
};

export function SendEmailModal({ isOpen, onClose, booking, tours }: SendEmailModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [emailType, setEmailType] = useState<EmailType>('confirmation');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  // Helper function to get tour name
  const getTourName = (): string => {
    if (!booking) return '';
    const tour = tours.find(t => t.id === booking.tour_id);
    if (!tour) return '-';
    
    const heroBlock = (tour as any).blocks?.find((b: any) => b.block_type === 'hero');
    const translation = heroBlock?.translations?.find((t: any) => t.language === 'en');
    return translation?.title || tour.slug;
  };

  // Replace placeholders in template
  const replacePlaceholders = (text: string): string => {
    if (!booking) return text;
    
    const tourName = getTourName();
    const tourDate = new Date(booking.booking_date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const total = `${booking.currency} ${Number(booking.total_retail).toLocaleString()}`;

    return text
      .replace(/\{\{reference\}\}/g, booking.reference)
      .replace(/\{\{customerName\}\}/g, booking.customer_name)
      .replace(/\{\{tourName\}\}/g, tourName)
      .replace(/\{\{tourDate\}\}/g, tourDate)
      .replace(/\{\{total\}\}/g, total);
  };

  // Initialize form when booking changes or modal opens
  useEffect(() => {
    if (booking && isOpen) {
      setRecipientEmail(booking.customer_email);
      setEmailType('confirmation');
      setSuccess(false);
      setError(null);
    }
  }, [booking, isOpen]);

  // Update subject and body when email type changes
  useEffect(() => {
    if (emailType === 'custom') {
      setSubject('');
      setBody('');
    } else {
      const template = EMAIL_TEMPLATES[emailType];
      setSubject(replacePlaceholders(template.subject));
      setBody(replacePlaceholders(template.body));
    }
  }, [emailType, booking]);

  const handleSend = async () => {
    if (!booking || !recipientEmail || !subject || !body) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/bookings/${booking.id}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipientEmail,
          subject,
          body,
          emailType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 flex max-w-full">
        <div className="w-screen max-w-lg">
          <div className="flex h-full flex-col bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Send Email</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Send email to customer for booking <span className="font-mono font-semibold text-purple-600">{booking.reference}</span>
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-6 p-6">
                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-600">
                    Email sent successfully! (Mock)
                  </div>
                )}

                {/* Email Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Type
                  </label>
                  <select
                    value={emailType}
                    onChange={(e) => setEmailType(e.target.value as EmailType)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                    disabled={loading || success}
                  >
                    <option value="confirmation">Booking Confirmation</option>
                    <option value="reminder">Tour Reminder</option>
                    <option value="custom">Custom Email</option>
                  </select>
                </div>

                {/* Recipient Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Email *
                  </label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                    placeholder="customer@email.com"
                    required
                    disabled={loading || success}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    You can change this to send to a different email address
                  </p>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                    placeholder="Email subject"
                    required
                    disabled={loading || success}
                  />
                </div>

                {/* Body */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={12}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 font-mono text-sm"
                    placeholder="Email body"
                    required
                    disabled={loading || success}
                  />
                </div>

                {/* Mock Notice */}
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                  <div className="flex gap-3">
                    <svg className="size-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-amber-800">Mock Mode</p>
                      <p className="text-xs text-amber-700 mt-1">
                        This is a mock implementation. Emails will be logged to the console but not actually sent. 
                        Connect Resend API to enable real email sending.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={loading || success || !recipientEmail || !subject || !body}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Sending...
                    </>
                  ) : success ? (
                    <>
                      <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      Sent!
                    </>
                  ) : (
                    <>
                      <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                      Send Email
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



