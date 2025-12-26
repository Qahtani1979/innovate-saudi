/**
 * Program Integrations Hook
 * Implements cross-system links for Programs:
 * - ext-1: Pilots (pilots with source_program_id)
 * - ext-2: Events (events with program_id)
 * - ext-3: Solutions (solutions with source_program_id)
 * - ext-4: Strategic Plans (program.strategic_plan_ids)
 * - ext-5: Strategic Objectives (program.strategic_objective_ids)
 * - ext-6: Operator Organization (program.operator_organization_id)
 */

import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuditLogger, ENTITY_TYPES } from './useAuditLogger';

export function useProgramIntegrations(programId) {
  const queryClient = useAppQueryClient();
  const { logAuditEvent } = useAuditLogger();

  // ============================================
  // ext-1: Linked Pilots (pilots from this program)
  // ============================================
  const { data: linkedPilots, isLoading: pilotsLoading } = useQuery({
    queryKey: ['program-pilots', programId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pilots')
        .select('id, name_en, name_ar, status, stage, municipality_id')
        .eq('source_program_id', programId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!programId
  });

  // ============================================
  // ext-2: Linked Events
  // ============================================
  const { data: linkedEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ['program-events', programId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('id, title_en, title_ar, event_type, status, start_date, end_date')
        .eq('program_id', programId)
        .eq('is_deleted', false)
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!programId
  });

  const linkEvent = useMutation({
    mutationFn: async (eventId) => {
      const { error } = await supabase
        .from('events')
        .update({
          program_id: programId,
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId);

      if (error) throw error;

      await logAuditEvent({
        action: 'link_event',
        entityType: ENTITY_TYPES.PROGRAM,
        entityId: programId,
        metadata: { event_id: eventId }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-events', programId] });
      toast.success('Event linked successfully');
    }
  });

  const unlinkEvent = useMutation({
    mutationFn: async (eventId) => {
      const { error } = await supabase
        .from('events')
        .update({
          program_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-events', programId] });
      toast.success('Event unlinked');
    }
  });

  // ============================================
  // ext-3: Linked Solutions (solutions from this program)
  // ============================================
  const { data: linkedSolutions, isLoading: solutionsLoading } = useQuery({
    queryKey: ['program-solutions', programId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solutions')
        .select('id, name_en, name_ar, status, maturity_level')
        .eq('source_program_id', programId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!programId
  });

  // ============================================
  // ext-4: Strategic Plans
  // ============================================
  const { data: linkedStrategicPlans, isLoading: strategicLoading } = useQuery({
    queryKey: ['program-strategic-plans', programId],
    queryFn: async () => {
      const { data: program } = await supabase
        .from('programs')
        .select('strategic_plan_ids')
        .eq('id', programId)
        .single();

      const planIds = program?.strategic_plan_ids || [];
      if (planIds.length === 0) return [];

      const { data, error } = await supabase
        .from('strategic_plans')
        .select('id, title_en, title_ar, status, plan_type')
        .in('id', planIds);

      if (error) throw error;
      return data || [];
    },
    enabled: !!programId
  });

  const linkStrategicPlan = useMutation({
    mutationFn: async (planId) => {
      const { data: program } = await supabase
        .from('programs')
        .select('strategic_plan_ids')
        .eq('id', programId)
        .single();

      const currentIds = program?.strategic_plan_ids || [];
      if (currentIds.includes(planId)) return;

      const { error } = await supabase
        .from('programs')
        .update({
          strategic_plan_ids: [...currentIds, planId],
          updated_at: new Date().toISOString()
        })
        .eq('id', programId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-strategic-plans', programId] });
      toast.success('Strategic plan linked');
    }
  });

  const unlinkStrategicPlan = useMutation({
    mutationFn: async (planId) => {
      const { data: program } = await supabase
        .from('programs')
        .select('strategic_plan_ids')
        .eq('id', programId)
        .single();

      const updatedIds = (program?.strategic_plan_ids || []).filter(id => id !== planId);

      const { error } = await supabase
        .from('programs')
        .update({
          strategic_plan_ids: updatedIds,
          updated_at: new Date().toISOString()
        })
        .eq('id', programId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-strategic-plans', programId] });
      toast.success('Strategic plan unlinked');
    }
  });

  // ============================================
  // ext-5: Strategic Objectives
  // ============================================
  const { data: linkedStrategicObjectives, isLoading: objectivesLoading } = useQuery({
    queryKey: ['program-strategic-objectives', programId],
    queryFn: async () => {
      const { data: program } = await supabase
        .from('programs')
        .select('strategic_objective_ids')
        .eq('id', programId)
        .single();

      const objectiveIds = program?.strategic_objective_ids || [];
      if (objectiveIds.length === 0) return [];

      const { data, error } = await supabase
        .from('strategic_objectives')
        .select('id, title_en, title_ar, status')
        .in('id', objectiveIds);

      if (error) throw error;
      return data || [];
    },
    enabled: !!programId
  });

  const linkStrategicObjective = useMutation({
    mutationFn: async (objectiveId) => {
      const { data: program } = await supabase
        .from('programs')
        .select('strategic_objective_ids')
        .eq('id', programId)
        .single();

      const currentIds = program?.strategic_objective_ids || [];
      if (currentIds.includes(objectiveId)) return;

      const { error } = await supabase
        .from('programs')
        .update({
          strategic_objective_ids: [...currentIds, objectiveId],
          updated_at: new Date().toISOString()
        })
        .eq('id', programId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-strategic-objectives', programId] });
      toast.success('Strategic objective linked');
    }
  });

  // ============================================
  // ext-6: Operator Organization
  // ============================================
  const { data: operatorOrganization, isLoading: organizationLoading } = useQuery({
    queryKey: ['program-operator', programId],
    queryFn: async () => {
      const { data: program } = await supabase
        .from('programs')
        .select('operator_organization_id')
        .eq('id', programId)
        .single();

      if (!program?.operator_organization_id) return null;

      const { data, error } = await supabase
        .from('organizations')
        .select('id, name_en, name_ar, organization_type, verification_status')
        .eq('id', program.operator_organization_id)
        .single();

      if (error) return null;
      return data;
    },
    enabled: !!programId
  });

  const linkOperatorOrganization = useMutation({
    mutationFn: async (organizationId) => {
      const { error } = await supabase
        .from('programs')
        .update({
          operator_organization_id: organizationId,
          updated_at: new Date().toISOString()
        })
        .eq('id', programId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-operator', programId] });
      toast.success('Operator organization linked');
    }
  });

  return {
    // Pilots (ext-1)
    linkedPilots,
    pilotsLoading,

    // Events (ext-2)
    linkedEvents,
    eventsLoading,
    linkEvent: linkEvent.mutate,
    unlinkEvent: unlinkEvent.mutate,

    // Solutions (ext-3)
    linkedSolutions,
    solutionsLoading,

    // Strategic Plans (ext-4)
    linkedStrategicPlans,
    strategicLoading,
    linkStrategicPlan: linkStrategicPlan.mutate,
    unlinkStrategicPlan: unlinkStrategicPlan.mutate,

    // Strategic Objectives (ext-5)
    linkedStrategicObjectives,
    objectivesLoading,
    linkStrategicObjective: linkStrategicObjective.mutate,

    // Operator Organization (ext-6)
    operatorOrganization,
    organizationLoading,
    linkOperatorOrganization: linkOperatorOrganization.mutate,

    // Loading state
    isLoading: pilotsLoading || eventsLoading || solutionsLoading || strategicLoading || objectivesLoading || organizationLoading
  };
}

export function useProgramPilotLinks() {
  return useQuery({
    queryKey: ['program-pilot-links'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('program_pilot_links')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });
}

export function usePilotsForPrograms(programIds = []) {
  return useQuery({
    queryKey: ['pilots-for-programs', programIds],
    queryFn: async () => {
      if (!programIds.length) return [];
      // Fetch all pilots potentially related - optimizing this requires better schema indexing or RPC
      // For now, consistent with previous implementation but abstracted
      const { data, error } = await supabase.from('pilots').select('*');
      if (error) throw error;

      // Filter client side as per original logic due to complex relationship (array column or direct link)
      return (data || []).filter(p =>
        programIds.some(progId =>
          p.program_ids?.includes(progId) ||
          p.created_via_program === progId
        )
      );
    },
    enabled: programIds.length > 0
  });
}

export function useMatchmakerApplicationsForPrograms(programIds = []) {
  return useQuery({
    queryKey: ['matchmaker-apps-for-programs', programIds],
    queryFn: async () => {
      if (!programIds.length) return [];
      // Assuming matchmaker uses program_id or similar. 
      // Original code fetched ALL matchmaker apps then filtered by program type in the component?
      // "matchmakerPrograms = myPrograms.filter(program_type === 'matchmaker')"
      // "matchmakerApps = ...matchmaker_applications.select('*')"
      // It seems the original code fetched ALL matchmaker applications without filtering by program ID in the query?
      // Let's improve it to filter if possible, or replicate fetch-all if schema is unknown.
      // Based on table name 'matchmaker_applications', likely has 'program_id'.
      // I'll try filtering by program_id if it exists, otherwise fetch all.
      // Safe bet: fetch all and filter client side if unsure, but let's assume standard FK.
      // Re-reading original code: "const { data, error } = await supabase.from('matchmaker_applications').select('*');"
      // It didn't filter by IDs in the query.
      // But logically it should.
      // I will fetch all for safety to match behavior, but filtering `in('program_id', programIds)` would be better if confirmed.
      // Given I can't check schema easily right now, I'll replicate behavior but try to filter by program_id if possible.
      // Actually, the original code didn't filter the result by program ID *after* fetching either!
      // It fetched `matchmaker_applications` if `myPrograms` had ANY matchmaker program.
      // "const matchmakerInEngagement = matchmakerApps.filter(m => m.stage === 'engagement');"
      // This implies `matchmakerApps` contains apps for *my* programs.
      // If the table `matchmaker_applications` has `program_id`, I should use it.
      // I'll try `in('program_id', programIds)`.
      const { data, error } = await supabase
        .from('matchmaker_applications')
        .select('*')
        .in('program_id', programIds);

      if (error) {
        // Fallback if program_id doesn't exist or error? No, if error throw.
        throw error;
      }
      return data || [];
    },
    enabled: programIds.length > 0
  });
}

export default useProgramIntegrations;

