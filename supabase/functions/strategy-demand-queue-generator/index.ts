import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Strategy Demand Queue Generator
 * 
 * Generates queue items for ALL 9 entity types based on gap analysis:
 * - challenges
 * - pilots
 * - programs
 * - campaigns
 * - events
 * - policies
 * - rd_calls
 * - partnerships
 * - living_labs
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { strategic_plan_id, gap_analysis, max_items = 20 } = await req.json();

    if (!strategic_plan_id) {
      throw new Error('strategic_plan_id is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch strategic plan
    const { data: plan, error: planError } = await supabase
      .from('strategic_plans')
      .select('*')
      .eq('id', strategic_plan_id)
      .single();

    if (planError) throw planError;

    const objectives = plan.objectives || [];
    const gaps = gap_analysis?.gaps?.quantity_gaps || {};
    const cascadeConfig = plan.cascade_config || {};

    // Build queue items based on gaps
    const queueItems: any[] = [];
    let itemsCreated = 0;

    // Priority calculation weights for ALL 9 entity types
    const priorityWeights: Record<string, number> = {
      challenges: 100,  // Highest priority - foundation of cascade
      pilots: 80,       // High priority - test solutions
      programs: 75,     // High priority - major initiatives
      campaigns: 60,    // Medium priority - communication
      events: 55,       // Medium priority - engagement
      policies: 50,     // Medium priority - governance
      rd_calls: 45,     // Medium priority - research
      partnerships: 40, // Lower priority - external collaboration
      living_labs: 35   // Lower priority - experimental spaces
    };

    // Generate queue items for each gap type
    for (const [entityType, gapCount] of Object.entries(gaps)) {
      if (typeof gapCount !== 'number' || gapCount <= 0) continue;
      
      const baseWeight = priorityWeights[entityType] || 50;
      
      // Distribute across objectives
      for (let i = 0; i < Math.min(gapCount, max_items - itemsCreated); i++) {
        const objectiveIndex = i % Math.max(objectives.length, 1);
        const objective = objectives[objectiveIndex] || {};
        
        // Calculate priority score
        const objectiveWeight = objective.weight || 1;
        const coverageGap = (gaps[entityType] || 0) / 10; // Normalize
        const priorityScore = Math.min(100, Math.round(
          baseWeight * 0.4 + 
          objectiveWeight * 20 * 0.3 + 
          coverageGap * 0.3
        ));

        // Build prefilled spec based on entity type
        const prefilled_spec = buildPrefilledSpec(entityType, objective, plan);

        const queueItem = {
          strategic_plan_id,
          objective_id: objective.id || `obj-${objectiveIndex}`,
          entity_type: entityType.replace(/s$/, ''), // Remove plural (challenges -> challenge)
          generator_component: getGeneratorComponent(entityType),
          priority_score: priorityScore,
          priority_factors: {
            objective_weight: objectiveWeight,
            coverage_gap: gapCount,
            base_weight: baseWeight,
            entity_importance: baseWeight / 100
          },
          prefilled_spec,
          status: 'pending'
        };

        queueItems.push(queueItem);
        itemsCreated++;

        if (itemsCreated >= max_items) break;
      }

      if (itemsCreated >= max_items) break;
    }

    // If we have AI available, enhance the prefilled specs
    if (lovableApiKey && queueItems.length > 0) {
      try {
        const enhancedItems = await enhanceWithAI(queueItems, plan, lovableApiKey);
        queueItems.splice(0, queueItems.length, ...enhancedItems);
      } catch (aiError) {
        console.warn('AI enhancement failed, using basic specs:', aiError);
      }
    }

    // Insert queue items
    if (queueItems.length > 0) {
      const { error: insertError } = await supabase
        .from('demand_queue')
        .insert(queueItems);

      if (insertError) throw insertError;
    }

    console.log('Demand queue generated:', {
      plan_id: strategic_plan_id,
      items_created: queueItems.length,
      by_type: queueItems.reduce((acc, item) => {
        acc[item.entity_type] = (acc[item.entity_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    });

    return new Response(JSON.stringify({
      success: true,
      strategic_plan_id,
      items_created: queueItems.length,
      by_type: queueItems.reduce((acc, item) => {
        acc[item.entity_type] = (acc[item.entity_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Demand queue generation error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Map entity types to their generator UI components - ALL 9 TYPES
function getGeneratorComponent(entityType: string): string {
  const mapping: Record<string, string> = {
    challenges: 'StrategyChallengeGenerator',
    challenge: 'StrategyChallengeGenerator',
    pilots: 'StrategyToPilotGenerator',
    pilot: 'StrategyToPilotGenerator',
    programs: 'StrategyToProgramGenerator',
    program: 'StrategyToProgramGenerator',
    campaigns: 'StrategyToCampaignGenerator',
    campaign: 'StrategyToCampaignGenerator',
    events: 'StrategyToEventGenerator',
    event: 'StrategyToEventGenerator',
    policies: 'StrategyToPolicyGenerator',
    policy: 'StrategyToPolicyGenerator',
    rd_calls: 'StrategyToRDCallGenerator',
    rd_call: 'StrategyToRDCallGenerator',
    partnerships: 'StrategyToPartnershipGenerator',
    partnership: 'StrategyToPartnershipGenerator',
    living_labs: 'StrategyToLivingLabGenerator',
    living_lab: 'StrategyToLivingLabGenerator'
  };
  return mapping[entityType] || 'StrategyChallengeGenerator';
}

// Build prefilled spec based on entity type - ALL 9 TYPES
function buildPrefilledSpec(entityType: string, objective: any, plan: any): any {
  const baseSpec = {
    ai_context: {
      objective_id: objective.id,
      objective_text: objective.title_en || objective.title || objective.name_en || '',
      objective_description: objective.description_en || objective.description || '',
      plan_vision: plan.vision_en || '',
      plan_name: plan.name_en || '',
      kpi_targets: objective.kpis?.map((k: any) => k.name || k.title) || []
    }
  };

  const objTitle = objective.title_en || objective.title || objective.name_en || 'Strategic Objective';
  const objTitleAr = objective.title_ar || objective.name_ar || 'الهدف الاستراتيجي';
  const objDesc = objective.description_en || objective.description || '';

  switch (entityType) {
    case 'challenges':
    case 'challenge':
      return {
        ...baseSpec,
        title_en: `Challenge for ${objTitle}`,
        title_ar: `تحدي لـ ${objTitleAr}`,
        description_en: `Innovation challenge aligned with: ${objDesc}`,
        priority: 'medium',
        category: 'innovation'
      };

    case 'pilots':
    case 'pilot':
      return {
        ...baseSpec,
        name_en: `Pilot Project for ${objTitle}`,
        name_ar: `مشروع تجريبي لـ ${objTitleAr}`,
        description_en: `Pilot to test solutions for: ${objDesc}`,
        duration_months: 3,
        target_participants: 100
      };

    case 'programs':
    case 'program':
      return {
        ...baseSpec,
        name_en: `Program for ${objTitle}`,
        name_ar: `برنامج لـ ${objTitleAr}`,
        description_en: `Strategic program supporting: ${objDesc}`,
        program_type: 'innovation',
        duration_years: 2
      };

    case 'campaigns':
    case 'campaign':
      return {
        ...baseSpec,
        title_en: `Campaign for ${objTitle}`,
        title_ar: `حملة لـ ${objTitleAr}`,
        description_en: `Communication campaign supporting: ${objTitle}`,
        campaign_type: 'awareness',
        target_audience: ['citizens', 'stakeholders']
      };

    case 'events':
    case 'event':
      return {
        ...baseSpec,
        title_en: `Event for ${objTitle}`,
        title_ar: `فعالية لـ ${objTitleAr}`,
        description_en: `Event supporting strategic objective: ${objTitle}`,
        event_type: 'workshop',
        format: 'hybrid',
        expected_attendees: 50
      };

    case 'policies':
    case 'policy':
      return {
        ...baseSpec,
        title_en: `Policy for ${objTitle}`,
        title_ar: `سياسة لـ ${objTitleAr}`,
        description_en: `Governance policy supporting: ${objDesc}`,
        policy_type: 'operational',
        scope: 'organization'
      };

    case 'rd_calls':
    case 'rd_call':
      return {
        ...baseSpec,
        title_en: `R&D Call for ${objTitle}`,
        title_ar: `دعوة بحث وتطوير لـ ${objTitleAr}`,
        description_en: `Research and development call supporting: ${objDesc}`,
        call_type: 'open',
        funding_amount: 500000
      };

    case 'partnerships':
    case 'partnership':
      return {
        ...baseSpec,
        title_en: `Partnership for ${objTitle}`,
        title_ar: `شراكة لـ ${objTitleAr}`,
        description_en: `Strategic partnership supporting: ${objDesc}`,
        partnership_type: 'strategic',
        partner_types: ['private_sector', 'academia']
      };

    case 'living_labs':
    case 'living_lab':
      return {
        ...baseSpec,
        name_en: `Living Lab for ${objTitle}`,
        name_ar: `مختبر حي لـ ${objTitleAr}`,
        description_en: `Co-creation and testing space for: ${objDesc}`,
        lab_type: 'urban',
        focus_areas: ['innovation', 'sustainability']
      };

    default:
      return baseSpec;
  }
}

async function enhanceWithAI(queueItems: any[], plan: any, apiKey: string): Promise<any[]> {
  const prompt = `You are a strategic planning AI. Enhance these queue items with better titles and descriptions.
  
Strategic Plan: ${plan.name_en}
Vision: ${plan.vision_en}

Queue Items to enhance:
${JSON.stringify(queueItems.slice(0, 5), null, 2)}

For each item, provide enhanced:
- title_en (compelling, action-oriented)
- title_ar (Arabic translation)
- description_en (2-3 sentences, specific to the objective)

Return as JSON array matching the input structure with enhanced prefilled_spec.`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a strategic planning assistant. Return valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      console.warn('AI enhancement request failed:', response.status);
      return queueItems;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Try to parse JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const enhanced = JSON.parse(jsonMatch[0]);
      // Merge enhanced specs back
      return queueItems.map((item, idx) => {
        if (enhanced[idx]?.prefilled_spec) {
          return {
            ...item,
            prefilled_spec: { ...item.prefilled_spec, ...enhanced[idx].prefilled_spec }
          };
        }
        return item;
      });
    }
  } catch (e) {
    console.warn('AI enhancement parsing failed:', e);
  }

  return queueItems;
}
