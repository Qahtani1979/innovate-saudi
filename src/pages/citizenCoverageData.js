export const getCitizenCoverageData = (ideas, votes, feedback) => ({
    entities: {
        CitizenIdea: {
            status: 'complete',
            fields: ['title', 'description', 'category', 'status', 'submitter_email', 'submitter_phone', 'vote_count', 'comment_count', 'converted_to_challenge_id'],
            population: ideas.length,
            converted: ideas.filter(i => i.status === 'converted_to_challenge').length,
            underReview: ideas.filter(i => i.status === 'under_review').length
        },
        CitizenVote: {
            status: 'complete',
            fields: ['idea_id', 'voter_identifier', 'ip_address', 'fraud_score', 'verified'],
            population: votes.length,
            verified: votes.filter(v => v.verified).length
        },
        CitizenFeedback: {
            status: 'complete',
            fields: ['entity_type', 'entity_id', 'rating', 'comment', 'citizen_email'],
            population: feedback.length
        }
    },

    pages: [
        {
            name: 'PublicIdeaSubmission',
            path: 'pages/PublicIdeaSubmission.jsx',
            status: 'exists',
            coverage: 90,
            description: 'Public idea submission wizard',
            features: ['✅ Simple form', '✅ Category selection', '✅ AI duplicate detection'],
            gaps: ['❌ No confirmation email'],
            aiFeatures: ['Duplicate detection', 'Classification']
        },
        {
            name: 'PublicIdeasBoard',
            path: 'pages/PublicIdeasBoard.jsx',
            status: 'exists',
            coverage: 85,
            description: 'Public board for viewing and voting',
            features: ['✅ Trending view', '✅ Vote buttons', '✅ Real-time polling'],
            gaps: ['❌ No commenting'],
            aiFeatures: ['Trending algorithm']
        },
        {
            name: 'CitizenDashboard',
            path: 'pages/CitizenDashboard.jsx',
            status: 'complete',
            coverage: 100,
            description: 'Personal dashboard for citizens',
            features: ['✅ Tracking submissions', '✅ Recognition/Points', '✅ Activity timeline'],
            gaps: [],
            aiFeatures: ['Personalized recommendations']
        }
    ],

    workflows: [
        {
            name: 'Idea Submission & Review',
            stages: [
                { name: 'Submit Idea', status: 'complete', automation: 'PublicIdeaSubmission' },
                { name: 'AI Triage', status: 'complete', automation: 'AI Duplicates/Classification' },
                { name: 'Moderation', status: 'complete', automation: 'Moderation Queue' },
                { name: 'Feedback Loop', status: 'complete', automation: 'Citizen Notifications' }
            ],
            coverage: 95,
            gaps: []
        }
    ],

    aiFeatures: [
        {
            name: 'Duplicate Detection',
            status: 'implemented',
            coverage: 100,
            description: 'Detect similar ideas before submission',
            implementation: 'PublicIdeaSubmission',
            performance: 'Real-time',
            accuracy: 'High'
        },
        {
            name: 'Content Moderation',
            status: 'implemented',
            coverage: 100,
            description: 'AI toxicity/spam filter',
            implementation: 'PublicIdeaSubmission',
            performance: 'Real-time',
            accuracy: 'High'
        }
    ],

    conversionPaths: {
        incoming: [
            { path: 'Social Media → Portal', description: 'Referral traffic to ideas board', coverage: 90, automation: 'Social sharing' }
        ],
        outgoing: [
            { path: 'Idea → Challenge', description: 'Convert popular ideas to formal challenges', coverage: 100, automation: 'IdeaToChallengeConverter' }
        ]
    },

    comparisons: {
        keyInsight: 'Generic engagement (CitizenIdea) is correctly optimized for scale and public participation, while formal proposals (InnovationProposal) are structured for rigorous assessment.',
        citizenVsProposals: [
            { aspect: 'Structure', citizen: 'Simple/Informal', proposals: 'Formal/Structured', gap: 'Correct distinction' },
            { aspect: 'Assessment', citizen: 'Public Voting', proposals: 'Expert Review', gap: 'Correct distinction' }
        ]
    },

    evaluatorGaps: {
        current: 'Moderation system is 95% automated with AI toxicity checks and deduplication.',
        completed: ['AI Moderation', 'De-duplication', 'Fraud detection'],
        remaining: ['Blind moderation option']
    },

    rbac: {
        permissions: [
            { name: 'citizen_idea_submit', status: 'partial' },
            { name: 'citizen_idea_vote', status: 'partial' }
        ]
    },

    integrationPoints: [
        { name: 'Citizen → Idea Submission', type: 'Entry', status: 'complete', description: 'Citizen submits idea', implementation: 'PublicIdeaSubmission' }
    ],

    gaps: {
        critical: [],
        high: ['Mobile app availability'],
        medium: ['Multi-dialect support']
    },

    recommendations: [
        {
            priority: 'P0',
            title: 'Citizen Feedback Loop',
            description: 'Complete the loop with dashboard and notifications',
            effort: 'Medium',
            impact: 'Critical',
            pages: ['CitizenDashboard', 'NotificationCenter']
        }
    ]
});
