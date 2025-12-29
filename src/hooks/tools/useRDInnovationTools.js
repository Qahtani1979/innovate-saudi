import { useEffect } from 'react';
import { z } from 'zod';
import { useCopilotTools } from '@/contexts/CopilotToolsContext';

// R&D and Innovation Hooks
import { useRDProjectsWithVisibility } from '@/hooks/useRDProjectsWithVisibility';
import { useRDCallsWithVisibility } from '@/hooks/useRDCallsWithVisibility';
import { useRDProposalsWithVisibility } from '@/hooks/useRDProposalsWithVisibility';
import { useCitizenIdeasWithVisibility } from '@/hooks/useCitizenIdeasWithVisibility';
import { useInnovationProposalsWithVisibility } from '@/hooks/useInnovationProposalsWithVisibility';

/**
 * Domain Adapter: R&D & Citizen Innovation
 * Covers: Research Projects, Funding Calls, Citizen Ideas, Unsolicited Proposals.
 */
export function useRDInnovationTools() {
    const { registerTool } = useCopilotTools();

    // Data Sources
    const { data: rdProjects, isLoading: rdLoading } = useRDProjectsWithVisibility({ limit: 20 });
    const { data: rdCalls, isLoading: callsLoading } = useRDCallsWithVisibility({ limit: 20 });
    const { data: rdProposals, isLoading: rdProposalsLoading } = useRDProposalsWithVisibility({ limit: 20 });
    const { data: ideas, isLoading: ideasLoading } = useCitizenIdeasWithVisibility({ limit: 20 });
    const { data: proposals, isLoading: proposalsLoading } = useInnovationProposalsWithVisibility({ limit: 20 });

    useEffect(() => {
        // --- R&D Projects ---
        registerTool({
            name: 'list_rd_projects',
            description: 'List Research & Development projects.',
            schema: z.object({
                status: z.string().optional()
            }),
            safety: 'safe',
            execute: async ({ status }) => {
                if (rdLoading) return "Loading R&D projects...";
                let result = rdProjects || [];
                if (status) result = result.filter(p => p.status === status);
                return {
                    type: 'data_list',
                    entity: 'rd_project',
                    items: result.map(p => ({
                        id: p.id,
                        title: p.title,
                        researcher: p.researcher_name,
                        status: p.status
                    }))
                };
            }
        });

        // --- R&D Calls (Grants) ---
        registerTool({
            name: 'list_rd_calls',
            description: 'List active R&D funding calls.',
            schema: z.object({}),
            safety: 'safe',
            execute: async () => {
                if (callsLoading) return "Loading calls...";
                return {
                    type: 'data_list',
                    entity: 'rd_call',
                    items: (rdCalls || []).map(c => ({
                        id: c.id,
                        title: c.title,
                        deadline: c.deadline
                    }))
                };
            }
        });

        // --- Citizen Ideas ---
        registerTool({
            name: 'list_citizen_ideas',
            description: 'List ideas submitted by citizens.',
            schema: z.object({ category: z.string().optional() }),
            safety: 'safe',
            execute: async ({ category }) => {
                if (ideasLoading) return "Loading ideas...";
                let result = ideas || [];
                if (category) result = result.filter(i => i.category === category);
                return {
                    type: 'data_list',
                    entity: 'idea',
                    items: result.map(i => ({
                        id: i.id,
                        title: i.title,
                        category: i.category,
                        votes: i.vote_count
                    }))
                };
            }
        });

        // --- Innovation Proposals ---
        registerTool({
            name: 'list_innovation_proposals',
            description: 'List unsolicited innovation proposals.',
            schema: z.object({}),
            safety: 'safe',
            execute: async () => {
                if (proposalsLoading) return "Loading proposals...";
                return {
                    type: 'data_list',
                    entity: 'proposal',
                    items: (proposals || []).map(p => ({
                        id: p.id,
                        title: p.title,
                        status: p.status
                    }))
                };
            }
        });

    }, [registerTool, rdProjects, rdLoading, rdCalls, callsLoading, ideas, ideasLoading, proposals, proposalsLoading]);
}
