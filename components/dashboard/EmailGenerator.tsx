/**
 * Email Generator Component - Simplified Version
 *
 * Generates clean, copyable availability text for specified date ranges.
 *
 * Output Format:
 * Here are my available dates {specified time range}:
 *
 * [Date range 1]
 * [Date range 2]
 * [Date range 3]
 *
 * @module components/dashboard/EmailGenerator
 */

'use client';

import { useState } from 'react';
import { format, addDays, startOfDay, isBefore } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Copy, CheckCircle2, Calendar } from 'lucide-react';

export interface EmailGeneratorProps {
  instructorName: string;
  instructorEmail: string;
  calendarLink: string;
}

export default function EmailGenerator({
  instructorName,
  instructorEmail,
  calendarLink,
}: EmailGeneratorProps) {
  // Date range state
  const today = format(new Date(), 'yyyy-MM-dd');
  const thirtyDaysOut = format(addDays(new Date(), 30), 'yyyy-MM-dd');

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(thirtyDaysOut);

  // Output state
  const [generatedText, setGeneratedText] = useState<string>('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Generate availability text for specified date range
   */
  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Load blocked dates from localStorage
      const availabilityData = localStorage.getItem('availability');
      const blockedDates: Record<string, any> = availabilityData
        ? JSON.parse(availabilityData).blockedDates || {}
        : {};

      // Generate all dates in range
      const start = startOfDay(new Date(startDate));
      const end = startOfDay(new Date(endDate));
      const allDates: Date[] = [];

      let currentDate = start;
      while (isBefore(currentDate, end) || currentDate.getTime() === end.getTime()) {
        allDates.push(currentDate);
        currentDate = addDays(currentDate, 1);
      }

      // Filter to available dates (not blocked)
      const available = allDates.filter(date => {
        const dateKey = format(date, 'yyyy-MM-dd');
        const blocked = blockedDates[dateKey];
        return !blocked || blocked.status !== 'full';
      });

      if (available.length === 0) {
        setError('No available dates in this range. All dates are blocked.');
        setGeneratedText('');
        setAvailableDates([]);
        return;
      }

      // Format dates
      const formattedDates = available.map(date =>
        format(date, 'EEEE, MMMM d, yyyy')
      );

      // Build date range description
      const rangeDescription = `${format(start, 'MMMM d')} - ${format(end, 'MMMM d, yyyy')}`;

      // Group consecutive dates into ranges
      const dateRanges: string[] = [];
      let rangeStart = available[0];
      let rangeEnd = available[0];

      for (let i = 1; i < available.length; i++) {
        const prevDate = available[i - 1];
        const currDate = available[i];

        // Check if consecutive (1 day apart)
        const daysDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff === 1) {
          // Extend current range
          rangeEnd = currDate;
        } else {
          // Save current range and start new one
          if (rangeStart.getTime() === rangeEnd.getTime()) {
            dateRanges.push(format(rangeStart, 'EEEE, MMMM d, yyyy'));
          } else {
            dateRanges.push(
              `${format(rangeStart, 'EEEE, MMMM d')} - ${format(rangeEnd, 'EEEE, MMMM d, yyyy')}`
            );
          }
          rangeStart = currDate;
          rangeEnd = currDate;
        }
      }

      // Add final range
      if (rangeStart.getTime() === rangeEnd.getTime()) {
        dateRanges.push(format(rangeStart, 'EEEE, MMMM d, yyyy'));
      } else {
        dateRanges.push(
          `${format(rangeStart, 'EEEE, MMMM d')} - ${format(rangeEnd, 'EEEE, MMMM d, yyyy')}`
        );
      }

      // Build output text
      const outputText = `Here are my available dates (${rangeDescription}):\n\n${dateRanges.join('\n\n')}`;

      setGeneratedText(outputText);
      setAvailableDates(formattedDates);

    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate availability text');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Copy text to clipboard
   */
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-600" />
            Generate Availability Text
          </h3>
          <p className="text-sm text-gray-600">
            Select a date range to generate clean, copyable availability text
          </p>
        </div>

        {/* Date Range Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="start-date" className="text-sm font-medium text-gray-700">
              Start Date
            </label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="end-date" className="text-sm font-medium text-gray-700">
              End Date
            </label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {isGenerating ? 'Generating...' : 'Generate Availability Text'}
        </Button>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Generated Output */}
        {generatedText && (
          <div className="space-y-4">
            {/* Preview */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm text-gray-700">
                  Generated Text ({availableDates.length} available dates)
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Text
                    </>
                  )}
                </Button>
              </div>

              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">
{generatedText}
              </pre>
            </div>

            {/* Help Text */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-xs text-blue-800">
                💡 <strong>Tip:</strong> Click "Copy Text" and paste directly into your email.
                The text groups consecutive available dates into ranges for easier reading.
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
