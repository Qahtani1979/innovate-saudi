/**
 * AI Connections Suggester Prompts
 * @module profiles/connections
 */

import { getSystemPrompt } from '@/lib/saudiContext';

export const CONNECTIONS_SUGGESTER_SYSTEM_PROMPT = getSystemPrompt('profiles_connections');

export const buildConnectionsSuggesterPrompt = (currentUser, otherUsers) => `You are a professional networking AI for the Saudi Municipal Innovation Platform.

Current User Profile:
- Name: ${currentUser.full_name}
- Email: ${currentUser.email}
- Job Title: ${currentUser.job_title || 'Not specified'}
- Department: ${currentUser.department || 'Not specified'}
- Skills: ${currentUser.skills?.join(', ') || 'None listed'}
- Areas of Expertise: ${currentUser.areas_of_expertise?.join(', ') || 'None listed'}
- Role: ${currentUser.role}

Other Platform Users:
${otherUsers.slice(0, 50).map(u => `
- ${u.full_name} (${u.email})
  Job: ${u.job_title || 'N/A'}
  Dept: ${u.department || 'N/A'}
  Skills: ${u.skills?.join(', ') || 'None'}
  Expertise: ${u.areas_of_expertise?.join(', ') || 'None'}
  Teams: ${u.assigned_teams?.length || 0}
`).join('\n')}

Analyze the current user's profile and suggest 5-8 users they should connect with for collaboration opportunities.
For each suggestion, provide:
1. The user's email (for lookup)
2. Connection strength score (0-100)
3. Shared interests/skills
4. Why they should connect
5. Suggested collaboration opportunities

Prioritize users with complementary skills, shared domains, or potential for cross-functional collaboration.`;

export const CONNECTIONS_SUGGESTER_SCHEMA = {
  type: 'object',
  properties: {
    connections: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          user_email: { type: 'string' },
          connection_strength: { type: 'number' },
          shared_interests: { type: 'array', items: { type: 'string' } },
          reason: { type: 'string' },
          collaboration_opportunities: { type: 'array', items: { type: 'string' } }
        }
      }
    },
    summary: { type: 'string' }
  },
  required: ['connections']
};

export const CONNECTIONS_SUGGESTER_PROMPTS = {
  systemPrompt: CONNECTIONS_SUGGESTER_SYSTEM_PROMPT,
  buildPrompt: buildConnectionsSuggesterPrompt,
  schema: CONNECTIONS_SUGGESTER_SCHEMA
};

export default CONNECTIONS_SUGGESTER_PROMPTS;
