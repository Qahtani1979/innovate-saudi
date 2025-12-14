import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, workflowData, entityType, historicalData, context } = await req.json();
    console.log(`Strategy Workflow AI - Action: ${action}`);

    const apiUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case 'optimize_workflow':
        systemPrompt = `You are an expert in workflow optimization and process improvement for government strategic planning. Analyze workflows and suggest improvements.`;
        userPrompt = `Current Workflow: ${JSON.stringify(workflowData)}
Entity Type: ${entityType}
Historical Performance: ${JSON.stringify(historicalData)}
Context: ${JSON.stringify(context)}

Analyze and optimize:
- efficiency_score: 0-100 current efficiency
- bottlenecks: Array of {stage: string, issue: string, impact: string}
- redundant_steps: Array of steps that can be eliminated
- parallel_opportunities: Steps that can run in parallel
- automation_candidates: Steps suitable for automation
- recommended_changes: Array of {change: string, benefit: string, effort: low/medium/high}
- optimized_workflow: Restructured workflow stages
- expected_improvement: Percentage improvement in cycle time
- implementation_priority: Ordered list of changes to make

Return as JSON object with these exact fields.`;
        break;

      case 'predict_bottlenecks':
        systemPrompt = `You are an expert in workflow analytics and bottleneck prediction. Predict where delays will occur based on current state and historical patterns.`;
        userPrompt = `Active Workflows: ${JSON.stringify(workflowData)}
Historical Patterns: ${JSON.stringify(historicalData)}
Current Queue: ${JSON.stringify(context?.queue)}

Predict bottlenecks:
- predicted_bottlenecks: Array of {
    stage: string,
    probability: 0-100,
    predicted_delay_days: number,
    root_cause: string,
    affected_items: number
  }
- early_warnings: Array of items at risk of delay
- capacity_issues: Stages with insufficient capacity
- sla_risks: Items at risk of SLA breach
- recommended_actions: Immediate actions to prevent delays
- resource_reallocation: Suggested resource moves
- escalation_needs: Items requiring immediate attention

Return as JSON object with these exact fields.`;
        break;

      case 'recommend_similar_workflows':
        systemPrompt = `You are an expert in workflow design and best practices. Recommend workflow templates based on entity type and requirements.`;
        userPrompt = `Entity Type: ${entityType}
Requirements: ${JSON.stringify(context?.requirements)}
Organization Context: ${JSON.stringify(context?.organization)}
Existing Workflows: ${JSON.stringify(workflowData)}

Recommend workflows:
- recommended_templates: Array of {
    template_name: string,
    description: string,
    fit_score: 0-100,
    stages: array,
    estimated_cycle_days: number,
    best_for: string
  }
- customization_suggestions: For each template, how to adapt
- hybrid_recommendation: Combining elements from multiple templates
- industry_benchmarks: What similar organizations use
- success_factors: What makes these workflows effective

Return as JSON object with these exact fields.`;
        break;

      case 'estimate_duration':
        systemPrompt = `You are an expert in project estimation and workflow timing. Estimate how long workflow stages will take based on historical data and current conditions.`;
        userPrompt = `Workflow Definition: ${JSON.stringify(workflowData)}
Historical Durations: ${JSON.stringify(historicalData)}
Current Context: ${JSON.stringify(context)}
Item Details: ${JSON.stringify(context?.item)}

Estimate durations:
- stage_estimates: Array of {
    stage: string,
    estimated_days: number,
    confidence: 0-100,
    range: {min: number, max: number},
    factors_affecting: array
  }
- total_estimated_days: Overall workflow duration
- confidence_level: Overall confidence
- critical_path: Stages that determine total duration
- acceleration_opportunities: How to speed up
- risk_factors: What could cause delays
- historical_comparison: How this compares to past items
- milestone_predictions: Key date predictions

Return as JSON object with these exact fields.`;
        break;

      case 'analyze_gate_effectiveness':
        systemPrompt = `You are an expert in quality gate analysis and workflow effectiveness. Analyze how well approval gates are working.`;
        userPrompt = `Gate Configuration: ${JSON.stringify(workflowData?.gates)}
Historical Performance: ${JSON.stringify(historicalData)}
Outcomes: ${JSON.stringify(context?.outcomes)}

Analyze gate effectiveness:
- gate_analysis: Array of {
    gate_name: string,
    pass_rate: percentage,
    average_duration_hours: number,
    rejection_reasons: array,
    effectiveness_score: 0-100
  }
- redundant_gates: Gates that rarely catch issues
- missing_checks: Gaps in quality assurance
- reviewer_performance: Aggregated reviewer metrics
- improvement_recommendations: For each gate
- consolidation_opportunities: Gates that can be combined
- ai_assistance_opportunities: Where AI can help
- benchmark_comparison: How gates compare to best practices

Return as JSON object with these exact fields.`;
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action specified' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log('Calling AI API for workflow analysis...');
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || '';
    
    console.log('AI response received, parsing...');

    let result;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || 
                      content.match(/\[[\s\S]*\]/) || 
                      content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      result = JSON.parse(jsonStr.trim());
    } else {
      result = { raw_response: content };
    }

    console.log(`Workflow AI ${action} completed successfully`);

    return new Response(
      JSON.stringify({ success: true, action, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Strategy Workflow AI Error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
