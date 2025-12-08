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
    const { text, source_lang, target_lang, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!text) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "No text provided for translation" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sourceLang = source_lang || 'en';
    const targetLang = target_lang || (sourceLang === 'en' ? 'ar' : 'en');
    const contextInfo = context || 'government policy document';

    console.log(`Translating from ${sourceLang} to ${targetLang}: "${text.substring(0, 50)}..."`);

    const systemPrompt = `You are an expert translator specializing in ${contextInfo} translations between English and Arabic. 
Translate the following text accurately while:
- Maintaining formal government/policy tone
- Preserving technical terminology appropriately
- Ensuring cultural appropriateness
- Keeping formatting (bullet points, paragraphs) intact

Return ONLY the translated text, nothing else.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Translate from ${sourceLang === 'en' ? 'English' : 'Arabic'} to ${targetLang === 'en' ? 'English' : 'Arabic'}:\n\n${text}` }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI translation error:", response.status, errorText);
      throw new Error(`Translation failed: ${response.status}`);
    }

    const data = await response.json();
    const translatedText = data.choices?.[0]?.message?.content || '';

    console.log(`Translation complete: ${translatedText.substring(0, 50)}...`);

    return new Response(JSON.stringify({ 
      success: true,
      source_lang: sourceLang,
      target_lang: targetLang,
      original: text,
      translated: translatedText
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in translate-policy:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
