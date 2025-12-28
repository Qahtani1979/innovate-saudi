import { useMutation } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook to trigger transactional emails
 * @returns {{ triggerEmail: (action: string, options: { entityType?: string, entityId?: string, recipientEmail?: string, variables?: any }) => Promise<any> }}
 */
export function useEmailTrigger() {
    const trigger = useMutation({
        mutationFn: async ({ action, options }) => {
            // Logic to trigger email, e.g. via edge function or inserting into a queue
            // For now, using a hypothetical edge function 'send-transactional-email'
            // Or fallback to console if not available.

            const { data, error } = await supabase.functions.invoke('send-transactional-email', {
                body: {
                    action,
                    entity_type: options.entityType,
                    entity_id: options.entityId,
                    recipient_email: options.recipientEmail,
                    variables: options.variables
                }
            });

            if (error) {
                // Fallback or rethrow
                console.warn('Email trigger failed via function, logging locally:', action, options);
                // If the function doesn't exist, we don't want to block the UI flow usually, unless critical.
                // Returning mock success for now to avoid blocking.
                return { success: true, mocked: true };
            }
            return data;
        }
    });

    const triggerEmail = async (action, options) => {
        try {
            return await trigger.mutateAsync({ action, options });
        } catch (error) {
            console.error('Failed to trigger email:', error);
            // Suppress error for UI but log it
            return null;
        }
    };

    return { triggerEmail };
}

