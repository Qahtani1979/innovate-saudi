import { useQuery, useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '../components/LanguageContext';
import { useNotificationSystem } from './useNotificationSystem';

/**
 * Hook for fetching a single living lab by ID.
 */
export function useLivingLab(id) {
    return useQuery({
        queryKey: ['living-lab', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('living_labs')
                .select(`
          *,
          municipality:municipalities(id, name_en, name_ar, region_id),
          sector:sectors(id, name_en, name_ar)
        `)
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        },
        enabled: !!id,
        staleTime: 1000 * 60 * 5,
    });
}

/**
 * Hook for fetching R&D projects linked to a living lab
 */
export function useLivingLabProjects(labId) {
    return useQuery({
        queryKey: ['rd-projects', labId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('rd_projects')
                .select('*')
                .eq('living_lab_id', labId);

            if (error) throw error;
            return data || [];
        },
        enabled: !!labId
    });
}

/**
 * Hook to manage living lab mutations
 */
export function useLivingLabMutations(labId) {
    const queryClient = useAppQueryClient();
    const { t } = useLanguage();
    const { notify } = useNotificationSystem();

    const updateLivingLab = useMutation({
        mutationFn: async (data) => {
            const { error } = await supabase
                .from('living_labs')
                .update(data)
                .eq('id', labId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['living-lab', labId] });
            queryClient.invalidateQueries({ queryKey: ['living-labs-with-visibility'] });
            toast.success(t({ en: 'Living lab updated', ar: 'تم تحديث المختبر' }));
        },
        onError: (error) => {
            toast.error(t({ en: 'Failed to update living lab', ar: 'فشل تحديث المختبر' }) + ': ' + error.message);
        }
    });

    const updateProjectMilestones = useMutation({
        mutationFn: async ({ lab, projectId, milestones }) => {
            const updatedProjects = (lab.current_projects || []).map(p => {
                if (p.id === projectId) {
                    return { ...p, milestones };
                }
                return p;
            });

            const { error } = await supabase
                .from('living_labs')
                .update({ current_projects: updatedProjects })
                .eq('id', labId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['living-lab', labId] });
            toast.success(t({ en: 'Milestones updated', ar: 'تم تحديث المعالم' }));
        }
    });

    const launchLab = useMutation({
        mutationFn: async ({ lab, checklist, notes }) => {
            // 1. Update lab status
            const { error: updateError } = await supabase
                .from('living_labs')
                .update({
                    status: 'operational',
                    launch_date: new Date().toISOString().split('T')[0],
                    launch_checklist: checklist,
                    launch_notes: notes
                })
                .eq('id', labId);

            if (updateError) throw updateError;

            // 2. Notify stakeholders (using unified system)
            await notify({
                type: 'livinglab_launched',
                entityType: 'living_lab',
                entityId: labId,
                recipientEmails: [lab.director_email, lab.manager_email].filter(Boolean),
                title: `Living Lab Launched: ${lab.name_en}`,
                titleAr: `تم إطلاق المختبر الحي: ${lab.name_ar}`,
                message: `${lab.name_en} is now operational and accepting research projects.`,
                messageAr: `${lab.name_ar} الآن يعمل ويستقبل المشاريع البحثية.`,
                metadata: { lab_name: lab.name_en }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['living-lab', labId] });
            queryClient.invalidateQueries({ queryKey: ['living-labs-with-visibility'] });
            toast.success(t({ en: 'Living Lab launched successfully', ar: 'تم إطلاق المختبر بنجاح' }));
        }
    });

    return {
        updateLivingLab,
        updateProjectMilestones,
        launchLab
    };
}


/**
 * Hook for fetching sandboxes linked to a living lab
 */
export function useLivingLabSandboxes(labId) {
    return useQuery({
        queryKey: ['living-lab-sandboxes', labId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('sandboxes')
                .select('*')
                .eq('living_lab_id', labId);
            if (error) throw error;
            return data || [];
        },
        enabled: !!labId
    });
}

/**
 * Hook for fetching expert evaluations for a living lab
 */
export function useLivingLabEvaluations(labId) {
    return useQuery({
        queryKey: ['living-lab-evaluations', labId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('expert_evaluations')
                .select('*')
                .eq('entity_type', 'living_lab')
                .eq('entity_id', labId);
            if (error) throw error;
            return data || [];
        },
        enabled: !!labId
    });
}

