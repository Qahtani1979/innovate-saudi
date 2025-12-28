import { useQuery, useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook suite for system-level data operations: Lineage, Trends, and Integrity.
 */

/**
 * useDataLineage: Fetches access logs for a specific entity.
 */
export function useDataLineage(entityType, entityId) {
    return useQuery({
        queryKey: ['access-logs', entityType, entityId],
        queryFn: async () => {
            if (!entityType || !entityId) return [];

            const { data, error } = await supabase
                .from('access_logs')
                .select('*')
                .eq('entity_type', entityType)
                .eq('entity_id', entityId)
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;

            return (data || []).map(item => ({
                ...item,
                action_type: item.action,
                created_date: item.created_at
            }));
        },
        enabled: !!entityType && !!entityId,
        initialData: []
    });
}

/**
 * useSystemEntities: Generic fetcher for any entity type.
 */
export function useSystemEntities(entityType) {
    const tableMap = {
        'City': 'cities',
        'Organization': 'organizations',
        'Region': 'regions',
        'Challenge': 'challenges',
        'Solution': 'solutions',
        'RDProject': 'rd_projects',
        'Program': 'programs',
        'StrategicPlan': 'strategic_plans',
        'KnowledgeDocument': 'knowledge_documents',
        'CitizenIdea': 'citizen_ideas',
        'StrategicTheme': 'strategic_themes',
        'VisionObjective': 'vision_objectives',
        'KPICategory': 'kpi_categories',
        'Sector': 'sectors',
        'SubSector': 'sub_sectors',
        'Municipality': 'municipalities',
        'Provider': 'providers',
        'Pilot': 'pilots',
        'Event': 'events',
        'News': 'news',
        'FAQ': 'faqs',
        'Achievement': 'achievements',
        'ActionItem': 'action_items',
        'ActionPlan': 'action_plans',
        'ApprovalRequest': 'approval_requests',
        'Audit': 'audits',
        'Budget': 'budgets',
        'CaseStudy': 'case_studies',
        'Collaboration': 'collaborations',
        'Comment': 'comments',
        'Contact': 'contacts',
        'Contract': 'contracts',
        'Expert': 'experts',
        'Feedback': 'feedback',
        'Inspiration': 'inspirations',
        'Invoice': 'invoices',
        'LessonLearned': 'lessons_learned',
        'LivingLab': 'living_labs',
        'MeetingSpace': 'meeting_spaces',
        'Mentor': 'mentors',
        'Milestone': 'milestones',
        'Notification': 'notifications',
        'Onboarding': 'onboarding',
        'Partner': 'partners',
        'Partnership': 'partnerships',
        'Policy': 'policies',
        'Proposal': 'proposals',
        'Resource': 'resources',
        'Risk': 'risks',
        'Role': 'roles',
        'Scaling': 'scaling',
        'Setting': 'settings',
        'Stakeholder': 'stakeholders',
        'Startup': 'startups',
        'StrategicKPI': 'strategic_kpis',
        'Task': 'tasks',
        'Team': 'teams',
        'Vendor': 'vendors',
        'Ministry': 'ministries',
        'NewsArticle': 'news_articles',
        'RDCall': 'rd_calls',
        'RDProposal': 'rd_proposals',
        'PilotIssue': 'pilot_issues',
        'PilotExpense': 'pilot_expenses',
        'PilotKPI': 'pilot_kpis',
        'PilotDocument': 'pilot_documents',
        'PolicyRecommendation': 'policy_recommendations',
        'PolicyDocument': 'policy_documents',
        'NationalAlignment': 'national_strategy_alignments',
        'ScalingPlan': 'scaling_plans',
        'ScalingReadiness': 'scaling_readiness',
        'SandboxApplication': 'sandbox_applications',
        'SandboxIncident': 'sandbox_incidents',
        'SandboxMonitoring': 'sandbox_monitoring_data',
        'SandboxMilestone': 'sandbox_project_milestones',
        'StartupProfile': 'startup_profiles',
        'ExpertProfile': 'expert_profiles',
        'MunicipalityStaff': 'municipality_staff_profiles',
        'ResearcherProfile': 'researcher_profiles',
        'MilestoneTarget': 'milestone_targets',
        'Evaluation': 'evaluations',
        'StageEvaluation': 'stage_evaluations',
        'ResourceAllocation': 'resource_allocations',
        'Asset': 'assets',
        'Inventory': 'inventory',
        'Procurement': 'procurement',
        'WorkOrder': 'work_orders',
        'ServiceRequest': 'service_requests',
        'Incident': 'incidents',
        'ActivityLog': 'activity_logs',
        'AccessLog': 'access_logs'
    };

    const tableName = tableMap[entityType] || entityType.toLowerCase() + 's';

    return useQuery({
        queryKey: ['system-entities', entityType],
        queryFn: async () => {
            const { data, error } = await supabase.from(tableName).select('*');
            if (error) throw error;
            return data || [];
        },
        enabled: !!entityType
    });
}

/**
 * useSystemRoles: Fetches all available system roles.
 */
export function useSystemRoles() {
    return useQuery({
        queryKey: ['system-roles'],
        queryFn: async () => {
            const { data, error } = await supabase.from('roles').select('*');
            if (error) throw error;
            return data || [];
        }
    });
}

/**
 * useSystemTrends: Fetches trend data for analysis.
 */
export function useSystemTrends(entityType, metric) {
    return useQuery({
        queryKey: ['system-trends', entityType, metric],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('sandbox_monitoring_data')
                .select('*')
                .eq('metric_name', metric)
                .order('timestamp', { ascending: false })
                .limit(30);

            if (error) throw error;

            return (data || []).map(item => ({
                id: item.id,
                entity_type: entityType,
                metric_name: item.metric_name,
                metric_value: item.metric_value,
                created_date: item.timestamp
            }));
        },
        enabled: !!metric
    });
}

