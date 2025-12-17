/**
 * Step 7: Risk Assessment
 * AI prompt and schema for generating risk register
 */

export const getStep7Prompt = (context, wizardData) => {
  return `You are a strategic planning expert for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH).

## MoMAH CONTEXT:
- Vision 2030 Programs: Quality of Life, Housing, NTP, Thriving Cities
- Innovation Ecosystem: KACST, SDAIA, MCIT, Monsha'at, university R&D
- Tech Infrastructure: Balady, Sakani, ANSA, national data platforms
- Regulatory Framework: PDPL, SDAIA AI Ethics, CITC, cybersecurity laws

## STRATEGIC PLAN CONTEXT:
- Plan Name: ${context.planName}
- Vision: ${context.vision}
- Mission: ${wizardData.mission_en || 'Not specified'}
- Sectors: ${context.sectors.join(', ')}
- Timeline: ${context.startYear}-${context.endYear} (${context.endYear - context.startYear} years)
- Budget Range: ${wizardData.budget_range || 'Not specified'}
- Focus Technologies: ${(wizardData.focus_technologies || []).join(', ') || 'Not specified'}

## PESTEL THREATS (from Step 4):
${Object.entries(wizardData.pestel || {}).map(([category, factors]) => 
  (factors || []).filter(f => f.impact === 'high' || f.trend === 'declining').slice(0, 2).map(f => `- ${category.toUpperCase()}: ${f.factor_en || 'N/A'}`).join('\n')
).filter(Boolean).join('\n') || 'Not analyzed yet'}

## SWOT WEAKNESSES & THREATS (from Step 5):
- Weaknesses: ${(wizardData.swot?.weaknesses || []).slice(0, 3).map(w => w.text_en).join('; ') || 'Not defined'}
- Threats: ${(wizardData.swot?.threats || []).slice(0, 3).map(t => t.text_en).join('; ') || 'Not defined'}

## WORST-CASE SCENARIO (from Step 6):
${wizardData.scenarios?.worst_case?.description_en || 'Not defined yet'}

## KEY STAKEHOLDERS:
${(wizardData.stakeholders || []).filter(s => s.power === 'high').slice(0, 3).map(s => `- ${s.name_en || s.name_ar} (${s.type})`).join('\n') || 'Not defined'}

---

## REQUIREMENTS:
Generate 12-16 risks covering ALL categories with explicit innovation/R&D risks.

For EACH risk, provide ALL fields (bilingual):
- title_en / title_ar: Short risk title (5-10 words)
- description_en / description_ar: Detailed description (2-3 sentences)
- category: STRATEGIC | OPERATIONAL | FINANCIAL | REGULATORY | TECHNOLOGY | INNOVATION | REPUTATIONAL | POLITICAL | ENVIRONMENTAL
- likelihood: low | medium | high
- impact: low | medium | high
- mitigation_strategy_en / mitigation_strategy_ar: Preventive actions (2-3 sentences)
- contingency_plan_en / contingency_plan_ar: Response if risk occurs (2-3 sentences)
- owner: Role/department responsible

---

## CATEGORY DISTRIBUTION (MANDATORY):

### STRATEGIC (2 risks):
- Vision 2030 misalignment or VRP milestone failure
- Stakeholder disengagement or priority conflicts

### OPERATIONAL (2 risks):
- Capacity gaps and skill shortages
- Cross-department coordination failures

### FINANCIAL (2 risks):
- Budget overruns or funding delays
- ROI uncertainty on innovation investments

### REGULATORY (1-2 risks):
- PDPL/data protection non-compliance
- Municipal law or policy changes

### TECHNOLOGY (2 risks):
- System integration failures (Balady, legacy systems)
- Cybersecurity breaches or data loss

### INNOVATION/R&D (2-3 risks) - CRITICAL NEW CATEGORY:
- **Pilot Program Failure**: Innovation pilots fail to demonstrate value, wasting R&D investment
- **Technology Obsolescence**: Selected technologies become outdated before full deployment
- **R&D Partner Dependency**: Over-reliance on single research partner or vendor
- **Innovation Talent Drain**: Key technical staff leave for private sector or competitors
- **Proof-of-Concept to Scale Gap**: Successful POCs fail to scale to production
- **AI/ML Model Bias**: AI systems produce biased or unfair outcomes
- **Open Innovation IP Risks**: Intellectual property disputes from collaborative R&D

### REPUTATIONAL (1 risk):
- Public perception of failed innovation or wasted funds

### POLITICAL (1-2 risks):
- Leadership changes affecting innovation priorities
- Inter-ministry coordination breakdown

### ENVIRONMENTAL (1 risk):
- Sustainability targets missed or green initiative compliance

---

## LIKELIHOOD/IMPACT DISTRIBUTION:
- At least 3-4 HIGH likelihood risks
- At least 3-4 HIGH impact risks
- At least 2-3 risks should be HIGH/HIGH (critical)
- Mix of LOW, MEDIUM across remaining

---

## INNOVATION RISK EXAMPLES:

**INNOVATION Category:**
- "AI Model Performance Degradation" - ML models drift over time, requiring ongoing retraining and monitoring
- "Pilot-to-Production Scaling Failure" - Successful small-scale pilots fail when deployed city-wide
- "Research Partner Misalignment" - University/KACST research priorities diverge from municipal needs
- "Innovation Investment ROI Uncertainty" - Difficulty measuring tangible returns on R&D spending

**TECHNOLOGY Category:**
- "Legacy System Integration Complexity" - Connecting new innovations to Balady/Baladiya systems
- "Data Quality for AI/ML" - Insufficient or biased training data affecting model accuracy
- "Vendor Lock-in from Proprietary Solutions" - Dependence on single technology vendor

**FINANCIAL Category:**
- "Innovation Budget Reallocation" - R&D funds redirected to operational priorities
- "VC/Startup Partner Failure" - Innovation partners face funding or business challenges

Be specific to plan context. Reference actual Saudi systems, agencies, and innovation ecosystem.`;
};

export const step7Schema = {
  type: 'object',
  properties: {
    risks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title_en: { type: 'string' },
          title_ar: { type: 'string' },
          description_en: { type: 'string' },
          description_ar: { type: 'string' },
          category: { type: 'string' },
          likelihood: { type: 'string' },
          impact: { type: 'string' },
          mitigation_strategy_en: { type: 'string' },
          mitigation_strategy_ar: { type: 'string' },
          contingency_plan_en: { type: 'string' },
          contingency_plan_ar: { type: 'string' },
          owner: { type: 'string' }
        }
      }
    }
  }
};
