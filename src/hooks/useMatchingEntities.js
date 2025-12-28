import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useMatchingEntities() {
    const useChallenges = (options = {}) => useQuery({
        queryKey: ['challenges', options],
        queryFn: async () => {
            let query = supabase.from('challenges').select('*');
            if (options.deleted === false) query = query.eq('is_deleted', false);
            if (options.published) query = query.eq('is_published', true);
            if (options.ids && options.ids.length > 0) query = query.in('id', options.ids);

            // Order
            query = query.order('created_at', { ascending: false });

            if (options.limit) query = query.limit(options.limit);
            else if (!options.ids) query = query.limit(100); // Default limit if not fetching specific IDs

            const { data } = await query;
            return data || [];
        },
        enabled: options.enabled !== false
    });

    const usePilots = (options = {}) => useQuery({
        queryKey: ['pilots', options],
        queryFn: async () => {
            let query = supabase.from('pilots').select('*');
            if (options.deleted === false) query = query.eq('is_deleted', false);
            if (options.solutionIds && options.solutionIds.length > 0) query = query.in('solution_id', options.solutionIds);

            query = query.order('created_at', { ascending: false });

            if (options.limit) query = query.limit(options.limit);

            const { data } = await query;
            return data || [];
        },
        enabled: options.enabled !== false // Default to true if undefined, but explicit checks might pass false
    });

    const useSolutions = (options = {}) => useQuery({
        queryKey: ['solutions', options],
        queryFn: async () => {
            let query = supabase.from('solutions').select('*');
            if (options.deleted === false) query = query.eq('is_deleted', false);
            if (options.providerId) query = query.eq('provider_id', options.providerId);
            if (options.createdBy) query = query.eq('created_by', options.createdBy);

            query = query.order('created_at', { ascending: false });

            if (options.limit) query = query.limit(options.limit);

            const { data } = await query;
            return data || [];
        }
    });

    const useRDProposals = (options = {}) => useQuery({
        queryKey: ['rd-proposals', options],
        queryFn: async () => {
            let query = supabase.from('rd_proposals').select('*').order('created_at', { ascending: false });
            if (options.limit) query = query.limit(options.limit);
            else query = query.limit(100);
            const { data } = await query;
            return data || [];
        }
    });

    const useRDProjects = (options = {}) => useQuery({
        queryKey: ['rd-projects', options],
        queryFn: async () => {
            let query = supabase.from('rd_projects').select('*').order('created_at', { ascending: false });
            if (options.limit) query = query.limit(options.limit);
            else query = query.limit(100);
            const { data } = await query;
            return data || [];
        }
    });

    const useProgramApplications = (options = {}) => useQuery({
        queryKey: ['program-apps', options],
        queryFn: async () => {
            let query = supabase.from('program_applications').select('*');
            if (options.userEmail) {
                query = query.or(`applicant_email.eq.${options.userEmail},created_by.eq.${options.userEmail}`);
            }
            query = query.order('created_at', { ascending: false });
            if (options.limit) query = query.limit(options.limit);

            const { data } = await query;
            return data || [];
        }
    });

    const useMatchmakerApplications = (options = {}) => useQuery({
        queryKey: ['matchmaker-apps', options],
        queryFn: async () => {
            let query = supabase.from('matchmaker_applications').select('*');
            if (options.contactEmail) query = query.eq('contact_email', options.contactEmail);

            query = query.order('created_at', { ascending: false });
            if (options.limit) query = query.limit(options.limit);

            const { data } = await query;
            return data || [];
        }
    });

    const useScalingPlans = (options = {}) => useQuery({
        queryKey: ['scaling-plans', options],
        queryFn: async () => {
            let query = supabase.from('scaling_plans').select('*').order('created_at', { ascending: false });
            if (options.limit) query = query.limit(options.limit);
            else query = query.limit(100);
            const { data } = await query;
            return data || [];
        }
    });

    const useEvents = (options = {}) => useQuery({
        queryKey: ['events-for-matching', options],
        queryFn: async () => {
            let query = supabase.from('events').select('*').eq('is_deleted', false).order('created_at', { ascending: false });
            if (options.limit) query = query.limit(options.limit);
            else query = query.limit(100);
            const { data } = await query;
            return data || [];
        }
    });

    const useOrganizations = (options = {}) => useQuery({
        queryKey: ['organizations-matching', options],
        queryFn: async () => {
            let query = supabase.from('organizations').select('*');
            // If userEmail provided, we can't filter server side easily for "contact_email OR primary_contact_name" without building OR string manually or fetching all.
            // But we can filter client side as done in dashboard if we fetch all or enough.
            // Or we can add specific filters if needed.
            // For now, fetching recent ones or all if list is small. 
            // In dashboard we fetch all and find. Let's keep fetching (maybe limit?)

            query = query.order('created_at', { ascending: false });

            if (options.limit) query = query.limit(options.limit);
            // else query = query.limit(100); // Remove limit for now to support finding organization by email

            const { data } = await query;
            return data || [];
        }
    });

    const useSectors = () => useQuery({
        queryKey: ['sectors'],
        queryFn: async () => {
            const { data, error } = await supabase.from('sectors').select('*');
            if (error) throw error;
            return data || [];
        }
    });

    const usePrograms = (options = {}) => useQuery({
        queryKey: ['programs', options],
        queryFn: async () => {
            let query = supabase.from('programs').select('*');
            if (options.status) query = query.eq('status', options.status);
            if (options.published) query = query.eq('is_published', true);
            if (options.types && options.types.length > 0) query = query.in('program_type', options.types);

            query = query.order('created_at', { ascending: false });

            if (options.limit) query = query.limit(options.limit);

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        }
    });

    return {
        useChallenges,
        usePilots,
        useSolutions,
        useRDProposals,
        useRDProjects,
        useProgramApplications,
        useMatchmakerApplications,
        useScalingPlans,
        useEvents,
        useOrganizations,
        useSectors,
        usePrograms
    };
}

