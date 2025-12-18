/**
 * Generation Prompts - Content generation
 * @module prompts/generation
 */

export const generationPrompts = {
  contentGenerator: {
    id: 'generation_content',
    name: 'Content Generator',
    description: 'Generate various content types',
    prompt: (context) => `
Generate ${context.contentType} content based on requirements.

CONTENT TYPE: ${context.contentType}
PURPOSE: ${context.purpose}
TARGET AUDIENCE: ${context.audience || 'general'}
TONE: ${context.tone || 'professional'}
LENGTH: ${context.length || 'medium'}

INPUT/CONTEXT:
${context.input}

REQUIREMENTS:
${context.requirements?.join('\n') || 'Follow best practices'}

Generate content that is:
- Clear and engaging
- Appropriate for audience
- Aligned with purpose
- Culturally appropriate for Saudi context

Return the generated content.
`,
    schema: {
      content: 'string',
      content_ar: 'string',
      metadata: 'object',
      suggestions: 'array'
    }
  },

  ideaGenerator: {
    id: 'generation_ideas',
    name: 'Idea Generator',
    description: 'Generate creative ideas and solutions',
    prompt: (context) => `
Generate creative ideas for the following challenge.

CHALLENGE/TOPIC:
${context.challenge}

CONTEXT:
${context.context || 'Saudi Arabia government innovation'}

CONSTRAINTS:
${context.constraints?.join('\n') || 'None specified'}

NUMBER OF IDEAS: ${context.count || 5}

For each idea provide:
1. Title
2. Description
3. Implementation approach
4. Expected impact
5. Feasibility assessment

Return diverse, innovative ideas.
`,
    schema: {
      ideas: 'array',
      themes_identified: 'array',
      top_recommendation: 'object'
    }
  },

  scenarioGenerator: {
    id: 'generation_scenarios',
    name: 'Scenario Generator',
    description: 'Generate future scenarios for planning',
    prompt: (context) => `
Generate future scenarios for strategic planning.

CURRENT SITUATION:
${context.currentSituation}

PLANNING HORIZON: ${context.horizon || '5 years'}
SECTOR: ${context.sector || 'government'}
REGION: Saudi Arabia

Generate scenarios:
1. Optimistic scenario
2. Pessimistic scenario
3. Most likely scenario
4. Wild card scenario

For each scenario:
- Key assumptions
- Trigger events
- Impact areas
- Strategic implications
- Early warning indicators

Return comprehensive scenarios.
`,
    schema: {
      scenarios: 'array',
      key_uncertainties: 'array',
      strategic_implications: 'array',
      monitoring_indicators: 'array'
    }
  }
};

export const getGenerationPrompt = (type, context) => {
  const prompt = generationPrompts[type];
  if (!prompt) throw new Error(`Unknown generation prompt: ${type}`);
  return {
    prompt: prompt.prompt(context),
    schema: prompt.schema
  };
};
