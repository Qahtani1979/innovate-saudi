/**
 * Workspace Analysis AI Prompts
 * @module prompts/collaboration/workspaceAnalysis
 * @version 1.0.0
 */

import { SAUDI_CONTEXT } from '@/lib/saudiContext';

/**
 * Workspace health analysis prompt template
 */
export const WORKSPACE_HEALTH_PROMPT_TEMPLATE = (workspace) => `
Analyze this workspace's health and collaboration effectiveness:

Workspace: ${workspace.name}
Members: ${workspace.memberCount || 0}
Projects: ${workspace.projectCount || 0}
Activity Level: ${workspace.activityLevel || 'unknown'}

${SAUDI_CONTEXT}

Provide:
1. Collaboration Health Score (0-100)
2. Key Strengths (3-5 points)
3. Areas for Improvement (3-5 points)
4. Recommended Actions
5. Team Dynamics Assessment
`;

/**
 * Workspace optimization suggestions prompt
 */
export const WORKSPACE_OPTIMIZATION_PROMPT_TEMPLATE = (metrics) => `
Suggest optimizations for workspace collaboration:

Current Metrics:
- Response Time: ${metrics.avgResponseTime || 'N/A'}
- Task Completion Rate: ${metrics.completionRate || 'N/A'}%
- Member Engagement: ${metrics.engagementScore || 'N/A'}
- Cross-team Collaboration: ${metrics.crossTeamScore || 'N/A'}

${SAUDI_CONTEXT}

Recommend:
1. Process Improvements
2. Communication Enhancements
3. Tool Utilization Tips
4. Team Building Activities
5. KPI Tracking Suggestions
`;

export const WORKSPACE_ANALYSIS_SYSTEM_PROMPT = `You are a workspace collaboration analyst specializing in Saudi Arabian organizational dynamics. Analyze team effectiveness and provide actionable recommendations aligned with Vision 2030 collaboration goals.`;

export const WORKSPACE_ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    healthScore: { type: "number" },
    strengths: { type: "array", items: { type: "string" } },
    improvements: { type: "array", items: { type: "string" } },
    recommendations: { type: "array", items: { type: "string" } },
    teamDynamics: { type: "string" }
  },
  required: ["healthScore", "strengths", "improvements"]
};
