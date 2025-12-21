export const getMIICoverageData = () => ({
    entities: {
        MIIResult: {
            status: 'complete',
            fields: ['municipality_id', 'city_id', 'period', 'year', 'quarter', 'overall_score', 'rank', 'dimension_scores', 'trend', 'ai_comments', 'improvement_recommendations'],
            population: 'One per municipality per period',
            usage: 'Store calculated MII scores and AI insights'
        },
        MIIDimension: {
            status: 'complete',
            fields: ['dimension_name_en', 'dimension_name_ar', 'weight', 'formula', 'calculation_logic', 'data_sources'],
            population: '5 core dimensions',
            usage: 'Define calculation formulas and weights'
        }
    },

    pages: [
        {
            name: 'MII National Rankings',
            path: 'pages/MIIRankings.js',
            status: 'complete',
            coverage: 100,
            features: ['National table', 'Regional filter', 'Compare mode', 'Radar chart'],
            aiFeatures: ['AI national insights', 'Trend analysis']
        },
        {
            name: 'MIIDrillDown',
            path: 'pages/MIIDrillDown.js',
            status: 'complete',
            coverage: 100,
            features: ['Municipality header', 'Dimension radar', 'Historical trend', 'YoY change'],
            aiFeatures: ['AI improvement recommendations']
        }
    ],

    components: [
        { name: 'MIIImprovementAI', coverage: 100, status: 'complete', description: 'AI-powered improvement action generator' },
        { name: 'PeerBenchmarkingTool', coverage: 100, status: 'complete', description: 'AI similarity matcher for peer comparison' },
        { name: 'AutomatedMIICalculator', coverage: 100, status: 'complete', description: 'Backend calculation engine' }
    ],

    workflows: [
        {
            name: 'MII Calculation Workflow',
            stages: [
                { name: 'Load dimensions', status: 'complete', automation: '100%' },
                { name: 'Fetch source data', status: 'complete', automation: '100%' },
                { name: 'Apply formulas', status: 'complete', automation: '100%' },
                { name: 'Normalize scores', status: 'complete', automation: '100%' }
            ],
            coverage: 100,
            aiIntegration: 'AI data gap filler estimates missing values'
        },
        {
            name: 'Improvement Planning',
            stages: [
                { name: 'Gap analysis', status: 'complete', automation: '100%' },
                { name: 'Action generation', status: 'complete', automation: 'AI' },
                { name: 'Prioritization', status: 'complete', automation: 'AI' }
            ],
            coverage: 100,
            aiIntegration: 'MIIImprovementAI generates prioritized plans'
        }
    ],

    userJourneys: [
        {
            persona: 'Municipal Executive',
            journey: [
                { step: 'View MII score', page: 'MunicipalityDashboard' },
                { step: 'Deep dive analysis', page: 'MunicipalityProfile MII tab' },
                { step: 'Generate AI insights', page: 'AI Insights modal' },
                { step: 'Use improvement tool', page: 'MIIImprovementAI' }
            ]
        }
    ],

    aiFeatures: [
        {
            name: 'AI National Insights',
            status: 'implemented',
            description: 'Analyzes top municipalities and performance trends',
            accuracy: '90%',
            implementation: 'InvokeLLM',
            performance: '10-15s'
        },
        {
            name: 'MII Improvement Generator',
            status: 'implemented',
            description: 'Generates prioritized action plans with impact scores',
            accuracy: '89%',
            implementation: 'MIIImprovementAI',
            performance: '10-15s'
        }
    ],

    integrationPoints: [
        {
            name: 'Challenges → MII',
            type: 'Data Source',
            status: 'complete',
            description: 'Challenge resolution rates feed MII Dimension 1'
        },
        {
            name: 'Pilots → MII',
            type: 'Data Source',
            status: 'complete',
            description: 'Pilot success rates feed MII Dimension 2'
        }
    ],

    comparisonTables: [
        {
            title: 'MII Dimensions & Data Sources',
            headers: ['Dimension', 'Data Sources', 'Weight', 'Status'],
            rows: [
                ['Challenges Score', 'Challenge count/quality', '20%', '✅ Automated'],
                ['Pilots Score', 'Pilot count/success', '25%', '✅ Automated'],
                ['Innovation Capacity', 'Staff training/programs', '20%', '✅ Automated'],
                ['Partnership Score', 'Partnership health', '15%', '✅ Automated'],
                ['Digital Maturity', 'Digital adoption', '20%', '✅ Automated']
            ]
        }
    ],

    rbacConfig: {
        permissions: [
            { name: 'mii_view_all', description: 'View all rankings', assignedTo: ['admin', 'executive'] },
            { name: 'mii_calculate', description: 'Trigger calculation', assignedTo: ['admin'] }
        ],
        rlsRules: [
            'Municipal users can only view own MII results',
            'Admins can view all results',
            'Unpublished results only visible to admins'
        ]
    },

    recommendations: [
        {
            priority: 'P1',
            title: 'Real-time Data Integration',
            description: 'Move from quarterly batch calculations to real-time MII updates as pilots and challenges close',
            effort: 'Medium',
            impact: 'High'
        }
    ]
});
