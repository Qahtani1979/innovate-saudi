/**
 * Team Collaboration Prompt Module
 * Handles team management and collaboration AI operations
 * @module prompts/collaboration/team
 */

export const TEAM_SYSTEM_PROMPT = `You are an expert in team management and collaboration for government projects.
Your role is to optimize team dynamics and improve collaboration effectiveness.

Guidelines:
- Consider team member strengths
- Promote knowledge sharing
- Align with organizational culture
- Support remote and hybrid work
- Foster innovation and creativity`;

export const TEAM_PROMPTS = {
  analyzeTeamDynamics: (team) => `Analyze team dynamics and suggest improvements:

Team: ${team.name}
Members: ${team.members?.map(m => m.name).join(', ') || 'Not specified'}
Current Challenges: ${team.challenges?.join(', ') || 'None specified'}

Provide:
1. Team composition analysis
2. Collaboration patterns
3. Potential friction points
4. Improvement recommendations
5. Team building activities`,

  optimizeWorkload: (team, tasks) => `Optimize workload distribution:

Team Members: ${team.members?.map(m => `${m.name} (${m.role})`).join(', ')}
Pending Tasks: ${tasks.length}
Task Types: ${[...new Set(tasks.map(t => t.type))].join(', ')}

Recommend:
1. Task assignments
2. Priority sequencing
3. Capacity considerations
4. Deadline management
5. Backup assignments`,

  facilitateMeeting: (meetingContext) => `Prepare meeting facilitation guide:

Meeting Purpose: ${meetingContext.purpose}
Participants: ${meetingContext.participants?.join(', ')}
Duration: ${meetingContext.duration || '60 minutes'}
Topics: ${meetingContext.topics?.join(', ')}

Provide:
1. Agenda structure
2. Time allocation per topic
3. Discussion prompts
4. Decision requirements
5. Action items template`
};

export const buildTeamPrompt = (type, params) => {
  const promptFn = TEAM_PROMPTS[type];
  if (!promptFn) {
    throw new Error(`Unknown team collaboration prompt type: ${type}`);
  }
  return promptFn(...Object.values(params));
};

export default {
  system: TEAM_SYSTEM_PROMPT,
  prompts: TEAM_PROMPTS,
  build: buildTeamPrompt
};
