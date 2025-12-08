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
    const { program_id, action } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Program SLA Automation: ${action} for program ${program_id}`);

    let result;

    switch (action) {
      case 'check_sla':
        // Check SLA compliance for program
        const { data: program } = await supabase
          .from('programs')
          .select('*, program_milestones(*)')
          .eq('id', program_id)
          .single();

        const now = new Date();
        const milestones = program?.program_milestones || [];
        
        const overdue = milestones.filter((m: { due_date: string; status: string }) => 
          new Date(m.due_date) < now && m.status !== 'completed'
        );
        
        const atRisk = milestones.filter((m: { due_date: string; status: string }) => {
          const dueDate = new Date(m.due_date);
          const daysUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
          return daysUntilDue <= 7 && daysUntilDue > 0 && m.status !== 'completed';
        });

        result = {
          sla_status: overdue.length > 0 ? 'breached' : atRisk.length > 0 ? 'at_risk' : 'on_track',
          overdue_count: overdue.length,
          at_risk_count: atRisk.length,
          overdue_milestones: overdue,
          at_risk_milestones: atRisk
        };
        break;

      case 'escalate':
        // Escalate SLA breach
        const { data: escalation, error: escError } = await supabase
          .from('program_escalations')
          .insert({
            program_id,
            escalation_type: 'sla_breach',
            status: 'pending',
            escalated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (escError) throw escError;
        result = { escalated: true, escalation };
        break;

      case 'update_sla':
        // Update SLA metrics
        const { data: metrics } = await supabase
          .from('program_sla_metrics')
          .upsert({
            program_id,
            last_checked: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        result = { updated: true, metrics };
        break;

      default:
        // Get SLA metrics
        const { data: slaMetrics } = await supabase
          .from('program_sla_metrics')
          .select('*')
          .eq('program_id', program_id)
          .single();

        result = { metrics: slaMetrics };
    }

    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in program-sla-automation:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
