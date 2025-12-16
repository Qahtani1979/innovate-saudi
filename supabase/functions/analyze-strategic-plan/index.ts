import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { planData, language = 'en' } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log('Analyzing strategic plan:', planData?.name_en || planData?.name_ar || 'Unnamed');

    // Build comprehensive plan summary for AI analysis
    const planSummary = buildPlanSummary(planData, language);
    
    const systemPrompt = language === 'ar' 
      ? `أنت مستشار استراتيجي خبير متخصص في تقييم وتحليل الخطط الاستراتيجية. قم بتحليل الخطة المقدمة وتقديم تقييم شامل مع توصيات قابلة للتنفيذ. يجب أن تكون استجابتك باللغة العربية.`
      : `You are an expert strategic planning consultant specializing in evaluating and analyzing strategic plans. Analyze the provided plan and give a comprehensive evaluation with actionable recommendations. Respond in English.`;

    const userPrompt = language === 'ar'
      ? `قم بتحليل هذه الخطة الاستراتيجية وقدم تقييماً شاملاً:

${planSummary}

قدم تحليلك بالتنسيق JSON التالي مع المفاتيح الإنجليزية والقيم العربية.`
      : `Analyze this strategic plan and provide a comprehensive evaluation:

${planSummary}

Provide your analysis in the following JSON format.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "strategic_plan_analysis",
              description: "Comprehensive strategic plan analysis with scores and recommendations",
              parameters: {
                type: "object",
                properties: {
                  executive_summary: {
                    type: "object",
                    properties: {
                      overall_score: { type: "number", description: "Overall plan quality score 0-100" },
                      grade: { type: "string", description: "Letter grade: A+, A, B+, B, C+, C, D, F" },
                      verdict: { type: "string", description: "One sentence verdict on plan quality" },
                      readiness_level: { type: "string", enum: ["ready", "needs_minor_changes", "needs_major_changes", "not_ready"] }
                    },
                    required: ["overall_score", "grade", "verdict", "readiness_level"]
                  },
                  scores: {
                    type: "object",
                    properties: {
                      completeness: { type: "number", description: "Score 0-100 for plan completeness" },
                      coherence: { type: "number", description: "Score 0-100 for internal consistency and alignment" },
                      feasibility: { type: "number", description: "Score 0-100 for realistic execution potential" },
                      measurability: { type: "number", description: "Score 0-100 for KPI quality and measurability" },
                      risk_management: { type: "number", description: "Score 0-100 for risk identification and mitigation" },
                      stakeholder_engagement: { type: "number", description: "Score 0-100 for stakeholder analysis" },
                      national_alignment: { type: "number", description: "Score 0-100 for Vision 2030 alignment" },
                      change_readiness: { type: "number", description: "Score 0-100 for change management preparedness" }
                    },
                    required: ["completeness", "coherence", "feasibility", "measurability", "risk_management", "stakeholder_engagement", "national_alignment", "change_readiness"]
                  },
                  strengths: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        area: { type: "string" },
                        description: { type: "string" }
                      },
                      required: ["area", "description"]
                    },
                    description: "Top 3-5 plan strengths"
                  },
                  critical_gaps: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        area: { type: "string" },
                        issue: { type: "string" },
                        recommendation: { type: "string" },
                        priority: { type: "string", enum: ["critical", "high", "medium", "low"] }
                      },
                      required: ["area", "issue", "recommendation", "priority"]
                    },
                    description: "Critical gaps that need addressing"
                  },
                  section_analysis: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        section: { type: "string" },
                        score: { type: "number" },
                        status: { type: "string", enum: ["excellent", "good", "needs_improvement", "missing"] },
                        findings: { type: "array", items: { type: "string" } },
                        recommendations: { type: "array", items: { type: "string" } }
                      },
                      required: ["section", "score", "status", "findings", "recommendations"]
                    },
                    description: "Detailed analysis per section"
                  },
                  smart_kpi_analysis: {
                    type: "object",
                    properties: {
                      total_kpis: { type: "number" },
                      smart_compliant: { type: "number" },
                      issues: { type: "array", items: { type: "string" } }
                    },
                    required: ["total_kpis", "smart_compliant", "issues"]
                  },
                  quick_wins: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-5 quick improvements that can be made immediately"
                  },
                  strategic_recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        impact: { type: "string", enum: ["high", "medium", "low"] },
                        effort: { type: "string", enum: ["high", "medium", "low"] }
                      },
                      required: ["title", "description", "impact", "effort"]
                    },
                    description: "Strategic recommendations for improvement"
                  }
                },
                required: ["executive_summary", "scores", "strengths", "critical_gaps", "section_analysis", "smart_kpi_analysis", "quick_wins", "strategic_recommendations"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "strategic_plan_analysis" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add more credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');
    
    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error("No analysis result from AI");
    }

    const analysis = JSON.parse(toolCall.function.arguments);
    
    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error analyzing strategic plan:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to analyze plan";
    return new Response(JSON.stringify({ 
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function buildPlanSummary(data: any, language: string): string {
  const getText = (en: string, ar: string) => language === 'ar' ? (ar || en) : (en || ar);
  
  const sections: string[] = [];
  
  // Basic info
  sections.push(`## Plan Overview
