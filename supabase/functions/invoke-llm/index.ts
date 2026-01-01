import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SAUDI_MOMAH_CONTEXT, COMPACT_SAUDI_CONTEXT, INNOVATION_EMPHASIS } from "../_shared/saudiContext.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fetch platform data for context injection
async function fetchPlatformContext(supabase: any): Promise<string> {
  try {
    // Fetch sectors with subsectors count
    const { data: sectors } = await supabase
      .from('sectors')
      .select('id, name_en, name_ar')
      .limit(20);
    
    // Fetch subsectors grouped by sector
    const { data: subsectors } = await supabase
      .from('subsectors')
      .select('id, name_en, name_ar, sector_id')
      .limit(50);
    
    // Fetch challenge summary by status
    const { data: challenges } = await supabase
      .from('challenges')
      .select('id, title_en, title_ar, status, sector_id, priority')
      .eq('is_deleted', false)
      .limit(30);
    
    // Fetch pilot summary
    const { data: pilots } = await supabase
      .from('pilots')
      .select('id, title_en, title_ar, status, sector_id')
      .eq('is_deleted', false)
      .limit(20);
    
    // Fetch solutions
    const { data: solutions } = await supabase
      .from('solutions')
      .select('id, name_en, name_ar, status, category')
      .eq('is_deleted', false)
      .limit(20);
    
    // Fetch municipalities
    const { data: municipalities } = await supabase
      .from('municipalities')
      .select('id, name_en, name_ar')
      .limit(30);
    
    // Build sector hierarchy
    const sectorMap = new Map();
    sectors?.forEach((s: any) => {
      sectorMap.set(s.id, { ...s, subsectors: [] });
    });
    subsectors?.forEach((ss: any) => {
      if (sectorMap.has(ss.sector_id)) {
        sectorMap.get(ss.sector_id).subsectors.push(ss);
      }
    });
    
    // Build context string
    let context = `\n## PLATFORM DATA (CURRENT STATE)\n\n`;
    
    // Sectors and subsectors
    context += `### Available Sectors (${sectors?.length || 0} total):\n`;
    sectorMap.forEach((sector: any) => {
      context += `- **${sector.name_en}** (${sector.name_ar})`;
      if (sector.subsectors.length > 0) {
        const subNames = sector.subsectors.slice(0, 5).map((ss: any) => ss.name_en).join(', ');
        context += ` → Subsectors: ${subNames}${sector.subsectors.length > 5 ? '...' : ''}`;
      }
      context += `\n`;
    });
    
    // Challenges summary
    context += `\n### Challenges (${challenges?.length || 0} in database):\n`;
    const statusCounts: Record<string, number> = {};
    challenges?.forEach((c: any) => {
      statusCounts[c.status || 'unknown'] = (statusCounts[c.status || 'unknown'] || 0) + 1;
    });
    Object.entries(statusCounts).forEach(([status, count]) => {
      context += `- ${status}: ${count} challenges\n`;
    });
    
    // Sample challenges
    if (challenges?.length > 0) {
      context += `\nSample challenges:\n`;
      challenges.slice(0, 5).forEach((c: any) => {
        context += `- "${c.title_en}" (${c.status || 'N/A'}, Priority: ${c.priority || 'N/A'})\n`;
      });
    }
    
    // Pilots summary
    context += `\n### Pilots (${pilots?.length || 0} in database):\n`;
    const pilotStatusCounts: Record<string, number> = {};
    pilots?.forEach((p: any) => {
      pilotStatusCounts[p.status || 'unknown'] = (pilotStatusCounts[p.status || 'unknown'] || 0) + 1;
    });
    Object.entries(pilotStatusCounts).forEach(([status, count]) => {
      context += `- ${status}: ${count} pilots\n`;
    });
    
    // Solutions summary
    context += `\n### Solutions (${solutions?.length || 0} in database):\n`;
    const solutionCategories: Record<string, number> = {};
    solutions?.forEach((s: any) => {
      solutionCategories[s.category || 'uncategorized'] = (solutionCategories[s.category || 'uncategorized'] || 0) + 1;
    });
    Object.entries(solutionCategories).forEach(([cat, count]) => {
      context += `- ${cat}: ${count} solutions\n`;
    });
    
    // Municipalities
    context += `\n### Municipalities (${municipalities?.length || 0} available):\n`;
    municipalities?.slice(0, 10).forEach((m: any) => {
      context += `- ${m.name_en} (${m.name_ar})\n`;
    });
    if ((municipalities?.length || 0) > 10) {
      context += `- ... and ${(municipalities?.length || 0) - 10} more\n`;
    }
    
    context += `\n**IMPORTANT:** When users ask to list or view data, use the ACTUAL entities above. Do not make up names or data.\n`;
    
    return context;
  } catch (error) {
    console.error('Error fetching platform context:', error);
    return '\n## PLATFORM DATA: Unable to fetch. Respond based on general knowledge.\n';
  }
}

