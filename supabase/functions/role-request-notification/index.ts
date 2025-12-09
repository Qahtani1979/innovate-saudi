import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RoleRequestNotification {
  type: 'submitted' | 'approved' | 'rejected';
  request_id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  requested_role: string;
  justification?: string;
  rejection_reason?: string;
  language?: string;
  notify_admins?: boolean;
}

const getRoleDisplayName = (role: string, lang: string = 'en') => {
  const roles: Record<string, { en: string; ar: string }> = {
    municipality_staff: { en: 'Municipality Staff', ar: 'موظف بلدية' },
    provider: { en: 'Solution Provider', ar: 'مزود حلول' },
    researcher: { en: 'Researcher', ar: 'باحث' },
    expert: { en: 'Expert Evaluator', ar: 'خبير مُقيّم' },
    citizen: { en: 'Citizen', ar: 'مواطن' },
    viewer: { en: 'Explorer', ar: 'مستكشف' }
  };
  return roles[role]?.[lang as 'en' | 'ar'] || role;
};

const getEmailContent = (
  type: string,
  userName: string,
  roleName: string,
  lang: string = 'en',
  rejectionReason?: string
) => {
  const isArabic = lang === 'ar';

  if (type === 'submitted') {
    return {
      subject: isArabic
        ? `تم استلام طلب الدور - ${roleName}`
        : `Role Request Received - ${roleName}`,
      html: `
<!DOCTYPE html>
<html dir="${isArabic ? 'rtl' : 'ltr'}" lang="${lang}">
<head><meta charset="UTF-8"><style>
  body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #f8fafc; padding: 40px 20px; }
  .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
  .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 16px 16px 0 0; }
  .header h1 { color: white; margin: 0; font-size: 24px; }
  .content { padding: 30px; }
  .status-badge { display: inline-block; background: #fef3c7; color: #d97706; padding: 8px 16px; border-radius: 20px; font-weight: 600; margin: 15px 0; }
  .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 12px; border-radius: 0 0 16px 16px; }
</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>${isArabic ? '⏳ طلب الدور قيد المراجعة' : '⏳ Role Request Under Review'}</h1>
    </div>
    <div class="content">
      <p>${isArabic ? `مرحباً ${userName}،` : `Hello ${userName},`}</p>
      <span class="status-badge">${isArabic ? 'قيد المراجعة' : 'Pending Review'}</span>
      <p>${isArabic
        ? `تم استلام طلبك للحصول على دور "${roleName}". سيقوم فريقنا بمراجعته وإعلامك بالنتيجة.`
        : `Your request for the "${roleName}" role has been received. Our team will review it and notify you of the outcome.`
      }</p>
      <p>${isArabic ? 'عادة ما تستغرق المراجعة 1-3 أيام عمل.' : 'Reviews typically take 1-3 business days.'}</p>
    </div>
    <div class="footer">
      <p>© 2024 Saudi Innovation Platform</p>
    </div>
  </div>
</body>
</html>`
    };
  }

  if (type === 'approved') {
    return {
      subject: isArabic
        ? `🎉 تمت الموافقة على طلب الدور - ${roleName}`
        : `🎉 Role Request Approved - ${roleName}`,
      html: `
<!DOCTYPE html>
<html dir="${isArabic ? 'rtl' : 'ltr'}" lang="${lang}">
<head><meta charset="UTF-8"><style>
  body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #f8fafc; padding: 40px 20px; }
  .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
  .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 16px 16px 0 0; }
  .header h1 { color: white; margin: 0; font-size: 24px; }
  .content { padding: 30px; }
  .status-badge { display: inline-block; background: #d1fae5; color: #059669; padding: 8px 16px; border-radius: 20px; font-weight: 600; margin: 15px 0; }
  .cta-button { display: block; background: linear-gradient(135deg, #10b981, #059669); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; text-align: center; font-weight: 600; margin: 20px 0; }
  .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 12px; border-radius: 0 0 16px 16px; }
</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>${isArabic ? '🎉 تمت الموافقة!' : '🎉 Approved!'}</h1>
    </div>
    <div class="content">
      <p>${isArabic ? `مرحباً ${userName}،` : `Hello ${userName},`}</p>
      <span class="status-badge">${isArabic ? 'تمت الموافقة' : 'Approved'}</span>
      <p>${isArabic
        ? `تهانينا! تمت الموافقة على طلبك للحصول على دور "${roleName}". يمكنك الآن الوصول إلى جميع الميزات المرتبطة بهذا الدور.`
        : `Congratulations! Your request for the "${roleName}" role has been approved. You can now access all features associated with this role.`
      }</p>
      <a href="${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovable.app')}" class="cta-button">
        ${isArabic ? '🚀 الذهاب إلى لوحة التحكم' : '🚀 Go to Dashboard'}
      </a>
    </div>
    <div class="footer">
      <p>© 2024 Saudi Innovation Platform</p>
    </div>
  </div>
</body>
</html>`
    };
  }

  // rejected
  return {
    subject: isArabic
      ? `طلب الدور يحتاج مراجعة - ${roleName}`
      : `Role Request Needs Attention - ${roleName}`,
    html: `
<!DOCTYPE html>
<html dir="${isArabic ? 'rtl' : 'ltr'}" lang="${lang}">
<head><meta charset="UTF-8"><style>
  body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #f8fafc; padding: 40px 20px; }
  .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
  .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center; border-radius: 16px 16px 0 0; }
  .header h1 { color: white; margin: 0; font-size: 24px; }
  .content { padding: 30px; }
  .status-badge { display: inline-block; background: #fee2e2; color: #dc2626; padding: 8px 16px; border-radius: 20px; font-weight: 600; margin: 15px 0; }
  .reason-box { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 8px; margin: 15px 0; }
  .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 12px; border-radius: 0 0 16px 16px; }
</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>${isArabic ? 'طلب الدور' : 'Role Request Update'}</h1>
    </div>
    <div class="content">
      <p>${isArabic ? `مرحباً ${userName}،` : `Hello ${userName},`}</p>
      <span class="status-badge">${isArabic ? 'يحتاج مراجعة' : 'Needs Review'}</span>
      <p>${isArabic
        ? `للأسف، لم نتمكن من الموافقة على طلبك للحصول على دور "${roleName}" في هذا الوقت.`
        : `Unfortunately, we were unable to approve your request for the "${roleName}" role at this time.`
      }</p>
      ${rejectionReason ? `
      <div class="reason-box">
        <strong>${isArabic ? 'السبب:' : 'Reason:'}</strong>
        <p>${rejectionReason}</p>
      </div>
      ` : ''}
      <p>${isArabic
        ? 'يمكنك تقديم طلب جديد مع معلومات إضافية أو التواصل مع الدعم.'
        : 'You may submit a new request with additional information or contact support for assistance.'
      }</p>
    </div>
    <div class="footer">
      <p>© 2024 Saudi Innovation Platform</p>
    </div>
  </div>
</body>
</html>`
  };
};

