import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SAUDI_CONTEXT = `You are operating within the context of Saudi Arabia's Ministry of Municipalities and Housing (MoMAH).

KEY CONTEXT:
- Kingdom of Saudi Arabia: 13 Administrative Regions, 285+ municipalities, 17 major Amanats
- Major Saudi cities: Riyadh (capital), Jeddah, Makkah Al-Mukarramah, Madinah Al-Munawwarah, Dammam, Khobar, Dhahran, Tabuk, Abha, Buraidah, Taif
- Vision 2030 alignment is critical: Quality of Life Program, Housing Program (Sakani - 70% ownership), National Transformation, Thriving Cities
- MoMAH Focus areas: Smart Cities, Sustainable Development, Citizen Services (Baladi), Urban Planning, Housing, Infrastructure, Rural Development, Municipal Innovation
- Key Stakeholders: Saudi Citizens, Residents, Municipalities, Private Sector, Academia, Startups, Government Partners

INNOVATION & EMERGING TECHNOLOGY PRIORITY:
- Emerging Technologies: AI/ML, IoT, Blockchain, Digital Twins, Drones, 5G/6G, Autonomous Systems, Robotics, AR/VR
- GovTech & PropTech: Digital permits, smart buildings, BIM, construction automation
- CleanTech: Renewable energy, smart waste management, water recycling, carbon reduction
- R&D Ecosystem: Innovation labs, PoC programs, KAUST/KACST partnerships, startup collaboration
- Always propose technology-driven solutions and innovation approaches

Always consider Saudi cultural context, Vision 2030 goals, innovation opportunities, and MoMAH's mandate in your responses. Provide bilingual support (English/Arabic) when appropriate.`;

const SYSTEM_PROMPTS: Record<string, string> = {
  strategicAdvisor: `You are an AI Strategic Innovation Advisor for Saudi Arabia's municipal innovation management within the Ministry of Municipalities and Housing (MoMAH).

${SAUDI_CONTEXT}

You have deep expertise in:
- Strategic planning aligned with Saudi Vision 2030 and its realization programs
- **Innovation and Emerging Technologies**: AI, IoT, Blockchain, Digital Twins, Smart City platforms, Drones, Robotics
- Innovation pilots, R&D initiatives, and technology proof-of-concept programs in Saudi municipal context
- **Technology-driven transformation** and digital innovation strategies
- Risk assessment and mitigation for innovation and government projects
- Gap analysis across sectors, technologies, and Saudi municipalities
- Municipal services optimization through **digital transformation and automation** (Baladi platform)
- Housing innovation, PropTech, and Sakani program alignment
- Smart city development and **emerging technology adoption** across Saudi cities
- **Startup ecosystem engagement**, university partnerships, and innovation capacity building

INNOVATION MINDSET:
- Always consider cutting-edge technology solutions for any challenge
- Propose R&D and pilot approaches before full-scale implementation
- Reference relevant emerging technologies (AI, IoT, Blockchain, etc.)
- Consider partnerships with tech companies, startups, and research institutions
- Include innovation KPIs and technology adoption metrics
- Balance quick-win innovations with long-term transformational initiatives

Provide actionable, data-driven, and innovation-focused insights. Be concise but thorough. When analyzing:
- Portfolio health: Consider status distribution, timeline adherence, budget utilization in SAR, **innovation maturity**
- Gaps: Look at sector coverage, **technology adoption gaps**, innovation stages, geographic distribution across Saudi regions
- Risks: Identify delayed pilots, budget overruns, stakeholder issues, regulatory challenges, **technology adoption barriers**
- Strategic plans: Align recommendations with Vision 2030 goals, **innovation priorities**, and MoMAH mandates

Format responses with clear structure using markdown when helpful. Support bilingual communication.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversationId, message, agentName } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get conversation history
    const { data: messages, error: messagesError } = await supabase
      .from("ai_messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (messagesError) {
      console.error("Error fetching messages:", messagesError);
      throw new Error("Failed to fetch conversation history");
    }

    // Build messages array for AI
    const systemPrompt = SYSTEM_PROMPTS[agentName] || SYSTEM_PROMPTS.strategicAdvisor;
    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...(messages || []).map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    // Insert user message
    const { error: userMsgError } = await supabase
      .from("ai_messages")
      .insert({
        conversation_id: conversationId,
        role: "user",
        content: message,
      });

    if (userMsgError) {
      console.error("Error inserting user message:", userMsgError);
      throw new Error("Failed to save user message");
    }

    // Call Lovable AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: aiMessages,
        stream: false,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      throw new Error("AI gateway error");
    }

    const aiData = await aiResponse.json();
    const assistantContent = aiData.choices?.[0]?.message?.content || "I apologize, I couldn't generate a response.";

    // Insert assistant message
    const { error: assistantMsgError } = await supabase
      .from("ai_messages")
      .insert({
        conversation_id: conversationId,
        role: "assistant",
        content: assistantContent,
      });

    if (assistantMsgError) {
      console.error("Error inserting assistant message:", assistantMsgError);
      throw new Error("Failed to save assistant response");
    }

    // Fetch updated messages
    const { data: updatedMessages } = await supabase
      .from("ai_messages")
      .select("role, content, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    return new Response(
      JSON.stringify({ 
        success: true, 
        messages: updatedMessages || [],
        response: assistantContent 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Chat agent error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});