/**
 * Challenge Portfolio Analysis Prompts
 * Strategic analysis of challenge portfolios for municipal innovation
 * @version 1.0.0
 */

export const CHALLENGE_PORTFOLIO_SYSTEM_PROMPT = `You are a strategic analyst specializing in Saudi municipal challenges and innovation priorities.

EXPERTISE:
- Challenge portfolio management
- Municipal service optimization
- Cross-sector analysis
- Strategic prioritization
- Resource allocation

GUIDELINES:
- Provide complete bilingual analysis (Arabic + English for each point)
- Use Saudi municipal context and data-driven insights
- Focus on actionable recommendations
- Consider Vision 2030 alignment`;

export const CHALLENGE_PORTFOLIO_PROMPT_TEMPLATE = (challenges = []) => `${CHALLENGE_PORTFOLIO_SYSTEM_PROMPT}

Analyze this challenge portfolio for strategic insights:

Challenges:
${challenges.map(c => `- Code: ${c.code}
  Title EN: ${c.title_en}
  Title AR: ${c.title_ar || 'N/A'}
  Sector: ${c.sector}
  Municipality: ${c.municipality_id}
  Priority: ${c.priority}
  Score: ${c.overall_score}
  Status: ${c.status}
  Track: ${c.track}
`).join('\n')}

Provide COMPLETE BILINGUAL analysis (Arabic + English for each point):
1. Cross-cutting patterns (3-5 common themes) - AR + EN
2. Priority sectors needing immediate attention (top 3) - AR + EN with reasoning
3. Systemic solutions (3-4 strategic interventions) - AR + EN
4. Risk alerts (3-4 emerging trends/dangers) - AR + EN
5. Quick wins (2-3 challenges resolvable in <3 months) - AR + EN with approach
6. Resource allocation recommendations - AR + EN strategic guidance
7. Coordination opportunities (cross-municipality synergies) - AR + EN
8. Technology opportunities (AI/IoT/platforms to leverage) - AR + EN

Use Saudi municipal context and data-driven insights.`;

export const CHALLENGE_PORTFOLIO_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    patterns: { 
      type: 'array', 
      items: { 
        type: 'object',
        properties: {
          en: { type: 'string' },
          ar: { type: 'string' }
        }
      }
    },
    priority_sectors: { 
      type: 'array', 
      items: { 
        type: 'object',
        properties: {
          sector: { type: 'string' },
          reason_en: { type: 'string' },
          reason_ar: { type: 'string' }
        }
      }
    },
    systemic_solutions: { 
      type: 'array', 
      items: { 
        type: 'object',
        properties: {
          en: { type: 'string' },
          ar: { type: 'string' }
        }
      }
    },
    risk_alerts: { 
      type: 'array', 
      items: { 
        type: 'object',
        properties: {
          en: { type: 'string' },
          ar: { type: 'string' }
        }
      }
    },
    quick_wins: { 
      type: 'array', 
      items: { 
        type: 'object',
        properties: {
          challenge: { type: 'string' },
          approach_en: { type: 'string' },
          approach_ar: { type: 'string' }
        }
      }
    },
    resource_allocation: { 
      type: 'object',
      properties: {
        en: { type: 'string' },
        ar: { type: 'string' }
      }
    },
    coordination_opportunities: { 
      type: 'array', 
      items: { 
        type: 'object',
        properties: {
          en: { type: 'string' },
          ar: { type: 'string' }
        }
      }
    },
    technology_opportunities: { 
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
};

export default {
  CHALLENGE_PORTFOLIO_SYSTEM_PROMPT,
  CHALLENGE_PORTFOLIO_PROMPT_TEMPLATE,
  CHALLENGE_PORTFOLIO_RESPONSE_SCHEMA
};
