export const getSandboxesCoverageData = (sandboxes, applications, pilots) => ({
    entities: {
        Sandbox: {
            status: 'complete',
            fields: ['name_en', 'name_ar', 'sandbox_type', 'zone_location', 'capacity', 'infrastructure', 'regulations', 'exemptions', 'monitoring_systems', 'status', 'is_active', 'sector_id', 'subsector_id', 'service_focus_ids', 'strategic_pillar_id', 'strategic_objective_ids', 'municipality_id'],
            taxonomyAdded: [
                '✅ sector_id (primary sector)',
                '✅ subsector_id (specialization)',
                '✅ service_focus_ids (which services tested)',
                '✅ strategic_pillar_id (strategic alignment)',
                '✅ strategic_objective_ids (objectives supported)',
                '✅ municipality_id (host municipality)'
            ],
            population: sandboxes.length,
            active: sandboxes.filter(s => s.is_active).length,
            physical: sandboxes.filter(s => s.sandbox_type === 'physical_zone').length,
            virtual: sandboxes.filter(s => s.sandbox_type === 'virtual').length
        },
        SandboxApplication: {
            status: 'complete',
            fields: ['sandbox_id', 'applicant_email', 'organization_id', 'project_description', 'regulatory_needs', 'exemptions_requested', 'safety_protocols', 'status', 'evaluation_scores'],
            population: applications.length,
            pending: applications.filter(a => a.status === 'pending').length,
            approved: applications.filter(a => a.status === 'approved').length
        },
        SandboxCertification: {
            status: 'exists',
            fields: ['sandbox_id', 'solution_id', 'certification_type', 'certification_date', 'test_results', 'certificate_url'],
            description: '✅ COMPLETE - Sandbox-tested credential for solutions'
        }
    },

    pages: [
        {
            name: 'Sandboxes',
            path: 'pages/Sandboxes.js',
            status: 'exists',
            coverage: 80,
            features: ['Grid/Map view', 'Filters (type, location, capacity)', 'Availability display'],
            gaps: ['No capacity planning', 'No zone comparison tool']
        },
        {
            name: 'SandboxDetail',
            path: 'pages/SandboxDetail.js',
            status: 'exists',
            coverage: 85,
            features: ['Multi-tab interface', 'Exemptions display', 'Monitoring dashboard', 'Project tracking'],
            gaps: ['No real-time monitoring integration', 'No 3D zone visualization']
        },
        {
            name: 'SandboxApplicationDetail',
            path: 'pages/SandboxApplicationDetail.js',
            status: 'exists',
            coverage: 90,
            features: ['7-tab interface', 'Expert technical reviews', 'Link to ExpertMatchingEngine', 'AI risk assessment display'],
            gaps: ['No structured scorecard view']
        }
    ],

    components: [
        { name: 'SandboxApplicationWizard', coverage: 70, status: 'exists', description: 'Multi-step application flow' },
        { name: 'SandboxMonitoringDashboard', coverage: 65, status: 'exists', description: 'Real-time monitoring view' },
        { name: 'SandboxAIRiskAssessment', coverage: 60, status: 'exists', description: 'AI-powered risk analysis' },
        { name: 'SandboxCertificationWorkflow', coverage: 100, status: 'exists', description: 'UI workflow for issuing certificates' }
    ],

    workflows: [
        {
            name: 'Sandbox Zone Setup & Launch',
            stages: [
                { name: 'Define zone type', status: 'complete', automation: 'SandboxCreate form' },
                { name: 'Configure capacity', status: 'complete', automation: 'Capacity fields' },
                { name: 'Define exemptions', status: 'complete', automation: 'Exemption selector' },
                { name: 'Infrastructure readiness', status: 'complete', automation: 'ReadinessGate' }
            ],
            coverage: 75,
            gaps: ['No Pilot→Sandbox need detector', 'AI safety not integrated']
        },
        {
            name: 'Sandbox Application & Approval',
            stages: [
                { name: 'Submit application', status: 'complete', automation: 'ApplicationWizard' },
                { name: 'AI risk assessment', status: 'complete', automation: 'RiskAssessment UI' },
                { name: 'Expert review', status: 'complete', automation: 'ExpertSystem link' },
                { name: 'Regulatory check', status: 'complete', automation: 'ComplianceChecker' }
            ],
            coverage: 60,
            gaps: ['No reviewer assignment', 'No multi-stakeholder workflow']
        }
    ],

    userJourneys: [
        {
            persona: 'Sandbox Applicant',
            journey: [
                { step: 'Browse sandboxes', page: 'Sandboxes' },
                { step: 'View details', page: 'SandboxDetail' },
                { step: 'Apply for access', page: 'SandboxApplicationWizard' },
                { step: 'Track status', page: 'N/A', implementation: 'Email notifications only' }
            ]
        },
        {
            persona: 'Safety Officer',
            journey: [
                { step: 'Review application', page: 'SandboxApplicationDetail' },
                { step: 'Review AI risk', page: 'SandboxApplicationDetail' },
                { step: 'Submit evaluation', page: 'Expert System UI' }
            ]
        }
    ],

    aiFeatures: [
        {
            name: 'Risk Assessment',
            status: 'implemented',
            description: 'AI assesses risk of sandbox applications',
            accuracy: 'Good',
            implementation: 'SandboxAIRiskAssessment',
            performance: 'On-demand'
        },
        {
            name: 'Exemption Suggester',
            status: 'partial',
            description: 'AI suggests needed exemptions',
            accuracy: 'Moderate',
            implementation: 'AIExemptionSuggester exists',
            performance: 'On-demand'
        },
        {
            name: 'Pilot Matching',
            status: 'implemented',
            description: 'Match sandbox projects to pilot opportunities',
            accuracy: 'Good',
            implementation: 'SandboxPilotMatcher',
            performance: 'On-demand'
        }
    ],

    integrationPoints: [
        {
            name: 'Expert System → Sandboxes',
            type: 'Technical & Safety Review',
            status: 'complete',
            description: '✅ UNIFIED - Experts provide technical and safety reviews via unified ExpertEvaluation entity',
            implementation: 'SandboxApplicationDetail Experts tab + ExpertEvaluation'
        },
        {
            name: 'Sandboxes → Solutions',
            type: 'Certification',
            status: 'complete',
            description: '✅ Sandbox certification enhances solutions',
            implementation: 'SandboxCertificationWorkflow component'
        },
        {
            name: 'Sandboxes → Policy',
            type: 'Regulatory Learning',
            status: 'complete',
            description: '✅ Sandbox findings inform regulatory reform',
            implementation: 'SandboxPolicyFeedbackWorkflow in SandboxDetail'
        }
    ],

    recommendations: [
        {
            priority: 'P0',
            title: 'Real-time Monitoring Integration',
            description: 'Connect monitoring dashboard to live sensor/usage data',
            effort: 'Large',
            impact: 'High'
        },
        {
            priority: 'P1',
            title: 'Applicant Dashboard',
            description: 'Build a dedicated portal for applicants to track status and submit data',
            effort: 'Medium',
            impact: 'High'
        },
        {
            priority: 'P1',
            title: 'AI Workflow Integration',
            description: 'Embed exemption suggester and safety protocol generator in the application flow',
            effort: 'Medium',
            impact: 'Medium'
        }
    ]
});
