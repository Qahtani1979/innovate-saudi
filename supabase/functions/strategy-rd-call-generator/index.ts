import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { challenge_ids, sector_id, budget_range, timeline } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Generating R&D call for challenges: ${challenge_ids?.join(', ')}`);

    // Fetch related challenges
    let challenges: Array<{ title_en: string; description_en: string }> = [];
    if (challenge_ids?.length) {
      const { data } = await supabase
        .from('challenges')
        .select('title_en, description_en')
        .in('id', challenge_ids);
      challenges = data || [];
    }

    let rd_call = {
      title: '',
      description: '',
      objectives: [] as string[],
      eligibility_criteria: [] as string[],
      evaluation_criteria: [] as string[],
      submission_requirements: [] as string[]
    };

    if (LOVABLE_API_KEY) {
      const prompt = `Generate an R&D call document based on these challenges:
      
      Challenges: ${challenges.map(c => c.title_en).join(', ')}
      Budget Range: ${budget_range || 'To be determined'}
      Timeline: ${timeline || '6-12 months'}
      
      Generate:
      1. Call Title
      2. Description (2-3 paragraphs)
      3. Objectives (5 bullet points)
      4. Eligibility Criteria (5 bullet points)
      5. Evaluation Criteria (5 bullet points)
      6. Submission Requirements (5 bullet points)`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';
        
        // Parse content into structured format
        const sections = content.split('\n\n');
        rd_call.title = sections[0]?.replace(/^#*\s*/, '') || 'R&D Innovation Call';
        rd_call.description = sections.slice(1, 3).join('\n\n') || '';
        
        // Extract bullet points for each section
        const lines = content.split('\n');
        let currentSection = '';
        
        for (const line of lines) {
          const lower = line.toLowerCase();
          if (lower.includes('objective')) currentSection = 'objectives';
          else if (lower.includes('eligibility')) currentSection = 'eligibility';
          else if (lower.includes('evaluation')) currentSection = 'evaluation';
          else if (lower.includes('submission')) currentSection = 'submission';
          else if (line.trim().startsWith('-') || line.trim().match(/^\d+\./)) {
            const item = line.trim().replace(/^[-\d.]+\s*/, '');
            if (currentSection === 'objectives') rd_call.objectives.push(item);
            else if (currentSection === 'eligibility') rd_call.eligibility_criteria.push(item);
            else if (currentSection === 'evaluation') rd_call.evaluation_criteria.push(item);
            else if (currentSection === 'submission') rd_call.submission_requirements.push(item);
          }
        }
      }
    }

    // Fallback content
    if (!rd_call.title) {
      rd_call = {
        title: 'Innovation R&D Call',
        description: 'This call invites proposals for innovative solutions addressing key municipal challenges.',
        objectives: ['Address identified challenges', 'Develop scalable solutions', 'Foster collaboration'],
        eligibility_criteria: ['Registered organization', 'Relevant experience', 'Technical capability'],
        evaluation_criteria: ['Innovation level', 'Feasibility', 'Impact potential', 'Cost effectiveness'],
        submission_requirements: ['Technical proposal', 'Budget breakdown', 'Team composition', 'Timeline']
      };
    }

    // Save R&D call
    const { data: savedCall, error } = await supabase
      .from('rd_calls')
      .insert({
        title_en: rd_call.title,
        description_en: rd_call.description,
        sector_id,
        challenge_ids,
        budget_range,
        timeline,
        objectives: rd_call.objectives,
        eligibility_criteria: rd_call.eligibility_criteria,
        evaluation_criteria: rd_call.evaluation_criteria,
        submission_requirements: rd_call.submission_requirements,
        status: 'draft',
        generated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.warn('Could not save R&D call:', error);
    }

    return new Response(JSON.stringify({ 
      success: true,
      rd_call_id: savedCall?.id,
      ...rd_call
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in strategy-rd-call-generator:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
