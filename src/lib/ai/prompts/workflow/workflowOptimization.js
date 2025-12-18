/**
 * Workflow Automation AI Prompts
 * Centralized prompts for workflow analysis and optimization
 * @module workflow/workflowOptimization
 */

export const WORKFLOW_OPTIMIZATION_SYSTEM_PROMPT = `You are an expert workflow analyst for Saudi Arabian government processes.

OPTIMIZATION FRAMEWORK:
1. Process Analysis
   - Step identification
   - Bottleneck detection
   - Redundancy elimination
   - Handoff optimization

2. Automation Assessment
   - Automation potential
   - Technology requirements
   - Integration needs
   - ROI projection

3. Efficiency Metrics
   - Cycle time analysis
   - Resource utilization
   - Error rate tracking
   - Throughput measurement

4. Improvement Plan
   - Quick wins
   - Long-term improvements
   - Technology enablers
   - Change management

CONTEXT:
- Saudi government digital transformation
- Vision 2030 efficiency goals
- Arabic/English bilingual support`;

export const WORKFLOW_OPTIMIZATION_SCHEMA = {
  type: "object",
  properties: {
    efficiency_score: { type: "number" },
    automation_potential: { type: "number" },
    current_state: {
      type: "object",
      properties: {
        total_steps: { type: "number" },
        manual_steps: { type: "number" },
        automated_steps: { type: "number" },
        avg_cycle_time: { type: "string" },
        bottlenecks: { type: "array", items: { type: "string" } }
      }
    },
    optimization_opportunities: {
      type: "array",
      items: {
        type: "object",
        properties: {
          area: { type: "string" },
          opportunity: { type: "string" },
          impact: { type: "string" },
          effort: { type: "string" },
          priority: { type: "string" }
        }
      }
    },
    automation_recommendations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          step: { type: "string" },
          automation_type: { type: "string" },
          technology: { type: "string" },
          roi_estimate: { type: "string" }
        }
      }
    },
    action_plan: { type: "array", items: { type: "string" } }
  },
  required: ["efficiency_score", "automation_potential", "current_state"]
};

export const buildWorkflowOptimizationPrompt = (workflowData, language = 'en') => {
  const langInstruction = language === 'ar' ? 'Respond in Arabic.' : 'Respond in English.';

  return `${langInstruction}

Optimize workflow:

WORKFLOW: ${workflowData.name || 'Not specified'}
TYPE: ${workflowData.type || 'Business Process'}
DEPARTMENT: ${workflowData.department || 'Not specified'}

CURRENT STEPS:
${workflowData.steps?.map((s, i) => `${i + 1}. ${s.name} (${s.type}) - ${s.duration}`).join('\n') || 'Not specified'}

CURRENT METRICS:
- Avg Cycle Time: ${workflowData.avgCycleTime || 'N/A'}
- Error Rate: ${workflowData.errorRate || 'N/A'}%
- Throughput: ${workflowData.throughput || 'N/A'}/day

PAIN POINTS:
${workflowData.painPoints?.map(p => `- ${p}`).join('\n') || 'None identified'}

Provide comprehensive workflow optimization with automation recommendations.`;
};

export const WORKFLOW_OPTIMIZATION_PROMPTS = {
  system: WORKFLOW_OPTIMIZATION_SYSTEM_PROMPT,
  schema: WORKFLOW_OPTIMIZATION_SCHEMA,
  buildPrompt: buildWorkflowOptimizationPrompt
};

export default WORKFLOW_OPTIMIZATION_PROMPTS;
