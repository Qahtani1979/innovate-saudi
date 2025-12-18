/**
 * Timeline Planning Prompts
 * @module prompts/timeline/planner
 */

export const timelinePlanningPrompts = {
  projectTimeline: {
    system: `You are a project timeline expert creating realistic and achievable schedules for municipal initiatives.`,
    
    buildPrompt: (context) => `Create project timeline:

Project: ${context.projectName}
Objectives: ${context.objectives.join(', ')}
Resources: ${JSON.stringify(context.resources, null, 2)}
Dependencies: ${JSON.stringify(context.dependencies, null, 2)}
Constraints: ${context.constraints}

Generate:
1. Phase breakdown with durations
2. Key milestones
3. Critical path identification
4. Resource scheduling
5. Buffer recommendations`,

    schema: {
      type: "object",
      properties: {
        phases: { type: "array", items: { type: "object" } },
        milestones: { type: "array", items: { type: "object" } },
        criticalPath: { type: "array", items: { type: "string" } },
        resourceSchedule: { type: "object" },
        totalDuration: { type: "string" }
      },
      required: ["phases", "milestones", "totalDuration"]
    }
  },

  scheduleOptimization: {
    system: `You are a schedule optimization specialist helping compress timelines while maintaining quality.`,
    
    buildPrompt: (context) => `Optimize project schedule:

Current Schedule: ${JSON.stringify(context.currentSchedule, null, 2)}
Target Completion: ${context.targetDate}
Compression Options: ${context.options.join(', ')}

Analyze:
1. Fast-track opportunities
2. Crash schedule options
3. Resource leveling alternatives
4. Risk impact assessment
5. Recommended approach`
  },

  milestoneTracking: {
    system: `You are a milestone tracking expert monitoring progress and predicting outcomes.`,
    
    buildPrompt: (context) => `Analyze milestone progress:

Milestones: ${JSON.stringify(context.milestones, null, 2)}
Current Progress: ${JSON.stringify(context.progress, null, 2)}
Issues: ${context.issues.join(', ')}

Provide:
1. Progress assessment
2. Delay predictions
3. Recovery recommendations
4. Risk mitigation strategies
5. Stakeholder communication points`
  }
};

export default timelinePlanningPrompts;
