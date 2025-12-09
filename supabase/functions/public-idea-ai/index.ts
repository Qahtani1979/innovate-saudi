import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple hash function for cache keys
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// Normalize text for cache comparison (lowercase, trim, remove extra spaces)
function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Initialize Supabase client with service role for DB operations
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { idea, municipality, session_id, user_id, user_type = 'anonymous' } = await req.json();

    if (!idea || idea.trim().length < 20) {
      return new Response(
        JSON.stringify({ error: 'Idea description must be at least 20 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate session ID if not provided (client should send one)
    const effectiveSessionId = session_id || `anon_${hashString(req.headers.get('x-forwarded-for') || 'unknown')}`;
    
    // Check rate limit using database function
    console.log(`Checking rate limit for session: ${effectiveSessionId}, user_type: ${user_type}`);
    
    const { data: rateLimitData, error: rateLimitError } = await supabase
      .rpc('check_ai_rate_limit', {
        p_session_id: effectiveSessionId,
        p_user_id: user_id || null,
        p_user_type: user_type,
        p_endpoint: 'public-idea-ai'
      });

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError);
      // Continue anyway if rate limit check fails (graceful degradation)
    } else if (rateLimitData && !rateLimitData.allowed) {
      console.log(`Rate limit exceeded for session: ${effectiveSessionId}`, rateLimitData);
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again later.',
          rate_limit: rateLimitData
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check cache for similar ideas
    const normalizedIdea = normalizeText(idea);
    const cacheKey = hashString(normalizedIdea + (municipality || ''));
    
    console.log(`Checking cache for key: ${cacheKey}`);
    
    const { data: cachedResult, error: cacheError } = await supabase
      .from('ai_analysis_cache')
      .select('result, id, hit_count')
      .eq('input_hash', cacheKey)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (cachedResult && !cacheError) {
      console.log(`Cache hit for key: ${cacheKey}, hit_count: ${cachedResult.hit_count}`);
      
      // Update hit count
      await supabase
        .from('ai_analysis_cache')
        .update({ hit_count: cachedResult.hit_count + 1 })
        .eq('id', cachedResult.id);

      // Still record usage for rate limiting purposes
      await supabase
        .from('ai_usage_tracking')
        .insert({
          session_id: effectiveSessionId,
          user_id: user_id || null,
          endpoint: 'public-idea-ai',
          tokens_used: 0 // No tokens used for cached response
        });

      return new Response(
        JSON.stringify({ 
          ...cachedResult.result, 
          _cached: true,
          _rate_limit: rateLimitData 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // No cache hit, call AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const prompt = `You are a municipal innovation analyst helping citizens submit ideas for city improvement.

Analyze this citizen's idea and generate a structured submission:

CITIZEN'S IDEA:
${idea}

${municipality ? `MUNICIPALITY: ${municipality}` : ''}

Generate the following in BOTH English and Arabic:

1. title_en: A clear, concise title for the idea (max 100 characters)
2. title_ar: Arabic translation of the title
3. description_en: A well-structured description (150-250 words) that:
   - Clearly explains what the idea is
   - Describes the problem it solves
   - Explains the expected benefits
   - Keeps the language professional but accessible
4. description_ar: Arabic translation of the description
5. category: Best matching category from: transport, infrastructure, environment, digital_services, parks, waste, safety, health, education, other
6. tags_en: 5-8 relevant keywords/tags in English for searchability
7. tags_ar: 5-8 relevant keywords/tags in Arabic for searchability
8. impact_score: Estimated impact score (0-100) based on potential benefit to citizens
9. feasibility_score: Estimated feasibility score (0-100) based on implementation complexity
10. ai_summary_en: A brief 1-2 sentence summary of the AI's assessment in English
11. ai_summary_ar: A brief 1-2 sentence summary of the AI's assessment in Arabic

Be encouraging and constructive. Focus on the positive potential while being realistic about feasibility.`;

    console.log('Calling AI gateway...');
    
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
            content: 'You are a helpful municipal innovation analyst. Always respond with valid JSON only, no markdown or code blocks.' 
          },
          { role: 'user', content: prompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_idea",
              description: "Analyze and structure a citizen's idea submission",
              parameters: {
                type: "object",
                properties: {
                  title_en: { type: "string", description: "English title for the idea" },
                  title_ar: { type: "string", description: "Arabic title for the idea" },
                  description_en: { type: "string", description: "English description of the idea" },
                  description_ar: { type: "string", description: "Arabic description of the idea" },
                  category: { 
                    type: "string", 
                    enum: ["transport", "infrastructure", "environment", "digital_services", "parks", "waste", "safety", "health", "education", "other"]
                  },
                  tags_en: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "Relevant keywords/tags in English"
                  },
                  tags_ar: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "Relevant keywords/tags in Arabic"
                  },
                  impact_score: { type: "number", description: "Impact score 0-100" },
                  feasibility_score: { type: "number", description: "Feasibility score 0-100" },
                  ai_summary_en: { type: "string", description: "Brief AI assessment summary in English" },
                  ai_summary_ar: { type: "string", description: "Brief AI assessment summary in Arabic" }
                },
                required: ["title_en", "title_ar", "description_en", "description_ar", "category", "tags_en", "tags_ar", "impact_score", "feasibility_score", "ai_summary_en", "ai_summary_ar"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_idea" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'AI service rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service temporarily unavailable.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResult = await response.json();
    
    // Extract the tool call result
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'analyze_idea') {
      throw new Error('Invalid AI response format');
    }

    const result = JSON.parse(toolCall.function.arguments);

    // Record AI usage
    const tokensUsed = aiResult.usage?.total_tokens || 0;
    console.log(`AI call successful, tokens used: ${tokensUsed}`);
    
    await supabase
      .from('ai_usage_tracking')
      .insert({
        session_id: effectiveSessionId,
        user_id: user_id || null,
        endpoint: 'public-idea-ai',
        tokens_used: tokensUsed
      });

    // Cache the result
    const { error: cacheInsertError } = await supabase
      .from('ai_analysis_cache')
      .upsert({
        input_hash: cacheKey,
        input_text: idea.substring(0, 500), // Store first 500 chars for reference
        endpoint: 'public-idea-ai',
        result: result,
        hit_count: 1,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      }, {
        onConflict: 'input_hash'
      });

    if (cacheInsertError) {
      console.error('Cache insert error:', cacheInsertError);
      // Continue anyway, caching failure shouldn't block response
    } else {
      console.log(`Cached result for key: ${cacheKey}`);
    }

    return new Response(
      JSON.stringify({ 
        ...result, 
        _cached: false,
        _rate_limit: rateLimitData 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in public-idea-ai function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
