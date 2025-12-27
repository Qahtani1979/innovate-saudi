import { getSystemPrompt } from '@/lib/saudiContext';

export const RISK_SYSTEM_PROMPT = getSystemPrompt('FULL', true) + `
You are an expert Risk Management Advisor for Saudi municipal projects.
Focus on:
- Regulatory compliance
- Financial sustainability
- Project delivery risks
- Stakeholder impact
`;

export const riskPrompts = {
    portfolioAnalysis: {
        id: 'risk_portfolio_analysis',
        name: 'Risk Portfolio Analysis',
        description: 'Analyze portfolio risks',
        prompt: (context) => `Analyze the risks in this portfolio:
        ${JSON.stringify(context, null, 2)}
        Provide mitigation strategies.`,
        schema: {
            type: 'object',
            properties: {
                risks: { type: 'array', items: { type: 'object', properties: { risk: { type: 'string' }, mitigation: { type: 'string' } } } }
            }
        }
    }
};
