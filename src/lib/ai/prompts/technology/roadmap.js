/**
 * Technology Roadmap Prompts
 * AI-powered technology adoption roadmap generation
 * @version 1.0.0
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

export const TECHNOLOGY_ROADMAP_SYSTEM_PROMPT = `${SAUDI_CONTEXT.FULL}

You are a technology strategist creating adoption roadmaps for Saudi municipal innovation. Focus on practical, phased implementation with bilingual outputs.`;

export const TECHNOLOGY_ROADMAP_PROMPT_TEMPLATE = (data = {}) => `Create a comprehensive technology adoption roadmap for Saudi municipal innovation:

Current Technology Landscape:
- Pilot Technologies: ${data.pilotTech || 'N/A'}
- Solution Technologies: ${data.solutionTech || 'N/A'}
- R&D Focus: ${data.rdFocus || 'N/A'}

Generate bilingual technology roadmap for municipal innovation (2025-2030):

1. **Emerging Technologies** (0-12 months) - Technologies to explore/pilot
2. **Maturing Technologies** (1-2 years) - Technologies being validated
3. **Mainstream Technologies** (2+ years) - Technologies ready for scale
4. **Technology by Sector** - Map technologies to municipal sectors
5. **Integration Priorities** - Key tech integrations needed
6. **Skills & Capacity Gaps** - Training needs for each tech

Return detailed roadmap with timelines, sectors, and implementation guidance.`;

export const TECHNOLOGY_ROADMAP_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    emerging_tech: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          tech_name_en: { type: 'string' },
          tech_name_ar: { type: 'string' },
          sectors: { type: 'array', items: { type: 'string' } },
          use_cases_en: { type: 'string' },
          use_cases_ar: { type: 'string' },
          timeline: { type: 'string' },
          priority: { type: 'string' }
        }
      }
    },
    maturing_tech: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          tech_name_en: { type: 'string' },
          tech_name_ar: { type: 'string' },
          current_stage: { type: 'string' },
          pilots_count: { type: 'number' },
          next_steps_en: { type: 'string' },
          next_steps_ar: { type: 'string' }
        }
      }
    },
    mainstream_tech: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          tech_name_en: { type: 'string' },
          tech_name_ar: { type: 'string' },
          deployment_readiness: { type: 'string' },
          scaling_plan_en: { type: 'string' },
          scaling_plan_ar: { type: 'string' }
        }
      }
    },
    sector_tech_map: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          sector_en: { type: 'string' },
          sector_ar: { type: 'string' },
          technologies: { type: 'array', items: { type: 'string' } },
          priority: { type: 'string' }
        }
      }
    },
    integration_priorities: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          integration_en: { type: 'string' },
          integration_ar: { type: 'string' },
          systems: { type: 'array', items: { type: 'string' } },
          complexity: { type: 'string' }
        }
      }
    },
    skills_gaps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          skill_en: { type: 'string' },
          skill_ar: { type: 'string' },
          tech_area: { type: 'string' },
          training_approach_en: { type: 'string' },
          training_approach_ar: { type: 'string' }
        }
      }
    }
  }
};

export default {
  TECHNOLOGY_ROADMAP_SYSTEM_PROMPT,
  TECHNOLOGY_ROADMAP_PROMPT_TEMPLATE,
  TECHNOLOGY_ROADMAP_RESPONSE_SCHEMA
};
