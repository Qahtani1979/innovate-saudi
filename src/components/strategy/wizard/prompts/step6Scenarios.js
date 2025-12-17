/**
 * Step 6: Scenario Planning
 * AI prompt and schema for generating strategic scenarios
 */

export const getStep6Prompt = (context, wizardData) => {
  return `You are a strategic planning expert for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH) with expertise in Innovation & R&D.

## MoMAH INNOVATION CONTEXT:
- National Innovation Ecosystem: KACST, SDAIA, MCIT Digital Gov, Monsha'at, Badir
- University R&D Partners: KAUST, KFUPM, KSU research chairs, university innovation centers
- Tech Infrastructure: National Data Management Office, CITC, cloud platforms
- Innovation Programs: Sandbox regulations, GovTech initiatives, AI strategy implementation

## STRATEGIC PLAN CONTEXT:
- Plan Name: ${context.planName}
- Vision: ${context.vision}
- Mission: ${wizardData.mission_en || 'Not specified'}
- Sectors: ${context.sectors.join(', ')}
- Timeline: ${context.startYear}-${context.endYear} (${context.endYear - context.startYear} years)
- Budget Range: ${wizardData.budget_range || 'Not specified'}
- Target Regions: ${(wizardData.target_regions || []).join(', ') || 'Kingdom-wide'}
- Focus Technologies: ${(wizardData.focus_technologies || []).join(', ') || 'Not specified'}
- Vision 2030 Programs: ${(wizardData.vision_2030_programs || []).join(', ') || 'Not specified'}

**STRATEGIC PILLARS (from Step 2):**
${(wizardData.strategic_pillars || []).map(p => '- ' + (p.name_en || p.name_ar)).join('\n') || 'Not defined yet'}

**KEY STAKEHOLDERS (from Step 3):**
${(wizardData.stakeholders || []).slice(0, 5).map(s => '- ' + (s.name_en || s.name_ar) + ' (' + s.type + ', Power: ' + s.power + ', Interest: ' + s.interest + ')').join('\n') || 'Not defined yet'}

**PESTEL SUMMARY (from Step 4):**
- Political factors: ${(wizardData.pestel?.political || []).length} identified
- Economic factors: ${(wizardData.pestel?.economic || []).length} identified
- Technological factors: ${(wizardData.pestel?.technological || []).length} identified
- Key opportunities: ${(wizardData.pestel?.political || []).filter(f => f.trend === 'growing').map(f => f.factor_en).slice(0, 2).join(', ') || 'Vision 2030 support'}
- Key threats: ${(wizardData.pestel?.economic || []).filter(f => f.trend === 'declining').map(f => f.factor_en).slice(0, 2).join(', ') || 'Economic volatility'}

**SWOT SUMMARY (from Step 5):**
- Top Strengths: ${(wizardData.swot?.strengths || []).slice(0, 2).map(s => s.text_en).join('; ') || 'Not defined yet'}
- Top Weaknesses: ${(wizardData.swot?.weaknesses || []).slice(0, 2).map(w => w.text_en).join('; ') || 'Not defined yet'}
- Top Opportunities: ${(wizardData.swot?.opportunities || []).slice(0, 2).map(o => o.text_en).join('; ') || 'Not defined yet'}
- Top Threats: ${(wizardData.swot?.threats || []).slice(0, 2).map(t => t.text_en).join('; ') || 'Not defined yet'}

---

## REQUIREMENTS:
Generate ALL 3 scenarios: best_case, worst_case, and most_likely.

**CRITICAL**: Each scenario MUST include a "probability" field as a NUMBER from 0 to 100 (no % sign).

For EACH scenario, provide ALL these fields in BOTH English and Arabic:

1. **probability**: REQUIRED - Likelihood as a number from 0 to 100. This field is mandatory!

2. **description_en / description_ar**: A 2-3 sentence narrative describing this scenario (what the future looks like)

3. **assumptions**: Array of 3-5 key assumptions. Each assumption must have:
   - text_en: Assumption in English
   - text_ar: Assumption in Arabic (formal فصحى)
   **MUST include 1-2 INNOVATION/R&D assumptions per scenario**

4. **outcomes**: Array of 4-6 measurable outcomes with REALISTIC VALUES. Each outcome must have:
   - metric_en: The metric/outcome name in English
   - metric_ar: The metric/outcome name in Arabic
   - value: The expected value/result - USE REALISTIC SAUDI MUNICIPAL BENCHMARKS
   **MUST include 2-3 INNOVATION/R&D outcomes per scenario**

---

## INNOVATION/R&D OUTCOME EXAMPLES (MANDATORY to include):

**For BEST CASE (Innovation Success):**
- "AI/ML models deployed: 15+ production models"
- "Pilot success rate: 85%"
- "R&D partnerships active: 8+ with KACST/universities"
- "Innovation patents filed: 5+"
- "Technology transfer agreements: 3+"
- "Staff with digital certifications: 70%"
- "IoT sensors deployed: 50,000+"
- "Digital twin coverage: 80% of urban areas"
- "Innovation ROI: 200%+ on R&D investment"

**For WORST CASE (Innovation Challenges):**
- "AI/ML models deployed: 2-3 only"
- "Pilot failure rate: 60%"
- "R&D partnerships: 1-2 inactive"
- "Tech talent turnover: 40%"
- "Innovation budget utilization: 40%"
- "Technology obsolescence: 3+ critical systems outdated"
- "Cybersecurity incidents: 10+ major breaches"
- "Pilot-to-scale conversion: <10%"

**For MOST LIKELY (Steady Innovation Progress):**
- "AI/ML models deployed: 6-8 models"
- "Pilot success rate: 55%"
- "R&D partnerships active: 4-5"
- "Staff with digital certifications: 45%"
- "Innovation budget utilization: 75%"
- "IoT sensors deployed: 15,000"
- "Technology adoption rate: 60%"

---

## SCENARIO GUIDANCE FOR INNOVATION CONTEXT:

**BEST CASE (Innovation Excellence - probability: 20):**
MUST include innovation assumptions:
- KACST/KAUST research partnerships yield breakthrough municipal solutions
- SDAIA AI governance support accelerates deployment
- GovTech startup ecosystem provides cutting-edge pilots
- National innovation funding exceeds expectations
- Technology talent attraction successful

Innovation outcomes:
- Multiple successful AI/IoT pilots scaled to production
- Recognition as innovation leader among Saudi municipalities
- Strong R&D pipeline for future initiatives
- High pilot-to-production conversion rate
- Significant technology transfer achievements

**WORST CASE (Innovation Setbacks - probability: 20):**
MUST include innovation assumptions:
- R&D partnerships fail to deliver practical solutions
- AI/ML projects face data quality and governance issues
- Pilot programs fail to meet success criteria
- Innovation talent shortage persists
- Technology vendor dependency creates lock-in

Innovation outcomes:
- Multiple pilot failures with sunk costs
- Innovation team turnover and capability loss
- R&D budget redirected to operational needs
- Technology obsolescence in core systems
- Missed Vision 2030 digital transformation targets

**MOST LIKELY (Balanced Innovation Progress - probability: 60):**
MUST include innovation assumptions:
- Selective R&D partnerships show mixed results
- Some pilots succeed, others require iteration
- Gradual capability building in AI/data science
- Innovation culture slowly developing

Innovation outcomes:
- Moderate pilot success rate (50-60%)
- 4-6 R&D partnerships active with varying engagement
- Gradual technology adoption with learning curve
- Innovation capacity growing but constrained
- Some technology wins, some setbacks

**DISTRIBUTION:**
- Probabilities MUST sum to 100 (typically: 20 + 20 + 60)
- Each scenario should reference the SWOT and PESTEL factors above
- **EACH scenario MUST have explicit Innovation/R&D outcomes**
- Outcomes should be sector-specific and measurable
- Values should be realistic for Saudi municipal context`;
};