const getAdminNotificationEmail = (
  userName: string,
  userEmail: string,
  roleName: string,
  justification: string
) => {
  return {
    subject: `🔔 New Role Request: ${roleName} - ${userName}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><style>
  body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #f8fafc; padding: 40px 20px; }
  .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
  .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center; border-radius: 16px 16px 0 0; }
  .header h1 { color: white; margin: 0; font-size: 24px; }
  .content { padding: 30px; }
  .info-box { background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 15px 0; }
  .cta-button { display: block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; text-align: center; font-weight: 600; margin: 20px 0; }
  .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 12px; border-radius: 0 0 16px 16px; }
</style></head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔔 New Role Request</h1>
    </div>
    <div class="content">
      <p>A new role request requires your review:</p>
      <div class="info-box">
        <p><strong>User:</strong> ${userName}</p>
        <p><strong>Email:</strong> ${userEmail}</p>
        <p><strong>Requested Role:</strong> ${roleName}</p>
        <p><strong>Justification:</strong></p>
        <p style="font-style: italic;">${justification || 'No justification provided'}</p>
      </div>
      <a href="${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovable.app')}/AdminDashboard" class="cta-button">
        Review in Admin Dashboard
      </a>
    </div>
    <div class="footer">
      <p>Saudi Innovation Platform - Admin Notification</p>
    </div>
  </div>
</body>
</html>`
  };
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, message: "Email service not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(RESEND_API_KEY);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const {
      type,
      request_id,
      user_id,
      user_email,
      user_name,
      requested_role,
      justification,
      rejection_reason,
      language = 'en',
      notify_admins = true
    }: RoleRequestNotification = await req.json();

    console.log(`Processing role notification: ${type} for ${user_email} - ${requested_role}`);

    const roleName = getRoleDisplayName(requested_role, language);
    const { subject, html } = getEmailContent(type, user_name, roleName, language, rejection_reason);

    // Send email to user
    const { error: emailError } = await resend.emails.send({
      from: "Saudi Innovates <onboarding@resend.dev>",
      to: [user_email],
      subject,
      html,
    });

    if (emailError) {
      console.error("User email error:", emailError);
    }

    // Create in-app notification for user
    await supabase.from('citizen_notifications').insert({
      user_id,
      user_email,
      notification_type: `role_request_${type}`,
      title: type === 'submitted' 
        ? (language === 'ar' ? 'تم استلام طلب الدور' : 'Role Request Received')
        : type === 'approved'
          ? (language === 'ar' ? 'تمت الموافقة على طلب الدور' : 'Role Request Approved')
          : (language === 'ar' ? 'تحديث طلب الدور' : 'Role Request Update'),
      message: type === 'approved'
        ? (language === 'ar' ? `تمت الموافقة على دور ${roleName}` : `Your ${roleName} role has been approved`)
        : type === 'rejected'
          ? (language === 'ar' ? `طلب دور ${roleName} يحتاج مراجعة` : `Your ${roleName} role request needs attention`)
          : (language === 'ar' ? `طلب دور ${roleName} قيد المراجعة` : `Your ${roleName} role request is under review`),
      entity_type: 'role_request',
      entity_id: request_id,
      metadata: { role: requested_role, status: type }
    });

    // Notify admins for new submissions
    if (type === 'submitted' && notify_admins) {
      // Get admin emails
      const { data: admins } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (admins && admins.length > 0) {
        const { data: adminProfiles } = await supabase
          .from('user_profiles')
          .select('user_email')
          .in('user_id', admins.map(a => a.user_id));

        if (adminProfiles) {
          const adminEmail = getAdminNotificationEmail(user_name, user_email, roleName, justification || '');
          
          for (const admin of adminProfiles) {
            if (admin.user_email) {
              await resend.emails.send({
                from: "Saudi Innovates <onboarding@resend.dev>",
                to: [admin.user_email],
                subject: adminEmail.subject,
                html: adminEmail.html,
              });
            }
          }
        }
      }
    }

    console.log(`Role notification sent successfully for ${type}`);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in role-request-notification:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});