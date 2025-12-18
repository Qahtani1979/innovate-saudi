/**
 * Scaling Readiness AI Prompts
 * Centralized prompts for pilot-to-scale transition analysis
 * @module scaling/readinessAssessment
 */

export const SCALING_READINESS_SYSTEM_PROMPT = `You are an expert in scaling innovation pilots for Saudi Arabian government initiatives.

SCALING ASSESSMENT FRAMEWORK:
1. Readiness Evaluation
   - Technical maturity
   - Process standardization
   - Resource availability
   - Stakeholder alignment

2. Risk Analysis
   - Scaling risks
   - Mitigation strategies
   - Contingency planning
   - Success factors

3. Resource Planning
   - Budget requirements
   - Team scaling needs
   - Infrastructure demands
   - Partnership needs

4. Implementation Roadmap
   - Phased rollout plan
   - Key milestones
   - Success metrics
   - Governance structure

CONTEXT:
- Saudi government scaling standards
- Vision 2030 implementation guidelines
- Municipal governance requirements
- Arabic/English bilingual support`;

export const SCALING_READINESS_SCHEMA = {
  type: "object",
  properties: {
    readiness_score: {
      type: "number",
      description: "Overall scaling readiness (0-100)"
    },
    readiness_level: {
      type: "string",
      enum: ["ready", "almost_ready", "needs_work", "not_ready"],
      description: "Readiness classification"
    },
    dimension_scores: {
      type: "object",
      properties: {
        technical: { type: "number" },
        operational: { type: "number" },
        financial: { type: "number" },
        organizational: { type: "number" },
        stakeholder: { type: "number" }
      }
    },
    gaps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          dimension: { type: "string" },
          gap: { type: "string" },
          severity: { type: "string" },
          remediation: { type: "string" }
        }
      }
    },
    scaling_plan: {
      type: "object",
      properties: {
        approach: { type: "string", enum: ["big_bang", "phased", "regional", "pilot_expansion"] },
        phases: {
          type: "array",
          items: {
            type: "object",
            properties: {
              phase_name: { type: "string" },
              duration: { type: "string" },
              scope: { type: "string" },
              key_activities: { type: "array", items: { type: "string" } }
            }
          }
        },
        timeline: { type: "string" },
        budget_estimate: { type: "string" }
      }
    },
    risks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          risk: { type: "string" },
          probability: { type: "string" },
          impact: { type: "string" },
          mitigation: { type: "string" }
        }
      }
    },
    success_factors: {
      type: "array",
      items: { type: "string" }
    },
    recommendation: {
      type: "string",
      description: "Final scaling recommendation"
    }
  },
  required: ["readiness_score", "readiness_level", "dimension_scores"]
};

export const buildScalingReadinessPrompt = (pilotData, language = 'en') => {
  const langInstruction = language === 'ar' 
    ? 'Respond in Arabic.' 
    : 'Respond in English.';

  return `${langInstruction}

Assess scaling readiness for:

PILOT INFORMATION:
- Name: ${pilotData.name || 'Not specified'}
- Duration: ${pilotData.duration || 'Not specified'}
- Status: ${pilotData.status || 'Completed'}
- Success Rate: ${pilotData.successRate || 'N/A'}%

PILOT RESULTS:
${pilotData.results?.map(r => `- ${r.metric}: ${r.value}`).join('\n') || 'Not available'}

CURRENT SCOPE:
- Locations: ${pilotData.locations || 1}
- Users: ${pilotData.users || 'N/A'}
- Transactions: ${pilotData.transactions || 'N/A'}

PROPOSED SCALING:
- Target locations: ${pilotData.targetLocations || 'All municipalities'}
- Target users: ${pilotData.targetUsers || 'N/A'}
- Timeline: ${pilotData.targetTimeline || '12 months'}

AVAILABLE RESOURCES:
- Budget: ${pilotData.budget || 'To be determined'} SAR
- Team size: ${pilotData.teamSize || 'N/A'}
- Technology: ${pilotData.technology || 'Not specified'}

Provide comprehensive scaling readiness assessment with actionable roadmap.`;
};

export const SCALING_READINESS_PROMPTS = {
  system: SCALING_READINESS_SYSTEM_PROMPT,
  schema: SCALING_READINESS_SCHEMA,
  buildPrompt: buildScalingReadinessPrompt
};

export default SCALING_READINESS_PROMPTS;
