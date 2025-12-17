/**
 * R&D Commercialization AI prompts
 * For startup spinoff and tech transfer
 */

export const RD_SPINOFF_SYSTEM_PROMPT = `You are a technology commercialization expert.
Assess R&D projects for startup potential and commercialization readiness.
Provide actionable pathways for tech transfer and spin-off creation.
All responses must be in valid JSON format.`;

export function buildRDSpinoffPrompt(rdProject) {
  return `Assess commercialization potential for R&D project:

PROJECT: ${rdProject.title_en}
Institution: ${rdProject.institution_en}
TRL: ${rdProject.trl_current}
Research Area: ${rdProject.research_area_en}
Key Findings: ${rdProject.key_findings || 'Not documented'}
IP Status: ${rdProject.ip_status || 'Not specified'}

Evaluate startup potential and recommend commercialization pathway.`;
}

export const RD_SPINOFF_SCHEMA = {
  type: "object",
  properties: {
    commercialization_score: { type: "number" },
    startup_potential: { type: "string", enum: ["high", "medium", "low"] },
    market_opportunity: { type: "string" },
    target_markets: { type: "array", items: { type: "string" } },
    competitive_advantages: { type: "array", items: { type: "string" } },
    barriers_to_entry: { type: "array", items: { type: "string" } },
    recommended_pathway: { type: "string" },
    next_steps: { type: "array", items: { type: "string" } },
    funding_options: { type: "array", items: { type: "string" } },
    team_requirements: { type: "array", items: { type: "string" } }
  },
  required: ["commercialization_score", "startup_potential", "recommended_pathway"]
};

export const PATENT_LANDSCAPE_SYSTEM_PROMPT = `You are an intellectual property analyst.
Analyze patent landscapes and identify IP opportunities.
Provide strategic guidance for IP protection.`;

export function buildPatentLandscapePrompt(technology) {
  return `Analyze patent landscape for technology:

TECHNOLOGY: ${technology.name}
Domain: ${technology.domain}
Key Features: ${technology.features?.join(', ') || 'Not specified'}
Existing Patents: ${technology.existingPatents?.length || 0}

Identify whitespace opportunities and IP strategy recommendations.`;
}

export const PATENT_LANDSCAPE_SCHEMA = {
  type: "object",
  properties: {
    landscape_summary: { type: "string" },
    key_players: { type: "array", items: { type: "string" } },
    patent_density: { type: "string", enum: ["high", "medium", "low"] },
    whitespace_opportunities: { type: "array", items: { type: "string" } },
    freedom_to_operate: { type: "string" },
    ip_recommendations: { type: "array", items: { type: "string" } },
    filing_priorities: { type: "array", items: { type: "string" } }
  },
  required: ["landscape_summary", "whitespace_opportunities"]
};

export const TECH_TRANSFER_SYSTEM_PROMPT = `You are a technology transfer specialist.
Guide the transition of research outputs to commercial applications.
Connect academic innovation with industry needs.`;

export function buildTechTransferPrompt(research, industryNeeds) {
  return `Advise on technology transfer:

RESEARCH: ${research.title_en}
Readiness Level: TRL ${research.trl}
Key Innovation: ${research.innovation_summary || 'Not specified'}

INDUSTRY NEEDS:
${industryNeeds?.map(n => `- ${n.sector}: ${n.need}`).join('\n') || 'General market needs'}

Recommend transfer strategy and partnership approach.`;
}

export const TECH_TRANSFER_SCHEMA = {
  type: "object",
  properties: {
    transfer_readiness: { type: "string", enum: ["ready", "needs_development", "early_stage"] },
    recommended_model: { type: "string" },
    potential_licensees: { type: "array", items: { type: "string" } },
    valuation_approach: { type: "string" },
    deal_structure_options: { type: "array", items: { type: "string" } },
    success_factors: { type: "array", items: { type: "string" } },
    risks: { type: "array", items: { type: "string" } },
    timeline: { type: "string" }
  },
  required: ["transfer_readiness", "recommended_model"]
};
