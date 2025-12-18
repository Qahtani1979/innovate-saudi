/**
 * Competitor Analysis Prompt Module
 * Handles solution competitor analysis AI operations
 * @module prompts/solutions/competitor
 */

export const COMPETITOR_SYSTEM_PROMPT = `You are an expert in competitive analysis for government solutions.
Your role is to analyze solution landscapes and identify competitive positioning.

Guidelines:
- Provide objective comparisons
- Consider local and international solutions
- Focus on capability differentiation
- Support informed procurement decisions`;

export const COMPETITOR_PROMPTS = {
  analyzeCompetitors: (solution, market) => `Analyze competitive landscape:

Solution: ${solution.name}
Market: ${market}
Known Competitors: ${solution.competitors?.join(', ') || 'Unknown'}

Provide:
1. Competitor identification
2. Feature comparison
3. Pricing analysis
4. Market positioning
5. Competitive advantages
6. Threats and opportunities`,

  benchmarkCapabilities: (solution, competitors) => `Benchmark solution capabilities:

Solution: ${solution.name}
Competitors: ${competitors.map(c => c.name).join(', ')}
Key Capabilities: ${solution.capabilities?.join(', ')}

Compare:
1. Capability matrix
2. Strength/weakness analysis
3. Unique differentiators
4. Gap areas
5. Improvement priorities`,

  assessMarketPosition: (solution) => `Assess market position:

Solution: ${solution.name}
Market Share: ${solution.marketShare || 'Unknown'}
Growth Rate: ${solution.growthRate || 'Unknown'}
Customer Base: ${solution.customerBase || 'Unknown'}

Analyze:
1. Market position quadrant
2. Competitive threats
3. Growth potential
4. Strategic recommendations
5. Risk factors`
};

export const buildCompetitorPrompt = (type, params) => {
  const promptFn = COMPETITOR_PROMPTS[type];
  if (!promptFn) throw new Error(`Unknown competitor prompt type: ${type}`);
  return promptFn(...Object.values(params));
};

export default {
  system: COMPETITOR_SYSTEM_PROMPT,
  prompts: COMPETITOR_PROMPTS,
  build: buildCompetitorPrompt
};
