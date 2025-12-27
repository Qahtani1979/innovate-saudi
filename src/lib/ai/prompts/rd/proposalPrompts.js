import { getSystemPrompt } from '@/lib/saudiContext';

export const RD_PROPOSAL_SYSTEM_PROMPT = getSystemPrompt('rd_consultant', `
You are an expert R&D consultant helping to refine research proposals and provide strategic insights.
Focus on academic rigor, clear methodology, impact assessment, and alignment with Saudi Vision 2030.
`);

export const rdProposalPrompts = {
    enhance: {
        id: 'rd_proposal_enhance',
        name: 'Enhance Research Proposal',
        description: 'Generates professional academic content for research proposals',
        prompt: (context) => `
Enhance this research proposal with professional academic content:

Title: ${context.formData.title_en}
Abstract: ${context.formData.abstract_en || 'N/A'}
Research Area: ${context.formData.research_area || 'N/A'}
Methodology: ${context.formData.methodology_en || 'N/A'}

Generate comprehensive bilingual (English + Arabic) enhanced content:
1. Improved title and tagline (EN + AR)
2. Detailed abstract (EN + AR) - 300+ words covering objectives, methodology, expected outcomes
3. Enhanced methodology description (EN + AR) - 200+ words
4. Literature review section (5+ key references)
5. Expected outputs with descriptions
6. Impact statement (EN + AR)
7. Innovation claim (what makes it novel)
8. 5-8 relevant keywords
`,
        schema: {
            type: 'object',
            properties: {
                title_en: { type: 'string' },
                title_ar: { type: 'string' },
                tagline_en: { type: 'string' },
                tagline_ar: { type: 'string' },
                abstract_en: { type: 'string' },
                abstract_ar: { type: 'string' },
                methodology_en: { type: 'string' },
                methodology_ar: { type: 'string' },
                impact_statement: { type: 'string' },
                innovation_claim: { type: 'string' },
                keywords: { type: 'array', items: { type: 'string' } },
                expected_outputs: {
                    type: 'array', items: {
                        type: 'object',
                        properties: {
                            output: { type: 'string' },
                            type: { type: 'string' },
                            description: { type: 'string' }
                        }
                    }
                }
            }
        }
    },
    analyze: {
        id: 'rd_proposal_analyze',
        name: 'Analyze Research Proposal',
        description: 'Analyzes research proposal for strengths, improvements, and alignment',
        prompt: (context) => `
Analyze this research proposal and provide strategic insights:

Title: ${context.proposal.title_en || context.proposal.title_ar}
Abstract: ${context.proposal.abstract_en || context.proposal.abstract_ar || 'N/A'}
Research Area: ${context.proposal.research_area || 'N/A'}
Methodology: ${context.proposal.methodology_en || context.proposal.methodology_ar || 'N/A'}

Provide a detailed analysis including:
1. Key Strengths (bilingual)
2. Areas for Improvement (bilingual)
3. Vision 2030 Alignment (bilingual)
4. Commercialization/Pilot Potential (bilingual)
5. Risk Mitigation Strategies (bilingual)
`,
        schema: {
            type: 'object',
            properties: {
                strengths: { type: 'array', items: { type: 'string' } },
                improvements: { type: 'array', items: { type: 'string' } },
                vision_alignment: { type: 'array', items: { type: 'string' } },
                pilot_potential: { type: 'array', items: { type: 'string' } },
                risk_mitigation: { type: 'array', items: { type: 'string' } }
            }
        }
    }
};
