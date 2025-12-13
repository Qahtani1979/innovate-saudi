import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { useEmailTrigger } from '@/hooks/useEmailTrigger';
import { notifyProgramEvent } from '@/components/AutoNotification';
import { toast } from 'sonner';

/**
 * Hook for program CRUD operations with email triggers and notifications
 */
export function usePrograms(options = {}) {
  const { 
    filters = {},
    municipalityId = null,
    sectorId = null,
    limit = 50,
    includeUnpublished = false 
  } = options;

  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { triggerEmail } = useEmailTrigger();

  // Fetch programs
  const programsQuery = useQuery({
    queryKey: ['programs-crud', { filters, municipalityId, sectorId, limit, includeUnpublished }],
    queryFn: async () => {
      let query = supabase
        .from('programs')
        .select(`
          *,
          municipality:municipalities(id, name_en, name_ar),
          sector:sectors(id, name_en, name_ar)
        `)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      // Apply filters
      if (!includeUnpublished) {
        query = query.eq('is_published', true);
      }
      if (municipalityId) {
        query = query.eq('municipality_id', municipalityId);
      }
      if (sectorId) {
        query = query.eq('sector_id', sectorId);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.program_type) {
        query = query.eq('program_type', filters.program_type);
      }
      if (filters.search) {
        query = query.or(`name_en.ilike.%${filters.search}%,name_ar.ilike.%${filters.search}%,description_en.ilike.%${filters.search}%`);
      }
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch single program
  const useProgram = (programId) => {
    return useQuery({
      queryKey: ['program', programId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('programs')
          .select(`
            *,
            municipality:municipalities(id, name_en, name_ar),
            sector:sectors(id, name_en, name_ar)
          `)
          .eq('id', programId)
          .single();
        
        if (error) throw error;
        return data;
      },
      enabled: !!programId
    });
  };

  // Create program
  const createProgramMutation = useMutation({
    mutationFn: async (programData) => {
      const { data, error } = await supabase
        .from('programs')
        .insert({
          ...programData,
          created_by: user?.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Create approval request if submitting for approval
      if (programData.status === 'pending' || programData.submit_for_approval) {
        const slaDueDate = new Date();
        slaDueDate.setDate(slaDueDate.getDate() + 5); // 5-day SLA

        await supabase.from('approval_requests').insert({
          entity_type: 'program',
          entity_id: data.id,
          request_type: 'program_approval',
          requester_email: user?.email,
          approval_status: 'pending',
          sla_due_date: slaDueDate.toISOString(),
          metadata: {
            gate_name: 'approval',
            program_type: data.program_type,
            name: data.name_en
          }
        });

        // Trigger submission email
        try {
          await triggerEmail('program.submitted', {
            entity_type: 'program',
            entity_id: data.id,
            recipient_email: user?.email,
            entity_data: {
              name: data.name_en,
              program_type: data.program_type,
              start_date: data.start_date
            }
          });
        } catch (e) {
          console.warn('Email trigger for program.submitted failed:', e);
        }
      }

      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries(['programs-crud']);
      queryClient.invalidateQueries(['programs-with-visibility']);
      queryClient.invalidateQueries(['program-approvals']);
      
      // Create in-app notification
      try {
        if (data.status === 'pending') {
          await notifyProgramEvent(data, 'submitted');
        } else {
          await notifyProgramEvent(data, 'created');
        }
      } catch (e) {
        console.warn('In-app notification failed:', e);
      }
      
      // Trigger email notification for draft
      if (data.status === 'draft') {
        try {
          await triggerEmail('program.created', {
            entity_type: 'program',
            entity_id: data.id,
            recipient_email: user?.email,
            entity_data: {
              name: data.name_en,
              program_type: data.program_type
            }
          });
        } catch (e) {
          console.warn('Email trigger failed:', e);
        }
      }
    }
  });

  // Update program
  const updateProgramMutation = useMutation({
    mutationFn: async ({ programId, updates }) => {
      const { data, error } = await supabase
        .from('programs')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', programId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries(['programs-crud']);
      queryClient.invalidateQueries(['programs-with-visibility']);
      queryClient.invalidateQueries(['program', variables.programId]);

      // Trigger update email
      try {
        await triggerEmail('program.updated', {
          entity_type: 'program',
          entity_id: data.id,
          entity_data: {
            name: data.name_en,
            program_type: data.program_type,
            status: data.status
          }
        });
      } catch (e) {
        console.warn('Email trigger failed:', e);
      }
    }
  });

  // Launch program (change status to active)
  const launchProgramMutation = useMutation({
    mutationFn: async (programId) => {
      const { data, error } = await supabase
        .from('programs')
        .update({
          status: 'active',
          is_published: true,
          launched_at: new Date().toISOString(),
          launched_by: user?.email,
          updated_at: new Date().toISOString()
        })
        .eq('id', programId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data, programId) => {
      queryClient.invalidateQueries(['programs-crud']);
      queryClient.invalidateQueries(['programs-with-visibility']);
      queryClient.invalidateQueries(['program', programId]);

      // In-app notification
      try {
        await notifyProgramEvent(data, 'launched');
      } catch (e) {
        console.warn('In-app notification failed:', e);
      }

      // Email notification
      try {
        await triggerEmail('program.launched', {
          entity_type: 'program',
          entity_id: data.id,
          entity_data: {
            name: data.name_en,
            program_type: data.program_type,
            start_date: data.start_date,
            application_deadline: data.application_deadline
          }
        });
      } catch (e) {
        console.warn('Email trigger failed:', e);
      }
    }
  });

  // Complete program
  const completeProgramMutation = useMutation({
    mutationFn: async (programId) => {
      const { data, error } = await supabase
        .from('programs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completed_by: user?.email,
          updated_at: new Date().toISOString()
        })
        .eq('id', programId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data, programId) => {
      queryClient.invalidateQueries(['programs-crud']);
      queryClient.invalidateQueries(['programs-with-visibility']);
      queryClient.invalidateQueries(['program', programId]);

      // In-app notification
      try {
        await notifyProgramEvent(data, 'completed');
      } catch (e) {
        console.warn('In-app notification failed:', e);
      }

      // Email notification
      try {
        await triggerEmail('program.completed', {
          entity_type: 'program',
          entity_id: data.id,
          entity_data: {
            name: data.name_en,
            program_type: data.program_type
          }
        });
      } catch (e) {
        console.warn('Email trigger failed:', e);
      }
    }
  });

  // Cancel program
  const cancelProgramMutation = useMutation({
    mutationFn: async ({ programId, reason, notifyParticipants }) => {
      const { data, error } = await supabase
        .from('programs')
        .update({
          status: 'cancelled',
          cancellation_reason: reason,
          cancelled_at: new Date().toISOString(),
          cancelled_by: user?.email,
          updated_at: new Date().toISOString()
        })
        .eq('id', programId)
        .select()
        .single();

      if (error) throw error;

      // Notify participants
      if (notifyParticipants) {
        await triggerEmail('program.cancelled', {
          entity_type: 'program',
          entity_id: programId,
          entity_data: {
            name: data.name_en,
            cancellation_reason: reason
          }
        });
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['programs-crud']);
      queryClient.invalidateQueries(['programs-with-visibility']);
      queryClient.invalidateQueries(['program', variables.programId]);
    }
  });

  // Delete program (soft delete)
  const deleteProgramMutation = useMutation({
    mutationFn: async (programId) => {
      const { error } = await supabase
        .from('programs')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
          deleted_by: user?.email
        })
        .eq('id', programId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['programs-crud']);
      queryClient.invalidateQueries(['programs-with-visibility']);
    }
  });

  return {
    // Query
    programs: programsQuery.data || [],
    isLoading: programsQuery.isLoading,
    error: programsQuery.error,
    refetch: programsQuery.refetch,

    // Single program hook
    useProgram,

    // Mutations
    createProgram: createProgramMutation.mutateAsync,
    updateProgram: updateProgramMutation.mutateAsync,
    launchProgram: launchProgramMutation.mutateAsync,
    completeProgram: completeProgramMutation.mutateAsync,
    cancelProgram: cancelProgramMutation.mutateAsync,
    deleteProgram: deleteProgramMutation.mutateAsync,

    // Mutation states
    isCreating: createProgramMutation.isPending,
    isUpdating: updateProgramMutation.isPending,
    isLaunching: launchProgramMutation.isPending,
    isCompleting: completeProgramMutation.isPending,
    isCancelling: cancelProgramMutation.isPending,
    isDeleting: deleteProgramMutation.isPending
  };
}

export default usePrograms;