import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string | string[];
  subject: string;
  body?: string;
  html?: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    // If no API key, log warning and return success (graceful degradation)
    if (!RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured - email not sent");
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Email service not configured. Please add RESEND_API_KEY." 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { to, subject, body, html }: EmailRequest = await req.json();
    
    const toAddresses = Array.isArray(to) ? to : [to];
    
    console.log("Sending email to:", toAddresses, "Subject:", subject);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Saudi Innovates <onboarding@resend.dev>",
        to: toAddresses,
        subject: subject,
        html: html || body || "",
        text: body || "",
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error("Resend API error:", result);
      return new Response(
        JSON.stringify({ success: false, error: result }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Email sent successfully:", result);
    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
