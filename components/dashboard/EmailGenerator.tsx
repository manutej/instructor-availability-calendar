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
import { format, addDays, startOfDay, isBefore, getDay, startOfWeek, endOfWeek, parseISO } from 'date-fns';
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
   *
   * FIXES:
   * 1. Date parsing with parseISO to avoid timezone off-by-one errors
   * 2. Filter to weekdays only (Monday-Friday)
   * 3. Group by week with spelled-out weekday names
   */
  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // CRITICAL FIX: Use correct storage key!
      // Calendar saves to 'cal_availability_v1', not 'availability'
      const STORAGE_KEY = 'cal_availability_v1';
      const availabilityData = localStorage.getItem(STORAGE_KEY);

      console.log('📦 Raw localStorage data:', availabilityData);

      // Parse the schema (version + blockedDates array + lastSync)
      const blockedDatesMap = new Map<string, any>();

      if (availabilityData) {
        const parsed = JSON.parse(availabilityData);
        console.log('📋 Parsed schema:', parsed);

        // Convert blockedDates array to Map for O(1) lookups
        if (parsed.blockedDates && Array.isArray(parsed.blockedDates)) {
          parsed.blockedDates.forEach((bd: any) => {
            blockedDatesMap.set(bd.date, bd);
          });
        }
      }

      console.log('🚫 Blocked dates Map (' + blockedDatesMap.size + ' total):', Object.fromEntries(blockedDatesMap));

      // FIX #1: Use parseISO to avoid timezone issues
      // parseISO('2025-12-19') creates a date in LOCAL timezone, not UTC
      const start = parseISO(startDate + 'T00:00:00');
      const end = parseISO(endDate + 'T00:00:00');

      console.log('📅 Date range:', {
        start: start.toISOString(),
        end: end.toISOString(),
        startFormatted: format(start, 'yyyy-MM-dd'),
        endFormatted: format(end, 'yyyy-MM-dd')
      });

      // Generate all dates in range
      const allDates: Date[] = [];
      let currentDate = start;
      while (isBefore(currentDate, end) || currentDate.getTime() === end.getTime()) {
        allDates.push(new Date(currentDate));
        currentDate = addDays(currentDate, 1);
      }

      console.log('📊 All dates in range:', allDates.length, allDates.map(d => format(d, 'yyyy-MM-dd')));

      // FIX #2: Filter to weekdays only (Monday-Friday) AND available (not blocked)
      const available = allDates.filter(date => {
        const dayOfWeek = getDay(date); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5; // Monday-Friday only

        if (!isWeekday) {
          return false; // Skip weekends
        }

        const dateKey = format(date, 'yyyy-MM-dd');
        const blocked = blockedDatesMap.get(dateKey); // Use Map.get() instead of object access
        const isAvailable = !blocked || blocked.status !== 'full';

        console.log(`  ${dateKey} (${format(date, 'EEEE')}): weekday=${isWeekday}, blocked=${!!blocked}, status=${blocked?.status}, available=${isAvailable}`);
        return isAvailable;
      });

      console.log('✅ Available weekdays:', available.length, available.map(d => format(d, 'yyyy-MM-dd')));

      if (available.length === 0) {
        setError('No available weekdays in this range. All weekdays are blocked.');
        setGeneratedText('');
        setAvailableDates([]);
        return;
      }

      // Format all dates for display
      const formattedDates = available.map(date =>
        format(date, 'EEEE, MMMM d, yyyy')
      );

      // FIX #3: Group by week with spelled-out weekday names
      // Format: "Week of Jan 5-11: Monday, Wednesday, Friday"

      interface WeekGroup {
        weekStart: Date;
        weekEnd: Date;
        dates: Date[];
      }

      const weekGroups: WeekGroup[] = [];

      available.forEach(date => {
        const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday = start of week
        const weekEnd = endOfWeek(date, { weekStartsOn: 1 }); // Sunday = end of week

        // Find existing week group or create new one
        let group = weekGroups.find(g =>
          g.weekStart.getTime() === weekStart.getTime()
        );

        if (!group) {
          group = { weekStart, weekEnd, dates: [] };
          weekGroups.push(group);
        }

        group.dates.push(date);
      });

      // Sort week groups by date
      weekGroups.sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime());

      // Build output with week-based grouping
      const weekLines = weekGroups.map(group => {
        // Week range header
        const weekStartStr = format(group.weekStart, 'MMM d');
        const weekEndStr = format(group.weekEnd, 'MMM d');
        const weekHeader = `Week of ${weekStartStr}-${weekEndStr}`;

        // Spelled-out weekday names
        const weekdayNames = group.dates.map(date => format(date, 'EEEE')).join(', ');

        return `${weekHeader}: ${weekdayNames}`;
      });

      // Build date range description
      const rangeDescription = `${format(start, 'MMMM d')} - ${format(end, 'MMMM d, yyyy')}`;

      // Build final output text
      const outputText = `Here are my available dates (${rangeDescription}):\n\n${weekLines.join('\n\n')}`;

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
                The text shows available <strong>weekdays only</strong> (Mon-Fri), grouped by week with spelled-out day names.
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
