import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  // Option 1: Use template
  template_key?: string;
  variables?: Record<string, string>;
  
  // Option 2: Direct content (fallback)
  to?: string | string[];
  subject?: string;
  body?: string;
  html?: string;
  
  // Common options
  recipient_email?: string;
  recipient_user_id?: string;
  language?: 'en' | 'ar';
  force_send?: boolean;
  entity_type?: string;
  entity_id?: string;
  triggered_by?: string;
}

interface EmailSettings {
  [key: string]: string | object;
}

// Critical templates that bypass preference checks
const CRITICAL_TEMPLATES = [
  'email_verification',
  'password_reset',
  'password_changed',
  'account_locked',
  'account_deactivated',
  'security_alert',
  'login_new_device'
];

// Build HTML email with header and footer
function buildHtmlEmail(
  template: any,
  settings: EmailSettings,
  body: string,
  language: 'en' | 'ar'
): string {
  const isRTL = language === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';
  const fontFamily = isRTL 
    ? "'Noto Sans Arabic', 'Segoe UI', Tahoma, sans-serif"
    : "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
  
  const gradientStart = template.header_gradient_start || settings.default_header_gradient_start || '#006C35';
  const gradientEnd = template.header_gradient_end || settings.default_header_gradient_end || '#00A651';
  const buttonColor = settings.primary_button_color || '#006C35';
  const headerTitle = isRTL ? template.header_title_ar : template.header_title_en;
  const ctaText = isRTL ? template.cta_text_ar : template.cta_text_en;
  const logoUrl = settings.logo_url || 'https://saudiinnovates.sa/logo.png';
  const contactEmail = settings.footer_contact_email || 'support@saudiinnovates.sa';
  const address = settings.footer_address || 'Riyadh, Saudi Arabia';
  
  let html = `
<!DOCTYPE html>
<html lang="${language}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headerTitle || 'Saudi Innovates'}</title>
  <style>
    body { margin: 0; padding: 0; font-family: ${fontFamily}; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, ${gradientStart}, ${gradientEnd}); padding: 32px; text-align: center; }
    .header img { height: 48px; margin-bottom: 16px; }
    .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 600; }
    .body { padding: 32px; background: #ffffff; line-height: 1.6; color: #333333; }
    .body p { margin: 0 0 16px 0; }
    .body ul { margin: 0 0 16px 0; padding-${isRTL ? 'right' : 'left'}: 24px; }
    .body li { margin-bottom: 8px; }
    .cta-button { display: inline-block; background: ${buttonColor}; color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 16px 0; }
    .footer { background: #f8f9fa; padding: 24px; text-align: center; color: #666666; font-size: 12px; }
    .footer a { color: #006C35; text-decoration: none; }
    .social-links { margin-bottom: 16px; }
    .social-links a { margin: 0 8px; }
  </style>
</head>
<body>
  <div class="container">`;

  // Header
  if (template.use_header !== false) {
    html += `
    <div class="header">
      <img src="${logoUrl}" alt="Saudi Innovates">
      ${headerTitle ? `<h1>${headerTitle}</h1>` : ''}
    </div>`;
  }

  // Body
  html += `
    <div class="body">
      ${body}`;
  
  // CTA Button
  if (ctaText && template.cta_url_variable) {
    html += `
      <div style="text-align: center; margin-top: 24px;">
        <a href="{{${template.cta_url_variable}}}" class="cta-button">${ctaText}</a>
      </div>`;
  }
  
  html += `
    </div>`;

  // Footer
  if (template.use_footer !== false) {
    const socialLinks = settings.footer_social_links as Record<string, string> || {};
    html += `
    <div class="footer">
      <div class="social-links">
        ${socialLinks.twitter ? `<a href="${socialLinks.twitter}">Twitter</a>` : ''}
        ${socialLinks.linkedin ? `<a href="${socialLinks.linkedin}">LinkedIn</a>` : ''}
      </div>
      <p>${contactEmail}</p>
      <p>© ${new Date().getFullYear()} Saudi Innovates. ${isRTL ? 'جميع الحقوق محفوظة' : 'All rights reserved'}.</p>
      <p>${address}</p>
    </div>`;
  }

  html += `
  </div>
</body>
</html>`;

  return html;
}

