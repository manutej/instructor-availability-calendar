/**
 * Email Generator Component
 *
 * Dashboard UI for generating professional availability emails.
 * Provides:
 * - Custom message input
 * - Email generation button
 * - Preview of available dates
 * - Copy HTML/text to clipboard
 * - Download .ics calendar file
 *
 * @module components/dashboard/EmailGenerator
 * @see app/api/email/generate for API endpoint
 * @see emails/availability-email for template
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Mail, Copy, Download, CheckCircle2 } from 'lucide-react';

/**
 * Component props
 */
export interface EmailGeneratorProps {
  instructorName: string;
  instructorEmail: string;
  calendarLink: string;
}

/**
 * API response interface
 */
interface EmailGenerationResponse {
  html: string;
  text: string;
  ics: string;
  availableDates: string[];
}

/**
 * Email Generator Component
 *
 * @example
 * ```tsx
 * <EmailGenerator
 *   instructorName="Dr. John Smith"
 *   instructorEmail="john@example.com"
 *   calendarLink="https://example.com/calendar/john-smith"
 * />
 * ```
 */
export default function EmailGenerator({
  instructorName,
  instructorEmail,
  calendarLink,
}: EmailGeneratorProps) {
  const [customMessage, setCustomMessage] = useState('');
  const [generatedEmail, setGeneratedEmail] =
    useState<EmailGenerationResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  /**
   * Generate email by calling API endpoint
   */
  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/email/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instructorName,
          instructorEmail,
          customMessage: customMessage.trim() || undefined,
          calendarLink,
          count: 10, // Next 10 available dates
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate email');
      }

      const data: EmailGenerationResponse = await response.json();
      setGeneratedEmail(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate email');
      console.error('Email generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Copy text to clipboard with feedback
   */
  const copyToClipboard = async (
    text: string,
    type: 'html' | 'text'
  ): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);

      // Show feedback
      if (type === 'html') {
        setCopiedHtml(true);
        setTimeout(() => setCopiedHtml(false), 2000);
      } else {
        setCopiedText(true);
        setTimeout(() => setCopiedText(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  /**
   * Download .ics file
   */
  const downloadICS = () => {
    if (!generatedEmail?.ics) return;

    const blob = new Blob([generatedEmail.ics], {
      type: 'text/calendar;charset=utf-8',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'availability.ics';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold mb-1">
            Generate Availability Email
          </h3>
          <p className="text-sm text-gray-600">
            Create a professional email with your available dates
          </p>
        </div>

        {/* Custom message input */}
        <div className="space-y-2">
          <label htmlFor="custom-message" className="text-sm font-medium">
            Custom Message (optional)
          </label>
          <Textarea
            id="custom-message"
            placeholder="Add a personal message to include in the email..."
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Generate button */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full"
        >
          <Mail className="mr-2 h-4 w-4" />
          {isGenerating ? 'Generating...' : 'Generate Email'}
        </Button>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Generated email preview */}
        {generatedEmail && (
          <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
            {/* Available dates preview */}
            <div>
              <h4 className="font-semibold mb-2 text-sm">
                Available Dates ({generatedEmail.availableDates.length}):
              </h4>
              <ul className="space-y-1 max-h-40 overflow-y-auto">
                {generatedEmail.availableDates.map((date, idx) => (
                  <li key={idx} className="text-sm text-gray-700">
                    • {date}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              {/* Copy HTML */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(generatedEmail.html, 'html')}
              >
                {copiedHtml ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy HTML
                  </>
                )}
              </Button>

              {/* Copy Text */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(generatedEmail.text, 'text')}
              >
                {copiedText ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Text
                  </>
                )}
              </Button>

              {/* Download .ics */}
              <Button variant="outline" size="sm" onClick={downloadICS}>
                <Download className="mr-2 h-4 w-4" />
                Download .ics
              </Button>
            </div>

            {/* Help text */}
            <p className="text-xs text-gray-600">
              Copy the HTML or text version to paste into your email client.
              Download the .ics file to attach to the email.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
