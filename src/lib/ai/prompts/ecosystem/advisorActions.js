
/**
 * Get context-aware advisor actions based on user role and permissions
 * @param {Object} user - User object with roles and permissions
 * @returns {Array} List of allowed actions
 */
export const getAdvisorActions = (user = null) => {
    // Default/Guest Actions
    const actions = [
        {
            id: 'suggest_strategy',
            label: { en: 'Suggest Strategy', ar: 'اقتراح استراتيجية' },
            prompt: 'Suggest a strategic focus for the next quarter based on current performance data.',
            permission: null // Public
        },
        {
            id: 'identify_gaps',
            label: { en: 'Identify Gaps', ar: 'تحديد الفجوات' },
            prompt: 'Analyze my current portfolio and identify the top 3 critical gaps aligned with Vision 2030.',
            permission: 'view_analytics'
        },
        {
            id: 'assess_risks',
            label: { en: 'Assess Risks', ar: 'تقييم المخاطر' },
            prompt: 'What are the highest risks in my active pilots right now, and how can I mitigate them?',
            permission: 'view_risks'
        },
        {
            id: 'resource_check',
            label: { en: 'Resource Check', ar: 'فحص الموارد' },
            prompt: 'Are my resources allocated efficiently across the different sectors? Recommend changes.',
            permission: 'view_finance' // Specific permission
        },
        // Admin / Executive Actions
        {
            id: 'executive_summary',
            label: { en: 'Executive Summary', ar: 'ملخص تنفيذي' },
            prompt: 'Generate a high-level executive summary of the entire ecosystem performance for the Minister.',
            permission: 'view_all_reports'
        },
        // Innovation Manager Actions
        {
            id: 'pilot_acceleration',
            label: { en: 'Accelerate Pilots', ar: 'تسريع المشاريع' },
            prompt: 'Which pilots are stalling and need immediate intervention?',
            permission: 'manage_pilots'
        }
    ];

    // Filter based on permissions
    // If no user provided, return public actions only
    return actions.filter(action => {
        if (!action.permission) return true; // Public action
        if (!user || !user.permissions) return false; // Private action but no user
        return user.permissions.includes(action.permission) || user.role === 'admin';
    });
};
