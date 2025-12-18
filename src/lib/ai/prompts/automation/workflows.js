/**
 * Automation and Workflow Prompts
 * @module prompts/automation/workflows
 */

export const automationPrompts = {
  processAutomation: {
    system: `You are a process automation specialist identifying opportunities to automate municipal workflows.`,
    
    buildPrompt: (context) => `Identify automation opportunities:

Process: ${context.processName}
Current Steps: ${JSON.stringify(context.currentSteps, null, 2)}
Pain Points: ${context.painPoints.join(', ')}
Available Tools: ${context.availableTools.join(', ')}

Recommend:
1. Automation candidates
2. Expected efficiency gains
3. Implementation complexity
4. Technology requirements
5. Phased rollout plan`,

    schema: {
      type: "object",
      properties: {
        candidates: { type: "array", items: { type: "object" } },
        efficiencyGains: { type: "object" },
        complexity: { type: "string" },
        requirements: { type: "array", items: { type: "string" } },
        rolloutPlan: { type: "array", items: { type: "object" } }
      },
      required: ["candidates", "efficiencyGains", "rolloutPlan"]
    }
  },

  workflowOptimization: {
    system: `You are a workflow optimization expert streamlining business processes for maximum efficiency.`,
    
    buildPrompt: (context) => `Optimize workflow:

Workflow: ${context.workflowName}
Current Flow: ${JSON.stringify(context.currentFlow, null, 2)}
Bottlenecks: ${context.bottlenecks.join(', ')}
Goals: ${context.goals.join(', ')}

Provide:
1. Optimized workflow design
2. Eliminated redundancies
3. Parallel processing opportunities
4. Approval streamlining
5. Implementation roadmap`
  },

  triggerDesign: {
    system: `You are an automation trigger designer creating intelligent event-driven workflows.`,
    
    buildPrompt: (context) => `Design automation triggers:

Use Case: ${context.useCase}
Events Available: ${context.events.join(', ')}
Actions Required: ${context.actions.join(', ')}
Conditions: ${context.conditions.join(', ')}

Design:
1. Trigger conditions
2. Action sequences
3. Exception handling
4. Notification rules
5. Monitoring approach`
  }
};

export default automationPrompts;
