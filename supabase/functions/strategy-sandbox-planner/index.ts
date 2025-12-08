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
    const { sandbox_type, objectives, duration, resources } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Strategy Sandbox Planner: ${sandbox_type}`);

    let plan = {
      phases: [] as Array<{
        name: string;
        duration: string;
        activities: string[];
        deliverables: string[];
      }>,
      success_metrics: [] as string[],
      risk_mitigation: [] as string[],
      resource_allocation: {} as Record<string, string>
    };

    if (LOVABLE_API_KEY) {
      const prompt = `Create a sandbox experiment plan:
      
      Sandbox Type: ${sandbox_type || 'innovation'}
      Objectives: ${JSON.stringify(objectives || [])}
      Duration: ${duration || '3 months'}
      Available Resources: ${JSON.stringify(resources || {})}
      
      Generate:
      1. Implementation Phases (3-4 phases with activities and deliverables)
      2. Success Metrics (5 KPIs)
      3. Risk Mitigation Strategies (5 items)
      4. Resource Allocation Plan
      
      Format as structured JSON.`;

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
        
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            plan = { ...plan, ...parsed };
          }
        } catch {
          console.warn('Could not parse plan JSON');
        }
      }
    }

    // Fallback plan
    if (plan.phases.length === 0) {
      plan = {
        phases: [
          {
            name: 'Setup & Design',
            duration: '2 weeks',
            activities: ['Define scope', 'Identify participants', 'Setup infrastructure'],
            deliverables: ['Sandbox charter', 'Participant list', 'Technical setup']
          },
          {
            name: 'Experimentation',
            duration: '6 weeks',
            activities: ['Run experiments', 'Collect data', 'Iterate on solutions'],
            deliverables: ['Experiment logs', 'Interim reports', 'Prototype iterations']
          },
          {
            name: 'Evaluation & Reporting',
            duration: '2 weeks',
            activities: ['Analyze results', 'Document learnings', 'Present findings'],
            deliverables: ['Final report', 'Recommendations', 'Scaling plan']
          }
        ],
        success_metrics: [
          'Number of experiments completed',
          'Solution viability score',
          'Participant satisfaction',
          'Time to insights',
          'Scalability assessment'
        ],
        risk_mitigation: [
          'Regular checkpoint reviews',
          'Fallback technical infrastructure',
          'Clear exit criteria',
          'Stakeholder communication plan',
          'Resource contingency buffer'
        ],
        resource_allocation: {
          budget: 'To be determined',
          team: '5-10 members',
          infrastructure: 'Cloud sandbox environment',
          support: 'Technical and business mentors'
        }
      };
    }

    // Save sandbox plan
    const { data: savedPlan, error } = await supabase
      .from('sandbox_plans')
      .insert({
        sandbox_type: sandbox_type || 'innovation',
        objectives,
        duration: duration || '3 months',
        phases: plan.phases,
        success_metrics: plan.success_metrics,
        risk_mitigation: plan.risk_mitigation,
        resource_allocation: plan.resource_allocation,
        status: 'draft',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.warn('Could not save sandbox plan:', error);
    }

    return new Response(JSON.stringify({ 
      success: true,
      plan_id: savedPlan?.id,
      ...plan
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in strategy-sandbox-planner:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
