/**
 * Stakeholder Engagement AI Prompts
 * Centralized prompts for stakeholder analysis and engagement
 * @module stakeholders/engagementAnalysis
 */

export const STAKEHOLDER_ENGAGEMENT_SYSTEM_PROMPT = `You are an expert stakeholder management advisor for Saudi Arabian government initiatives.

ENGAGEMENT FRAMEWORK:
1. Stakeholder Mapping
   - Influence assessment
   - Interest analysis
   - Relationship mapping
   - Priority ranking

2. Engagement Strategy
   - Communication approach
   - Frequency planning
   - Channel selection
   - Message tailoring

3. Risk Assessment
   - Opposition identification
   - Resistance factors
   - Mitigation strategies
   - Escalation paths

4. Success Metrics
   - Engagement levels
   - Satisfaction scores
   - Action completion
   - Relationship health

CONTEXT:
- Saudi governance structures
- Cultural communication norms
- Arabic/English bilingual support`;

export const STAKEHOLDER_ENGAGEMENT_SCHEMA = {
  type: "object",
  properties: {
    engagement_health: { type: "number" },
    stakeholder_map: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          role: { type: "string" },
          influence: { type: "string", enum: ["high", "medium", "low"] },
          interest: { type: "string", enum: ["high", "medium", "low"] },
          stance: { type: "string", enum: ["champion", "supporter", "neutral", "skeptic", "opponent"] },
          engagement_strategy: { type: "string" }
        }
      }
    },
    communication_plan: {
      type: "array",
      items: {
        type: "object",
        properties: {
          stakeholder_group: { type: "string" },
          frequency: { type: "string" },
          channels: { type: "array", items: { type: "string" } },
          key_messages: { type: "array", items: { type: "string" } }
        }
      }
    },
    risks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          stakeholder: { type: "string" },
          risk: { type: "string" },
          mitigation: { type: "string" }
        }
      }
    },
    action_items: { type: "array", items: { type: "string" } }
  },
  required: ["engagement_health", "stakeholder_map"]
};

export const buildStakeholderEngagementPrompt = (initiativeData, language = 'en') => {
  const langInstruction = language === 'ar' ? 'Respond in Arabic.' : 'Respond in English.';

  return `${langInstruction}

Analyze stakeholder engagement for:

INITIATIVE: ${initiativeData.name || 'Not specified'}
TYPE: ${initiativeData.type || 'Project'}
STATUS: ${initiativeData.status || 'Active'}

KEY STAKEHOLDERS:
${initiativeData.stakeholders?.map(s => `- ${s.name} (${s.role}): ${s.organization}`).join('\n') || 'Not specified'}

CURRENT ENGAGEMENT LEVEL: ${initiativeData.engagementLevel || 'Unknown'}

RECENT INTERACTIONS:
${initiativeData.recentInteractions?.slice(0, 5).map(i => `- ${i}`).join('\n') || 'None recorded'}

KNOWN CONCERNS:
${initiativeData.concerns?.map(c => `- ${c}`).join('\n') || 'None identified'}

Provide comprehensive stakeholder analysis with engagement recommendations.`;
};

export const STAKEHOLDER_ENGAGEMENT_PROMPTS = {
  system: STAKEHOLDER_ENGAGEMENT_SYSTEM_PROMPT,
  schema: STAKEHOLDER_ENGAGEMENT_SCHEMA,
  buildPrompt: buildStakeholderEngagementPrompt
};

export default STAKEHOLDER_ENGAGEMENT_PROMPTS;
