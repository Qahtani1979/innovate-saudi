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
    const { file_url, json_schema } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Extracting data from file:", file_url);

    // Fetch the file content
    let fileContent = "";
    let fileType = "unknown";
    
    try {
      const fileResponse = await fetch(file_url);
      const contentType = fileResponse.headers.get("content-type") || "";
      
      if (contentType.includes("text/csv") || file_url.endsWith(".csv")) {
        fileType = "csv";
        fileContent = await fileResponse.text();
      } else if (contentType.includes("application/json") || file_url.endsWith(".json")) {
        fileType = "json";
        fileContent = await fileResponse.text();
      } else if (contentType.includes("text/") || file_url.endsWith(".txt")) {
        fileType = "text";
        fileContent = await fileResponse.text();
      } else {
        // For binary files (PDF, Excel, etc.), we'll use AI to describe what to extract
        fileType = "binary";
        fileContent = `[Binary file at: ${file_url}. Content type: ${contentType}]`;
      }
    } catch (fetchError) {
      console.error("Error fetching file:", fetchError);
      fileContent = `[Could not fetch file content from: ${file_url}]`;
    }

    // Build prompt for extraction
    const schemaDescription = json_schema 
      ? `Extract data matching this JSON schema:\n${JSON.stringify(json_schema, null, 2)}`
      : "Extract all relevant structured data from the file.";

    const prompt = `You are a data extraction assistant. Extract structured data from the following ${fileType} file content.

${schemaDescription}

File content:
${fileContent.substring(0, 10000)} ${fileContent.length > 10000 ? '...[truncated]' : ''}

Return ONLY the extracted data as valid JSON matching the requested schema. If you cannot extract certain fields, use null.`;

    // Use Lovable AI to extract data
    const body: Record<string, unknown> = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "You are a data extraction assistant. Always respond with valid JSON only, no markdown or explanations." },
        { role: "user", content: prompt }
      ],
    };

    // If schema provided, use tool calling for structured output
    if (json_schema) {
      body.tools = [
        {
          type: "function",
          function: {
            name: "extract_data",
            description: "Extract structured data from file content",
            parameters: json_schema
          }
        }
      ];
      body.tool_choice = { type: "function", function: { name: "extract_data" } };
    }

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
      throw new Error(`AI extraction failed: ${response.status}`);
    }

    const data = await response.json();
    
    let result;
    
    // Extract response from tool call or content
    if (data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments) {
      try {
        result = JSON.parse(data.choices[0].message.tool_calls[0].function.arguments);
      } catch {
        result = data.choices[0].message.tool_calls[0].function.arguments;
      }
    } else if (data.choices?.[0]?.message?.content) {
      const content = data.choices[0].message.content;
      try {
        // Try to parse as JSON, removing any markdown code blocks
        const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
        result = JSON.parse(cleanContent);
      } catch {
        result = { raw_content: content };
      }
    } else {
      result = { error: "No data extracted" };
    }

    console.log("Data extraction completed successfully");

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in extract-file-data function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
