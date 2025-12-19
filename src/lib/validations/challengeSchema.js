/**
 * Challenge Validation Schemas
 * Implements: fc-1 (zod validation), fc-2 (required fields), fc-3 (error messages),
 * fc-4 (field-level validation)
 */

import { z } from 'zod';

// Common validation patterns
const uuidSchema = z.string().uuid('Invalid ID format');
const optionalUuid = z.string().uuid('Invalid ID format').optional().nullable();
const nonEmptyString = (field, minLength = 1) => 
  z.string()
    .trim()
    .min(minLength, `${field} is required`)
    .max(5000, `${field} is too long`);

// Status and priority enums
export const CHALLENGE_STATUSES = [
  'draft', 'submitted', 'processing', 'under_review', 
  'approved', 'rejected', 'published', 'resolved', 'archived'
] as const;

export const CHALLENGE_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;

export const CHALLENGE_TYPES = [
  'operational', 'strategic', 'technical', 'policy', 
  'service_delivery', 'citizen_experience', 'infrastructure'
] as const;

// Base schema for all challenge operations
export const challengeBaseSchema = z.object({
  // Required fields (fc-2)
  title_en: nonEmptyString('English title', 10)
    .max(200, 'Title must be less than 200 characters'),
  
  title_ar: nonEmptyString('Arabic title', 10)
    .max(200, 'العنوان يجب أن يكون أقل من 200 حرف'),
  
  // Optional fields with validation
  description_en: z.string()
    .max(5000, 'Description is too long')
    .optional()
    .nullable(),
  
  description_ar: z.string()
    .max(5000, 'الوصف طويل جداً')
    .optional()
    .nullable(),
  
  municipality_id: optionalUuid,
  sector_id: optionalUuid,
  
  status: z.enum(CHALLENGE_STATUSES).default('draft'),
  priority: z.enum(CHALLENGE_PRIORITIES).optional().nullable(),
  
  category: z.string().max(100).optional().nullable(),
  challenge_type: z.enum(CHALLENGE_TYPES).optional().nullable(),
  
  // Dates
  submission_date: z.string().datetime().optional().nullable(),
  sla_due_date: z.string().datetime().optional().nullable(),
  
  // Flags
  is_published: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  is_confidential: z.boolean().default(false),
});

// Schema for creating a new challenge (draft)
export const challengeCreateSchema = challengeBaseSchema.extend({
  // Only title is strictly required for draft creation
  title_en: nonEmptyString('English title', 5)
    .max(200, 'Title must be less than 200 characters'),
  
  title_ar: z.string().optional().nullable(), // Arabic optional for drafts
});

// Schema for submitting a challenge for review
export const challengeSubmitSchema = challengeBaseSchema.extend({
  // All these fields become required for submission
  title_en: nonEmptyString('English title', 10)
    .max(200, 'Title must be less than 200 characters'),
  
  title_ar: nonEmptyString('Arabic title', 10)
    .max(200, 'Arabic title is required'),
  
  description_en: nonEmptyString('Description', 50)
    .max(5000, 'Description must be less than 5000 characters'),
  
  problem_statement_en: nonEmptyString('Problem statement', 100)
    .max(2000, 'Problem statement is too long'),
  
  current_situation_en: nonEmptyString('Current situation', 50)
    .max(2000, 'Current situation description is too long'),
  
  desired_outcome_en: nonEmptyString('Desired outcome', 50)
    .max(2000, 'Desired outcome is too long'),
  
  municipality_id: uuidSchema,
  sector_id: uuidSchema,
  
  priority: z.enum(CHALLENGE_PRIORITIES),
});

