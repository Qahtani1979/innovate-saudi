import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

/**
 * Hook for fetching a single program
 */
export function useProgram(programId) {
    return useQuery({
        queryKey: ['program', programId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('programs')
                .select(`
          *,
          municipality:municipalities(id, name_en, name_ar),
          sector:sectors(id, name_en, name_ar)
        `)
                .eq('id', programId)
                .maybeSingle();

            if (error) throw error;
            return data;
        },
        enabled: !!programId
    });
}

/**
 * Hook for fetching program applications
 */
export function useProgramApplications(programId) {
    return useQuery({
        queryKey: ['program-applications', programId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('program_applications')
                .select('*')
                .eq('program_id', programId);
            if (error) throw error;
            return data || [];
        },
        enabled: !!programId
    });
}

/**
 * Hook for fetching a single program application
 */
export function useProgramApplication(applicationId) {
    return useQuery({
        queryKey: ['program-application', applicationId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('program_applications')
                .select('*')
                .eq('id', applicationId)
                .maybeSingle();
            if (error) throw error;
            return data;
        },
        enabled: !!applicationId
    });
}

/**
 * Hook for fetching and managing program comments
 */
export function useProgramComments(programId) {
    const queryClient = useAppQueryClient();

    const query = useQuery({
        queryKey: ['program-comments', programId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('program_comments')
                .select('*')
                .eq('program_id', programId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },
        enabled: !!programId
    });

    const mutation = useMutation({
        mutationFn: async (commentData) => {
            const { error } = await supabase.from('program_comments').insert(commentData);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['program-comments', programId] });
            toast.success('Comment added');
        }
    });

    return {
        comments: query.data || [],
        isLoading: query.isLoading,
        addComment: mutation
    };
}

/**
 * Hook for fetching expert assignments (mentors) for a program
 */
export function useProgramExperts(programId) {
    return useQuery({
        queryKey: ['program-expert-assignments', programId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('expert_assignments')
                .select('*')
                .eq('entity_type', 'program')
                .eq('entity_id', programId)
                .eq('assignment_type', 'mentor');
            if (error) throw error;
            return data || [];
        },
        enabled: !!programId
    });
}

/**
 * Hook for fetching current user's program applications
 */
export function useMyProgramApplications() {
    const { user } = useAuth();
    return useQuery({
        queryKey: ['my-program-apps', user?.email],
        queryFn: async () => {
            if (!user?.email) return [];
            const { data, error } = await supabase
                .from('program_applications')
                .select('*')
                .or(`applicant_email.eq.${user.email},created_by.eq.${user.email}`);

            if (error) throw error;
            return data || [];
        },
        enabled: !!user?.email
    });
}

/**
 * Hook for fetching events for current user's programs
 */
export function useMyProgramEvents(programIds = []) {
    return useQuery({
        queryKey: ['my-program-events', programIds],
        queryFn: async () => {
            if (programIds.length === 0) return [];
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .in('program_id', programIds)
                .eq('is_deleted', false)
                .gte('start_date', new Date().toISOString())
                .order('start_date', { ascending: true })
                .limit(5);

            if (error) throw error;
            return data || [];
        },
        enabled: programIds.length > 0
    });
}

/**
 * Hook for fetching all applications for a set of programs
 */
export function useApplicationsForPrograms(programIds = []) {
    return useQuery({
        queryKey: ['applications-for-programs', programIds],
        queryFn: async () => {
            if (!programIds.length) return [];
            const { data, error } = await supabase
                .from('program_applications')
                .select('*')
                .in('program_id', programIds);
            if (error) throw error;
            return data || [];
        },
        enabled: programIds.length > 0
    });
}

/**
 * Hook for submitting innovation proposals
 */
export function useSubmitInnovationProposal({ onSuccess } = {}) {
    const queryClient = useAppQueryClient();
    const { user } = useAuth();

    return useMutation({
        mutationFn: async (data) => {
            const submitterEmail = user?.email || data.submitter_email;
            const { error } = await supabase
                .from('innovation_proposals')
                .insert({
                    ...data,
                    code: `PROP-${Date.now().toString().slice(-8)}`,
                    status: 'submitted',
                    created_by: submitterEmail
                });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['innovation-proposals'] });
            toast.success('Proposal submitted successfully');
            if (onSuccess) onSuccess();
        },
        onError: (error) => {
            toast.error('Failed to submit proposal: ' + error.message);
        }
    });
}

/**
 * Hook for submitting program applications
 */
export function useSubmitProgramApplication({ onSuccess } = {}) {
    const queryClient = useAppQueryClient();

    return useMutation({
        mutationFn: async (data) => {
            const { data: newApp, error } = await supabase.from('program_applications').insert([data]).select().single();
            if (error) throw error;
            return newApp;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['program-applications'] });
            queryClient.invalidateQueries({ queryKey: ['my-program-apps'] });
            toast.success('Application submitted successfully');
            if (onSuccess) onSuccess();
        },
        onError: (error) => {
            toast.error('Failed to submit application: ' + error.message);
        }
    });
}

/**
 * Hook for fetching all program applications with optional filtering
 */
export function useAllProgramApplications(options = {}) {
    const { status, limit = 100 } = options;
    return useQuery({
        queryKey: ['program-applications-all', status, limit],
        queryFn: async () => {
            let query = supabase
                .from('program_applications')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (status) {
                if (Array.isArray(status)) {
                    query = query.in('status', status);
                } else {
                    query = query.eq('status', status);
                }
            }

            if (options.graduationStatus) {
                query = query.eq('graduation_status', options.graduationStatus);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        }
    });
}

