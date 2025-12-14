import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SAUDI_CONTEXT = `Saudi Arabia Ministry of Municipalities and Housing (MoMAH) Context:
- 13 Regions, 285+ municipalities, 17 major Amanats
- Vision 2030: Quality of Life, Housing, National Transformation, Smart Cities
- Committee types: Strategy Board, Innovation Committee, Budget Committee, Technical Committee
- Decision-making aligned with Saudi government protocols and Vision 2030 objectives`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, committeeData, agendaItems, decisions, meetingContext } = await req.json();
    console.log(`Strategy Committee AI - Action: ${action}`);

    const apiUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      console.error('LOVABLE_API_KEY not configured');
      throw new Error('AI service not configured');
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case 'prioritize_agenda':
        systemPrompt = `You are an expert in Saudi government executive committee management and meeting facilitation within MoMAH (Ministry of Municipalities and Housing).

${SAUDI_CONTEXT}

Prioritize agenda items based on Vision 2030 strategic importance, urgency, stakeholder impact, and dependencies. Consider Saudi business protocols and decision-making culture.`;
        userPrompt = `Agenda Items: ${JSON.stringify(agendaItems)}
Committee Type: ${committeeData?.type || 'Strategy Board'}
Meeting Duration: ${meetingContext?.duration_minutes || 120} minutes
Context: ${JSON.stringify(meetingContext)}

Prioritize the agenda:
- prioritized_items: Array of items with priority order (1 is highest)
- time_allocations: For each item, recommended minutes
- critical_items: Items that must be addressed this meeting
- deferrable_items: Items that can wait if time runs short
- pre_read_items: Items that should be reviewed beforehand
- discussion_format: For each item (presentation/discussion/vote/information)
- dependencies: Items that depend on other items
- recommended_order: Optimal sequence for discussion
- meeting_flow: Suggested meeting structure

Return as JSON object with these exact fields.`;
        break;

      case 'optimize_scheduling':
        systemPrompt = `You are an expert in calendar optimization and meeting scheduling for executive committees. Find optimal meeting times based on availability and strategic priorities.`;
        userPrompt = `Committee Members: ${JSON.stringify(committeeData?.members)}
Pending Items: ${JSON.stringify(agendaItems)}
Historical Meeting Patterns: ${JSON.stringify(meetingContext?.history)}
Constraints: ${JSON.stringify(meetingContext?.constraints)}

Optimize meeting schedule:
- recommended_frequency: weekly/biweekly/monthly
- optimal_day: Best day of week
- optimal_time: Best time slot
- optimal_duration: Recommended duration in minutes
- quorum_considerations: Minimum attendance requirements
- conflict_avoidance: Periods to avoid
- special_sessions: When to schedule additional meetings
- annual_calendar: Key dates for annual planning cycle
- buffer_recommendations: Time between meetings

Return as JSON object with these exact fields.`;
        break;

      case 'predict_decision_impact':
        systemPrompt = `You are an expert in strategic decision analysis. Predict the impact of committee decisions on organizational objectives and stakeholders.`;
        userPrompt = `Proposed Decision: ${JSON.stringify(decisions)}
Committee Context: ${JSON.stringify(committeeData)}
Strategic Plan Context: ${JSON.stringify(meetingContext?.plan_context)}

Predict decision impact:
- impact_assessment: {
    strategic_alignment: high/medium/low,
    resource_implications: description,
    timeline_effects: description,
    risk_level: low/medium/high
  }
- affected_objectives: Array of impacted strategic objectives
- stakeholder_impact: Array of {stakeholder: string, impact: positive/neutral/negative, details: string}
- implementation_complexity: simple/moderate/complex
- success_probability: 0-100 percentage
- key_success_factors: Array of factors needed for success
- potential_obstacles: Array of obstacles and mitigation strategies
- recommended_conditions: Conditions to attach to approval
- monitoring_indicators: KPIs to track decision outcomes

Return as JSON object with these exact fields.`;
        break;

      case 'generate_action_items':
        systemPrompt = `You are an expert in meeting follow-up and action item management. Generate comprehensive action items from committee decisions.`;
        userPrompt = `Decisions Made: ${JSON.stringify(decisions)}
Committee Members: ${JSON.stringify(committeeData?.members)}
Context: ${JSON.stringify(meetingContext)}

Generate action items:
- action_items: Array of {
    title: string,
    description: string,
    responsible_role: string,
    due_date_offset_days: number,
    priority: high/medium/low,
    dependencies: array,
    success_criteria: string,
    reporting_requirements: string
  }
- immediate_actions: Actions to take within 24 hours
- communication_actions: Who needs to be informed of decisions
- follow_up_agenda_items: Items for next meeting
- escalation_triggers: Conditions that require escalation
- milestone_checkpoints: Key dates for progress review

Return as JSON object with these exact fields.`;
        break;

      case 'summarize_meeting':
        systemPrompt = `You are an expert in executive communication and meeting documentation. Generate comprehensive meeting summaries for committee meetings.`;
        userPrompt = `Meeting Details: ${JSON.stringify(meetingContext)}
Decisions Made: ${JSON.stringify(decisions)}
Agenda Covered: ${JSON.stringify(agendaItems)}
Committee: ${JSON.stringify(committeeData)}

Generate meeting summary:
- executive_summary: 2-3 sentence overview
- key_decisions: Array of decisions with brief description
- action_items_summary: Grouped by responsible party
- deferred_items: Items pushed to future meetings
- risks_identified: New risks discussed
- achievements: Milestones or accomplishments noted
- next_steps: Immediate priorities
- next_meeting_preview: Anticipated topics for next meeting
- distribution_list: Who should receive this summary
- confidential_items: Items not for general distribution
- arabic_summary: Executive summary in Arabic

Return as JSON object with these exact fields.`;
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action specified' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log('Calling AI API for committee assistance...');
    
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

    console.log(`Committee AI ${action} completed successfully`);

    return new Response(
      JSON.stringify({ success: true, action, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Strategy Committee AI Error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});