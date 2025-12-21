export const getMatchmakerCoverageData = (applications, evaluations, challenges, pilots) => ({
    entities: {
        MatchmakerApplication: {
            status: 'complete',
            fields: ['organization_id', 'classification', 'capabilities', 'sectors', 'geographic_scope', 'solution_portfolio', 'team_size', 'funding_stage', 'stage', 'score', 'matched_challenges', 'meetings_held', 'pilots_launched', 'partnerships_formed'],
            population: applications.length,
            active: applications.filter(a => a.stage === 'active_engagement').length,
            matched: applications.filter(a => a.matched_challenges?.length > 0).length,
            pilots: applications.filter(a => a.pilots_launched > 0).length
        },
        MatchmakerEvaluation: {
            status: 'exists',
            fields: ['application_id', 'evaluator_email', 'assessment_scores', 'classification', 'recommended_challenges', 'engagement_plan', 'status'],
            population: evaluations.length
        }
    },

    pages: [
        {
            name: 'MatchmakerApplications',
            path: 'pages/MatchmakerApplications.js',
            status: 'exists',
            coverage: 80,
            features: ['Grid/Table view', 'Filters', 'Search', 'Bulk actions'],
            gaps: ['No AI pipeline view', 'No success rate analytics']
        },
        {
            name: 'MatchmakerEvaluationHub',
            path: 'pages/MatchmakerEvaluationHub.js',
            status: 'complete',
            coverage: 93,
            features: ['Evaluation queue', 'UnifiedEvaluationForm', 'ConsensusPanel', 'AI scoring'],
            gaps: ['No blind review option']
        }
    ],

    components: [
        { name: 'EnhancedMatchingEngine', coverage: 75, status: 'exists', description: 'Semantic matching of providers to challenges' },
        { name: 'MatchQualityGate', coverage: 70, status: 'exists', description: 'Score match quality (0-100)' },
        { name: 'ProviderPerformanceScorecard', coverage: 70, status: 'exists', description: 'Track provider performance over time' }
    ],

    workflows: [
        {
            name: 'Evaluation & Classification',
            stages: [
                { name: 'Assigned to evaluators', status: 'complete', automation: 'ExpertMatchingEngine' },
                { name: 'Structured scorecard', status: 'complete', automation: 'UnifiedEvaluationForm' },
                { name: 'AI classification', status: 'complete', automation: 'AI Assist' },
                { name: 'Multi-evaluator consensus', status: 'complete', automation: 'ConsensusPanel' }
            ],
            coverage: 92,
            gaps: ['Gates not enforced', 'No blind review']
        },
        {
            name: 'Challenge Matching',
            stages: [
                { name: 'AI matching', status: 'complete', automation: 'MatchingEngine' },
                { name: 'Match quality scoring', status: 'complete', automation: 'MatchQualityGate' },
                { name: 'Provider notification', status: 'complete', automation: 'MatchNotifier' }
            ],
            coverage: 75,
            gaps: ['No municipal acceptance workflow', 'Engagement plan not AI-generated']
        }
    ],

    userJourneys: [
        {
            persona: 'Matchmaker Applicant',
            journey: [
                { step: 'Submit application', page: 'MatchmakerApplicationCreate' },
                { step: 'Track status', page: 'MatchmakerJourney' },
                { step: 'View matches', page: 'MatchmakerApplicationDetail' }
            ]
        },
        {
            persona: 'Matchmaker Evaluator',
            journey: [
                { step: 'Access queue', page: 'MatchmakerEvaluationHub' },
                { step: 'Submit evaluation', page: 'UnifiedEvaluationForm' },
                { step: 'View consensus', page: 'EvaluationConsensusPanel' }
            ]
        }
    ],

    aiFeatures: [
        {
            name: 'Challenge Matching',
            status: 'implemented',
            description: 'Semantic matching of providers to challenges',
            accuracy: 'Excellent',
            implementation: 'EnhancedMatchingEngine',
            performance: 'Batch + on-demand'
        },
        {
            name: 'Provider Classification',
            status: 'implemented',
            description: 'AI classifies providers (Innovator/Scaler/Specialist)',
            accuracy: 'Very Good',
            implementation: 'Classification algorithm',
            performance: 'On-demand'
        }
    ],

    integrationPoints: [
        {
            name: 'Expert System → Matchmaker',
            type: 'Strategic Evaluation',
            status: 'complete',
            description: 'Experts evaluate strategic providers and partnerships',
            implementation: 'ExpertEvaluation entity + MatchingEngine'
        },
        {
            name: 'Matchmaker → Pilots',
            type: 'Conversion',
            status: 'partial',
            description: 'Matches convert to pilots',
            implementation: 'PilotConversionWizard',
            gaps: ['Not automatic', 'No attribution']
        }
    ],

    comparisons: {
        matchmakerVsPilots: [
            { aspect: 'Purpose', matchmaker: 'Create partnerships', pilots: 'Test solutions', gap: 'Matchmaker feeds pilots ✅' },
            { aspect: 'Conversion', matchmaker: '⚠️ To Pilot (manual)', pilots: '⚠️ From Matchmaker (partial)', gap: 'Weak conversion ❌' }
        ],
        keyInsight: 'MATCHMAKER is THE PRIMARY OPPORTUNITY DISCOVERY MECHANISM but is MATCHING-ONLY not END-TO-END. Flow should be better integrated from Match → Pilot → Deployment.'
    },

    recommendations: [
        {
            priority: 'P0',
            title: 'Attribution Tracking',
            description: 'Implement a system to track which pilots and partnerships originated from the matchmaker',
            effort: 'Medium',
            impact: 'High'
        },
        {
            priority: 'P1',
            title: 'Municipal Acceptance Workflow',
            description: 'Add a formal step for municipalities to accept or decline matches before providers are notified',
            effort: 'Medium',
            impact: 'Medium'
        }
    ]
});
