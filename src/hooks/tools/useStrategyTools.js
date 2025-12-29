import { useEffect } from 'react';
import { z } from 'zod';
import { useCopilotTools } from '@/contexts/CopilotToolsContext';

// Strategy Hooks
import { useStrategiesWithVisibility } from '@/hooks/useStrategiesWithVisibility';
import { usePoliciesWithVisibility } from '@/hooks/usePoliciesWithVisibility';
import { useOrganizationsWithVisibility } from '@/hooks/useOrganizationsWithVisibility';
import { useMinistriesWithVisibility } from '@/hooks/useMinistriesWithVisibility';
import { useMunicipalitiesWithVisibility } from '@/hooks/useMunicipalitiesWithVisibility';
import { useUsersWithVisibility } from '@/hooks/useUsersWithVisibility';

/**
 * Domain Adapter: Strategy & Governance
 */
export function useStrategyTools() {
    const { registerTool } = useCopilotTools();

    // Data Sources
    const { data: strategies, isLoading: strategiesLoading } = useStrategiesWithVisibility({ limit: 10 });
    const { data: policies, isLoading: policiesLoading } = usePoliciesWithVisibility({ limit: 20 });
    const { data: orgs, isLoading: orgsLoading } = useOrganizationsWithVisibility({ limit: 20 });
    const { data: ministries } = useMinistriesWithVisibility();
    const { data: municipalities } = useMunicipalitiesWithVisibility();
    const { data: users } = useUsersWithVisibility({ limit: 20 });

    useEffect(() => {
        // --- Strategies ---
        registerTool({
            name: 'list_strategies',
            description: 'List National or Sectoral Strategies.',
            schema: z.object({}),
            safety: 'safe',
            execute: async () => {
                return {
                    type: 'data_list',
                    entity: 'strategy',
                    items: (strategies || []).map(s => ({ id: s.id, title: s.title_en, level: s.level }))
                };
            }
        });

        // --- Update KPI ---
        registerTool({
            name: 'update_kpi',
            description: 'Update a Strategic KPI value.',
            schema: z.object({
                kpi_id: z.string().describe('KPI UUID'),
                value: z.number().describe('New Value'),
                comment: z.string().optional()
            }),
            safety: 'unsafe',
            execute: async (args) => {
                return {
                    type: 'confirmation_request',
                    message: `Update KPI (ID: ${args.kpi_id.substring(0, 4)}...) to ${args.value}?`,
                    payload: { action: 'update_kpi', data: args }
                };
            }
        });

        // --- Policies ---
        registerTool({
            name: 'list_policies',
            description: 'List Governance Policies.',
            schema: z.object({}),
            safety: 'safe',
            execute: async () => {
                if (policiesLoading) return "Loading policies...";
                return {
                    type: 'data_list',
                    entity: 'policy',
                    items: (policies || []).map(p => ({ id: p.id, title: p.title_en, status: p.status }))
                };
            }
        });

        // --- Organizations (Ministries/Municipalities/Cos) ---
        registerTool({
            name: 'list_organizations',
            description: 'List organizations in the ecosystem.',
            schema: z.object({ type: z.enum(['ministry', 'municipality', 'company']).optional() }),
            safety: 'safe',
            execute: async ({ type }) => {
                let items = [];
                if (type === 'ministry' || !type) items = [...items, ...(ministries || []).map(m => ({ ...m, type: 'ministry' }))];
                if (type === 'municipality' || !type) items = [...items, ...(municipalities || []).map(m => ({ ...m, type: 'municipality' }))];
                if (type === 'company' || !type) items = [...items, ...(orgs || []).map(o => ({ ...o, type: 'company' }))];

                return {
                    type: 'data_list',
                    entity: 'organization',
                    items: items.slice(0, 50).map(o => ({ id: o.id, name: o.name_en || o.name_ar, type: o.type }))
                };
            }
        });

        // --- Users (People) ---
        registerTool({
            name: 'list_users',
            description: 'Find users/experts in the system.',
            schema: z.object({ role: z.string().optional() }),
            safety: 'safe',
            execute: async ({ role }) => {
                let result = users || [];
                if (role) result = result.filter(u => u.role === role);
                return {
                    type: 'data_list',
                    entity: 'user',
                    items: result.map(u => ({ id: u.id, name: u.full_name, role: u.role }))
                };
            }
        });

    }, [registerTool, strategies, strategiesLoading, policies, policiesLoading, orgs, ministries, municipalities, users]);
}
