import { useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { useAuditLogger, AUDIT_ACTIONS } from './useAuditLogger';
import { useEmailTrigger } from './useEmailTrigger';

/**
 * Hook for MOU mutations
 */
export function useMOUMutations() {
    const queryClient = useAppQueryClient();
    const { t } = useLanguage();
    const { user } = useAuth();
    const { logCrudOperation, logStatusChange } = useAuditLogger();
    const { triggerEmail } = useEmailTrigger();

    const createMOU = useMutation({
        mutationFn: async (data) => {
            const mouData = {
                ...data,
                created_by: user?.email,
                created_at: new Date().toISOString(),
                status: data.status || 'draft',
            };

            const { data: mou, error } = await supabase
                .from('organization_partnerships')
                .insert(mouData)
                .select()
                .single();

            if (error) throw error;

            await logCrudOperation(AUDIT_ACTIONS.CREATE, 'partnership', mou.id, null, mouData);

            return mou;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['mous']);
            toast.success(t({ en: 'MOU created successfully', ar: 'تم إنشاء مذكرة التفاهم بنجاح' }));
        },
        onError: (error) => {
            toast.error(t({ en: 'Failed to create MOU', ar: 'فشل إنشاء مذكرة التفاهم' }));
            console.error('Create MOU error:', error);
        },
    });

    const updateMOU = useMutation({
        mutationFn: async ({ id, data }) => {
            const { data: currentMOU } = await supabase
                .from('organization_partnerships')
                .select('*')
                .eq('id', id)
                .single();

            const { data: mou, error } = await supabase
                .from('organization_partnerships')
                .update({ ...data, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            await logCrudOperation(AUDIT_ACTIONS.UPDATE, 'partnership', id, currentMOU, data);

            return mou;
        },
        onSuccess: (mou) => {
            queryClient.invalidateQueries(['mous']);
            queryClient.invalidateQueries(['mou', mou.id]);
            toast.success(t({ en: 'MOU updated successfully', ar: 'تم تحديث مذكرة التفاهم بنجاح' }));
        },
        onError: (error) => {
            toast.error(t({ en: 'Failed to update MOU', ar: 'فشل تحديث مذكرة التفاهم' }));
            console.error('Update MOU error:', error);
        },
    });

    const deleteMOU = useMutation({
        mutationFn: async (id) => {
            const { data: currentMOU } = await supabase
                .from('organization_partnerships')
                .select('*')
                .eq('id', id)
                .single();

            const { error } = await supabase
                .from('organization_partnerships')
                .delete()
                .eq('id', id);

            if (error) throw error;

            await logCrudOperation(AUDIT_ACTIONS.DELETE, 'partnership', id, currentMOU, { deleted: true });

            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['mous']);
            toast.success(t({ en: 'MOU deleted successfully', ar: 'تم حذف مذكرة التفاهم بنجاح' }));
        },
        onError: (error) => {
            toast.error(t({ en: 'Failed to delete MOU', ar: 'فشل حذف مذكرة التفاهم' }));
            console.error('Delete MOU error:', error);
        },
    });

    const approveMOU = useMutation({
        mutationFn: async (id) => {
            const { data: currentMOU } = await supabase
                .from('organization_partnerships')
                .select('*')
                .eq('id', id)
                .single();

            const { data: mou, error } = await supabase
                .from('organization_partnerships')
                .update({
                    status: 'active',
                    approved_by: user?.email,
                    approved_at: new Date().toISOString(),
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            await logStatusChange('partnership', id, currentMOU.status, 'active', {
                approved_by: user?.email,
            });

            // Send approval email
            await triggerEmail('mou.approved', {
                entity_type: 'partnership',
                entity_id: id,
                recipient_email: mou.created_by,
                variables: {
                    mou_title: mou.partnership_name,
                    approved_by: user?.email,
                },
            }).catch(err => console.error('Email trigger failed:', err));

            return mou;
        },
        onSuccess: (mou) => {
            queryClient.invalidateQueries(['mous']);
            queryClient.invalidateQueries(['mou', mou.id]);
            toast.success(t({ en: 'MOU approved successfully', ar: 'تمت الموافقة على مذكرة التفاهم بنجاح' }));
        },
        onError: (error) => {
            toast.error(t({ en: 'Failed to approve MOU', ar: 'فشلت الموافقة على مذكرة التفاهم' }));
            console.error('Approve MOU error:', error);
        },
    });

    return {
        createMOU,
        updateMOU,
        deleteMOU,
        approveMOU,
    };
}

export default useMOUMutations;



