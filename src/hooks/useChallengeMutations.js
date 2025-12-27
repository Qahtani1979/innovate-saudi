/**
 * Challenge Mutations Hook
 */

import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

import { useAuth } from '@/lib/AuthContext';
import { useAuditLogger, AUDIT_ACTIONS, ENTITY_TYPES } from './useAuditLogger';
import { useChallengeNotifications } from './useChallengeNotifications';
import {
  validateChallengeCreate,
  validateChallengeSubmit,
  getValidationErrors
} from '@/lib/validations/challengeSchema';
import { useLanguage } from '@/components/LanguageContext';

import { useNotificationSystem } from '@/hooks/useNotificationSystem'; // Changed from AutoNotification
import { useAccessControl } from '@/hooks/useAccessControl';

/**
 * Hook for managing challenge followers
 */
export function useChallengeFollow(challengeId) {
  const { user } = useAuth();
  const { notify } = useNotificationSystem();


  const { data: follows = [], isLoading } = useQuery({
    queryKey: ['challenge-follows', challengeId, user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const { data } = await supabase.from('user_follows').select('*')
        .eq('follower_email', user.email)
        .eq('entity_type', 'challenge')
        .eq('entity_id', challengeId);
      return data || [];
    },
    enabled: !!user?.email && !!challengeId
  });

  const isFollowing = follows.length > 0;

  const mutation = useMutation({
    mutationFn: async (action) => {
      if (action === 'follow') {
        const { error } = await supabase.from('user_follows').insert({
          follower_email: user.email,
          entity_type: 'challenge',
          entity_id: challengeId,
          notification_preferences: { status_changes: true, new_proposals: true, pilot_created: true }
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('user_follows').delete().eq('id', follows[0].id);
        if (error) throw error;
      }
    },
    onSuccess: (_, action) => {
      queryClient.invalidateQueries({ queryKey: ['challenge-follows'] });
      notify.success(action === 'follow' ? 'Following challenge' : 'Unfollowed challenge');
    }
  });

  return {
    isFollowing,
    isLoading: isLoading || mutation.isPending,
    follow: () => mutation.mutate('follow'),
    unfollow: () => mutation.mutate('unfollow')
  };
}

/**
 * Hook for managing challenge interests (Solution Providers)
 */
export function useChallengeInterest(challengeId) {
  const { user } = useAuth();
  const queryClient = useAppQueryClient();
  const { t } = useLanguage();
  const { notify } = useNotificationSystem();

  const { data: interest, isLoading } = useQuery({
    queryKey: ['challenge-interest', challengeId, user?.email],
    queryFn: async () => {
      if (!user?.email || !challengeId) return null;
      const { data, error } = await supabase
        .from('challenge_interests')
        .select('*')
        .eq('challenge_id', challengeId)
        .eq('user_email', user.email)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.email && !!challengeId
  });

  const expressInterest = useMutation({
    mutationFn: async ({ interestType, notes }) => {
      const { error } = await supabase
        .from('challenge_interests')
        .insert({
          challenge_id: challengeId,
          user_email: user?.email,
          interest_type: interestType,
          notes,
          status: 'watching'
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenge-interest'] });
      notify.success(t({ en: 'Interest registered!', ar: 'تم تسجيل الاهتمام!' }));
    }
  });

  const withdrawInterest = useMutation({
    mutationFn: async () => {
      if (!interest?.id) return;
      const { error } = await supabase
        .from('challenge_interests')
        .update({ status: 'no_longer_interested' })
        .eq('id', interest.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenge-interest'] });
      notify.success(t({ en: 'Interest withdrawn', ar: 'تم سحب الاهتمام' }));
    }
  });

  return {
    interest,
    isLoading: isLoading || expressInterest.isPending || withdrawInterest.isPending,
    expressInterest,
    withdrawInterest
  };
}

export function useEscalateChallenge() {
  const queryClient = useAppQueryClient();
  const { notify } = useNotificationSystem();

  return useMutation({
    mutationFn: async (challenge) => {
      const { error } = await supabase.from('challenges').update({
        escalation_level: (challenge.escalation_level || 0) + 1,
        escalation_date: new Date().toISOString()
      }).eq('id', challenge.id);
      if (error) throw error;

      await notify({
        type: 'challenge_escalated',
        entityType: 'challenge',
        entityId: challenge.id,
        title: 'Challenge Escalated',
        message: `Challenge ${challenge.code} has been escalated to level ${(challenge.escalation_level || 0) + 1}`,
        recipientEmails: [], // Logic to determine recipients (e.g. admin) should be here or handled by backend, but for now we keep safe defaults or user
        sendEmail: true,
        emailTemplate: 'challenge_escalated',
        emailVariables: {
          challenge_title: challenge.title_en || challenge.title_ar,
          challenge_code: challenge.code,
          days_overdue: challenge.sla?.daysOverdue || 0,
          current_status: challenge.status,
          escalation_level: (challenge.escalation_level || 0) + 1
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      notify.success('Challenge escalated');
    }
  });
}

/**
 * Hook to update challenge tracks (routing)
 */
export function useUpdateChallengeTracks() {
  const queryClient = useAppQueryClient();
  const { notify } = useNotificationSystem();

  return useMutation({
    mutationFn: async ({ id, tracks }) => {
      const { error } = await supabase
        .from('challenges')
        .update({ tracks })
        .eq('id', id);

      if (error) throw error;
      return { id, tracks };
    },
    onSuccess: ({ id }) => {
      queryClient.invalidateQueries({ queryKey: ['challenge', id] });
      queryClient.invalidateQueries({ queryKey: ['challenge-router', id] });
      // toast handled in component for specific messaging
    },
    onError: (error) => {
      console.error('Failed to update tracks:', error);
      notify.error('Failed to route challenge');
    }
  });
}

/**
 * Hook for batch importing challenges
 */
export function useImportChallenges() {
  const queryClient = useAppQueryClient();
  const { notify } = useNotificationSystem();

  return useMutation({
    mutationFn: async (challenges) => {
      const results = await Promise.allSettled(
        challenges.map(c =>
          supabase.from('challenges').insert({
            ...c,
            // Ensure defaults
            status: c.status || 'draft',
            priority: c.priority || 'medium',
            origin_source: c.origin_source || 'batch_import'
          }).select()
        )
      );

      const failed = results.filter(r => r.status === 'rejected');
      if (failed.length > 0) {
        console.error('Some imports failed:', failed);
      }

      return {
        total: results.length,
        success: results.filter(r => r.status === 'fulfilled').length,
        failed: failed.length
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      if (data.failed > 0) {
        notify.warning(`Imported ${data.success} challenges. ${data.failed} failed.`);
      } else {
        notify.success(`Successfully imported ${data.total} challenges`);
      }
    }
  });
}


/**
 * Challenge Mutations Hook
 * @returns {{
 *   createChallenge: import('@tanstack/react-query').UseMutationResult<any, Error, any>,
 *   updateChallenge: import('@tanstack/react-query').UseMutationResult<any, Error, {id: string, data: any, activityLog?: any, metadata?: any}>,
 *   deleteChallenge: import('@tanstack/react-query').UseMutationResult<any, Error, string>,
 *   archiveChallenge: import('@tanstack/react-query').UseMutationResult<any, Error, string>,
 *   submitForReview: import('@tanstack/react-query').UseMutationResult<any, Error, {id: string, data: any, metadata?: any}>,
 *   changeStatus: import('@tanstack/react-query').UseMutationResult<any, Error, {id: string, newStatus: string, notes?: string, rejectionReason?: string}>,
 *   assignReviewer: import('@tanstack/react-query').UseMutationResult<any, Error, {id: string, reviewerEmail: string}>,
 *   checkConsensus: import('@tanstack/react-query').UseMutationResult<any, Error, string>,
 *   refreshChallenges: function,
 *   isCreating: boolean,
 *   isUpdating: boolean,
 *   isDeleting: boolean,
 *   isSubmitting: boolean
 * }}
 */
export function useChallengeMutations() {
  const queryClient = useAppQueryClient();
  const { user } = useAuth();
  const { logCrudOperation, logStatusChange } = useAuditLogger();
  const { notifyStatusChange, notifyAssignment } = useChallengeNotifications();
  const { notify } = useNotificationSystem();
  const { t } = useLanguage();


  /* 
   * ACCESS CONTROL LAYER
   */
  const { checkPermission, checkEntityAccess } = useAccessControl();

  /**
   * Create Challenge
   */
  const createChallenge = useMutation({
    /** @param {any} data */
    mutationFn: async (data) => {
      // 1. Role Check
      checkPermission(['admin', 'innovation_manager', 'program_manager']);

      const validation = validateChallengeCreate(data);
      if (!validation.success) {
        const errors = getValidationErrors(validation);
        throw new Error(Object.values(errors)[0] || 'Validation failed');
      }

      const challengeData = {
        ...validation.data,
        title_ar: validation.data.title_ar || '', // Ensure title_ar is provided even if empty
        title_en: validation.data.title_en || null,
        created_by: user?.id,
        challenge_owner_email: user?.email,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: challenge, error } = await supabase
        .from('challenges')
        .insert(challengeData)
        .select(`
          *,
          municipality:municipalities(id, name_en, name_ar),
          sector:sectors(id, name_en, name_ar)
        `)
        .single();

      if (error) throw error;

      await logCrudOperation(AUDIT_ACTIONS.CREATE, ENTITY_TYPES.CHALLENGE, challenge.id, null, challengeData);

      await supabase.from('system_activities').insert({
        entity_type: 'challenge',
        entity_id: challenge.id,
        activity_type: 'created',
        description: `Challenge "${challenge.title_en}" created by ${user?.email}`
      });


      // Generate embedding via edge function
      supabase.functions.invoke('generateEmbeddings', {
        body: {
          entity_type: 'challenge',
          entity_id: challenge.id,
          title: challenge.title_en,
          content: challenge.description_en || challenge.problem_statement_en || ''
        }
      }).catch(err => console.error('Embedding generation failed:', err));

      return challenge;
    },
    onSuccess: (challenge) => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      queryClient.invalidateQueries({ queryKey: ['pending-challenges'] });
      notify.success('Challenge created successfully');
    }
  });

  /**
   * Update Challenge
   */
  const updateChallenge = useMutation({
    /** @param {{id: string, data: any, activityLog?: any}} params */
    mutationFn: async (params) => {
      const { id, data } = params;
      const { data: currentChallenge } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', id)
        .single();

      // 1. Protection Check: Ensure user owns this challenge OR is admin
      checkEntityAccess(currentChallenge, 'created_by');

      // 2. Status Change Protection
      if (data.status && data.status !== 'draft') {
        // Changing status usually requires specific roles
        // e.g. only Admins can approve
        if (data.status === 'approved' || data.status === 'rejected') {
          checkPermission(['admin', 'program_manager']);
        }
      }

      const updateData = {
        ...data,
        updated_at: new Date().toISOString()
      };

      const { data: challenge, error } = await supabase
        .from('challenges')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          municipality:municipalities(id, name_en, name_ar),
          sector:sectors(id, name_en, name_ar)
        `)
        .single();

      if (error) throw error;

      await logCrudOperation(AUDIT_ACTIONS.UPDATE, ENTITY_TYPES.CHALLENGE, id, currentChallenge, updateData);

      if (data.status && data.status !== currentChallenge.status) {
        // Global activity log
        await supabase.from('system_activities').insert({
          entity_type: 'challenge',
          entity_id: id,
          activity_type: 'status_change',
          description: `Challenge status changed from ${currentChallenge.status} to ${data.status}`,
          metadata: { old_status: currentChallenge.status, new_status: data.status, ...(data.metadata || {}) }
        });

        // Challenge-specific feed
        await supabase.from('challenge_activities').insert({
          challenge_id: id,
          activity_type: 'status_change',
          description: `Challenge moved to ${data.status}`,
          details: { old_status: currentChallenge.status, new_status: data.status, ...(data.metadata || {}) }
        });
      }

      // 4. Custom Activity Log (Optional)
      if (params.activityLog) {
        await supabase.from('challenge_activities').insert({
          challenge_id: id,
          ...params.activityLog,
          timestamp: new Date().toISOString()
        });
      }

      return challenge;
    },
    onMutate: async (params) => {
      const { id, data } = params;
      await queryClient.cancelQueries({ queryKey: ['challenge', id] });
      const previousChallenge = queryClient.getQueryData(['challenge', id]);
      if (previousChallenge) {
        queryClient.setQueryData(['challenge', id], (old) => {
          if (!old) return data;
          return Object.assign({}, old, data);
        });
      }
      return { previousChallenge };
    },
    onError: (error, variables, context) => {
      const { id } = variables;
      if (context?.previousChallenge) {
        queryClient.setQueryData(['challenge', id], context.previousChallenge);
      }
      notify.error(`Update failed: ${error.message}`);
    },
    onSettled: (challenge) => {
      if (challenge) {
        queryClient.invalidateQueries({ queryKey: ['challenge', challenge.id] });
      }
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      queryClient.invalidateQueries({ queryKey: ['pending-challenges'] });
    },
    onSuccess: (challenge, variables) => {
      if (variables.data.status) {
        notifyStatusChange.mutate({
          challenge,
          newStatus: variables.data.status
        });
      }
      notify.success('Challenge updated');
    }
  });

  /**
   * Delete Challenge
   */
  const deleteChallenge = useMutation({
    /** @param {string} id */
    mutationFn: async (id) => {
      const { data: currentChallenge } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', id)
        .single();

      checkEntityAccess(currentChallenge, 'created_by');

      const { error } = await supabase
        .from('challenges')
        .update({
          is_deleted: true,
          deleted_by: user?.email,
          deleted_date: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      await logCrudOperation(AUDIT_ACTIONS.DELETE, ENTITY_TYPES.CHALLENGE, id, { id }, { is_deleted: true });

      await supabase.from('system_activities').insert({
        entity_type: 'challenge',
        entity_id: id,
        activity_type: 'deleted',
        description: `Challenge (ID: ${id}) soft-deleted by ${user?.email}`
      });

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      notify.success(t({ en: 'Challenge deleted', ar: 'تم حذف التحدي' }));
    }
  });

  /**
   * Archive Challenge
   */
  const archiveChallenge = useMutation({
    /** @param {string} id */
    mutationFn: async (id) => {
      // Fetch challenge first for notifications if necessary, or rely on client invalidation
      const { data: challenge } = await supabase.from('challenges').select('*').eq('id', id).single();

      checkEntityAccess(challenge, 'created_by');

      const { error } = await supabase
        .from('challenges')
        .update({ status: 'archived', is_archived: true })
        .eq('id', id);

      if (error) throw error;
      return challenge;
    },
    onSuccess: (challenge) => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      queryClient.invalidateQueries({ queryKey: ['pending-challenges'] });

      if (challenge) {
        // Notification: Challenge Archived
        notify({
          title: t({ en: 'Challenge Archived', ar: 'تم أرشفة التحدي' }),
          message: t({ en: `${challenge.code} has been archived`, ar: `تمت أرشفة ${challenge.code}` }),
          type: 'challenge_status_changed', // Generic type or specific
          entityType: 'challenge',
          entityId: challenge.id,
          recipientEmails: [user?.email].filter(Boolean),
          sendEmail: true,
          emailTemplate: 'challenge_status_changed',
          emailVariables: {
            challenge_title: challenge.title_en || challenge.title_ar,
            challenge_code: challenge.code,
            old_status: challenge.status,
            new_status: 'archived'
          }
        }).catch(console.error);
      }

      notify.success(t({ en: 'Challenge archived', ar: 'تم أرشفة التحدي' }));
    }
  });

  /**
   * Submit challenge for review
   */
  const submitForReview = useMutation({
    /** @param {any} params */
    mutationFn: async (params) => {
      const { id, data, metadata = {} } = params;

      // Access Check needed? Usually yes for submitting YOUR challenge.
      // We will rely on RLS partially but Double Check offers immediate feedback
      // Fetch basic info first for check? 
      // Optimized: Since we update by ID, we can do a quick check via existing cache OR single fetch.
      // For mutation safety, single fetch is better.
      const { data: existing } = await supabase.from('challenges').select('created_by').eq('id', id).single();
      checkEntityAccess(existing, 'created_by');

      const validation = validateChallengeSubmit(data);
      if (!validation.success) {
        const errors = getValidationErrors(validation);
        throw new Error(Object.values(errors)[0] || 'Validation failed');
      }

      const { data: challenge, error } = await supabase
        .from('challenges')
        .update({
          ...validation.data,
          status: 'submitted',
          submission_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;

      await logStatusChange(ENTITY_TYPES.CHALLENGE, id, 'draft', 'submitted', metadata);

      await supabase.from('system_activities').insert({
        entity_type: 'challenge',
        entity_id: id,
        activity_type: 'submitted',
        description: `Challenge "${challenge.title_en}" submitted for review`,
        metadata: {
          submission_date: challenge.submission_date,
          ...metadata
        }
      });

      return challenge;
    },
    onSuccess: (challenge) => {
      notifyStatusChange.mutate({ challenge, oldStatus: 'draft', newStatus: 'submitted' });
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      queryClient.invalidateQueries({ queryKey: ['pending-challenges'] });
      notify.success('Challenge submitted for review');
    }
  });

  /**
   * Change Status
   */
  const changeStatus = useMutation({
    /** @param {{id: string, newStatus: string, notes?: string, rejectionReason?: string}} params */
    mutationFn: async (params) => {
      const { id, newStatus, notes, rejectionReason } = params;
      const { data: currentChallenge } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', id)
        .single();

      const updateData = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'approved') updateData.approval_date = new Date().toISOString();
      else if (newStatus === 'published') {
        updateData.is_published = true;
        updateData.publishing_approved_date = new Date().toISOString();
        updateData.publishing_approved_by = user?.email;
      }

      const { data: challenge, error } = await supabase
        .from('challenges')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;

      await logStatusChange(ENTITY_TYPES.CHALLENGE, id, currentChallenge.status, newStatus, { notes, rejectionReason });

      await supabase.from('system_activities').insert({
        entity_type: 'challenge',
        entity_id: id,
        activity_type: 'status_change',
        description: `Challenge changed status to ${newStatus}`,
        metadata: { old_status: currentChallenge.status, new_status: newStatus, notes, rejectionReason }
      });

      await supabase.from('challenge_activities').insert({
        challenge_id: id,
        activity_type: 'status_change',
        description: `Status changed to ${newStatus}`,
        details: { old_status: currentChallenge.status, new_status: newStatus, notes, rejectionReason }
      });

      return { challenge, oldStatus: currentChallenge.status };
    },
    onSuccess: ({ challenge, oldStatus }, variables) => {
      notifyStatusChange.mutate({
        challenge,
        oldStatus,
        newStatus: challenge.status,
        rejectionReason: variables.rejectionReason
      });
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      queryClient.invalidateQueries({ queryKey: ['pending-challenges'] });
      notify.success(`Status changed to ${challenge.status}`);
    }
  });

  /**
   * Assign Reviewer
   */
  const assignReviewer = useMutation({
    /** @param {{id: string, reviewerEmail: string}} params */
    mutationFn: async (params) => {
      const { id, reviewerEmail } = params;
      const { data: challenge, error } = await supabase
        .from('challenges')
        .update({
          review_assigned_to: reviewerEmail,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;
      return challenge;
    },
    onSuccess: (challenge) => {
      notifyAssignment.mutate({ challenge, assigneeEmail: challenge.review_assigned_to, assignmentType: 'reviewer' });
      queryClient.invalidateQueries({ queryKey: ['challenge', challenge.id] });
      notify.success('Reviewer assigned');
    }
  });

  /**
   * Refresh challenges cache (Gold Standard Pattern)
   * Invalidates all challenge-related queries
   */
  const refreshChallenges = () => {
    queryClient.invalidateQueries({ queryKey: ['challenges'] });
    queryClient.invalidateQueries({ queryKey: ['challenges-with-visibility'] });
    queryClient.invalidateQueries({ queryKey: ['pending-challenges'] });
  };

  return {
    createChallenge,
    updateChallenge,
    deleteChallenge,
    archiveChallenge,
    submitForReview,
    changeStatus,
    assignReviewer,
    refreshChallenges,  // ✅ Gold Standard: Export refresh method
    isCreating: createChallenge.isPending,
    isUpdating: updateChallenge.isPending,
    isDeleting: deleteChallenge.isPending,
    isSubmitting: submitForReview.isPending,
    generateEmbeddings: useMutation({
      mutationFn: async () => {
        const { error } = await supabase.functions.invoke('generateEmbeddings', {
          body: {
            entity_name: 'Challenge',
            mode: 'missing'
          }
        });
        if (error) throw error;
      }
    }),
    checkConsensus: useMutation({
      /** @param {string} challengeId */
      mutationFn: async (challengeId) => {
        const { error } = await supabase.functions.invoke('checkConsensus', {
          body: { entity_type: 'challenge', entity_id: challengeId }
        });
        if (error) throw error;
      }
    }),
    updatePublishingSettings: useMutation({
      mutationFn: async ({ id, isPublished, isConfidential, notes }) => {
        const { data: currentChallenge } = await supabase
          .from('challenges')
          .select('status, is_published, is_confidential')
          .eq('id', id)
          .single();

        const updates = {
          is_published: isPublished,
          is_confidential: isConfidential,
          publishing_approved_by: user?.email,
          publishing_approved_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from('challenges')
          .update(updates)
          .eq('id', id);

        if (error) throw error;

        // Log the activity
        await supabase.from('challenge_activities').insert({
          challenge_id: id,
          activity_type: 'publishing_update',
          description: `Publishing settings updated: Published=${isPublished}, Confidential=${isConfidential}`,
          details: {
            notes,
            previous_state: {
              is_published: currentChallenge.is_published,
              is_confidential: currentChallenge.is_confidential
            },
            new_state: {
              is_published: isPublished,
              is_confidential: isConfidential
            }
          },
          performed_by: user?.email
        });

        return { id, ...updates };
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['challenge', data.id] });
        queryClient.invalidateQueries({ queryKey: ['challenges'] });
        notify.success(t({ en: 'Publishing settings updated', ar: 'تم تحديث إعدادات النشر' }));
      }
    })
  };
}

/**
 * Hook for merging challenges
 */
export function useMergeChallenges() {
  const queryClient = useAppQueryClient();
  const { t } = useLanguage();

  return useMutation({
    mutationFn: async ({ primaryChallenge, duplicateChallenges, mergeNotes }) => {
      // 1. Update primary with combined data
      const combinedKeywords = new Set([
        ...(primaryChallenge.keywords || []),
        ...duplicateChallenges.flatMap(d => d.keywords || [])
      ]);

      const combinedStakeholders = [
        ...(primaryChallenge.stakeholders || []),
        ...duplicateChallenges.flatMap(d => d.stakeholders || [])
      ];

      const { error: updateError } = await supabase.from('challenges').update({
        keywords: Array.from(combinedKeywords),
        stakeholders: combinedStakeholders,
        citizen_votes_count: (primaryChallenge.citizen_votes_count || 0) +
          duplicateChallenges.reduce((sum, d) => sum + (d.citizen_votes_count || 0), 0)
      }).eq('id', primaryChallenge.id);

      if (updateError) throw updateError;

      // 2. Archive duplicates
      for (const dup of duplicateChallenges) {
        const { error: archiveError } = await supabase.from('challenges').update({
          status: 'archived',
          is_archived: true,
          archive_date: new Date().toISOString()
        }).eq('id', dup.id);

        if (archiveError) throw archiveError;

        // 3. Create activity log
        await supabase.from('challenge_activities').insert({
          challenge_id: dup.id,
          activity_type: 'merged',
          description: `Merged into ${primaryChallenge.code}`,
          metadata: { merge_notes: mergeNotes, primary_challenge_id: primaryChallenge.id }
        });
      }

      // Log on primary as well
      await supabase.from('challenge_activities').insert({
        challenge_id: primaryChallenge.id,
        activity_type: 'merge_primary',
        description: `Merged ${duplicateChallenges.length} challenges`,
        metadata: {
          merged_challenge_ids: duplicateChallenges.map(d => d.id),
          merge_notes: mergeNotes
        }
      });

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      toast.success(t({ en: 'Challenges merged successfully', ar: 'تم دمج التحديات بنجاح' }));
    }
  });
}

export function useShareChallenge() {
  const queryClient = useAppQueryClient();
  const { t } = useLanguage();

  return useMutation({
    mutationFn: async ({ challenge, cities }) => {
      if (!cities || cities.length === 0) return;

      for (const cityId of cities) {
        await supabase.from('challenge_activities').insert({
          challenge_id: challenge.id,
          activity_type: 'cross_city_share',
          description: `Solution shared with ${cityId}`,
          metadata: { shared_to_municipality: cityId, shared_date: new Date().toISOString() }
        });

        // Send email via email-trigger-hub
        // Dynamically import or just call? The original used dynamic import for supabase client inside? 
        // We have supabase client in scope of this file usually? 
        // Ah, this file imports supabase at top.
        // But the original code was: const { supabase } = await import('@/integrations/supabase/client');
        // We can use the top level supabase.

        await supabase.functions.invoke('email-trigger-hub', {
          body: {
            trigger: 'challenge.match_found',
            recipient_email: `innovation@${cityId}.gov.sa`,
            entity_type: 'challenge',
            entity_id: challenge.id,
            variables: {
              challengeTitle: challenge.title_en,
              sector: challenge.sector,
              track: challenge.track,
              viewUrl: `${window.location.origin}/challenge/${challenge.id}`
            },
            triggered_by: 'system'
          }
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenge-activities'] });
      toast.success(t({ en: 'Solution shared successfully', ar: 'تمت مشاركة الحل بنجاح' }));
    }
  });
}

export function useAssignChallengeTracks() {
  const queryClient = useAppQueryClient();
  const { t } = useLanguage();

  return useMutation({
    mutationFn: async ({ challengeId, selectedTracks, rationale, userEmail }) => {
      const { error } = await supabase
        .from('challenges')
        .update({
          tracks: selectedTracks,
          track_assignment_rationale: rationale,
          track_assigned_by: userEmail,
          track_assigned_date: new Date().toISOString()
        })
        .eq('id', challengeId);

      if (error) throw error;

      await supabase.from('system_activities').insert({
        entity_type: 'Challenge',
        entity_id: challengeId,
        activity_type: 'track_assigned',
        description: `Treatment tracks assigned: ${selectedTracks.join(', ')}`,
        performed_by: userEmail,
        timestamp: new Date().toISOString(),
        metadata: { tracks: selectedTracks, rationale }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenge'] });
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      toast.success(t({ en: 'Tracks assigned successfully', ar: 'تم تعيين المسارات بنجاح' }));
    }
  });
}

export function useNotifyCitizenResolution() {
  const { t, language } = useLanguage();

  return useMutation({
    mutationFn: async ({ challenge, message }) => {
      if (!challenge.citizen_origin_idea_id) {
        throw new Error('No citizen to notify');
      }

      // Get original idea creator
      const { data: idea, error } = await supabase.from('citizen_ideas')
        .select('*')
        .eq('id', challenge.citizen_origin_idea_id)
        .single();

      if (error || !idea?.user_id) {
        throw new Error('Idea creator not found');
      }

      // Send email
      await supabase.functions.invoke('email-trigger-hub', {
        body: {
          trigger: 'idea.converted',
          recipient_email: idea.created_by,
          entity_type: 'challenge',
          entity_id: challenge.id,
          variables: {
            challengeTitle: language === 'ar' && challenge.title_ar ? challenge.title_ar : challenge.title_en,
            message: message || '',
            ideaTitle: idea.title
          },
          language: language,
          triggered_by: 'system'
        }
      });

      return idea;
    },
    onSuccess: () => {
      toast.success(t({ en: 'Citizen notified successfully!', ar: 'تم إشعار المواطن بنجاح!' }));
    }
  });
}

/**
 * Hook for linking challenges to R&D Calls
 */
export function useLinkChallengeToRDCall() {
  const queryClient = useAppQueryClient();
  const { t } = useLanguage();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ challengeIds, rdCallId }) => {
      if (!challengeIds?.length || !rdCallId) throw new Error('Missing required IDs');

      const updates = challengeIds.map(async (challengeId) => {
        const { data: current, error: fetchError } = await supabase
          .from('challenges')
          .select('linked_rd_ids, tracks')
          .eq('id', challengeId)
          .single();

        if (fetchError) throw fetchError;

        const currentLinked = current.linked_rd_ids || [];
        const currentTracks = current.tracks || [];

        // Check if already linked
        if (currentLinked.includes(rdCallId)) return;

        const updatedLinked = [...currentLinked, rdCallId];
        const updatedTracks = currentTracks.includes('rd_call')
          ? currentTracks
          : [...currentTracks, 'rd_call'];

        const { error: updateError } = await supabase
          .from('challenges')
          .update({
            linked_rd_ids: updatedLinked,
            tracks: updatedTracks
          })
          .eq('id', challengeId);

        if (updateError) throw updateError;

        // Log Activity
        await supabase.from('challenge_activities').insert({
          challenge_id: challengeId,
          activity_type: 'rd_linked',
          description: 'Linked to R&D Call',
          metadata: { rd_call_id: rdCallId, linked_by: user?.email }
        });
      });

      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      queryClient.invalidateQueries({ queryKey: ['challenges-with-visibility'] });
      toast.success(t({ en: 'Challenges linked successfully', ar: 'تم ربط التحديات بنجاح' }));
    }
  });
}

export default useChallengeMutations;

