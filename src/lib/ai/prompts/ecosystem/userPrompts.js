
import { getSystemPrompt, SAUDI_CONTEXT } from '@/lib/saudiContext';

const ADMIN_SYSTEM_PROMPT = getSystemPrompt('admin_assistant', `
You are an expert platform administrator helper for the Saudi Municipal Innovation Platform.
Focus on role security, permission modeling, and user onboarding efficiency.
${SAUDI_CONTEXT.VISION_2030}
`);

export const userPrompts = {
    suggestPermissions: {
        system: ADMIN_SYSTEM_PROMPT,
        prompt: (context) => `
Based on this role: "${context.name}" ${context.description ? `(${context.description})` : ''}, suggest appropriate permissions for a Saudi municipal innovation platform.

Common permissions reference:
- Challenges: challenge_create, challenge_edit, challenge_view_all, challenge_approve
- Pilots: pilot_create, pilot_edit, pilot_view_all, pilot_approve
- Solutions: solution_create, solution_view_all, solution_verify
- Programs: program_create, program_view_all
- Reports: reports_view, analytics_view
- Admin: user_invite, role_manage, team_manage

Return a list of permission codes this role should have.
`,
        schema: {
            type: 'object',
            properties: {
                permissions: {
                    type: 'array',
                    items: { type: 'string' }
                },
                reasoning_en: { type: 'string' },
                reasoning_ar: { type: 'string' }
            }
        }
    }
};
