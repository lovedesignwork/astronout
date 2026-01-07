import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface PickupConfirmationEmailProps {
  customerName: string;
  bookingReference: string;
  tourName: string;
  tourDate: string;
  tourTime: string;
  pickupLocation?: string;
  pickupInstructions?: string;
  whatToBring?: string[];
  emergencyContact?: string;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const PickupConfirmationEmail = ({
  customerName,
  bookingReference,
  tourName,
  tourDate,
  tourTime,
  pickupLocation,
  pickupInstructions,
  whatToBring,
  emergencyContact,
}: PickupConfirmationEmailProps) => {
  const previewText = `Pickup Details for ${tourName} - ${formatDate(tourDate)}`;

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

          {/* Title */}
          <Section style={titleSection}>
            <Heading style={title}>Pickup Details</Heading>
            <Text style={subtitle}>
              Hi {customerName}, here are your pickup details for your upcoming tour.
            </Text>
          </Section>

          {/* Booking Reference */}
          <Section style={referenceSection}>
            <Text style={referenceLabel}>Booking Reference</Text>
            <Text style={referenceValue}>{bookingReference}</Text>
          </Section>

          <Hr style={divider} />

          {/* Tour Info */}
          <Section style={detailsSection}>
            <Heading as="h2" style={sectionTitle}>
              Tour Information
            </Heading>
            <Text style={tourNameStyle}>{tourName}</Text>
            
            <Section style={infoCard}>
              <Section style={infoRow}>
                <Text style={infoIcon}>📅</Text>
                <Section style={infoContent}>
                  <Text style={infoLabel}>Date</Text>
                  <Text style={infoValue}>{formatDate(tourDate)}</Text>
                </Section>
              </Section>
              
              <Section style={infoRow}>
                <Text style={infoIcon}>⏰</Text>
                <Section style={infoContent}>
                  <Text style={infoLabel}>Pickup Time</Text>
                  <Text style={infoValueHighlight}>{tourTime}</Text>
                </Section>
              </Section>
            </Section>
          </Section>

          <Hr style={divider} />

          {/* Pickup Location */}
          {pickupLocation && (
            <>
              <Section style={detailsSection}>
                <Heading as="h2" style={sectionTitle}>
                  📍 Pickup Location
                </Heading>
                <Section style={locationCard}>
                  <Text style={locationText}>{pickupLocation}</Text>
                </Section>
                {pickupInstructions && (
                  <Text style={instructionsText}>{pickupInstructions}</Text>
                )}
              </Section>
              <Hr style={divider} />
            </>
          )}

          {/* What to Bring */}
          {whatToBring && whatToBring.length > 0 && (
            <>
              <Section style={detailsSection}>
                <Heading as="h2" style={sectionTitle}>
                  🎒 What to Bring
                </Heading>
                {whatToBring.map((item, index) => (
                  <Text key={index} style={bringItem}>
                    ✓ {item}
                  </Text>
                ))}
              </Section>
              <Hr style={divider} />
            </>
          )}

          {/* Important Reminders */}
          <Section style={detailsSection}>
            <Heading as="h2" style={sectionTitle}>
              ⚠️ Important Reminders
            </Heading>
            <Section style={reminderCard}>
              <Text style={reminderItem}>
                • Please arrive at the pickup location <strong>15 minutes early</strong>
              </Text>
              <Text style={reminderItem}>
                • Bring your booking voucher (printed or on your phone)
              </Text>
              <Text style={reminderItem}>
                • Bring a valid ID or passport
              </Text>
              <Text style={reminderItem}>
                • Wear comfortable clothing and footwear
              </Text>
            </Section>
          </Section>

          {/* Emergency Contact */}
          {emergencyContact && (
            <>
              <Hr style={divider} />
              <Section style={detailsSection}>
                <Heading as="h2" style={sectionTitle}>
                  📞 Emergency Contact
                </Heading>
                <Section style={emergencyCard}>
                  <Text style={emergencyText}>
                    If you have any issues on the day of your tour, please contact:
                  </Text>
                  <Text style={emergencyNumber}>{emergencyContact}</Text>
                </Section>
              </Section>
            </>
          )}

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Need to make changes? Contact us at{' '}
              <Link href="mailto:support@astronout.co" style={footerLink}>
                support@astronout.co
              </Link>
            </Text>
            <Text style={footerText}>
              We look forward to seeing you soon!
            </Text>
            <Text style={footerCopyright}>
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

const titleSection = {
  padding: '32px 24px 24px',
  textAlign: 'center' as const,
};

const title = {
  color: '#1e293b',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 8px',
};

const subtitle = {
  color: '#64748b',
  fontSize: '16px',
  margin: '0',
};

const referenceSection = {
  padding: '16px 24px',
  textAlign: 'center' as const,
  backgroundColor: '#f8fafc',
};

const referenceLabel = {
  color: '#64748b',
  fontSize: '12px',
  margin: '0 0 4px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const referenceValue = {
  color: '#0033FF',
  fontSize: '20px',
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

const infoCard = {
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  padding: '16px',
};

const infoRow = {
  marginBottom: '12px',
};

const infoIcon = {
  fontSize: '20px',
  display: 'inline-block',
  width: '32px',
  verticalAlign: 'top',
  margin: '0',
};

const infoContent = {
  display: 'inline-block',
  verticalAlign: 'top',
};

const infoLabel = {
  color: '#64748b',
  fontSize: '12px',
  margin: '0 0 2px',
  textTransform: 'uppercase' as const,
};

const infoValue = {
  color: '#1e293b',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0',
};

const infoValueHighlight = {
  color: '#0033FF',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0',
};

const locationCard = {
  backgroundColor: '#eff6ff',
  borderRadius: '8px',
  padding: '16px',
  borderLeft: '4px solid #0033FF',
};

const locationText = {
  color: '#1e40af',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0',
};

const instructionsText = {
  color: '#64748b',
  fontSize: '14px',
  margin: '12px 0 0',
  fontStyle: 'italic' as const,
};

const bringItem = {
  color: '#166534',
  fontSize: '14px',
  margin: '0 0 8px',
  paddingLeft: '8px',
};

const reminderCard = {
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  padding: '16px',
};

const reminderItem = {
  color: '#92400e',
  fontSize: '14px',
  margin: '0 0 8px',
};

const emergencyCard = {
  backgroundColor: '#fee2e2',
  borderRadius: '8px',
  padding: '16px',
  textAlign: 'center' as const,
};

const emergencyText = {
  color: '#991b1b',
  fontSize: '14px',
  margin: '0 0 8px',
};

const emergencyNumber = {
  color: '#991b1b',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0',
};

const footer = {
  padding: '24px',
  textAlign: 'center' as const,
  backgroundColor: '#f8fafc',
};

const footerText = {
  color: '#64748b',
  fontSize: '14px',
  margin: '0 0 8px',
};

const footerLink = {
  color: '#0033FF',
  textDecoration: 'none',
};

const footerCopyright = {
  color: '#94a3b8',
  fontSize: '12px',
  margin: '16px 0 0',
};

export default PickupConfirmationEmail;