// Get user role from database
async function getUserRole(supabase: any, userId: string | null, userEmail: string | null): Promise<string> {
  if (!userId && !userEmail) return 'anonymous';
  
  // Check user_roles table first
  if (userId) {
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    
    if (roles && roles.length > 0) {
      // Priority: admin > staff > citizen
      if (roles.some((r: any) => r.role === 'admin')) return 'admin';
      if (roles.some((r: any) => r.role === 'staff' || r.role === 'municipality_staff')) return 'staff';
      return 'citizen';
    }
  }
  
  // Check profiles table for role
  if (userEmail) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('email', userEmail)
      .single();
    
    if (profile?.role) {
      if (profile.role === 'admin' || profile.role === 'super_admin') return 'admin';
      if (profile.role === 'staff' || profile.role === 'municipality_staff') return 'staff';
      return 'citizen';
    }
  }
  
  return userId ? 'citizen' : 'anonymous';
}

// Check rate limit and track usage
async function checkAndTrackUsage(
  supabase: any, 
  userId: string | null, 
  userEmail: string | null,
  sessionId: string
): Promise<{ allowed: boolean; info: any; shouldNotify: boolean }> {
  const userType = await getUserRole(supabase, userId, userEmail);
  
  // Admin users have unlimited access
  if (userType === 'admin') {
    return { 
      allowed: true, 
      info: { user_type: 'admin', unlimited: true, daily_remaining: 999999 },
      shouldNotify: false 
    };
  }
  
  // Check rate limit
  const { data: limitCheck } = await supabase.rpc('check_ai_rate_limit', {
    p_session_id: sessionId,
    p_user_id: userId,
    p_user_type: userType,
    p_endpoint: 'invoke-llm'
  });
  
  const info = limitCheck || { allowed: false, daily_limit: 0, daily_used: 0, daily_remaining: 0 };
  info.user_type = userType;
  
  // Check if we should send 80% warning notification
  const usagePercent = info.daily_limit > 0 ? (info.daily_used / info.daily_limit) : 0;
  const shouldNotify = usagePercent >= 0.8 && usagePercent < 0.85; // Only notify at exactly 80%
  
  // Track usage if allowed
  if (info.allowed) {
    await supabase.from('ai_usage_tracking').insert({
      user_id: userId,
      user_email: userEmail,
      session_id: sessionId,
      endpoint: 'invoke-llm',
      tokens_used: 0 // Will be updated after response if needed
    });
  }
  
  return { allowed: info.allowed, info, shouldNotify };
}

