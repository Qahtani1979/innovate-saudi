/**
 * Strategy Analysis Prompts (Consolidated)
 * @module ecosystem/analysisPrompts
 * @version 1.0.0
 * Merges: pestel, bottleneckDetector, gapProgramRecommender, impactAssessment, preplanning (SWOT/Stakeholder)
 */

import { getSystemPrompt, SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

// ==================== PESTEL ANALYSIS ====================

export const PESTEL_SYSTEM_PROMPT = getSystemPrompt('pestel_analysis', `
You are a strategic analyst specializing in PESTEL analysis for Saudi municipal innovation.
Your role is to analyze political, economic, social, technological, environmental, and legal factors.
Align all analysis with Vision 2030 and local governance requirements.
`);

export function buildPestelPrompt({ strategicContext, sector, municipality }) {
    return `Perform comprehensive PESTEL analysis in BOTH English and Arabic:

Strategic Context: ${strategicContext || 'Municipal innovation initiative'}
Sector: ${sector || 'General'}
Municipality: ${municipality || 'Not specified'}

Analyze each dimension:
1. Political - governance, policies, regulations
2. Economic - budget, funding, market conditions
3. Social - demographics, cultural factors, public sentiment
4. Technological - infrastructure, digital readiness, innovation capacity
5. Environmental - sustainability, climate, resources
6. Legal - compliance, standards, legal frameworks

For each factor provide:
- Current state assessment
- Impact rating (high/medium/low)
- Strategic implications
- Recommended actions`;
}

export const PESTEL_SCHEMA = {
    type: "object",
    properties: {
        political: { type: "object", properties: { factors_en: { type: "array", items: { type: "string" } }, factors_ar: { type: "array", items: { type: "string" } }, impact: { type: "string" }, implications: { type: "string" } } },
        economic: { type: "object", properties: { factors_en: { type: "array", items: { type: "string" } }, factors_ar: { type: "array", items: { type: "string" } }, impact: { type: "string" }, implications: { type: "string" } } },
        social: { type: "object", properties: { factors_en: { type: "array", items: { type: "string" } }, factors_ar: { type: "array", items: { type: "string" } }, impact: { type: "string" }, implications: { type: "string" } } },
        technological: { type: "object", properties: { factors_en: { type: "array", items: { type: "string" } }, factors_ar: { type: "array", items: { type: "string" } }, impact: { type: "string" }, implications: { type: "string" } } },
        environmental: { type: "object", properties: { factors_en: { type: "array", items: { type: "string" } }, factors_ar: { type: "array", items: { type: "string" } }, impact: { type: "string" }, implications: { type: "string" } } },
        legal: { type: "object", properties: { factors_en: { type: "array", items: { type: "string" } }, factors_ar: { type: "array", items: { type: "string" } }, impact: { type: "string" }, implications: { type: "string" } } },
        summary_en: { type: "string" },
        summary_ar: { type: "string" }
    }
};

export const PESTEL_PROMPTS = {
    systemPrompt: PESTEL_SYSTEM_PROMPT,
    buildPrompt: buildPestelPrompt,
    schema: PESTEL_SCHEMA
};

// ==================== BOTTLENECK DETECTOR ====================

export const BOTTLENECK_DETECTOR_SYSTEM_PROMPT = `You are a process optimization specialist for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH) innovation ecosystem. You analyze innovation pipeline bottlenecks and provide actionable recommendations to improve throughput and reduce delays.`;

export const buildBottleneckDetectorPrompt = (challengesInReview, pilotsInApproval) => {
    const avgReviewTime = challengesInReview.reduce((sum, c) => sum + c.days_in_review, 0) / Math.max(1, challengesInReview.length);
    const avgApprovalTime = pilotsInApproval.reduce((sum, p) => sum + p.days_pending, 0) / Math.max(1, pilotsInApproval.length);

    return `${SAUDI_CONTEXT.COMPACT}

You are analyzing the innovation pipeline for Saudi Arabia's Ministry of Municipalities and Housing.

## PIPELINE ANALYSIS DATA

### Challenges in Review
- Total: ${challengesInReview.length}
- Stuck (>30 days): ${challengesInReview.filter(c => c.days_in_review > 30).length}
- Average review time: ${avgReviewTime.toFixed(1)} days

### Pilots Pending Approval
- Total: ${pilotsInApproval.length}
- Delayed (>45 days): ${pilotsInApproval.filter(p => p.days_pending > 45).length}
- Average approval time: ${avgApprovalTime.toFixed(1)} days

${LANGUAGE_REQUIREMENTS.BILINGUAL}

## ANALYSIS REQUIREMENTS
Identify the top 3 bottlenecks with:
1. Stage name (bilingual)
2. Severity level (critical, high, medium)
3. Number of items affected
4. Average delay in days
5. Root cause analysis (bilingual)
6. Specific actionable recommendation (bilingual)

Focus on Saudi municipal innovation context and Vision 2030 alignment.`;
};

export const bottleneckDetectorSchema = {
    type: 'object',
    required: ['bottlenecks'],
    properties: {
        bottlenecks: {
            type: 'array',
            items: {
                type: 'object',
                required: ['stage_en', 'stage_ar', 'severity', 'items_affected', 'avg_delay_days'],
                properties: {
                    stage_en: { type: 'string' },
                    stage_ar: { type: 'string' },
                    severity: { type: 'string', enum: ['critical', 'high', 'medium'] },
                    items_affected: { type: 'number' },
                    avg_delay_days: { type: 'number' },
                    root_cause_en: { type: 'string' },
                    root_cause_ar: { type: 'string' },
                    recommendation_en: { type: 'string' },
                    recommendation_ar: { type: 'string' }
                }
            }
        }
    }
};

// ==================== GAP PROGRAM RECOMMENDER ====================

export const GAP_PROGRAM_RECOMMENDER_SYSTEM_PROMPT = `You are a strategic program design specialist for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH). You analyze strategic gaps and recommend tailored innovation programs to address them, ensuring alignment with Vision 2030 and municipal development priorities.`;

export const buildGapProgramRecommenderPrompt = (gaps, programs, strategicPlans) => {
    const gapsList = gaps.map(g => `- ${g.title.en}: ${g.description.en}`).join('\n');
    const planNames = strategicPlans.map(p => p.name_en || p.title_en).join(', ');

    return `${SAUDI_CONTEXT.COMPACT}

You are recommending innovation programs to address strategic gaps for Saudi Arabia's Ministry of Municipalities and Housing.

## IDENTIFIED STRATEGIC GAPS
${gapsList}

## CONTEXT
- Existing Programs: ${programs.length}
- Strategic Plans: ${planNames}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

## RECOMMENDATION REQUIREMENTS
For each gap, recommend a specific program with:
1. Program name (English and Arabic)
2. Program type: capacity_building, innovation_challenge, mentorship, accelerator, or training
3. Key objectives (3 specific objectives)
4. Expected outcomes (3 measurable outcomes)
5. Priority level: P0 (critical), P1 (high), P2 (medium)
6. Estimated duration in months

Ensure recommendations:
- Are actionable and specific
- Align with Vision 2030 priorities
- Address the root cause of each gap
- Consider Saudi municipal context`;
};

export const gapProgramRecommenderSchema = {
    type: 'object',
    required: ['recommendations'],
    properties: {
        recommendations: {
            type: 'array',
            items: {
                type: 'object',
                required: ['program_name_en', 'program_name_ar', 'program_type', 'priority'],
                properties: {
                    gap_type: { type: 'string' },
                    program_name_en: { type: 'string' },
                    program_name_ar: { type: 'string' },
                    program_type: { type: 'string', enum: ['capacity_building', 'innovation_challenge', 'mentorship', 'accelerator', 'training'] },
                    objectives: { type: 'array', items: { type: 'string' } },
                    outcomes: { type: 'array', items: { type: 'string' } },
                    priority: { type: 'string', enum: ['P0', 'P1', 'P2'] },
                    duration_months: { type: 'number', minimum: 1, maximum: 36 }
                }
            }
        }
    }
};

// ==================== IMPACT ASSESSMENT ====================

export const IMPACT_ASSESSMENT_SYSTEM_PROMPT = 'You are a strategic impact assessment expert. Analyze the impact data and provide actionable insights.';

export const buildImpactAssessmentPrompt = (impactData) => `Analyze this strategic impact assessment data and provide insights:

Overall Score: ${impactData.overall.score}/100
Dimensions:
${impactData.dimensions.map(d => `- ${d.name}: ${d.score}/${d.target} (${d.trend})`).join('\n')}

Provide:
1. Key strengths (2-3)
2. Areas needing improvement (2-3) 
3. Recommended actions (3-4)
4. Risk factors to monitor`;

export const IMPACT_ASSESSMENT_SCHEMA = {
    type: 'object',
    properties: {
        strengths: { type: 'array', items: { type: 'string' } },
        improvements: { type: 'array', items: { type: 'string' } },
        recommendations: { type: 'array', items: { type: 'string' } },
        risks: { type: 'array', items: { type: 'string' } }
    },
    required: ['strengths', 'improvements', 'recommendations', 'risks']
};

export const IMPACT_ASSESSMENT_PROMPTS = {
    systemPrompt: IMPACT_ASSESSMENT_SYSTEM_PROMPT,
    buildPrompt: buildImpactAssessmentPrompt,
    schema: IMPACT_ASSESSMENT_SCHEMA
};
