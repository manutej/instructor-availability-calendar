/**
 * Batch Import API Endpoint
 *
 * POST /api/availability/batch-import
 *
 * Accepts JSON array of blocked dates for bulk import.
 * Supports both single JSON file import and programmatic batch operations.
 *
 * Request Body:
 * {
 *   "blockedDates": [
 *     { "date": "2025-12-25", "status": "full", "eventName": "Christmas" },
 *     { "date": "2025-12-26", "status": "am" },
 *     { "date": "2025-12-31", "status": "pm", "eventName": "NYE Afternoon" }
 *   ],
 *   "mode": "merge" | "replace"  // Optional, defaults to "merge"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "imported": { "success": 3, "failed": 0 },
 *   "message": "Successfully imported 3 blocked dates"
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { persistence } from '@/lib/data/persistence';

// Request validation schema
const BlockedDateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  status: z.enum(['full', 'am', 'pm']),
  eventName: z.string().max(200).optional(),
});

const BatchImportRequestSchema = z.object({
  blockedDates: z.array(BlockedDateSchema).min(1, 'At least one blocked date required').max(1000, 'Maximum 1000 dates per request'),
  mode: z.enum(['merge', 'replace']).optional().default('merge'),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate request
    const parseResult = BatchImportRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: parseResult.error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const { blockedDates, mode } = parseResult.data;

    // If replace mode, clear existing data first
    if (mode === 'replace') {
      await persistence.clearAll();
    }

    // Perform batch import
    const result = await persistence.batchImport(blockedDates);

    return NextResponse.json({
      success: true,
      imported: result,
      message: `Successfully imported ${result.success} blocked dates${result.failed > 0 ? `, ${result.failed} failed` : ''}`,
      mode,
    });
  } catch (error) {
    console.error('Batch import error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/availability/batch-import
 *
 * Returns batch import schema and usage instructions.
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/availability/batch-import',
    method: 'POST',
    description: 'Batch import blocked dates',
    schema: {
      blockedDates: {
        type: 'array',
        items: {
          date: 'string (YYYY-MM-DD)',
          status: "'full' | 'am' | 'pm'",
          eventName: 'string (optional, max 200 chars)',
        },
        minItems: 1,
        maxItems: 1000,
      },
      mode: {
        type: "'merge' | 'replace'",
        default: 'merge',
        description: 'merge: add to existing, replace: clear and import fresh',
      },
    },
    example: {
      blockedDates: [
        { date: '2025-12-25', status: 'full', eventName: 'Christmas' },
        { date: '2025-12-26', status: 'am', eventName: 'Boxing Day Morning' },
        { date: '2025-12-31', status: 'pm' },
      ],
      mode: 'merge',
    },
  });
}
