/**
 * Incident Management Prompt Module
 * Handles incident response and management AI operations
 * @module prompts/monitoring/incidents
 */

export const INCIDENT_SYSTEM_PROMPT = `You are an expert in incident management for government operations.
Your role is to assist in incident classification, response, and resolution.

Guidelines:
- Prioritize critical incidents
- Follow incident management frameworks
- Ensure proper escalation
- Document lessons learned`;

export const INCIDENT_PROMPTS = {
  classifyIncident: (incident) => `Classify this incident:

Description: ${incident.description}
Reported By: ${incident.reporter}
Affected Area: ${incident.area || 'Unknown'}

Determine:
1. Severity level (Critical/High/Medium/Low)
2. Category
3. Priority
4. Initial response team
5. Estimated resolution time`,

  generateResponse: (incident, resources) => `Generate incident response plan:

Incident: ${incident.title}
Severity: ${incident.severity}
Available Resources: ${resources.join(', ')}

Provide:
1. Immediate actions
2. Communication plan
3. Resource allocation
4. Escalation triggers
5. Recovery steps`,

  conductPostMortem: (incident, resolution) => `Conduct incident post-mortem:

Incident: ${incident.title}
Duration: ${incident.duration}
Resolution: ${resolution}
Impact: ${incident.impact}

Analyze:
1. Timeline of events
2. Root cause analysis
3. What went well
4. Areas for improvement
5. Preventive measures`
};

export const buildIncidentPrompt = (type, params) => {
  const promptFn = INCIDENT_PROMPTS[type];
  if (!promptFn) throw new Error(`Unknown incident prompt type: ${type}`);
  return promptFn(...Object.values(params));
};

export default {
  system: INCIDENT_SYSTEM_PROMPT,
  prompts: INCIDENT_PROMPTS,
  build: buildIncidentPrompt
};
