import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple base64 encoding/decoding for token (in production, use proper JWT)
function encodeToken(data: { email: string; category: string; timestamp: number }): string {
  const jsonStr = JSON.stringify(data);
  return btoa(jsonStr).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function decodeToken(token: string): { email: string; category: string; timestamp: number } | null {
  try {
    const padded = token.replace(/-/g, '+').replace(/_/g, '/');
    const jsonStr = atob(padded);
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

function generateHTML(success: boolean, email: string, category: string, message: string, resubscribeToken?: string): string {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  
  return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Preferences - Saudi Innovates</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);
      max-width: 480px;
      width: 100%;
      padding: 48px 32px;
      text-align: center;
    }
    .icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
    }
    .icon.success { background: #dcfce7; }
    .icon.error { background: #fee2e2; }
    h1 {
      font-size: 24px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 12px;
    }
    .message {
      color: #64748b;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .details {
      background: #f8fafc;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
      text-align: left;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #64748b; font-size: 14px; }
    .detail-value { color: #1e293b; font-weight: 500; font-size: 14px; }
    .btn {
      display: inline-block;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      text-decoration: none;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }
    .btn-primary {
      background: #3b82f6;
      color: white;
    }
    .btn-primary:hover { background: #2563eb; }
    .btn-outline {
      background: transparent;
      border: 1px solid #e2e8f0;
      color: #64748b;
      margin-top: 12px;
    }
    .btn-outline:hover { background: #f8fafc; }
    .footer {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e2e8f0;
      color: #94a3b8;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon ${success ? 'success' : 'error'}">
      ${success ? '✅' : '❌'}
    </div>
    <h1>${success ? 'Unsubscribed Successfully' : 'Error'}</h1>
    <p class="message">${message}</p>
    
    ${success ? `
    <div class="details">
      <div class="detail-row">
        <span class="detail-label">Email</span>
        <span class="detail-value">${email}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Category</span>
        <span class="detail-value">${category === 'all' ? 'All Emails' : category.charAt(0).toUpperCase() + category.slice(1)}</span>
      </div>
    </div>
    
    ${resubscribeToken ? `
    <form method="POST" action="${supabaseUrl}/functions/v1/unsubscribe">
      <input type="hidden" name="action" value="resubscribe">
      <input type="hidden" name="token" value="${resubscribeToken}">
      <button type="submit" class="btn btn-primary">Re-subscribe to These Emails</button>
    </form>
    ` : ''}
    ` : ''}
    
    <a href="/" class="btn btn-outline">Return to Saudi Innovates</a>
    
    <div class="footer">
      <p>Saudi Innovates Platform</p>
      <p>If you have questions, contact support@saudiinnovates.sa</p>
    </div>
  </div>
</body>
</html>`;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    let token: string | null = null;
    let action = "unsubscribe";

    if (req.method === "GET") {
      const url = new URL(req.url);
      token = url.searchParams.get("token");
    } else if (req.method === "POST") {
      const formData = await req.formData().catch(() => null);
      if (formData) {
        token = formData.get("token") as string;
        action = formData.get("action") as string || "unsubscribe";
      }
    }

    if (!token) {
      return new Response(
        generateHTML(false, "", "", "Invalid or missing unsubscribe token."),
        { headers: { ...corsHeaders, "Content-Type": "text/html" } }
      );
    }

    const decoded = decodeToken(token);
    if (!decoded) {
      return new Response(
        generateHTML(false, "", "", "Invalid or expired unsubscribe token."),
        { headers: { ...corsHeaders, "Content-Type": "text/html" } }
      );
    }

    // Check token age (30 days max)
    const tokenAge = Date.now() - decoded.timestamp;
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    if (tokenAge > maxAge) {
      return new Response(
        generateHTML(false, decoded.email, decoded.category, "This unsubscribe link has expired. Please use a more recent email to unsubscribe."),
        { headers: { ...corsHeaders, "Content-Type": "text/html" } }
      );
    }

    const { email, category } = decoded;
    const isResubscribe = action === "resubscribe";

    console.log(`[unsubscribe] ${isResubscribe ? 'Re-subscribing' : 'Unsubscribing'} ${email} from ${category}`);

    // Get current preferences
    const { data: prefs, error: fetchError } = await supabase
      .from("user_notification_preferences")
      .select("*")
      .eq("user_email", email)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("[unsubscribe] Error fetching preferences:", fetchError);
      return new Response(
        generateHTML(false, email, category, "An error occurred while processing your request."),
        { headers: { ...corsHeaders, "Content-Type": "text/html" } }
      );
    }

    let updateData: Record<string, any> = {};

    if (category === "all") {
      // Unsubscribe from all emails
      updateData.email_notifications = isResubscribe;
    } else {
      // Unsubscribe from specific category
      const currentCategories = prefs?.email_categories || {};
      updateData.email_categories = {
        ...currentCategories,
        [category]: isResubscribe
      };
    }

    if (prefs) {
      // Update existing preferences
      const { error: updateError } = await supabase
        .from("user_notification_preferences")
        .update(updateData)
        .eq("user_email", email);

      if (updateError) {
        console.error("[unsubscribe] Error updating preferences:", updateError);
        return new Response(
          generateHTML(false, email, category, "An error occurred while updating your preferences."),
          { headers: { ...corsHeaders, "Content-Type": "text/html" } }
        );
      }
    } else {
      // Create new preferences record
      const { error: insertError } = await supabase
        .from("user_notification_preferences")
        .insert({
          user_email: email,
          email_notifications: category === "all" ? isResubscribe : true,
          email_categories: category !== "all" ? { [category]: isResubscribe } : {}
        });

      if (insertError) {
        console.error("[unsubscribe] Error creating preferences:", insertError);
      }
    }

    // Log the action
    await supabase.from("email_logs").insert({
      recipient_email: email,
      template_key: isResubscribe ? "resubscribe" : "unsubscribe",
      subject: isResubscribe ? `Re-subscribed to ${category}` : `Unsubscribed from ${category}`,
      status: "sent",
      sent_at: new Date().toISOString(),
      triggered_by: "user_action"
    });

    const message = isResubscribe
      ? `You have been re-subscribed to ${category === 'all' ? 'all email notifications' : category + ' emails'}.`
      : `You have been unsubscribed from ${category === 'all' ? 'all email notifications' : category + ' emails'}. You will no longer receive these emails.`;

    // Generate resubscribe token for the confirmation page
    const resubscribeToken = isResubscribe ? undefined : encodeToken({ email, category, timestamp: Date.now() });

    return new Response(
      generateHTML(true, email, category, message, resubscribeToken),
      { headers: { ...corsHeaders, "Content-Type": "text/html" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[unsubscribe] Error:", errorMessage);
    return new Response(
      generateHTML(false, "", "", "An unexpected error occurred. Please try again later."),
      { headers: { ...corsHeaders, "Content-Type": "text/html" } }
    );
  }
});
