/**
 * Challenge Mutations Hook
 * Implements: mh-1 (create), mh-2 (update), mh-3 (delete),
 * mh-4 (optimistic updates), mh-5 (error recovery)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { useAuditLogger, AUDIT_ACTIONS, ENTITY_TYPES } from './useAuditLogger';
import { useChallengeNotifications } from './useChallengeNotifications';
import {
  validateChallengeCreate,
  validateChallengeSubmit,
  getValidationErrors
} from '@/lib/validations/challengeSchema';

export function useChallengeMutations() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { logCrudOperation, logStatusChange } = useAuditLogger();
  const { notifyStatusChange, notifyAssignment } = useChallengeNotifications();

  /**
   * mh-1: Create Challenge
   */
  const createChallenge = useMutation({
    mutationFn: async (data) => {
      // Validate input
      const validation = validateChallengeCreate(data);
      if (!validation.success) {
        const errors = getValidationErrors(validation);
        throw new Error(Object.values(errors)[0] || 'Validation failed');
      }

      const challengeData = {
        ...validation.data,
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

      // Audit log
      await logCrudOperation(
        AUDIT_ACTIONS.CREATE,
        ENTITY_TYPES.CHALLENGE,
        challenge.id,
        null,
        challengeData
      );

      return challenge;
    },
    onSuccess: (challenge) => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      toast.success('Challenge created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create challenge: ${error.message}`);
    }
  });

  /**
   * mh-2: Update Challenge with optimistic updates (mh-4)
   */
  const updateChallenge = useMutation({
    mutationFn: async ({ id, data }) => {
      // Get current challenge for audit logging
      const { data: currentChallenge } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', id)
        .single();

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

      // Audit log with diff (handled by DB trigger, but also log here for completeness)
      await logCrudOperation(
        AUDIT_ACTIONS.UPDATE,
        ENTITY_TYPES.CHALLENGE,
        id,
        currentChallenge,
        updateData
      );

      return challenge;
    },
    // mh-4: Optimistic update
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['challenge', id] });
      await queryClient.cancelQueries({ queryKey: ['challenges'] });

      const previousChallenge = queryClient.getQueryData(['challenge', id]);
      const previousChallenges = queryClient.getQueryData(['challenges']);

      // Optimistically update
      if (previousChallenge) {
        queryClient.setQueryData(['challenge', id], old => ({
          ...old,
          ...data,
          updated_at: new Date().toISOString()
        }));
      }

      return { previousChallenge, previousChallenges };
    },
    // mh-5: Error recovery
    onError: (error, { id }, context) => {
      if (context?.previousChallenge) {
        queryClient.setQueryData(['challenge', id], context.previousChallenge);
      }
      if (context?.previousChallenges) {
        queryClient.setQueryData(['challenges'], context.previousChallenges);
      }
      toast.error(`Failed to update: ${error.message}`);
    },
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['challenge', id] });
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
    onSuccess: () => {
      toast.success('Challenge updated');
    }
  });

  /**
   * mh-3: Delete Challenge (soft delete)
   */
  const deleteChallenge = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('challenges')
        .update({
          is_deleted: true,
          deleted_by: user?.email,
          deleted_date: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      await logCrudOperation(
        AUDIT_ACTIONS.DELETE,
        ENTITY_TYPES.CHALLENGE,
        id,
        { id },
        { is_deleted: true }
      );

      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['challenges'] });
      const previousChallenges = queryClient.getQueryData(['challenges']);
      
      // Optimistically remove from list
      queryClient.setQueryData(['challenges'], old => 
        old?.filter(c => c.id !== id) || []
      );

      return { previousChallenges };
    },
    onError: (error, _, context) => {
      if (context?.previousChallenges) {
        queryClient.setQueryData(['challenges'], context.previousChallenges);
      }
      toast.error(`Failed to delete: ${error.message}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      toast.success('Challenge deleted');
    }
  });

  /**
   * Submit challenge for review
   */
  const submitForReview = useMutation({
    mutationFn: async ({ id, data }) => {
      // Validate for submission
      const validation = validateChallengeSubmit(data);
      if (!validation.success) {
        const errors = getValidationErrors(validation);
        throw new Error(Object.values(errors)[0] || 'Please complete all required fields');
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

      await logStatusChange(
        ENTITY_TYPES.CHALLENGE,
        id,
        'draft',
        'submitted'
      );

      return challenge;
    },
    onSuccess: (challenge) => {
      // Send notifications
      notifyStatusChange.mutate({
        challenge,
        oldStatus: 'draft',
        newStatus: 'submitted'
      });

      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      queryClient.invalidateQueries({ queryKey: ['challenge', challenge.id] });
      toast.success('Challenge submitted for review');
    },
    onError: (error) => {
      toast.error(`Submission failed: ${error.message}`);
    }
  });

  /**
   * Change challenge status
   */
  const changeStatus = useMutation({
    mutationFn: async ({ id, newStatus, notes, rejectionReason }) => {
      const { data: currentChallenge } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', id)
        .single();

      const updateData = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      // Add status-specific fields
      if (newStatus === 'approved') {
        updateData.approval_date = new Date().toISOString();
      } else if (newStatus === 'published') {
        updateData.is_published = true;
        updateData.publishing_approved_date = new Date().toISOString();
        updateData.publishing_approved_by = user?.email;
      } else if (newStatus === 'resolved') {
        updateData.resolution_date = new Date().toISOString();
      }

      const { data: challenge, error } = await supabase
        .from('challenges')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;

      await logStatusChange(
        ENTITY_TYPES.CHALLENGE,
        id,
        currentChallenge.status,
        newStatus,
        { notes, rejectionReason }
      );

      return { challenge, oldStatus: currentChallenge.status };
    },
    onSuccess: ({ challenge, oldStatus }) => {
      notifyStatusChange.mutate({
        challenge,
        oldStatus,
        newStatus: challenge.status
      });

      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      queryClient.invalidateQueries({ queryKey: ['challenge', challenge.id] });
      toast.success(`Status changed to ${challenge.status}`);
    }
  });

  /**
   * Assign reviewer
   */
  const assignReviewer = useMutation({
    mutationFn: async ({ id, reviewerEmail }) => {
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
      notifyAssignment.mutate({
        challenge,
        assigneeEmail: challenge.review_assigned_to,
        assignmentType: 'reviewer'
      });

      queryClient.invalidateQueries({ queryKey: ['challenge', challenge.id] });
      toast.success('Reviewer assigned');
    }
  });

  /**
   * Transfer ownership
   */
  const transferOwnership = useMutation({
    mutationFn: async ({ id, newOwnerEmail, transferReason }) => {
      const { data: currentChallenge } = await supabase
        .from('challenges')
        .select('challenge_owner_email')
        .eq('id', id)
        .single();

      const { data: challenge, error } = await supabase
        .from('challenges')
        .update({
          challenge_owner_email: newOwnerEmail,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;

      return {
        challenge,
        oldOwner: currentChallenge.challenge_owner_email
      };
    },
    onSuccess: ({ challenge, oldOwner }) => {
      notifyAssignment.mutate({
        challenge,
        assigneeEmail: challenge.challenge_owner_email,
        assignmentType: 'owner'
      });

      queryClient.invalidateQueries({ queryKey: ['challenge', challenge.id] });
      toast.success('Ownership transferred');
    }
  });

  /**
   * Bulk status change
   */
  const bulkChangeStatus = useMutation({
    mutationFn: async ({ challengeIds, newStatus }) => {
      const { data, error } = await supabase
        .from('challenges')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .in('id', challengeIds)
        .select('id');

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      toast.success(`${data.length} challenges updated`);
    }
  });

  return {
    // Core mutations
    createChallenge,
    updateChallenge,
    deleteChallenge,

    // Workflow mutations
    submitForReview,
    changeStatus,
    assignReviewer,
    transferOwnership,

    // Bulk operations
    bulkChangeStatus,

    // Loading states
    isCreating: createChallenge.isPending,
    isUpdating: updateChallenge.isPending,
    isDeleting: deleteChallenge.isPending,
    isSubmitting: submitForReview.isPending
  };
}

export default useChallengeMutations;
