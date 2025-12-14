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
    const { action, versionData, changes, planContext } = await req.json();
    console.log(`Strategy Version AI - Action: ${action}`);

    const apiUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      console.error('LOVABLE_API_KEY not configured');
      throw new Error('AI service not configured');
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case 'analyze_impact':
        systemPrompt = `You are an expert in strategic planning and change management. Analyze the impact of proposed changes to strategic documents.`;
        userPrompt = `Proposed Changes: ${JSON.stringify(changes)}
Plan Context: ${JSON.stringify(planContext)}

Analyze the impact of these changes:
- impact_level: low/medium/high/critical
- impact_score: 0-100
- affected_areas: Array of areas impacted (objectives, KPIs, budget, timeline, resources, stakeholders)
- downstream_effects: Array of cascading effects
- risk_assessment: {level: string, factors: array}
- mitigation_recommendations: Array of recommendations
- stakeholders_to_notify: Array of roles that need to be informed
- re_approval_required: boolean with explanation

Return as JSON object with these exact fields.`;
        break;

      case 'categorize_change':
        systemPrompt = `You are an expert in semantic versioning and change management for strategic documents. Categorize changes according to their significance.`;
        userPrompt = `Changes Made: ${JSON.stringify(changes)}
Previous Version: ${versionData?.previous_version || 'N/A'}
Current Context: ${JSON.stringify(planContext)}

Categorize this change:
- version_increment: major/minor/patch
- change_type: breaking/feature/fix/documentation
- urgency: immediate/standard/low
- suggested_version: Semantic version string (e.g., "2.1.0")
- suggested_label: Human-readable version label (e.g., "Q2 2024 Strategic Update")
- change_summary: Concise summary of all changes
- detailed_changelog: Array of individual changes with descriptions
- requires_signoff: boolean
- signoff_level: full/partial/owner_only

Return as JSON object with these exact fields.`;
        break;

      case 'compare_versions':
        systemPrompt = `You are an expert in document comparison and strategic analysis. Compare two versions of a strategic document and summarize differences.`;
        userPrompt = `Version A: ${JSON.stringify(versionData?.version_a)}
Version B: ${JSON.stringify(versionData?.version_b)}
Context: ${JSON.stringify(planContext)}

Compare these versions and provide:
- summary: Executive summary of key differences
- major_changes: Array of significant changes
- minor_changes: Array of small adjustments
- additions: Array of new elements added
- removals: Array of elements removed
- modifications: Array of modified elements with before/after
- strategic_alignment_change: improved/unchanged/degraded
- risk_delta: Risk level change between versions
- recommendation: Keep current/Rollback/Review further

Return as JSON object with these exact fields.`;
        break;

      case 'predict_rollback_impact':
        systemPrompt = `You are an expert in change management and rollback analysis. Predict the impact of rolling back to a previous version.`;
        userPrompt = `Current Version: ${JSON.stringify(versionData?.current)}
Target Rollback Version: ${JSON.stringify(versionData?.target)}
Plan Context: ${JSON.stringify(planContext)}

Predict rollback impact:
- rollback_risk: low/medium/high/critical
- data_loss_risk: Array of data that might be lost
- dependency_breaks: Array of dependencies that would break
- affected_workflows: Array of active workflows impacted
- active_approvals_impacted: Number of in-progress approvals affected
- stakeholder_notification_needed: Array of stakeholders to notify
- recommended_action: proceed/caution/abort
- alternative_suggestions: Array of alternative approaches
- rollback_checklist: Array of steps to safely rollback

Return as JSON object with these exact fields.`;
        break;

      case 'find_related_documents':
        systemPrompt = `You are an expert in strategic document management. Identify related documents that should be updated when changes are made.`;
        userPrompt = `Changed Document: ${JSON.stringify(planContext)}
Changes Made: ${JSON.stringify(changes)}

Identify related documents:
- directly_related: Array of documents that must be updated
- potentially_related: Array of documents that might need review
- cross_references: Array of documents that reference this one
- update_priority: For each document, priority level
- suggested_updates: For each document, what changes might be needed
- coordination_needed: Array of teams/roles to coordinate with

Return as JSON object with these exact fields.`;
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action specified' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log('Calling AI API for version analysis...');
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${lovableApiKey}`
      },
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

    console.log(`Version AI ${action} completed successfully`);

    return new Response(
      JSON.stringify({ success: true, action, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Strategy Version AI Error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