export const step6Schema = {
  type: 'object',
  properties: {
    best_case: { type: 'object', properties: { description_en: { type: 'string' }, description_ar: { type: 'string' }, assumptions: { type: 'array', items: { type: 'object', properties: { text_en: { type: 'string' }, text_ar: { type: 'string' } } } }, outcomes: { type: 'array', items: { type: 'object', properties: { metric_en: { type: 'string' }, metric_ar: { type: 'string' }, value: { type: 'string' } } } }, probability: { type: 'number' } } },
    worst_case: { type: 'object', properties: { description_en: { type: 'string' }, description_ar: { type: 'string' }, assumptions: { type: 'array', items: { type: 'object', properties: { text_en: { type: 'string' }, text_ar: { type: 'string' } } } }, outcomes: { type: 'array', items: { type: 'object', properties: { metric_en: { type: 'string' }, metric_ar: { type: 'string' }, value: { type: 'string' } } } }, probability: { type: 'number' } } },
    most_likely: { type: 'object', properties: { description_en: { type: 'string' }, description_ar: { type: 'string' }, assumptions: { type: 'array', items: { type: 'object', properties: { text_en: { type: 'string' }, text_ar: { type: 'string' } } } }, outcomes: { type: 'array', items: { type: 'object', properties: { metric_en: { type: 'string' }, metric_ar: { type: 'string' }, value: { type: 'string' } } } }, probability: { type: 'number' } } }
  }
};
