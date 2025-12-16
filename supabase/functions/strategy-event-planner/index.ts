import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const LOVABLE_API_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { 
      strategic_plan_id, 
      event_type, 
      target_audience,
      prefilled_spec,
      save_to_db = false
    } = await req.json();

    console.log("Starting strategy-event-planner:", { strategic_plan_id, event_type, save_to_db });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch strategic plan
    let plan = null;
    if (strategic_plan_id) {
      const { data } = await supabase
        .from("strategic_plans")
        .select("*")
        .eq("id", strategic_plan_id)
        .single();
      plan = data;
    }

    const eventTypeLabels: Record<string, string> = {
      conference: 'Innovation Conference',
      workshop: 'Interactive Workshop',
      hackathon: 'Innovation Hackathon',
      exhibition: 'Technology Exhibition',
      webinar: 'Virtual Webinar',
      networking: 'Networking Event'
    };

    const prompt = `You are an expert in strategic event planning for Saudi municipal innovation initiatives.

Design 1-2 event concepts for the following context:

STRATEGIC PLAN: ${plan?.name_en || prefilled_spec?.title_en || 'Municipal Innovation Strategy'}
OBJECTIVES: ${JSON.stringify(plan?.objectives || [])}

EVENT TYPE: ${eventTypeLabels[event_type] || event_type || 'conference'}
TARGET AUDIENCE: ${target_audience?.join(', ') || 'General stakeholders'}
${prefilled_spec ? `PREFILLED SPEC: ${JSON.stringify(prefilled_spec)}` : ''}

For each event concept, provide:
1. title_en & title_ar: Event name
2. description_en & description_ar: Brief description
3. estimated_attendees: Recommended number
4. agenda: High-level agenda items (array)
5. key_outcomes: What the event should achieve
6. suggested_location: Type of venue needed

Ensure events:
- Align with strategic objectives
- Engage target audience effectively
- Deliver measurable outcomes
- Follow Saudi cultural norms and Vision 2030 themes`;

    let events = [];

    if (LOVABLE_API_KEY) {
      const response = await fetch(LOVABLE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You are an expert event planner for Saudi municipalities. Always respond with valid JSON." },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          try {
            const parsed = JSON.parse(content);
            events = parsed.events || [parsed.event] || [];
          } catch (e) {
            console.error("Parse error:", e);
          }
        }
      }
    }

    // Fallback event
    if (events.length === 0) {
      events = [{
        title_en: prefilled_spec?.title_en || `Municipal Innovation ${eventTypeLabels[event_type] || 'Forum'}`,
        title_ar: prefilled_spec?.title_ar || `منتدى الابتكار البلدي`,
        description_en: prefilled_spec?.description_en || `A strategic ${event_type || 'conference'} bringing together key stakeholders to drive municipal innovation aligned with ${plan?.name_en || 'strategic objectives'}.`,
        description_ar: `فعالية استراتيجية تجمع أصحاب المصلحة الرئيسيين لدفع الابتكار البلدي.`,
        estimated_attendees: event_type === 'conference' ? 300 : event_type === 'workshop' ? 50 : 150,
        agenda: [
          'Opening and Vision Address',
          'Strategic Innovation Panel',
          'Interactive Session: Challenges & Solutions',
          'Networking and Partnership Building',
          'Closing and Next Steps'
        ],
        key_outcomes: ['Strategic alignment validation', 'Stakeholder engagement', 'Partnership opportunities identified'],
        suggested_location: event_type === 'webinar' ? 'Virtual Platform' : 'Convention Center or Municipal Hall'
      }];
    }

    // Save to database if requested
    const savedEvents = [];
    if (save_to_db) {
      for (const event of events) {
        const eventData = {
          title_en: event.title_en,
          title_ar: event.title_ar,
          description_en: event.description_en,
          description_ar: event.description_ar,
          event_type: event_type || 'conference',
          strategic_plan_ids: strategic_plan_id ? [strategic_plan_id] : [],
          estimated_attendees: event.estimated_attendees,
          agenda: event.agenda,
          key_outcomes: event.key_outcomes,
          location: event.suggested_location,
          status: 'draft',
          is_strategy_derived: true
        };

        const { data: saved, error } = await supabase
          .from('events')
          .insert(eventData)
          .select()
          .single();

        if (error) {
          console.error("Failed to save event:", error);
        } else {
          savedEvents.push(saved);
          console.log("Event saved with ID:", saved.id);
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      events: save_to_db ? savedEvents : events,
      id: savedEvents[0]?.id || null,
      saved: savedEvents.length > 0
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in strategy-event-planner:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
