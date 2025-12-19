/**
 * Living Lab Integrations Hook
 * Implements cross-system links for Living Labs:
 * - ext-1: Pilots (pilots with living_lab_id)
 * - ext-2: Sandboxes (sandboxes with living_lab_id)
 * - ext-3: Strategic Plans (living_lab.strategic_plan_ids)
 * - ext-4: Strategic Objectives (living_lab.strategic_objective_ids)
 * - ext-5: Municipality (living_lab.municipality_id)
 * - ext-6: Sector (living_lab.sector_id)
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuditLogger, ENTITY_TYPES } from './useAuditLogger';

export function useLivingLabIntegrations(livingLabId) {
  const queryClient = useQueryClient();
  const { logAuditEvent } = useAuditLogger();
  
  // ============================================
  // ext-1: Linked Pilots
  // ============================================
  const { data: linkedPilots, isLoading: pilotsLoading } = useQuery({
    queryKey: ['living-lab-pilots', livingLabId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pilots')
        .select('id, name_en, name_ar, status, stage, municipality_id')
        .eq('living_lab_id', livingLabId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!livingLabId
  });
  
  const linkPilot = useMutation({
    mutationFn: async (pilotId) => {
      const { error } = await supabase
        .from('pilots')
        .update({ 
          living_lab_id: livingLabId,
          updated_at: new Date().toISOString()
        })
        .eq('id', pilotId);
      
      if (error) throw error;
      
      await logAuditEvent({
        action: 'link_pilot',
        entityType: ENTITY_TYPES.LIVING_LAB,
        entityId: livingLabId,
        metadata: { pilot_id: pilotId }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['living-lab-pilots', livingLabId] });
      toast.success('Pilot linked successfully');
    }
  });
  
  const unlinkPilot = useMutation({
    mutationFn: async (pilotId) => {
      const { error } = await supabase
        .from('pilots')
        .update({ 
          living_lab_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', pilotId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['living-lab-pilots', livingLabId] });
      toast.success('Pilot unlinked');
    }
  });
  
  // ============================================
  // ext-2: Linked Sandboxes
  // ============================================
  const { data: linkedSandboxes, isLoading: sandboxesLoading } = useQuery({
    queryKey: ['living-lab-sandboxes', livingLabId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sandboxes')
        .select('id, name_en, name_ar, status, sandbox_type')
        .eq('living_lab_id', livingLabId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!livingLabId
  });
  
  const linkSandbox = useMutation({
    mutationFn: async (sandboxId) => {
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
      queryClient.invalidateQueries({ queryKey: ['living-lab-sandboxes', livingLabId] });
      toast.success('Sandbox linked');
    }
  });
  
  const unlinkSandbox = useMutation({
    mutationFn: async (sandboxId) => {
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
      queryClient.invalidateQueries({ queryKey: ['living-lab-sandboxes', livingLabId] });
      toast.success('Sandbox unlinked');
    }
  });
  
  // ============================================
  // ext-3: Strategic Plans
  // ============================================
  const { data: linkedStrategicPlans, isLoading: strategicLoading } = useQuery({
    queryKey: ['living-lab-strategic-plans', livingLabId],
    queryFn: async () => {
      const { data: livingLab } = await supabase
        .from('living_labs')
        .select('strategic_plan_ids')
        .eq('id', livingLabId)
        .single();
      
      const planIds = livingLab?.strategic_plan_ids || [];
      if (planIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('strategic_plans')
        .select('id, title_en, title_ar, status, plan_type')
        .in('id', planIds);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!livingLabId
  });
  
  const linkStrategicPlan = useMutation({
    mutationFn: async (planId) => {
      const { data: livingLab } = await supabase
        .from('living_labs')
        .select('strategic_plan_ids')
        .eq('id', livingLabId)
        .single();
      
      const currentIds = livingLab?.strategic_plan_ids || [];
      if (currentIds.includes(planId)) return;
      
      const { error } = await supabase
        .from('living_labs')
        .update({ 
          strategic_plan_ids: [...currentIds, planId],
          updated_at: new Date().toISOString()
        })
        .eq('id', livingLabId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['living-lab-strategic-plans', livingLabId] });
      toast.success('Strategic plan linked');
    }
  });
  
  const unlinkStrategicPlan = useMutation({
    mutationFn: async (planId) => {
      const { data: livingLab } = await supabase
        .from('living_labs')
        .select('strategic_plan_ids')
        .eq('id', livingLabId)
        .single();
      
      const updatedIds = (livingLab?.strategic_plan_ids || []).filter(id => id !== planId);
      
      const { error } = await supabase
        .from('living_labs')
        .update({ 
          strategic_plan_ids: updatedIds,
          updated_at: new Date().toISOString()
        })
        .eq('id', livingLabId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['living-lab-strategic-plans', livingLabId] });
      toast.success('Strategic plan unlinked');
    }
  });
  
  // ============================================
  // ext-4: Strategic Objectives
  // ============================================
  const { data: linkedStrategicObjectives, isLoading: objectivesLoading } = useQuery({
    queryKey: ['living-lab-strategic-objectives', livingLabId],
    queryFn: async () => {
      const { data: livingLab } = await supabase
        .from('living_labs')
        .select('strategic_objective_ids')
        .eq('id', livingLabId)
        .single();
      
      const objectiveIds = livingLab?.strategic_objective_ids || [];
      if (objectiveIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('strategic_objectives')
        .select('id, title_en, title_ar, status')
        .in('id', objectiveIds);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!livingLabId
  });
  
  const linkStrategicObjective = useMutation({
    mutationFn: async (objectiveId) => {
      const { data: livingLab } = await supabase
        .from('living_labs')
        .select('strategic_objective_ids')
        .eq('id', livingLabId)
        .single();
      
      const currentIds = livingLab?.strategic_objective_ids || [];
      if (currentIds.includes(objectiveId)) return;
      
      const { error } = await supabase
        .from('living_labs')
        .update({ 
          strategic_objective_ids: [...currentIds, objectiveId],
          updated_at: new Date().toISOString()
        })
        .eq('id', livingLabId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['living-lab-strategic-objectives', livingLabId] });
      toast.success('Strategic objective linked');
    }
  });
  
  // ============================================
  // ext-5: Municipality
  // ============================================
  const { data: linkedMunicipality, isLoading: municipalityLoading } = useQuery({
    queryKey: ['living-lab-municipality', livingLabId],
    queryFn: async () => {
      const { data: livingLab } = await supabase
        .from('living_labs')
        .select('municipality_id')
        .eq('id', livingLabId)
        .single();
      
      if (!livingLab?.municipality_id) return null;
      
      const { data, error } = await supabase
        .from('municipalities')
        .select('id, name_en, name_ar, region_id')
        .eq('id', livingLab.municipality_id)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!livingLabId
  });
  
  const linkMunicipality = useMutation({
    mutationFn: async (municipalityId) => {
      const { error } = await supabase
        .from('living_labs')
        .update({ 
          municipality_id: municipalityId,
          updated_at: new Date().toISOString()
        })
        .eq('id', livingLabId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['living-lab-municipality', livingLabId] });
      toast.success('Municipality linked');
    }
  });
  
  // ============================================
  // ext-6: Sector
  // ============================================
  const { data: linkedSector, isLoading: sectorLoading } = useQuery({
    queryKey: ['living-lab-sector', livingLabId],
    queryFn: async () => {
      const { data: livingLab } = await supabase
        .from('living_labs')
        .select('sector_id')
        .eq('id', livingLabId)
        .single();
      
      if (!livingLab?.sector_id) return null;
      
      const { data, error } = await supabase
        .from('sectors')
        .select('id, name_en, name_ar, code')
        .eq('id', livingLab.sector_id)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!livingLabId
  });
  
  const linkSector = useMutation({
    mutationFn: async (sectorId) => {
      const { error } = await supabase
        .from('living_labs')
        .update({ 
          sector_id: sectorId,
          updated_at: new Date().toISOString()
        })
        .eq('id', livingLabId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['living-lab-sector', livingLabId] });
      toast.success('Sector linked');
    }
  });
  
  return {
    // Pilots (ext-1)
    linkedPilots,
    pilotsLoading,
    linkPilot: linkPilot.mutate,
    unlinkPilot: unlinkPilot.mutate,
    
    // Sandboxes (ext-2)
    linkedSandboxes,
    sandboxesLoading,
    linkSandbox: linkSandbox.mutate,
    unlinkSandbox: unlinkSandbox.mutate,
    
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
    isLoading: pilotsLoading || sandboxesLoading || strategicLoading || objectivesLoading || municipalityLoading || sectorLoading
  };
}

export default useLivingLabIntegrations;
