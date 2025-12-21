export const getRDCoverageData = (rdCalls, rdProjects, rdProposals) => ({
    entities: {
        RDCall: {
            status: 'complete',
            fields: ['code', 'title_en', 'title_ar', 'description_en', 'description_ar', 'research_areas', 'expected_outputs', 'budget_available', 'trl_target', 'submission_deadline', 'linked_challenge_ids', 'status', 'stage'],
            population: rdCalls.length,
            with_embedding: rdCalls.filter(c => c.embedding?.length > 0).length
        },
        RDProject: {
            status: 'complete',
            fields: ['code', 'title_en', 'title_ar', 'research_question', 'methodology', 'trl_current', 'trl_target', 'budget_allocated', 'budget_spent', 'milestones', 'outputs', 'publications', 'linked_pilot_ids', 'linked_challenge_ids', 'status', 'stage'],
            population: rdProjects.length,
            with_embedding: rdProjects.filter(p => p.embedding?.length > 0).length
        },
        RDProposal: {
            status: 'complete',
            fields: ['rd_call_id', 'researcher_email', 'organization_id', 'proposal_title', 'research_approach', 'expected_trl', 'budget_requested', 'team_members', 'evaluation_scores', 'status'],
            population: rdProposals.length
        }
    },

    pages: [
        {
            name: 'RDCalls',
            path: 'pages/RDCalls.js',
            status: 'exists',
            coverage: 80,
            description: 'R&D calls listing',
            features: ['✅ Grid/List view', '✅ Filters (sector, status)', '✅ Deadline tracking'],
            gaps: ['⚠️ No AI call generator from challenges', '⚠️ No challenge clustering to call'],
            aiFeatures: ['Basic recommendations']
        },
        {
            name: 'RDCallDetail',
            path: 'pages/RDCallDetail.js',
            status: 'exists',
            coverage: 85,
            description: 'R&D call details',
            features: ['✅ Call information', '✅ Linked challenges', '✅ Proposal tracking', '✅ Comments'],
            gaps: ['⚠️ No proposal comparison', '⚠️ No AI proposal ranking'],
            aiFeatures: ['Challenge matching']
        },
        {
            name: 'RDCallEdit',
            path: 'pages/RDCallEdit.js',
            status: 'exists',
            coverage: 75,
            description: 'Edit R&D call',
            features: ['✅ Full editing', '✅ Bilingual'],
            gaps: ['⚠️ No AI enhancement'],
            aiFeatures: []
        },
        {
            name: 'RDProjects',
            path: 'pages/RDProjects.js',
            status: 'exists',
            coverage: 80,
            description: 'R&D projects listing',
            features: ['✅ Project list', '✅ Filters (TRL, sector, status)', '✅ Search'],
            gaps: ['⚠️ No portfolio analytics', '⚠️ No TRL progression view'],
            aiFeatures: ['Smart filters']
        },
        {
            name: 'RDProjectDetail',
            path: 'pages/RDProjectDetail.js',
            status: 'complete',
            coverage: 100,
            description: 'R&D project details with full lifecycle management',
            features: [
                '✅ 20-tab interface (Overview, Workflow, Activity, TRL, Team, Methodology, Timeline, Budget, Outputs, Publications, Datasets, Impact, Pilot, Media, Discussion, Experts, AI Connections, Policy, IP, Final Eval)',
                '✅ UnifiedWorkflowApprovalTab integration',
                '✅ RDProjectActivityLog comprehensive',
                '✅ TRLAssessmentWorkflow for TRL tracking',
                '✅ Expert peer review panel display + Final Evaluation Panel',
                '✅ IPManagementWidget for patents & licensing',
                '✅ RDToSolutionConverter for commercialization',
                '✅ RDToPolicyConverter for policy impact',
                '✅ RDToPilotTransition for pilot creation',
                '✅ AI insights generation',
                '✅ CrossEntityRecommender integration',
                '✅ PolicyTabWidget integration'
            ],
            gaps: [],
            aiFeatures: ['AI insights', 'Expert matching', 'TRL assessment', 'Commercialization profiler', 'Policy translator', 'Pilot designer']
        },
        {
            name: 'RDProjectCreate',
            path: 'pages/RDProjectCreate.js',
            status: 'exists',
            coverage: 75,
            description: 'Create R&D project',
            features: ['✅ Project wizard', '✅ Pre-fill from proposal/call'],
            gaps: ['⚠️ No AI project designer', '⚠️ No methodology recommender'],
            aiFeatures: ['Basic classification']
        },
        {
            name: 'RDProjectEdit',
            path: 'pages/RDProjectEdit.js',
            status: 'exists',
            coverage: 80,
            description: 'Edit R&D project',
            features: ['✅ Full editing', '✅ Milestone management'],
            gaps: ['⚠️ No major change approval'],
            aiFeatures: []
        },
        {
            name: 'ProposalWizard',
            path: 'pages/ProposalWizard.js',
            status: 'exists',
            coverage: 70,
            description: 'Submit R&D proposal',
            features: ['✅ Multi-step wizard', '✅ Team builder', '✅ Budget planner'],
            gaps: ['⚠️ No AI proposal writer', '⚠️ No similar proposal reference'],
            aiFeatures: []
        },
        {
            name: 'RDProposalDetail',
            path: 'pages/RDProposalDetail.js',
            status: 'exists',
            coverage: 75,
            description: 'Proposal details',
            features: ['✅ Proposal view', '✅ Evaluation display'],
            gaps: ['⚠️ No proposal comparison', '⚠️ No evaluation scorecard view'],
            aiFeatures: []
        },
        {
            name: 'ProposalReviewPortal',
            path: 'pages/ProposalReviewPortal.js',
            status: 'complete',
            coverage: 92,
            description: 'Review R&D proposals with unified peer review',
            features: [
                '✅ Proposal queue',
                '✅ UnifiedEvaluationForm integration',
                '✅ EvaluationConsensusPanel display',
                '✅ Multi-reviewer peer review',
                '✅ Automatic consensus detection',
                '✅ Scientific merit scoring'
            ],
            gaps: ['⚠️ No blind review option'],
            aiFeatures: ['AI ranking', 'AI peer review assistance']
        },
        {
            name: 'RDPortfolioControlDashboard',
            path: 'pages/RDPortfolioControlDashboard.js',
            status: 'exists',
            coverage: 75,
            description: 'R&D portfolio analytics',
            features: ['✅ Portfolio view', '✅ Budget tracking'],
            gaps: ['⚠️ No TRL progression analytics', '⚠️ No output impact tracking'],
            aiFeatures: ['Portfolio insights']
        },
        {
            name: 'RDProgressTracker',
            path: 'pages/RDProgressTracker.js',
            status: 'exists',
            coverage: 70,
            description: 'Track R&D progress',
            features: ['✅ Milestone tracking', '✅ Timeline view'],
            gaps: ['⚠️ No real-time updates', '⚠️ No delay prediction'],
            aiFeatures: ['Progress forecasting']
        },
        {
            name: 'ResearchOutputsHub',
            path: 'pages/ResearchOutputsHub.js',
            status: 'exists',
            coverage: 65,
            description: 'Research outputs and publications',
            features: ['✅ Output listing', '✅ Publication tracking'],
            gaps: ['⚠️ No commercialization tracker', '⚠️ No IP management'],
            aiFeatures: ['Impact prediction']
        },
        {
            name: 'ChallengeRDCallMatcher',
            path: 'pages/ChallengeRDCallMatcher.js',
            status: 'exists',
            coverage: 80,
            description: 'Match challenges to R&D calls',
            features: ['✅ Semantic matching', '✅ Batch operations'],
            gaps: ['⚠️ No auto-call generation'],
            aiFeatures: ['Semantic matching']
        },
        {
            name: 'RDProjectPilotMatcher',
            path: 'pages/RDProjectPilotMatcher.js',
            status: 'exists',
            coverage: 75,
            description: 'Match R&D to pilots',
            features: ['✅ Matching engine', '✅ TRL filtering'],
            gaps: ['⚠️ No automated transition'],
            aiFeatures: ['TRL-based matching']
        }
    ],

    workflows: [
        {
            name: 'R&D Call Creation & Publishing',
            stages: [
                { name: 'Identify research need', status: 'partial', automation: 'Manual' },
                { name: 'Draft call text', status: 'complete', automation: 'RDCallCreate form' },
                { name: 'Link to challenges', status: 'complete', automation: 'ChallengeRDCallMatcher' },
                { name: 'Set budget and timeline', status: 'complete', automation: 'Form fields' },
                { name: 'Approval workflow', status: 'complete', automation: 'RDCallApprovalWorkflow' },
                { name: 'Publish call', status: 'complete', automation: 'RDCallPublishWorkflow' }
            ],
            coverage: 70,
            gaps: ['❌ No AI call generator from challenges', '❌ No evaluation rubric builder']
        },
        {
            name: 'Proposal Submission & Review',
            stages: [
                { name: 'Researcher discovers call', status: 'complete', automation: 'RDCalls listing' },
                { name: 'Draft proposal', status: 'complete', automation: 'ProposalWizard' },
                { name: 'Submit proposal', status: 'complete', automation: 'ProposalSubmissionWizard' },
                { name: 'Assigned to peer reviewers', status: 'complete', automation: '✅ ExpertMatchingEngine' },
                { name: 'Multi-reviewer peer evaluation', status: 'complete', automation: '✅ UnifiedEvaluationForm' },
                { name: 'Peer review consensus', status: 'complete', automation: '✅ EvaluationConsensusPanel' }
            ],
            coverage: 92,
            gaps: ['❌ No AI proposal writer', '⚠️ No blind review option']
        },
        {
            name: 'R&D Project Execution',
            stages: [
                { name: 'Project kickoff', status: 'complete', automation: 'RDProjectKickoffWorkflow' },
                { name: 'Milestone tracking', status: 'complete', automation: 'RDProjectMilestoneGate' },
                { name: 'TRL advancement', status: 'complete', automation: 'TRLAssessmentWorkflow' },
                { name: 'IP management', status: 'complete', automation: 'IPManagementWidget' }
            ],
            coverage: 100,
            gaps: []
        }
    ],

    aiFeatures: [
        {
            name: 'Challenge-to-Call Matching',
            status: 'implemented',
            coverage: 85,
            description: 'Match challenges to R&D calls semantically',
            implementation: 'ChallengeRDCallMatcher',
            performance: 'Batch (2-5s)',
            accuracy: 'Very Good'
        },
        {
            name: 'Proposal Scoring',
            status: 'implemented',
            coverage: 100,
            description: 'AI scores proposals',
            implementation: 'UnifiedEvaluationForm AI Assist',
            performance: 'On-demand',
            accuracy: 'High'
        },
        {
            name: 'TRL Assessment',
            status: 'implemented',
            coverage: 100,
            description: 'Assess Technology Readiness Level',
            implementation: 'TRLAssessmentWorkflow in RDProjectDetail',
            performance: 'AI-powered',
            accuracy: 'High'
        }
    ],

    recommendations: [
        {
            priority: 'P0',
            title: 'Proposal Evaluator Workflow',
            description: 'Academic peer review workflow fully implemented via ExpertEvaluation entity',
            effort: 'Large (COMPLETED)',
            impact: 'Critical'
        }
    ]
});