- Name: ${getText(data.name_en, data.name_ar) || 'Not provided'}
- Description: ${getText(data.description_en, data.description_ar) || 'Not provided'}
- Duration: ${data.start_year || '?'} - ${data.end_year || '?'}
- Budget Range: ${data.budget_range || 'Not specified'}`);

  // Vision & Mission
  sections.push(`## Vision & Mission
- Vision: ${getText(data.vision_en, data.vision_ar) || 'Not provided'}
- Mission: ${getText(data.mission_en, data.mission_ar) || 'Not provided'}
- Core Values: ${data.core_values?.length || 0} defined`);

  // Stakeholders
  const stakeholders = data.stakeholders || [];
  sections.push(`## Stakeholders (${stakeholders.length} identified)
${stakeholders.slice(0, 5).map((s: any) => `- ${getText(s.name_en, s.name_ar)}: ${s.type || 'unclassified'}, Influence: ${s.influence || '?'}, Interest: ${s.interest || '?'}`).join('\n') || 'None defined'}`);

  // SWOT
  const swot = data.swot || {};
  sections.push(`## SWOT Analysis
- Strengths: ${swot.strengths?.length || 0}
- Weaknesses: ${swot.weaknesses?.length || 0}
- Opportunities: ${swot.opportunities?.length || 0}
- Threats: ${swot.threats?.length || 0}`);

  // PESTEL
  const pestel = data.pestel || {};
  const pestelCount = ['political', 'economic', 'social', 'technological', 'environmental', 'legal']
    .reduce((sum, key) => sum + (pestel[key]?.length || 0), 0);
  sections.push(`## PESTEL Analysis
- Total factors identified: ${pestelCount}`);

  // Risks
  const risks = data.risks || [];
  sections.push(`## Risks (${risks.length} identified)
${risks.slice(0, 5).map((r: any) => `- ${getText(r.name_en, r.name_ar)}: Probability: ${r.probability || '?'}, Impact: ${r.impact || '?'}, Has mitigation: ${r.mitigation_en || r.mitigation_ar ? 'Yes' : 'No'}`).join('\n') || 'None defined'}`);

  // Objectives
  const objectives = data.objectives || [];
  sections.push(`## Strategic Objectives (${objectives.length} defined)
${objectives.map((o: any, i: number) => `${i + 1}. ${getText(o.name_en, o.name_ar) || 'Unnamed'} - Priority: ${o.priority || '?'}, Sector: ${o.sector_code || '?'}`).join('\n') || 'None defined'}`);

  // National Alignments
  const alignments = data.national_alignments || [];
  sections.push(`## National Alignments (${alignments.length} connections)
${alignments.slice(0, 5).map((a: any) => `- Program: ${a.program_code || '?'}`).join('\n') || 'None defined'}`);

  // KPIs
  const kpis = data.kpis || [];
  sections.push(`## KPIs (${kpis.length} defined)
${kpis.map((k: any) => `- ${getText(k.name_en, k.name_ar) || 'Unnamed'}: Baseline: ${k.baseline_value ?? '?'}, Target: ${k.target_value ?? '?'}, Unit: ${k.unit || '?'}, Frequency: ${k.measurement_frequency || '?'}`).join('\n') || 'None defined'}`);

  // Action Plans
  const actionPlans = data.action_plans || [];
  sections.push(`## Action Plans (${actionPlans.length} initiatives)
${actionPlans.slice(0, 5).map((a: any) => `- ${getText(a.title_en, a.title_ar) || 'Unnamed'}: Budget: ${a.budget || '?'}, Status: ${a.status || '?'}`).join('\n') || 'None defined'}`);

  // Resources
  const resourcePlan = data.resource_plan || {};
  sections.push(`## Resources
- HR Requirements: ${resourcePlan.hr_requirements?.length || 0} roles
- Budget Allocations: ${resourcePlan.budget_allocation?.length || 0} categories`);

  // Timeline
  const phases = data.phases || [];
  const milestones = data.milestones || [];
  sections.push(`## Timeline
- Phases: ${phases.length}
- Milestones: ${milestones.length}`);

  // Governance
  const governance = data.governance || {};
  sections.push(`## Governance
- Committees: ${governance.committees?.length || 0}
- Reporting Frequency: ${governance.reporting_frequency || 'Not specified'}`);

  // Communication
  const commPlan = data.communication_plan || {};
  sections.push(`## Communication Plan
- Master Narrative: ${commPlan.master_narrative_en || commPlan.master_narrative_ar ? 'Defined' : 'Missing'}
- Key Messages: ${commPlan.key_messages?.length || 0}
- Internal Channels: ${commPlan.internal_channels?.length || 0}
- External Channels: ${commPlan.external_channels?.length || 0}`);

  // Change Management
  const changeMgmt = data.change_management || {};
  sections.push(`## Change Management
- Readiness Assessment: ${changeMgmt.readiness_assessment_en || changeMgmt.readiness_assessment_ar ? 'Defined' : 'Missing'}
- Change Approach: ${changeMgmt.change_approach_en || changeMgmt.change_approach_ar ? 'Defined' : 'Missing'}
- Training Plan: ${changeMgmt.training_plan?.length || 0} items`);

  return sections.join('\n\n');
}
