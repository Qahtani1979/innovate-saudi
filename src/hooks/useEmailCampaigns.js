import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageContext';

/**
 * Hook to fetch email campaigns
 */
export function useEmailCampaigns() {
    return useQuery({
        queryKey: ['email-campaigns'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('email_campaigns')
                .select('*, email_templates(template_key, name_en, name_ar, category)')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        }
    });
}

/**
 * Hook to fetch templates suitable for campaigns
 */
export function useCampaignTemplates() {
    return useQuery({
        queryKey: ['email-templates-for-campaigns'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('email_templates')
                .select('id, template_key, name_en, name_ar, category, variables')
                .eq('is_active', true)
                .eq('category', 'campaign') // Only show campaign templates
                .order('name_en', { ascending: true });
            if (error) throw error;
            return data || [];
        }
    });
}

/**
 * Hook for campaign mutations (Create, Delete)
 */
export function useCampaignMutations() {
    const queryClient = useAppQueryClient();
    const { t } = useLanguage();

    const createCampaign = useMutation({
        mutationFn: async (campaign) => {
            const { data: { user } } = await supabase.auth.getUser();
            const { data, error } = await supabase
                .from('email_campaigns')
                .insert({
                    ...campaign,
                    created_by: user?.email
                })
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
            toast.success(t({ en: 'Campaign created', ar: 'تم إنشاء الحملة' }));
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    const deleteCampaign = useMutation({
        mutationFn: async (campaignId) => {
            const { error } = await supabase
                .from('email_campaigns')
                .delete()
                .eq('id', campaignId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
            toast.success(t({ en: 'Campaign deleted', ar: 'تم حذف الحملة' }));
        }
    });

    return { createCampaign, deleteCampaign };
}

/**
 * Hook for campaign actions (Send, Pause, Resume, Preview)
 */
export function useCampaignActions() {
    const queryClient = useAppQueryClient();
    const { t } = useLanguage();

    const performAction = useMutation({
        mutationFn: async ({ campaignId, action, previewEmail }) => {
            const { data, error } = await supabase.functions.invoke('campaign-sender', {
                body: { campaign_id: campaignId, action, preview_email: previewEmail }
            });
            if (error) throw error;
            return data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['email-campaigns'] });
            if (variables.action === 'preview') {
                toast.success(t({ en: 'Preview sent', ar: 'تم إرسال المعاينة' }));
            } else if (variables.action === 'send') {
                toast.success(t({
                    en: `Campaign sent: ${data.summary?.sent || 0} emails`,
                    ar: `تم إرسال الحملة: ${data.summary?.sent || 0} رسالة`
                }));
            } else {
                toast.success(t({ en: 'Campaign updated', ar: 'تم تحديث الحملة' }));
            }
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    return { performAction };
}

