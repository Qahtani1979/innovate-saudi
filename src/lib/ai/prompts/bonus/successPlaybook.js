/**
 * Success Playbook Generator Prompt
 * Used by: SuccessPlaybookGenerator.jsx
 */
import { SAUDI_CONTEXT, LANGUAGE_REQUIREMENTS } from '@/lib/saudiContext';

export const buildSuccessPlaybookPrompt = (pilot, similarPilots) => {
  const kpiSummary = pilot.kpis?.map(k => `${k.name}: ${k.current}/${k.target}`).join(', ') || 'N/A';
  const lessonsLearned = pilot.lessons_learned?.map(l => l.lesson).join('; ') || 'N/A';
  const similarPilotsSummary = similarPilots.slice(0, 3).map(p => 
    `${p.title_en} - ${p.success_criteria?.filter(sc => sc.met).length}/${p.success_criteria?.length} criteria met`
  ).join(', ') || 'None available';

  return `${SAUDI_CONTEXT.COMPACT}

You are generating a success playbook for scaling a pilot project in Saudi municipal innovation.

## PILOT DETAILS

### Basic Information
- Title: ${pilot.title_en}
- Sector: ${pilot.sector}

### Success Metrics
${kpiSummary}

### Lessons Learned
${lessonsLearned}

### Similar Successful Pilots
${similarPilotsSummary}

${LANGUAGE_REQUIREMENTS.BILINGUAL}

## PLAYBOOK REQUIREMENTS
Create a comprehensive replication playbook including:
1. Critical Success Factors (5-7 key elements)
2. Prerequisites & Requirements
3. Step-by-Step Implementation Guide (8-10 steps with duration and deliverables)
4. Common Pitfalls & How to Avoid
5. Resource Requirements (team, budget, timeline)
6. KPIs for Monitoring
7. Adaptation Guidelines for Different Contexts

Make it actionable and specific to Saudi municipal context.`;
};

export const successPlaybookSchema = {
  type: 'object',
  required: ['title', 'success_factors', 'implementation_steps'],
  properties: {
    title: { type: 'string' },
    summary: { type: 'string' },
    success_factors: { type: 'array', items: { type: 'string' } },
    prerequisites: { type: 'array', items: { type: 'string' } },
    implementation_steps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          step: { type: 'string' },
          duration: { type: 'string' },
          deliverables: { type: 'array', items: { type: 'string' } }
        }
      }
    },
    pitfalls: { type: 'array', items: { type: 'string' } },
    resource_requirements: {
      type: 'object',
      properties: {
        team_size: { type: 'string' },
        budget_range: { type: 'string' },
        timeline: { type: 'string' }
      }
    },
    monitoring_kpis: { type: 'array', items: { type: 'string' } },
    adaptation_tips: { type: 'array', items: { type: 'string' } }
  }
};

export const SUCCESS_PLAYBOOK_SYSTEM_PROMPT = `You are a pilot replication specialist for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH). You create comprehensive success playbooks that enable other municipalities to replicate successful innovation pilots.`;
