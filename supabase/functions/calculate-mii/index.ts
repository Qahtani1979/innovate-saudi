import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * MII (Municipal Innovation Index) Automated Calculation Engine
 * 
 * This function calculates MII scores based on real data from the system:
 * 
 * DIMENSIONS & CALCULATION LOGIC:
 * ================================
 * 
 * 1. LEADERSHIP (20% weight)
 *    - Profile completeness (contact info, website, strategic plan)
 *    - Active engagement (challenges created, pilots initiated)
 *    
 * 2. STRATEGY (15% weight)
 *    - Strategic plan linked
 *    - Challenge-to-pilot conversion rate
 *    - Long-term planning (challenges with strategic goals)
 *    
 * 3. CULTURE (15% weight)
 *    - Experimentation rate (pilots per 100k population)
 *    - Risk tolerance (variety of pilot stages)
 *    - Learning from failures (pilots with lessons learned)
 *    
 * 4. PARTNERSHIPS (15% weight)
 *    - Active partnerships count
 *    - Partnership diversity (types)
 *    - Cross-municipality collaboration
 *    
 * 5. CAPABILITIES (15% weight)
 *    - Digital infrastructure (website, systems)
 *    - Active pilots running (execution capability)
 *    - Staff capacity (challenges being addressed)
 *    
 * 6. IMPACT (20% weight)
 *    - Completed pilots count
 *    - Pilot success rate
 *    - Case studies published
 *    - Citizen feedback scores
 */

interface DimensionScore {
  score: number;
  indicators: Record<string, number>;
}

interface MIICalculation {
  overall_score: number;
  dimension_scores: Record<string, DimensionScore>;
  strengths: string[];
  improvement_areas: string[];
  trend: 'up' | 'down' | 'stable';
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { municipality_id, calculate_all } = await req.json();

    console.log(`[MII Calculation] Starting for municipality: ${municipality_id || 'ALL'}`);

    // Get municipalities to calculate
    let municipalitiesQuery = supabase
      .from('municipalities')
      .select('id, name_en, population, website, contact_person, contact_email, strategic_plan_id, mii_score');
    
    if (municipality_id && !calculate_all) {
      municipalitiesQuery = municipalitiesQuery.eq('id', municipality_id);
    }

    const { data: municipalities, error: munError } = await municipalitiesQuery;
    
    if (munError) {
      console.error('[MII Calculation] Error fetching municipalities:', munError);
      throw munError;
    }