// Schema for reviewing a challenge
export const challengeReviewSchema = z.object({
  challenge_id: uuidSchema,
  decision: z.enum(['approve', 'reject', 'request_changes']),
  
  feedback: z.string()
    .min(10, 'Please provide detailed feedback')
    .max(2000, 'Feedback is too long')
    .optional(),
  
  rejection_reason: z.string()
    .min(20, 'Please provide a detailed reason for rejection')
    .max(1000, 'Rejection reason is too long')
    .optional(),
  
  suggested_changes: z.array(z.string()).optional(),
  
  review_score: z.number()
    .min(0, 'Score must be at least 0')
    .max(100, 'Score must be at most 100')
    .optional(),
}).refine(
  (data) => {
    if (data.decision === 'reject' && !data.rejection_reason) {
      return false;
    }
    return true;
  },
  {
    message: 'Rejection reason is required when rejecting a challenge',
    path: ['rejection_reason']
  }
);

// Schema for updating challenge status
export const challengeStatusUpdateSchema = z.object({
  challenge_id: uuidSchema,
  new_status: z.enum(CHALLENGE_STATUSES),
  notes: z.string().max(500).optional(),
});

// Schema for ownership transfer
export const challengeTransferSchema = z.object({
  challenge_id: uuidSchema,
  new_owner_email: z.string().email('Invalid email address'),
  transfer_reason: z.string()
    .min(10, 'Please provide a reason for the transfer')
    .max(500, 'Reason is too long'),
});

// Schema for bulk operations
export const challengeBulkOperationSchema = z.object({
  challenge_ids: z.array(uuidSchema)
    .min(1, 'Select at least one challenge')
    .max(100, 'Cannot process more than 100 challenges at once'),
  
  operation: z.enum([
    'publish', 'unpublish', 'archive', 'delete', 
    'assign_reviewer', 'change_status', 'change_priority'
  ]),
  
  // Optional parameters based on operation
  new_status: z.enum(CHALLENGE_STATUSES).optional(),
  new_priority: z.enum(CHALLENGE_PRIORITIES).optional(),
  reviewer_email: z.string().email().optional(),
});

// Schema for challenge filters (API queries)
export const challengeFilterSchema = z.object({
  status: z.enum(CHALLENGE_STATUSES).optional(),
  priority: z.enum(CHALLENGE_PRIORITIES).optional(),
  municipality_id: optionalUuid,
  sector_id: optionalUuid,
  is_published: z.boolean().optional(),
  search: z.string().max(200).optional(),
  
  // Pagination
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  
  // Sorting
  sort_by: z.enum([
    'created_at', 'updated_at', 'title_en', 'status', 
    'priority', 'citizen_votes_count'
  ]).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

// Type exports for TypeScript
export type ChallengeBase = z.infer<typeof challengeBaseSchema>;
export type ChallengeCreate = z.infer<typeof challengeCreateSchema>;
export type ChallengeSubmit = z.infer<typeof challengeSubmitSchema>;
export type ChallengeReview = z.infer<typeof challengeReviewSchema>;
export type ChallengeStatusUpdate = z.infer<typeof challengeStatusUpdateSchema>;
export type ChallengeTransfer = z.infer<typeof challengeTransferSchema>;
export type ChallengeBulkOperation = z.infer<typeof challengeBulkOperationSchema>;
export type ChallengeFilter = z.infer<typeof challengeFilterSchema>;

// Validation helper functions
export const validateChallengeCreate = (data) => {
  return challengeCreateSchema.safeParse(data);
};

export const validateChallengeSubmit = (data) => {
  return challengeSubmitSchema.safeParse(data);
};

export const validateChallengeReview = (data) => {
  return challengeReviewSchema.safeParse(data);
};

// Extract error messages for form display
export const getValidationErrors = (result) => {
  if (result.success) return {};
  
  const errors = {};
  result.error.issues.forEach(issue => {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  });
  
  return errors;
};

export default {
  challengeBaseSchema,
  challengeCreateSchema,
  challengeSubmitSchema,
  challengeReviewSchema,
  challengeStatusUpdateSchema,
  challengeTransferSchema,
  challengeBulkOperationSchema,
  challengeFilterSchema,
  validateChallengeCreate,
  validateChallengeSubmit,
  validateChallengeReview,
  getValidationErrors,
  CHALLENGE_STATUSES,
  CHALLENGE_PRIORITIES,
  CHALLENGE_TYPES,
};
