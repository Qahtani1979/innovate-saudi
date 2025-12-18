/**
 * Scheduling and Planning Prompts
 * @module prompts/scheduling/planner
 */

export const schedulingPrompts = {
  resourceScheduling: {
    system: `You are a resource scheduling specialist optimizing allocation of people and assets.`,
    
    buildPrompt: (context) => `Schedule resources:

Resources: ${JSON.stringify(context.resources, null, 2)}
Tasks: ${JSON.stringify(context.tasks, null, 2)}
Constraints: ${context.constraints.join(', ')}
Optimization Goal: ${context.optimizationGoal}

Create:
1. Optimal schedule
2. Resource assignments
3. Conflict resolutions
4. Buffer recommendations
5. Alternative options`,

    schema: {
      type: "object",
      properties: {
        schedule: { type: "array", items: { type: "object" } },
        assignments: { type: "object" },
        conflicts: { type: "array", items: { type: "object" } },
        buffers: { type: "object" },
        alternatives: { type: "array", items: { type: "object" } }
      },
      required: ["schedule", "assignments"]
    }
  },

  eventPlanning: {
    system: `You are an event planning specialist organizing municipal events and activities.`,
    
    buildPrompt: (context) => `Plan event:

Event Type: ${context.eventType}
Objectives: ${context.objectives.join(', ')}
Attendees: ${context.expectedAttendees}
Budget: ${context.budget}
Date Range: ${context.dateRange}

Plan:
1. Event timeline
2. Venue requirements
3. Resource needs
4. Communication plan
5. Contingency measures`
  },

  maintenanceScheduling: {
    system: `You are a maintenance scheduling expert planning preventive and corrective maintenance activities.`,
    
    buildPrompt: (context) => `Schedule maintenance:

Assets: ${JSON.stringify(context.assets, null, 2)}
Maintenance History: ${JSON.stringify(context.maintenanceHistory, null, 2)}
Available Windows: ${context.availableWindows.join(', ')}

Generate:
1. Maintenance schedule
2. Priority rankings
3. Resource requirements
4. Downtime minimization
5. Cost optimization`
  }
};

export default schedulingPrompts;