    if (!municipalities || municipalities.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No municipalities found' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    const results = [];

    for (const municipality of municipalities) {
      console.log(`[MII Calculation] Processing: ${municipality.name_en}`);

      // Fetch related data
      const [
        { data: challenges },
        { data: pilots },
        { data: caseStudies },
        { data: partnerships },
        { data: previousResult }
      ] = await Promise.all([
        supabase.from('challenges').select('id, status, priority, strategic_goal, created_at')
          .eq('municipality_id', municipality.id)
          .eq('is_deleted', false),
        supabase.from('pilots').select('id, stage, success_probability, lessons_learned, created_at')
          .eq('municipality_id', municipality.id)
          .eq('is_deleted', false),
        supabase.from('case_studies').select('id, is_published')
          .eq('municipality_id', municipality.id),
        supabase.from('partnerships').select('id, partnership_type, status, parties')
          .eq('status', 'active'),
        supabase.from('mii_results').select('overall_score, assessment_year')
          .eq('municipality_id', municipality.id)
          .eq('is_published', true)
          .order('assessment_year', { ascending: false })
          .limit(1)
          .maybeSingle()
      ]);

      const challengesCount = challenges?.length || 0;
      const pilotsCount = pilots?.length || 0;
      const completedPilots = pilots?.filter(p => p.stage === 'completed')?.length || 0;
      const activePilots = pilots?.filter(p => p.stage === 'active' || p.stage === 'monitoring')?.length || 0;
      const completedWithSuccess = pilots?.filter(p => p.stage === 'completed' && p.success_probability) || [];
      const avgSuccessRate = completedWithSuccess.length > 0 
        ? completedWithSuccess.reduce((sum, p) => sum + (p.success_probability || 0), 0) / completedWithSuccess.length
        : 50;
      const caseStudiesCount = caseStudies?.filter(cs => cs.is_published)?.length || 0;
      const partnershipsCount = partnerships?.length || 0;
      const population = municipality.population || 100000;

      // Calculate dimension scores
      const dimensionScores: Record<string, DimensionScore> = {};

      // 1. LEADERSHIP (20%)
      const profileComplete = [
        municipality.contact_person,
        municipality.contact_email,
        municipality.website,
        municipality.strategic_plan_id
      ].filter(Boolean).length;
      
      const leadershipIndicators = {
        profile_completeness: Math.min(100, (profileComplete / 4) * 100),
        active_engagement: Math.min(100, (challengesCount * 10) + (pilotsCount * 15)),
        strategic_alignment: municipality.strategic_plan_id ? 80 : 30
      };
      dimensionScores['LEADERSHIP'] = {
        score: Math.round(
          leadershipIndicators.profile_completeness * 0.3 +
          leadershipIndicators.active_engagement * 0.4 +
          leadershipIndicators.strategic_alignment * 0.3
        ),
        indicators: leadershipIndicators
      };

      // 2. STRATEGY (15%)
      const challengesWithStrategy = challenges?.filter(c => c.strategic_goal)?.length || 0;
      const conversionRate = challengesCount > 0 ? (pilotsCount / challengesCount) * 100 : 0;
      
      const strategyIndicators = {
        strategic_planning: municipality.strategic_plan_id ? 85 : 40,
        challenge_to_pilot_conversion: Math.min(100, conversionRate * 2),
        strategic_alignment: challengesCount > 0 ? (challengesWithStrategy / challengesCount) * 100 : 50
      };
      dimensionScores['STRATEGY'] = {
        score: Math.round(
          strategyIndicators.strategic_planning * 0.4 +
          strategyIndicators.challenge_to_pilot_conversion * 0.35 +
          strategyIndicators.strategic_alignment * 0.25
        ),
        indicators: strategyIndicators
      };

      // 3. CULTURE (15%)
      const pilotsPerCapita = (pilotsCount / population) * 100000;
      const pilotStages = new Set(pilots?.map(p => p.stage)).size;
      const pilotsWithLessons = pilots?.filter(p => p.lessons_learned)?.length || 0;
      
      const cultureIndicators = {
        experimentation_rate: Math.min(100, pilotsPerCapita * 20),
        risk_tolerance: Math.min(100, pilotStages * 20),
        learning_mindset: pilotsCount > 0 ? (pilotsWithLessons / pilotsCount) * 100 : 50
      };
      dimensionScores['CULTURE'] = {
        score: Math.round(
          cultureIndicators.experimentation_rate * 0.4 +
          cultureIndicators.risk_tolerance * 0.3 +
          cultureIndicators.learning_mindset * 0.3
        ),
        indicators: cultureIndicators
      };

      // 4. PARTNERSHIPS (15%)
      const partnershipTypes = new Set(partnerships?.map(p => p.partnership_type)).size;
      
      const partnershipsIndicators = {
        partnership_count: Math.min(100, partnershipsCount * 15),
        partnership_diversity: Math.min(100, partnershipTypes * 25),
        collaboration_score: partnershipsCount > 0 ? 70 : 30
      };
      dimensionScores['PARTNERSHIPS'] = {
        score: Math.round(
          partnershipsIndicators.partnership_count * 0.4 +
          partnershipsIndicators.partnership_diversity * 0.3 +
          partnershipsIndicators.collaboration_score * 0.3
        ),
        indicators: partnershipsIndicators
      };

      // 5. CAPABILITIES (15%)
      const capabilitiesIndicators = {
        digital_infrastructure: municipality.website ? 75 : 40,
        execution_capacity: Math.min(100, activePilots * 25),
        challenge_management: Math.min(100, challengesCount * 12)
      };
      dimensionScores['CAPABILITIES'] = {
        score: Math.round(
          capabilitiesIndicators.digital_infrastructure * 0.3 +
          capabilitiesIndicators.execution_capacity * 0.4 +
          capabilitiesIndicators.challenge_management * 0.3
        ),
        indicators: capabilitiesIndicators
      };

      // 6. IMPACT (20%)
      const impactIndicators = {
        completed_pilots: Math.min(100, completedPilots * 20),
        success_rate: Math.min(100, avgSuccessRate || 50),
        knowledge_sharing: Math.min(100, caseStudiesCount * 25)
      };
      dimensionScores['IMPACT'] = {
        score: Math.round(
          impactIndicators.completed_pilots * 0.4 +
          impactIndicators.success_rate * 0.35 +
          impactIndicators.knowledge_sharing * 0.25
        ),
        indicators: impactIndicators
      };

      // Calculate overall score (weighted average)
      const weights = {
        LEADERSHIP: 0.20,
        STRATEGY: 0.15,
        CULTURE: 0.15,
        PARTNERSHIPS: 0.15,
        CAPABILITIES: 0.15,
        IMPACT: 0.20
      };

      const overallScore = Math.round(
        Object.entries(weights).reduce(
          (sum, [dim, weight]) => sum + (dimensionScores[dim]?.score || 0) * weight, 0
        )
      );

      // Determine strengths and improvement areas
      const sortedDimensions = Object.entries(dimensionScores)
        .sort(([, a], [, b]) => b.score - a.score);
      
      const strengths = sortedDimensions.slice(0, 2).map(([dim, data]) => {
        const labels: Record<string, string> = {
          LEADERSHIP: 'Strong leadership and governance',
          STRATEGY: 'Clear innovation strategy',
          CULTURE: 'Vibrant innovation culture',
          PARTNERSHIPS: 'Active partnership ecosystem',
          CAPABILITIES: 'Strong execution capabilities',
          IMPACT: 'High impact outcomes'
        };
        return labels[dim];
      });

      const improvementAreas = sortedDimensions.slice(-2).map(([dim, data]) => {
        const labels: Record<string, string> = {
          LEADERSHIP: 'Strengthen leadership engagement',
          STRATEGY: 'Develop clearer innovation strategy',
          CULTURE: 'Foster innovation culture',
          PARTNERSHIPS: 'Build more partnerships',
          CAPABILITIES: 'Improve execution capabilities',
          IMPACT: 'Focus on pilot completion and impact'
        };
        return labels[dim];
      });

      // Determine trend
      const previousScore = previousResult?.overall_score || 0;
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (overallScore > previousScore + 2) trend = 'up';
      else if (overallScore < previousScore - 2) trend = 'down';

      // Calculate rank (will be updated after all calculations)
      // For now, we'll update ranks after all municipalities are processed

      const calculation: MIICalculation = {
        overall_score: overallScore,
        dimension_scores: dimensionScores,
        strengths,
        improvement_areas: improvementAreas,
        trend
      };

      console.log(`[MII Calculation] ${municipality.name_en}: Score = ${overallScore}`);

      results.push({
        municipality_id: municipality.id,
        municipality_name: municipality.name_en,
        ...calculation
      });

      // Save to mii_results
      const currentYear = new Date().getFullYear();
      
      // Check if result exists for this year
      const { data: existingResult } = await supabase
        .from('mii_results')
        .select('id')
        .eq('municipality_id', municipality.id)
        .eq('assessment_year', currentYear)
        .maybeSingle();

      if (existingResult) {
        // Update existing
        await supabase
          .from('mii_results')
          .update({
            overall_score: overallScore,
            dimension_scores: dimensionScores,
            strengths,
            improvement_areas: improvementAreas,
            trend,
            assessment_date: new Date().toISOString().split('T')[0],
            is_published: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingResult.id);
      } else {
        // Insert new
        await supabase
          .from('mii_results')
          .insert({
            municipality_id: municipality.id,
            assessment_year: currentYear,
            overall_score: overallScore,
            dimension_scores: dimensionScores,
            rank: 1, // Will be updated
            previous_rank: municipality.mii_score ? null : null,
            strengths,
            improvement_areas: improvementAreas,
            trend,
            assessment_date: new Date().toISOString().split('T')[0],
            is_published: true
          });
      }
    }

    // Calculate and update ranks for all municipalities
    if (calculate_all || results.length > 1) {
      console.log('[MII Calculation] Updating ranks for all municipalities...');
      
      // Get all scores for current year
      const currentYear = new Date().getFullYear();
      const { data: allScores } = await supabase
        .from('mii_results')
        .select('id, municipality_id, overall_score')
        .eq('assessment_year', currentYear)
        .eq('is_published', true)
        .order('overall_score', { ascending: false });

      if (allScores) {
        for (let i = 0; i < allScores.length; i++) {
          const rank = i + 1;
          await supabase
            .from('mii_results')
            .update({ rank })
            .eq('id', allScores[i].id);
          
          // Also update municipality table
          await supabase
            .from('municipalities')
            .update({ 
              mii_score: allScores[i].overall_score,
              mii_rank: rank 
            })
            .eq('id', allScores[i].municipality_id);
        }
      }
    }

    console.log(`[MII Calculation] Completed. Processed ${results.length} municipalities.`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Calculated MII for ${results.length} municipalities`,
        results 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[MII Calculation] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
