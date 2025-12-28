import { useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook to handle expressing interest in a solution.
 */
export function useExpressInterest() {
    const queryClient = useAppQueryClient();

    return useMutation({
        mutationFn: async ({ solution, data, user }) => {
            // 1. Insert Interest Record
            const { data: interest, error } = await supabase
                .from('solution_interests')
                .insert(data)
                .select()
                .single();
            if (error) throw error;

            // 2. Notify Provider via Edge Function
            await supabase.functions.invoke('email-trigger-hub', {
                body: {
                    trigger: 'solution.interest_received',
                    recipient_email: solution.contact_email || solution.support_contact_email,
                    entity_type: 'solution',
                    entity_id: solution.id,
                    variables: {
                        solutionName: solution.name_en,
                        interestedByName: data.interested_by_name,
                        municipalityId: data.municipality_id,
                        interestType: data.interest_type,
                        challengeId: data.challenge_id || null,
                        expectedTimeline: data.expected_timeline || 'Not specified',
                        budgetMin: data.expected_budget_min || null,
                        budgetMax: data.expected_budget_max || null,
                        message: data.message
                    }
                }
            });

            // 3. Log Activity
            await supabase.from('system_activities').insert({
                entity_type: 'Solution',
                entity_id: solution.id,
                activity_type: 'interest_expressed',
                description: `Interest expressed by ${data.interested_by_name}${data.challenge_id ? ' for challenge ' + data.challenge_id : ''}`,
                metadata: {
                    municipality: data.municipality_id,
                    challenge: data.challenge_id,
                    interest_type: data.interest_type
                }
            });

            return interest;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['solution-activities'] });
            queryClient.invalidateQueries({ queryKey: ['solution-interests'] });
            toast.success('Interest expressed! Provider will be notified.');
        },
        onError: (error) => {
            console.error('Failed to express interest:', error);
            toast.error('Failed to express interest');
        }
    });
}



