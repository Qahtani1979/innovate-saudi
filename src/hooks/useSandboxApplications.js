import { useQuery, useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook for fetching sandbox applications.
 */
export function useSandboxApplications(options = {}) {
    const { sandboxId, applicantEmail, status, limit = 100 } = options;

    return useQuery({
        queryKey: ['sandbox-applications', { sandboxId, applicantEmail, status, limit }],
        queryFn: async () => {
            let query = supabase
                .from('sandbox_applications')
                .select(`
          *,
          sandbox:sandboxes(id, name_en, name_ar, code)
        `)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (sandboxId) query = query.eq('sandbox_id', sandboxId);
            if (options.sandboxIds && options.sandboxIds.length > 0) query = query.in('sandbox_id', options.sandboxIds);
            if (applicantEmail) query = query.eq('applicant_email', applicantEmail);
            if (status) query = query.eq('status', status);

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 5,
    });
}

/**
 * Hook for fetching a single sandbox application by ID.
 */
export function useSandboxApplication(id) {
    return useQuery({
        queryKey: ['sandbox-application', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('sandbox_applications')
                .select(`
          *,
          sandbox:sandboxes(*)
        `)
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

/**
 * Hook for sandbox application mutations.
 */
export function useSandboxApplicationMutations() {
    const queryClient = useAppQueryClient();

    const createApplication = useMutation({
        /**
         * @param {{ userEmail: string, entityType: string, entity: any, riskLevel: string }} params
         */
        mutationFn: async ({ userEmail, entityType, entity, riskLevel }) => {
            const { error } = await supabase.from('sandbox_applications').insert({
                applicant_email: userEmail,
                source_entity_type: entityType,
                source_entity_id: entity.id,
                project_title: entity.title_en || entity.name_en,
                project_description: entity.description_en || entity.abstract_en,
                risk_level: riskLevel,
                status: 'pending'
            });

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sandbox-applications'] });
            toast.success('Sandbox application created successfully');
        },
        onError: (error) => {
            toast.error(`Failed to create application: ${error.message}`);
        }
    });

    const updateApplication = useMutation({
        mutationFn: async ({ id, data }) => {
            const { data: result, error } = await supabase
                .from('sandbox_applications')
                .update(data)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return result;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['sandbox-application', data.id] });
            queryClient.invalidateQueries({ queryKey: ['sandbox-applications'] });
            toast.success('Application updated successfully');
        },
        onError: (error) => {
            toast.error(`Failed to update application: ${error.message}`);
        }
    });

    return {
        createApplication,
        updateApplication,
        isUpdating: updateApplication.isPending
    };
}



