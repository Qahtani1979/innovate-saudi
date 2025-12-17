/**
 * Compliance Validation AI Prompts
 * Validates solution compliance with Saudi municipal requirements
 * @module solution/complianceValidation
 */

import { getSystemPrompt } from '@/lib/saudiContext';

/**
 * Generate compliance validation prompt
 */
export function generateComplianceValidationPrompt(solution, extractedDocData = []) {
  return `Validate compliance and certifications for this solution.

SOLUTION:
Name: ${solution?.name_en || 'Unknown'}
Provider: ${solution?.provider_name || 'Unknown'}
Sectors: ${solution?.sectors?.join(', ') || 'N/A'}
Deployment Options: ${solution?.deployment_options?.join(', ') || 'N/A'}

CLAIMED CERTIFICATIONS:
${JSON.stringify(solution?.certifications || [], null, 2)}

EXTRACTED FROM DOCUMENTS:
${JSON.stringify(extractedDocData, null, 2)}

COMPLIANCE REQUIREMENTS FOR SAUDI MUNICIPAL TECH:
- ISO 27001 (Information Security)
- PDPL (Personal Data Protection Law)
- CITC Regulations (if telecom/digital services)
- ISO 9001 (Quality Management)
- Municipal Safety Standards
- NCA Cybersecurity Controls
- SAMA Regulations (if financial)

Analyze and provide:
1. Compliance score (0-100%)
2. Verified certifications (cross-check claims vs documents)
3. Missing certifications (critical for municipal deployment)
4. Expired/expiring certifications
5. Compliance risk level
6. Recommended actions
7. Certification validation status (authentic/suspicious)

Be thorough and flag any discrepancies.`;
}

/**
 * Get compliance validation schema
 */
export function getComplianceValidationSchema() {
  return {
    type: 'object',
    properties: {
      compliance_score: { type: 'number' },
      verified_certifications: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            status: { 
              type: 'string', 
              enum: ['verified', 'expired', 'invalid', 'pending', 'suspicious'] 
            },
            issuer: { type: 'string' },
            expiry_date: { type: 'string' }
          }
        }
      },
      missing_certifications: { 
        type: 'array', 
        items: { type: 'string' } 
      },
      expiring_soon: { 
        type: 'array', 
        items: { type: 'string' } 
      },
      compliance_risk: { 
        type: 'string', 
        enum: ['low', 'medium', 'high', 'critical'] 
      },
      recommended_actions: { 
        type: 'array', 
        items: { type: 'string' } 
      },
      validation_notes: { type: 'string' },
      discrepancies_found: { 
        type: 'array', 
        items: { type: 'string' } 
      },
      regulatory_requirements: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            requirement: { type: 'string' },
            status: { type: 'string' },
            priority: { type: 'string' }
          }
        }
      }
    }
  };
}

/**
 * Get document extraction schema
 */
export function getDocumentExtractionSchema() {
  return {
    type: 'object',
    properties: {
      certification_name: { type: 'string' },
      issuer: { type: 'string' },
      issue_date: { type: 'string' },
      expiry_date: { type: 'string' },
      certification_number: { type: 'string' },
      compliance_standards: { 
        type: 'array', 
        items: { type: 'string' } 
      }
    }
  };
}

/**
 * Get system prompt for compliance validation
 */
export function getComplianceValidationSystemPrompt() {
  return getSystemPrompt('compliance-auditor');
}

export const COMPLIANCE_VALIDATION_CONFIG = {
  name: 'compliance-validation',
  version: '1.0.0',
  description: 'AI-powered compliance validation for municipal solutions'
};
