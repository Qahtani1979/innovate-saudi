import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  userId: string;
  userEmail: string;
  userName: string;
  persona: string;
  language?: string;
}

const getEmailContent = (userName: string, persona: string, language: string = 'en') => {
  const isArabic = language === 'ar';
  
  const personaInfo: Record<string, { title: { en: string; ar: string }; benefits: { en: string[]; ar: string[] }; nextSteps: { en: string[]; ar: string[] } }> = {
    municipality_staff: {
      title: { en: 'Municipality Staff', ar: 'موظف البلدية' },
      benefits: {
        en: ['Submit and track innovation challenges', 'Collaborate with solution providers', 'Access pilot programs and funding'],
        ar: ['تقديم وتتبع تحديات الابتكار', 'التعاون مع مزودي الحلول', 'الوصول إلى البرامج التجريبية والتمويل']
      },
      nextSteps: {
        en: ['Complete your municipality profile', 'Submit your first challenge', 'Explore available solutions'],
        ar: ['أكمل ملف البلدية', 'قدم أول تحدي', 'استكشف الحلول المتاحة']
      }
    },
    provider: {
      title: { en: 'Solution Provider', ar: 'مزود الحلول' },
      benefits: {
        en: ['Discover municipal challenges', 'Submit innovative solutions', 'Participate in pilot programs'],
        ar: ['اكتشف تحديات البلديات', 'قدم حلولاً مبتكرة', 'شارك في البرامج التجريبية']
      },
      nextSteps: {
        en: ['Complete your startup profile', 'Browse open challenges', 'Submit your first proposal'],
        ar: ['أكمل ملف شركتك الناشئة', 'تصفح التحديات المفتوحة', 'قدم أول مقترح']
      }
    },
    researcher: {
      title: { en: 'Researcher', ar: 'باحث' },
      benefits: {
        en: ['Access R&D opportunities', 'Collaborate on urban innovation research', 'Join living labs and testbeds'],
        ar: ['الوصول إلى فرص البحث والتطوير', 'التعاون في أبحاث الابتكار الحضري', 'الانضمام إلى مختبرات التجريب']
      },
      nextSteps: {
        en: ['Complete your researcher profile', 'Explore R&D calls', 'Connect with municipalities'],
        ar: ['أكمل ملف الباحث', 'استكشف دعوات البحث والتطوير', 'تواصل مع البلديات']
      }
    },
    citizen: {
      title: { en: 'Citizen', ar: 'مواطن' },
      benefits: {
        en: ['Submit innovative ideas', 'Vote on community initiatives', 'Participate in pilot programs'],
        ar: ['قدم أفكاراً مبتكرة', 'صوت على مبادرات المجتمع', 'شارك في البرامج التجريبية']
      },
      nextSteps: {
        en: ['Explore your community dashboard', 'Submit your first idea', 'Join a pilot program'],
        ar: ['استكشف لوحة مجتمعك', 'قدم أول فكرة', 'انضم إلى برنامج تجريبي']
      }
    },
    expert: {
      title: { en: 'Expert Evaluator', ar: 'خبير مُقيّم' },
      benefits: {
        en: ['Evaluate innovation proposals', 'Shape urban development', 'Share your expertise'],
        ar: ['تقييم مقترحات الابتكار', 'تشكيل التنمية الحضرية', 'شارك خبراتك']
      },
      nextSteps: {
        en: ['Complete your expert profile', 'Review pending evaluations', 'Set your availability'],
        ar: ['أكمل ملف الخبير', 'راجع التقييمات المعلقة', 'حدد توفرك']
      }
    }
  };

  const info = personaInfo[persona] || personaInfo.citizen;
  const lang = isArabic ? 'ar' : 'en';

  const subject = isArabic 
    ? `مرحباً ${userName}! 🚀 مرحباً بك في منصة الابتكار السعودية`
    : `Welcome ${userName}! 🚀 Your Innovation Journey Starts Now`;

  const html = `
<!DOCTYPE html>
<html dir="${isArabic ? 'rtl' : 'ltr'}" lang="${lang}">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; padding: 40px 20px; margin: 0; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0; }
    .content { padding: 40px; }
    .greeting { font-size: 20px; color: #1e293b; margin-bottom: 20px; }
    .role-badge { display: inline-block; background: #ede9fe; color: #6366f1; padding: 8px 16px; border-radius: 20px; font-weight: 600; margin-bottom: 20px; }
    .section { margin: 30px 0; }
    .section h3 { color: #1e293b; margin-bottom: 15px; font-size: 18px; }
    .benefit-list, .step-list { padding: 0; margin: 0; }
    .benefit-list li, .step-list li { list-style: none; padding: 12px 0; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; gap: 12px; }
    .benefit-list li:last-child, .step-list li:last-child { border-bottom: none; }
    .icon { width: 32px; height: 32px; background: #ede9fe; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; }
    .cta-button { display: block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; text-align: center; font-weight: 600; margin: 30px 0; }
    .footer { background: #f8fafc; padding: 30px 40px; text-align: center; color: #64748b; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${isArabic ? '🇸🇦 منصة الابتكار السعودية' : '🇸🇦 Saudi Innovation Platform'}</h1>
      <p>${isArabic ? 'تحويل المدن من خلال الابتكار' : 'Transforming Cities Through Innovation'}</p>
    </div>
    <div class="content">
      <p class="greeting">${isArabic ? `مرحباً ${userName}،` : `Hello ${userName},`}</p>
      
      <span class="role-badge">${info.title[lang]}</span>
      
      <p>${isArabic 
        ? 'مرحباً بك في منصة الابتكار البلدي! حسابك جاهز وأنت الآن جزء من مجتمع يشكل مستقبل المدن الذكية.'
        : 'Welcome to the Municipal Innovation Platform! Your account is ready and you\'re now part of a community shaping the future of smart cities.'
      }</p>
      
      <div class="section">
        <h3>${isArabic ? '✨ ما يمكنك فعله' : '✨ What You Can Do'}</h3>
        <ul class="benefit-list">
          ${info.benefits[lang].map((b, i) => `<li><span class="icon">${['🎯', '🤝', '🚀'][i]}</span>${b}</li>`).join('')}
        </ul>
      </div>
      
      <div class="section">
        <h3>${isArabic ? '📋 خطواتك التالية' : '📋 Your Next Steps'}</h3>
        <ul class="step-list">
          ${info.nextSteps[lang].map((s, i) => `<li><span class="icon">${i + 1}</span>${s}</li>`).join('')}
        </ul>
      </div>
      
      <a href="${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovable.app')}" class="cta-button">
        ${isArabic ? '🚀 ابدأ الآن' : '🚀 Get Started Now'}
      </a>
    </div>
    <div class="footer">
      <p>${isArabic ? 'هذه رسالة آلية. لا ترد على هذا البريد.' : 'This is an automated message. Please do not reply to this email.'}</p>
      <p>© 2024 Saudi Innovation Platform</p>
    </div>
  </div>
</body>
</html>`;

  return { subject, html };
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, message: "Email service not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { userId, userEmail, userName, persona, language = 'en' }: WelcomeEmailRequest = await req.json();
    
    console.log("Sending welcome email to:", userEmail, "Persona:", persona);

    // Generate email content
    const { subject, html } = getEmailContent(userName, persona, language);

    // Send email via Resend
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Saudi Innovates <onboarding@resend.dev>",
        to: [userEmail],
        subject: subject,
        html: html,
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

    // Log the email in database
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      await supabase.from('welcome_emails_sent').insert({
        user_id: userId,
        user_email: userEmail,
        persona: persona,
        email_type: 'welcome',
        subject: subject,
        status: 'sent',
        metadata: { resend_id: result.id }
      });
    }

    console.log("Welcome email sent successfully:", result);
    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});