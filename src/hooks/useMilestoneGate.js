import { useMutation } from '@/hooks/useAppQueryClient';
/**
 * Hook for Milestone Approval Gate
 * Handles logic for approving/rejecting pilot milestones.
 */

import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';

export function useMilestoneApproval() {
    const { t } = useLanguage();
    const { user } = useAuth();
    const queryClient = useAppQueryClient();

    const approveMutation = useMutation({
        mutationFn: async ({ pilot, milestone, milestoneIndex, approved, comments }) => {
            const updatedMilestones = [...(pilot.milestones || [])];
            updatedMilestones[milestoneIndex] = {
                ...milestone,
                approval_status: approved ? 'approved' : 'rejected',
                approved_by: user?.email,
                approval_date: new Date().toISOString(),
                approval_comments: comments
            };

            const { error } = await supabase.from('pilots').update({
                milestones: updatedMilestones
            }).eq('id', pilot.id);
            if (error) throw error;

            await supabase.from('system_activities').insert({
                activity_type: 'milestone_approval',
                entity_type: 'Pilot',
                entity_id: pilot.id,
                description: `Milestone "${milestone.name}" ${approved ? 'approved' : 'rejected'}`,
                metadata: { milestone_index: milestoneIndex, decision: approved ? 'approved' : 'rejected', comments }
            });
        },
        onSuccess: (_, { approved }) => {
            queryClient.invalidateQueries({ queryKey: ['pilot'] });
            toast.success(t({
                en: approved ? 'Milestone approved' : 'Milestone rejected',
                ar: approved ? 'تمت الموافقة على المعلم' : 'تم رفض المعلم'
            }));
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    return { approveMutation };
}



