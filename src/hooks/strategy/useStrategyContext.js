import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * useStrategyContext Hook
 * 
 * Aggregates all strategic context data for informed strategy creation:
 * - Existing strategic plans
 * - Entity counts by sector
 * - Unresolved challenges
 * - Gap analysis results
 * - PESTLE factors (environmental scan)
 * - SWOT data
 * - Stakeholder inputs
 * - Baseline metrics
 * 
 * This hook ensures Phase 2 (Strategy Creation) considers all existing data
 * to avoid duplicates and fill identified gaps.
 */
export function useStrategyContext(strategicPlanId = null) {
  // Fetch all existing strategic plans
  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ['strategy-context-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strategic_plans')
        .select('id, name_en, name_ar, vision_en, vision_ar, status, pillars, objectives, sector_id, municipality_id, created_at')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  // Fetch all challenges
  const { data: challenges = [], isLoading: challengesLoading } = useQuery({
    queryKey: ['strategy-context-challenges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select('id, title_en, status, sector_id, priority, strategic_plan_ids, is_strategy_derived')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  // Fetch sectors
  const { data: sectors = [], isLoading: sectorsLoading } = useQuery({
    queryKey: ['strategy-context-sectors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sectors')
        .select('id, name_en, name_ar, code')
        .eq('is_active', true);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  // Fetch PESTLE environmental factors
  const { data: pestleFactors = [], isLoading: pestleLoading } = useQuery({
    queryKey: ['strategy-context-pestle', strategicPlanId],
    queryFn: async () => {
      let query = supabase
        .from('environmental_factors')
        .select('id, category, title_en, impact_type, impact_level, strategic_plan_id')
        .eq('is_deleted', false);
      
      if (strategicPlanId) {
        query = query.eq('strategic_plan_id', strategicPlanId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error && error.code !== 'PGRST116') throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  // Fetch SWOT analyses
  const { data: swotAnalyses = [], isLoading: swotLoading } = useQuery({
    queryKey: ['strategy-context-swot', strategicPlanId],
    queryFn: async () => {
      let query = supabase
        .from('swot_analyses')
        .select('id, strengths, weaknesses, opportunities, threats, strategic_plan_id');
      
      if (strategicPlanId) {
        query = query.eq('strategic_plan_id', strategicPlanId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false }).limit(5);
      if (error && error.code !== 'PGRST116') throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  // Fetch existing programs
  const { data: programs = [], isLoading: programsLoading } = useQuery({
    queryKey: ['strategy-context-programs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('id, name_en, sector_id, status, is_strategy_derived, strategic_plan_ids')
        .eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  // Fetch existing pilots
  const { data: pilots = [], isLoading: pilotsLoading } = useQuery({
    queryKey: ['strategy-context-pilots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pilots')
        .select('id, name_en, sector_id, status, challenge_id')
        .eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  // Calculate aggregated context
  const aggregatedContext = useMemo(() => {
    // Calculate covered sectors (sectors with active plans, challenges, or programs)
    const coveredSectorIds = new Set();
    plans.forEach(p => p.sector_id && coveredSectorIds.add(p.sector_id));
    challenges.forEach(c => c.sector_id && coveredSectorIds.add(c.sector_id));
    programs.forEach(p => p.sector_id && coveredSectorIds.add(p.sector_id));

    const coveredSectors = sectors.filter(s => coveredSectorIds.has(s.id));
    const uncoveredSectors = sectors.filter(s => !coveredSectorIds.has(s.id));

    // Identify unresolved challenges (not linked to any plan)
    const unresolvedChallenges = challenges.filter(c => 
      c.status !== 'resolved' && 
      (!c.strategic_plan_ids || c.strategic_plan_ids.length === 0)
    );

    // Strategy-derived vs organic entities
    const strategyDerivedChallenges = challenges.filter(c => c.is_strategy_derived);
    const organicChallenges = challenges.filter(c => !c.is_strategy_derived);

    // Extract all existing objectives across all plans
    const allExistingObjectives = plans.flatMap(p => 
      (p.objectives || []).map(obj => ({
        ...obj,
        planId: p.id,
        planName: p.name_en
      }))
    );

    // Extract all existing pillars
    const allExistingPillars = plans.flatMap(p => 
      (p.pillars || []).map(pillar => ({
        ...pillar,
        planId: p.id,
        planName: p.name_en
      }))
    );

    // PESTLE summary
    const pestleSummary = {
      opportunities: pestleFactors.filter(f => f.impact_type === 'opportunity'),
      threats: pestleFactors.filter(f => f.impact_type === 'threat'),
      highImpact: pestleFactors.filter(f => f.impact_level === 'high'),
      byCategory: pestleFactors.reduce((acc, f) => {
        acc[f.category] = (acc[f.category] || 0) + 1;
        return acc;
      }, {})
    };

    // SWOT summary (combine all analyses)
    const swotSummary = {
      strengths: swotAnalyses.flatMap(s => s.strengths || []),
      weaknesses: swotAnalyses.flatMap(s => s.weaknesses || []),
      opportunities: swotAnalyses.flatMap(s => s.opportunities || []),
      threats: swotAnalyses.flatMap(s => s.threats || [])
    };

    // Identify gaps
    const gaps = identifyGaps({
      plans,
      challenges,
      sectors,
      programs,
      pilots,
      coveredSectors,
      uncoveredSectors,
      unresolvedChallenges
    });

    return {
      // Existing data
      existingPlans: plans,
      existingObjectives: allExistingObjectives,
      existingPillars: allExistingPillars,
      
      // Coverage analysis
      sectors,
      coveredSectors,
      uncoveredSectors,
      
      // Challenges
      allChallenges: challenges,
      unresolvedChallenges,
      strategyDerivedChallenges,
      organicChallenges,
      
      // Programs & Pilots
      programs,
      pilots,
      
      // Preplanning data
      pestleFactors,
      pestleSummary,
      swotAnalyses,
      swotSummary,
      
      // Gaps
      gaps,
      
      // Summary stats
      stats: {
        totalPlans: plans.length,
        activePlans: plans.filter(p => p.status === 'active').length,
        totalChallenges: challenges.length,
        unresolvedChallenges: unresolvedChallenges.length,
        coveredSectorCount: coveredSectors.length,
        uncoveredSectorCount: uncoveredSectors.length,
        totalObjectives: allExistingObjectives.length,
        totalPrograms: programs.length,
        totalPilots: pilots.length
      }
    };
  }, [plans, challenges, sectors, programs, pilots, pestleFactors, swotAnalyses]);

  const isLoading = plansLoading || challengesLoading || sectorsLoading || 
                    pestleLoading || swotLoading || programsLoading || pilotsLoading;

  return {
    ...aggregatedContext,
    isLoading,
    refetch: () => {
      // Would need to invalidate all queries
    }
  };
}

/**
 * Identify strategic gaps based on existing data
 */
function identifyGaps({ plans, challenges, sectors, programs, pilots, coveredSectors, uncoveredSectors, unresolvedChallenges }) {
  const gaps = [];

  // Gap: Uncovered sectors
  if (uncoveredSectors.length > 0) {
    gaps.push({
      type: 'uncovered_sectors',
      severity: 'high',
      title: 'Sectors without strategic coverage',
      description: `${uncoveredSectors.length} sectors have no strategic plans, challenges, or programs`,
      sectors: uncoveredSectors,
      recommendation: 'Consider creating strategic initiatives for these sectors'
    });
  }

  // Gap: Unresolved challenges without plan linkage
  if (unresolvedChallenges.length > 0) {
    gaps.push({
      type: 'unlinked_challenges',
      severity: 'high',
      title: 'Challenges not linked to strategic plans',
      description: `${unresolvedChallenges.length} unresolved challenges are not linked to any strategic plan`,
      challenges: unresolvedChallenges,
      recommendation: 'Link these challenges to strategic objectives or create new plans to address them'
    });
  }

  // Gap: Plans without objectives
  const plansWithoutObjectives = plans.filter(p => !p.objectives || p.objectives.length === 0);
  if (plansWithoutObjectives.length > 0) {
    gaps.push({
      type: 'plans_without_objectives',
      severity: 'medium',
      title: 'Strategic plans without objectives',
      description: `${plansWithoutObjectives.length} plans have no defined objectives`,
      plans: plansWithoutObjectives,
      recommendation: 'Generate objectives for these plans using the Objective Generator'
    });
  }

  // Gap: Plans without pillars
  const plansWithoutPillars = plans.filter(p => !p.pillars || p.pillars.length === 0);
  if (plansWithoutPillars.length > 0) {
    gaps.push({
      type: 'plans_without_pillars',
      severity: 'medium',
      title: 'Strategic plans without pillars',
      description: `${plansWithoutPillars.length} plans have no defined pillars`,
      plans: plansWithoutPillars,
      recommendation: 'Generate pillars for these plans using the Pillar Generator'
    });
  }

  // Gap: Challenges without programs/pilots
  const challengesWithoutPrograms = challenges.filter(c => {
    const hasProgram = programs.some(p => 
      p.strategic_plan_ids?.some(spId => c.strategic_plan_ids?.includes(spId))
    );
    const hasPilot = pilots.some(p => p.challenge_id === c.id);
    return c.status !== 'resolved' && !hasProgram && !hasPilot;
  });
  
  if (challengesWithoutPrograms.length > 5) {
    gaps.push({
      type: 'challenges_without_action',
      severity: 'medium',
      title: 'Challenges without programs or pilots',
      description: `${challengesWithoutPrograms.length} challenges have no associated programs or pilots`,
      challenges: challengesWithoutPrograms.slice(0, 10),
      recommendation: 'Consider cascading these challenges to programs or pilots'
    });
  }

  return gaps;
}

/**
 * Check for similar/duplicate objectives
 */
export function checkObjectiveSimilarity(newObjective, existingObjectives, threshold = 0.6) {
  const duplicates = [];
  
  const newText = (newObjective.name_en || '').toLowerCase();
  
  existingObjectives.forEach(existing => {
    const existingText = (existing.name_en || '').toLowerCase();
    const similarity = calculateTextSimilarity(newText, existingText);
    
    if (similarity >= threshold) {
      duplicates.push({
        existing,
        similarity: Math.round(similarity * 100),
        isExactMatch: similarity === 1
      });
    }
  });
  
  return duplicates.sort((a, b) => b.similarity - a.similarity);
}

/**
 * Simple text similarity using Jaccard index
 */
function calculateTextSimilarity(text1, text2) {
  if (!text1 || !text2) return 0;
  
  const words1 = new Set(text1.split(/\s+/).filter(w => w.length > 2));
  const words2 = new Set(text2.split(/\s+/).filter(w => w.length > 2));
  
  if (words1.size === 0 || words2.size === 0) return 0;
  
  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

/**
 * Build context prompt for AI-driven strategy creation
 */
export function buildStrategyContextPrompt(context) {
  const { existingPlans, gaps, unresolvedChallenges, uncoveredSectors, pestleSummary, swotSummary, stats } = context;
  
  let prompt = `STRATEGIC CONTEXT ANALYSIS\n\n`;
  
  // Existing plans summary
  prompt += `EXISTING STRATEGIC PLANS (${stats.totalPlans} total, ${stats.activePlans} active):\n`;
  existingPlans.slice(0, 5).forEach(p => {
    prompt += `- ${p.name_en}: ${p.vision_en?.substring(0, 100) || 'No vision'}... (Status: ${p.status})\n`;
  });
  
  // Coverage analysis
  prompt += `\nSECTOR COVERAGE:\n`;
  prompt += `- Covered: ${stats.coveredSectorCount} sectors\n`;
  prompt += `- Uncovered: ${stats.uncoveredSectorCount} sectors\n`;
  if (uncoveredSectors.length > 0) {
    prompt += `- Gaps: ${uncoveredSectors.map(s => s.name_en).join(', ')}\n`;
  }
  
  // Unresolved challenges
  prompt += `\nUNRESOLVED CHALLENGES (${stats.unresolvedChallenges}):\n`;
  unresolvedChallenges.slice(0, 5).forEach(c => {
    prompt += `- ${c.title_en} (Priority: ${c.priority || 'Not set'})\n`;
  });
  
  // PESTLE insights
  if (pestleSummary.opportunities.length > 0 || pestleSummary.threats.length > 0) {
    prompt += `\nENVIRONMENTAL FACTORS (PESTLE):\n`;
    prompt += `- Opportunities: ${pestleSummary.opportunities.length}\n`;
    prompt += `- Threats: ${pestleSummary.threats.length}\n`;
    prompt += `- High Impact: ${pestleSummary.highImpact.length}\n`;
  }
  
  // SWOT insights
  if (swotSummary.strengths.length > 0 || swotSummary.weaknesses.length > 0) {
    prompt += `\nSWOT SUMMARY:\n`;
    prompt += `- Strengths: ${swotSummary.strengths.length} identified\n`;
    prompt += `- Weaknesses: ${swotSummary.weaknesses.length} identified\n`;
    prompt += `- Opportunities: ${swotSummary.opportunities.length} identified\n`;
    prompt += `- Threats: ${swotSummary.threats.length} identified\n`;
  }
  
  // Identified gaps
  if (gaps.length > 0) {
    prompt += `\nIDENTIFIED GAPS:\n`;
    gaps.forEach(g => {
      prompt += `- [${g.severity.toUpperCase()}] ${g.title}: ${g.description}\n`;
    });
  }
  
  prompt += `\nREQUIREMENTS:\n`;
  prompt += `1. Address the identified gaps above\n`;
  prompt += `2. Avoid duplicating existing plan objectives\n`;
  prompt += `3. Focus on uncovered sectors: ${uncoveredSectors.map(s => s.name_en).join(', ') || 'None'}\n`;
  prompt += `4. Build on existing strengths from SWOT analysis\n`;
  prompt += `5. Consider PESTLE opportunities and threats\n`;
  
  return prompt;
}

export default useStrategyContext;
