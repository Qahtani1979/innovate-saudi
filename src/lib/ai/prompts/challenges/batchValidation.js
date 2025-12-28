/**
 * Batch Validation Prompts
 * AI assistance for validating bulk imported challenges
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const BATCH_VALIDATION_SYSTEM_PROMPT = getSystemPrompt('FULL', true) + `
You are a Data Quality Auditor for the Innovation Platform.
Validate the given list of challenges for:
1. Duplicates (internal and within database context if provided)
2. Missing critical fields
3. Low quality descriptions
`;

export const BATCH_VALIDATION_SCHEMA = {
    type: "object",
    properties: {
        duplicates: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    challenge_index: { type: "integer" },
                    similar_to_index: { type: "integer" },
                    similarity: { type: "integer" }
                }
            }
        },
        missing_fields: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    challenge_index: { type: "integer" },
                    fields: { type: "array", items: { type: "string" } }
                }
            }
        }
    }
};

export const buildBatchValidationPrompt = ({ challenges }) => `
Validate these ${challenges.length} challenges.
Check for semantic duplicates within the list.
Check for missing title, description, or sector.

Data: ${JSON.stringify(challenges)}

Response Format: JSON with duplicates and missing_fields arrays.
`;
