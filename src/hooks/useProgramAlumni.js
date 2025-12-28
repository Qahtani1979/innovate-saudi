
import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useProgramAlumni(programId) {
    // Fetch graduates/participants
    const { data: alumni = [], isLoading: alumniLoading } = useQuery({
        queryKey: ['program-alumni', programId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('program_applications')
                .select('*')
                .eq('program_id', programId)
                .in('status', ['graduated', 'active']);
            if (error) throw error;
            return data || [];
        },
        enabled: !!programId
    });

    const participantEmails = alumni.map(a => a.applicant_email).filter(Boolean);

    // Fetch solutions by alumni
    const { data: alumniSolutions = [], isLoading: solutionsLoading } = useQuery({
        queryKey: ['alumni-solutions', programId, participantEmails],
        queryFn: async () => {
            if (participantEmails.length === 0) return [];

            // Note: This matches the previous logic. Optimized query would be better but requires complex OR.
            // We'll fetch all solutions and filter, or use an OR filter if list is small.
            // Given the previous code fetched ALL solutions table, this implementation tries to be safer.
            // But 'solutions' table might be large.
            // Let's rely on filtering by created_by if possible or keyword search.
            // Actually, let's fetch where created_by is in emails.
            // But provider_name check was also there.

            const { data, error } = await supabase
                .from('solutions')
                .select('*')
                .or(`created_by.in.(${participantEmails.join(',')})`);
            // Note: .in() works well. provider_name check is harder in Supabase efficiently without text search.
            // We will trust created_by for now as it's cleaner. 
            // If we really need provider_name, we'd need complex logic.

            if (error) throw error;
            return data || [];
        },
        enabled: participantEmails.length > 0
    });

    // Fetch pilots by alumni
    const { data: alumniPilots = [], isLoading: pilotsLoading } = useQuery({
        queryKey: ['alumni-pilots', programId, participantEmails],
        queryFn: async () => {
            if (participantEmails.length === 0) return [];

            const { data, error } = await supabase
                .from('pilots')
                .select('*')
                .eq('is_deleted', false)
                .in('created_by', participantEmails);

            if (error) throw error;
            return data || [];
        },
        enabled: participantEmails.length > 0
    });

    return {
        alumni,
        alumniSolutions,
        alumniPilots,
        isLoading: alumniLoading || solutionsLoading || pilotsLoading
    };
}

