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
    const { prompt, response_json_schema, system_prompt } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const messages: { role: string; content: string }[] = [];
    
    if (system_prompt) {
      messages.push({ role: "system", content: system_prompt });
    } else {
      messages.push({ 
        role: "system", 
        content: "You are a helpful AI assistant. Respond in the requested format." 
      });
    }
    
    messages.push({ role: "user", content: prompt });

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

    console.log("Calling Lovable AI with prompt:", prompt.substring(0, 100) + "...");

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
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
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
    
    let result;
    
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

    console.log("Lovable AI response received successfully");

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
