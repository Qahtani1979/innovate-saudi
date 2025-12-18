/**
 * Resource Allocation AI Prompts
 * Centralized prompts for resource planning and allocation
 * @module resources/resourceAllocation
 */

export const RESOURCE_ALLOCATION_SYSTEM_PROMPT = `You are an expert resource management advisor for Saudi Arabian government initiatives.

ALLOCATION FRAMEWORK:
1. Capacity Analysis
   - Current utilization
   - Available capacity
   - Skill mapping
   - Constraint identification

2. Demand Assessment
   - Project requirements
   - Priority ranking
   - Timeline analysis
   - Dependency mapping

3. Optimization Strategy
   - Allocation efficiency
   - Load balancing
   - Skill matching
   - Cost optimization

4. Forecasting
   - Future demand
   - Gap prediction
   - Hiring needs
   - Training requirements

CONTEXT:
- Saudi workforce regulations
- Vision 2030 human capital goals
- Arabic/English bilingual support`;

export const RESOURCE_ALLOCATION_SCHEMA = {
  type: "object",
  properties: {
    allocation_efficiency: { type: "number" },
    utilization_rate: { type: "number" },
    current_allocation: {
      type: "array",
      items: {
        type: "object",
        properties: {
          resource: { type: "string" },
          project: { type: "string" },
          allocation_percentage: { type: "number" },
          status: { type: "string" }
        }
      }
    },
    optimization_suggestions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          suggestion: { type: "string" },
          impact: { type: "string" },
          effort: { type: "string" }
        }
      }
    },
    gaps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          skill: { type: "string" },
          gap_size: { type: "string" },
          recommendation: { type: "string" }
        }
      }
    },
    forecast: {
      type: "object",
      properties: {
        next_quarter_demand: { type: "string" },
        hiring_needs: { type: "number" },
        training_needs: { type: "array", items: { type: "string" } }
      }
    }
  },
  required: ["allocation_efficiency", "utilization_rate", "current_allocation"]
};

export const buildResourceAllocationPrompt = (resourceData, language = 'en') => {
  const langInstruction = language === 'ar' ? 'Respond in Arabic.' : 'Respond in English.';

  return `${langInstruction}

Optimize resource allocation:

DEPARTMENT: ${resourceData.department || 'Not specified'}
TEAM SIZE: ${resourceData.teamSize || 0}

CURRENT PROJECTS:
${resourceData.projects?.map(p => `- ${p.name}: ${p.required} resources needed`).join('\n') || 'Not specified'}

AVAILABLE RESOURCES:
${resourceData.resources?.map(r => `- ${r.name} (${r.skills?.join(', ')}): ${r.availability}%`).join('\n') || 'Not specified'}

CONSTRAINTS:
${resourceData.constraints?.map(c => `- ${c}`).join('\n') || 'None specified'}

Provide optimized allocation with gap analysis.`;
};

export const RESOURCE_ALLOCATION_PROMPTS = {
  system: RESOURCE_ALLOCATION_SYSTEM_PROMPT,
  schema: RESOURCE_ALLOCATION_SCHEMA,
  buildPrompt: buildResourceAllocationPrompt
};

export default RESOURCE_ALLOCATION_PROMPTS;
