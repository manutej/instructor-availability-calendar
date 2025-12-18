/**
 * Availability Email Template
 *
 * Professional HTML email template for sending available dates to students/clients.
 * Uses react-email components for cross-client compatibility (Gmail, Outlook, Apple Mail).
 *
 * @module emails/availability-email
 * @see types/email.ts for EmailTemplateData interface
 * @see lib/utils/date-verification.ts for VerifiedDate generation
 */

import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
} from '@react-email/components';
import { VerifiedDate } from '@/types/email';

interface AvailabilityEmailProps {
  instructorName: string;
  availableDates: VerifiedDate[];
  calendarLink: string;
  customMessage?: string;
}

/**
 * Main email template component
 *
 * Renders professional email with:
 * - Instructor name header
 * - Optional custom message
 * - List of verified available dates
 * - Calendar link
 * - Footer with .ics attachment notice
 *
 * @example
 * ```tsx
 * import { render } from '@react-email/render';
 * import AvailabilityEmail from '@/emails/availability-email';
 *
 * const html = render(
 *   <AvailabilityEmail
 *     instructorName="Dr. John Smith"
 *     availableDates={verifiedDates}
 *     calendarLink="https://example.com/calendar/john-smith"
 *     customMessage="Looking forward to meeting with you!"
 *   />
 * );
 * ```
 */
export default function AvailabilityEmail({
  instructorName,
  availableDates,
  calendarLink,
  customMessage,
}: AvailabilityEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section>
            {/* Header */}
            <Text style={heading}>Available Dates - {instructorName}</Text>

            {/* Custom message (if provided) */}
            {customMessage && (
              <Text style={paragraph}>{customMessage}</Text>
            )}

            {/* Introduction */}
            <Text style={paragraph}>
              Here are my available dates for the next few weeks:
            </Text>

            {/* Available dates list */}
            <ul style={list}>
              {availableDates.map((verifiedDate, idx) => (
                <li key={idx} style={listItem}>
                  <strong>{verifiedDate.formatted}</strong>
                </li>
              ))}
            </ul>

            <Hr style={hr} />

            {/* Calendar link */}
            <Text style={paragraph}>
              View my complete availability calendar:
            </Text>

            <Link href={calendarLink} style={link}>
              {calendarLink}
            </Link>

            {/* Footer notice about .ics attachment */}
            <Text style={footer}>
              A calendar file is attached to import these dates into your
              calendar app (Google Calendar, Apple Calendar, Outlook).
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ============================================================================
// STYLES
// ============================================================================

/**
 * Cross-client compatible styles
 *
 * Inline styles ensure compatibility across email clients.
 * Tested in Gmail, Outlook (web/desktop), Apple Mail.
 */

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '40px 0 20px',
  color: '#1a1a1a',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
  color: '#333333',
};

const list = {
  fontSize: '16px',
  lineHeight: '26px',
  marginLeft: '20px',
  color: '#333333',
};

const listItem = {
  marginBottom: '8px',
};

const link = {
  color: '#0066cc',
  textDecoration: 'underline',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  fontSize: '14px',
  color: '#8898aa',
  lineHeight: '20px',
  marginTop: '32px',
};
