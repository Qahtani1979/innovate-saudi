import { useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '../components/LanguageContext';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';

export function usePartnershipMutations(onCreateSuccess) {
    const queryClient = useAppQueryClient();
    const { t } = useLanguage();
    const { notify } = useNotificationSystem();

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

            // Notification: Partnership Created
            notify({
                type: 'partnership_created',
                entityType: 'partnership',
                entityId: newItem?.id || 'new',
                recipientEmails: [newItem?.created_by].filter(Boolean),
                title: 'Partnership Request Submitted',
                message: 'Your partnership request has been submitted successfully.',
                sendEmail: true,
                emailTemplate: 'partnership.submitted',
                emailVariables: {
                    partnership_title: newItem?.organization_name || 'Partnership',
                    submission_date: new Date().toLocaleDateString()
                }
            });

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
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(['partnerships']);
            queryClient.invalidateQueries(['partnerships-with-visibility']);
            toast.success(t({ en: 'Partnership updated successfully', ar: 'تم تحديث الشراكة بنجاح' }));

            // Notification: Status Change (variables has 'status' if updated)
            if (variables.status) {
                // Note: We don't have the creator email here easily without fetching.
                // For now, we assume the user updating is NOT the creator, but admin.
                // We'll skip email for simplified Phase 1 unless we fetch the record.
            }
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
            await notify({
                type: 'partnership_proposal',
                entityType: 'organization',
                entityId: organizationId,
                recipientEmails: [recipientEmail],
                title: 'New Partnership Proposal',
                message: 'You have received a new partnership proposal.',
                sendEmail: true,
                emailTemplate: 'partnership.proposal',
                emailVariables: details
            });
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



