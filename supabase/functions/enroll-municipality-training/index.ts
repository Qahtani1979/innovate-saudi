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
    const { municipality_id, training_program_id, user_email, participants } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!municipality_id || !training_program_id) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "municipality_id and training_program_id are required" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Enrolling municipality ${municipality_id} in training ${training_program_id}`);

    // Get municipality details
    const { data: municipality, error: muniError } = await supabase
      .from('municipalities')
      .select('*')
      .eq('id', municipality_id)
      .single();

    if (muniError || !municipality) {
      throw new Error("Municipality not found");
    }

    // Get training program details
    const { data: program, error: programError } = await supabase
      .from('programs')
      .select('*')
      .eq('id', training_program_id)
      .single();

    if (programError || !program) {
      throw new Error("Training program not found");
    }

    const now = new Date().toISOString();
    const enrollments = [];

    // Enroll participants
    const participantList = participants || [user_email].filter(Boolean);
    
    for (const participant of participantList) {
      // Check if already enrolled
      const { data: existing } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('event_id', training_program_id)
        .eq('user_email', participant)
        .single();

      if (!existing) {
        const { data: enrollment, error: enrollError } = await supabase
          .from('event_registrations')
          .insert({
            event_id: training_program_id,
            user_email: participant,
            organization_id: municipality_id,
            status: 'registered',
            registration_date: now
          })
          .select()
          .single();

        if (!enrollError && enrollment) {
          enrollments.push(enrollment);
        }
      }
    }

    // Create notification
    if (user_email) {
      await supabase
        .from('notifications')
        .insert({
          user_email,
          title: 'Training Enrollment Confirmed',
          message: `You have been enrolled in: ${(program as Record<string, unknown>).name_en}`,
          notification_type: 'success',
          entity_type: 'program',
          entity_id: training_program_id,
          is_read: false
        });
    }

    console.log(`Enrolled ${enrollments.length} participants from ${municipality_id}`);

    return new Response(JSON.stringify({ 
      success: true,
      municipality_id,
      training_program_id,
      enrollments,
      enrollment_count: enrollments.length
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in enroll-municipality-training:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
