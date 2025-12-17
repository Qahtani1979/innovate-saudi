/**
 * TRL Assessment Prompts
 * For assessing Technology Readiness Level of R&D projects
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const TRL_ASSESSMENT_PROMPTS = {
  systemPrompt: getSystemPrompt('rd_trl_assessment'),
  
  TRL_DEFINITIONS: {
    1: { en: 'Basic principles observed', ar: 'المبادئ الأساسية ملاحظة' },
    2: { en: 'Technology concept formulated', ar: 'صياغة مفهوم التقنية' },
    3: { en: 'Experimental proof of concept', ar: 'إثبات المفهوم تجريبياً' },
    4: { en: 'Technology validated in lab', ar: 'التقنية معتمدة في المختبر' },
    5: { en: 'Technology validated in relevant environment', ar: 'التقنية معتمدة في بيئة ذات صلة' },
    6: { en: 'Technology demonstrated in relevant environment', ar: 'التقنية مُوضحة في بيئة ذات صلة' },
    7: { en: 'System prototype in operational environment', ar: 'نموذج أولي في بيئة تشغيلية' },
    8: { en: 'System complete and qualified', ar: 'النظام مكتمل ومؤهل' },
    9: { en: 'Actual system proven in operational environment', ar: 'النظام الفعلي مُثبت في بيئة تشغيلية' }
  },
  
  buildPrompt: (rdProject, evidence) => `You are a TRL assessment expert using NASA Technology Readiness Level definitions.

R&D PROJECT:
Title: ${rdProject.title_en}
Title (AR): ${rdProject.title_ar || 'N/A'}
Current Claimed TRL: ${rdProject.trl_current || 'Unknown'}
Research Area: ${rdProject.research_area_en || 'General'}

PROJECT OUTPUTS AND EVIDENCE:
${JSON.stringify(rdProject.expected_outputs || [], null, 2)}

PUBLICATIONS:
${JSON.stringify(rdProject.publications || [], null, 2)}

NEW EVIDENCE PROVIDED BY RESEARCHER:
${evidence}

TRL SCALE REFERENCE:
1 - Basic principles observed and reported
2 - Technology concept and/or application formulated
3 - Analytical and experimental proof of concept
4 - Technology validated in laboratory environment
5 - Technology validated in relevant environment
6 - Technology demonstrated in relevant environment
7 - System prototype demonstration in operational environment
8 - System complete and qualified
9 - Actual system proven in operational environment

ASSESS:
1. Current TRL level (1-9) based on evidence
2. Detailed justification for this level
3. Evidence quality score (0-100)
4. Requirements to advance to next TRL
5. Pilot readiness (TRL ≥ 6)
6. Commercialization readiness (TRL ≥ 7)
7. Specific recommendations

Be rigorous and evidence-based. Do not inflate TRL without solid evidence.`,

  schema: {
    type: 'object',
    properties: {
      assessed_trl: { 
        type: 'number',
        description: 'Technology Readiness Level 1-9'
      },
      justification: { 
        type: 'string',
        description: 'Detailed justification for assessed TRL'
      },
      justification_ar: { type: 'string' },
      confidence: { 
        type: 'number',
        description: 'Confidence in assessment 0-100'
      },
      evidence_quality: { 
        type: 'number',
        description: 'Quality of provided evidence 0-100'
      },
      next_requirements: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Requirements to advance to next TRL'
      },
      next_requirements_ar: { 
        type: 'array', 
        items: { type: 'string' }
      },
      pilot_ready: { 
        type: 'boolean',
        description: 'Ready for pilot testing (TRL >= 6)'
      },
      commercialization_ready: { 
        type: 'boolean',
        description: 'Ready for commercialization (TRL >= 7)'
      },
      recommendations: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Specific recommendations for TRL advancement'
      },
      recommendations_ar: { 
        type: 'array', 
        items: { type: 'string' }
      }
    },
    required: ['assessed_trl', 'justification', 'confidence', 'evidence_quality', 'next_requirements', 'pilot_ready', 'commercialization_ready', 'recommendations']
  }
};

export default TRL_ASSESSMENT_PROMPTS;
