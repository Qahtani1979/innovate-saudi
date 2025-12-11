import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// This function uses service role key internally - no auth needed

// Test users covering all personas with relevant domain patterns
const TEST_USERS = [
  // Municipality Staff (gov.sa domains)
  { email: "mohammed.ali@riyadh.gov.sa", name: "Mohammed Ali", name_ar: "محمد علي", persona: "municipality", org: "Riyadh Municipality" },
  { email: "fatima.ahmed@jeddah.gov.sa", name: "Fatima Ahmed", name_ar: "فاطمة أحمد", persona: "municipality", org: "Jeddah Municipality" },
  { email: "abdullah.salem@dammam.gov.sa", name: "Abdullah Salem", name_ar: "عبدالله سالم", persona: "municipality", org: "Dammam Municipality" },
  
  // Deputyship (momrah.gov.sa domain)
  { email: "khalid.nasser@momrah.gov.sa", name: "Khalid Nasser", name_ar: "خالد ناصر", persona: "deputyship", org: "Ministry of Municipal Affairs" },
  { email: "sara.abdullah@momrah.gov.sa", name: "Sara Abdullah", name_ar: "سارة عبدالله", persona: "deputyship", org: "Ministry of Municipal Affairs" },
  
  // Executive / GDISB
  { email: "ahmad.executive@gdisb.gov.sa", name: "Ahmad Al-Rashid", name_ar: "أحمد الراشد", persona: "executive", org: "GDISB" },
  { email: "noura.strategic@gdisb.gov.sa", name: "Noura Al-Faisal", name_ar: "نورة الفيصل", persona: "executive", org: "GDISB" },
  
  // Solution Providers (tech domains)
  { email: "omar.founder@techstartup.com", name: "Omar Hassan", name_ar: "عمر حسن", persona: "provider", org: "TechStartup Inc" },
  { email: "layla.ceo@innovate.sa", name: "Layla Khalid", name_ar: "ليلى خالد", persona: "provider", org: "Innovate SA" },
  { email: "yusuf.tech@smartcity.io", name: "Yusuf Ahmed", name_ar: "يوسف أحمد", persona: "provider", org: "SmartCity Solutions" },
  
  // Experts
  { email: "dr.hassan@expert.sa", name: "Dr. Hassan Ibrahim", name_ar: "د. حسن إبراهيم", persona: "expert", org: "Independent Expert" },
  { email: "prof.aisha@consultant.sa", name: "Prof. Aisha Mohammed", name_ar: "أ.د عائشة محمد", persona: "expert", org: "Urban Planning Consultant" },
  
  // Researchers (edu.sa domains)
  { email: "dr.salem@kau.edu.sa", name: "Dr. Salem Al-Otaibi", name_ar: "د. سالم العتيبي", persona: "researcher", org: "King Abdulaziz University" },
  { email: "dr.maha@kfupm.edu.sa", name: "Dr. Maha Al-Ghamdi", name_ar: "د. مها الغامدي", persona: "researcher", org: "KFUPM" },
  { email: "researcher.ali@psu.edu.sa", name: "Ali Mahmoud", name_ar: "علي محمود", persona: "researcher", org: "Prince Sultan University" },
  
  // Citizens (personal emails)
  { email: "citizen.test1@gmail.com", name: "Saad Al-Dosari", name_ar: "سعد الدوسري", persona: "citizen", org: null },
  { email: "citizen.test2@outlook.com", name: "Huda Al-Qahtani", name_ar: "هدى القحطاني", persona: "citizen", org: null },
  { email: "citizen.test3@yahoo.com", name: "Turki Al-Harbi", name_ar: "تركي الحربي", persona: "citizen", org: null },
  
  // Investors
  { email: "investor.waleed@ventures.sa", name: "Waleed Al-Saud", name_ar: "وليد آل سعود", persona: "investor", org: "Saudi Ventures" },
  
  // Ministry Officials
  { email: "official.ahmad@ministry.gov.sa", name: "Ahmad Al-Zahrani", name_ar: "أحمد الزهراني", persona: "ministry", org: "Ministry of Economy" },
  
  // Moderators
  { email: "moderator.nadia@platform.sa", name: "Nadia Al-Rasheed", name_ar: "نادية الرشيد", persona: "moderator", org: "Platform Team" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const results = [];
    const password = "Aa123456@";

    for (const user of TEST_USERS) {
      try {
        // Check if user already exists
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const exists = existingUsers?.users?.some(u => u.email === user.email);
        
        if (exists) {
          results.push({ email: user.email, status: "already_exists" });
          continue;
        }

        // Create auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          password: password,
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            full_name: user.name,
            full_name_ar: user.name_ar,
            suggested_persona: user.persona,
          }
        });

        if (authError) {
          results.push({ email: user.email, status: "auth_error", error: authError.message });
          continue;
        }

        // Create user profile (without role assignment - for testing role assignment flow)
        const { error: profileError } = await supabaseAdmin
          .from("user_profiles")
          .insert({
            user_id: authData.user.id,
            user_email: user.email,
            full_name: user.name,
            full_name_ar: user.name_ar,
            full_name_en: user.name,
            organization_en: user.org,
            selected_persona: user.persona,
            is_active: true,
            onboarding_completed: false,
            persona_onboarding_completed: false,
          });

        if (profileError) {
          results.push({ email: user.email, status: "profile_error", error: profileError.message, user_id: authData.user.id });
        } else {
          results.push({ email: user.email, status: "created", user_id: authData.user.id, persona: user.persona });
        }
      } catch (e) {
        results.push({ email: user.email, status: "error", error: e instanceof Error ? e.message : String(e) });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Test users seeding completed",
        password: password,
        total: TEST_USERS.length,
        results
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});