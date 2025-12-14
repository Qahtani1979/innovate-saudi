import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * useStrategyContext Hook
 *
 * Aggregates ALL strategic context data for informed strategy creation
 * without relying on React Query hooks. This avoids invalid hook
 * call issues while keeping the same return shape.
 */
export function useStrategyContext(strategicPlanId = null) {
  const [state, setState] = useState({
    plans: [],
    challenges: [],
    sectors: [],
    pestleFactors: [],
    swotAnalyses: [],
    stakeholderAnalyses: [],
    riskAssessments: [],
    strategyInputs: [],
    baselines: [],
    programs: [],
    pilots: [],
    nationalAlignments: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        // PHASE 2 DATA: Existing Strategic Plans
        const plansPromise = supabase
          .from('strategic_plans')
          .select(
            'id, name_en, name_ar, vision_en, vision_ar, status, pillars, objectives, municipality_id, created_at'
          )
          .order('created_at', { ascending: false });

        // Challenges
        const challengesPromise = supabase
          .from('challenges')
          .select(
            'id, title_en, status, sector_id, priority, strategic_plan_ids, is_strategy_derived'
          )
          .eq('is_deleted', false)
          .order('created_at', { ascending: false });

        // Sectors
        const sectorsPromise = supabase
          .from('sectors')
          .select('id, name_en, name_ar, code')
          .eq('is_active', true);

        // PESTLE
        const pestleQuery = supabase
          .from('environmental_factors')
          .select(
            'id, category, title_en, title_ar, description_en, impact_type, impact_level, trend, strategic_plan_id, created_at'
          );
        if (strategicPlanId) {
          pestleQuery.eq('strategic_plan_id', strategicPlanId);
        }

        // SWOT
        const swotQuery = supabase
          .from('swot_analyses')
          .select(
            'id, quadrant, title_en, title_ar, description_en, description_ar, impact_level, priority, strategic_plan_id, created_at'
          );
        if (strategicPlanId) {
          swotQuery.eq('strategic_plan_id', strategicPlanId);
        }

        // Stakeholders
        const stakeholderQuery = supabase
          .from('stakeholder_analyses')
          .select(
            'id, stakeholder_name_en, stakeholder_name_ar, stakeholder_type, power_level, interest_level, engagement_strategy, strategic_plan_id, created_at'
          );
        if (strategicPlanId) {
          stakeholderQuery.eq('strategic_plan_id', strategicPlanId);
        }

        // Risks
        const riskQuery = supabase
          .from('strategy_risks')
          .select(
            'id, name_en, name_ar, category, probability, impact, mitigation_strategy, strategic_plan_id, created_at'
          );
        if (strategicPlanId) {
          riskQuery.eq('strategic_plan_id', strategicPlanId);
        }

        // Strategy inputs
        const inputsQuery = supabase
          .from('strategy_inputs')
          .select(
            'id, source_type, source_name, input_text, theme, sentiment, priority_votes, strategic_plan_id, created_at'
          );
        if (strategicPlanId) {
          inputsQuery.eq('strategic_plan_id', strategicPlanId);
        }

        // Baselines
        const baselinesQuery = supabase
          .from('strategy_baselines')
          .select(
            'id, kpi_name_en, kpi_name_ar, category, baseline_value, target_value, unit, collection_date, strategic_plan_id, created_at'
          );
        if (strategicPlanId) {
          baselinesQuery.eq('strategic_plan_id', strategicPlanId);
        }

        // Programs
        const programsPromise = supabase
          .from('programs')
          .select(
            'id, name_en, sector_id, status, is_strategy_derived, strategic_plan_ids'
          )
          .eq('is_deleted', false);

        // Pilots
        const pilotsPromise = supabase
          .from('pilots')
          .select('id, title_en, title_ar, sector, stage, challenge_id')
          .eq('is_deleted', false);

        // National Strategy Alignments
        const alignmentsQuery = supabase
          .from('national_strategy_alignments')
          .select('id, strategic_plan_id, objective_id, national_strategy_type, national_goal_code, national_goal_name_en, national_goal_name_ar, alignment_score');
        if (strategicPlanId) {
          alignmentsQuery.eq('strategic_plan_id', strategicPlanId);
        }

        const [
          plansRes,
          challengesRes,
          sectorsRes,
          pestleRes,
          swotRes,
          stakeholderRes,
          riskRes,
          inputsRes,
          baselinesRes,
          programsRes,
          pilotsRes,
          alignmentsRes,
        ] = await Promise.all([
          plansPromise,
          challengesPromise,
          sectorsPromise,
          pestleQuery.order('created_at', { ascending: false }).limit(50),
          swotQuery.order('created_at', { ascending: false }).limit(50),
          stakeholderQuery.order('created_at', { ascending: false }).limit(50),
          riskQuery.order('created_at', { ascending: false }).limit(50),
          inputsQuery.order('created_at', { ascending: false }).limit(100),
          baselinesQuery.order('created_at', { ascending: false }).limit(50),
          programsPromise,
          pilotsPromise,
          alignmentsQuery,
        ]);

        if (cancelled) return;

        const plans = plansRes.data || [];
        const challenges = challengesRes.data || [];
        const sectors = sectorsRes.data || [];

        const pestleFactors = (pestleRes.data || []);

        const swotAnalyses = (swotRes.data || []);

        const stakeholderAnalyses = (stakeholderRes.data || []);

        const riskAssessments = (riskRes.data || []).map((r) => ({
          ...r,
          risk_score: (r.probability || 0) * (r.impact || 0),
          risk_title: r.name_en,
          risk_category: r.category,
        }));

        const strategyInputs = (inputsRes.data || []).map((d) => ({
          ...d,
          priority:
            d.priority_votes > 5
              ? 'high'
              : d.priority_votes > 2
              ? 'medium'
              : 'low',
        }));

        const baselines = (baselinesRes.data || []).map((d) => ({
          ...d,
          kpi_name: d.kpi_name_en,
          kpi_category: d.category,
          measurement_date: d.collection_date,
        }));

        const programs = programsRes.data || [];
        const pilots = (pilotsRes.data || []).map((p) => ({
          ...p,
          name_en: p.title_en,
          status: p.stage,
        }));
        
        const nationalAlignments = alignmentsRes.data || [];

        setState({
          plans,
          challenges,
          sectors,
          pestleFactors,
          swotAnalyses,
          stakeholderAnalyses,
          riskAssessments,
          strategyInputs,
          baselines,
          programs,
          pilots,
          nationalAlignments,
        });
      } catch (error) {
        console.error('Error loading strategy context', error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [strategicPlanId, reloadKey]);

  const {
    plans,
    challenges,
    sectors,
    pestleFactors,
    swotAnalyses,
    stakeholderAnalyses,
    riskAssessments,
    strategyInputs,
    baselines,
    programs,
    pilots,
    nationalAlignments,
  } = state;

  // Calculate aggregated context
  const aggregatedContext = useMemo(() => {
    // Calculate covered sectors (sectors with active plans, challenges, or programs)
    const coveredSectorIds = new Set();
    plans.forEach((p) => p.sector_id && coveredSectorIds.add(p.sector_id));
    challenges.forEach((c) => c.sector_id && coveredSectorIds.add(c.sector_id));
    programs.forEach((p) => p.sector_id && coveredSectorIds.add(p.sector_id));

    const coveredSectors = sectors.filter((s) => coveredSectorIds.has(s.id));
    const uncoveredSectors = sectors.filter((s) => !coveredSectorIds.has(s.id));

    // Identify unresolved challenges (not linked to any plan)
    const unresolvedChallenges = challenges.filter(
      (c) =>
        c.status !== 'resolved' &&
        (!c.strategic_plan_ids || c.strategic_plan_ids.length === 0)
    );

    // Strategy-derived vs organic entities
    const strategyDerivedChallenges = challenges.filter((c) => c.is_strategy_derived);
    const organicChallenges = challenges.filter((c) => !c.is_strategy_derived);

    // Extract all existing objectives across all plans
    const allExistingObjectives = plans.flatMap((p) =>
      (p.objectives || []).map((obj) => ({
        ...obj,
        planId: p.id,
        planName: p.name_en,
      }))
    );

    // Extract all existing pillars
    const allExistingPillars = plans.flatMap((p) =>
      (p.pillars || []).map((pillar) => ({
        ...pillar,
        planId: p.id,
        planName: p.name_en,
      }))
    );

    // PESTLE summary
    const pestleSummary = {
      opportunities: pestleFactors.filter((f) => f.impact_type === 'opportunity'),
      threats: pestleFactors.filter((f) => f.impact_type === 'threat'),
      highImpact: pestleFactors.filter((f) => f.impact_level === 'high'),
      byCategory: pestleFactors.reduce((acc, f) => {
        acc[f.category] = (acc[f.category] || 0) + 1;
        return acc;
      }, {}),
    };

    // SWOT summary (group by quadrant)
    const swotSummary = {
      strengths: swotAnalyses.filter((s) => s.quadrant === 'strengths'),
      weaknesses: swotAnalyses.filter((s) => s.quadrant === 'weaknesses'),
      opportunities: swotAnalyses.filter((s) => s.quadrant === 'opportunities'),
      threats: swotAnalyses.filter((s) => s.quadrant === 'threats'),
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
      unresolvedChallenges,
    });

    // Stakeholder Analysis Summary
    const stakeholderSummary = {
      total: stakeholderAnalyses.length,
      highPower: stakeholderAnalyses.filter((s) => s.power_level === 'high'),
      highInterest: stakeholderAnalyses.filter((s) => s.interest_level === 'high'),
      keyPlayers: stakeholderAnalyses.filter(
        (s) => s.power_level === 'high' && s.interest_level === 'high'
      ),
      byType: stakeholderAnalyses.reduce((acc, s) => {
        acc[s.stakeholder_type] = (acc[s.stakeholder_type] || 0) + 1;
        return acc;
      }, {}),
    };

    // Risk Assessment Summary
    const riskSummary = {
      total: riskAssessments.length,
      highRisk: riskAssessments.filter((r) => r.risk_score >= 15),
      mediumRisk: riskAssessments.filter(
        (r) => r.risk_score >= 8 && r.risk_score < 15
      ),
      lowRisk: riskAssessments.filter((r) => r.risk_score < 8),
      byCategory: riskAssessments.reduce((acc, r) => {
        acc[r.risk_category] = (acc[r.risk_category] || 0) + 1;
        return acc;
      }, {}),
      topRisks: riskAssessments.slice(0, 5),
    };

    // Strategy Inputs Summary
    const inputsSummary = {
      total: strategyInputs.length,
      positive: strategyInputs.filter((i) => i.sentiment === 'positive'),
      negative: strategyInputs.filter((i) => i.sentiment === 'negative'),
      neutral: strategyInputs.filter((i) => i.sentiment === 'neutral'),
      bySource: strategyInputs.reduce((acc, i) => {
        acc[i.source_type] = (acc[i.source_type] || 0) + 1;
        return acc;
      }, {}),
      byTheme: strategyInputs.reduce((acc, i) => {
        if (i.theme) acc[i.theme] = (acc[i.theme] || 0) + 1;
        return acc;
      }, {}),
      highPriority: strategyInputs.filter((i) => i.priority === 'high'),
    };

    // Baseline Metrics Summary
    const baselineSummary = {
      total: baselines.length,
      byCategory: baselines.reduce((acc, b) => {
        acc[b.kpi_category] = (acc[b.kpi_category] || 0) + 1;
        return acc;
      }, {}),
      withTargets: baselines.filter((b) => b.target_value != null),
      gapAnalysis: baselines.map((b) => ({
        kpi: b.kpi_name,
        baseline: b.baseline_value,
        target: b.target_value,
        gap: b.target_value ? b.target_value - b.baseline_value : null,
        gapPercent:
          b.target_value && b.baseline_value
            ? Math.round(
                ((b.target_value - b.baseline_value) / b.baseline_value) * 100
              )
            : null,
      })),
    };

    // National Alignments Summary
    const alignmentsSummary = {
      total: nationalAlignments.length,
      vision2030: nationalAlignments.filter(a => a.national_strategy_type === 'vision_2030'),
      sdg: nationalAlignments.filter(a => a.national_strategy_type === 'sdg'),
      nationalPriorities: nationalAlignments.filter(a => a.national_strategy_type === 'national_priorities'),
      byPlan: nationalAlignments.reduce((acc, a) => {
        acc[a.strategic_plan_id] = (acc[a.strategic_plan_id] || 0) + 1;
        return acc;
      }, {}),
      averageScore: nationalAlignments.length > 0 
        ? Math.round(nationalAlignments.reduce((sum, a) => sum + (a.alignment_score || 0), 0) / nationalAlignments.length)
        : 0,
    };

    return {
      // PHASE 2: Existing Strategic Data
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

      // PHASE 1: Pre-Planning Data
      pestleFactors,
      pestleSummary,
      swotAnalyses,
      swotSummary,
      stakeholderAnalyses,
      stakeholderSummary,
      riskAssessments,
      riskSummary,
      strategyInputs,
      inputsSummary,
      baselines,
      baselineSummary,

      // National Strategy Alignments
      nationalAlignments,
      alignmentsSummary,

      // Gaps
      gaps,

      // SUMMARY STATS
      stats: {
        // Phase 2 stats
        totalPlans: plans.length,
        activePlans: plans.filter((p) => p.status === 'active').length,
        totalChallenges: challenges.length,
        unresolvedChallenges: unresolvedChallenges.length,
        coveredSectorCount: coveredSectors.length,
        uncoveredSectorCount: uncoveredSectors.length,
        totalObjectives: allExistingObjectives.length,
        totalPrograms: programs.length,
        totalPilots: pilots.length,

        // Phase 1 stats
        pestleFactorCount: pestleFactors.length,
        swotAnalysisCount: swotAnalyses.length,
        stakeholderCount: stakeholderAnalyses.length,
        riskCount: riskAssessments.length,
        highRiskCount: riskAssessments.filter((r) => r.risk_score >= 15).length,
        inputCount: strategyInputs.length,
        baselineCount: baselines.length,
      },

      // PHASE 1 COMPLETENESS CHECK
      phase1Completeness: {
        pestle: pestleFactors.length > 0,
        swot: swotAnalyses.length > 0,
        stakeholders: stakeholderAnalyses.length > 0,
        risks: riskAssessments.length > 0,
        inputs: strategyInputs.length > 0,
        baselines: baselines.length > 0,
        completionPercent: Math.round(
          [
            pestleFactors,
            swotAnalyses,
            stakeholderAnalyses,
            riskAssessments,
            strategyInputs,
            baselines,
          ].filter((arr) => arr.length > 0).length /
            6 *
            100
        ),
      },
    };
  }, [
    plans,
    challenges,
    sectors,
    programs,
    pilots,
    pestleFactors,
    swotAnalyses,
    stakeholderAnalyses,
    riskAssessments,
    strategyInputs,
    baselines,
    nationalAlignments,
  ]);

  return {
    ...aggregatedContext,
    isLoading,
    refetch: () => setReloadKey((key) => key + 1),
  };
}


/**
 * Identify strategic gaps based on existing data
 * Returns bilingual gap descriptions
 */
function identifyGaps({ plans, challenges, sectors, programs, pilots, coveredSectors, uncoveredSectors, unresolvedChallenges }) {
  const gaps = [];

  // Gap: Uncovered sectors
  if (uncoveredSectors.length > 0) {
    gaps.push({
      type: 'uncovered_sectors',
      severity: 'high',
      title: `Sectors without strategic coverage`,
      title_ar: `قطاعات بدون تغطية استراتيجية`,
      description: `${uncoveredSectors.length} sectors have no strategic plans, challenges, or programs`,
      description_ar: `${uncoveredSectors.length} قطاعات ليس لديها خطط استراتيجية أو تحديات أو برامج`,
      sectors: uncoveredSectors,
      recommendation: 'Consider creating strategic initiatives for these sectors',
      recommendation_ar: 'يُنصح بإنشاء مبادرات استراتيجية لهذه القطاعات'
    });
  }

  // Gap: Unresolved challenges without plan linkage
  if (unresolvedChallenges.length > 0) {
    gaps.push({
      type: 'unlinked_challenges',
      severity: 'high',
      title: 'Challenges not linked to strategic plans',
      title_ar: 'تحديات غير مرتبطة بالخطط الاستراتيجية',
      description: `${unresolvedChallenges.length} unresolved challenges are not linked to any strategic plan`,
      description_ar: `${unresolvedChallenges.length} تحديات غير محلولة غير مرتبطة بأي خطة استراتيجية`,
      challenges: unresolvedChallenges,
      recommendation: 'Link these challenges to strategic objectives or create new plans to address them',
      recommendation_ar: 'اربط هذه التحديات بالأهداف الاستراتيجية أو أنشئ خططًا جديدة لمعالجتها'
    });
  }

  // Gap: Plans without objectives
  const plansWithoutObjectives = plans.filter(p => !p.objectives || p.objectives.length === 0);
  if (plansWithoutObjectives.length > 0) {
    gaps.push({
      type: 'plans_without_objectives',
      severity: 'medium',
      title: 'Strategic plans without objectives',
      title_ar: 'خطط استراتيجية بدون أهداف',
      description: `${plansWithoutObjectives.length} plans have no defined objectives`,
      description_ar: `${plansWithoutObjectives.length} خطط ليس لها أهداف محددة`,
      plans: plansWithoutObjectives,
      recommendation: 'Generate objectives for these plans using the Objective Generator',
      recommendation_ar: 'أنشئ أهدافًا لهذه الخطط باستخدام مولد الأهداف'
    });
  }

  // Gap: Plans without pillars
  const plansWithoutPillars = plans.filter(p => !p.pillars || p.pillars.length === 0);
  if (plansWithoutPillars.length > 0) {
    gaps.push({
      type: 'plans_without_pillars',
      severity: 'medium',
      title: 'Strategic plans without pillars',
      title_ar: 'خطط استراتيجية بدون ركائز',
      description: `${plansWithoutPillars.length} plans have no defined pillars`,
      description_ar: `${plansWithoutPillars.length} خطط ليس لها ركائز محددة`,
      plans: plansWithoutPillars,
      recommendation: 'Generate pillars for these plans using the Pillar Generator',
      recommendation_ar: 'أنشئ ركائز لهذه الخطط باستخدام مولد الركائز'
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
      title_ar: 'تحديات بدون برامج أو مشاريع تجريبية',
      description: `${challengesWithoutPrograms.length} challenges have no associated programs or pilots`,
      description_ar: `${challengesWithoutPrograms.length} تحديات ليس لها برامج أو مشاريع تجريبية مرتبطة`,
      challenges: challengesWithoutPrograms.slice(0, 10),
      recommendation: 'Consider cascading these challenges to programs or pilots',
      recommendation_ar: 'يُنصح بتحويل هذه التحديات إلى برامج أو مشاريع تجريبية'
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
  const { 
    existingPlans, gaps, unresolvedChallenges, uncoveredSectors, 
    pestleSummary, swotSummary, stakeholderSummary, riskSummary, 
    inputsSummary, baselineSummary, stats, phase1Completeness 
  } = context;
  
  let prompt = `STRATEGIC CONTEXT ANALYSIS\n\n`;
  
  // Phase 1 Completeness Check
  prompt += `PRE-PLANNING DATA STATUS: ${phase1Completeness?.completionPercent || 0}% Complete\n`;
  prompt += `- PESTLE Analysis: ${phase1Completeness?.pestle ? '✓' : '✗'}\n`;
  prompt += `- SWOT Analysis: ${phase1Completeness?.swot ? '✓' : '✗'}\n`;
  prompt += `- Stakeholder Analysis: ${phase1Completeness?.stakeholders ? '✓' : '✗'}\n`;
  prompt += `- Risk Assessment: ${phase1Completeness?.risks ? '✓' : '✗'}\n`;
  prompt += `- Strategy Inputs: ${phase1Completeness?.inputs ? '✓' : '✗'}\n`;
  prompt += `- Baseline Metrics: ${phase1Completeness?.baselines ? '✓' : '✗'}\n\n`;
  
  // ============================================
  // PHASE 2: Existing plans summary
  // ============================================
  prompt += `EXISTING STRATEGIC PLANS (${stats?.totalPlans || 0} total, ${stats?.activePlans || 0} active):\n`;
  (existingPlans || []).slice(0, 5).forEach(p => {
    prompt += `- ${p.name_en}: ${p.vision_en?.substring(0, 100) || 'No vision'}... (Status: ${p.status})\n`;
  });
  
  // Coverage analysis
  prompt += `\nSECTOR COVERAGE:\n`;
  prompt += `- Covered: ${stats?.coveredSectorCount || 0} sectors\n`;
  prompt += `- Uncovered: ${stats?.uncoveredSectorCount || 0} sectors\n`;
  if (uncoveredSectors?.length > 0) {
    prompt += `- Gaps: ${uncoveredSectors.map(s => s.name_en).join(', ')}\n`;
  }
  
  // Unresolved challenges
  prompt += `\nUNRESOLVED CHALLENGES (${stats?.unresolvedChallenges || 0}):\n`;
  (unresolvedChallenges || []).slice(0, 5).forEach(c => {
    prompt += `- ${c.title_en} (Priority: ${c.priority || 'Not set'})\n`;
  });
  
  // ============================================
  // PHASE 1: Pre-Planning Insights
  // ============================================
  
  // PESTLE insights
  if (pestleSummary?.opportunities?.length > 0 || pestleSummary?.threats?.length > 0) {
    prompt += `\nENVIRONMENTAL FACTORS (PESTLE):\n`;
    prompt += `- Opportunities: ${pestleSummary.opportunities.length}\n`;
    prompt += `- Threats: ${pestleSummary.threats.length}\n`;
    prompt += `- High Impact: ${pestleSummary.highImpact?.length || 0}\n`;
    
    // Add top opportunities
    if (pestleSummary.opportunities.length > 0) {
      prompt += `Top Opportunities:\n`;
      pestleSummary.opportunities.slice(0, 3).forEach(o => {
        prompt += `  - ${o.title_en}\n`;
      });
    }
    
    // Add top threats
    if (pestleSummary.threats.length > 0) {
      prompt += `Top Threats:\n`;
      pestleSummary.threats.slice(0, 3).forEach(t => {
        prompt += `  - ${t.title_en}\n`;
      });
    }
  }
  
  // SWOT insights
  if (swotSummary?.strengths?.length > 0 || swotSummary?.weaknesses?.length > 0) {
    prompt += `\nSWOT SUMMARY:\n`;
    prompt += `- Strengths: ${swotSummary.strengths.length} identified\n`;
    prompt += `- Weaknesses: ${swotSummary.weaknesses.length} identified\n`;
    prompt += `- Opportunities: ${swotSummary.opportunities?.length || 0} identified\n`;
    prompt += `- Threats: ${swotSummary.threats?.length || 0} identified\n`;
    
    // Add key strengths to build on
    if (swotSummary.strengths.length > 0) {
      prompt += `Key Strengths to Leverage:\n`;
      swotSummary.strengths.slice(0, 3).forEach(s => {
        prompt += `  - ${typeof s === 'string' ? s : s.text_en || JSON.stringify(s)}\n`;
      });
    }
  }
  
  // Stakeholder insights
  if (stakeholderSummary?.total > 0) {
    prompt += `\nSTAKEHOLDER ANALYSIS:\n`;
    prompt += `- Total Stakeholders Mapped: ${stakeholderSummary.total}\n`;
    prompt += `- Key Players (High Power + High Interest): ${stakeholderSummary.keyPlayers?.length || 0}\n`;
  }
  
  // Risk insights
  if (riskSummary?.total > 0) {
    prompt += `\nRISK ASSESSMENT:\n`;
    prompt += `- Total Risks Identified: ${riskSummary.total}\n`;
    prompt += `- High Risks: ${riskSummary.highRisk?.length || 0}\n`;
    prompt += `- Medium Risks: ${riskSummary.mediumRisk?.length || 0}\n`;
    
    if (riskSummary.topRisks?.length > 0) {
      prompt += `Top Risks to Address:\n`;
      riskSummary.topRisks.slice(0, 3).forEach(r => {
        prompt += `  - ${r.risk_title} (Score: ${r.risk_score})\n`;
      });
    }
  }
  
  // Strategy inputs insights
  if (inputsSummary?.total > 0) {
    prompt += `\nSTAKEHOLDER INPUTS:\n`;
    prompt += `- Total Inputs Collected: ${inputsSummary.total}\n`;
    prompt += `- Positive Sentiment: ${inputsSummary.positive?.length || 0}\n`;
    prompt += `- Negative Sentiment: ${inputsSummary.negative?.length || 0}\n`;
    prompt += `- High Priority: ${inputsSummary.highPriority?.length || 0}\n`;
    
    // Common themes
    const themes = Object.entries(inputsSummary.byTheme || {}).sort((a, b) => b[1] - a[1]).slice(0, 3);
    if (themes.length > 0) {
      prompt += `Common Themes: ${themes.map(([t, c]) => `${t} (${c})`).join(', ')}\n`;
    }
  }
  
  // Baseline metrics
  if (baselineSummary?.total > 0) {
    prompt += `\nBASELINE METRICS:\n`;
    prompt += `- KPIs with Baselines: ${baselineSummary.total}\n`;
    prompt += `- KPIs with Targets: ${baselineSummary.withTargets?.length || 0}\n`;
    
    // Show key baseline gaps
    const significantGaps = baselineSummary.gapAnalysis?.filter(g => g.gapPercent && Math.abs(g.gapPercent) > 20).slice(0, 3);
    if (significantGaps?.length > 0) {
      prompt += `Key Performance Gaps:\n`;
      significantGaps.forEach(g => {
        prompt += `  - ${g.kpi}: ${g.baseline} → ${g.target} (${g.gapPercent > 0 ? '+' : ''}${g.gapPercent}%)\n`;
      });
    }
  }
  
  // Identified gaps
  if (gaps?.length > 0) {
    prompt += `\nIDENTIFIED STRATEGIC GAPS:\n`;
    gaps.forEach(g => {
      prompt += `- [${g.severity.toUpperCase()}] ${g.title}: ${g.description}\n`;
    });
  }
  
  // Requirements
  prompt += `\n${'='.repeat(50)}\n`;
  prompt += `REQUIREMENTS FOR NEW STRATEGIC PLAN:\n`;
  prompt += `1. Address the identified gaps above\n`;
  prompt += `2. Avoid duplicating existing plan objectives\n`;
  prompt += `3. Focus on uncovered sectors: ${uncoveredSectors?.map(s => s.name_en).join(', ') || 'None identified'}\n`;
  prompt += `4. Build on existing strengths from SWOT analysis\n`;
  prompt += `5. Consider PESTLE opportunities and mitigate threats\n`;
  prompt += `6. Address high-priority stakeholder inputs\n`;
  prompt += `7. Include mitigation strategies for high-risk items\n`;
  prompt += `8. Set objectives that close baseline metric gaps\n`;
  
  return prompt;
}

export default useStrategyContext;
