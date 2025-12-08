import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sector_id } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Sector gap analysis for: ${sector_id}`);

    // Fetch sector data
    const { data: sector } = await supabase
      .from('sectors')
      .select('name_en, description_en')
      .eq('id', sector_id)
      .single();

    // Fetch challenges in sector
    const { data: challenges } = await supabase
      .from('challenges')
      .select('id, title_en, status')
      .eq('sector_id', sector_id)
      .eq('is_deleted', false);

    // Fetch solutions in sector
    const { data: solutions } = await supabase
      .from('solutions')
      .select('id, title_en, status')
      .eq('sector_id', sector_id)
      .eq('is_deleted', false);

    // Calculate basic gaps
    const challengeCount = challenges?.length || 0;
    const solutionCount = solutions?.length || 0;
    const unresolvedChallenges = challenges?.filter(c => c.status !== 'resolved').length || 0;

    let analysis = {
      gaps: [] as Array<{
        area: string;
        severity: string;
        description: string;
        recommendations: string[];
      }>,
      opportunities: [] as string[],
      priorities: [] as string[]
    };

    if (LOVABLE_API_KEY && sector) {
      const prompt = `Analyze gaps and opportunities for the ${sector.name_en} sector:
      
      Current State:
      - ${challengeCount} identified challenges
      - ${unresolvedChallenges} unresolved challenges
      - ${solutionCount} available solutions
      
      Generate:
      1. Key Gaps (5 items with severity, description, and recommendations)
      2. Strategic Opportunities (5 items)
      3. Priority Actions (5 items)
      
      Format as structured JSON.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';
        
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            analysis = { ...analysis, ...parsed };
          }
        } catch {
          console.warn('Could not parse analysis JSON');
        }
      }
    }

    // Fallback analysis
    if (analysis.gaps.length === 0) {
      analysis = {
        gaps: [
          {
            area: 'Solution Coverage',
            severity: solutionCount < challengeCount ? 'high' : 'medium',
            description: `${unresolvedChallenges} challenges without matching solutions`,
            recommendations: ['Increase solution sourcing', 'Launch targeted R&D calls']
          },
          {
            area: 'Innovation Pipeline',
            severity: 'medium',
            description: 'Limited flow of new innovations',
            recommendations: ['Strengthen startup partnerships', 'Enhance ideation programs']
          }
        ],
        opportunities: [
          'Cross-sector collaboration',
          'Technology transfer from other regions',
          'Public-private partnerships',
          'Academic research partnerships',
          'International best practices adoption'
        ],
        priorities: [
          'Address critical unresolved challenges',
          'Build solution provider network',
          'Establish innovation metrics',
          'Launch pilot programs',
          'Develop sector expertise'
        ]
      };
    }

    // Save analysis
    const { data: savedAnalysis, error } = await supabase
      .from('sector_gap_analyses')
      .insert({
        sector_id,
        challenge_count: challengeCount,
        solution_count: solutionCount,
        unresolved_count: unresolvedChallenges,
        gaps: analysis.gaps,
        opportunities: analysis.opportunities,
        priorities: analysis.priorities,
        analyzed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.warn('Could not save analysis:', error);
    }

    return new Response(JSON.stringify({ 
      success: true,
      analysis_id: savedAnalysis?.id,
      sector: sector?.name_en,
      metrics: {
        challenge_count: challengeCount,
        solution_count: solutionCount,
        unresolved_count: unresolvedChallenges,
        coverage_ratio: challengeCount > 0 ? (solutionCount / challengeCount * 100).toFixed(1) : 0
      },
      ...analysis
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in strategy-sector-gap-analysis:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
