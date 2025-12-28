import { useQuery, useMutation } from '@/hooks/useAppQueryClient';
/**
 * Challenge Integrations Hook
 * Implements: ext-1 (solutions), ext-2 (pilots), ext-3 (programs),
 * ext-4 (R&D projects), ext-5 (strategic plans)
 */

import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuditLogger, AUDIT_ACTIONS, ENTITY_TYPES } from './useAuditLogger';

export function useChallengeIntegrations(challengeId) {
  const queryClient = useAppQueryClient();
  const { logAuditEvent } = useAuditLogger();
  
  // ============================================
  // ext-1: Solution Matches
  // ============================================
  const { data: linkedSolutions, isLoading: solutionsLoading } = useQuery({
    queryKey: ['challenge-solutions', challengeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenge_solution_matches')
        .select(`
          *,
          solution:solutions(
            id, name_en, name_ar, description_en, description_ar, 
            status, maturity_level, provider_id
          )
        `)
        .eq('challenge_id', challengeId)
        .order('match_score', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!challengeId
  });
  
  const linkSolution = useMutation({
    mutationFn: async ({ solutionId, matchScore = 0, matchType = 'manual', notes }) => {
      const { data, error } = await supabase
        .from('challenge_solution_matches')
        .insert({
          challenge_id: challengeId,
          solution_id: solutionId,
          match_score: matchScore,
          match_type: matchType,
          notes,
          status: 'pending',
          matched_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Audit log
      await logAuditEvent({
        action: 'link_solution',
        entityType: ENTITY_TYPES.CHALLENGE,
        entityId: challengeId,
        metadata: { solution_id: solutionId, match_score: matchScore }
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenge-solutions', challengeId] });
      toast.success('Solution linked successfully');
    }
  });
  
  const unlinkSolution = useMutation({
    mutationFn: async (matchId) => {
      const { error } = await supabase
        .from('challenge_solution_matches')
        .delete()
        .eq('id', matchId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenge-solutions', challengeId] });
      toast.success('Solution unlinked');
    }
  });
  
  const updateSolutionMatchStatus = useMutation({
    mutationFn: async ({ matchId, status, notes }) => {
      const { data, error } = await supabase
        .from('challenge_solution_matches')
        .update({ status, notes, updated_at: new Date().toISOString() })
        .eq('id', matchId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenge-solutions', challengeId] });
    }
  });
  
  // ============================================
  // ext-2: Linked Pilots
  // ============================================
  const { data: linkedPilots, isLoading: pilotsLoading } = useQuery({
    queryKey: ['challenge-pilots', challengeId],
    queryFn: async () => {
      // First get the challenge with its linked pilot IDs
      const { data: challenge, error: challengeError } = await supabase
        .from('challenges')
        .select('linked_pilot_ids')
        .eq('id', challengeId)
        .single();
      
      if (challengeError) throw challengeError;
      
      const pilotIds = challenge?.linked_pilot_ids || [];
      if (pilotIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('pilots')
        .select('id, name_en, name_ar, status, municipality_id')
        .eq('is_deleted', false)
        .in('id', pilotIds);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!challengeId
  });
  
  const linkPilot = useMutation({
    mutationFn: async (pilotId) => {
      // Get current linked IDs
      const { data: challenge } = await supabase
        .from('challenges')
        .select('linked_pilot_ids')
        .eq('id', challengeId)
        .single();
      
      const currentIds = challenge?.linked_pilot_ids || [];
      if (currentIds.includes(pilotId)) return;
      
      const { error } = await supabase
        .from('challenges')
        .update({ 
          linked_pilot_ids: [...currentIds, pilotId],
          updated_at: new Date().toISOString()
        })
        .eq('id', challengeId);
      
      if (error) throw error;
      
      await logAuditEvent({
        action: 'link_pilot',
        entityType: ENTITY_TYPES.CHALLENGE,
        entityId: challengeId,
        metadata: { pilot_id: pilotId }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenge-pilots', challengeId] });
      queryClient.invalidateQueries({ queryKey: ['challenge', challengeId] });
      toast.success('Pilot linked successfully');
    }
  });
  
  const unlinkPilot = useMutation({
    mutationFn: async (pilotId) => {
      const { data: challenge } = await supabase
        .from('challenges')
        .select('linked_pilot_ids')
        .eq('id', challengeId)
        .single();
      
      const updatedIds = (challenge?.linked_pilot_ids || []).filter(id => id !== pilotId);
      
      const { error } = await supabase
        .from('challenges')
        .update({ 
          linked_pilot_ids: updatedIds,
          updated_at: new Date().toISOString()
        })
        .eq('id', challengeId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenge-pilots', challengeId] });
      queryClient.invalidateQueries({ queryKey: ['challenge', challengeId] });
      toast.success('Pilot unlinked');
    }
  });
  
  // ============================================
  // ext-3: Linked Programs
  // ============================================
  const { data: linkedPrograms, isLoading: programsLoading } = useQuery({
    queryKey: ['challenge-programs', challengeId],
    queryFn: async () => {
      const { data: challenge } = await supabase
        .from('challenges')
        .select('linked_program_ids')
        .eq('id', challengeId)
        .single();
      
      const programIds = challenge?.linked_program_ids || [];
      if (programIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('programs')
        .select('id, name_en, name_ar, status, program_type')
        .eq('is_deleted', false)
        .in('id', programIds);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!challengeId
  });
  
  const linkProgram = useMutation({
    mutationFn: async (programId) => {
      const { data: challenge } = await supabase
        .from('challenges')
        .select('linked_program_ids')
        .eq('id', challengeId)
        .single();
      
      const currentIds = challenge?.linked_program_ids || [];
      if (currentIds.includes(programId)) return;
      
      const { error } = await supabase
        .from('challenges')
        .update({ 
          linked_program_ids: [...currentIds, programId],
          updated_at: new Date().toISOString()
        })
        .eq('id', challengeId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenge-programs', challengeId] });
      toast.success('Program linked');
    }
  });
  
  // ============================================
  // ext-4: Linked R&D Projects
  // ============================================
  const { data: linkedRDProjects, isLoading: rdLoading } = useQuery({
    queryKey: ['challenge-rd-projects', challengeId],
    queryFn: async () => {
      const { data: challenge } = await supabase
        .from('challenges')
        .select('linked_rd_ids')
        .eq('id', challengeId)
        .single();
      
      const rdIds = challenge?.linked_rd_ids || [];
      if (rdIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('rd_projects')
        .select('id, title_en, title_ar, status, research_type')
        .in('id', rdIds);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!challengeId
  });
  
  const linkRDProject = useMutation({
    mutationFn: async (rdProjectId) => {
      const { data: challenge } = await supabase
        .from('challenges')
        .select('linked_rd_ids')
        .eq('id', challengeId)
        .single();
      
      const currentIds = challenge?.linked_rd_ids || [];
      if (currentIds.includes(rdProjectId)) return;
      
      const { error } = await supabase
        .from('challenges')
        .update({ 
          linked_rd_ids: [...currentIds, rdProjectId],
          updated_at: new Date().toISOString()
        })
        .eq('id', challengeId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenge-rd-projects', challengeId] });
      toast.success('R&D project linked');
    }
  });
  
  // ============================================
  // ext-5: Linked Strategic Plans
  // ============================================
  const { data: linkedStrategicPlans, isLoading: strategicLoading } = useQuery({
    queryKey: ['challenge-strategic-plans', challengeId],
    queryFn: async () => {
      const { data: challenge } = await supabase
        .from('challenges')
        .select('strategic_plan_ids')
        .eq('id', challengeId)
        .single();
      
      const planIds = challenge?.strategic_plan_ids || [];
      if (planIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('strategic_plans')
        .select('id, title_en, title_ar, status, plan_type')
        .in('id', planIds);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!challengeId
  });
  
  const linkStrategicPlan = useMutation({
    mutationFn: async (planId) => {
      const { data: challenge } = await supabase
        .from('challenges')
        .select('strategic_plan_ids')
        .eq('id', challengeId)
        .single();
      
      const currentIds = challenge?.strategic_plan_ids || [];
      if (currentIds.includes(planId)) return;
      
      const { error } = await supabase
        .from('challenges')
        .update({ 
          strategic_plan_ids: [...currentIds, planId],
          updated_at: new Date().toISOString()
        })
        .eq('id', challengeId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenge-strategic-plans', challengeId] });
      toast.success('Strategic plan linked');
    }
  });
  
  // ============================================
  // Proposals (related to solutions)
  // ============================================
  const { data: proposals, isLoading: proposalsLoading } = useQuery({
    queryKey: ['challenge-proposals', challengeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenge_proposals')
        .select(`
          *,
          organization:organizations(id, name_en, name_ar),
          provider:providers(id, name_en, name_ar)
        `)
        .eq('challenge_id', challengeId)
        .eq('is_deleted', false)
        .order('submitted_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!challengeId
  });
  
  return {
    // Solutions (ext-1)
    linkedSolutions,
    solutionsLoading,
    linkSolution: linkSolution.mutate,
    unlinkSolution: unlinkSolution.mutate,
    updateSolutionMatchStatus: updateSolutionMatchStatus.mutate,
    
    // Pilots (ext-2)
    linkedPilots,
    pilotsLoading,
    linkPilot: linkPilot.mutate,
    unlinkPilot: unlinkPilot.mutate,
    
    // Programs (ext-3)
    linkedPrograms,
    programsLoading,
    linkProgram: linkProgram.mutate,
    
    // R&D Projects (ext-4)
    linkedRDProjects,
    rdLoading,
    linkRDProject: linkRDProject.mutate,
    
    // Strategic Plans (ext-5)
    linkedStrategicPlans,
    strategicLoading,
    linkStrategicPlan: linkStrategicPlan.mutate,
    
    // Proposals
    proposals,
    proposalsLoading,
    
    // Loading state
    isLoading: solutionsLoading || pilotsLoading || programsLoading || rdLoading || strategicLoading
  };
}

export default useChallengeIntegrations;