// Send 80% warning email
async function send80PercentWarningEmail(supabase: any, userEmail: string, info: any) {
  if (!userEmail) return;
  
  try {
    await supabase.functions.invoke('send-email', {
      body: {
        to: userEmail,
        subject: 'AI Usage Warning - 80% of Daily Limit Reached',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f59e0b;">⚠️ AI Usage Warning</h2>
            <p>You have used <strong>80%</strong> of your daily AI request limit.</p>
            <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 0;"><strong>Used:</strong> ${info.daily_used} / ${info.daily_limit} requests</p>
              <p style="margin: 8px 0 0 0;"><strong>Remaining:</strong> ${info.daily_remaining} requests</p>
            </div>
            <p>Your limit will reset at midnight (UTC).</p>
            <p style="color: #6b7280; font-size: 12px;">
              This is an automated notification from the Municipal Innovation Platform.
            </p>
          </div>
        `
      }
    });
    console.log('80% warning email sent to:', userEmail);
  } catch (err) {
    console.error('Failed to send warning email:', err);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { prompt, response_json_schema, system_prompt, session_id, messages: conversationHistory } = await req.json();
    
    // Get user from auth header
    let userId: string | null = null;
    let userEmail: string | null = null;
    
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        userId = user.id;
        userEmail = user.email || null;
      }
    }
    
    // Generate session ID for anonymous users
    const sessionId = session_id || `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Check rate limit
    const { allowed, info, shouldNotify } = await checkAndTrackUsage(supabase, userId, userEmail, sessionId);
    
    if (!allowed) {
      console.log('Rate limit exceeded for:', userEmail || sessionId);
      return new Response(JSON.stringify({ 
        error: "Rate limit exceeded. Please try again later.",
        rate_limit_info: info
      }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Send 80% warning email if needed
    if (shouldNotify && userEmail) {
      // Don't await - send async
      send80PercentWarningEmail(supabase, userEmail, info);
    }
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Fetch actual platform data for context
    const platformContext = await fetchPlatformContext(supabase);
    console.log("Platform context fetched, length:", platformContext.length);

    const messages: { role: string; content: string }[] = [];
    
    // Add system prompt with Saudi context AND platform data
    if (system_prompt) {
      messages.push({ role: "system", content: `${system_prompt}\n\n${COMPACT_SAUDI_CONTEXT}\n\n${INNOVATION_EMPHASIS}\n\n${platformContext}` });
    } else {
      messages.push({ 
        role: "system", 
        content: `You are a helpful AI assistant for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH).

${SAUDI_MOMAH_CONTEXT}

${INNOVATION_EMPHASIS}

${platformContext}

Respond in the requested format while emphasizing innovation opportunities. Provide bilingual support (English/Arabic) when appropriate.` 
      });
    }
    
    // Add conversation history if provided (for context continuity)
    if (conversationHistory && Array.isArray(conversationHistory)) {
      console.log(`[invoke-llm] Processing ${conversationHistory.length} messages from conversation history`);
      for (const msg of conversationHistory) {
        // Handle user messages
        if (msg.role === 'user') {
          if (msg.content?.trim()) {
            messages.push({ role: 'user', content: msg.content });
            console.log(`[invoke-llm] Added user message: ${msg.content.substring(0, 50)}...`);
          }
        }
        // Handle assistant messages - CRITICAL: Include full tool context data
        else if (msg.role === 'assistant') {
          let content = msg.content || '';
          
          // For structured responses, extract readable text
          if (msg.structured?.sections) {
            content = msg.structured.sections
              .filter((s: any) => s.content)
              .map((s: any) => {
                if (s.type === 'bullet_list' && s.metadata?.items) {
                  return s.metadata.items.join('\n- ');
                }
                if (s.type === 'data_table' && s.metadata?.rows) {
                  return s.metadata.rows.map((r: any) => Object.values(r).join(' | ')).join('\n');
                }
                return s.content;
              })
              .join('\n');
          }
          
          // CRITICAL: Include FULL tool context data in history for continuity
          if (msg.toolContext?.data) {
            const toolData = msg.toolContext.data;
            if (toolData.type === 'data_list' && toolData.items) {
              const entity = toolData.entity || 'items';
              content += `\n\n[RETRIEVED DATA - ${entity.toUpperCase()}]\n`;
              toolData.items.forEach((item: any, i: number) => {
                const name = item.name_en || item.name || item.title_en || item.title || item.id;
                const status = item.status ? ` (${item.status})` : '';
                const sector = item.sector ? ` - ${item.sector}` : '';
                content += `${i + 1}. ${name}${status}${sector}\n`;
              });
            }
          }
          
          if (content.trim()) {
            messages.push({ role: 'assistant', content });
            console.log(`[invoke-llm] Added assistant message with ${msg.toolContext ? 'tool context' : 'no tool context'}`);
          }
        }
        // Handle tool_result messages - expand to full data
        else if (msg.role === 'tool_result') {
          const toolData = msg.data;
          let resultText = `[TOOL RESULT: ${msg.toolName}]\n`;
          
          if (toolData?.type === 'data_list' && toolData?.items) {
            const entity = toolData.entity || 'items';
            resultText += `Retrieved ${toolData.items.length} ${entity}:\n`;
            toolData.items.forEach((item: any, i: number) => {
              const name = item.name_en || item.name || item.title_en || item.title || item.id;
              const status = item.status ? ` [${item.status}]` : '';
              const sector = item.sector ? ` (${item.sector})` : '';
              resultText += `${i + 1}. ${name}${status}${sector}\n`;
            });
          } else if (typeof toolData === 'string') {
            resultText += toolData;
          } else {
            resultText += JSON.stringify(toolData, null, 2);
          }
          
          messages.push({ role: 'assistant', content: resultText });
          console.log(`[invoke-llm] Added tool result for: ${msg.toolName}`);
        }
      }
    }
    
    // Add current prompt if no history or as fallback
    if (prompt && messages.length <= 1) {
      messages.push({ role: "user", content: prompt });
    }

    const body: Record<string, unknown> = {
      model: "google/gemini-2.5-flash",
      messages,
    };

    // If JSON schema is provided, use tool calling for structured output
    if (response_json_schema) {
      body.tools = [
        {
          type: "function",
          function: {
            name: "structured_response",
            description: "Return a structured response matching the schema",
            parameters: response_json_schema
          }
        }
      ];
      body.tool_choice = { type: "function", function: { name: "structured_response" } };
    }

    console.log("Calling Lovable AI for user:", userEmail || sessionId);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "AI gateway rate limit exceeded. Please try again later.",
          rate_limit_info: info
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    
    let result: any;
    
    // Extract response - check for tool call first, then regular content
    if (data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments) {
      try {
        result = JSON.parse(data.choices[0].message.tool_calls[0].function.arguments);
      } catch {
        result = data.choices[0].message.tool_calls[0].function.arguments;
      }
    } else if (data.choices?.[0]?.message?.content) {
      const content = data.choices[0].message.content;
      // Try to parse as JSON if schema was requested
      if (response_json_schema) {
        try {
          result = JSON.parse(content);
        } catch {
          result = content;
        }
      } else {
        result = content;
      }
    } else {
      result = data;
    }

    // Include rate limit info in response for client-side display
    if (typeof result === 'object' && result !== null) {
      result.rate_limit_info = info;
    }

    console.log("Lovable AI response received for:", userEmail || sessionId);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in invoke-llm function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
