import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useMatchmakerApplications(options = {}) {
    const { status, type, applicantEmail, userEmail } = options;

    return useQuery({
        queryKey: ['matchmaker-applications', status, type, applicantEmail, userEmail],
        queryFn: async () => {
            let query = supabase
                .from('matchmaker_applications')
                .select(`
          *,
          expert_evaluations(*)
        `)
                .order('created_at', { ascending: false });

            if (status) {
                query = query.eq('status', status);
            }

            if (type) {
                query = query.eq('application_type', type);
            }

            if (applicantEmail) {
                query = query.eq('applicant_email', applicantEmail);
            }

            if (userEmail) {
                // Check contact_email OR created_by
                // Note: contact_email might be the column name, reusing applicant checks logic if needed
                // Using .or() for multiple conditions
                query = query.or(`contact_email.eq.${userEmail},created_by.eq.${userEmail}`);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        staleTime: 5 * 60 * 1000
    });
}

export function useProgramApplications(options = {}) {
    const { status, programId, applicantEmail, userEmail } = options;

    return useQuery({
        queryKey: ['program-applications', status, programId, applicantEmail, userEmail],
        queryFn: async () => {
            let query = supabase
                .from('program_applications')
                .select('*')
                .order('created_at', { ascending: false });

            if (status) {
                query = query.eq('status', status);
            }

            if (programId) {
                query = query.eq('program_id', programId);
            }

            if (applicantEmail) {
                query = query.eq('applicant_email', applicantEmail);
            }

            if (userEmail) {
                query = query.or(`applicant_email.eq.${userEmail},created_by.eq.${userEmail}`);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        staleTime: 5 * 60 * 1000
    });
}

export function useRDProposals(options = {}) {
    const { status, applicantEmail, userEmail } = options;

    return useQuery({
        queryKey: ['rd-proposals', status, applicantEmail, userEmail],
        queryFn: async () => {
            let query = supabase
                .from('rd_proposals')
                .select('*')
                .order('created_at', { ascending: false });

            if (status) {
                query = query.eq('status', status);
            }

            if (applicantEmail) {
                query = query.eq('applicant_email', applicantEmail);
            }

            if (userEmail) {
                query = query.eq('created_by', userEmail);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        staleTime: 5 * 60 * 1000
    });
}

