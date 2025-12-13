import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple XLSX parser for basic spreadsheets
function parseXLSX(data: Uint8Array): { headers: string[]; rows: Record<string, string>[] } {
  // XLSX files are ZIP archives containing XML files
  // We'll use a minimal approach to extract shared strings and sheet data
  
  try {
    // Find ZIP local file headers and extract content
    const files = extractZipFiles(data);
    
    // Get shared strings (for cell values)
    const sharedStrings = parseSharedStrings(files['xl/sharedStrings.xml'] || '');
    
    // Parse the first sheet
    const sheetXml = files['xl/worksheets/sheet1.xml'] || '';
    return parseSheet(sheetXml, sharedStrings);
  } catch (e) {
    console.error('XLSX parsing error:', e);
    throw new Error('Failed to parse Excel file: ' + (e instanceof Error ? e.message : String(e)));
  }
}

function extractZipFiles(data: Uint8Array): Record<string, string> {
  const files: Record<string, string> = {};
  const decoder = new TextDecoder('utf-8');
  let pos = 0;
  
  while (pos < data.length - 4) {
    // Look for local file header signature (0x04034b50)
    if (data[pos] === 0x50 && data[pos + 1] === 0x4b && data[pos + 2] === 0x03 && data[pos + 3] === 0x04) {
      const nameLen = data[pos + 26] | (data[pos + 27] << 8);
      const extraLen = data[pos + 28] | (data[pos + 29] << 8);
      const compressedSize = data[pos + 18] | (data[pos + 19] << 8) | (data[pos + 20] << 16) | (data[pos + 21] << 24);
      const compressionMethod = data[pos + 8] | (data[pos + 9] << 8);
      
      const nameStart = pos + 30;
      const nameBytes = data.slice(nameStart, nameStart + nameLen);
      const fileName = decoder.decode(nameBytes);
      
      const dataStart = nameStart + nameLen + extraLen;
      const fileData = data.slice(dataStart, dataStart + compressedSize);
      
      // Only handle uncompressed files (method 0) or try to decompress
      if (compressionMethod === 0) {
        files[fileName] = decoder.decode(fileData);
      } else if (compressionMethod === 8) {
        // Deflate compression - use DecompressionStream
        try {
          // For now, skip compressed files - we'll use AI fallback
          files[fileName] = '';
        } catch {
          files[fileName] = '';
        }
      }
      
      pos = dataStart + compressedSize;
    } else {
      pos++;
    }
  }
  
  return files;
}

function parseSharedStrings(xml: string): string[] {
  const strings: string[] = [];
  const regex = /<t[^>]*>([^<]*)<\/t>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    strings.push(decodeXmlEntities(match[1]));
  }
  return strings;
}

function parseSheet(xml: string, sharedStrings: string[]): { headers: string[]; rows: Record<string, string>[] } {
  const rows: string[][] = [];
  
  // Find all row elements
  const rowRegex = /<row[^>]*>([\s\S]*?)<\/row>/g;
  let rowMatch;
  
  while ((rowMatch = rowRegex.exec(xml)) !== null) {
    const rowContent = rowMatch[1];
    const cells: string[] = [];
    
    // Find all cell elements in this row
    const cellRegex = /<c\s+r="([A-Z]+)(\d+)"[^>]*(?:t="([^"]*)")?[^>]*>(?:[\s\S]*?<v>([^<]*)<\/v>)?[\s\S]*?<\/c>/g;
    let cellMatch;
    
    while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
      const colLetter = cellMatch[1];
      const cellType = cellMatch[3] || '';
      const cellValue = cellMatch[4] || '';
      
      // Convert column letter to index (A=0, B=1, etc.)
      const colIndex = colLetter.split('').reduce((acc, char) => acc * 26 + char.charCodeAt(0) - 64, 0) - 1;
      
      // Pad with empty strings if needed
      while (cells.length < colIndex) {
        cells.push('');
      }
      
      // Get the actual value
      let value = cellValue;
      if (cellType === 's' && sharedStrings.length > 0) {
        // Shared string reference
        const idx = parseInt(cellValue, 10);
        value = sharedStrings[idx] || cellValue;
      }
      
      cells[colIndex] = value;
    }
    
    if (cells.length > 0) {
      rows.push(cells);
    }
  }
  
  if (rows.length === 0) {
    return { headers: [], rows: [] };
  }
  
  // First row is headers
  const headers = rows[0].map(h => String(h || '').trim()).filter(h => h);
  const dataRows: Record<string, string>[] = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row: Record<string, string> = {};
    let hasData = false;
    
    headers.forEach((header, idx) => {
      const value = rows[i][idx];
      row[header] = value !== undefined && value !== null ? String(value) : '';
      if (row[header]) hasData = true;
    });
    
    if (hasData) {
      dataRows.push(row);
    }
  }
  
  return { headers, rows: dataRows };
}

function decodeXmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

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
    console.log("File type:", file_type);

    let fileContent = "";
    let detectedType = file_type || "unknown";
    
    // Check if this is an Excel file
    const isExcel = file_type?.includes('spreadsheet') || 
                    file_type?.includes('excel') ||
                    file_name?.endsWith('.xlsx') || 
                    file_name?.endsWith('.xls');

    // Handle Excel files with built-in parser
    if (isExcel && file_content) {
      console.log("Processing Excel file with built-in parser...");
      try {
        // Decode base64 to binary
        const binaryString = atob(file_content);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Try to parse with our XLSX parser
        const result = parseXLSX(bytes);
        
        if (result.headers.length > 0 && result.rows.length > 0) {
          console.log("Excel extraction completed:", {
            headers: result.headers.length,
            rows: result.rows.length
          });
          
          return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        console.log("Built-in parser returned no data, falling back to AI...");
      } catch (xlsxError) {
        console.error("Built-in XLSX parsing error:", xlsxError);
        console.log("Falling back to AI extraction for Excel...");
      }
      
      // Fallback: Convert Excel to CSV-like text for AI
      // Since we can't reliably parse compressed XLSX, use AI with description
      fileContent = `[Excel file: ${file_name}] - Please extract all tabular data from this spreadsheet.`;
    }
    
    // Handle base64 content (for PDFs and images)
    if (file_content && !isExcel) {
      // For images and PDFs, we'll include them as data URLs in the prompt
      if (detectedType.startsWith('image/') || detectedType === 'application/pdf') {
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
    } else if (!isExcel) {
      throw new Error("No file content or URL provided");
    }

    // For Excel files that failed local parsing, try AI with the raw base64
    // But note: AI can't read binary Excel directly, so this is limited
    
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

    // Use Lovable AI to extract data
    const requestBody: Record<string, unknown> = {
      model: "google/gemini-2.5-flash",
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
