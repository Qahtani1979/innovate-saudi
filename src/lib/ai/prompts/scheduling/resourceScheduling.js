/**
 * Resource Scheduling Prompts
 * AI prompts for scheduling optimization and resource allocation
 * @module prompts/scheduling/resourceScheduling
 */

export const SCHEDULE_OPTIMIZATION_PROMPT = {
  id: 'schedule_optimization',
  version: '1.0.0',
  category: 'scheduling',
  system: `You are a scheduling optimization expert.
Design efficient schedules that maximize resource utilization while respecting constraints.
Consider Saudi Arabian working hours, holidays, and cultural considerations.`,
  template: `Optimize schedule:

Resources: {{resources}}
Tasks/Activities: {{tasks}}
Constraints: {{constraints}}
Priorities: {{priorities}}
Time Horizon: {{horizon}}
Current Schedule: {{currentSchedule}}

Create optimized schedule with conflict resolution.`,
  schema: {
    type: 'object',
    properties: {
      optimizedSchedule: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            task: { type: 'string' },
            resource: { type: 'string' },
            startTime: { type: 'string' },
            endTime: { type: 'string' },
            priority: { type: 'string' }
          }
        }
      },
      resourceUtilization: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            resource: { type: 'string' },
            utilizationRate: { type: 'number' },
            availableSlots: { type: 'number' },
            overloadRisk: { type: 'string' }
          }
        }
      },
      conflicts: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            conflict: { type: 'string' },
            resolution: { type: 'string' },
            tradeoff: { type: 'string' }
          }
        }
      },
      recommendations: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            issue: { type: 'string' },
            suggestion: { type: 'string' },
            impact: { type: 'string' }
          }
        }
      },
      metrics: {
        type: 'object',
        properties: {
          overallUtilization: { type: 'number' },
          conflictsResolved: { type: 'number' },
          tasksScheduled: { type: 'number' },
          unscheduledTasks: { type: 'number' }
        }
      }
    },
    required: ['optimizedSchedule', 'resourceUtilization', 'metrics']
  }
};

export const CAPACITY_PLANNING_PROMPT = {
  id: 'capacity_planning',
  version: '1.0.0',
  category: 'scheduling',
  system: `You are a capacity planning specialist.
Forecast resource needs and identify capacity gaps.
Balance current utilization with future demand projections.`,
  template: `Plan capacity:

Current Resources: {{resources}}
Current Workload: {{workload}}
Projected Demand: {{demand}}
Growth Rate: {{growth}}
Budget Constraints: {{budget}}
Planning Horizon: {{horizon}}

Create capacity plan with recommendations.`,
  schema: {
    type: 'object',
    properties: {
      currentCapacity: {
        type: 'object',
        properties: {
          totalCapacity: { type: 'string' },
          utilizedCapacity: { type: 'string' },
          availableCapacity: { type: 'string' },
          utilizationRate: { type: 'number' }
        }
      },
      demandForecast: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            period: { type: 'string' },
            projectedDemand: { type: 'string' },
            confidence: { type: 'number' },
            assumptions: { type: 'array', items: { type: 'string' } }
          }
        }
      },
      gapAnalysis: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            period: { type: 'string' },
            capacityGap: { type: 'string' },
            riskLevel: { type: 'string' },
            impact: { type: 'string' }
          }
        }
      },
      recommendations: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            action: { type: 'string' },
            timing: { type: 'string' },
            cost: { type: 'string' },
            benefit: { type: 'string' },
            priority: { type: 'string' }
          }
        }
      },
      scenarios: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            assumptions: { type: 'array', items: { type: 'string' } },
            outcome: { type: 'string' },
            risk: { type: 'string' }
          }
        }
      }
    },
    required: ['currentCapacity', 'demandForecast', 'gapAnalysis', 'recommendations']
  }
};

export const MEETING_SCHEDULER_PROMPT = {
  id: 'meeting_scheduler',
  version: '1.0.0',
  category: 'scheduling',
  system: `You are an intelligent meeting scheduler.
Find optimal meeting times considering participant availability, preferences, and priorities.
Respect Saudi Arabian working hours and prayer times.`,
  template: `Schedule meeting:

Meeting Type: {{meetingType}}
Duration: {{duration}}
Required Participants: {{required}}
Optional Participants: {{optional}}
Availability: {{availability}}
Preferences: {{preferences}}
Urgency: {{urgency}}

Find optimal meeting slots.`,
  schema: {
    type: 'object',
    properties: {
      recommendedSlots: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            startTime: { type: 'string' },
            endTime: { type: 'string' },
            score: { type: 'number' },
            requiredAttendance: { type: 'number' },
            optionalAttendance: { type: 'number' },
            conflicts: { type: 'array', items: { type: 'string' } }
          }
        }
      },
      participantAnalysis: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            participant: { type: 'string' },
            availability: { type: 'string' },
            preferredTimes: { type: 'array', items: { type: 'string' } },
            conflicts: { type: 'array', items: { type: 'string' } }
          }
        }
      },
      alternatives: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            option: { type: 'string' },
            tradeoff: { type: 'string' },
            recommendation: { type: 'string' }
          }
        }
      }
    },
    required: ['recommendedSlots']
  }
};

export default {
  SCHEDULE_OPTIMIZATION_PROMPT,
  CAPACITY_PLANNING_PROMPT,
  MEETING_SCHEDULER_PROMPT
};
