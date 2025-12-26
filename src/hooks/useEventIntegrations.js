/**
 * Event Integrations Hook
 * Implements cross-system links for Events:
 * - ext-1: Program (event.program_id)
 * - ext-2: Strategic Plans (event.strategic_plan_ids)
 * - ext-3: Strategic Objectives (event.strategic_objective_ids)
 * - ext-4: Municipality (event.municipality_id)
 * - ext-5: Sector (event.sector_id)
 */

import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuditLogger, ENTITY_TYPES } from './useAuditLogger';

export function useEventIntegrations(eventId) {
  const queryClient = useAppQueryClient();
  const { logAuditEvent } = useAuditLogger();
  
  // ============================================
  // ext-1: Linked Program
  // ============================================
  const { data: linkedProgram, isLoading: programLoading } = useQuery({
    queryKey: ['event-program', eventId],
    queryFn: async () => {
      const { data: event } = await supabase
        .from('events')
        .select('program_id')
        .eq('id', eventId)
        .single();
      
      if (!event?.program_id) return null;
      
      const { data, error } = await supabase
        .from('programs')
        .select('id, name_en, name_ar, status, program_type')
        .eq('id', event.program_id)
        .eq('is_deleted', false)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!eventId
  });
  
  const linkProgram = useMutation({
    mutationFn: async (programId) => {
      const { error } = await supabase
        .from('events')
        .update({ 
          program_id: programId,
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId);
      
      if (error) throw error;
      
      await logAuditEvent({
        action: 'link_program',
        entityType: ENTITY_TYPES.EVENT,
        entityId: eventId,
        metadata: { program_id: programId }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-program', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      toast.success('Program linked successfully');
    }
  });
  
  const unlinkProgram = useMutation({
    mutationFn: async () => {
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
      queryClient.invalidateQueries({ queryKey: ['event-program', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      toast.success('Program unlinked');
    }
  });
  
  // ============================================
  // ext-2: Strategic Plans
  // ============================================
  const { data: linkedStrategicPlans, isLoading: strategicLoading } = useQuery({
    queryKey: ['event-strategic-plans', eventId],
    queryFn: async () => {
      const { data: event } = await supabase
        .from('events')
        .select('strategic_plan_ids')
        .eq('id', eventId)
        .single();
      
      const planIds = event?.strategic_plan_ids || [];
      if (planIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('strategic_plans')
        .select('id, title_en, title_ar, status, plan_type')
        .in('id', planIds);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!eventId
  });
  
  const linkStrategicPlan = useMutation({
    mutationFn: async (planId) => {
      const { data: event } = await supabase
        .from('events')
        .select('strategic_plan_ids')
        .eq('id', eventId)
        .single();
      
      const currentIds = event?.strategic_plan_ids || [];
      if (currentIds.includes(planId)) return;
      
      const { error } = await supabase
        .from('events')
        .update({ 
          strategic_plan_ids: [...currentIds, planId],
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-strategic-plans', eventId] });
      toast.success('Strategic plan linked');
    }
  });
  
  const unlinkStrategicPlan = useMutation({
    mutationFn: async (planId) => {
      const { data: event } = await supabase
        .from('events')
        .select('strategic_plan_ids')
        .eq('id', eventId)
        .single();
      
      const updatedIds = (event?.strategic_plan_ids || []).filter(id => id !== planId);
      
      const { error } = await supabase
        .from('events')
        .update({ 
          strategic_plan_ids: updatedIds,
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-strategic-plans', eventId] });
      toast.success('Strategic plan unlinked');
    }
  });
  
  // ============================================
  // ext-3: Strategic Objectives
  // ============================================
  const { data: linkedStrategicObjectives, isLoading: objectivesLoading } = useQuery({
    queryKey: ['event-strategic-objectives', eventId],
    queryFn: async () => {
      const { data: event } = await supabase
        .from('events')
        .select('strategic_objective_ids')
        .eq('id', eventId)
        .single();
      
      const objectiveIds = event?.strategic_objective_ids || [];
      if (objectiveIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('strategic_objectives')
        .select('id, title_en, title_ar, status')
        .in('id', objectiveIds);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!eventId
  });
  
  const linkStrategicObjective = useMutation({
    mutationFn: async (objectiveId) => {
      const { data: event } = await supabase
        .from('events')
        .select('strategic_objective_ids')
        .eq('id', eventId)
        .single();
      
      const currentIds = event?.strategic_objective_ids || [];
      if (currentIds.includes(objectiveId)) return;
      
      const { error } = await supabase
        .from('events')
        .update({ 
          strategic_objective_ids: [...currentIds, objectiveId],
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-strategic-objectives', eventId] });
      toast.success('Strategic objective linked');
    }
  });
  
  // ============================================
  // ext-4: Municipality
  // ============================================
  const { data: linkedMunicipality, isLoading: municipalityLoading } = useQuery({
    queryKey: ['event-municipality', eventId],
    queryFn: async () => {
      const { data: event } = await supabase
        .from('events')
        .select('municipality_id')
        .eq('id', eventId)
        .single();
      
      if (!event?.municipality_id) return null;
      
      const { data, error } = await supabase
        .from('municipalities')
        .select('id, name_en, name_ar, region_id')
        .eq('id', event.municipality_id)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!eventId
  });
  
  const linkMunicipality = useMutation({
    mutationFn: async (municipalityId) => {
      const { error } = await supabase
        .from('events')
        .update({ 
          municipality_id: municipalityId,
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-municipality', eventId] });
      toast.success('Municipality linked');
    }
  });
  
  // ============================================
  // ext-5: Sector
  // ============================================
  const { data: linkedSector, isLoading: sectorLoading } = useQuery({
    queryKey: ['event-sector', eventId],
    queryFn: async () => {
      const { data: event } = await supabase
        .from('events')
        .select('sector_id')
        .eq('id', eventId)
        .single();
      
      if (!event?.sector_id) return null;
      
      const { data, error } = await supabase
        .from('sectors')
        .select('id, name_en, name_ar, code')
        .eq('id', event.sector_id)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!eventId
  });
  
  const linkSector = useMutation({
    mutationFn: async (sectorId) => {
      const { error } = await supabase
        .from('events')
        .update({ 
          sector_id: sectorId,
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-sector', eventId] });
      toast.success('Sector linked');
    }
  });
  
  return {
    // Program (ext-1)
    linkedProgram,
    programLoading,
    linkProgram: linkProgram.mutate,
    unlinkProgram: unlinkProgram.mutate,
    
    // Strategic Plans (ext-2)
    linkedStrategicPlans,
    strategicLoading,
    linkStrategicPlan: linkStrategicPlan.mutate,
    unlinkStrategicPlan: unlinkStrategicPlan.mutate,
    
    // Strategic Objectives (ext-3)
    linkedStrategicObjectives,
    objectivesLoading,
    linkStrategicObjective: linkStrategicObjective.mutate,
    
    // Municipality (ext-4)
    linkedMunicipality,
    municipalityLoading,
    linkMunicipality: linkMunicipality.mutate,
    
    // Sector (ext-5)
    linkedSector,
    sectorLoading,
    linkSector: linkSector.mutate,
    
    // Loading state
    isLoading: programLoading || strategicLoading || objectivesLoading || municipalityLoading || sectorLoading
  };
}

export default useEventIntegrations;

