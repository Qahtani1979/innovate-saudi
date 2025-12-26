/**
 * Solution Integrations Hook
 * Implements cross-system links for Solutions:
 * - ext-1: Challenge Matches (via challenge_solution_matches)
 * - ext-2: Pilots (pilots with solution_id)
 * - ext-3: Source Program (solution.source_program_id)
 * - ext-4: Source R&D Project (solution.source_rd_project_id)
 * - ext-5: Provider (solution.provider_id)
 */

import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuditLogger, ENTITY_TYPES } from './useAuditLogger';

export function useSolutionIntegrations(solutionId) {
  const queryClient = useAppQueryClient();
  const { logAuditEvent } = useAuditLogger();
  
  // ============================================
  // ext-1: Linked Challenges (via matches)
  // ============================================
  const { data: linkedChallenges, isLoading: challengesLoading } = useQuery({
    queryKey: ['solution-challenges', solutionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenge_solution_matches')
        .select(`
          *,
          challenge:challenges(
            id, title_en, title_ar, status, priority, municipality_id
          )
        `)
        .eq('solution_id', solutionId)
        .order('match_score', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!solutionId
  });
  
  const linkChallenge = useMutation({
    mutationFn: async ({ challengeId, matchScore = 0, matchType = 'manual', notes }) => {
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
      
      await logAuditEvent({
        action: 'link_challenge',
        entityType: ENTITY_TYPES.SOLUTION,
        entityId: solutionId,
        metadata: { challenge_id: challengeId, match_score: matchScore }
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solution-challenges', solutionId] });
      toast.success('Challenge linked successfully');
    }
  });
  
  const unlinkChallenge = useMutation({
    mutationFn: async (matchId) => {
      const { error } = await supabase
        .from('challenge_solution_matches')
        .delete()
        .eq('id', matchId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solution-challenges', solutionId] });
      toast.success('Challenge unlinked');
    }
  });
  
  // ============================================
  // ext-2: Linked Pilots (pilots using this solution)
  // ============================================
  const { data: linkedPilots, isLoading: pilotsLoading } = useQuery({
    queryKey: ['solution-pilots', solutionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pilots')
        .select('id, name_en, name_ar, status, stage, municipality_id')
        .eq('solution_id', solutionId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!solutionId
  });
  
  // ============================================
  // ext-3: Source Program
  // ============================================
  const { data: sourceProgram, isLoading: programLoading } = useQuery({
    queryKey: ['solution-program', solutionId],
    queryFn: async () => {
      const { data: solution } = await supabase
        .from('solutions')
        .select('source_program_id')
        .eq('id', solutionId)
        .single();
      
      if (!solution?.source_program_id) return null;
      
      const { data, error } = await supabase
        .from('programs')
        .select('id, name_en, name_ar, status, program_type')
        .eq('id', solution.source_program_id)
        .eq('is_deleted', false)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!solutionId
  });
  
  const linkProgram = useMutation({
    mutationFn: async (programId) => {
      const { error } = await supabase
        .from('solutions')
        .update({ 
          source_program_id: programId,
          updated_at: new Date().toISOString()
        })
        .eq('id', solutionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solution-program', solutionId] });
      toast.success('Program linked');
    }
  });
  
  const unlinkProgram = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('solutions')
        .update({ 
          source_program_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', solutionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solution-program', solutionId] });
      toast.success('Program unlinked');
    }
  });
  
  // ============================================
  // ext-4: Source R&D Project
  // ============================================
  const { data: sourceRDProject, isLoading: rdLoading } = useQuery({
    queryKey: ['solution-rd-project', solutionId],
    queryFn: async () => {
      const { data: solution } = await supabase
        .from('solutions')
        .select('source_rd_project_id')
        .eq('id', solutionId)
        .single();
      
      if (!solution?.source_rd_project_id) return null;
      
      const { data, error } = await supabase
        .from('rd_projects')
        .select('id, title_en, title_ar, status, research_type')
        .eq('id', solution.source_rd_project_id)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!solutionId
  });
  
  const linkRDProject = useMutation({
    mutationFn: async (rdProjectId) => {
      const { error } = await supabase
        .from('solutions')
        .update({ 
          source_rd_project_id: rdProjectId,
          updated_at: new Date().toISOString()
        })
        .eq('id', solutionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solution-rd-project', solutionId] });
      toast.success('R&D project linked');
    }
  });
  
  const unlinkRDProject = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('solutions')
        .update({ 
          source_rd_project_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', solutionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solution-rd-project', solutionId] });
      toast.success('R&D project unlinked');
    }
  });
  
  // ============================================
  // ext-5: Provider
  // ============================================
  const { data: linkedProvider, isLoading: providerLoading } = useQuery({
    queryKey: ['solution-provider', solutionId],
    queryFn: async () => {
      const { data: solution } = await supabase
        .from('solutions')
        .select('provider_id')
        .eq('id', solutionId)
        .single();
      
      if (!solution?.provider_id) return null;
      
      const { data, error } = await supabase
        .from('providers')
        .select('id, name_en, name_ar, provider_type, verification_status')
        .eq('id', solution.provider_id)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!solutionId
  });
  
  const linkProvider = useMutation({
    mutationFn: async (providerId) => {
      const { error } = await supabase
        .from('solutions')
        .update({ 
          provider_id: providerId,
          updated_at: new Date().toISOString()
        })
        .eq('id', solutionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solution-provider', solutionId] });
      toast.success('Provider linked');
    }
  });
  
  return {
    // Challenges (ext-1)
    linkedChallenges,
    challengesLoading,
    linkChallenge: linkChallenge.mutate,
    unlinkChallenge: unlinkChallenge.mutate,
    
    // Pilots (ext-2)
    linkedPilots,
    pilotsLoading,
    
    // Source Program (ext-3)
    sourceProgram,
    programLoading,
    linkProgram: linkProgram.mutate,
    unlinkProgram: unlinkProgram.mutate,
    
    // Source R&D Project (ext-4)
    sourceRDProject,
    rdLoading,
    linkRDProject: linkRDProject.mutate,
    unlinkRDProject: unlinkRDProject.mutate,
    
    // Provider (ext-5)
    linkedProvider,
    providerLoading,
    linkProvider: linkProvider.mutate,
    
    // Loading state
    isLoading: challengesLoading || pilotsLoading || programLoading || rdLoading || providerLoading
  };
}

export default useSolutionIntegrations;

