/**
 * Sandbox Integrations Hook
 * Implements cross-system links for Sandboxes:
 * - ext-1: Pilots (pilots with sandbox_id)
 * - ext-2: Living Lab (sandbox.living_lab_id)
 * - ext-3: Strategic Plans (sandbox.strategic_plan_ids)
 * - ext-4: Strategic Objectives (sandbox.strategic_objective_ids)
 * - ext-5: Municipality (sandbox.municipality_id)
 * - ext-6: Sector (sandbox.sector_id)
 */

import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuditLogger, ENTITY_TYPES } from './useAuditLogger';

export function useSandboxIntegrations(sandboxId) {
  const queryClient = useAppQueryClient();
  const { logAuditEvent } = useAuditLogger();
  
  // ============================================
  // ext-1: Linked Pilots
  // ============================================
  const { data: linkedPilots, isLoading: pilotsLoading } = useQuery({
    queryKey: ['sandbox-pilots', sandboxId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pilots')
        .select('id, name_en, name_ar, status, stage, municipality_id')
        .eq('sandbox_id', sandboxId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!sandboxId
  });
  
  const linkPilot = useMutation({
    mutationFn: async (pilotId) => {
      const { error } = await supabase
        .from('pilots')
        .update({ 
          sandbox_id: sandboxId,
          updated_at: new Date().toISOString()
        })
        .eq('id', pilotId);
      
      if (error) throw error;
      
      await logAuditEvent({
        action: 'link_pilot',
        entityType: ENTITY_TYPES.SANDBOX,
        entityId: sandboxId,
        metadata: { pilot_id: pilotId }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sandbox-pilots', sandboxId] });
      toast.success('Pilot linked successfully');
    }
  });
  
  const unlinkPilot = useMutation({
    mutationFn: async (pilotId) => {
      const { error } = await supabase
        .from('pilots')
        .update({ 
          sandbox_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', pilotId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sandbox-pilots', sandboxId] });
      toast.success('Pilot unlinked');
    }
  });
  
  // ============================================
  // ext-2: Linked Living Lab
  // ============================================
  const { data: linkedLivingLab, isLoading: livingLabLoading } = useQuery({
    queryKey: ['sandbox-living-lab', sandboxId],
    queryFn: async () => {
      const { data: sandbox } = await supabase
        .from('sandboxes')
        .select('living_lab_id')
        .eq('id', sandboxId)
        .single();
      
      if (!sandbox?.living_lab_id) return null;
      
      const { data, error } = await supabase
        .from('living_labs')
        .select('id, name_en, name_ar, status, focus_areas')
        .eq('id', sandbox.living_lab_id)
        .eq('is_deleted', false)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!sandboxId
  });
  
  const linkLivingLab = useMutation({
    mutationFn: async (livingLabId) => {
      const { error } = await supabase
        .from('sandboxes')
        .update({ 
          living_lab_id: livingLabId,
          updated_at: new Date().toISOString()
        })
        .eq('id', sandboxId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sandbox-living-lab', sandboxId] });
      toast.success('Living Lab linked');
    }
  });
  
  const unlinkLivingLab = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('sandboxes')
        .update({ 
          living_lab_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', sandboxId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sandbox-living-lab', sandboxId] });
      toast.success('Living Lab unlinked');
    }
  });
  
  // ============================================
  // ext-3: Strategic Plans
  // ============================================
  const { data: linkedStrategicPlans, isLoading: strategicLoading } = useQuery({
    queryKey: ['sandbox-strategic-plans', sandboxId],
    queryFn: async () => {
      const { data: sandbox } = await supabase
        .from('sandboxes')
        .select('strategic_plan_ids')
        .eq('id', sandboxId)
        .single();
      
      const planIds = sandbox?.strategic_plan_ids || [];
      if (planIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('strategic_plans')
        .select('id, title_en, title_ar, status, plan_type')
        .in('id', planIds);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!sandboxId
  });
  
  const linkStrategicPlan = useMutation({
    mutationFn: async (planId) => {
      const { data: sandbox } = await supabase
        .from('sandboxes')
        .select('strategic_plan_ids')
        .eq('id', sandboxId)
        .single();
      
      const currentIds = sandbox?.strategic_plan_ids || [];
      if (currentIds.includes(planId)) return;
      
      const { error } = await supabase
        .from('sandboxes')
        .update({ 
          strategic_plan_ids: [...currentIds, planId],
          updated_at: new Date().toISOString()
        })
        .eq('id', sandboxId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sandbox-strategic-plans', sandboxId] });
      toast.success('Strategic plan linked');
    }
  });
  
  const unlinkStrategicPlan = useMutation({
    mutationFn: async (planId) => {
      const { data: sandbox } = await supabase
        .from('sandboxes')
        .select('strategic_plan_ids')
        .eq('id', sandboxId)
        .single();
      
      const updatedIds = (sandbox?.strategic_plan_ids || []).filter(id => id !== planId);
      
      const { error } = await supabase
        .from('sandboxes')
        .update({ 
          strategic_plan_ids: updatedIds,
          updated_at: new Date().toISOString()
        })
        .eq('id', sandboxId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sandbox-strategic-plans', sandboxId] });
      toast.success('Strategic plan unlinked');
    }
  });
  
  // ============================================
  // ext-4: Strategic Objectives
  // ============================================
  const { data: linkedStrategicObjectives, isLoading: objectivesLoading } = useQuery({
    queryKey: ['sandbox-strategic-objectives', sandboxId],
    queryFn: async () => {
      const { data: sandbox } = await supabase
        .from('sandboxes')
        .select('strategic_objective_ids')
        .eq('id', sandboxId)
        .single();
      
      const objectiveIds = sandbox?.strategic_objective_ids || [];
      if (objectiveIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('strategic_objectives')
        .select('id, title_en, title_ar, status')
        .in('id', objectiveIds);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!sandboxId
  });
  
  const linkStrategicObjective = useMutation({
    mutationFn: async (objectiveId) => {
      const { data: sandbox } = await supabase
        .from('sandboxes')
        .select('strategic_objective_ids')
        .eq('id', sandboxId)
        .single();
      
      const currentIds = sandbox?.strategic_objective_ids || [];
      if (currentIds.includes(objectiveId)) return;
      
      const { error } = await supabase
        .from('sandboxes')
        .update({ 
          strategic_objective_ids: [...currentIds, objectiveId],
          updated_at: new Date().toISOString()
        })
        .eq('id', sandboxId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sandbox-strategic-objectives', sandboxId] });
      toast.success('Strategic objective linked');
    }
  });
  
  // ============================================
  // ext-5: Municipality
  // ============================================
  const { data: linkedMunicipality, isLoading: municipalityLoading } = useQuery({
    queryKey: ['sandbox-municipality', sandboxId],
    queryFn: async () => {
      const { data: sandbox } = await supabase
        .from('sandboxes')
        .select('municipality_id')
        .eq('id', sandboxId)
        .single();
      
      if (!sandbox?.municipality_id) return null;
      
      const { data, error } = await supabase
        .from('municipalities')
        .select('id, name_en, name_ar, region_id')
        .eq('id', sandbox.municipality_id)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!sandboxId
  });
  
  const linkMunicipality = useMutation({
    mutationFn: async (municipalityId) => {
      const { error } = await supabase
        .from('sandboxes')
        .update({ 
          municipality_id: municipalityId,
          updated_at: new Date().toISOString()
        })
        .eq('id', sandboxId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sandbox-municipality', sandboxId] });
      toast.success('Municipality linked');
    }
  });
  
  // ============================================
  // ext-6: Sector
  // ============================================
  const { data: linkedSector, isLoading: sectorLoading } = useQuery({
    queryKey: ['sandbox-sector', sandboxId],
    queryFn: async () => {
      const { data: sandbox } = await supabase
        .from('sandboxes')
        .select('sector_id')
        .eq('id', sandboxId)
        .single();
      
      if (!sandbox?.sector_id) return null;
      
      const { data, error } = await supabase
        .from('sectors')
        .select('id, name_en, name_ar, code')
        .eq('id', sandbox.sector_id)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!sandboxId
  });
  
  const linkSector = useMutation({
    mutationFn: async (sectorId) => {
      const { error } = await supabase
        .from('sandboxes')
        .update({ 
          sector_id: sectorId,
          updated_at: new Date().toISOString()
        })
        .eq('id', sandboxId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sandbox-sector', sandboxId] });
      toast.success('Sector linked');
    }
  });
  
  return {
    // Pilots (ext-1)
    linkedPilots,
    pilotsLoading,
    linkPilot: linkPilot.mutate,
    unlinkPilot: unlinkPilot.mutate,
    
    // Living Lab (ext-2)
    linkedLivingLab,
    livingLabLoading,
    linkLivingLab: linkLivingLab.mutate,
    unlinkLivingLab: unlinkLivingLab.mutate,
    
    // Strategic Plans (ext-3)
    linkedStrategicPlans,
    strategicLoading,
    linkStrategicPlan: linkStrategicPlan.mutate,
    unlinkStrategicPlan: unlinkStrategicPlan.mutate,
    
    // Strategic Objectives (ext-4)
    linkedStrategicObjectives,
    objectivesLoading,
    linkStrategicObjective: linkStrategicObjective.mutate,
    
    // Municipality (ext-5)
    linkedMunicipality,
    municipalityLoading,
    linkMunicipality: linkMunicipality.mutate,
    
    // Sector (ext-6)
    linkedSector,
    sectorLoading,
    linkSector: linkSector.mutate,
    
    // Loading state
    isLoading: pilotsLoading || livingLabLoading || strategicLoading || objectivesLoading || municipalityLoading || sectorLoading
  };
}

export default useSandboxIntegrations;

