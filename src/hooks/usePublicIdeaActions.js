import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook to handle public idea submission actions
 */
export function usePublicIdeaActions() {

    const analyzeIdea = async ({ idea, municipality, sessionId }) => {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/public-idea-ai`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
            },
            body: JSON.stringify({
                idea,
                municipality,
                session_id: sessionId,
                user_type: 'anonymous'
            })
        });

        const result = await response.json();

        if (response.status === 429) {
            const error = new Error('Rate limit exceeded');
            error.rateLimit = result.rate_limit;
            throw error;
        }

        if (!response.ok) {
            throw new Error(result.error || 'AI generation failed');
        }

        return result;
    };

    const submitIdeaMutation = useMutation({
        mutationFn: async ({ formData, initialIdea, contactInfo, language }) => {
            const { data, error } = await supabase
                .from('citizen_ideas')
                .insert({
                    title: language === 'ar' ? formData.title_ar : formData.title,
                    description: language === 'ar' ? formData.description_ar : formData.description,
                    category: formData.category,
                    municipality_id: formData.municipality_id || null,
                    tags: formData.tags,
                    status: 'pending',
                    is_published: false
                })
                .select()
                .single();

            if (error) throw error;

            // Metadata handling and email trigger could be here or handled in the component. 
            // For simplicity, we just do the insert here as the component had complex logic.
            // But to fully refactor, we should move the email logic here or keeping it there is fine if we return data.

            // Let's do the email trigger here if contact info exists
            if (!contactInfo.is_anonymous && contactInfo.email) {
                try {
                    await supabase.functions.invoke('email-trigger-hub', {
                        body: {
                            trigger: 'idea.submitted',
                            recipient_email: contactInfo.email,
                            variables: {
                                userName: contactInfo.name || 'Citizen',
                                ideaTitle: formData.title,
                                ideaDescription: formData.description,
                                ideaCategory: formData.category,
                                submissionDate: new Date().toISOString()
                            }
                        }
                    });
                } catch (emailError) {
                    console.log('Email notification failed (non-critical):', emailError);
                }
            }

            return data;
        },
        onError: (error) => {
            console.error('Submit idea error:', error);
        }
    });

    return {
        analyzeIdea,
        submitIdea: submitIdeaMutation
    };
}
