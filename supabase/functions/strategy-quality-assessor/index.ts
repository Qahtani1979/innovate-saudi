import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QualityAssessmentRequest {
  entity_type: string;
  entity_data: Record<string, any>;
  queue_item: {
    id: string;
    objective_id: string;
    prefilled_spec: {
      ai_context?: {
        objective_text?: string;
        plan_vision?: string;
        kpi_targets?: string[];
      };
    };
  };
  cascade_config?: {
    quality?: {
      min_alignment_score?: number;
      min_feasibility_score?: number;
      auto_accept_threshold?: number;
      auto_reject_threshold?: number;
    };
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { entity_type, entity_data, queue_item, cascade_config }: QualityAssessmentRequest = await req.json();

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    // Quality thresholds from config
    const thresholds = cascade_config?.quality || {
      min_alignment_score: 70,
      min_feasibility_score: 60,
      auto_accept_threshold: 85,
      auto_reject_threshold: 40
    };

    // If no AI key, use rule-based assessment
    if (!lovableApiKey) {
      const scores = calculateBasicScores(entity_type, entity_data, queue_item);
      const decision = determineDecision(scores.overall, thresholds);
      
      return new Response(JSON.stringify({
        scores,
        overall_score: scores.overall,
        decision,
        feedback: {
          strengths: ['Basic validation passed'],
          improvements_needed: scores.overall < 70 ? ['Consider adding more detail'] : [],
          regeneration_hints: []
        },
        method: 'rule_based'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // AI-powered assessment
    const objectiveText = queue_item?.prefilled_spec?.ai_context?.objective_text || '';
    const planVision = queue_item?.prefilled_spec?.ai_context?.plan_vision || '';
    const kpiTargets = queue_item?.prefilled_spec?.ai_context?.kpi_targets || [];

    const prompt = `You are a quality assessor for strategic planning entities. Evaluate this ${entity_type} for quality and alignment.

STRATEGIC CONTEXT:
- Objective: ${objectiveText}
- Vision: ${planVision}
- KPI Targets: ${kpiTargets.join(', ')}

ENTITY TO ASSESS:
${JSON.stringify(entity_data, null, 2)}

Provide a quality assessment with scores (0-100) for each dimension:
1. objective_alignment - How well does this serve the strategic objective?
2. completeness - Are all important fields filled with meaningful content?
3. feasibility - Is this realistic and achievable?
4. innovation - Does this show creative/novel thinking?
5. clarity - Is the content clear and well-written?

Also provide:
- strengths: 2-3 things done well
- improvements_needed: 1-3 areas to improve
- regeneration_hints: If score < 60, what specific changes would improve it?

Return as JSON:
{
  "scores": {
    "objective_alignment": number,
    "completeness": number,
    "feasibility": number,
    "innovation": number,
    "clarity": number
  },
  "strengths": string[],
  "improvements_needed": string[],
  "regeneration_hints": string[]
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a strategic planning quality assessor. Return valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      console.warn('AI assessment failed, using rule-based:', response.status);
      const scores = calculateBasicScores(entity_type, entity_data, queue_item);
      const decision = determineDecision(scores.overall, thresholds);
      
      return new Response(JSON.stringify({
        scores,
        overall_score: scores.overall,
        decision,
        feedback: {
          strengths: ['Basic validation passed'],
          improvements_needed: [],
          regeneration_hints: []
        },
        method: 'rule_based_fallback'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || '';
    
    // Parse AI response
    let assessment;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        assessment = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON in response');
      }
    } catch (parseError) {
      console.warn('Failed to parse AI response:', parseError);
      const scores = calculateBasicScores(entity_type, entity_data, queue_item);
      assessment = {
        scores,
        strengths: ['Generated successfully'],
        improvements_needed: [],
        regeneration_hints: []
      };
    }

    // Calculate overall score
    const scores = assessment.scores || {};
    const overall = Math.round(
      (scores.objective_alignment || 70) * 0.3 +
      (scores.completeness || 70) * 0.25 +
      (scores.feasibility || 70) * 0.2 +
      (scores.innovation || 70) * 0.15 +
      (scores.clarity || 70) * 0.1
    );

    const decision = determineDecision(overall, thresholds);

    return new Response(JSON.stringify({
      scores: assessment.scores,
      overall_score: overall,
      decision,
      feedback: {
        strengths: assessment.strengths || [],
        improvements_needed: assessment.improvements_needed || [],
        regeneration_hints: assessment.regeneration_hints || []
      },
      method: 'ai_powered'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Quality assessment error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      overall_score: 50,
      decision: 'needs_review'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function calculateBasicScores(entityType: string, entityData: any, queueItem: any): any {
  // Simple rule-based scoring
  let completeness = 0;
  const requiredFields = getRequiredFields(entityType);
  const filledCount = requiredFields.filter(f => entityData[f] && String(entityData[f]).length > 5).length;
  completeness = Math.round((filledCount / requiredFields.length) * 100);

  // Check title/description quality
  const title = entityData.title_en || entityData.name_en || '';
  const desc = entityData.description_en || '';
  const clarity = Math.min(100, Math.round((title.length > 10 ? 50 : 0) + (desc.length > 50 ? 50 : desc.length)));

  // Objective alignment - check if objective keywords appear
  const objectiveText = queueItem?.prefilled_spec?.ai_context?.objective_text?.toLowerCase() || '';
  const contentText = `${title} ${desc}`.toLowerCase();
  const objectiveWords = objectiveText.split(/\s+/).filter((w: string) => w.length > 4);
  const matchCount = objectiveWords.filter((w: string) => contentText.includes(w)).length;
  const alignment = objectiveWords.length > 0 ? Math.round((matchCount / objectiveWords.length) * 100) : 70;

  const overall = Math.round(completeness * 0.4 + clarity * 0.3 + alignment * 0.3);

  return {
    objective_alignment: alignment,
    completeness,
    feasibility: 70, // Default
    innovation: 60, // Default
    clarity,
    overall
  };
}

function getRequiredFields(entityType: string): string[] {
  switch (entityType) {
    case 'challenge':
      return ['title_en', 'description_en', 'problem_statement_en'];
    case 'pilot':
      return ['name_en', 'description_en', 'duration_months'];
    case 'program':
      return ['name_en', 'description_en', 'program_type'];
    case 'campaign':
      return ['title_en', 'description_en', 'campaign_type'];
    case 'event':
      return ['title_en', 'description_en', 'event_type'];
    case 'policy':
      return ['title_en', 'description_en', 'policy_type'];
    case 'rd_call':
      return ['title_en', 'description_en', 'call_type'];
    case 'partnership':
      return ['title_en', 'description_en', 'partnership_type'];
    case 'living_lab':
      return ['name_en', 'description_en', 'lab_type'];
    default:
      return ['title_en', 'description_en'];
  }
}

function determineDecision(overallScore: number, thresholds: any): string {
  if (overallScore >= (thresholds.auto_accept_threshold || 85)) {
    return 'auto_accept';
  } else if (overallScore < (thresholds.auto_reject_threshold || 40)) {
    return 'reject';
  } else if (overallScore < 60) {
    return 'regenerate';
  } else {
    return 'needs_review';
  }
}
