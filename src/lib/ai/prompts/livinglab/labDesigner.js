/**
 * Living Lab Design Prompt
 * Generates comprehensive lab infrastructure and configuration
 * @version 1.1.0
 */

import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';
import { createBilingualSchema } from '../../bilingualSchemaBuilder';

/**
 * Build lab design prompt
 */
export function buildLabDesignPrompt(labType, basicDescription) {
  const labTypeDescriptions = {
    urban_innovation: 'Urban Innovation - Smart city solutions, urban planning, citizen services',
    smart_city: 'Smart City - IoT, sensors, data analytics, connected infrastructure',
    environmental: 'Environmental - Sustainability, green tech, waste management, air quality',
    transport: 'Transport & Mobility - Traffic, public transit, autonomous vehicles, parking',
    energy: 'Energy & Sustainability - Solar, wind, smart grids, energy efficiency',
    digital: 'Digital Services - E-government, digital platforms, AI applications'
  };

  return `${SAUDI_CONTEXT.INNOVATION}

You are an AI living lab design specialist for Saudi Arabian municipalities.

LAB TYPE: ${labTypeDescriptions[labType] || labType}
BASIC DESCRIPTION: ${basicDescription || 'Municipal innovation testing facility'}

TASK: Design a comprehensive living lab with full specifications.

GENERATE:
1. Professional bilingual name (English + Arabic)
2. Detailed description (150+ words in each language)
3. 5-8 research focus areas aligned with Saudi Vision 2030
4. 8-12 recommended equipment items for this lab type
5. 4-6 facility components (rooms, zones, infrastructure)
6. 5-7 booking and usage rules

${LANGUAGE_REQUIREMENTS.BILINGUAL}

Ensure equipment and facilities are appropriate for the lab type and Saudi climate/context.`;
}

/**
 * Get response schema for lab design
 */
export function getLabDesignSchema() {
  return createBilingualSchema({
    type: 'object',
    properties: {
      name_en: { type: 'string', description: 'English lab name' },
      name_ar: { type: 'string', description: 'Arabic lab name' },
      description_en: { type: 'string', description: 'Detailed English description' },
      description_ar: { type: 'string', description: 'Detailed Arabic description' },
      research_areas: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Research focus areas'
      },
      research_areas_ar: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Arabic research areas'
      },
      equipment: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Recommended equipment'
      },
      equipment_ar: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Arabic equipment names'
      },
      facilities: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Facility components'
      },
      facilities_ar: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Arabic facility names'
      },
      booking_rules: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Usage and booking rules'
      },
      booking_rules_ar: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Arabic booking rules'
      }
    },
    required: ['name_en', 'name_ar', 'description_en', 'description_ar', 'research_areas', 'equipment', 'facilities', 'booking_rules']
  });
}

export const LAB_DESIGNER_SYSTEM_PROMPT = `You are an AI living lab design specialist for Saudi Arabian municipalities. You create comprehensive lab specifications including equipment, facilities, and operational guidelines aligned with Vision 2030. Always provide bilingual responses.`;
