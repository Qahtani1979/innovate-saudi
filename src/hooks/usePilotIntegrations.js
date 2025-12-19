/**
 * Pilot Integrations Hook
 * Implements cross-system links for Pilots:
 * - ext-1: Challenge (pilot.challenge_id)
 * - ext-2: Solution (pilot.solution_id)
 * - ext-3: Source Program (pilot.source_program_id)
 * - ext-4: Source R&D Project (pilot.source_rd_project_id)
 * - ext-5: Living Lab (pilot.living_lab_id)
 * - ext-6: Sandbox (pilot.sandbox_id)
 * - ext-7: Strategic Plans (pilot.strategic_plan_ids)
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuditLogger, AUDIT_ACTIONS, ENTITY_TYPES } from './useAuditLogger';

export function usePilotIntegrations(pilotId) {
  const queryClient = useQueryClient();
  const { logAuditEvent } = useAuditLogger();
  
  // ============================================
  // ext-1: Linked Challenge
  // ============================================
  const { data: linkedChallenge, isLoading: challengeLoading } = useQuery({
    queryKey: ['pilot-challenge', pilotId],
    queryFn: async () => {
      const { data: pilot } = await supabase
        .from('pilots')
        .select('challenge_id')
        .eq('id', pilotId)
        .single();
      
      if (!pilot?.challenge_id) return null;
      
      const { data, error } = await supabase
        .from('challenges')
        .select('id, title_en, title_ar, status, priority, municipality_id')
        .eq('id', pilot.challenge_id)
        .eq('is_deleted', false)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!pilotId
  });
  
  const linkChallenge = useMutation({
    mutationFn: async (challengeId) => {
      const { error } = await supabase
        .from('pilots')
        .update({ 
          challenge_id: challengeId,
          updated_at: new Date().toISOString()
        })
        .eq('id', pilotId);
      
      if (error) throw error;
      
      await logAuditEvent({
        action: 'link_challenge',
        entityType: ENTITY_TYPES.PILOT,
        entityId: pilotId,
        metadata: { challenge_id: challengeId }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilot-challenge', pilotId] });
      queryClient.invalidateQueries({ queryKey: ['pilot', pilotId] });
      toast.success('Challenge linked successfully');
    }
  });
  
  const unlinkChallenge = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('pilots')
        .update({ 
          challenge_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', pilotId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilot-challenge', pilotId] });
      queryClient.invalidateQueries({ queryKey: ['pilot', pilotId] });
      toast.success('Challenge unlinked');
    }
  });
  
  // ============================================
  // ext-2: Linked Solution
  // ============================================
  const { data: linkedSolution, isLoading: solutionLoading } = useQuery({
    queryKey: ['pilot-solution', pilotId],
    queryFn: async () => {
      const { data: pilot } = await supabase
        .from('pilots')
        .select('solution_id')
        .eq('id', pilotId)
        .single();
      
      if (!pilot?.solution_id) return null;
      
      const { data, error } = await supabase
        .from('solutions')
        .select('id, name_en, name_ar, status, maturity_level, provider_id')
        .eq('id', pilot.solution_id)
        .eq('is_deleted', false)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!pilotId
  });
  
  const linkSolution = useMutation({
    mutationFn: async (solutionId) => {
      const { error } = await supabase
        .from('pilots')
        .update({ 
          solution_id: solutionId,
          updated_at: new Date().toISOString()
        })
        .eq('id', pilotId);
      
      if (error) throw error;
      
      await logAuditEvent({
        action: 'link_solution',
        entityType: ENTITY_TYPES.PILOT,
        entityId: pilotId,
        metadata: { solution_id: solutionId }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilot-solution', pilotId] });
      queryClient.invalidateQueries({ queryKey: ['pilot', pilotId] });
      toast.success('Solution linked successfully');
    }
  });
  
  const unlinkSolution = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('pilots')
        .update({ 
          solution_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', pilotId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilot-solution', pilotId] });
      queryClient.invalidateQueries({ queryKey: ['pilot', pilotId] });
      toast.success('Solution unlinked');
    }
  });
  
  // ============================================
  // ext-3: Source Program
  // ============================================
  const { data: sourceProgram, isLoading: programLoading } = useQuery({
    queryKey: ['pilot-program', pilotId],
    queryFn: async () => {
      const { data: pilot } = await supabase
        .from('pilots')
        .select('source_program_id')
        .eq('id', pilotId)
        .single();
      
      if (!pilot?.source_program_id) return null;
      
      const { data, error } = await supabase
        .from('programs')
        .select('id, name_en, name_ar, status, program_type')
        .eq('id', pilot.source_program_id)
        .eq('is_deleted', false)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!pilotId
  });
  
  const linkProgram = useMutation({
    mutationFn: async (programId) => {
      const { error } = await supabase
        .from('pilots')
        .update({ 
          source_program_id: programId,
          updated_at: new Date().toISOString()
        })
        .eq('id', pilotId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilot-program', pilotId] });
      toast.success('Program linked');
    }
  });
  
  // ============================================
  // ext-4: Source R&D Project
  // ============================================
  const { data: sourceRDProject, isLoading: rdLoading } = useQuery({
    queryKey: ['pilot-rd-project', pilotId],
    queryFn: async () => {
      const { data: pilot } = await supabase
        .from('pilots')
        .select('source_rd_project_id')
        .eq('id', pilotId)
        .single();
      
      if (!pilot?.source_rd_project_id) return null;
      
      const { data, error } = await supabase
        .from('rd_projects')
        .select('id, title_en, title_ar, status, research_type')
        .eq('id', pilot.source_rd_project_id)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!pilotId
  });
  
  const linkRDProject = useMutation({
    mutationFn: async (rdProjectId) => {
      const { error } = await supabase
        .from('pilots')
        .update({ 
          source_rd_project_id: rdProjectId,
          updated_at: new Date().toISOString()
        })
        .eq('id', pilotId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilot-rd-project', pilotId] });
      toast.success('R&D project linked');
    }
  });
  
  // ============================================
  // ext-5: Living Lab
  // ============================================
  const { data: linkedLivingLab, isLoading: livingLabLoading } = useQuery({
    queryKey: ['pilot-living-lab', pilotId],
    queryFn: async () => {
      const { data: pilot } = await supabase
        .from('pilots')
        .select('living_lab_id')
        .eq('id', pilotId)
        .single();
      
      if (!pilot?.living_lab_id) return null;
      
      const { data, error } = await supabase
        .from('living_labs')
        .select('id, name_en, name_ar, status, focus_areas')
        .eq('id', pilot.living_lab_id)
        .eq('is_deleted', false)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!pilotId
  });
  
  const linkLivingLab = useMutation({
    mutationFn: async (livingLabId) => {
      const { error } = await supabase
        .from('pilots')
        .update({ 
          living_lab_id: livingLabId,
          updated_at: new Date().toISOString()
        })
        .eq('id', pilotId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilot-living-lab', pilotId] });
      toast.success('Living Lab linked');
    }
  });
  
  // ============================================
  // ext-6: Sandbox
  // ============================================
  const { data: linkedSandbox, isLoading: sandboxLoading } = useQuery({
    queryKey: ['pilot-sandbox', pilotId],
    queryFn: async () => {
      const { data: pilot } = await supabase
        .from('pilots')
        .select('sandbox_id')
        .eq('id', pilotId)
        .single();
      
      if (!pilot?.sandbox_id) return null;
      
      const { data, error } = await supabase
        .from('sandboxes')
        .select('id, name_en, name_ar, status, sandbox_type')
        .eq('id', pilot.sandbox_id)
        .eq('is_deleted', false)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!pilotId
  });
  
  const linkSandbox = useMutation({
    mutationFn: async (sandboxId) => {
      const { error } = await supabase
        .from('pilots')
        .update({ 
          sandbox_id: sandboxId,
          updated_at: new Date().toISOString()
        })
        .eq('id', pilotId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilot-sandbox', pilotId] });
      toast.success('Sandbox linked');
    }
  });
  
  // ============================================
  // ext-7: Strategic Plans
  // ============================================
  const { data: linkedStrategicPlans, isLoading: strategicLoading } = useQuery({
    queryKey: ['pilot-strategic-plans', pilotId],
    queryFn: async () => {
      const { data: pilot } = await supabase
        .from('pilots')
        .select('strategic_plan_ids')
        .eq('id', pilotId)
        .single();
      
      const planIds = pilot?.strategic_plan_ids || [];
      if (planIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('strategic_plans')
        .select('id, title_en, title_ar, status, plan_type')
        .in('id', planIds);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!pilotId
  });
  
  const linkStrategicPlan = useMutation({
    mutationFn: async (planId) => {
      const { data: pilot } = await supabase
        .from('pilots')
        .select('strategic_plan_ids')
        .eq('id', pilotId)
        .single();
      
      const currentIds = pilot?.strategic_plan_ids || [];
      if (currentIds.includes(planId)) return;
      
      const { error } = await supabase
        .from('pilots')
        .update({ 
          strategic_plan_ids: [...currentIds, planId],
          updated_at: new Date().toISOString()
        })
        .eq('id', pilotId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilot-strategic-plans', pilotId] });
      toast.success('Strategic plan linked');
    }
  });
  
  const unlinkStrategicPlan = useMutation({
    mutationFn: async (planId) => {
      const { data: pilot } = await supabase
        .from('pilots')
        .select('strategic_plan_ids')
        .eq('id', pilotId)
        .single();
      
      const updatedIds = (pilot?.strategic_plan_ids || []).filter(id => id !== planId);
      
      const { error } = await supabase
        .from('pilots')
        .update({ 
          strategic_plan_ids: updatedIds,
          updated_at: new Date().toISOString()
        })
        .eq('id', pilotId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilot-strategic-plans', pilotId] });
      toast.success('Strategic plan unlinked');
    }
  });
  
  return {
    // Challenge (ext-1)
    linkedChallenge,
    challengeLoading,
    linkChallenge: linkChallenge.mutate,
    unlinkChallenge: unlinkChallenge.mutate,
    
    // Solution (ext-2)
    linkedSolution,
    solutionLoading,
    linkSolution: linkSolution.mutate,
    unlinkSolution: unlinkSolution.mutate,
    
    // Source Program (ext-3)
    sourceProgram,
    programLoading,
    linkProgram: linkProgram.mutate,
    
    // Source R&D Project (ext-4)
    sourceRDProject,
    rdLoading,
    linkRDProject: linkRDProject.mutate,
    
    // Living Lab (ext-5)
    linkedLivingLab,
    livingLabLoading,
    linkLivingLab: linkLivingLab.mutate,
    
    // Sandbox (ext-6)
    linkedSandbox,
    sandboxLoading,
    linkSandbox: linkSandbox.mutate,
    
    // Strategic Plans (ext-7)
    linkedStrategicPlans,
    strategicLoading,
    linkStrategicPlan: linkStrategicPlan.mutate,
    unlinkStrategicPlan: unlinkStrategicPlan.mutate,
    
    // Loading state
    isLoading: challengeLoading || solutionLoading || programLoading || rdLoading || livingLabLoading || sandboxLoading || strategicLoading
  };
}

export default usePilotIntegrations;
