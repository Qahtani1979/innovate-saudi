import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useSandboxes() {
    const queryClient = useAppQueryClient();

    const useAllSandboxes = (user) => useQuery({
        queryKey: ['sandboxes', user?.email, user?.role],
        queryFn: async () => {
            let query = supabase.from('sandboxes').select('*').eq('is_deleted', false);
            if (user?.role !== 'admin') {
                query = query.or(`manager_email.eq.${user?.email},created_by.eq.${user?.email}`);
            }
            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        enabled: !!user
    });

    const useSandboxApplications = (sandboxes) => useQuery({
        queryKey: ['sandbox-applications', sandboxes?.length],
        queryFn: async () => {
            if (!sandboxes || sandboxes.length === 0) return [];
            const sandboxIds = sandboxes.map(s => s.id);
            const { data, error } = await supabase
                .from('sandbox_applications')
                .select('*')
                .in('sandbox_id', sandboxIds);
            if (error) throw error;
            return data || [];
        },
        enabled: !!sandboxes && sandboxes.length > 0
    });

    const useMyApplications = (user) => useQuery({
        queryKey: ['my-sandbox-applications', user?.email],
        queryFn: async () => {
            const { data, error } = await supabase.from('sandbox_applications').select('*')
                .eq('applicant_email', user?.email)
                .eq('status', 'approved');
            if (error) throw error;
            return data || [];
        },
        enabled: !!user
    });

    const useProjectMilestones = (projectIds) => useQuery({
        queryKey: ['my-sandbox-milestones', projectIds?.length],
        queryFn: async () => {
            if (!projectIds || projectIds.length === 0) return [];
            const { data, error } = await supabase.from('sandbox_project_milestones').select('*')
                .in('project_id', projectIds);
            if (error) throw error;
            return data || [];
        },
        enabled: !!projectIds && projectIds.length > 0
    });

    const useMonitoringData = (sandboxIds) => useQuery({
        queryKey: ['my-monitoring-data', sandboxIds?.length],
        queryFn: async () => {
            if (!sandboxIds || sandboxIds.length === 0) return [];
            const { data, error } = await supabase.from('sandbox_monitoring_data').select('*')
                .in('sandbox_id', sandboxIds)
                .order('timestamp', { ascending: false })
                .limit(20);
            if (error) throw error;
            return data || [];
        },
        enabled: !!sandboxIds && sandboxIds.length > 0
    });

    const useResources = (sandboxIds) => useQuery({
        queryKey: ['sandbox-resources', sandboxIds?.length],
        queryFn: async () => {
            if (!sandboxIds || sandboxIds.length === 0) return [];
            const { data, error } = await supabase.from('sandbox_resources').select('*')
                .in('sandbox_id', sandboxIds);
            if (error) throw error;
            return data || [];
        },
        enabled: !!sandboxIds && sandboxIds.length > 0
    });

    const useBookings = (resourceIds) => useQuery({
        queryKey: ['resource-bookings', resourceIds?.length],
        queryFn: async () => {
            if (!resourceIds || resourceIds.length === 0) return [];
            const { data, error } = await supabase.from('sandbox_resource_bookings').select('*')
                .in('resource_id', resourceIds);
            if (error) throw error;
            return data || [];
        },
        enabled: !!resourceIds && resourceIds.length > 0
    });

    const useSubmitMonitoringData = () => useMutation({
        mutationFn: async ({ selectedProject, data, user }) => {
            const { data: result, error } = await supabase.from('sandbox_monitoring_data').insert({
                sandbox_id: selectedProject.sandbox_id,
                project_id: selectedProject.id,
                metric_name: data.metric,
                value: parseFloat(data.value),
                notes: data.notes,
                timestamp: new Date().toISOString(),
                submitted_by: user.email
            }).select().single();
            if (error) throw error;
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-monitoring-data'] });
            toast.success('Data submitted');
        }
    });

    const useCreateSandbox = () => useMutation({
        mutationFn: async (newSandbox) => {
            const { data, error } = await supabase.from('sandboxes').insert([newSandbox]).select();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['sandboxes']);
            toast.success('Sandbox environment created successfully');
        }
    });

    const useCreateResource = () => useMutation({
        mutationFn: async (resource) => {
            const { error } = await supabase.from('sandbox_resources').insert(resource);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['sandbox-resources']);
            toast.success('Resource added');
        }
    });

    const useCreateBooking = () => useMutation({
        mutationFn: async (booking) => {
            const { error } = await supabase.from('sandbox_resource_bookings').insert(booking);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['resource-bookings']);
            toast.success('Booking created');
        }
    });

    const useLivingLabs = () => useQuery({
        queryKey: ['living-labs'],
        queryFn: async () => {
            const { data, error } = await supabase.from('living_labs').select('*');
            if (error) throw error;
            return data || [];
        }
    });

    const useOrganizations = () => useQuery({
        queryKey: ['organizations'],
        queryFn: async () => {
            const { data, error } = await supabase.from('organizations').select('*');
            if (error) throw error;
            return data || [];
        }
    });

    return {
        useAllSandboxes,
        useSandboxApplications,
        useMyApplications,
        useProjectMilestones,
        useMonitoringData,
        useResources,
        useBookings,
        useSubmitMonitoringData,
        useCreateSandbox,
        useCreateResource,
        useCreateBooking,
        useLivingLabs,
        useOrganizations
    };
}

