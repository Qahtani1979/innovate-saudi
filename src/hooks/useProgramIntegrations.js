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

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuditLogger, ENTITY_TYPES } from './useAuditLogger';

export function useProgramIntegrations(programId) {
  const queryClient = useQueryClient();
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

export default useProgramIntegrations;