/**
 * useSystemIntegrity: Handles complex integrity fixes.
 */
export function useSystemIntegrity(t) {
    const queryClient = useAppQueryClient();

    const applyFixMutation = useMutation({
        /** @param {{type: string, fix: any, index: number}} args */
        mutationFn: async ({ type, fix, index }) => {
            const finalType = type === 'city' ? 'city' : (type === 'org' || type === 'organization' ? 'organization' : type.toLowerCase());

            if (finalType === 'city') {
                if (fix.action === 'DELETE' || fix.action === 'DELETE_DUPLICATE') {
                    const { error } = await supabase.from('cities').delete().eq('id', fix.city_id);
                    if (error) throw error;
                } else if (fix.action === 'REASSIGN' && fix.target_region_id) {
                    const updates = { region_id: fix.target_region_id };
                    if (fix.estimated_population) updates.population = fix.estimated_population;
                    const { error } = await supabase.from('cities').update(updates).eq('id', fix.city_id);
                    if (error) throw error;
                } else if (fix.action === 'UPDATE_POPULATION' && fix.estimated_population) {
                    const { error } = await supabase.from('cities').update({ population: fix.estimated_population }).eq('id', fix.city_id);
                    if (error) throw error;
                }
            } else if (finalType === 'organization' || finalType === 'org') {
                if (fix.action === 'DELETE' || fix.action === 'DELETE_DUPLICATE') {
                    const { error } = await supabase.from('organizations').delete().eq('id', fix.org_id);
                    if (error) throw error;
                } else if (fix.action === 'REASSIGN') {
                    const updates = {};
                    if (fix.target_region_id) updates.region_id = fix.target_region_id;
                    if (fix.target_city_id) updates.city_id = fix.target_city_id;
                    const { error } = await supabase.from('organizations').update(updates).eq('id', fix.org_id);
                    if (error) throw error;
                } else if (fix.action === 'NULLIFY') {
                    const { error } = await supabase.from('organizations').update({ region_id: null, city_id: null }).eq('id', fix.org_id);
                    if (error) throw error;
                }
            }

            return { type, index };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries();
            toast.success(t?.({ en: 'Fix applied', ar: 'تم تطبيق الإصلاح' }) || 'Fix applied successfully');
        },
        onError: (error) => {
            console.error('Fix error:', error);
            toast.error(t?.({ en: 'Fix failed', ar: 'فشل الإصلاح' }) || 'Failed to apply fix');
        }
    });

    return {
        applyFixMutation
    };
}



