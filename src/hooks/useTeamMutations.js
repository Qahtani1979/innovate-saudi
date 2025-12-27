import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { useLanguage } from '@/components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { useAuditLogger, AUDIT_ACTIONS } from './useAuditLogger';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';

/**
 * Hook to fetch all teams
 * @returns {object} React Query result with teams data
 */
export function useTeams() {
    return useQuery({
        queryKey: ['teams'],
        queryFn: async () => {
            const { data, error } = await supabase.from('teams').select('*');
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 5 // 5 minutes
    });
}

export function useTeamMutations() {
    const queryClient = useAppQueryClient();
    const { t } = useLanguage();
    const { user } = useAuth();
    const { logCrudOperation } = useAuditLogger();
    const { notify } = useNotificationSystem();

    const createTeam = useMutation({
        mutationFn: async (data) => {
            const teamData = {
                ...data,
                created_by: user?.email,
                created_at: new Date().toISOString(),
            };

            const { data: team, error } = await supabase
                .from('teams')
                .insert(teamData)
                .select()
                .single();

            if (error) throw error;

            await logCrudOperation(AUDIT_ACTIONS.CREATE, 'team', team.id, null, teamData);

            return team;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['teams']);
            notify.success(t({ en: 'Team created', ar: 'تم إنشاء الفريق' }));
        },
        onError: (error) => {
            notify.error(t({ en: 'Failed to create team', ar: 'فشل إنشاء الفريق' }));
            console.error('Create team error:', error);
        },
    });

    const updateTeam = useMutation({
        mutationFn: async ({ id, data }) => {
            const { data: currentTeam } = await supabase
                .from('teams')
                .select('*')
                .eq('id', id)
                .single();

            const { data: team, error } = await supabase
                .from('teams')
                .update({ ...data, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            await logCrudOperation(AUDIT_ACTIONS.UPDATE, 'team', id, currentTeam, data);

            return team;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['teams']);
            notify.success(t({ en: 'Team updated', ar: 'تم تحديث الفريق' }));
        },
        onError: (error) => {
            notify.error(t({ en: 'Failed to update team', ar: 'فشل تحديث الفريق' }));
            console.error('Update team error:', error);
        },
    });

    const deleteTeam = useMutation({
        mutationFn: async (id) => {
            const { data: currentTeam } = await supabase
                .from('teams')
                .select('*')
                .eq('id', id)
                .single();

            const { error } = await supabase
                .from('teams')
                .delete()
                .eq('id', id);

            if (error) throw error;

            await logCrudOperation(AUDIT_ACTIONS.DELETE, 'team', id, currentTeam, { deleted: true });

            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['teams']);
            notify.success(t({ en: 'Team deleted', ar: 'تم حذف الفريق' }));
        },
        onError: (error) => {
            notify.error(t({ en: 'Failed to delete team', ar: 'فشل حذف الفريق' }));
            console.error('Delete team error:', error);
        },
    });

    const addTeamMember = useMutation({
        mutationFn: async ({ teamId, userEmail, role = 'member' }) => {
            const { data, error } = await supabase
                .from('team_members')
                .insert({
                    team_id: teamId,
                    user_email: userEmail,
                    role,
                    status: 'active',
                    added_by: user?.email,
                    added_at: new Date().toISOString(),
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries(['teams']);
            queryClient.invalidateQueries(['team-members', variables.teamId]);
            notify.success(t({ en: 'Member added to team', ar: 'تمت إضافة العضو للفريق' }));

            // Notification: Member Added
            notify({
                type: 'team_member_added',
                entityType: 'team',
                entityId: variables.teamId,
                recipientEmails: [variables.userEmail],
                title: 'Added to Team',
                message: `You have been added to a team.`,
                sendEmail: true
            });
        },
        onError: (error) => {
            notify.error(t({ en: 'Failed to add member', ar: 'فشل إضافة العضو' }));
            console.error('Add team member error:', error);
        },
    });

    const removeTeamMember = useMutation({
        mutationFn: async ({ teamId, userEmail }) => {
            const { error } = await supabase
                .from('team_members')
                .delete()
                .eq('team_id', teamId)
                .eq('user_email', userEmail);

            if (error) throw error;
            return { teamId, userEmail };
        },
        onSuccess: (variables) => {
            queryClient.invalidateQueries(['teams']);
            queryClient.invalidateQueries(['team-members', variables.teamId]);
            notify.success(t({ en: 'Member removed from team', ar: 'تمت إزالة العضو من الفريق' }));
        },
        onError: (error) => {
            notify.error(t({ en: 'Failed to remove member', ar: 'فشل إزالة العضو' }));
            console.error('Remove team member error:', error);
        },
    });

    const updateTeamMemberRole = useMutation({
        mutationFn: async ({ teamId, userEmail, newRole }) => {
            const { data, error } = await supabase
                .from('team_members')
                .update({ role: newRole, updated_at: new Date().toISOString() })
                .eq('team_id', teamId)
                .eq('user_email', userEmail)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries(['teams']);
            queryClient.invalidateQueries(['team-members', variables.teamId]);
            notify.success(t({ en: 'Member role updated', ar: 'تم تحديث دور العضو' }));
        },
        onError: (error) => {
            notify.error(t({ en: 'Failed to update role', ar: 'فشل تحديث الدور' }));
            console.error('Update team member role error:', error);
        },
    });

    /**
     * Refresh teams cache (Gold Standard Pattern)
     */
    const refreshTeams = () => {
        queryClient.invalidateQueries({ queryKey: ['teams'] });
        queryClient.invalidateQueries({ queryKey: ['teams-with-visibility'] });
    };

    return {
        createTeam,
        updateTeam,
        deleteTeam,
        addTeamMember,
        removeTeamMember,
        updateTeamMemberRole,
        refreshTeams,  // ✅ Gold Standard
    };
}

