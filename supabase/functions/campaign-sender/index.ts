import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CampaignRequest {
  campaign_id: string;
  action: 'send' | 'preview' | 'pause' | 'resume' | 'cancel';
  preview_email?: string; // For preview action
}

interface AudienceFilter {
  roles?: string[];
  municipalities?: string[];
  sectors?: string[];
  persona_types?: string[];
  custom_emails?: string[];
  exclude_emails?: string[];
}

// Get recipients based on audience filter
async function getRecipients(
  supabase: any,
  audienceType: string,
  audienceFilter: AudienceFilter | null
): Promise<string[]> {
  const recipients: Set<string> = new Set();
  
  if (audienceType === 'all') {
    // Get all active users with email notifications enabled
    const { data: users } = await supabase
      .from('user_profiles')
      .select('user_email')
      .eq('is_active', true);
    
    users?.forEach((u: any) => {
      if (u.user_email) recipients.add(u.user_email);
    });
  } else if (audienceType === 'role' && audienceFilter?.roles?.length) {
    // Get users with specific roles (Phase 4: uses user_roles with role_id)
    const { data: roleUsers } = await supabase
      .from('user_roles')
      .select('user_id, roles:role_id(name)')
      .in('role_id', audienceFilter.roles)
      .eq('is_active', true);
    
    if (roleUsers?.length) {
      const userIds = roleUsers.map((ru: any) => ru.user_id);
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_email')
        .in('user_id', userIds);
      
      profiles?.forEach((p: any) => {
        if (p.user_email) recipients.add(p.user_email);
      });
    }
  } else if (audienceType === 'municipality' && audienceFilter?.municipalities?.length) {
    // Get users from specific municipalities
    const { data: munUsers } = await supabase
      .from('user_roles')
      .select('user_id')
      .in('municipality_id', audienceFilter.municipalities);
    
    if (munUsers?.length) {
      const userIds = munUsers.map((mu: any) => mu.user_id);
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_email')
        .in('user_id', userIds);
      
      profiles?.forEach((p: any) => {
        if (p.user_email) recipients.add(p.user_email);
      });
    }
  } else if (audienceType === 'custom' && audienceFilter?.custom_emails?.length) {
    // Custom email list
    audienceFilter.custom_emails.forEach(email => recipients.add(email));
  }
  
  // Remove excluded emails
  if (audienceFilter?.exclude_emails?.length) {
    audienceFilter.exclude_emails.forEach(email => recipients.delete(email));
  }
  
  // Filter out users who have disabled emails
  const recipientArray = [...recipients];
  const { data: prefs } = await supabase
    .from('user_notification_preferences')
    .select('user_email')
    .in('user_email', recipientArray)
    .eq('email_notifications', false);
  
  const disabledEmails = new Set(prefs?.map((p: any) => p.user_email) || []);
  
  return recipientArray.filter(email => !disabledEmails.has(email));
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const request: CampaignRequest = await req.json();
    
    console.log(`[campaign-sender] Action: ${request.action} for campaign: ${request.campaign_id}`);
    
    if (!request.campaign_id || !request.action) {
      return new Response(
        JSON.stringify({ success: false, error: "campaign_id and action are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Fetch campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .select('*, email_templates(*)')
      .eq('id', request.campaign_id)
      .single();
    
    if (campaignError || !campaign) {
      return new Response(
        JSON.stringify({ success: false, error: "Campaign not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Handle different actions
    switch (request.action) {
      case 'preview': {
        // Send a preview to specified email
        const previewEmail = request.preview_email;
        if (!previewEmail) {
          return new Response(
            JSON.stringify({ success: false, error: "preview_email is required for preview action" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Send preview via send-email
        const previewResponse = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            template_key: campaign.email_templates?.template_key,
            recipient_email: previewEmail,
            variables: campaign.campaign_variables || {},
            force_send: true,
            triggered_by: `campaign_preview:${campaign.id}`
          })
        });
        
        const previewResult = await previewResponse.json();
        
        return new Response(
          JSON.stringify({ 
            success: previewResult.success, 
            message: previewResult.success ? 'Preview sent' : 'Preview failed',
            error: previewResult.error 
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      case 'send': {
        // Validate campaign status
        if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
          return new Response(
            JSON.stringify({ success: false, error: `Cannot send campaign with status: ${campaign.status}` }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Update campaign status to sending
        await supabase
          .from('email_campaigns')
          .update({ status: 'sending', started_at: new Date().toISOString() })
          .eq('id', campaign.id);
        
        // Get recipients
        const recipients = await getRecipients(
          supabase,
          campaign.audience_type,
          campaign.audience_filter as AudienceFilter
        );
        
        console.log(`[campaign-sender] Found ${recipients.length} recipients`);
        
        // Update recipient count
        await supabase
          .from('email_campaigns')
          .update({ recipient_count: recipients.length })
          .eq('id', campaign.id);
        
        // Create recipient records
        const recipientRecords = recipients.map(email => ({
          campaign_id: campaign.id,
          recipient_email: email,
          status: 'pending'
        }));
        
        if (recipientRecords.length > 0) {
          await supabase
            .from('campaign_recipients')
            .insert(recipientRecords);
        }
        
        // Send emails in batches
        const batchSize = 50;
        let sentCount = 0;
        let failedCount = 0;
        
        for (let i = 0; i < recipients.length; i += batchSize) {
          const batch = recipients.slice(i, i + batchSize);
          
          for (const recipientEmail of batch) {
            try {
              const sendResponse = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  template_key: campaign.email_templates?.template_key,
                  recipient_email: recipientEmail,
                  variables: campaign.campaign_variables || {},
                  force_send: true, // Campaigns bypass preferences (already filtered)
                  triggered_by: `campaign:${campaign.id}`
                })
              });
              
              const sendResult = await sendResponse.json();
              
              // Update recipient status
              await supabase
                .from('campaign_recipients')
                .update({
                  status: sendResult.success ? 'sent' : 'failed',
                  error_message: sendResult.error?.message || sendResult.error,
                  sent_at: sendResult.success ? new Date().toISOString() : null
                })
                .eq('campaign_id', campaign.id)
                .eq('recipient_email', recipientEmail);
              
              if (sendResult.success) {
                sentCount++;
              } else {
                failedCount++;
              }
            } catch (err) {
              failedCount++;
              await supabase
                .from('campaign_recipients')
                .update({
                  status: 'failed',
                  error_message: String(err)
                })
                .eq('campaign_id', campaign.id)
                .eq('recipient_email', recipientEmail);
            }
          }
          
          // Update counts after each batch
          await supabase
            .from('email_campaigns')
            .update({ sent_count: sentCount, failed_count: failedCount })
            .eq('id', campaign.id);
          
          // Small delay between batches to avoid rate limits
          if (i + batchSize < recipients.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        // Mark campaign as completed
        await supabase
          .from('email_campaigns')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            sent_count: sentCount,
            failed_count: failedCount
          })
          .eq('id', campaign.id);
        
        console.log(`[campaign-sender] Campaign completed: ${sentCount} sent, ${failedCount} failed`);
        
        return new Response(
          JSON.stringify({
            success: true,
            campaign_id: campaign.id,
            summary: {
              total_recipients: recipients.length,
              sent: sentCount,
              failed: failedCount
            }
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      case 'pause': {
        await supabase
          .from('email_campaigns')
          .update({ status: 'paused' })
          .eq('id', campaign.id);
        
        return new Response(
          JSON.stringify({ success: true, message: 'Campaign paused' }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      case 'cancel': {
        await supabase
          .from('email_campaigns')
          .update({ status: 'cancelled' })
          .eq('id', campaign.id);
        
        return new Response(
          JSON.stringify({ success: true, message: 'Campaign cancelled' }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      default:
        return new Response(
          JSON.stringify({ success: false, error: `Unknown action: ${request.action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("[campaign-sender] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
