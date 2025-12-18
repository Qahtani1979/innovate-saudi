/**
 * Template Generation Prompts
 * @module prompts/templates/generator
 */

export const templatePrompts = {
  documentTemplate: {
    system: `You are a template generation specialist creating reusable document templates for municipal use.`,
    
    buildPrompt: (context) => `Generate document template:

Document Type: ${context.documentType}
Purpose: ${context.purpose}
Required Sections: ${context.requiredSections.join(', ')}
Placeholders Needed: ${context.placeholders.join(', ')}

Create:
1. Template structure
2. Section guidelines
3. Placeholder definitions
4. Example content
5. Customization options`,

    schema: {
      type: "object",
      properties: {
        template: { type: "string" },
        sections: { type: "array", items: { type: "object" } },
        placeholders: { type: "array", items: { type: "object" } },
        examples: { type: "object" },
        customizationGuide: { type: "string" }
      },
      required: ["template", "sections", "placeholders"]
    }
  },

  emailTemplate: {
    system: `You are an email template specialist creating professional communication templates.`,
    
    buildPrompt: (context) => `Generate email template:

Email Type: ${context.emailType}
Tone: ${context.tone}
Key Message: ${context.keyMessage}
Call to Action: ${context.callToAction}

Create:
1. Subject line options
2. Email body template
3. Personalization points
4. Follow-up triggers
5. A/B test variants`
  },

  formTemplate: {
    system: `You are a form template specialist designing data collection forms.`,
    
    buildPrompt: (context) => `Generate form template:

Form Purpose: ${context.purpose}
Data to Collect: ${context.dataFields.join(', ')}
User Type: ${context.userType}
Validation Rules: ${context.validationRules?.join(', ') || 'standard'}

Design:
1. Form structure
2. Field definitions
3. Validation logic
4. User guidance text
5. Submission workflow`
  }
};

export default templatePrompts;
