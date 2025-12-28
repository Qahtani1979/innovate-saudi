import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to fetch aggregated system metrics and counts for dashboards
 * optimized to count instead of fetching all rows where possible
 * @returns {object} Aggregated metrics
 */
export function useSystemMetrics() {

    // Innovation Pipeline Metrics
    const { data: pipelineMetrics = {
        challenges: 0,
        pilots: 0,
        solutions: 0,
        scalingPlans: 0
    } } = useQuery({
        queryKey: ['system-metrics-pipeline'],
        queryFn: async () => {
            const [
                { count: challenges },
                { count: pilots },
                { count: solutions },
                { count: scalingPlans }
            ] = await Promise.all([
                supabase.from('challenges').select('*', { count: 'exact', head: true }),
                supabase.from('pilots').select('*', { count: 'exact', head: true }),
                supabase.from('solutions').select('*', { count: 'exact', head: true }),
                supabase.from('scaling_plans').select('*', { count: 'exact', head: true })
            ]);

            return {
                challenges: challenges || 0,
                pilots: pilots || 0,
                solutions: solutions || 0,
                scalingPlans: scalingPlans || 0
            };
        },
        staleTime: 1000 * 60 * 5 // 5 minutes
    });

    // Citizen Engagement Metrics
    const { data: citizenMetrics = {
        ideas: 0,
        proposals: 0,
        votes: 0 // Placeholder as votes table might be large, maybe skip or use approx
    } } = useQuery({
        queryKey: ['system-metrics-citizen'],
        queryFn: async () => {
            const [
                { count: ideas },
                { count: proposals }
            ] = await Promise.all([
                supabase.from('citizen_ideas').select('*', { count: 'exact', head: true }),
                supabase.from('innovation_proposals').select('*', { count: 'exact', head: true })
            ]);
            return { ideas: ideas || 0, proposals: proposals || 0 };
        },
        staleTime: 1000 * 60 * 5
    });

    // Strategy Metrics
    const { data: strategyMetrics = {
        plans: 0,
        linkedEntities: 0 // Placeholder logic
    } } = useQuery({
        queryKey: ['system-metrics-strategy'],
        queryFn: async () => {
            const { count } = await supabase.from('strategic_plans').select('*', { count: 'exact', head: true });
            return { plans: count || 0 };
        },
        staleTime: 1000 * 60 * 15
    });

    // Infrastructure Metrics
    const { data: infraMetrics = {
        sandboxes: 0,
        livingLabs: 0
    } } = useQuery({
        queryKey: ['system-metrics-infra'],
        queryFn: async () => {
            const [
                { count: sandboxes },
                { count: livingLabs }
            ] = await Promise.all([
                supabase.from('sandboxes').select('*', { count: 'exact', head: true }),
                supabase.from('living_labs').select('*', { count: 'exact', head: true })
            ]);
            return { sandboxes: sandboxes || 0, livingLabs: livingLabs || 0 };
        },
        staleTime: 1000 * 60 * 10
    });

    // Organization Metrics
    const { data: orgMetrics = {
        organizations: 0
    } } = useQuery({
        queryKey: ['system-metrics-orgs'],
        queryFn: async () => {
            const { count } = await supabase.from('organizations').select('*', { count: 'exact', head: true });
            return { organizations: count || 0 };
        },
        staleTime: 1000 * 60 * 10
    });

    // Expert Metrics
    const { data: expertMetrics = {
        profiles: 0,
        evaluations: 0
    } } = useQuery({
        queryKey: ['system-metrics-experts'],
        queryFn: async () => {
            const [
                { count: profiles },
                { count: evaluations }
            ] = await Promise.all([
                supabase.from('expert_profiles').select('*', { count: 'exact', head: true }),
                supabase.from('expert_evaluations').select('*', { count: 'exact', head: true })
            ]);
            return { profiles: profiles || 0, evaluations: evaluations || 0 };
        },
        staleTime: 1000 * 60 * 10
    });

    // Knowledge Metrics
    const { data: knowledgeMetrics = {
        documents: 0
    } } = useQuery({
        queryKey: ['system-metrics-knowledge'],
        queryFn: async () => {
            const { count } = await supabase.from('knowledge_documents').select('*', { count: 'exact', head: true });
            return { documents: count || 0 };
        },
        staleTime: 1000 * 60 * 10
    });

    // Geography metrics
    const { data: geoMetrics = { regions: 0, municipalities: 0 } } = useQuery({
        queryKey: ['system-metrics-geo'],
        queryFn: async () => {
            const [
                { count: regions },
                { count: municipalites }
            ] = await Promise.all([
                supabase.from('regions').select('*', { count: 'exact', head: true }),
                supabase.from('municipalities').select('*', { count: 'exact', head: true })
            ]);
            return { regions: regions || 0, municipalities: municipalites || 0 };
        },
        staleTime: 1000 * 60 * 60 // 1 hour (static data)
    });

    // Taxonomy metrics
    const { data: taxonomyMetrics = { sectors: 0 } } = useQuery({
        queryKey: ['system-metrics-taxonomy'],
        queryFn: async () => {
            const { count } = await supabase.from('sectors').select('*', { count: 'exact', head: true });
            return { sectors: count || 0 };
        },
        staleTime: 1000 * 60 * 60
    });


    return {
        pipeline: pipelineMetrics,
        citizen: citizenMetrics,
        strategy: strategyMetrics,
        infrastructure: infraMetrics,
        organizations: orgMetrics,
        experts: expertMetrics,
        knowledge: knowledgeMetrics,
        geography: geoMetrics,
        taxonomy: taxonomyMetrics
    };
}

