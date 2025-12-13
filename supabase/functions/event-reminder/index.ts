import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Event {
  id: string;
  title_en: string;
  title_ar?: string;
  start_date: string;
  location?: string;
  is_virtual?: boolean;
  virtual_link?: string;
  program_id?: string;
}

interface Registration {
  id: string;
  user_email: string;
  user_id?: string;
  event_id: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('[event-reminder] Starting event reminder check...');

    // Get events starting in the next 24-48 hours that haven't been reminded
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    const { data: upcomingEvents, error: eventsError } = await supabase
      .from('events')
      .select('id, title_en, title_ar, start_date, location, is_virtual, virtual_link, program_id')
      .gte('start_date', in24Hours.toISOString())
      .lte('start_date', in48Hours.toISOString())
      .in('status', ['published', 'registration_open', 'registration_closed'])
      .eq('is_deleted', false)
      .is('reminder_sent_at', null);

    if (eventsError) {
      console.error('[event-reminder] Error fetching events:', eventsError);
      throw eventsError;
    }

    console.log(`[event-reminder] Found ${upcomingEvents?.length || 0} events needing reminders`);

    if (!upcomingEvents || upcomingEvents.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No events need reminders', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let totalReminders = 0;
    const results: { eventId: string; title: string; reminders: number; error?: string }[] = [];

    for (const event of upcomingEvents as Event[]) {
      try {
        console.log(`[event-reminder] Processing event: ${event.title_en} (${event.id})`);

        // Get all registrations for this event
        const { data: registrations, error: regError } = await supabase
          .from('event_registrations')
          .select('id, user_email, user_id, event_id')
          .eq('event_id', event.id)
          .eq('status', 'confirmed');

        if (regError) {
          console.error(`[event-reminder] Error fetching registrations for ${event.id}:`, regError);
          results.push({ eventId: event.id, title: event.title_en, reminders: 0, error: regError.message });
          continue;
        }

        if (!registrations || registrations.length === 0) {
          console.log(`[event-reminder] No registrations for event ${event.id}`);
          results.push({ eventId: event.id, title: event.title_en, reminders: 0 });
          continue;
        }

        console.log(`[event-reminder] Sending reminders to ${registrations.length} registrants`);

        // Format event date for display
        const eventDate = new Date(event.start_date);
        const formattedDate = eventDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        // Send reminder emails via email-trigger-hub
        for (const registration of registrations as Registration[]) {
          try {
            const { error: emailError } = await supabase.functions.invoke('email-trigger-hub', {
              body: {
                trigger: 'event.reminder',
                options: {
                  entity_type: 'event',
                  entity_id: event.id,
                  recipient_email: registration.user_email,
                  entity_data: {
                    title: event.title_en,
                    title_ar: event.title_ar,
                    start_date: formattedDate,
                    location: event.is_virtual ? 'Virtual Event' : (event.location || 'TBA'),
                    virtual_link: event.virtual_link
                  },
                  variables: {
                    event_title: event.title_en,
                    event_date: formattedDate,
                    event_location: event.is_virtual ? 'Virtual Event' : (event.location || 'TBA'),
                    join_link: event.virtual_link || ''
                  }
                }
              }
            });

            if (emailError) {
              console.warn(`[event-reminder] Email error for ${registration.user_email}:`, emailError);
            } else {
              totalReminders++;
            }
          } catch (e) {
            console.warn(`[event-reminder] Failed to send email to ${registration.user_email}:`, e);
          }
        }

        // Create in-app notifications for registrants
        for (const registration of registrations as Registration[]) {
          try {
            await supabase.from('citizen_notifications').insert({
              user_id: registration.user_id,
              user_email: registration.user_email,
              notification_type: 'event_reminder',
              title: `Reminder: ${event.title_en}`,
              message: `Your event "${event.title_en}" is starting tomorrow at ${formattedDate}`,
              entity_type: 'event',
              entity_id: event.id,
              is_read: false
            });
          } catch (e) {
            console.warn(`[event-reminder] Failed to create notification for ${registration.user_email}:`, e);
          }
        }

        // Mark event as reminder sent
        await supabase
          .from('events')
          .update({ reminder_sent_at: new Date().toISOString() })
          .eq('id', event.id);

        results.push({ eventId: event.id, title: event.title_en, reminders: registrations.length });
        console.log(`[event-reminder] Completed processing event ${event.id}`);

      } catch (eventError) {
        console.error(`[event-reminder] Error processing event ${event.id}:`, eventError);
        results.push({ 
          eventId: event.id, 
          title: event.title_en, 
          reminders: 0, 
          error: eventError instanceof Error ? eventError.message : 'Unknown error' 
        });
      }
    }

    console.log(`[event-reminder] Completed. Total reminders sent: ${totalReminders}`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: upcomingEvents.length,
        totalReminders,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[event-reminder] Fatal error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});