/**
 * Risk Portfolio Analysis Prompts
 * Comprehensive risk assessment for municipal innovation portfolios
 * @version 1.0.0
 */

export const RISK_PORTFOLIO_SYSTEM_PROMPT = `You are a risk management expert specializing in municipal innovation portfolios for Saudi Arabia.

EXPERTISE:
- Innovation risk assessment
- Portfolio risk management
- Municipal project evaluation
- Risk mitigation strategies
- Early warning indicators

GUIDELINES:
- Provide bilingual analysis (Arabic + English)
- Use data-driven risk assessments
- Prioritize actionable recommendations
- Consider Saudi municipal context`;

export const RISK_PORTFOLIO_PROMPT_TEMPLATE = ({
  highRiskPilots = [],
  activePilotsCount = 0,
  activeChallengesCount = 0
}) => `${RISK_PORTFOLIO_SYSTEM_PROMPT}

Perform comprehensive risk portfolio analysis for municipal innovation:

Pilots at Risk:
${highRiskPilots.map(p => 
  `${p.code}: ${p.title_en}, Risk: ${p.risk_level}, Issues: ${p.issues?.length || 0}`
).join('\n')}

All Active Pilots: ${activePilotsCount}
All Active Challenges: ${activeChallengesCount}

Generate bilingual risk analysis:
1. Risk heat map (categorize risks by type and severity)
2. Risk trends (increasing/decreasing patterns)
3. Mitigation recommendations (prioritized actions)
4. Early warning indicators (signals to watch)
5. Portfolio-level risk score and interpretation`;

export const RISK_PORTFOLIO_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    risk_heatmap: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          risk_category_en: { type: 'string' },
          risk_category_ar: { type: 'string' },
          severity: { type: 'string' },
          affected_count: { type: 'number' },
          description_en: { type: 'string' },
          description_ar: { type: 'string' }
        }
      }
    },
    risk_trends: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          period: { type: 'string' },
          high_risk: { type: 'number' },
          medium_risk: { type: 'number' },
          low_risk: { type: 'number' }
        }
      }
    },
    mitigation_recommendations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          recommendation_en: { type: 'string' },
          recommendation_ar: { type: 'string' },
          priority: { type: 'string' },
          impact: { type: 'string' }
        }
      }
    },
    early_warnings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          indicator_en: { type: 'string' },
          indicator_ar: { type: 'string' },
          threshold: { type: 'string' }
        }
      }
    },
    portfolio_risk_score: { type: 'number' },
    interpretation_en: { type: 'string' },
    interpretation_ar: { type: 'string' }
  }
};

export default {
  RISK_PORTFOLIO_SYSTEM_PROMPT,
  RISK_PORTFOLIO_PROMPT_TEMPLATE,
  RISK_PORTFOLIO_RESPONSE_SCHEMA
};
