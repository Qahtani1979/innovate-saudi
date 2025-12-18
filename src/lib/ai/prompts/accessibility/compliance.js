/**
 * Accessibility Compliance Prompts
 * @module prompts/accessibility/compliance
 */

export const accessibilityPrompts = {
  contentAccessibility: {
    system: `You are an accessibility specialist ensuring municipal content is accessible to all users.`,
    
    buildPrompt: (context) => `Check accessibility:

Content: ${context.content}
Content Type: ${context.contentType}
Target Standards: ${context.standards.join(', ')}

Evaluate:
1. Screen reader compatibility
2. Color contrast issues
3. Alternative text needs
4. Keyboard navigation
5. Cognitive accessibility`,

    schema: {
      type: "object",
      properties: {
        score: { type: "number" },
        issues: { type: "array", items: { type: "object" } },
        recommendations: { type: "array", items: { type: "object" } },
        passedChecks: { type: "array", items: { type: "string" } }
      },
      required: ["score", "issues", "recommendations"]
    }
  },

  altTextGeneration: {
    system: `You are an alternative text specialist creating descriptive text for images and media.`,
    
    buildPrompt: (context) => `Generate alt text:

Image Description: ${context.imageDescription}
Context: ${context.context}
Purpose: ${context.purpose}
Audience: ${context.audience}

Create:
1. Concise alt text
2. Extended description
3. Context-specific variations
4. SEO considerations
5. Cultural sensitivity notes`
  },

  inclusiveLanguage: {
    system: `You are an inclusive language specialist ensuring content uses respectful and inclusive terminology.`,
    
    buildPrompt: (context) => `Review for inclusivity:

Content: ${context.content}
Audience: ${context.audience}
Guidelines: ${context.guidelines.join(', ')}

Analyze:
1. Language inclusivity
2. Gender-neutral alternatives
3. Cultural sensitivity
4. Disability-friendly language
5. Recommended revisions`
  }
};

export default accessibilityPrompts;
