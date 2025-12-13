import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DigestItem {
  id: string;
  trigger_key: string;
  template_key: string;
  entity_type: string;
  entity_id: string;
  variables: Record<string, any>;
  created_at: string;
}

interface GroupedDigest {
  user_email: string;
  language: string;
  items: DigestItem[];
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json().catch(() => ({}));
    const digestType = body.digest_type || "daily"; // 'daily' or 'weekly'
    const dryRun = body.dry_run || false;

    console.log(`[digest-processor] Starting ${digestType} digest processing, dry_run=${dryRun}`);

    // Get all pending digest items for this digest type
    const { data: pendingItems, error: fetchError } = await supabase
      .from("email_digest_queue")
      .select("*")
      .eq("digest_type", digestType)
      .is("processed_at", null)
      .order("user_email")
      .order("created_at", { ascending: true });

    if (fetchError) {
      console.error("[digest-processor] Error fetching pending items:", fetchError);
      throw fetchError;
    }

    if (!pendingItems || pendingItems.length === 0) {
      console.log("[digest-processor] No pending digest items found");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No pending digest items",
          processed: 0 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[digest-processor] Found ${pendingItems.length} pending items`);

    // Group items by user
    const userDigests: Map<string, GroupedDigest> = new Map();
    
    for (const item of pendingItems) {
      const key = item.user_email;
      if (!userDigests.has(key)) {
        userDigests.set(key, {
          user_email: item.user_email,
          language: item.language || "en",
          items: [],
        });
      }
      userDigests.get(key)!.items.push({
        id: item.id,
        trigger_key: item.trigger_key,
        template_key: item.template_key,
        entity_type: item.entity_type,
        entity_id: item.entity_id,
        variables: item.variables,
        created_at: item.created_at,
      });
    }

    console.log(`[digest-processor] Grouped into ${userDigests.size} user digests`);

    const results = {
      processed: 0,
      sent: 0,
      failed: 0,
      users: [] as string[],
    };

    // Process each user's digest
    for (const [userEmail, digest] of userDigests) {
      try {
        // Generate digest ID for tracking
        const digestId = crypto.randomUUID();

        // Build digest content
        const digestContent = buildDigestContent(digest.items, digestType);

        // Get the appropriate digest template
        const templateKey = digestType === "weekly" ? "digest_weekly" : "digest_daily";

        if (!dryRun) {
          // Send the digest email
          const { error: sendError } = await supabase.functions.invoke("send-email", {
            body: {
              to: userEmail,
              template_key: templateKey,
              language: digest.language,
              variables: {
                userName: userEmail.split("@")[0],
                digestPeriod: digestType === "weekly" ? "This Week" : "Today",
                notificationCount: digest.items.length.toString(),
                digestContent: digestContent,
                digestItems: JSON.stringify(digest.items),
                unsubscribeUrl: `${supabaseUrl}/functions/v1/unsubscribe?email=${encodeURIComponent(userEmail)}&category=digest`,
              },
            },
          });

          if (sendError) {
            console.error(`[digest-processor] Failed to send digest to ${userEmail}:`, sendError);
            results.failed++;
            continue;
          }

          // Mark items as processed
          const itemIds = digest.items.map((i) => i.id);
          await supabase
            .from("email_digest_queue")
            .update({
              processed_at: new Date().toISOString(),
              digest_id: digestId,
            })
            .in("id", itemIds);

          results.sent++;
        }

        results.users.push(userEmail);
        results.processed += digest.items.length;
      } catch (userError) {
        console.error(`[digest-processor] Error processing digest for ${userEmail}:`, userError);
        results.failed++;
      }
    }

    console.log(`[digest-processor] Completed: ${results.sent} sent, ${results.failed} failed, ${results.processed} items processed`);

    return new Response(
      JSON.stringify({
        success: true,
        digest_type: digestType,
        dry_run: dryRun,
        ...results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[digest-processor] Error:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildDigestContent(items: DigestItem[], digestType: string): string {
  // Group items by category/trigger type
  const groups: Record<string, DigestItem[]> = {};
  
  for (const item of items) {
    const category = item.trigger_key.split(".")[0];
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
  }

  // Build HTML content for digest
  let html = "";
  
  const categoryLabels: Record<string, string> = {
    challenge: "🎯 Challenges",
    pilot: "🧪 Pilots",
    solution: "💡 Solutions",
    program: "📚 Programs",
    task: "✅ Tasks",
    event: "📅 Events",
    role: "👤 Roles",
    contract: "📝 Contracts",
    evaluation: "📊 Evaluations",
    citizen: "🏛️ Citizen Engagement",
  };

  for (const [category, categoryItems] of Object.entries(groups)) {
    const label = categoryLabels[category] || `📌 ${category.charAt(0).toUpperCase() + category.slice(1)}`;
    
    html += `<div style="margin-bottom: 24px;">`;
    html += `<h3 style="font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 12px;">${label}</h3>`;
    html += `<ul style="list-style: none; padding: 0; margin: 0;">`;
    
    for (const item of categoryItems.slice(0, 5)) { // Limit to 5 per category
      const title = item.variables?.title || item.variables?.entityTitle || item.variables?.challengeTitle || item.variables?.pilotTitle || item.trigger_key;
      const action = item.trigger_key.split(".")[1]?.replace(/_/g, " ") || "update";
      
      html += `<li style="padding: 8px 12px; background: #f8fafc; border-radius: 6px; margin-bottom: 8px; border-left: 3px solid #3b82f6;">`;
      html += `<span style="font-weight: 500; color: #1e293b;">${title}</span>`;
      html += `<span style="color: #64748b; font-size: 13px;"> — ${action}</span>`;
      html += `</li>`;
    }
    
    if (categoryItems.length > 5) {
      html += `<li style="padding: 8px 12px; color: #64748b; font-size: 13px;">+ ${categoryItems.length - 5} more ${category} notifications</li>`;
    }
    
    html += `</ul></div>`;
  }

  return html;
}
