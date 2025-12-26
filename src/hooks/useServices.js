import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { useVisibilitySystem } from '@/hooks/visibility/useVisibilitySystem';
import { useAuditLogger, AUDIT_ACTIONS } from './useAuditLogger';

export function useServices() {
    return useQuery({
        queryKey: ['services-all'],
        queryFn: async () => {
            const { data, error } = await supabase.from('services').select('*').order('name_en');
            if (error) throw error;
            return data || [];
        }
    });
}

/**
 * Hook for service catalog with categories and visibility
 */
export function useServiceCatalog(options = {}) {
    const { category, status, limit = 100 } = options;
    const { applyVisibilityRules } = useVisibilitySystem();

    return useQuery({
        queryKey: ['service-catalog', { category, status, limit }],
        queryFn: async () => {
            let query = supabase
                .from('services')
                .select('*')
                .order('name_en')
                .limit(limit);

            query = applyVisibilityRules(query, 'service');

            if (category) {
                query = query.eq('category', category);
            }
            if (status) {
                query = query.eq('status', status);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Hook for service mutations
 */
export function useServiceMutations() {
    const queryClient = useAppQueryClient();
    const { t } = useLanguage();
    const { user } = useAuth();
    const { logCrudOperation } = useAuditLogger();

    const createService = useMutation({
        mutationFn: async (data) => {
            const serviceData = {
                ...data,
                created_by: user?.email,
                created_at: new Date().toISOString(),
            };

            const { data: service, error } = await supabase
                .from('services')
                .insert(serviceData)
                .select()
                .single();

            if (error) throw error;

            await logCrudOperation(AUDIT_ACTIONS.CREATE, 'service', service.id, null, serviceData);

            return service;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['services-all']);
            queryClient.invalidateQueries(['service-catalog']);
            toast.success(t({ en: 'Service created', ar: 'تم إنشاء الخدمة' }));
        },
        onError: (error) => {
            toast.error(t({ en: 'Failed to create service', ar: 'فشل إنشاء الخدمة' }));
            console.error('Create service error:', error);
        },
    });

    const updateService = useMutation({
        mutationFn: async ({ id, data }) => {
            const { data: currentService } = await supabase
                .from('services')
                .select('*')
                .eq('id', id)
                .single();

            const { data: service, error } = await supabase
                .from('services')
                .update({ ...data, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            await logCrudOperation(AUDIT_ACTIONS.UPDATE, 'service', id, currentService, data);

            return service;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['services-all']);
            queryClient.invalidateQueries(['service-catalog']);
            toast.success(t({ en: 'Service updated', ar: 'تم تحديث الخدمة' }));
        },
        onError: (error) => {
            toast.error(t({ en: 'Failed to update service', ar: 'فشل تحديث الخدمة' }));
            console.error('Update service error:', error);
        },
    });

    const deleteService = useMutation({
        mutationFn: async (id) => {
            const { data: currentService } = await supabase
                .from('services')
                .select('*')
                .eq('id', id)
                .single();

            const { error } = await supabase
                .from('services')
                .delete()
                .eq('id', id);

            if (error) throw error;

            await logCrudOperation(AUDIT_ACTIONS.DELETE, 'service', id, currentService, { deleted: true });

            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['services-all']);
            queryClient.invalidateQueries(['service-catalog']);
            toast.success(t({ en: 'Service deleted', ar: 'تم حذف الخدمة' }));
        },
        onError: (error) => {
            toast.error(t({ en: 'Failed to delete service', ar: 'فشل حذف الخدمة' }));
            console.error('Delete service error:', error);
        },
    });

    return {
        createService,
        updateService,
        deleteService,
    };
}

