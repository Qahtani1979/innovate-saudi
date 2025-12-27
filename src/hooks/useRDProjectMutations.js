import { useMutation } from '@tanstack/react-query';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageContext';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';

export function useRDProjectMutations() {
    const queryClient = useAppQueryClient();
    const { t } = useLanguage();
    const { notify } = useNotificationSystem();

    const createRDProject = useMutation({
        mutationFn: async (newProject) => {
            const { data, error } = await supabase
                .from('rd_projects')
                .insert([/** @type {any} */(newProject)])
                .select()
                .single();

            if (error) throw error;
            if (error) throw error;

            // Notification: Project Created
            if (data) {
                await notify({
                    type: 'rd_project_created',
                    entityType: 'rd_project',
                    entityId: data.id,
                    recipientEmails: [
                        data.principal_investigator_email || data.principal_investigator?.email, // Handle both structures
                        ...(data.team_members || []).map(m => m.email)
                    ].filter(Boolean),
                    title: 'R&D Project Created',
                    message: `New R&D project "${data.title_en}" has been created.`,
                    sendEmail: true,
                    emailTemplate: 'rd_project.created',
                    emailVariables: {
                        project_title: data.title_en,
                        project_code: data.code,
                        pi_name: data.principal_investigator_name || data.principal_investigator?.name
                    }
                });
            }

            return /** @type {any} */(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rd-projects-with-visibility'] });
            toast.success(t({ en: 'Project created successfully', ar: 'تم إنشاء المشروع بنجاح' }));
        },
        onError: (error) => {
            toast.error(t({ en: 'Failed to create project', ar: 'فشل إنشاء المشروع' }) + ': ' + error.message);
        }
    });

    const updateRDProject = useMutation({
        /** @param {{ id: string, [key: string]: any }} params */
        mutationFn: async ({ id, ...updates }) => {
            const { data, error } = await supabase
                .from('rd_projects')
                .update(/** @type {any} */(updates))
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            if (error) throw error;

            // Notification: Project Updated
            if (data) {
                await notify({
                    type: 'rd_project_updated',
                    entityType: 'rd_project',
                    entityId: data.id,
                    recipientEmails: [
                        data.principal_investigator_email || data.principal_investigator?.email
                    ].filter(Boolean),
                    title: 'R&D Project Updated',
                    message: `R&D project "${data.title_en}" details have been updated.`,
                    sendEmail: true,
                    emailTemplate: 'rd_project.updated',
                    emailVariables: {
                        project_title: data.title_en,
                        project_code: data.code,
                        update_summary: 'Project details updated.'
                    }
                });
            }

            return /** @type {any} */(data);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['rd-projects-with-visibility'] });
            queryClient.invalidateQueries({ queryKey: ['rd-project', data.id] });
            toast.success(t({ en: 'Project updated successfully', ar: 'تم تحديث المشروع بنجاح' }));
        },
        onError: (error) => {
            toast.error(t({ en: 'Failed to update project', ar: 'فشل تحديث المشروع' }) + ': ' + error.message);
        }
    });

    const deleteRDProject = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase
                .from('rd_projects')
                .update({ is_deleted: true, deleted_date: new Date().toISOString() })
                .eq('id', /** @type {string} */(/** @type {unknown} */ (id)))
                .select()
                .single();

            if (error) throw error;

            // Notification: Project Deleted
            // @ts-ignore
            if (data) {
                await notify({
                    type: 'rd_project_deleted',
                    entityType: 'rd_project',
                    entityId: data.id,
                    recipientEmails: [
                        data.principal_investigator_email || data.principal_investigator?.email
                    ].filter(Boolean),
                    title: 'R&D Project Deleted',
                    message: `R&D project "${data.title_en}" has been deleted.`,
                    sendEmail: true, // Optional: might prefer in-app only for deletion
                    emailTemplate: 'rd_project.deleted',
                    emailVariables: {
                        project_title: data.title_en,
                        project_code: data.code
                    }
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rd-projects-with-visibility'] });
            toast.success(t({ en: 'Project deleted', ar: 'تم حذف المشروع' }));
        },
        onError: (error) => {
            toast.error(t({ en: 'Failed to delete project', ar: 'فشل حذف المشروع' }) + ': ' + error.message);
        }
    });

    const approveMilestone = useMutation({
        /** @param {{ project: any, milestoneName: string, approver: string, notes: string, evidence: any[] }} params */
        mutationFn: async ({ project, milestoneName, approver, notes, evidence }) => {
            const updatedMilestones = project?.timeline?.milestones?.map(m =>
                m.name === milestoneName
                    ? {
                        ...m,
                        status: 'completed',
                        completed_date: new Date().toISOString(),
                        approval_status: 'approved',
                        approved_by: approver,
                        approval_date: new Date().toISOString(),
                        approval_comments: notes,
                        evidence_urls: evidence
                    }
                    : m
            ) || [];

            const { data, error } = await supabase
                .from('rd_projects')
                .update({
                    timeline: {
                        ...project.timeline,
                        milestones: updatedMilestones
                    }
                })
                .eq('id', project.id)
                .select()
                .single();

            if (error) throw error;
            if (error) throw error;

            // Notification: Milestone Approved
            if (data) {
                await notify({
                    type: 'rd_milestone_completed',
                    entityType: 'rd_project',
                    entityId: data.id,
                    recipientEmails: [
                        data.principal_investigator_email || data.principal_investigator?.email,
                        ...(data.team_members || []).map(m => m.email)
                    ].filter(Boolean),
                    title: 'Milestone Approved',
                    message: `Milestone "${milestoneName}" has been approved for project "${data.title_en}".`,
                    sendEmail: true,
                    emailTemplate: 'rd_project.milestone_completed',
                    emailVariables: {
                        project_title: data.title_en,
                        project_code: data.code,
                        milestone_name: milestoneName,
                        approver_name: approver
                    }
                });
            }

            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['rd-projects-with-visibility'] });
            queryClient.invalidateQueries({ queryKey: ['rd-project', data.id] });
            toast.success(t({ en: 'Milestone approved', ar: 'تمت الموافقة على المعلم' }));
        },
        onError: (error) => {
            toast.error(t({ en: 'Failed to approve milestone', ar: 'فشل الموافقة على المعلم' }));
        }
    });

    const addProjectPublication = useMutation({
        /** @param {{ id: string, publications: any[], newPublication: any }} params */
        mutationFn: async ({ id, publications, newPublication }) => {
            const { data, error } = await supabase
                .from('rd_projects')
                .update({
                    publications: [...(publications || []), newPublication]
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['rd-projects-with-visibility'] });
            queryClient.invalidateQueries({ queryKey: ['rd-project', data.id] });
            toast.success(t({ en: 'Publication added successfully', ar: 'تم إضافة النشر بنجاح' }));
        },
        onError: (error) => {
            toast.error(t({ en: 'Failed to add publication', ar: 'فشل إضافة النشر' }) + ': ' + error.message);
        }
    });

    /**
     * Refresh R&D projects cache (Gold Standard Pattern)
     */
    const refreshRDProjects = () => {
        queryClient.invalidateQueries({ queryKey: ['rd-projects-with-visibility'] });
        queryClient.invalidateQueries({ queryKey: ['rd-projects'] });
    };

    return {
        createRDProject,
        updateRDProject,
        deleteRDProject,
        approveMilestone,
        addProjectPublication,
        refreshRDProjects  // ✅ Gold Standard
    };
}

export function useRDProjectInvalidator() {
    const queryClient = useAppQueryClient();
    return {
        invalidateRDProject: (id) => queryClient.invalidateQueries({ queryKey: ['rd-project', id] }),
        invalidateRDProjects: () => queryClient.invalidateQueries({ queryKey: ['rd-projects-with-visibility'] })
    };
}

