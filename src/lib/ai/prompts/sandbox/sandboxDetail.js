/**
 * Sandbox Detail AI Prompts
 * @module prompts/sandbox/sandboxDetail
 * @version 1.0.0
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

/**
 * Sandbox detail analysis prompt template
 */
export const SANDBOX_DETAIL_PROMPT_TEMPLATE = (sandbox) => ({
  prompt: `Analyze this regulatory sandbox for Saudi municipal innovation and provide strategic insights in BOTH English AND Arabic:

Sandbox: ${sandbox.name_en}
Domain: ${sandbox.domain}
Status: ${sandbox.status}
Capacity: ${sandbox.capacity}
Current Pilots: ${sandbox.current_pilots || 0}
Utilization: ${((sandbox.current_pilots || 0) / (sandbox.capacity || 1) * 100).toFixed(0)}%
Success Rate: ${sandbox.success_rate || 'N/A'}%
Available Exemptions: ${sandbox.available_exemptions?.length || 0}

${SAUDI_CONTEXT}

Provide bilingual insights (each item should have both English and Arabic versions):
1. Capacity optimization recommendations
2. Regulatory risk assessment
3. Success factors for sandbox pilots
4. Potential new pilot opportunities
5. Resource allocation suggestions`,
  
  system: `You are a regulatory sandbox analyst specializing in Saudi Arabian innovation ecosystems. Provide strategic insights for optimizing sandbox operations aligned with Vision 2030 regulatory innovation goals.`,
  
  schema: {
    type: 'object',
    properties: {
      capacity_optimization: { 
        type: 'array', 
        items: { 
          type: 'object', 
          properties: { 
            en: { type: 'string' }, 
            ar: { type: 'string' } 
          } 
        } 
      },
      regulatory_risks: { 
        type: 'array', 
        items: { 
          type: 'object', 
          properties: { 
            en: { type: 'string' }, 
            ar: { type: 'string' } 
          } 
        } 
      },
      success_factors: { 
        type: 'array', 
        items: { 
          type: 'object', 
          properties: { 
            en: { type: 'string' }, 
            ar: { type: 'string' } 
          } 
        } 
      },
      pilot_opportunities: { 
        type: 'array', 
        items: { 
          type: 'object', 
          properties: { 
            en: { type: 'string' }, 
            ar: { type: 'string' } 
          } 
        } 
      },
      resource_allocation: { 
        type: 'array', 
        items: { 
          type: 'object', 
          properties: { 
            en: { type: 'string' }, 
            ar: { type: 'string' } 
          } 
        } 
      }
    }
  }
});

export const SANDBOX_ANALYSIS_SYSTEM_PROMPT = `You are a regulatory sandbox analyst specializing in Saudi Arabian innovation ecosystems. Provide strategic insights for optimizing sandbox operations aligned with Vision 2030 regulatory innovation goals.`;

export default SANDBOX_DETAIL_PROMPT_TEMPLATE;
