import { useEffect, useRef } from 'react';
import { z } from 'zod';
import { useCopilotTools } from '@/contexts/CopilotToolsContext';
import { useAuth } from '@/lib/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';

// Operations Hooks
import { useTasks } from '@/hooks/useTasks';
import { useApprovals } from '@/hooks/useApprovals';
import { useContractsWithVisibility } from '@/hooks/useContractsWithVisibility';
import { useRisksWithVisibility } from '@/hooks/useRisksWithVisibility';
import { useBudgetsWithVisibility } from '@/hooks/useBudgetsWithVisibility';
import { useTeamsWithVisibility } from '@/hooks/useTeamsWithVisibility';
import { useProposalsWithVisibility } from '@/hooks/useProposalsWithVisibility';
import { useAuditLogs } from '@/hooks/useAuditLogs'; // Import

/**
 * Domain Adapter: Operations & Workflow
 * Consolidates Tasks, Approvals, Contracts, Risks.
 */
export function useOperationsTools() {
    const { registerTool } = useCopilotTools();
    const { user } = useAuth();
    const { isAdmin } = usePermissions();

    // ... (Tasks, Approvals)
    const { data: auditLogs } = useAuditLogs({ limit: 10 }); // New Data

    // 1. Tasks
    const { useUserTasks, useCreateTask } = useTasks({ user, isAdmin });
    const { data: tasks, isLoading: tasksLoading } = useUserTasks();
    const createTaskMutation = useCreateTask();

    // 0. System Actions
    // --- Tool: Send Notification ---
    useEffect(() => {
        const unregisterNotify = registerTool({
            name: 'send_notification',
            description: 'Send a system notification to a user.',
            schema: z.object({
                user_id: z.string().describe('Target User UUID'),
                message: z.string(),
                type: z.enum(['info', 'warning', 'alert']).default('info')
            }),
            safety: 'unsafe',
            execute: async (args) => {
                return {
                    type: 'confirmation_request',
                    message: `Send ${args.type} notification to user?`,
                    payload: { action: 'send_notification', data: args }
                };
            }
        });
        return () => unregisterNotify();
    }, [registerTool]);

    // 2. Approvals
    const { challenges, pilots, approveMutation } = useApprovals(user?.email);

    // 3. Contracts
    const { data: contracts, isLoading: contractsLoading } = useContractsWithVisibility({ limit: 20 });

    // 4. Risks
    const { data: risks, isLoading: risksLoading } = useRisksWithVisibility({ limit: 20 });

    // 5. Budgets
    const { data: budgets, isLoading: budgetsLoading } = useBudgetsWithVisibility({ limit: 20 });

    // 6. Teams
    const { data: teams, isLoading: teamsLoading } = useTeamsWithVisibility({ limit: 20 });

    // 7. Proposals (Challenge Responses)
    const { data: proposals, isLoading: proposalsLoading } = useProposalsWithVisibility({ limit: 20 });


    // --- Refs for Dynamic Data (Prevent Infinite Loops) ---
    const tasksRef = useRef(tasks);
    const challengesRef = useRef(challenges);
    const pilotsRef = useRef(pilots);
    const contractsRef = useRef(contracts);
    const risksRef = useRef(risks);
    const budgetsRef = useRef(budgets);
    const teamsRef = useRef(teams);
    const proposalsRef = useRef(proposals);
    const auditLogsRef = useRef(auditLogs);

    useEffect(() => {
        tasksRef.current = tasks;
        challengesRef.current = challenges;
        pilotsRef.current = pilots;
        contractsRef.current = contracts;
        risksRef.current = risks;
        budgetsRef.current = budgets;
        teamsRef.current = teams;
        proposalsRef.current = proposals;
        auditLogsRef.current = auditLogs;
    }, [tasks, challenges, pilots, contracts, risks, budgets, teams, proposals, auditLogs]);


    useEffect(() => {
        // --- Tool: List My Tasks ---
        const unregisterTasks = registerTool({
            name: 'list_my_tasks',
            description: 'List tasks assigned to me or created by me.',
            schema: z.object({
                status: z.string().optional()
            }),
            safety: 'safe',
            execute: async ({ status }) => {
                if (tasksLoading) return "Loading tasks..."; // Note: Accessing loading state directly is fine if it doesn't cause cycle, but better ref it too? Usually loading toggles rarely.
                let result = tasksRef.current || [];
                if (status) result = result.filter(t => t.status === status);
                return {
                    type: 'data_list',
                    entity: 'task',
                    items: result.map(t => ({
                        id: t.id,
                        title: t.title,
                        status: t.status,
                        priority: t.priority,
                        due_date: t.due_date
                    }))
                };
            }
        });

        // --- Tool: Create Task (Micro) ---
        const unregisterTaskCreate = registerTool({
            name: 'create_task',
            description: 'Create a simple task for myself or another user.',
            schema: z.object({
                title: z.string().describe("Task Title"),
                description: z.string().optional(),
                priority: z.enum(['low', 'medium', 'high']).default('medium'),
                due_date: z.string().optional().describe("ISO Date String")
            }),
            safety: 'unsafe',
            execute: async (args) => {
                return await createTaskMutation.mutateAsync({
                    ...args,
                    status: 'pending'
                });
            }
        });

        // --- Tool: List Pending Approvals ---
        const unregisterApprovals = registerTool({
            name: 'list_pending_approvals',
            description: 'List all items (Challenges, Pilots) waiting for my approval.',
            schema: z.object({}),
            safety: 'safe',
            execute: async () => {
                // Access nested .data if structure is { data: [...] }
                const challengeData = challengesRef.current?.data || [];
                const pilotData = pilotsRef.current?.data || [];

                return {
                    type: 'data_list',
                    entity: 'approval_request',
                    summary: `Found ${challengeData.length} challenges and ${pilotData.length} pilots pending approval.`,
                    items: [
                        ...challengeData.map(c => ({ id: c.id, type: 'challenge', title: c.title })),
                        ...pilotData.map(p => ({ id: p.id, type: 'pilot', title: p.title_en }))
                    ]
                };
            }
        });

        // --- Tool: Approve Item (Micro) ---
        const unregisterApproveAction = registerTool({
            name: 'approve_request',
            description: 'Approve a specific pending item.',
            schema: z.object({
                type: z.enum(['challenge', 'pilot']),
                id: z.string().describe("The UUID of the item"),
                notes: z.string().optional()
            }),
            safety: 'unsafe',
            execute: async ({ type, id, notes }) => {
                let updateData = {};
                if (type === 'challenge') updateData = { status: 'approved' };
                if (type === 'pilot') updateData = { status: 'approved' };
                return await approveMutation.mutateAsync({ type, id, data: updateData });
            }
        });

        // --- Tool: List Contracts ---
        const unregisterContracts = registerTool({
            name: 'list_contracts',
            description: 'View contracts I have access to.',
            schema: z.object({ status: z.string().optional() }),
            safety: 'safe',
            execute: async ({ status }) => {
                let result = contractsRef.current || [];
                if (status) result = result.filter(c => c.status === status);
                return {
                    type: 'data_list',
                    entity: 'contract',
                    items: result.map(c => ({ id: c.id, title: c.contract_number, type: c.contract_type, status: c.status }))
                };
            }
        });

        // --- Tool: List Risks ---
        const unregisterRisks = registerTool({
            name: 'list_risks',
            description: 'View active risks.',
            schema: z.object({}),
            safety: 'safe',
            execute: async () => {
                return {
                    type: 'data_list',
                    entity: 'risk',
                    items: (risksRef.current || []).map(r => ({ id: r.id, description: r.description, severity: r.severity, status: r.status }))
                };
            }
        });

        // --- Tool: List Budgets ---
        const unregisterBudgets = registerTool({
            name: 'list_budgets',
            description: 'View budget allocations and utilization.',
            schema: z.object({}),
            safety: 'safe',
            execute: async () => {
                return {
                    type: 'data_list',
                    entity: 'budget',
                    items: (budgetsRef.current || []).map(b => ({
                        id: b.id,
                        entity: b.entity_invoked,
                        amount: b.total_amount,
                        remaining: b.remaining_amount
                    }))
                };
            }
        });

        // --- Tool: List Teams ---
        const unregisterTeams = registerTool({
            name: 'list_teams',
            description: 'View teams and their members.',
            schema: z.object({}),
            safety: 'safe',
            execute: async () => {
                return {
                    type: 'data_list',
                    entity: 'team',
                    items: (teamsRef.current || []).map(t => ({
                        id: t.id,
                        name: t.name,
                        member_count: t.members?.length || 0
                    }))
                };
            }
        });

        // --- Tool: List Challenge Proposals ---
        const unregisterProposals = registerTool({
            name: 'list_challenge_proposals',
            description: 'List proposals submitted to challenges.',
            schema: z.object({ status: z.string().optional() }),
            safety: 'safe',
            execute: async ({ status }) => {
                let result = proposalsRef.current || [];
                if (status) result = result.filter(p => p.status === status);
                return {
                    type: 'data_list',
                    entity: 'challenge_proposal',
                    items: result.map(p => ({
                        id: p.id,
                        challenge: p.challenge?.title_en,
                        provider: p.provider?.name_en,
                        status: p.status
                    }))
                };
            }
        });
        // --- Tool: List Audit Logs (Admin) ---
        const unregisterAuditLogs = registerTool({
            name: 'list_audit_logs',
            description: 'View system audit logs.',
            schema: z.object({ action: z.string().optional() }),
            safety: 'safe',
            execute: async ({ action }) => {
                if (!isAdmin) return "Access denied. Admin only.";
                let result = auditLogsRef.current || [];
                if (action) result = result.filter(l => l.action === action);
                return {
                    type: 'data_list',
                    entity: 'audit_log',
                    items: result.map(l => ({
                        id: l.id,
                        action: l.action,
                        user: l.user_email,
                        timestamp: l.created_at
                    }))
                };
            }
        });

        return () => {
            unregisterTasks();
            unregisterTaskCreate();
            unregisterApprovals();
            unregisterApproveAction();
            unregisterContracts();
            unregisterRisks();
            unregisterBudgets();
            unregisterTeams();
            unregisterProposals();
            unregisterAuditLogs();
        };

    }, [registerTool, createTaskMutation, approveMutation, isAdmin]); // Minimized dependencies
}
