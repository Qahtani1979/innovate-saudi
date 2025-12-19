/**
 * R&D Project Integrations Hook
 * Implements cross-system links for R&D Projects:
 * - ext-1: Challenges (rd_project.challenge_ids)
 * - ext-2: Solution (rd_project.solution_id)
 * - ext-3: R&D Call (rd_project.rd_call_id)
 * - ext-4: Pilots (pilots with source_rd_project_id)
 * - ext-5: Solutions (solutions with source_rd_project_id)
 * - ext-6: Institution (rd_project.institution_id)
 * - ext-7: Sector (rd_project.sector_id)
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuditLogger, ENTITY_TYPES } from './useAuditLogger';

export function useRDProjectIntegrations(rdProjectId) {
  const queryClient = useQueryClient();
  const { logAuditEvent } = useAuditLogger();
  
  // ============================================
  // ext-1: Linked Challenges
  // ============================================
  const { data: linkedChallenges, isLoading: challengesLoading } = useQuery({
    queryKey: ['rd-project-challenges', rdProjectId],
    queryFn: async () => {
      const { data: rdProject } = await supabase
        .from('rd_projects')
        .select('challenge_ids')
        .eq('id', rdProjectId)
        .single();
      
      const challengeIds = rdProject?.challenge_ids || [];
      if (challengeIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('challenges')
        .select('id, title_en, title_ar, status, priority, municipality_id')
        .eq('is_deleted', false)
        .in('id', challengeIds);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!rdProjectId
  });
  
  const linkChallenge = useMutation({
    mutationFn: async (challengeId) => {
      const { data: rdProject } = await supabase
        .from('rd_projects')
        .select('challenge_ids')
        .eq('id', rdProjectId)
        .single();
      
      const currentIds = rdProject?.challenge_ids || [];
      if (currentIds.includes(challengeId)) return;
      
      const { error } = await supabase
        .from('rd_projects')
        .update({ 
          challenge_ids: [...currentIds, challengeId],
          updated_at: new Date().toISOString()
        })
        .eq('id', rdProjectId);
      
      if (error) throw error;
      
      await logAuditEvent({
        action: 'link_challenge',
        entityType: ENTITY_TYPES.RD_PROJECT,
        entityId: rdProjectId,
        metadata: { challenge_id: challengeId }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rd-project-challenges', rdProjectId] });
      toast.success('Challenge linked successfully');
    }
  });
  
  const unlinkChallenge = useMutation({
    mutationFn: async (challengeId) => {
      const { data: rdProject } = await supabase
        .from('rd_projects')
        .select('challenge_ids')
        .eq('id', rdProjectId)
        .single();
      
      const updatedIds = (rdProject?.challenge_ids || []).filter(id => id !== challengeId);
      
      const { error } = await supabase
        .from('rd_projects')
        .update({ 
          challenge_ids: updatedIds,
          updated_at: new Date().toISOString()
        })
        .eq('id', rdProjectId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rd-project-challenges', rdProjectId] });
      toast.success('Challenge unlinked');
    }
  });
  
  // ============================================
  // ext-2: Linked Solution (output)
  // ============================================
  const { data: linkedSolution, isLoading: solutionLoading } = useQuery({
    queryKey: ['rd-project-solution', rdProjectId],
    queryFn: async () => {
      const { data: rdProject } = await supabase
        .from('rd_projects')
        .select('solution_id')
        .eq('id', rdProjectId)
        .single();
      
      if (!rdProject?.solution_id) return null;
      
      const { data, error } = await supabase
        .from('solutions')
        .select('id, name_en, name_ar, status, maturity_level')
        .eq('id', rdProject.solution_id)
        .eq('is_deleted', false)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!rdProjectId
  });
  
  const linkSolution = useMutation({
    mutationFn: async (solutionId) => {
      const { error } = await supabase
        .from('rd_projects')
        .update({ 
          solution_id: solutionId,
          updated_at: new Date().toISOString()
        })
        .eq('id', rdProjectId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rd-project-solution', rdProjectId] });
      toast.success('Solution linked');
    }
  });
  
  const unlinkSolution = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('rd_projects')
        .update({ 
          solution_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', rdProjectId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rd-project-solution', rdProjectId] });
      toast.success('Solution unlinked');
    }
  });
  
  // ============================================
  // ext-3: R&D Call
  // ============================================
  const { data: linkedRDCall, isLoading: rdCallLoading } = useQuery({
    queryKey: ['rd-project-call', rdProjectId],
    queryFn: async () => {
      const { data: rdProject } = await supabase
        .from('rd_projects')
        .select('rd_call_id')
        .eq('id', rdProjectId)
        .single();
      
      if (!rdProject?.rd_call_id) return null;
      
      const { data, error } = await supabase
        .from('rd_calls')
        .select('id, title_en, title_ar, status, call_type')
        .eq('id', rdProject.rd_call_id)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!rdProjectId
  });
  
  const linkRDCall = useMutation({
    mutationFn: async (rdCallId) => {
      const { error } = await supabase
        .from('rd_projects')
        .update({ 
          rd_call_id: rdCallId,
          updated_at: new Date().toISOString()
        })
        .eq('id', rdProjectId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rd-project-call', rdProjectId] });
      toast.success('R&D call linked');
    }
  });
  
  // ============================================
  // ext-4: Derived Pilots
  // ============================================
  const { data: derivedPilots, isLoading: pilotsLoading } = useQuery({
    queryKey: ['rd-project-pilots', rdProjectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pilots')
        .select('id, name_en, name_ar, status, stage, municipality_id')
        .eq('source_rd_project_id', rdProjectId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!rdProjectId
  });
  
  // ============================================
  // ext-5: Derived Solutions
  // ============================================
  const { data: derivedSolutions, isLoading: derivedSolutionsLoading } = useQuery({
    queryKey: ['rd-project-derived-solutions', rdProjectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solutions')
        .select('id, name_en, name_ar, status, maturity_level')
        .eq('source_rd_project_id', rdProjectId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!rdProjectId
  });
  
  // ============================================
  // ext-6: Institution
  // ============================================
  const { data: linkedInstitution, isLoading: institutionLoading } = useQuery({
    queryKey: ['rd-project-institution', rdProjectId],
    queryFn: async () => {
      const { data: rdProject } = await supabase
        .from('rd_projects')
        .select('institution_id')
        .eq('id', rdProjectId)
        .single();
      
      if (!rdProject?.institution_id) return null;
      
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name_en, name_ar, organization_type')
        .eq('id', rdProject.institution_id)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!rdProjectId
  });
  
  const linkInstitution = useMutation({
    mutationFn: async (institutionId) => {
      const { error } = await supabase
        .from('rd_projects')
        .update({ 
          institution_id: institutionId,
          updated_at: new Date().toISOString()
        })
        .eq('id', rdProjectId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rd-project-institution', rdProjectId] });
      toast.success('Institution linked');
    }
  });
  
  // ============================================
  // ext-7: Sector
  // ============================================
  const { data: linkedSector, isLoading: sectorLoading } = useQuery({
    queryKey: ['rd-project-sector', rdProjectId],
    queryFn: async () => {
      const { data: rdProject } = await supabase
        .from('rd_projects')
        .select('sector_id')
        .eq('id', rdProjectId)
        .single();
      
      if (!rdProject?.sector_id) return null;
      
      const { data, error } = await supabase
        .from('sectors')
        .select('id, name_en, name_ar, code')
        .eq('id', rdProject.sector_id)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!rdProjectId
  });
  
  const linkSector = useMutation({
    mutationFn: async (sectorId) => {
      const { error } = await supabase
        .from('rd_projects')
        .update({ 
          sector_id: sectorId,
          updated_at: new Date().toISOString()
        })
        .eq('id', rdProjectId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rd-project-sector', rdProjectId] });
      toast.success('Sector linked');
    }
  });
  
  return {
    // Challenges (ext-1)
    linkedChallenges,
    challengesLoading,
    linkChallenge: linkChallenge.mutate,
    unlinkChallenge: unlinkChallenge.mutate,
    
    // Solution (ext-2)
    linkedSolution,
    solutionLoading,
    linkSolution: linkSolution.mutate,
    unlinkSolution: unlinkSolution.mutate,
    
    // R&D Call (ext-3)
    linkedRDCall,
    rdCallLoading,
    linkRDCall: linkRDCall.mutate,
    
    // Derived Pilots (ext-4)
    derivedPilots,
    pilotsLoading,
    
    // Derived Solutions (ext-5)
    derivedSolutions,
    derivedSolutionsLoading,
    
    // Institution (ext-6)
    linkedInstitution,
    institutionLoading,
    linkInstitution: linkInstitution.mutate,
    
    // Sector (ext-7)
    linkedSector,
    sectorLoading,
    linkSector: linkSector.mutate,
    
    // Loading state
    isLoading: challengesLoading || solutionLoading || rdCallLoading || pilotsLoading || derivedSolutionsLoading || institutionLoading || sectorLoading
  };
}

export default useRDProjectIntegrations;
