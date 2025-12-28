import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook to handle public idea submission actions
 */
export function usePublicIdeaActions() {
    /**
     * @type {import('@tanstack/react-query').UseMutationResult<any, any, { idea: any, municipality: any, sessionId: any, user_id: any, user_type?: string }>}
     */
    const analyzeIdeaMutation = useMutation({
        mutationFn: async (params) => {
            const { idea, municipality, sessionId, user_id, user_type } = params;
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
                    user_id,
                    user_type: user_type || 'anonymous'
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
        }
    });

    /**
     * @type {import('@tanstack/react-query').UseMutationResult<any, any, { formData: any, initialIdea: any, contactInfo: any, language: any }>}
     */
    const submitIdeaMutation = useMutation({
        mutationFn: async (params) => {
            const { formData, initialIdea, contactInfo, language } = params;
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

            // Email trigger logic
            if (contactInfo && !contactInfo.is_anonymous && contactInfo.email) {
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

                }
            }

            return data;
        },
        onError: (error) => {
            console.error('Submit idea error:', error);
        }
    });

    return {
        analyzeIdea: analyzeIdeaMutation,
        submitIdea: submitIdeaMutation
    };
}
