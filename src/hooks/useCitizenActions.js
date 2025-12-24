import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

export function useUserBookmarks(entityType) {
    const { user } = useAuth();
    return useQuery({
        queryKey: ['bookmarks', user?.email, entityType],
        queryFn: async () => {
            if (!user?.email) return [];
            const { data, error } = await supabase
                .from('bookmarks')
                .select('entity_id')
                .eq('user_email', user.email)
                .eq('entity_type', entityType);
            if (error) throw error;
            return data?.map(b => b.entity_id) || [];
        },
        enabled: !!user?.email
    });
}

export function useUserEnrollments() {
    const { user } = useAuth();
    return useQuery({
        queryKey: ['enrollments', user?.email],
        queryFn: async () => {
            if (!user?.email) return [];
            const { data, error } = await supabase
                .from('living_lab_participants')
                .select('living_lab_id')
                .eq('participant_email', user.email);
            if (error) throw error;
            return data?.map(e => e.living_lab_id) || [];
        },
        enabled: !!user?.email
    });
}

export function useMyPilotEnrollment(pilotId) {
    const { user } = useAuth();
    return useQuery({
        queryKey: ['enrollment', pilotId, user?.email],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('citizen_pilot_enrollments')
                .select('*')
                .eq('pilot_id', pilotId)
                .eq('user_email', user?.email)
                .maybeSingle();
            if (error) throw error;
            return data;
        },
        enabled: !!(pilotId && user?.email)
    });
}

export function useUserVotes(entityType) {
    const { user } = useAuth();
    return useQuery({
        queryKey: ['votes', user?.email, entityType],
        queryFn: async () => {
            if (!user?.email) return [];
            const { data, error } = await supabase
                .from('citizen_votes')
                .select('entity_id')
                .eq('user_email', user.email)
                .eq('entity_type', entityType);
            if (error) throw error;
            return data?.map(v => v.entity_id) || [];
        },
        enabled: !!user?.email
    });
}

export function useCitizenMutations() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const toggleBookmark = useMutation({
        mutationFn: async ({ entityId, entityType, isBookmarked }) => {
            if (!user?.email) throw new Error('User not logged in');

            if (isBookmarked) {
                const { error } = await supabase.from('bookmarks').delete()
                    .eq('user_email', user.email)
                    .eq('entity_id', entityId)
                    .eq('entity_type', entityType);
                if (error) throw error;
                return 'removed';
            } else {
                const { error } = await supabase.from('bookmarks').insert({
                    user_email: user.email,
                    entity_id: entityId,
                    entity_type: entityType
                });
                if (error) throw error;
                return 'added';
            }
        },
        onSuccess: (result, { entityType }) => {
            queryClient.invalidateQueries(['bookmarks', user?.email, entityType]);
            toast.success(result === 'added' ? 'Bookmarked!' : 'Bookmark removed');
        },
        onError: () => toast.error('Failed to update bookmark')
    });

    const toggleVote = useMutation({
        mutationFn: async ({ entityId, entityType, isVoted }) => {
            if (!user?.email) throw new Error('User not logged in');

            if (isVoted) {
                const { error } = await supabase.from('citizen_votes').delete()
                    .eq('user_email', user.email)
                    .eq('entity_id', entityId)
                    .eq('entity_type', entityType);
                if (error) throw error;
                return 'removed';
            } else {
                const { error } = await supabase.from('citizen_votes').insert({
                    user_email: user.email,
                    user_id: user.id,
                    entity_id: entityId,
                    entity_type: entityType,
                    vote_type: 'upvote'
                });
                if (error) throw error;
                return 'added';
            }
        },
        onSuccess: (result, { entityType }) => {
            queryClient.invalidateQueries(['votes', user?.email, entityType]);
            toast.success(result === 'added' ? 'Voted!' : 'Vote removed');
        },
        onError: () => toast.error('Failed to update vote')
    });

    const enrollInLab = useMutation({
        mutationFn: async ({ labId }) => {
            if (!user?.email) throw new Error('User not logged in');
            const { error } = await supabase.from('living_lab_participants').insert({
                living_lab_id: labId,
                participant_email: user.email,
                participant_type: 'citizen',
                status: 'pending',
                joined_at: new Date().toISOString()
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['enrollments', user?.email]);
            toast.success('Enrollment submitted!');
        },
        onError: () => toast.error('Failed to enroll')
    });

    return { toggleBookmark, toggleVote, enrollInLab };
}
