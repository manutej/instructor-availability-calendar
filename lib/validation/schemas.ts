/**
 * Zod Validation Schemas
 *
 * Centralized validation schemas for API requests and data structures.
 * Prevents JSON injection, type coercion attacks, and invalid data.
 *
 * @module lib/validation/schemas
 */

import { z } from 'zod';

// ============================================================================
// Query System Schemas
// ============================================================================

/**
 * Query intent validation
 */
export const QueryIntentSchema = z.enum(['find_days', 'find_slots', 'suggest_times'], {
  errorMap: () => ({ message: 'Intent must be one of: find_days, find_slots, suggest_times' })
});

/**
 * Time period validation
 */
export const TimePeriodSchema = z.enum(['morning', 'afternoon', 'evening', 'any'], {
  errorMap: () => ({ message: 'Time preference must be: morning, afternoon, evening, or any' })
});

/**
 * Slot duration validation
 */
export const SlotDurationSchema = z.enum(['1hour', 'half-day', 'full-day'], {
  errorMap: () => ({ message: 'Slot duration must be: 1hour, half-day, or full-day' })
});

/**
 * Date range validation
 *
 * Ensures start and end are valid dates with start before end.
 */
export const DateRangeSchema = z.object({
  start: z.coerce.date({
    errorMap: () => ({ message: 'Start date must be a valid date' })
  }),
  end: z.coerce.date({
    errorMap: () => ({ message: 'End date must be a valid date' })
  })
}).refine(
  (data) => data.start <= data.end,
  { message: 'Start date must be before or equal to end date' }
).refine(
  (data) => {
    const daysDiff = Math.floor((data.end.getTime() - data.start.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 90;
  },
  { message: 'Date range cannot exceed 90 days' }
);

/**
 * Availability query validation
 *
 * Validates structured queries from parse-query or direct submission.
 */
export const AvailabilityQuerySchema = z.object({
  intent: QueryIntentSchema,
  dateRange: DateRangeSchema,
  timePreference: TimePeriodSchema.optional(),
  slotDuration: SlotDurationSchema.optional(),
  count: z.number()
    .int()
    .positive()
    .max(1000, 'Count cannot exceed 1000')
    .optional()
});

// ============================================================================
// API Request Schemas
// ============================================================================

/**
 * Parse query request validation
 *
 * Validates natural language query input.
 */
export const ParseQueryRequestSchema = z.object({
  userQuery: z.string()
    .min(1, 'Query cannot be empty')
    .max(500, 'Query cannot exceed 500 characters')
    .trim()
});

/**
 * Execute query request validation
 *
 * Validates query execution requests.
 */
export const ExecuteQueryRequestSchema = AvailabilityQuerySchema;

// ============================================================================
// Data Model Schemas
// ============================================================================

/**
 * Time slot validation (HH:MM format)
 */
export const TimeSlotSchema = z.string()
  .regex(/^([0-1][0-9]|2[0-1]):[0-5][0-9]$/, 'Time slot must be in HH:MM format (00:00-21:59)');

/**
 * v1 Blocked date validation
 */
export const BlockedDateV1Schema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  status: z.enum(['full', 'am', 'pm']),
  eventName: z.string().optional()
});

/**
 * Time slot status validation (v2 format)
 *
 * Note: Map is serialized as array of [key, value] pairs in JSON.
 */
export const TimeSlotStatusSchema = z.object({
  slots: z.union([
    z.map(TimeSlotSchema, z.boolean()),  // Map format (in-memory)
    z.array(z.tuple([TimeSlotSchema, z.boolean()]))  // Array format (from JSON)
  ]),
  fullDayBlock: z.boolean().optional(),
  eventName: z.string().max(200, 'Event name cannot exceed 200 characters').optional()
});

/**
 * Availability data validation (v2 format)
 *
 * Validates calendar data structure with version support.
 */
export const AvailabilityDataV2Schema = z.object({
  version: z.literal(2),
  instructorId: z.string().min(1, 'Instructor ID required'),
  lastModified: z.string().datetime().optional(),
  blockedDates: z.record(
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/),  // Date key format
    z.union([BlockedDateV1Schema, TimeSlotStatusSchema])  // v1 or v2 status
  )
});

/**
 * Instructor profile validation
 */
export const InstructorProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  timezone: z.string().optional(),
  preferences: z.record(z.unknown()).optional()
});

/**
 * Export data validation
 */
export const ExportDataSchema = z.object({
  version: z.string(),
  exportedAt: z.string().datetime(),
  availability: AvailabilityDataV2Schema.nullable(),
  profile: InstructorProfileSchema.nullable()
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Safe parse with detailed error messages
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validation result with success flag and data/error
 *
 * @example
 * ```typescript
 * const result = safeValidate(ParseQueryRequestSchema, requestBody);
 * if (!result.success) {
 *   return NextResponse.json({ error: result.error }, { status: 400 });
 * }
 * const validData = result.data;
 * ```
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // Format error messages
  const errorMessages = result.error.errors
    .map(err => `${err.path.join('.')}: ${err.message}`)
    .join('; ');

  return {
    success: false,
    error: `Validation failed: ${errorMessages}`
  };
}

/**
 * Validate and throw on error
 *
 * Convenience function for cases where you want to throw on validation failure.
 *
 * @param schema - Zod schema
 * @param data - Data to validate
 * @returns Validated data
 * @throws Error with validation messages
 */
export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = safeValidate(schema, data);
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.data;
}
