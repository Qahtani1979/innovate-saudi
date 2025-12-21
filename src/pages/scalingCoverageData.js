export const getScalingCoverageData = (pilots, scalingPlans, scalingReadiness) => ({
    entities: {
        ScalingPlan: {
            status: 'exists',
            fields: ['pilot_id', 'scaling_model', 'target_cities', 'timeline', 'budget_required', 'resources_needed', 'risk_assessment', 'milestones', 'success_criteria', 'status'],
            population: scalingPlans.length,
            active: scalingPlans.filter(s => s.status === 'active').length
        },
        ScalingReadiness: {
            status: 'exists',
            fields: ['pilot_id', 'readiness_score', 'technical_readiness', 'financial_readiness', 'organizational_readiness', 'regulatory_readiness', 'gaps_identified', 'recommendations'],
            population: scalingReadiness.length
        }
    },

    pages: [
        {
            name: 'ScalingWorkflow',
            path: 'pages/ScalingWorkflow.js',
            status: 'exists',
            coverage: 70,
            features: ['Scaling pipeline view', 'Readiness assessment', 'Basic workflow'],
            gaps: ['No multi-city orchestration', 'No scaling analytics']
        },
        {
            name: 'ScalingPlanDetail',
            path: 'pages/ScalingPlanDetail.js',
            status: 'exists',
            coverage: 92,
            features: ['7-tab interface', 'Expert sign-off', 'Multi-expert consensus', 'Execution dashboard'],
            gaps: ['No real-time impact tracking']
        }
    ],

    components: [
        { name: 'ScalingPlanningWizard', coverage: 70, status: 'exists', description: 'Multi-step scaling plan creation' },
        { name: 'ScalingReadinessChecker', coverage: 70, status: 'exists', description: 'Structured assessment of pilot readiness' },
        { name: 'BudgetApprovalGate', coverage: 60, status: 'exists', description: 'Financial verification step' }
    ],

    workflows: [
        {
            name: 'Scaling Readiness Assessment',
            stages: [
                { name: 'Technical readiness', status: 'partial', automation: 'ReadinessChecker' },
                { name: 'Readiness score', status: 'complete', automation: 'Calculated field' },
                { name: 'Go/No-Go decision', status: 'partial', automation: 'Manual decision' }
            ],
            coverage: 60,
            gaps: ['AI readiness not integrated', 'Financial/org/regulatory manual']
        },
        {
            name: 'Scaling Plan Development',
            stages: [
                { name: 'Define scaling model', status: 'complete', automation: 'PlanningWizard' },
                { name: 'Select target cities', status: 'complete', automation: 'City selector' },
                { name: 'Risk assessment', status: 'complete', automation: 'RiskPredictor' }
            ],
            coverage: 70,
            gaps: ['Rollout sequencing not integrated', 'Gates not enforced']
        }
    ],

    userJourneys: [
        {
            persona: 'Scaling Program Manager',
            journey: [
                { step: 'Identify successful pilot', page: 'Pilots dashboard' },
                { step: 'Assess readiness', page: 'ScalingReadinessChecker' },
                { step: 'Create scaling plan', page: 'ScalingPlanningWizard' },
                { step: 'Monitor rollout', page: 'ScalingExecutionDashboard' }
            ]
        },
        {
            persona: 'Adopting Municipality',
            journey: [
                { step: 'Onboard to scaling', page: 'MunicipalOnboardingWizard' },
                { step: 'Adapt solution', page: 'IterationOptimizationTool' },
                { step: 'Track progress', page: 'N/A', implementation: 'Manual' }
            ]
        }
    ],

    aiFeatures: [
        {
            name: 'Readiness Prediction',
            status: 'partial',
            description: 'Predict if pilot ready to scale',
            accuracy: 'Moderate',
            implementation: 'AIScalingReadinessPredictor',
            performance: 'On-demand'
        },
        {
            name: 'Rollout Risk Prediction',
            status: 'implemented',
            description: 'Predict risks in multi-city rollout',
            accuracy: 'Good',
            implementation: 'RolloutRiskPredictor',
            performance: 'On-demand'
        },
        {
            name: 'Cost-Benefit Analysis',
            status: 'implemented',
            description: 'Analyze ROI of scaling',
            accuracy: 'Good',
            implementation: 'ScalingCostBenefitAnalyzer',
            performance: 'On-demand'
        }
    ],

    integrationPoints: [
        {
            name: 'Expert System → Scaling',
            type: 'Sign-Off & Approval',
            status: 'complete',
            description: 'Experts provide sign-offs for scaling plans',
            implementation: 'ScalingPlanDetail Experts tab + ExpertEvaluation'
        },
        {
            name: 'Pilots → Scaling',
            type: 'Success Graduation',
            status: 'partial',
            description: 'Successful pilots graduate to scaling',
            implementation: 'ScalingWorkflow triggered from pilot',
            gaps: ['Manual trigger']
        }
    ],

    comparisons: {
        scalingVsPilots: [
            { aspect: 'Scope', scaling: 'Multi-city (national)', pilots: 'Single city (local)', gap: 'Scale difference ✅' },
            { aspect: 'Complexity', scaling: 'High (coordination)', pilots: 'Medium (testing)', gap: 'Scaling more complex ✅' }
        ],
        keyInsight: 'SCALING is the FINAL STAGE but ORPHANED. It lacks clear outputs like BAU transition or policy updates.'
    },

    recommendations: [
        {
            priority: 'P0',
            title: 'BAU Transition Workflow',
            description: 'Implement a formal handoff process from scaling projects to permanent municipal operations',
            effort: 'Large',
            impact: 'Critical'
        },
        {
            priority: 'P1',
            title: 'National Impact Dashboard',
            description: 'Aggregate and visualize the nationwide impact of scaled solutions for executive review',
            effort: 'Medium',
            impact: 'High'
        }
    ]
});
