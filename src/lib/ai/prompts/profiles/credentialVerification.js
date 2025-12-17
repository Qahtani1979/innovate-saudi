/**
 * Credential Verification Prompt
 * AI-powered document verification for professional credentials
 * @version 1.0.0
 */

import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';
import { createBilingualSchema } from '../../bilingualSchemaBuilder';

/**
 * Build credential verification prompt
 */
export function buildCredentialVerificationPrompt(profileType, fileUrl) {
  return `${SAUDI_CONTEXT}

You are an AI credential verification specialist for Saudi Arabia's municipal innovation platform.

PROFILE TYPE: ${profileType}
DOCUMENT TO VERIFY: Uploaded credential document

TASK: Analyze the uploaded credential document and extract verification information.

VERIFY AND EXTRACT:
1. Credential Type (degree, certification, professional license, etc.)
2. Issuing Institution (university, certification body, government agency)
3. Date Issued
4. Verification Status:
   - "legitimate" - Document appears authentic and verifiable
   - "needs_review" - Some concerns, requires manual verification
   - "suspicious" - Red flags detected, likely fraudulent
5. Key Details extracted from the document
6. Confidence Score (0-100) based on document quality and authenticity indicators

${LANGUAGE_REQUIREMENTS}

Consider Saudi and international credential standards. Flag any inconsistencies.`;
}

/**
 * Get response schema for credential verification
 */
export function getCredentialVerificationSchema() {
  return createBilingualSchema({
    type: 'object',
    properties: {
      credential_type: { type: 'string', description: 'Type of credential' },
      credential_type_ar: { type: 'string', description: 'Arabic credential type' },
      issuer: { type: 'string', description: 'Issuing institution' },
      issuer_ar: { type: 'string', description: 'Arabic issuer name' },
      date_issued: { type: 'string', description: 'Issue date' },
      verification_status: { 
        type: 'string', 
        enum: ['legitimate', 'needs_review', 'suspicious'],
        description: 'Verification result'
      },
      status_reason: { type: 'string', description: 'Reason for status' },
      status_reason_ar: { type: 'string', description: 'Arabic status reason' },
      details: { 
        type: 'object',
        description: 'Extracted credential details'
      },
      confidence_score: { type: 'number', description: 'Confidence 0-100' },
      recommendations: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Next steps or recommendations'
      },
      recommendations_ar: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Arabic recommendations'
      }
    },
    required: ['credential_type', 'issuer', 'date_issued', 'verification_status', 'confidence_score']
  });
}

export const CREDENTIAL_VERIFICATION_SYSTEM_PROMPT = `You are an AI credential verification specialist for Saudi Arabia's municipal innovation platform. You analyze professional documents to verify authenticity and extract key information. Always provide bilingual responses and flag any concerns.`;
