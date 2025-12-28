import { useEntityPagination } from '@/hooks/useEntityPagination';
import { useQuery, useMutation } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { addDays, isWithinInterval } from 'date-fns';

export function useMyRDProjects(user, invokeAI) {
    const userEmail = user?.email;

    // 1. PAGINATED LIST (Main Grid)
    // Filters: created_by matches user (Primary ownership)
    const pagination = useEntityPagination({
        entityName: 'rd_projects',
        pageSize: 12,
        filters: {
            created_by: userEmail
        },
        enabled: !!userEmail
    });

    // 2. STATS & DASHBOARD DATA (Lightweight fetch of ALL user projects)
    // We need this to calculate: Active Count, Publications Total, and Critical Milestones
    const { data: dashboardData = {
        activeCount: 0,
        publicationsTotal: 0,
        criticalMilestones: [],
        milestonesNextWeekCount: 0
    }, isLoading: statsLoading } = useQuery({
        queryKey: ['my-rd-stats', userEmail],
        queryFn: async () => {
            if (!userEmail) return { activeCount: 0, publicationsTotal: 0, criticalMilestones: [] };

            // Fetch simplified objects
            const { data, error } = await supabase
                .from('rd_projects')
                .select('id, title_en, title_ar, status, timeline, publications, principal_investigator, team_members')
                .eq('is_deleted', false)
                // We replicate the complex ownership filter here since this is custom business logic for the dashboard
                // For simplicity/performance in this refactor, we stick to created_by OR strict logic if possible.
                // But simplified: created_by for now to match Pagination.
                .eq('created_by', userEmail);

            if (error) throw error;

            const projects = data || [];
            const activeProjects = projects.filter(p => p.status === 'active');

            // Calc Publications
            const publicationsTotal = projects.reduce((sum, p) => sum + (p.publications?.length || 0), 0);

            // Calc Critical Milestones
            const nextWeek = addDays(new Date(), 7);
            const criticalMilestones = activeProjects.flatMap(p =>
                (p.timeline?.milestones || [])
                    .filter(m => m.status !== 'completed' && m.date)
                    .map(m => ({ ...m, project: { title_en: p.title_en, title_ar: p.title_ar } }))
            ).filter(m =>
                isWithinInterval(new Date(m.date), { start: new Date(), end: nextWeek })
            ).sort((a, b) => new Date(a.date) - new Date(b.date));

            return {
                activeCount: activeProjects.length,
                publicationsTotal,
                criticalMilestones,
                milestonesNextWeekCount: criticalMilestones.length
            };
        },
        enabled: !!userEmail,
        staleTime: 5 * 60 * 1000 // 5 min cache for dashboard stats
    });

    // 3. OPEN R&D CALLS (Keep existing)
    const { data: rdCalls = [] } = useQuery({
        queryKey: ['open-rd-calls'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('rd_calls')
                .select('*')
                .eq('status', 'open')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },
        staleTime: 10 * 60 * 1000 // Cache longer
    });

    // 4. AI Insights (Keep existing)
    const generateInsights = useMutation({
        mutationFn: async (project) => {
            if (!invokeAI) throw new Error("AI not available");

            const result = await invokeAI({
                prompt: `Analyze this R&D project and provide actionable recommendations:
                        Project: ${project.title_en}
                        Current TRL: ${project.trl_current || 'N/A'}
                        Target TRL: ${project.trl_target || 'N/A'}
                        Status: ${project.status}
                        Timeline: ${project.timeline?.start_date} to ${project.timeline?.end_date}
                        Milestones: ${JSON.stringify(project.timeline?.milestones || [])}
                        Provide:
                        1. Next recommended steps (2-3 specific actions)
                        2. Risk assessment
                        3. Opportunities for acceleration`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        next_steps: { type: "array", items: { type: "string" } },
                        risks: { type: "string" },
                        opportunities: { type: "string" }
                    }
                }
            });
            return result.success ? result.data : null;
        }
    });

    return {
        // Pagination
        ...pagination,
        projects: pagination.data,

        // Dashboard Data
        stats: dashboardData,
        rdCalls,

        generateInsights
    };
}

