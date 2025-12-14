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
    const { action, planData, stakeholderData, documentType, context } = await req.json();
    console.log(`Strategy Signoff AI - Action: ${action}`);

    const apiUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case 'suggest_stakeholders':
        systemPrompt = `You are an expert in government strategic planning and stakeholder management. Based on document type and content, suggest appropriate stakeholders for sign-off with their roles, authority levels, and SLA recommendations.`;
        userPrompt = `Document Type: ${documentType}
Plan Context: ${JSON.stringify(planData)}

Suggest 4-6 stakeholders who should sign off on this document. For each provide:
- name: Suggested role/position name
- role: Formal title (Minister, Deputy Minister, Director General, etc.)
- authority_level: high/medium/low
- sla_days: Recommended SLA in days (7-30)
- rationale: Why this stakeholder should sign off
- priority: 1-6 (1 is highest priority)

Return as JSON array with these exact fields.`;
        break;

      case 'predict_approval_risk':
        systemPrompt = `You are an expert in analyzing government approval processes. Predict the likelihood of approval based on stakeholder history, document quality, and context.`;
        userPrompt = `Stakeholder: ${JSON.stringify(stakeholderData)}
Document Context: ${JSON.stringify(planData)}
Historical Context: ${JSON.stringify(context)}

Analyze and predict:
- approval_probability: 0-100 percentage
- risk_level: low/medium/high
- key_concerns: Array of potential objections
- recommendations: Array of actions to improve approval chances
- optimal_timing: Best time to send for approval (day of week, time of month)
- similar_approvals: Brief description of similar past approvals

Return as JSON object with these exact fields.`;
        break;

      case 'optimize_reminders':
        systemPrompt = `You are an expert in stakeholder communication and engagement. Optimize reminder strategies based on stakeholder behavior patterns.`;
        userPrompt = `Pending Signoffs: ${JSON.stringify(stakeholderData)}
Context: ${JSON.stringify(context)}

For each pending signoff, recommend:
- stakeholder_id: ID reference
- reminder_urgency: low/medium/high/critical
- suggested_approach: email/call/meeting/escalate
- message_tone: formal/friendly/urgent
- best_send_time: Optimal time to send reminder
- escalation_needed: boolean
- personalized_message: A brief personalized reminder message

Return as JSON array with these exact fields.`;
        break;

      case 'analyze_sentiment':
        systemPrompt = `You are an expert in communication analysis. Analyze stakeholder feedback and comments to understand sentiment and concerns.`;
        userPrompt = `Stakeholder Feedback History: ${JSON.stringify(stakeholderData)}
Document Type: ${documentType}

Analyze:
- overall_sentiment: positive/neutral/negative
- sentiment_score: -100 to 100
- key_themes: Array of recurring themes in feedback
- concerns: Array of specific concerns raised
- preferences: Array of stakeholder preferences identified
- relationship_health: excellent/good/fair/poor
- engagement_recommendations: Array of ways to improve engagement

Return as JSON object with these exact fields.`;
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action specified' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log('Calling AI API for signoff assistance...');
    
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

    // Extract JSON from response
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

    console.log(`Signoff AI ${action} completed successfully`);

    return new Response(
      JSON.stringify({ success: true, action, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Strategy Signoff AI Error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
