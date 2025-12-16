import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { COMPACT_SAUDI_CONTEXT } from "../_shared/saudiContext.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    let prompt = '';
    let result = {};

    const saudiContextNote = `\n\nIMPORTANT CONTEXT:\n${COMPACT_SAUDI_CONTEXT}\n\nEnsure all content is relevant to Saudi Arabia's Ministry of Municipalities and Housing (MoMAH) and Vision 2030 alignment.`;

    switch (action) {
      case 'generate_impact_story':
        prompt = `Generate a compelling impact story for a municipal innovation entity.

Entity Details:
${JSON.stringify(data, null, 2)}

Generate a structured story with:
1. title_en: Compelling English title (max 80 chars)
2. title_ar: Arabic translation of the title
3. summary_en: 2-3 sentence summary highlighting the key impact (English)
4. summary_ar: Arabic translation of summary
5. full_story_en: Full narrative (300-500 words) covering:
   - The challenge/problem addressed
   - The innovative solution implemented
   - Key stakeholders involved
   - Measurable outcomes and impact
   - Lessons learned
6. full_story_ar: Arabic translation of full story
7. key_metrics: Array of 3-5 metrics with { label, value, improvement }
8. before_situation: Brief description of the situation before
9. after_situation: Brief description of the improved situation
10. lessons_learned: Array of 3-5 key lessons
11. suggested_tags: Array of relevant tags
${saudiContextNote}

Return valid JSON only.`;
        break;

      case 'generate_key_messages':
        prompt = `Generate key communication messages for a strategic plan.

Strategy Context:
${JSON.stringify(data.strategy, null, 2)}

Target Audience: ${data.audience || 'General Public'}

Generate:
1. master_narrative_en: The overarching narrative (1-2 sentences) in English
2. master_narrative_ar: Arabic translation
3. key_themes: Array of 3-5 themes, each with:
   - theme_en, theme_ar: Theme name
   - description_en, description_ar: Brief description
   - supporting_points: Array of 2-3 proof points
4. audience_specific_messages: Object with messages tailored for different audiences:
   - citizens: { headline_en, headline_ar, call_to_action_en, call_to_action_ar }
   - partners: { headline_en, headline_ar, call_to_action_en, call_to_action_ar }
   - leadership: { headline_en, headline_ar, call_to_action_en, call_to_action_ar }
   - media: { headline_en, headline_ar, call_to_action_en, call_to_action_ar }
${saudiContextNote}

Return valid JSON only.`;
        break;

      case 'suggest_channel_strategy':
        prompt = `Suggest an optimal channel strategy for communication.

Target Audiences:
${JSON.stringify(data.audiences, null, 2)}

Communication Objectives:
${JSON.stringify(data.objectives, null, 2)}

Generate a channel strategy with:
1. recommended_channels: Array of channels, each with:
   - channel: Channel name (e.g., "Social Media - Twitter", "Email Newsletter", "Public Portal", "Press Release", "Town Hall")
   - priority: "primary" | "secondary" | "supporting"
   - target_audiences: Array of audience segments this channel serves
   - content_types: Array of suitable content types
   - frequency: Recommended posting frequency
   - best_practices: Array of 2-3 tips for this channel
   - expected_reach: Estimated reach percentage
2. channel_mix_rationale: Explanation of the strategy
3. content_themes_per_channel: Object mapping channels to content themes
4. timing_recommendations: Best times/days for each channel
${saudiContextNote}

Return valid JSON only.`;
        break;

      case 'generate_content_calendar':
        prompt = `Generate a content calendar for strategy communication.

Communication Plan:
${JSON.stringify(data.plan, null, 2)}

Duration: ${data.duration || '3 months'}

Generate a content calendar with:
1. calendar_items: Array of content items, each with:
   - week: Week number
   - date: Suggested date (YYYY-MM-DD)
   - theme: Content theme
   - content_type: Type of content (blog, social, video, infographic, etc.)
   - title_en, title_ar: Content title
   - description: Brief description of the content
   - channel: Primary distribution channel
   - target_audience: Primary audience
   - owner: Suggested owner role
   - status: "planned"
   - priority: "high" | "medium" | "low"
2. monthly_themes: Array of monthly focus themes
3. key_dates: Important dates to align content with
4. resource_requirements: Estimated resources needed
${saudiContextNote}

Return valid JSON only.`;
        break;

      case 'analyze_engagement':
        prompt = `Analyze communication engagement data and provide insights.

Analytics Data:
${JSON.stringify(data, null, 2)}

Provide analysis with:
1. overall_performance: Score 0-100 with explanation
2. channel_performance: Array of channel analyses with:
   - channel: Channel name
   - performance_score: 0-100
   - strengths: Array of strengths
   - improvements: Array of improvement areas
3. audience_engagement: Insights on audience engagement patterns
4. content_performance: Which content types perform best
5. recommendations: Array of 5-7 actionable recommendations
6. trends: Key trends observed
7. benchmarks: How performance compares to typical benchmarks
${saudiContextNote}

Return valid JSON only.`;
        break;

      case 'translate_content':
        const targetLang = data.targetLanguage === 'ar' ? 'Arabic' : 'English';
        prompt = `Translate the following content to ${targetLang}. Maintain the same structure and formatting.

Content to translate:
${JSON.stringify(data.content, null, 2)}
${saudiContextNote}

Return the translated content in valid JSON format, maintaining the same structure.`;
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    console.log(`Strategy Communication AI - Action: ${action}`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: `You are an expert in strategic communications for Saudi government entities, particularly the Ministry of Municipalities and Housing (MoMAH). ${COMPACT_SAUDI_CONTEXT}` 
          },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      throw new Error(`AI API request failed: ${errorText}`);
    }

    const aiResponse = await response.json();
    const generatedText = aiResponse.choices?.[0]?.message?.content;

    if (!generatedText) {
      throw new Error('No response generated from AI');
    }

    // Parse the JSON from the response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      result = JSON.parse(jsonMatch[0]);
    } else {
      result = { raw_response: generatedText };
    }

    console.log(`Strategy Communication AI - ${action} completed successfully`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('Error in strategy-communication-ai:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
