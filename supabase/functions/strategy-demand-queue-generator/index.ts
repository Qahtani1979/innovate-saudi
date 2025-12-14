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

    // Priority calculation weights
    const priorityWeights = {
      challenges: 100,  // Highest priority - foundation of cascade
      pilots: 80,
      campaigns: 60,
      events: 40
    };

    // Generate queue items for each gap type
    for (const [entityType, gapCount] of Object.entries(gaps)) {
      if (typeof gapCount !== 'number' || gapCount <= 0) continue;
      
      const baseWeight = priorityWeights[entityType as keyof typeof priorityWeights] || 50;
      
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
          entity_type: entityType.replace(/s$/, ''), // Remove plural
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
      items_created: queueItems.length
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

function getGeneratorComponent(entityType: string): string {
  const mapping: Record<string, string> = {
    challenges: 'StrategyChallengeGenerator',
    challenge: 'StrategyChallengeGenerator',
    pilots: 'StrategyToPilotGenerator',
    pilot: 'StrategyToPilotGenerator',
    campaigns: 'StrategyToCampaignGenerator',
    campaign: 'StrategyToCampaignGenerator',
    events: 'StrategyToEventGenerator',
    event: 'StrategyToEventGenerator',
    policies: 'StrategyToPolicyGenerator',
    policy: 'StrategyToPolicyGenerator'
  };
  return mapping[entityType] || 'StrategyChallengeGenerator';
}

function buildPrefilledSpec(entityType: string, objective: any, plan: any): any {
  const baseSpec = {
    ai_context: {
      objective_id: objective.id,
      objective_text: objective.title_en || objective.title || '',
      objective_description: objective.description_en || objective.description || '',
      plan_vision: plan.vision_en || '',
      plan_name: plan.name_en || '',
      kpi_targets: objective.kpis?.map((k: any) => k.name || k.title) || []
    }
  };

  switch (entityType) {
    case 'challenges':
    case 'challenge':
      return {
        ...baseSpec,
        title_en: `Challenge for ${objective.title_en || 'Strategic Objective'}`,
        title_ar: `تحدي لـ ${objective.title_ar || 'الهدف الاستراتيجي'}`,
        description_en: `Innovation challenge aligned with: ${objective.description_en || objective.title_en || ''}`,
        priority: 'medium',
        category: 'innovation'
      };

    case 'pilots':
    case 'pilot':
      return {
        ...baseSpec,
        name_en: `Pilot Project for ${objective.title_en || 'Strategic Objective'}`,
        name_ar: `مشروع تجريبي لـ ${objective.title_ar || 'الهدف الاستراتيجي'}`,
        description_en: `Pilot to test solutions for: ${objective.description_en || ''}`,
        duration_months: 3,
        target_participants: 100
      };

    case 'campaigns':
    case 'campaign':
      return {
        ...baseSpec,
        title_en: `Campaign for ${objective.title_en || 'Strategic Initiative'}`,
        title_ar: `حملة لـ ${objective.title_ar || 'المبادرة الاستراتيجية'}`,
        description_en: `Communication campaign supporting: ${objective.title_en || ''}`,
        campaign_type: 'awareness',
        target_audience: ['citizens', 'stakeholders']
      };

    case 'events':
    case 'event':
      return {
        ...baseSpec,
        title_en: `Event for ${objective.title_en || 'Strategic Goal'}`,
        title_ar: `فعالية لـ ${objective.title_ar || 'الهدف الاستراتيجي'}`,
        description_en: `Event supporting strategic objective: ${objective.title_en || ''}`,
        event_type: 'workshop',
        format: 'hybrid',
        expected_attendees: 50
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
