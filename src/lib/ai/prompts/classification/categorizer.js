/**
 * Classification Prompts - Categorization and labeling
 * @module prompts/classification
 */

export const classificationPrompts = {
  contentClassifier: {
    id: 'classification_content',
    name: 'Content Classifier',
    description: 'Classify content into categories',
    prompt: (context) => `
Classify this content into appropriate categories.

CONTENT:
${context.content}

AVAILABLE CATEGORIES:
${context.categories.join('\n')}

CLASSIFICATION RULES:
- Select most appropriate category
- Provide confidence score
- Suggest secondary categories if applicable
- Explain classification reasoning

Return classification with confidence.
`,
    schema: {
      primary_category: 'string',
      confidence: 'number',
      secondary_categories: 'array',
      reasoning: 'string',
      tags: 'array'
    }
  },

  sentimentClassifier: {
    id: 'classification_sentiment',
    name: 'Sentiment Classifier',
    description: 'Analyze sentiment of text',
    prompt: (context) => `
Analyze the sentiment of this text.

TEXT:
${context.text}

CONTEXT: ${context.context || 'general feedback'}

Analyze:
1. Overall sentiment (positive/negative/neutral)
2. Sentiment score (-1 to 1)
3. Emotional tones present
4. Key phrases driving sentiment
5. Aspect-based sentiment if applicable

Return comprehensive sentiment analysis.
`,
    schema: {
      overall_sentiment: 'string',
      sentiment_score: 'number',
      emotional_tones: 'array',
      key_phrases: 'array',
      aspect_sentiments: 'object'
    }
  },

  priorityClassifier: {
    id: 'classification_priority',
    name: 'Priority Classifier',
    description: 'Classify items by priority',
    prompt: (context) => `
Classify these items by priority level.

ITEMS:
${context.items.map((item, i) => `${i + 1}. ${JSON.stringify(item)}`).join('\n')}

PRIORITIZATION CRITERIA:
${context.criteria?.join('\n') || '- Impact\n- Urgency\n- Effort required\n- Dependencies'}

For each item:
1. Assign priority (critical/high/medium/low)
2. Provide priority score
3. Explain reasoning
4. Identify dependencies

Return prioritized list with rationale.
`,
    schema: {
      prioritized_items: 'array',
      priority_distribution: 'object',
      dependencies_map: 'object',
      recommendation: 'string'
    }
  }
};

export const getClassificationPrompt = (type, context) => {
  const prompt = classificationPrompts[type];
  if (!prompt) throw new Error(`Unknown classification prompt: ${type}`);
  return {
    prompt: prompt.prompt(context),
    schema: prompt.schema
  };
};
