
import { getSystemPrompt, SAUDI_CONTEXT } from '@/lib/saudiContext';

const RESEARCHER_SYSTEM_PROMPT = getSystemPrompt('researcher_collaboration', `
You are a research collaboration specialist for Saudi Arabia's municipal innovation platform.
Your role is to recommend strategic collaborations between researchers, municipalities, and startups.
Focus on complementary expertise, shared research interests, and high-impact collaboration potential.
${SAUDI_CONTEXT.VISION_2030}
`);

export const researcherPrompts = {
    findPotentialCollaborators: {
        system: RESEARCHER_SYSTEM_PROMPT,
        prompt: (context) => `
Find potential collaborators for this researcher:

Name: ${context.name}
Research Areas: ${context.researchAreas?.join(', ') || 'N/A'}
Expertise: ${context.expertise?.join(', ') || 'N/A'}
Institution: ${context.institution || 'N/A'}

Suggest 5 researchers or institutions who would be ideal collaborators based on complementary expertise.
`,
        schema: {
            type: 'object',
            properties: {
                collaborators: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            institution: { type: 'string' },
                            expertise: { type: 'array', items: { type: 'string' } },
                            match_score: { type: 'number' },
                            collaboration_potential: { type: 'string' }
                        }
                    }
                }
            },
            required: ['collaborators']
        }
    },
    recommendFromPool: {
        system: RESEARCHER_SYSTEM_PROMPT,
        prompt: (context) => `
Recommend collaborations for this researcher:

RESEARCHER SEEKING COLLABORATION:
Name: ${context.researcher.name_en || context.researcher.full_name_en || 'Unknown'}
Institution: ${context.researcher.institution || 'Not specified'}
Research Areas: ${context.researcher.research_areas?.join(', ') || 'General'}
Expertise: ${context.researcher.expertise_keywords?.join(', ') || 'Not specified'}
Collaboration Interests: ${context.researcher.collaboration_interests?.join(', ') || 'Open to all'}
Past Collaborations: ${context.researcher.collaboration_count || 0}

POTENTIAL COLLABORATORS:
${context.potentialCollaborators?.slice(0, 15).map(c => `
- ${c.name_en || c.full_name_en}: ${c.institution || 'Unknown institution'}
  Research: ${c.research_areas?.join(', ') || 'General'}
  Expertise: ${c.expertise_keywords?.slice(0, 5).join(', ') || 'N/A'}
`).join('\n') || 'No collaborators available'}

ACTIVE R&D PROJECTS (Collaboration Opportunities):
${context.activeProjects?.slice(0, 10).map(p => `
- ${p.title_en}: ${p.research_area || 'General'} (${p.status || 'active'})
  Looking for: ${p.collaboration_needs?.join(', ') || 'Team members'}
`).join('\n') || 'No active projects'}

Recommend:
1. Top 5 researcher collaborators with match scores
2. Top 3 project collaboration opportunities
3. Suggested collaboration types
4. Potential joint research topics
`,
        schema: {
            type: "object",
            properties: {
                researcher_matches: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            collaborator_name: { type: "string" },
                            institution: { type: "string" },
                            match_score: { type: "number" },
                            complementary_expertise: { type: "array", items: { type: "string" } },
                            collaboration_reason_en: { type: "string" },
                            collaboration_reason_ar: { type: "string" },
                            suggested_topics: { type: "array", items: { type: "string" } }
                        }
                    }
                },
                project_opportunities: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            project_title: { type: "string" },
                            role_suggestion: { type: "string" },
                            fit_score: { type: "number" },
                            contribution_areas: { type: "array", items: { type: "string" } }
                        }
                    }
                },
                collaboration_types: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            type_en: { type: "string" },
                            type_ar: { type: "string" },
                            description: { type: "string" },
                            recommended: { type: "boolean" }
                        }
                    }
                },
                joint_research_topics: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            topic_en: { type: "string" },
                            topic_ar: { type: "string" },
                            impact_potential: { type: "string" },
                            relevance_to_vision2030: { type: "string" }
                        }
                    }
                }
            },
            required: ["researcher_matches", "project_opportunities", "collaboration_types", "joint_research_topics"]
        }
    }
};
