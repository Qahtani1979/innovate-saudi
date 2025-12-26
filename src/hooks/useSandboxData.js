import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook for Sandbox mutations
 */
export function useSandboxMutations() {
    const queryClient = useQueryClient();

    const createSandbox = useMutation({
        mutationFn: async (/** @type {any} */ sandboxData) => {
            const { data, error } = await supabase
                .from('sandboxes')
                .insert(sandboxData)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sandboxes'] });
        },
        onError: (error) => {
            console.error('Error creating sandbox:', error);
            toast.error('Failed to create sandbox');
        }
    });

    const verifySandbox = useMutation({
        /**
         * @param {{ id: string, notes: string, userEmail: string, sandboxName: string }} params
         */
        mutationFn: async ({ id, notes, userEmail, sandboxName }) => {
            const { error: updateError } = await supabase
                .from('sandboxes')
                .update({
                    status: 'verified',
                    verification_date: new Date().toISOString(),
                    verified_by: userEmail,
                    verification_notes: notes
                })
                .eq('id', id);

            if (updateError) throw updateError;

            const { error: activityError } = await supabase
                .from('system_activities')
                .insert({
                    entity_type: 'Sandbox',
                    entity_id: id,
                    activity_type: 'verified',
                    description: `Sandbox "${sandboxName}" verified and approved`,
                    performed_by: userEmail,
                    timestamp: new Date().toISOString()
                });

            if (activityError) console.error('Activity log error:', activityError);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sandboxes'] });
            queryClient.invalidateQueries({ queryKey: ['sandbox'] });
            toast.success('Sandbox verified successfully');
        },
        onError: (error) => {
            console.error('Error verifying sandbox:', error);
            toast.error('Failed to verify sandbox');
        }
    });

    return { createSandbox, verifySandbox };
}

/**
 * Hook to fetch a single sandbox application
 */
export function useSandboxApplication(id) {
    return useQuery({
        queryKey: ['sandbox-application', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('sandbox_applications')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        },
        enabled: !!id
    });
}

/**
 * Hook for Sandbox data (Activities, Incidents)
 */
export function useSandboxData(sandboxId) {

    const { data: activities = [], isLoading: activitiesLoading } = useQuery({
        queryKey: ['sandbox-activities', sandboxId],
        queryFn: async () => {
            if (!sandboxId) return [];
            const { data, error } = await supabase
                .from('system_activities')
                .select('*')
                .eq('entity_id', sandboxId)
                .eq('entity_type', 'Sandbox')
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) {
                console.warn('System Activities fetch failed', error);
                return [];
            }
            return data;
        },
        enabled: !!sandboxId
    });

    const { data: incidents = [], isLoading: incidentsLoading } = useQuery({
        queryKey: ['sandbox-incidents', sandboxId],
        queryFn: async () => {
            if (!sandboxId) return [];
            const { data, error } = await supabase
                .from('sandbox_incidents')
                .select('*')
                .eq('sandbox_id', sandboxId)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) {
                console.warn('Sandbox Incidents fetch failed', error);
                return [];
            }
            return data;
        },
        enabled: !!sandboxId
    });

    const { data: applications = [], isLoading: applicationsLoading } = useQuery({
        queryKey: ['sandbox-apps', sandboxId],
        queryFn: async () => {
            if (!sandboxId) return [];
            const { data, error } = await supabase
                .from('sandbox_applications')
                .select('*')
                .eq('sandbox_id', sandboxId);

            if (error) {
                console.warn('Apps fetch failed', error);
                return [];
            }
            return data;
        },
        enabled: !!sandboxId
    });

    return {
        activities,
        incidents,
        applications,
        isLoading: activitiesLoading || incidentsLoading || applicationsLoading
    };
}

/**
 * Hook to fetch monitoring data
 */
export function useSandboxMonitoringData(sandboxId) {
    return useQuery({
        queryKey: ['sandbox-monitoring', sandboxId],
        queryFn: async () => {
            if (!sandboxId) return [];
            const { data, error } = await supabase
                .from('sandbox_monitoring_data')
                .select('*')
                .eq('sandbox_id', sandboxId)
                .order('timestamp', { ascending: false })
                .limit(100);

            if (error) {
                console.warn('Monitoring data fetch failed', error);
                return [];
            }
            return data;
        },
        enabled: !!sandboxId
    });
}
