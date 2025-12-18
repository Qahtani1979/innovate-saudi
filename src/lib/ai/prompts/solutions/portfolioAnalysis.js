/**
 * Solution Portfolio Analysis Prompts
 * Strategic analysis of solution marketplace for municipal innovation
 * @version 1.0.0
 */

export const SOLUTION_PORTFOLIO_SYSTEM_PROMPT = `You are a solution marketplace analyst specializing in Saudi municipal innovation ecosystems.

EXPERTISE:
- Solution portfolio assessment
- Provider ecosystem analysis
- Technology adoption strategies
- Market development
- Scaling recommendations

GUIDELINES:
- Provide bilingual insights (English + Arabic for each item)
- Focus on actionable market intelligence
- Consider Saudi municipal context
- Emphasize deployment and scaling potential`;

export const SOLUTION_PORTFOLIO_PROMPT_TEMPLATE = ({
  solutionSummary = [],
  totalSolutions = 0,
  marketReadyCount = 0,
  startupCount = 0,
  avgDeployments = 0
}) => `${SOLUTION_PORTFOLIO_SYSTEM_PROMPT}

Analyze this solution portfolio for Saudi municipal innovation and provide strategic insights in BOTH English AND Arabic:

Solutions: ${JSON.stringify(solutionSummary)}

Statistics:
- Total Solutions: ${totalSolutions}
- Market Ready: ${marketReadyCount}
- From Startups: ${startupCount}
- Average Deployments: ${avgDeployments}

Provide bilingual insights (each item should have both English and Arabic versions):
1. Solution landscape gaps and opportunities
2. Provider ecosystem health assessment
3. Deployment acceleration strategies
4. High-potential solutions for scaling
5. Market development recommendations`;

export const SOLUTION_PORTFOLIO_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    landscape_gaps: { 
      type: 'array', 
      items: { 
        type: 'object', 
        properties: { 
          en: { type: 'string' }, 
          ar: { type: 'string' } 
        } 
      } 
    },
    ecosystem_health: { 
      type: 'array', 
      items: { 
        type: 'object', 
        properties: { 
          en: { type: 'string' }, 
          ar: { type: 'string' } 
        } 
      } 
    },
    deployment_strategies: { 
      type: 'array', 
      items: { 
        type: 'object', 
        properties: { 
          en: { type: 'string' }, 
          ar: { type: 'string' } 
        } 
      } 
    },
    high_potential_solutions: { 
      type: 'array', 
      items: { 
        type: 'object', 
        properties: { 
          en: { type: 'string' }, 
          ar: { type: 'string' } 
        } 
      } 
    },
    market_development: { 
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
  SOLUTION_PORTFOLIO_SYSTEM_PROMPT,
  SOLUTION_PORTFOLIO_PROMPT_TEMPLATE,
  SOLUTION_PORTFOLIO_RESPONSE_SCHEMA
};
