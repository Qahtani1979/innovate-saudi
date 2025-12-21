export const getStrategicCoverageData = (strategicPlans, challenges, budgets) => ({
    assessment: `Strategic Innovation Planning has EXCELLENT TOOLS (21 pages built - 55% avg coverage) but exists in PARALLEL UNIVERSE from the INNOVATION ECOSYSTEM (25% integration).

PLANNING TOOLS are EXCELLENT - comprehensive pages exist, forms work, plans created.
INNOVATION ECOSYSTEM INTEGRATION is CRITICAL FAILURE - strategy disconnected from challenges/pilots/R&D/programs/scaling.
AI INTELLIGENCE is MISSING - completely manual despite rich data (MII, embeddings, trends, patterns).

Pattern: Innovation strategic plan created → vision, pillars, objectives, initiatives defined → PLAN SITS IDLE.
Innovation ecosystem operates separately:
• Municipalities create challenges WITHOUT checking strategic alignment
• Pilots launched WITHOUT strategic context or objective linkage
• R&D projects/calls created WITHOUT strategic R&D priorities
• Programs run WITHOUT mapping to strategic innovation pillars
• Solutions scaled WITHOUT validating strategic KPI contribution
• Budget allocated to innovation WITHOUT strategy validation
• OKRs set independently of strategic innovation objectives
• MII gaps identified but DON'T inform strategic priorities
• Knowledge graph, trends, patterns exist but NOT USED in planning

Cannot validate ecosystem alignment, cannot track innovation contribution, cannot measure strategic objective achievement, cannot prove strategy→MII impact.`,

    entities: {
        StrategicPlan: {
            status: 'exists',
            fields: ['name_en', 'name_ar', 'plan_type', 'scope', 'start_date', 'end_date', 'vision', 'mission', 'strategic_pillars', 'objectives', 'initiatives', 'kpis', 'status'],
            population: strategicPlans.length,
            active: strategicPlans.filter(p => p.status === 'active').length,
            approved: strategicPlans.filter(p => p.status === 'approved').length,
        },
        StrategicPlanChallengeLink: {
            status: 'exists',
            fields: ['strategic_plan_id', 'challenge_id', 'alignment_score', 'contribution_to_objective'],
            population: 0,
            description: 'Links challenges to strategic objectives'
        },
        TaxonomyStrategicWeight: {
            status: 'missing',
            fields: ['N/A'],
            population: 0,
            description: 'Strategic weights for sectors/subsectors/services'
        },
        StrategicRDRoadmap: {
            status: 'missing',
            fields: ['N/A'],
            population: 0,
            description: 'Strategic R&D priorities and themes'
        },
        StrategicProgramTheme: {
            status: 'missing',
            fields: ['N/A'],
            population: 0,
            description: 'Strategic program themes'
        },
        Budget: {
            status: 'exists',
            fields: ['entity_type', 'entity_id', 'fiscal_year', 'total_budget', 'allocated', 'spent', 'status', 'strategic_plan_id'],
            population: budgets.length,
            linkedToStrategy: budgets.filter(b => b.strategic_plan_id).length
        }
    },

    pages: [
        {
            name: 'StrategyCockpit',
            path: 'pages/StrategyCockpit.js',
            status: 'exists',
            coverage: 60,
            features: ['Multi-tab layout', 'Innovation roadmap view', 'Portfolio heatmap', 'Innovation capacity metrics'],
            gaps: ['No OKR integration', 'No AI strategy advisor', 'No real-time pipeline tracking', 'No scenario planning']
        },
        {
            name: 'StrategicPlanBuilder',
            path: 'pages/StrategicPlanBuilder.js',
            status: 'exists',
            coverage: 55,
            features: ['Plan creation form', 'Innovation pillars & objectives', 'KPI definition'],
            gaps: ['No AI-generated vision', 'No innovation plan templates', 'No vision/mission generator', 'No AI initiative suggestion']
        },
        {
            name: 'StrategicInitiativeTracker',
            path: 'pages/StrategicInitiativeTracker.js',
            status: 'exists',
            coverage: 50,
            features: ['Initiative list', 'Progress tracking', 'Basic status'],
            gaps: ['No initiative→challenge/pilot linking', 'No AI risk detection', 'No dependency mapping']
        },
        {
            name: 'OKRManagementSystem',
            path: 'pages/OKRManagementSystem.js',
            status: 'exists',
            coverage: 45,
            features: ['OKR creation', 'Basic tracking'],
            gaps: ['No OKR→Strategy linking', 'No cascading', 'No check-in workflow', 'No AI progress predictor']
        },
        {
            name: 'StrategicExecutionDashboard',
            path: 'pages/StrategicExecutionDashboard.js',
            status: 'exists',
            coverage: 55,
            features: ['Execution metrics', 'Initiative progress', 'Basic alerts'],
            gaps: ['No real-time KPI integration', 'No AI execution insights', 'No blocker detection']
        }
    ],

    components: [
        { name: 'strategy/WhatIfSimulator', coverage: 35, status: 'exists', description: 'Scenario analysis for innovation decisions' },
        { name: 'strategy/CollaborationMapper', coverage: 40, status: 'exists', description: 'Map ecosystem collaborations' },
        { name: 'strategy/HistoricalComparison', coverage: 35, status: 'exists', description: 'Compare historical performance' },
        { name: 'strategy/ResourceAllocationView', coverage: 30, status: 'exists', description: 'Visualize resource allocation' },
        { name: 'gates/StrategicPlanApprovalGate', coverage: 45, status: 'exists', description: 'Plan approval workflow' }
    ],

    workflows: [
        {
            name: 'Strategic Innovation Plan Creation',
            stages: [
                { name: 'Analyze MII gaps', status: 'missing', automation: 'N/A' },
                { name: 'Initiate plan creation', status: 'complete', automation: 'Page exists' },
                { name: 'Define pillars', status: 'complete', automation: 'Manual entry' },
                { name: 'Link challenges', status: 'partial', automation: 'Entity only' },
                { name: 'Governance approval', status: 'partial', automation: 'Gate exists' }
            ],
            coverage: 50,
            gaps: ['No MII→Strategy workflow', 'AI generation missing', 'Gates not integrated']
        },
        {
            name: 'Strategy → Execution Alignment',
            stages: [
                { name: 'Strategic plan active', status: 'complete', automation: 'Status flag' },
                { name: 'Challenge alignment', status: 'partial', automation: 'Manual linking' },
                { name: 'AI matching (Matchmaker)', status: 'partial', automation: 'Implicit' },
                { name: 'Track execution progress', status: 'complete', automation: 'Dashboard exists' }
            ],
            coverage: 35,
            gaps: ['Alignment manual', 'No KPI auto-aggregation', 'No drift detection']
        }
    ],

    userJourneys: [
        {
            persona: 'Executive / Strategy Leader',
            journey: [
                { step: 'Access strategy cockpit', page: 'StrategyCockpit' },
                { step: 'View strategic roadmap', page: 'StrategyCockpit' },
                { step: 'Review portfolio heatmap', page: 'StrategyCockpit' },
                { step: 'Review progress', page: 'StrategicExecutionDashboard' }
            ]
        },
        {
            persona: 'Strategic Planner',
            journey: [
                { step: 'Access plan builder', page: 'StrategicPlanBuilder' },
                { step: 'Define vision & mission', page: 'StrategicPlanBuilder' },
                { step: 'Define pillars', page: 'StrategicPlanBuilder' },
                { step: 'Submit for approval', page: 'StrategicPlanApprovalGate' }
            ]
        }
    ],

    aiFeatures: [
        {
            name: 'Innovation Vision Generator',
            status: 'missing',
            description: 'AI generates vision from municipality context and MII gaps',
            accuracy: 'N/A',
            implementation: 'N/A',
            performance: 'N/A'
        },
        {
            name: 'Strategy Drift Detector',
            status: 'missing',
            description: 'Detect when execution deviates from strategic plan',
            accuracy: 'N/A',
            implementation: 'N/A',
            performance: 'N/A'
        },
        {
            name: 'Strategic Advisor Chatbot',
            status: 'partial',
            description: 'AI chat for innovation strategy questions',
            accuracy: 'Moderate',
            implementation: 'Standalone page',
            performance: 'On-demand'
        }
    ],

    recommendations: [
        {
            priority: 'P0',
            title: 'Strategy → Execution Integration',
            description: 'Link challenges/pilots to strategic objectives, validate alignment, track contribution',
            effort: 'Large',
            impact: 'Critical'
        },
        {
            priority: 'P0',
            title: 'AI Strategic Intelligence Suite',
            description: 'Build AI for all strategic planning phases: generation, validation, optimization',
            effort: 'Large',
            impact: 'Critical'
        },
        {
            priority: 'P0',
            title: 'Integrate All Strategy Components',
            description: 'Integrate 12 existing components and 4 approval gates into workflows',
            effort: 'Medium',
            impact: 'High'
        }
    ]
});
