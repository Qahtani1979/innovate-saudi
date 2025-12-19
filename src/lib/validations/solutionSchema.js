import { z } from 'zod';

/**
 * Zod validation schema for Solution creation/update
 * Implements fc-1: Input validation using Zod schema
 */
export const solutionCreateSchema = z.object({
  // Required fields
  name_en: z.string()
    .min(3, 'Solution name must be at least 3 characters')
    .max(200, 'Solution name must be less than 200 characters'),
  provider_name: z.string()
    .min(2, 'Provider name must be at least 2 characters')
    .max(200, 'Provider name must be less than 200 characters'),
  provider_type: z.enum(['startup', 'sme', 'corporate', 'university', 'research_center'], {
    errorMap: () => ({ message: 'Please select a valid provider type' })
  }),
  
  // Optional fields with validation
  name_ar: z.string().max(200).optional().or(z.literal('')),
  tagline_en: z.string().max(300).optional().or(z.literal('')),
  tagline_ar: z.string().max(300).optional().or(z.literal('')),
  description_en: z.string().max(5000).optional().or(z.literal('')),
  description_ar: z.string().max(5000).optional().or(z.literal('')),
  
  // Provider details
  provider_id: z.string().uuid().optional().nullable(),
  
  // Classification
  sectors: z.array(z.string()).default([]),
  categories: z.array(z.string()).default([]),
  maturity_level: z.enum(['concept', 'prototype', 'pilot_ready', 'market_ready', 'proven']).default('prototype'),
  trl: z.number().int().min(1).max(9).default(5),
  trl_assessment: z.any().optional().nullable(),
  
  // Technical details
  features: z.array(z.string()).default([]),
  value_proposition: z.string().max(2000).optional().or(z.literal('')),
  use_cases: z.array(z.any()).default([]),
  technical_specifications: z.record(z.any()).default({}),
  integration_requirements: z.array(z.string()).default([]),
  
  // Commercial details
  pricing_model: z.string().max(100).optional().or(z.literal('')),
  pricing_details: z.record(z.any()).default({}),
  deployment_options: z.array(z.string()).default([]),
  implementation_timeline: z.string().max(200).optional().or(z.literal('')),
  
  // Contact information
  contact_name: z.string().max(200).optional().or(z.literal('')),
  contact_email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  contact_phone: z.string().max(50).optional().or(z.literal('')),
  
  // Links
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  demo_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  documentation_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  
  // Media
  image_url: z.string().url().optional().or(z.literal('')),
  video_url: z.string().url().optional().or(z.literal('')),
  gallery_urls: z.array(z.string().url()).default([]),
  brochure_url: z.string().url().optional().or(z.literal('')),
  
  // Certifications
  certifications: z.array(z.any()).default([]),
  case_studies: z.array(z.any()).default([]),
  
  // Workflow
  workflow_stage: z.enum(['draft', 'submitted', 'under_review', 'approved', 'rejected', 'published', 'archived', 'cancelled']).default('draft'),
  is_published: z.boolean().default(false),
  is_verified: z.boolean().default(false)
});

/**
 * Validation schema for step 1 (Basic Info)
 */
export const solutionStep1Schema = z.object({
  name_en: z.string().min(3, 'Solution name is required (min 3 characters)'),
  provider_name: z.string().min(2, 'Provider name is required'),
  provider_type: z.enum(['startup', 'sme', 'corporate', 'university', 'research_center'])
});

/**
 * Validation schema for step 2 (Technical)
 */
export const solutionStep2Schema = z.object({
  trl: z.number().int().min(1).max(9),
  maturity_level: z.enum(['concept', 'prototype', 'pilot_ready', 'market_ready', 'proven'])
});

/**
 * Validation schema for step 4 (Provider & Commercial)
 */
export const solutionStep4Schema = z.object({
  contact_email: z.string().email('Please enter a valid contact email').optional().or(z.literal(''))
});

/**
 * Validate form data against schema
 * @param {object} data - Form data to validate
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @returns {{ success: boolean, errors: object }}
 */
export function validateSolution(data, schema = solutionCreateSchema) {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data, errors: {} };
  }
  
  const errors = {};
  result.error.errors.forEach(err => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });
  
  return { success: false, data: null, errors };
}

export default solutionCreateSchema;
