export const getChallengesCoverageData = (challenges, pilots, solutions, rdProjects) => ({
    entities: {
        Challenge: {
            status: 'complete',
            fields: {
                core: ['code', 'title_en', 'title_ar', 'description_en', 'description_ar', 'tagline_en', 'tagline_ar'],
                classification: ['sector', 'sector_id', 'sub_sector', 'subsector_id', 'service_id', 'affected_services', 'challenge_type', 'theme', 'keywords'],
                location: ['municipality_id', 'city_id', 'region_id', 'coordinates'],
                ownership: ['challenge_owner_email', 'created_by', 'review_assigned_to', 'reviewer'],
                workflow: ['status', 'track', 'priority', 'submission_date', 'review_date', 'approval_date', 'resolution_date', 'archive_date'],
                problem: ['root_cause_en', 'root_cause_ar', 'root_causes', 'problem_statement', 'current_situation', 'desired_outcome', 'constraints', 'affected_population'],
                evidence: ['data_evidence', 'attachments', 'image_url', 'gallery_urls'],
                metrics: ['severity_score', 'impact_score', 'overall_score', 'kpis', 'affected_population_size', 'citizen_votes_count', 'view_count'],
                ai: ['embedding', 'embedding_model', 'embedding_generated_date', 'ai_summary', 'ai_suggestions'],
                relations: ['linked_pilot_ids', 'linked_rd_ids', 'similar_challenges', 'related_initiatives', 'related_questions_count'],
                flags: ['is_published', 'is_archived', 'is_featured', 'is_confidential', 'escalation_level', 'sla_due_date'],
                versioning: ['version_number', 'previous_version_id'],
                audit: ['is_deleted', 'deleted_date', 'deleted_by'],
                innovation_framing_MISSING: ['❌ hmw_questions', '❌ what_if_scenarios', '❌ guiding_questions (how_can_we, technology_opportunities, global_innovations)']
            },
            population: {
                total: challenges.length,
                with_embedding: challenges.filter(c => c.embedding?.length > 0).length,
                with_ai_suggestions: challenges.filter(c => c.ai_suggestions).length,
                with_track: challenges.filter(c => c.track && c.track !== 'none').length,
                approved: challenges.filter(c => c.status === 'approved').length,
                in_treatment: challenges.filter(c => c.status === 'in_treatment').length,
                resolved: challenges.filter(c => c.status === 'resolved').length,
                with_pilots: challenges.filter(c => c.linked_pilot_ids?.length > 0).length,
                with_rd: challenges.filter(c => c.linked_rd_ids?.length > 0).length
            }
        }
    },

    pages: [
        {
            name: 'Challenges',
            path: 'pages/Challenges.js',
            status: 'complete',
            coverage: 100,
            description: 'Main challenges listing page',
            features: ['✅ Grid/Table/Clusters view modes', '✅ Search and filters', '✅ Bulk actions', '✅ AI strategic insights', '✅ Export functionality'],
            gaps: [],
            aiFeatures: ['Portfolio insights', 'Challenge clustering', 'Pattern detection']
        },
        {
            name: 'ChallengeCreate',
            path: 'pages/ChallengeCreate.js',
            status: 'complete',
            coverage: 100,
            description: 'Multi-step challenge creation wizard',
            features: ['✅ Multi-step wizard', '✅ Bilingual input', '✅ AI enhancement', '✅ AI-suggested KPIs'],
            gaps: [],
            aiFeatures: ['AI enhancement', 'AI form assistant', 'Embedding generation']
        },
        {
            name: 'ChallengeEdit',
            path: 'pages/ChallengeEdit.js',
            status: 'complete',
            coverage: 100,
            description: 'Edit existing challenge with enterprise features',
            features: ['✅ Collaborative editing', '✅ AI full re-enhancement', '✅ Auto-save', '✅ Change tracking'],
            gaps: [],
            aiFeatures: ['Full AI re-enhancement', 'Auto-classification', 'Embedding regeneration']
        },
        {
            name: 'ChallengeDetail',
            path: 'pages/ChallengeDetail.js',
            status: 'complete',
            coverage: 100,
            description: 'Comprehensive challenge view with 27 tabs',
            features: ['✅ 27 Tabs', '✅ Unified Workflow', '✅ Activity Log', '✅ AI Insights', '✅ KPI Dashboard'],
            gaps: [],
            aiFeatures: ['Fresh insights', 'Similar challenges', 'Strategic analysis', 'Smart actions']
        },
        {
            name: 'ChallengeReviewQueue',
            path: 'pages/ChallengeReviewQueue.js',
            status: 'complete',
            coverage: 100,
            description: 'Queue for reviewing submitted challenges',
            features: ['✅ Submitted queue', '✅ Unified evaluation', '✅ Consensus tracking', '✅ Blind review mode'],
            gaps: [],
            aiFeatures: ['Priority sorting', 'AI evaluation assistance']
        }
    ],

    workflows: [
        {
            name: 'Challenge Submission',
            stages: [
                { name: 'Draft creation', status: 'complete', automation: 'Step-by-step wizard' },
                { name: 'AI enhancement', status: 'complete', automation: 'LLM refinement' },
                { name: 'Submission for review', status: 'complete', automation: 'Readiness checklist' }
            ],
            coverage: 100,
            gaps: []
        },
        {
            name: 'Challenge Review & Approval',
            stages: [
                { name: 'Queue entry', status: 'complete', automation: 'Auto-sorting' },
                { name: 'Approval gates', status: 'complete', automation: 'Unified gates' },
                { name: 'Decision & notification', status: 'complete', automation: 'AutoNotification' }
            ],
            coverage: 100,
            gaps: []
        }
    ],

    userJourneys: [
        {
            persona: '1️⃣ Municipality User (Submitter)',
            coverage: 100,
            journey: [
                { step: 'Login & Dashboard', status: 'complete', page: 'MunicipalityDashboard' },
                { step: 'Start Creation', status: 'complete', page: 'ChallengeCreate' },
                { step: 'AI Enhancement', status: 'complete', page: 'ChallengeCreate' },
                { step: 'Submission Wizard', status: 'complete', page: 'ChallengeSubmissionWizard' }
            ]
        },
        {
            persona: '2️⃣ Challenge Owner',
            coverage: 100,
            journey: [
                { step: 'Ownership Transfer', status: 'complete', page: 'ChallengeOwnershipTransfer' },
                { step: 'Monitor Progress', status: 'complete', page: 'ChallengeDetail' },
                { step: 'Update Milestones', status: 'complete', page: 'ChallengeTreatmentPlan' }
            ]
        },
        {
            persona: '3️⃣ Platform Admin',
            coverage: 100,
            journey: [
                { step: 'Review Queue', status: 'complete', page: 'ChallengeReviewQueue' },
                { step: 'Execute Review', status: 'complete', page: 'ChallengeReviewWorkflow' },
                { step: 'Portfolio Analytics', status: 'complete', page: 'ChallengeAnalyticsDashboard' }
            ]
        }
    ],

    aiFeatures: [
        {
            name: 'Challenge Classification',
            status: 'implemented',
            coverage: 100,
            description: 'AI classifies sector, type, priority',
            implementation: 'ChallengeCreate',
            performance: '5-10s',
            accuracy: 'High'
        },
        {
            name: 'Semantic Matching',
            status: 'implemented',
            coverage: 100,
            description: 'Match challenges to solutions via embeddings',
            implementation: 'ChallengeSolutionMatching',
            performance: '1-2s',
            accuracy: 'Very High'
        }
    ],

    conversionPaths: {
        implemented: [
            { path: 'Challenge → Pilot', status: 'complete', coverage: 100, description: 'Design pilot from challenge', automation: 'AI pilot wizard' },
            { path: 'Idea → Challenge', status: 'complete', coverage: 100, description: 'Convert idea to challenge', automation: 'One-click conversion' }
        ]
    },

    integrationPoints: [
        { name: 'Ideas → Challenges', type: 'Entity Conversion', status: 'complete', implementation: 'IdeasManagement' },
        { name: 'Challenges → Pilots', type: 'Entity Link', status: 'complete', implementation: 'linked_pilot_ids' }
    ],

    comparisons: {
        challengesVsIdeas: [
            { aspect: 'Source', challenges: 'Municipalities', ideas: 'Citizens', gap: 'Well differentiated ✅' },
            { aspect: 'Maturity', challenges: 'Validated', ideas: 'Raw', gap: 'Clear path ✅' }
        ]
    },

    rbac: {
        permissions: [
            { name: 'challenge_create', status: 'complete' },
            { name: 'challenge_approve', status: 'complete' }
        ]
    },

    gaps: {
        critical: [],
        completed: ['Innovation Framing', 'Publishing Workflow', 'Expert Evaluator System'],
        remaining: ['PublicPortal Explorer', 'Regional Analytics']
    },

    tabAudit: {
        verifiedTabs: [
            { tab: 1, name: 'Overview', status: 'FULL_CYCLE' },
            { tab: 2, name: 'Problem', status: 'FULL_CYCLE' },
            { tab: 13, name: 'Innovation Framing', status: 'CORRECT_DESIGN' },
            { tab: 20, name: 'Policy', status: 'INCOMPLETE' }
        ]
    },

    recommendations: [
        {
            priority: 'P0',
            title: 'Strategic Alignment',
            description: 'Complete integration with strategic plans',
            effort: 'Medium',
            impact: 'Critical',
            pages: ['ChallengeCreate', 'ChallengeDetail']
        }
    ]
});
