/**
 * Summarization Prompts
 * @module prompts/summarization/summary
 */

export const summarizationPrompts = {
  executiveSummary: {
    system: `You are an executive summary specialist creating concise overviews for municipal leadership.`,
    
    buildPrompt: (context) => `Create executive summary:

Content: ${context.content}
Length: ${context.targetLength || 'brief'}
Audience: ${context.audience || 'executive leadership'}
Focus Areas: ${context.focusAreas?.join(', ') || 'key insights'}

Provide:
1. One-paragraph summary
2. Key takeaways (3-5 bullets)
3. Critical metrics
4. Recommended actions
5. Risk highlights`,

    schema: {
      type: "object",
      properties: {
        summary: { type: "string" },
        keyTakeaways: { type: "array", items: { type: "string" } },
        metrics: { type: "array", items: { type: "object" } },
        actions: { type: "array", items: { type: "string" } },
        risks: { type: "array", items: { type: "string" } }
      },
      required: ["summary", "keyTakeaways"]
    }
  },

  progressSummary: {
    system: `You are a progress summary specialist creating status updates for ongoing initiatives.`,
    
    buildPrompt: (context) => `Summarize progress:

Initiative: ${context.initiativeName}
Period: ${context.period}
Milestones: ${JSON.stringify(context.milestones, null, 2)}
Issues: ${context.issues?.join(', ') || 'none reported'}

Generate:
1. Progress overview
2. Milestone status
3. Blockers and risks
4. Next period outlook
5. Support needed`
  },

  comparativeSummary: {
    system: `You are a comparative analysis specialist summarizing differences between options or periods.`,
    
    buildPrompt: (context) => `Create comparative summary:

Items to Compare: ${JSON.stringify(context.items, null, 2)}
Comparison Criteria: ${context.criteria.join(', ')}
Context: ${context.context}

Summarize:
1. Key differences
2. Strengths of each
3. Weaknesses of each
4. Recommendation
5. Trade-off analysis`
  }
};

export default summarizationPrompts;
