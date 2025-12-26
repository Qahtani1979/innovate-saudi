import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '../components/LanguageContext';

export function usePartnershipMutations(onCreateSuccess) {
    const queryClient = useAppQueryClient();
    const { t } = useLanguage();

    const createPartnership = useMutation({
        mutationFn: async ({ data, userEmail }) => {
            const { data: partnership, error } = await supabase
                .from('partnerships')
                .insert({
                    ...data,
                    status: 'prospect',
                    created_by: userEmail
                })
                .select() // Ensure we return the created item
                .single();
            if (error) throw error;
            return partnership;
        },
        onSuccess: (newItem) => {
            queryClient.invalidateQueries(['partnerships']);
            queryClient.invalidateQueries(['partnerships-with-visibility']);
            toast.success(t({ en: 'Partnership created successfully', ar: 'تم إنشاء الشراكة بنجاح' }));
            if (onCreateSuccess) onCreateSuccess(newItem);
        },
        onError: (error) => {
            toast.error(t({ en: 'Failed to create partnership', ar: 'فشل في إنشاء الشراكة' }));
            console.error(error);
        }
    });

    const updatePartnership = useMutation({
        mutationFn: async ({ id, ...data }) => {
            const { error } = await supabase
                .from('partnerships')
                .update(data)
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['partnerships']);
            queryClient.invalidateQueries(['partnerships-with-visibility']);
            toast.success(t({ en: 'Partnership updated successfully', ar: 'تم تحديث الشراكة بنجاح' }));
        },
        onError: (error) => {
            toast.error(t({ en: 'Failed to update partnership', ar: 'فشل في تحديث الشراكة' }));
            console.error(error);
        }
    });

    const generateRecommendations = useMutation({
        mutationFn: async ({ strategicPlanId, capabilityNeeds, partnershipTypes }) => {
            const { data, error } = await supabase.functions.invoke('strategy-partnership-matcher', {
                body: {
                    strategic_plan_id: strategicPlanId,
                    capability_needs: capabilityNeeds,
                    partnership_types: partnershipTypes
                }
            });

            if (error) throw error;
            return data?.partner_recommendations || [];
        },
        onError: (error) => {
            console.error('Generation error:', error);
            toast.error(t({ en: 'Failed to generate recommendations', ar: 'فشل في إنشاء التوصيات' }));
        }
    });

    const notifyPartner = useMutation({
        mutationFn: async ({ organizationId, recipientEmail, details }) => {
            const { error } = await supabase.functions.invoke('email-trigger-hub', {
                body: {
                    trigger: 'partnership.proposal',
                    recipient_email: recipientEmail, // 'admin@platform.gov.sa' or specific email
                    entity_type: 'organization',
                    entity_id: organizationId,
                    variables: details
                }
            });
            if (error) throw error;
        },
        onError: (error) => {
            console.error('Failed to notify partner:', error);
            // Silent failure or toast? Often silent for notifications unless critical workflow step
        }
    });

    /**
     * Refresh partnerships cache (Gold Standard Pattern)
     */
    const refreshPartnerships = () => {
        queryClient.invalidateQueries({ queryKey: ['partnerships'] });
        queryClient.invalidateQueries({ queryKey: ['partnerships-with-visibility'] });
    };

    return {
        createPartnership,
        updatePartnership,
        generateRecommendations,
        notifyPartner,
        refreshPartnerships
    };
}

export default usePartnershipMutations;