// Interpolate variables in text
function interpolate(text: string, variables: Record<string, string>): string {
  let result = text;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value || '');
  }
  return result;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured - email not sent");
      return new Response(
        JSON.stringify({ success: false, message: "Email service not configured." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const request: EmailRequest = await req.json();
    const resend = new Resend(RESEND_API_KEY);
    
    // Initialize Supabase client for template fetching
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    let toAddresses: string[];
    let subject: string;
    let htmlContent: string;
    let templateId: string | null = null;
    let language: 'en' | 'ar' = request.language || 'en';

    // Option 1: Template-based email
    if (request.template_key) {
      console.log("Using template:", request.template_key);
      
      // Fetch template
      const { data: template, error: templateError } = await supabase
        .from('email_templates')
        .select('*')
        .eq('template_key', request.template_key)
        .eq('is_active', true)
        .single();
      
      if (templateError || !template) {
        console.error("Template not found:", request.template_key);
        return new Response(
          JSON.stringify({ success: false, error: `Template not found: ${request.template_key}` }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      templateId = template.id;
      
      // Check user preferences (unless critical or force_send)
      const isCritical = template.is_critical || CRITICAL_TEMPLATES.includes(request.template_key);
      
      if (!isCritical && !request.force_send && request.recipient_user_id) {
        // Check user preferences
        const { data: prefs } = await supabase
          .from('user_notification_preferences')
          .select('email_enabled, email_categories')
          .eq('user_id', request.recipient_user_id)
          .single();
        
        if (prefs) {
          // Check master switch
          if (prefs.email_enabled === false) {
            console.log("User has disabled emails");
            return new Response(
              JSON.stringify({ success: false, skipped: true, reason: "User disabled emails" }),
              { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          
          // Check category preference
          const categories = prefs.email_categories as Record<string, boolean> || {};
          if (template.preference_category && categories[template.preference_category] === false) {
            console.log("User disabled this email category:", template.preference_category);
            return new Response(
              JSON.stringify({ success: false, skipped: true, reason: `User disabled ${template.preference_category} emails` }),
              { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
        
        // Get user's language preference
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('preferred_language')
          .eq('user_id', request.recipient_user_id)
          .single();
        
        if (profile?.preferred_language) {
          language = profile.preferred_language as 'en' | 'ar';
        }
      }
      
      // Fetch settings
      const { data: settingsRows } = await supabase
        .from('email_settings')
        .select('setting_key, setting_value');
      
      const settings: EmailSettings = {};
      settingsRows?.forEach(row => {
        try {
          settings[row.setting_key] = typeof row.setting_value === 'string' 
            ? JSON.parse(row.setting_value) 
            : row.setting_value;
        } catch {
          settings[row.setting_key] = row.setting_value;
        }
      });
      
      // Get content based on language
      const rawSubject = language === 'ar' && template.subject_ar ? template.subject_ar : template.subject_en;
      const rawBody = language === 'ar' && template.body_ar ? template.body_ar : template.body_en;
      
      // Interpolate variables
      const variables = request.variables || {};
      subject = interpolate(rawSubject, variables);
      const interpolatedBody = interpolate(rawBody, variables);
      
      // Build HTML if needed
      if (template.is_html) {
        htmlContent = buildHtmlEmail(template, settings, interpolatedBody, language);
        // Interpolate any remaining variables in HTML (like CTA URL)
        htmlContent = interpolate(htmlContent, variables);
      } else {
        htmlContent = interpolatedBody;
      }
      
      toAddresses = request.recipient_email ? [request.recipient_email] : [];
      
    } else {
      // Option 2: Direct content (backward compatibility)
      toAddresses = request.to ? (Array.isArray(request.to) ? request.to : [request.to]) : [];
      subject = request.subject || 'No Subject';
      htmlContent = request.html || request.body || '';
    }
    
    if (toAddresses.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "No recipient specified" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log("Sending email to:", toAddresses, "Subject:", subject);

    // Send email via Resend
    const response = await resend.emails.send({
      from: "Saudi Innovates <onboarding@resend.dev>",
      to: toAddresses,
      subject: subject,
      html: htmlContent,
    });

    console.log("Resend response:", response);
    
    // Log the email
    if (request.template_key) {
      await supabase.from('email_logs').insert({
        template_id: templateId,
        template_key: request.template_key,
        recipient_email: toAddresses[0],
        recipient_user_id: request.recipient_user_id,
        subject: subject,
        body_preview: htmlContent.substring(0, 500),
        language: language,
        variables_used: request.variables,
        status: response.error ? 'failed' : 'sent',
        sent_at: response.error ? null : new Date().toISOString(),
        error_message: response.error?.message,
        entity_type: request.entity_type,
        entity_id: request.entity_id,
        triggered_by: request.triggered_by || 'system'
      });
    }

    if (response.error) {
      console.error("Resend API error:", response.error);
      return new Response(
        JSON.stringify({ success: false, error: response.error }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Email sent successfully:", response.data);
    return new Response(
      JSON.stringify({ success: true, id: response.data?.id }),
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