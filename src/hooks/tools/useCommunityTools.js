import { useEffect } from 'react';
import { z } from 'zod';
import { useCopilotTools } from '@/contexts/CopilotToolsContext';

// Community Hooks
import { useLivingLabsWithVisibility } from '@/hooks/useLivingLabsWithVisibility';
import { useSandboxesWithVisibility } from '@/hooks/useSandboxesWithVisibility';
import { useEventsWithVisibility } from '@/hooks/useEventsWithVisibility';
import { useKnowledgeWithVisibility } from '@/hooks/useKnowledgeWithVisibility';
import { useCaseStudiesWithVisibility } from '@/hooks/useCaseStudiesWithVisibility';
import { usePartnershipsWithVisibility } from '@/hooks/usePartnershipsWithVisibility';

/**
 * Domain Adapter: Community & Ecosystem
 */
export function useCommunityTools() {
    const { registerTool } = useCopilotTools();

    // Data Sources
    const { data: labs, isLoading: labsLoading } = useLivingLabsWithVisibility({ limit: 20 });
    const { data: sandboxes, isLoading: sandboxesLoading } = useSandboxesWithVisibility({ limit: 20 });
    const { data: events, isLoading: eventsLoading } = useEventsWithVisibility({ limit: 20 });
    const { data: articles, isLoading: articlesLoading } = useKnowledgeWithVisibility({ limit: 20 });
    const { data: cases, isLoading: casesLoading } = useCaseStudiesWithVisibility({ limit: 20 });
    const { data: partnerships, isLoading: partnershipsLoading } = usePartnershipsWithVisibility({ limit: 20 });

    // Note: Some hooks return { data } or just the array depending on implementation age. 
    // We assume the standard pattern (object with data property) for *WithVisibility hooks as seen in Programs.

    useEffect(() => {
        // --- Living Labs ---
        registerTool({
            name: 'list_living_labs',
            description: 'List available Living Labs for testing and validation.',
            schema: z.object({}),
            safety: 'safe',
            execute: async () => {
                if (labsLoading) return "Loading labs...";
                return {
                    type: 'data_list',
                    entity: 'living_lab',
                    items: (labs || []).map(l => ({ id: l.id, name: l.name_en, status: l.status }))
                };
            }
        });

        // --- Submit Idea ---
        registerTool({
            name: 'submit_idea',
            description: 'Submit an innovation idea.',
            schema: z.object({
                title: z.string().describe('Idea Title'),
                description: z.string(),
                category: z.string().optional()
            }),
            safety: 'unsafe',
            execute: async (args) => {
                return {
                    type: 'confirmation_request',
                    message: `Ready to submit your idea: "${args.title}"?`,
                    payload: { action: 'submit_idea', data: args }
                };
            }
        });

        // --- Sandboxes ---
        registerTool({
            name: 'list_sandboxes',
            description: 'List Regulatory Sandboxes.',
            schema: z.object({}),
            safety: 'safe',
            execute: async () => {
                if (sandboxesLoading) return "Loading sandboxes...";
                return {
                    type: 'data_list',
                    entity: 'sandbox',
                    items: (sandboxes || []).map(s => ({ id: s.id, name: s.title_en, status: s.status }))
                };
            }
        });

        // --- Events ---
        registerTool({
            name: 'list_events',
            description: 'List upcoming ecosystem events and workshops.',
            schema: z.object({}),
            safety: 'safe',
            execute: async () => {
                if (eventsLoading) return "Loading events...";
                return {
                    type: 'data_list',
                    entity: 'event',
                    items: (events || []).map(e => ({ id: e.id, title: e.title_en, date: e.start_date }))
                };
            }
        });

        // --- Knowledge ---
        registerTool({
            name: 'search_knowledge',
            description: 'Search the Knowledge Base (News, Articles).',
            schema: z.object({ query: z.string().optional() }),
            safety: 'safe',
            execute: async ({ query }) => {
                if (articlesLoading) return "Loading articles...";
                let result = articles || [];
                if (query) result = result.filter(a => a.title?.toLowerCase().includes(query.toLowerCase()));
                return {
                    type: 'data_list',
                    entity: 'article',
                    items: result.map(a => ({ id: a.id, title: a.title, type: a.type }))
                };
            }
        });

        // --- Case Studies ---
        registerTool({
            name: 'list_case_studies',
            description: 'List innovation case studies.',
            schema: z.object({}),
            safety: 'safe',
            execute: async () => {
                if (casesLoading) return "Loading cases...";
                return {
                    type: 'data_list',
                    entity: 'case_study',
                    items: (cases || []).map(c => ({ id: c.id, title: c.title, outcomes: c.outcomes }))
                };
            }
        });

        // --- Partnerships ---
        registerTool({
            name: 'list_partnerships',
            description: 'List strategic partnerships.',
            schema: z.object({}),
            safety: 'safe',
            execute: async () => {
                if (partnershipsLoading) return "Loading partnerships...";
                return {
                    type: 'data_list',
                    entity: 'partnership',
                    items: (partnerships || []).map(p => ({ id: p.id, partner: p.partner_name, type: p.type }))
                };
            }
        });

    }, [registerTool, labs, labsLoading, sandboxes, sandboxesLoading, events, eventsLoading, articles, articlesLoading, cases, casesLoading, partnerships, partnershipsLoading]);
}
