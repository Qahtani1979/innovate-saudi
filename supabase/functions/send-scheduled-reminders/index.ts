import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReminderResult {
  type: string;
  count: number;
  sent: number;
  errors: string[];
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json().catch(() => ({}));
    const dryRun = body.dry_run || false;

    console.log(`[send-scheduled-reminders] Starting reminder processing, dry_run=${dryRun}`);

    const results: ReminderResult[] = [];
    const now = new Date();

    // 1. Tasks due in 24 hours
    const taskResult = await processTaskReminders(supabase, now, dryRun);
    results.push(taskResult);

    // 2. Contracts expiring in 7 days
    const contractResult = await processContractReminders(supabase, now, dryRun);
    results.push(contractResult);

    // 3. Events starting in 24 hours
    const eventResult = await processEventReminders(supabase, now, dryRun);
    results.push(eventResult);

    // 4. Pilot milestones due in 48 hours
    const milestoneResult = await processMilestoneReminders(supabase, now, dryRun);
    results.push(milestoneResult);

    const totalSent = results.reduce((sum, r) => sum + r.sent, 0);
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);

    console.log(`[send-scheduled-reminders] Completed: ${totalSent} sent, ${totalErrors} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        dry_run: dryRun,
        timestamp: now.toISOString(),
        results,
        summary: { total_sent: totalSent, total_errors: totalErrors }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[send-scheduled-reminders] Error:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function processTaskReminders(supabase: any, now: Date, dryRun: boolean): Promise<ReminderResult> {
  const result: ReminderResult = { type: "tasks", count: 0, sent: 0, errors: [] };
  
  try {
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    const { data: tasks, error } = await supabase
      .from("tasks")
      .select("id, title, description, assigned_to_email, due_date, priority")
      .gte("due_date", now.toISOString())
      .lte("due_date", tomorrow.toISOString())
      .not("status", "in", '("completed","cancelled")')
      .is("reminder_sent_at", null);

    if (error) {
      result.errors.push(`Query error: ${error.message}`);
      return result;
    }

    result.count = tasks?.length || 0;
    console.log(`[send-scheduled-reminders] Found ${result.count} tasks due in 24h`);

    if (!dryRun && tasks) {
      for (const task of tasks) {
        if (!task.assigned_to_email) continue;

        try {
          await supabase.functions.invoke("email-trigger-hub", {
            body: {
              trigger: "task.reminder",
              entity_type: "task",
              entity_id: task.id,
              recipient_email: task.assigned_to_email,
              variables: {
                taskTitle: task.title,
                taskDescription: task.description || "",
                dueDate: new Date(task.due_date).toLocaleDateString(),
                priority: task.priority || "normal"
              }
            }
          });

          await supabase
            .from("tasks")
            .update({ reminder_sent_at: now.toISOString() })
            .eq("id", task.id);

          result.sent++;
        } catch (e: any) {
          result.errors.push(`Task ${task.id}: ${e.message}`);
        }
      }
    }
  } catch (e: any) {
    result.errors.push(`Process error: ${e.message}`);
  }

  return result;
}

async function processContractReminders(supabase: any, now: Date, dryRun: boolean): Promise<ReminderResult> {
  const result: ReminderResult = { type: "contracts", count: 0, sent: 0, errors: [] };
  
  try {
    const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const { data: contracts, error } = await supabase
      .from("contracts")
      .select("id, title_en, title_ar, contract_code, end_date, signed_by_municipality, contract_value")
      .gte("end_date", now.toISOString())
      .lte("end_date", sevenDays.toISOString())
      .eq("status", "active")
      .eq("is_deleted", false);

    if (error) {
      result.errors.push(`Query error: ${error.message}`);
      return result;
    }

    result.count = contracts?.length || 0;
    console.log(`[send-scheduled-reminders] Found ${result.count} contracts expiring in 7 days`);

    if (!dryRun && contracts) {
      for (const contract of contracts) {
        if (!contract.signed_by_municipality) continue;

        try {
          await supabase.functions.invoke("email-trigger-hub", {
            body: {
              trigger: "contract.expiring",
              entity_type: "contract",
              entity_id: contract.id,
              recipient_email: contract.signed_by_municipality,
              variables: {
                contractTitle: contract.title_en,
                contractCode: contract.contract_code,
                expiryDate: new Date(contract.end_date).toLocaleDateString(),
                contractValue: contract.contract_value?.toString() || "N/A"
              }
            }
          });
          result.sent++;
        } catch (e: any) {
          result.errors.push(`Contract ${contract.id}: ${e.message}`);
        }
      }
    }
  } catch (e: any) {
    result.errors.push(`Process error: ${e.message}`);
  }

  return result;
}

async function processEventReminders(supabase: any, now: Date, dryRun: boolean): Promise<ReminderResult> {
  const result: ReminderResult = { type: "events", count: 0, sent: 0, errors: [] };
  
  try {
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    const { data: events, error } = await supabase
      .from("events")
      .select("id, title_en, title_ar, start_date, location, created_by")
      .gte("start_date", now.toISOString())
      .lte("start_date", tomorrow.toISOString())
      .eq("is_cancelled", false);

    if (error) {
      result.errors.push(`Query error: ${error.message}`);
      return result;
    }

    result.count = events?.length || 0;
    console.log(`[send-scheduled-reminders] Found ${result.count} events starting in 24h`);

    if (!dryRun && events) {
      for (const event of events) {
        // Get event registrations
        const { data: registrations } = await supabase
          .from("event_registrations")
          .select("attendee_email")
          .eq("event_id", event.id)
          .eq("status", "confirmed");

        const recipients = registrations?.map((r: any) => r.attendee_email).filter(Boolean) || [];
        
        for (const email of recipients) {
          try {
            await supabase.functions.invoke("email-trigger-hub", {
              body: {
                trigger: "event.reminder",
                entity_type: "event",
                entity_id: event.id,
                recipient_email: email,
                variables: {
                  eventTitle: event.title_en,
                  eventDate: new Date(event.start_date).toLocaleDateString(),
                  eventTime: new Date(event.start_date).toLocaleTimeString(),
                  eventLocation: event.location || "TBD"
                }
              }
            });
            result.sent++;
          } catch (e: any) {
            result.errors.push(`Event ${event.id} to ${email}: ${e.message}`);
          }
        }
      }
    }
  } catch (e: any) {
    result.errors.push(`Process error: ${e.message}`);
  }

  return result;
}

async function processMilestoneReminders(supabase: any, now: Date, dryRun: boolean): Promise<ReminderResult> {
  const result: ReminderResult = { type: "milestones", count: 0, sent: 0, errors: [] };
  
  try {
    const twoDays = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    
    const { data: milestones, error } = await supabase
      .from("pilot_milestones")
      .select(`
        id, name, description, target_date, status,
        pilots!inner(id, title_en, pilot_owner_email)
      `)
      .gte("target_date", now.toISOString())
      .lte("target_date", twoDays.toISOString())
      .not("status", "in", '("completed","verified")');

    if (error) {
      result.errors.push(`Query error: ${error.message}`);
      return result;
    }

    result.count = milestones?.length || 0;
    console.log(`[send-scheduled-reminders] Found ${result.count} pilot milestones due in 48h`);

    if (!dryRun && milestones) {
      for (const milestone of milestones) {
        const pilot = milestone.pilots;
        if (!pilot?.pilot_owner_email) continue;

        try {
          await supabase.functions.invoke("email-trigger-hub", {
            body: {
              trigger: "pilot.milestone_reminder",
              entity_type: "pilot_milestone",
              entity_id: milestone.id,
              recipient_email: pilot.pilot_owner_email,
              variables: {
                milestoneName: milestone.name,
                milestoneDescription: milestone.description || "",
                pilotTitle: pilot.title_en,
                targetDate: new Date(milestone.target_date).toLocaleDateString()
              }
            }
          });
          result.sent++;
        } catch (e: any) {
          result.errors.push(`Milestone ${milestone.id}: ${e.message}`);
        }
      }
    }
  } catch (e: any) {
    result.errors.push(`Process error: ${e.message}`);
  }

  return result;
}
