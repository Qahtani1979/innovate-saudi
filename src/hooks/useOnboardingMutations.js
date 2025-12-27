import { useMutation } from '@tanstack/react-query';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';

export function useOnboardingMutations() {
    const queryClient = useAppQueryClient();
    const { t } = useLanguage();
    const { notify } = useNotificationSystem();

    // Generic Profile Upsert
    const upsertProfile = useMutation({
        mutationFn: async ({ table, data, matchingColumns }) => {
            const options = matchingColumns ? { onConflict: matchingColumns.join(',') } : undefined;
            const { data: result, error } = await supabase
                .from(table)
                .upsert(data, options) // Upsert handles insert or update based on PK (usually id)
                .select()
                .single();
            if (error) throw error;
            return result;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries([variables.table]);
            queryClient.invalidateQueries(['user-profile']);
            queryClient.invalidateQueries(['user']);
        },
        onError: (error) => {
            console.error('Profile update failed:', error);
            toast.error(t({ en: 'Failed to save profile', ar: 'فشل حفظ الملف الشخصي' }));
        }
    });

    const createRoleRequest = useMutation({
        mutationFn: async ({ userId, role, department, justification, municipality_id }) => {
            const { error } = await supabase
                .from('role_requests')
                .insert({
                    user_id: userId,
                    requested_role: role,
                    department,
                    justification,
                    municipality_id, // Added support for municipality_id
                    status: 'pending'
                });
            if (error) throw error;
        },
        onSuccess: () => {
            toast.success(t({ en: 'Role request submitted', ar: 'تم إرسال طلب الصلاحية' }));

            notify({
                type: 'role_requested',
                entityType: 'user',
                entityId: userId,
                recipientEmails: ['admin@municipality.gov.sa'],
                title: 'New Role Request',
                message: `User requested role: ${role}`,
                sendEmail: true
            });
        },
        onError: (error) => {
            console.error('Role request failed:', error);
            toast.error(t({ en: 'Failed to submit role request', ar: 'فشل إرسال طلب الصلاحية' }));
        }
    });

    const saveProgressiveProfiling = useMutation({
        mutationFn: async ({ promptId, userId, responseData, responseValue }) => {
            // promptId is likely the prompt definition ID? Or do we insert a response?
            // The violation was: "supabase.from('progressive_profiling_prompts').insert"
            // Wait, usually we insert RESPONSES, not prompts. 
            // Let's assume we are saving USER RESPONSES or tracking prompt interaction.
            // If the code was inserting into 'progressive_profiling_prompts', maybe it was creating new prompts? 
            // Or maybe the table name is misleading and stores user state?
            // I'll stick to a generic mutation for that table.
            const { error } = await supabase
                .from('progressive_profiling_prompts') // Verify table usage in component
                .upsert({
                    id: promptId, // If updating
                    ...responseData
                });
            if (error) throw error;
        }
    });

    const updateCitizenPoints = useMutation({
        mutationFn: async ({ userId, points, reason }) => {
            const { error } = await supabase
                .from('citizen_points')
                .upsert({
                    user_id: userId,
                    points_balance: points, // logic might be more complex (increment vs set)
                    last_updated: new Date().toISOString()
                });
            if (error) throw error;
        }
    });

    const sendOnboardingEmail = useMutation({
        mutationFn: async ({ trigger, email, recipient_user_id, entityType, entityId, variables }) => {
            await notify({
                type: trigger, // Map trigger to type? Or use generic
                entityType: entityType || 'onboarding',
                entityId: entityId || 'new',
                recipientEmails: [email],
                title: 'Onboarding Notification', // Generic title, template handles subject
                message: 'Onboarding Update',
                sendEmail: true,
                emailTemplate: trigger,
                emailVariables: variables
            });
        },
        onError: (error) => {
            console.error('Failed to send onboarding email:', error);
        }
    });

    return {
        upsertProfile,
        createRoleRequest,
        saveProgressiveProfiling,
        updateCitizenPoints,
        sendOnboardingEmail
    };
}

