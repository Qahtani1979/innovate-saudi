/**
 * Program lessons to strategy prompts
 * @module programs/lessonsToStrategy
 */

export const LESSONS_TO_STRATEGY_SYSTEM_PROMPT = `You are an expert in converting program lessons learned into strategic recommendations for Saudi municipal innovation. Generate bilingual content.`;

export const createLessonsToStrategyPrompt = (data) => `Analyze these lessons learned from a municipal innovation program and generate strategic recommendations:

PROGRAM: ${data.programName}
TYPE: ${data.programType}
STATUS: ${data.status}
LINKED STRATEGIC PLANS: ${data.linkedPlans}

SUCCESS LESSONS:
${data.successLessons.map(l => `- ${l.description}`).join('\n')}

CHALLENGES/FAILURES:
${data.challengeLessons.map(l => `- ${l.description}`).join('\n')}

IMPROVEMENTS:
${data.improvementLessons.map(l => `- ${l.description}`).join('\n')}

Generate bilingual strategic recommendations:
1. Strategy refinement suggestions (what should change in strategic plans)
2. Capacity building needs (skills/resources to develop)
3. Process improvements (how to improve program execution)
4. Replication opportunities (where else to apply learnings)`;

export const LESSONS_TO_STRATEGY_SCHEMA = {
  type: 'object',
  properties: {
    strategy_refinements: { 
      type: 'array', 
      items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } 
    },
    capacity_needs: { 
      type: 'array', 
      items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } 
    },
    process_improvements: { 
      type: 'array', 
      items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } 
    },
    replication_opportunities: { 
      type: 'array', 
      items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } 
    }
  }
};

export const LESSONS_TO_STRATEGY_FALLBACK = {
  strategy_refinements: [
    { en: 'Consider adjusting timeline expectations based on lessons', ar: 'النظر في تعديل توقعات الجدول الزمني بناءً على الدروس' }
  ],
  capacity_needs: [
    { en: 'Build digital skills capacity for future programs', ar: 'بناء قدرات المهارات الرقمية للبرامج المستقبلية' }
  ],
  process_improvements: [
    { en: 'Implement earlier stakeholder engagement', ar: 'تنفيذ مشاركة أصحاب المصلحة في وقت مبكر' }
  ],
  replication_opportunities: [
    { en: 'Apply learnings to similar programs in other sectors', ar: 'تطبيق الدروس على برامج مماثلة في قطاعات أخرى' }
  ]
};
