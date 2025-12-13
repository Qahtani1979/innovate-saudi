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
    const body = await req.json();
    const { file_url, file_content, file_name, file_type, json_schema } = body;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Extracting data from file:", file_name || file_url);

    let fileContent = "";
    let detectedType = "unknown";
    
    // Handle base64 content (preferred for PDFs and images)
    if (file_content) {
      detectedType = file_type || "unknown";
      
      // For images and PDFs, we'll include them as data URLs in the prompt
      if (detectedType.startsWith('image/') || detectedType === 'application/pdf') {
        // The AI model can process images directly via data URLs
        fileContent = `data:${detectedType};base64,${file_content}`;
      } else {
        // For text-based content, decode base64
        try {
          fileContent = atob(file_content);
        } catch {
          fileContent = `[Binary content: ${file_name}]`;
        }
      }
    } else if (file_url) {
      // Legacy URL-based extraction
      try {
        const fileResponse = await fetch(file_url);
        const contentType = fileResponse.headers.get("content-type") || "";
        
        if (contentType.includes("text/csv") || file_url.endsWith(".csv")) {
          detectedType = "csv";
          fileContent = await fileResponse.text();
        } else if (contentType.includes("application/json") || file_url.endsWith(".json")) {
          detectedType = "json";
          fileContent = await fileResponse.text();
        } else if (contentType.includes("text/") || file_url.endsWith(".txt")) {
          detectedType = "text";
          fileContent = await fileResponse.text();
        } else {
          detectedType = "binary";
          fileContent = `[Binary file at: ${file_url}]`;
        }
      } catch (fetchError) {
        console.error("Error fetching file:", fetchError);
        fileContent = `[Could not fetch file content from: ${file_url}]`;
      }
    } else {
      throw new Error("No file content or URL provided");
    }

    // Build prompt for extraction
    const schemaDescription = json_schema 
      ? `Extract data matching this JSON schema:\n${JSON.stringify(json_schema, null, 2)}`
      : "Extract all relevant structured data from the file.";

    // For images and PDFs, use vision-capable model with multimodal input
    const isImageOrPdf = detectedType.startsWith('image/') || detectedType === 'application/pdf';
    
    let messages: Array<{ role: string; content: string | Array<{ type: string; text?: string; image_url?: { url: string } }> }>;
    
    if (isImageOrPdf && file_content) {
      // Use multimodal format for images
      messages = [
        { 
          role: "system", 
          content: "You are a data extraction assistant. Extract structured tabular data from images and documents. Always respond with valid JSON matching the requested schema. Look for tables, lists, or structured information and convert them to rows with headers." 
        },
        { 
          role: "user", 
          content: [
            { 
              type: "text", 
              text: `${schemaDescription}\n\nExtract all tabular or structured data from this ${detectedType === 'application/pdf' ? 'PDF document' : 'image'}. Return the data as JSON with 'headers' array and 'rows' array of objects.` 
            },
            { 
              type: "image_url", 
              image_url: { url: `data:${detectedType};base64,${file_content}` } 
            }
          ]
        }
      ];
    } else {
      // Text-based extraction
      const prompt = `You are a data extraction assistant. Extract structured data from the following ${detectedType} file content.

${schemaDescription}

File content:
${typeof fileContent === 'string' ? fileContent.substring(0, 15000) : '[Content not readable]'} ${typeof fileContent === 'string' && fileContent.length > 15000 ? '...[truncated]' : ''}

Return ONLY the extracted data as valid JSON with 'headers' (array of column names) and 'rows' (array of objects with those headers as keys). If you cannot extract certain fields, use null.`;

      messages = [
        { role: "system", content: "You are a data extraction assistant. Always respond with valid JSON only, no markdown or explanations." },
        { role: "user", content: prompt }
      ];
    }

    // Use Lovable AI to extract data - use gemini-2.5-flash for multimodal
    const requestBody: Record<string, unknown> = {
      model: isImageOrPdf ? "google/gemini-2.5-flash" : "google/gemini-2.5-flash",
      messages,
    };

    // If schema provided, use tool calling for structured output
    if (json_schema) {
      requestBody.tools = [
        {
          type: "function",
          function: {
            name: "extract_data",
            description: "Extract structured data from file content",
            parameters: json_schema
          }
        }
      ];
      requestBody.tool_choice = { type: "function", function: { name: "extract_data" } };
    }

    console.log("Calling AI for extraction...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
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
        result = { error: "Could not parse AI response", raw_content: content };
      }
    } else {
      result = { error: "No data extracted from file" };
    }

    console.log("Data extraction completed:", {
      headers: result.headers?.length || 0,
      rows: result.rows?.length || 0
    });

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
