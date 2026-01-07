import {
  Body,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface BookingConfirmationEmailProps {
  customerName: string;
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
}

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const BookingConfirmationEmail = ({
  customerName,
  bookingReference,
  tourName,
  tourDate,
  tourTime,
  priceBreakdown,
  upsells,
  totalAmount,
  currency,
  voucherUrl,
}: BookingConfirmationEmailProps) => {
  const previewText = `Booking Confirmed - ${bookingReference}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>Astronout</Text>
          </Section>

          {/* Success Banner */}
          <Section style={successBanner}>
            <Text style={successIcon}>✓</Text>
            <Heading style={successTitle}>Booking Confirmed!</Heading>
            <Text style={successSubtitle}>
              Thank you for your booking, {customerName}
            </Text>
          </Section>

          {/* Booking Reference */}
          <Section style={referenceSection}>
            <Text style={referenceLabel}>Booking Reference</Text>
            <Text style={referenceValue}>{bookingReference}</Text>
          </Section>

          <Hr style={divider} />

          {/* Tour Details */}
          <Section style={detailsSection}>
            <Heading as="h2" style={sectionTitle}>
              Tour Details
            </Heading>
            <Text style={tourNameStyle}>{tourName}</Text>
            <Row>
              <Column>
                <Text style={detailLabel}>Date</Text>
                <Text style={detailValue}>{formatDate(tourDate)}</Text>
              </Column>
              {tourTime && (
                <Column>
                  <Text style={detailLabel}>Time</Text>
                  <Text style={detailValue}>{tourTime}</Text>
                </Column>
              )}
            </Row>
          </Section>

          <Hr style={divider} />

          {/* Price Breakdown */}
          <Section style={detailsSection}>
            <Heading as="h2" style={sectionTitle}>
              Payment Summary
            </Heading>
            
            {priceBreakdown.map((item, index) => (
              <Row key={index} style={priceRow}>
                <Column>
                  <Text style={priceLabel}>
                    {item.quantity}× {item.label}
                  </Text>
                </Column>
                <Column align="right">
                  <Text style={priceValue}>
                    {formatCurrency(item.amount, currency)}
                  </Text>
                </Column>
              </Row>
            ))}

            {upsells && upsells.length > 0 && (
              <>
                <Text style={upsellsHeader}>Add-ons</Text>
                {upsells.map((upsell, index) => (
                  <Row key={index} style={priceRow}>
                    <Column>
                      <Text style={priceLabel}>{upsell.title}</Text>
                    </Column>
                    <Column align="right">
                      <Text style={priceValue}>
                        {formatCurrency(upsell.amount, currency)}
                      </Text>
                    </Column>
                  </Row>
                ))}
              </>
            )}

            <Hr style={totalDivider} />

            <Row style={totalRow}>
              <Column>
                <Text style={totalLabel}>Total Paid</Text>
              </Column>
              <Column align="right">
                <Text style={totalValue}>
                  {formatCurrency(totalAmount, currency)}
                </Text>
              </Column>
            </Row>
          </Section>

          <Hr style={divider} />

          {/* Voucher Button */}
          <Section style={voucherSection}>
            <Text style={voucherText}>
              Your e-voucher is ready. Please present it on the day of your tour.
            </Text>
            <Link href={voucherUrl} style={voucherButton}>
              Download Voucher
            </Link>
          </Section>

          <Hr style={divider} />

          {/* What's Next */}
          <Section style={detailsSection}>
            <Heading as="h2" style={sectionTitle}>
              What's Next?
            </Heading>
            <Text style={nextStepItem}>
              📧 You will receive a pickup confirmation email with details
            </Text>
            <Text style={nextStepItem}>
              📱 Save or print your voucher to present on tour day
            </Text>
            <Text style={nextStepItem}>
              ⏰ Arrive at the pickup location 15 minutes early
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Need help? Contact us at{' '}
              <Link href="mailto:support@astronout.co" style={footerLink}>
                support@astronout.co
              </Link>
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} Astronout. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  maxWidth: '600px',
  borderRadius: '8px',
  overflow: 'hidden',
};

const header = {
  backgroundColor: '#0033FF',
  padding: '24px',
  textAlign: 'center' as const,
};

const logo = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
};

const successBanner = {
  backgroundColor: '#f0fdf4',
  padding: '32px 24px',
  textAlign: 'center' as const,
};

const successIcon = {
  backgroundColor: '#22c55e',
  color: '#ffffff',
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  display: 'inline-block',
  lineHeight: '48px',
  fontSize: '24px',
  margin: '0 auto 16px',
};

const successTitle = {
  color: '#166534',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 8px',
};

const successSubtitle = {
  color: '#166534',
  fontSize: '16px',
  margin: '0',
};

const referenceSection = {
  padding: '24px',
  textAlign: 'center' as const,
  backgroundColor: '#f8fafc',
};

const referenceLabel = {
  color: '#64748b',
  fontSize: '14px',
  margin: '0 0 4px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const referenceValue = {
  color: '#0033FF',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
  letterSpacing: '2px',
};

const divider = {
  borderColor: '#e2e8f0',
  margin: '0',
};

const detailsSection = {
  padding: '24px',
};

const sectionTitle = {
  color: '#1e293b',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px',
};

const tourNameStyle = {
  color: '#1e293b',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 16px',
};

const detailLabel = {
  color: '#64748b',
  fontSize: '12px',
  margin: '0 0 4px',
  textTransform: 'uppercase' as const,
};

const detailValue = {
  color: '#1e293b',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0',
};

const priceRow = {
  marginBottom: '8px',
};

const priceLabel = {
  color: '#475569',
  fontSize: '14px',
  margin: '0',
};

const priceValue = {
  color: '#1e293b',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0',
};

const upsellsHeader = {
  color: '#64748b',
  fontSize: '12px',
  fontWeight: '600',
  margin: '16px 0 8px',
  textTransform: 'uppercase' as const,
};

const totalDivider = {
  borderColor: '#e2e8f0',
  margin: '16px 0',
};

const totalRow = {
  marginTop: '8px',
};

const totalLabel = {
  color: '#1e293b',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
};

const totalValue = {
  color: '#0033FF',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
};

const voucherSection = {
  padding: '24px',
  textAlign: 'center' as const,
};

const voucherText = {
  color: '#475569',
  fontSize: '14px',
  margin: '0 0 16px',
};

const voucherButton = {
  backgroundColor: '#0033FF',
  borderRadius: '8px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  padding: '12px 32px',
  textDecoration: 'none',
};

const nextStepItem = {
  color: '#475569',
  fontSize: '14px',
  margin: '0 0 12px',
  paddingLeft: '8px',
};

const footer = {
  padding: '24px',
  textAlign: 'center' as const,
  backgroundColor: '#f8fafc',
};

const footerText = {
  color: '#64748b',
  fontSize: '12px',
  margin: '0 0 8px',
};

const footerLink = {
  color: '#0033FF',
  textDecoration: 'none',
};

export default BookingConfirmationEmail;

