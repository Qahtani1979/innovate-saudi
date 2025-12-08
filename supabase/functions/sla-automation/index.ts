import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// SLA configuration by priority tier
const SLA_DAYS: Record<string, number> = {
  critical: 7,
  high: 14,
  medium: 21,
  low: 30,
  tier_1: 7,
  tier_2: 14,
  tier_3: 21,
  tier_4: 30
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { entity_type = 'challenges', check_all = false } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`SLA automation for ${entity_type}`);

    const now = new Date();
    const results = {
      processed: 0,
      escalated: 0,
      overdue: 0,
      updated: [] as string[]
    };

    // Get entities that need SLA checking
    const { data: entities, error } = await supabase
      .from(entity_type)
      .select('id, title_en, status, priority, submission_date, sla_due_date, escalation_level')
      .not('status', 'in', '(resolved,archived,completed,rejected)')
      .eq('is_deleted', false);

    if (error) {
      console.error("Error fetching entities:", error);
      throw new Error("Failed to fetch entities");
    }

    for (const entity of entities || []) {
      const submissionDate = entity.submission_date ? new Date(entity.submission_date) : null;
      if (!submissionDate) continue;

      // Calculate SLA due date if not set
      let dueDate = entity.sla_due_date ? new Date(entity.sla_due_date) : null;
      if (!dueDate) {
        const slaDays = SLA_DAYS[entity.priority?.toLowerCase()] || SLA_DAYS.medium;
        dueDate = new Date(submissionDate);
        dueDate.setDate(dueDate.getDate() + slaDays);
      }

      // Calculate days overdue
      const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      
      let newEscalationLevel = 0;
      if (daysOverdue > 14) {
        newEscalationLevel = 2; // CRITICAL
      } else if (daysOverdue > 7) {
        newEscalationLevel = 1; // WARNING
      } else if (daysOverdue > 0) {
        newEscalationLevel = 1;
      }

      const currentLevel = entity.escalation_level || 0;
      
      // Update if escalation changed or due date not set
      if (newEscalationLevel !== currentLevel || !entity.sla_due_date) {
        const updateData: Record<string, unknown> = {
          sla_due_date: dueDate.toISOString(),
          escalation_level: newEscalationLevel
        };

        if (newEscalationLevel > currentLevel) {
          updateData.escalation_date = now.toISOString();
        }

        await supabase
          .from(entity_type)
          .update(updateData)
          .eq('id', entity.id);

        results.updated.push(entity.id);
        
        if (newEscalationLevel > currentLevel) {
          results.escalated++;
        }
      }

      if (daysOverdue > 0) {
        results.overdue++;
      }
      
      results.processed++;
    }

    console.log(`SLA automation complete: ${results.processed} processed, ${results.escalated} escalated`);

    return new Response(JSON.stringify({ 
      success: true,
      entity_type,
      ...results
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in sla-automation:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
