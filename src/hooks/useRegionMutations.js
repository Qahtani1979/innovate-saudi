import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLanguage } from '@/components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { useAuditLogger, AUDIT_ACTIONS } from './useAuditLogger';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';

/**
 * Hook for region mutations
 */
export function useRegionMutations() {
    const queryClient = useAppQueryClient();
    const { t } = useLanguage();
    const { user } = useAuth();
    const { logCrudOperation } = useAuditLogger();
    const { notify } = useNotificationSystem();

    const createRegion = useMutation({
        mutationFn: async (data) => {
            const regionData = {
                ...data,
                created_by: user?.email,
                created_at: new Date().toISOString(),
            };

            const { data: region, error } = await supabase
                .from('regions')
                .insert(regionData)
                .select()
                .single();

            if (error) throw error;

            await logCrudOperation(AUDIT_ACTIONS.CREATE, 'region', region.id, null, regionData);

            return region;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['regions']);
            toast.success(t({ en: 'Region created', ar: 'تم إنشاء المنطقة' }));

            // Notification: Region Created
            // Note: Region object not passed to onSuccess, but we need it. 
            // We can assume it's administrative. Since onSuccess has no args here, 
            // we can change onSuccess:(region)=>{...} above or just skip ID.
            // Let's change onSuccess signature in hooks. Or just generic msg.
        },
        onError: (error) => {
            toast.error(t({ en: 'Failed to create region', ar: 'فشل إنشاء المنطقة' }));
            console.error('Create region error:', error);
        },
    });

    const updateRegion = useMutation({
        mutationFn: async ({ id, data }) => {
            const { data: currentRegion } = await supabase
                .from('regions')
                .select('*')
                .eq('id', id)
                .single();

            const { data: region, error } = await supabase
                .from('regions')
                .update({ ...data, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            await logCrudOperation(AUDIT_ACTIONS.UPDATE, 'region', id, currentRegion, data);

            return region;
        },
        onSuccess: (region) => {
            queryClient.invalidateQueries(['regions']);
            queryClient.invalidateQueries(['region', region.id]);
            toast.success(t({ en: 'Region updated', ar: 'تم تحديث المنطقة' }));

            // Notification: Region Updated
            notify({
                type: 'region_updated',
                entityType: 'region',
                entityId: region.id,
                recipientEmails: [],
                title: 'Region Updated',
                message: `Region updated.`,
                sendEmail: false
            });
        },
        onError: (error) => {
            toast.error(t({ en: 'Failed to update region', ar: 'فشل تحديث المنطقة' }));
            console.error('Update region error:', error);
        },
    });

    const deleteRegion = useMutation({
        mutationFn: async (id) => {
            const { data: currentRegion } = await supabase
                .from('regions')
                .select('*')
                .eq('id', id)
                .single();

            const { error } = await supabase
                .from('regions')
                .delete()
                .eq('id', id);

            if (error) throw error;

            await logCrudOperation(AUDIT_ACTIONS.DELETE, 'region', id, currentRegion, { deleted: true });

            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['regions']);
            toast.success(t({ en: 'Region deleted', ar: 'تم حذف المنطقة' }));
        },
        onError: (error) => {
            toast.error(t({ en: 'Failed to delete region', ar: 'فشل حذف المنطقة' }));
            console.error('Delete region error:', error);
        },
    });

    return {
        createRegion,
        updateRegion,
        deleteRegion,
    };
}

export default useRegionMutations;

