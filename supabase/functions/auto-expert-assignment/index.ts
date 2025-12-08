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
    const { entity_type, entity_id, sector_id, expertise_required } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!entity_type || !entity_id) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "entity_type and entity_id are required" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Auto-assigning expert for ${entity_type}/${entity_id}`);

    // Build query for available experts
    let query = supabase
      .from('expert_profiles')
      .select('*')
      .eq('is_active', true)
      .eq('is_verified', true)
      .eq('availability_status', 'available');

    // Filter by sector if provided
    if (sector_id) {
      query = query.contains('sectors', [sector_id]);
    }

    // Filter by expertise if provided
    if (expertise_required && expertise_required.length > 0) {
      query = query.overlaps('expertise_areas', expertise_required);
    }

    const { data: experts, error: expertsError } = await query;

    if (expertsError) {
      console.error("Error fetching experts:", expertsError);
      throw new Error("Failed to fetch experts");
    }

    if (!experts || experts.length === 0) {
      return new Response(JSON.stringify({ 
        success: false,
        error: "No available experts found matching criteria",
        assigned: false
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get workload for each expert (count of pending assignments)
    const expertsWithWorkload = await Promise.all(experts.map(async (expert) => {
      const { count } = await supabase
        .from('expert_assignments')
        .select('id', { count: 'exact', head: true })
        .eq('expert_id', expert.id)
        .eq('status', 'pending');

      return { ...expert, pending_assignments: count || 0 };
    }));

    // Sort by workload (ascending) and rating (descending)
    expertsWithWorkload.sort((a, b) => {
      if (a.pending_assignments !== b.pending_assignments) {
        return a.pending_assignments - b.pending_assignments;
      }
      return (b.rating || 0) - (a.rating || 0);
    });

    const selectedExpert = expertsWithWorkload[0];

    // Create assignment
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // 7 day deadline

    const { data: assignment, error: assignError } = await supabase
      .from('expert_assignments')
      .insert({
        expert_id: selectedExpert.id,
        entity_type,
        entity_id,
        assignment_type: 'evaluation',
        status: 'pending',
        assigned_date: new Date().toISOString(),
        due_date: dueDate.toISOString()
      })
      .select()
      .single();

    if (assignError) {
      console.error("Error creating assignment:", assignError);
      throw new Error("Failed to create assignment");
    }

    // Create notification for expert
    await supabase
      .from('notifications')
      .insert({
        user_email: selectedExpert.user_email,
        title: 'New Evaluation Assignment',
        message: `You have been assigned to evaluate a ${entity_type}. Please complete by ${dueDate.toLocaleDateString()}.`,
        notification_type: 'assignment',
        entity_type,
        entity_id,
        is_read: false
      });

    console.log(`Assigned expert ${selectedExpert.name_en} to ${entity_type}/${entity_id}`);

    return new Response(JSON.stringify({ 
      success: true,
      assigned: true,
      assignment_id: assignment.id,
      expert: {
        id: selectedExpert.id,
        name: selectedExpert.name_en,
        email: selectedExpert.user_email
      },
      due_date: dueDate.toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in auto-expert-assignment:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
