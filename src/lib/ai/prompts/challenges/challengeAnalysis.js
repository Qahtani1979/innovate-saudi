/**
 * Challenge Analysis Prompts
 * AI assistance for comprehensive challenge analysis and profile generation
 * @version 1.0.0
 */

export const CHALLENGE_ANALYSIS_SYSTEM_PROMPT = `You are a municipal innovation expert analyzing challenges for Saudi municipalities.

EXPERTISE:
- Municipal service delivery and optimization
- Urban planning and infrastructure
- Citizen engagement and satisfaction
- Digital transformation initiatives
- Environmental sustainability
- Public safety and security

GUIDELINES:
- Generate COMPLETE BILINGUAL content (English and Arabic)
- Focus on problem definition, NOT solutions
- Use data-driven analysis
- Consider Vision 2030 alignment
- Identify root causes and stakeholders`;

export const CHALLENGE_ANALYSIS_PROMPT_TEMPLATE = ({
  municipality,
  userDescription,
  ideaContext = '',
  sectors = [],
  subsectors = [],
  services = []
}) => ({
  system: CHALLENGE_ANALYSIS_SYSTEM_PROMPT,
  prompt: `INPUT:
Municipality: ${municipality?.name_en} (${municipality?.name_ar || ''})
User's Description: ${userDescription}
${ideaContext}

Available Sectors: ${sectors.map(s => `${s.id}: ${s.name_en} (${s.code})`).join(', ')}
Available Subsectors: ${subsectors.map(ss => `${ss.id}: ${ss.name_en} (sector: ${ss.sector_id})`).join(', ')}
Available Services (first 30): ${services.slice(0, 30).map(sv => `${sv.id}: ${sv.name_en}`).join(', ')}

Generate COMPLETE BILINGUAL challenge profile:

CRITICAL CONTENT RULES:
- DESCRIPTIONS: Focus ONLY on the problem, current situation, impact, and data evidence
- DO NOT describe specific solutions, technologies, or implementation approaches
- DO NOT limit solution approaches - keep desired outcome open-ended
- Desired Outcome should describe the END STATE, not how to achieve it
- Example GOOD desired outcome: "Reduce traffic congestion by 40% and improve commute times"
- Example BAD desired outcome: "Install smart traffic lights system" (too specific)

REQUIRED OUTPUT FIELDS:
1. Titles (EN + AR): Clear, professional municipal challenge titles
2. Taglines (EN + AR): One-line problem summary
3. Descriptions (EN + AR, 250+ words each): Comprehensive problem description
4. Problem Statements (EN + AR): Specific problem definition
5. Current Situations (EN + AR): Factual current state
6. Desired Outcomes (EN + AR): OPEN-ENDED end state goal
7. Root Cause (EN + AR): Primary underlying cause
8. Root Causes array (4-6 specific causes)
9. Sector ID: Best match from available sectors
10. Subsector ID: Best match from available subsectors
11. Service ID: Most relevant affected service
12. Affected Services (2-4 service names)
13. Severity Score (0-100): Problem criticality
14. Impact Score (0-100): Population/service impact
15. Affected Population: {size: number, demographics: string, location: string}
16. KPIs (4 measurable): {name_en, name_ar, baseline, target, unit}
17. Stakeholders (3-5): {name, role, involvement}
18. Data Evidence (2-4): {type, source, value, date}
19. Constraints (2-3): {type, description}
20. Keywords (8-12): Search terms
21. Theme: Challenge theme/category
22. Challenge Type: service_quality/infrastructure/efficiency/innovation/safety/environmental/digital_transformation
23. Category: Specific subcategory
24. Priority: tier_1/tier_2/tier_3/tier_4
25. Tracks (multiple): pilot/r_and_d/program/procurement/policy
26. Budget Estimate (SAR): Estimated cost
27. Timeline Estimate: Expected duration`,
  schema: {
    type: 'object',
    required: ['title_en', 'title_ar', 'description_en', 'description_ar', 'problem_statement_en', 'problem_statement_ar', 'sector_id', 'severity_score', 'impact_score'],
    properties: {
      title_en: { type: 'string' },
      title_ar: { type: 'string' },
      tagline_en: { type: 'string' },
      tagline_ar: { type: 'string' },
      description_en: { type: 'string' },
      description_ar: { type: 'string' },
      problem_statement_en: { type: 'string' },
      problem_statement_ar: { type: 'string' },
      current_situation_en: { type: 'string' },
      current_situation_ar: { type: 'string' },
      desired_outcome_en: { type: 'string' },
      desired_outcome_ar: { type: 'string' },
      root_cause_en: { type: 'string' },
      root_cause_ar: { type: 'string' },
      root_causes: { type: 'array', items: { type: 'string' } },
      sector_id: { type: 'string' },
      subsector_id: { type: 'string' },
      service_id: { type: 'string' },
      affected_services: { type: 'array', items: { type: 'string' } },
      severity_score: { type: 'number' },
      impact_score: { type: 'number' },
      affected_population: {
        type: 'object',
        properties: {
          size: { type: 'number' },
          demographics: { type: 'string' },
          location: { type: 'string' }
        }
      },
      kpis: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name_en: { type: 'string' },
            name_ar: { type: 'string' },
            baseline: { type: 'string' },
            target: { type: 'string' },
            unit: { type: 'string' }
          }
        }
      },
      stakeholders: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            role: { type: 'string' },
            involvement: { type: 'string' }
          }
        }
      },
      data_evidence: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: { type: 'string' },
            source: { type: 'string' },
            value: { type: 'string' },
            date: { type: 'string' }
          }
        }
      },
      constraints: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: { type: 'string' },
            description: { type: 'string' }
          }
        }
      },
      keywords: { type: 'array', items: { type: 'string' } },
      theme: { type: 'string' },
      category: { type: 'string' },
      challenge_type: { type: 'string' },
      priority_tier: { type: 'number' },
      tracks: { type: 'array', items: { type: 'string' } },
      budget_estimate: { type: 'number' },
      timeline_estimate: { type: 'string' },
      ministry_service: { type: 'string' },
      responsible_agency: { type: 'string' },
      department: { type: 'string' },
      strategic_goal: { type: 'string' }
    }
  }
});

export default {
  CHALLENGE_ANALYSIS_SYSTEM_PROMPT,
  CHALLENGE_ANALYSIS_PROMPT_TEMPLATE
};
