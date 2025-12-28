import { useMutation } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook for contact form operations
 */
export function useContactMutations() {
    const submitContactForm = useMutation({
        mutationFn: async (data) => {
            // Send contact form email via trigger hub
            const { error: error1 } = await supabase.functions.invoke('email-trigger-hub', {
                body: {
                    trigger: 'contact.form',
                    recipient_email: 'platform@saudimih.sa',
                    variables: {
                        senderName: data.name,
                        senderEmail: data.email,
                        senderOrganization: data.organization,
                        subject: data.subject,
                        message: data.message
                    }
                }
            });

            if (error1) throw error1;

            // Send confirmation to user
            const { error: error2 } = await supabase.functions.invoke('email-trigger-hub', {
                body: {
                    trigger: 'contact.form_confirmation',
                    recipient_email: data.email,
                    variables: {
                        userName: data.name,
                        subject: data.subject
                    }
                }
            });

            if (error2) throw error2;

            return { success: true };
        },
        onSuccess: () => {
            // Success handling moved to component for state management
        },
        onError: (error) => {
            console.error('Contact submission error:', error);
            toast.error('Failed to send message. Please try again later.');
        }
    });

    return {
        submitContactForm
    };
}

