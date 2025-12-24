import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useServiceQuality() {
    const queryClient = useQueryClient();

    const useServices = () => useQuery({
        queryKey: ['services-quality'],
        queryFn: async () => {
            const { data, error } = await supabase.from('services').select('*');
            if (error) throw error;
            return data || [];
        }
    });

    const useServicePerformance = () => useQuery({
        queryKey: ['service-performance'],
        queryFn: async () => {
            const { data, error } = await supabase.from('service_performance').select('*');
            if (error) throw error;
            return data || [];
        }
    });

    const useCitizenFeedback = () => useQuery({
        queryKey: ['citizen-feedback-services'],
        queryFn: async () => {
            const { data, error } = await supabase.from('citizen_feedback').select('*');
            if (error) throw error;
            return data || [];
        }
    });

    const useSubmitRating = () => useMutation({
        mutationFn: async ({ serviceId, rating, comment, municipalityId }) => {
            const { error } = await supabase.from('citizen_feedback').insert({
                service_id: serviceId,
                feedback_type: 'service_rating',
                satisfaction_score: rating,
                comment: comment,
                municipality_id: municipalityId || null
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['citizen-feedback-services'] });
            toast.success('Rating submitted successfully'); // Simplified message, can be localized in component
        }
    });

    return {
        useServices,
        useServicePerformance,
        useCitizenFeedback,
        useSubmitRating
    };
}
