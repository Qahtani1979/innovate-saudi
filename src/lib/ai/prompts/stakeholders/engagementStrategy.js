/**
 * Stakeholder Engagement Prompts
 * AI prompts for stakeholder analysis and engagement strategies
 * @module prompts/stakeholders/engagementStrategy
 */

export const STAKEHOLDER_MAPPING_PROMPT = {
  id: 'stakeholder_mapping',
  version: '1.0.0',
  category: 'stakeholders',
  system: `You are a stakeholder management expert specializing in government and public sector initiatives.
Analyze stakeholder landscapes and develop effective engagement strategies.
Consider Saudi Arabian organizational culture and Vision 2030 collaboration goals.`,
  template: `Map stakeholders for:

Initiative: {{initiativeName}}
Scope: {{scope}}
Known Stakeholders: {{stakeholders}}
Objectives: {{objectives}}
Timeline: {{timeline}}

Create comprehensive stakeholder map with engagement strategies.`,
  schema: {
    type: 'object',
    properties: {
      stakeholderMatrix: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            stakeholder: { type: 'string' },
            category: { type: 'string', enum: ['internal', 'external', 'partner', 'regulator', 'citizen'] },
            influence: { type: 'string', enum: ['high', 'medium', 'low'] },
            interest: { type: 'string', enum: ['high', 'medium', 'low'] },
            quadrant: { type: 'string', enum: ['manage_closely', 'keep_satisfied', 'keep_informed', 'monitor'] },
            currentRelationship: { type: 'string', enum: ['supporter', 'neutral', 'resistant'] }
          }
        }
      },
      powerInterestAnalysis: {
        type: 'object',
        properties: {
          highPowerHighInterest: { type: 'array', items: { type: 'string' } },
          highPowerLowInterest: { type: 'array', items: { type: 'string' } },
          lowPowerHighInterest: { type: 'array', items: { type: 'string' } },
          lowPowerLowInterest: { type: 'array', items: { type: 'string' } }
        }
      },
      engagementStrategies: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            stakeholder: { type: 'string' },
            objective: { type: 'string' },
            approach: { type: 'string' },
            channels: { type: 'array', items: { type: 'string' } },
            frequency: { type: 'string' },
            keyMessages: { type: 'array', items: { type: 'string' } }
          }
        }
      },
      riskAssessment: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            risk: { type: 'string' },
            stakeholdersAffected: { type: 'array', items: { type: 'string' } },
            mitigation: { type: 'string' }
          }
        }
      }
    },
    required: ['stakeholderMatrix', 'engagementStrategies']
  }
};

export const COMMUNICATION_PLAN_PROMPT = {
  id: 'communication_plan',
  version: '1.0.0',
  category: 'stakeholders',
  system: `You are a communications strategist.
Develop targeted communication plans that resonate with diverse stakeholder groups.
Support bilingual communications (Arabic/English) for Saudi Arabian context.`,
  template: `Create communication plan:

Initiative: {{initiative}}
Target Audience: {{audience}}
Key Messages: {{messages}}
Available Channels: {{channels}}
Timeline: {{timeline}}
Budget: {{budget}}

Design comprehensive communication strategy.`,
  schema: {
    type: 'object',
    properties: {
      objectives: { type: 'array', items: { type: 'string' } },
      audienceSegmentation: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            segment: { type: 'string' },
            characteristics: { type: 'string' },
            preferredChannels: { type: 'array', items: { type: 'string' } },
            languagePreference: { type: 'string' }
          }
        }
      },
      keyMessages: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            audience: { type: 'string' },
            primaryMessage: { type: 'string' },
            supportingPoints: { type: 'array', items: { type: 'string' } },
            callToAction: { type: 'string' }
          }
        }
      },
      channelStrategy: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            channel: { type: 'string' },
            purpose: { type: 'string' },
            frequency: { type: 'string' },
            contentType: { type: 'string' },
            owner: { type: 'string' }
          }
        }
      },
      calendar: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            week: { type: 'string' },
            activities: { type: 'array', items: { type: 'string' } },
            milestones: { type: 'array', items: { type: 'string' } }
          }
        }
      }
    },
    required: ['objectives', 'keyMessages', 'channelStrategy']
  }
};

export const FEEDBACK_ANALYSIS_PROMPT = {
  id: 'feedback_analysis',
  version: '1.0.0',
  category: 'stakeholders',
  system: `You are a feedback analysis expert.
Extract insights from stakeholder feedback to improve initiatives.
Identify patterns and sentiment across diverse stakeholder groups.`,
  template: `Analyze stakeholder feedback:

Source: {{source}}
Feedback Data: {{feedbackData}}
Time Period: {{period}}
Stakeholder Types: {{stakeholderTypes}}

Extract insights and recommendations.`,
  schema: {
    type: 'object',
    properties: {
      overallSentiment: { type: 'string', enum: ['positive', 'mixed', 'negative'] },
      sentimentScore: { type: 'number', minimum: -1, maximum: 1 },
      themes: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            theme: { type: 'string' },
            frequency: { type: 'number' },
            sentiment: { type: 'string' },
            examples: { type: 'array', items: { type: 'string' } }
          }
        }
      },
      segmentAnalysis: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            segment: { type: 'string' },
            sentiment: { type: 'string' },
            topConcerns: { type: 'array', items: { type: 'string' } },
            topPraises: { type: 'array', items: { type: 'string' } }
          }
        }
      },
      actionableInsights: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            insight: { type: 'string' },
            priority: { type: 'string' },
            recommendedAction: { type: 'string' }
          }
        }
      }
    },
    required: ['overallSentiment', 'themes', 'actionableInsights']
  }
};

export default {
  STAKEHOLDER_MAPPING_PROMPT,
  COMMUNICATION_PLAN_PROMPT,
  FEEDBACK_ANALYSIS_PROMPT
};
