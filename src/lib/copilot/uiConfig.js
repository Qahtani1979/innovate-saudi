
import {
    LayoutDashboard, History, Sparkles, CheckCircle,
    FileText, Zap, ShieldAlert, Users, Calendar,
    Lightbulb, Search, Target, TrendingUp, Building2,
    Vote, MessageSquare, Briefcase, ClipboardList, Eye
} from 'lucide-react';

export const COPILOT_UI_TEXT = {
    greeting: {
        en: "How can I help you govern today?",
        ar: "كيف يمكنني مساعدتك في الحوكمة اليوم؟"
    },
    subtitle: {
        en: "I have access to your dashboard, pilots, and challenges. Ask me anything.",
        ar: "لدي وصول إلى لوحة المعلومات والتجارب والتحديات. اسألني أي شيء."
    },
    context_title: {
        en: "Context",
        ar: "السياق"
    },
    project_dashboard: {
        en: "Project Dashboard",
        ar: "لوحة المشاريع"
    },
    recent_chats: {
        en: "Recent Chats",
        ar: "المحادثات الأخيرة"
    },
    thinking: {
        en: "Thinking...",
        ar: "جار المعالجة..."
    },
    placeholder: {
        en: "Type a command or ask a question...",
        ar: "اكتب أمرًا أو اسأل سؤالاً..."
    },
    active_stats: {
        en: "Active Stats",
        ar: "الإحصائيات النشطة"
    },
    stats_subtitle: {
        en: "Real-time Ecosystem Metrics",
        ar: "مقياس النظام البيئي"
    },
    stats_placeholder: {
        en: "Select a pilot to view deeper analytics here.",
        ar: "حدد تجربة لعرض تحليلات أعمق هنا."
    },
    view_details: {
        en: "View details",
        ar: "عرض التفاصيل"
    },
    execute_pilot: {
        en: "Execute Pilot",
        ar: "تنفيذ التجربة"
    },
    create_pilot_now: {
        en: "Create pilot now",
        ar: "أنشئ التجربة الآن"
    },
    context_updated: {
        en: "Context Updated",
        ar: "تم تحديث السياق"
    },
    found_items: {
        en: "Found Results",
        ar: "النتائج التي تم العثور عليها"
    },
    assistant_intro: {
        en: "Here is what I found:",
        ar: "إليك ما وجدته:"
    }
};

/**
 * Role-based greeting customization
 */
export const ROLE_GREETINGS = {
    admin: {
        greeting: { en: "Welcome back, Admin", ar: "مرحباً بعودتك، المدير" },
        subtitle: { en: "Full access to all platform capabilities.", ar: "وصول كامل لجميع إمكانيات المنصة." }
    },
    municipality_staff: {
        greeting: { en: "How can I help you today?", ar: "كيف يمكنني مساعدتك اليوم؟" },
        subtitle: { en: "Manage pilots, challenges, and strategic initiatives.", ar: "إدارة التجارب والتحديات والمبادرات الاستراتيجية." }
    },
    provider: {
        greeting: { en: "Ready to innovate?", ar: "جاهز للابتكار؟" },
        subtitle: { en: "Browse opportunities and submit proposals.", ar: "تصفح الفرص وقدم المقترحات." }
    },
    citizen: {
        greeting: { en: "Your voice matters", ar: "صوتك مهم" },
        subtitle: { en: "Share ideas and participate in innovation.", ar: "شارك أفكارك وانضم للابتكار." }
    },
    default: {
        greeting: { en: "How can I help you govern today?", ar: "كيف يمكنني مساعدتك في الحوكمة اليوم؟" },
        subtitle: { en: "Explore innovation opportunities.", ar: "استكشف فرص الابتكار." }
    }
};

/**
 * Role-based Starter Actions
 * Each action has: label, icon, prompt (trigger message)
 */
export const STARTER_ACTIONS = {
    // Admin/Super Admin actions
    admin: [
        { id: 'create_pilot', label: { en: 'Create Pilot', ar: 'إنشاء تجربة' }, icon: Zap, prompt: { en: 'Create a new pilot project', ar: 'أنشئ مشروع تجريبي جديد' } },
        { id: 'create_challenge', label: { en: 'Create Challenge', ar: 'إنشاء تحدي' }, icon: Target, prompt: { en: 'Create a new innovation challenge', ar: 'أنشئ تحدي ابتكار جديد' } },
        { id: 'view_analytics', label: { en: 'View Analytics', ar: 'عرض التحليلات' }, icon: TrendingUp, prompt: { en: 'Show me the platform analytics and KPIs', ar: 'اعرض لي تحليلات المنصة ومؤشرات الأداء' } },
        { id: 'manage_programs', label: { en: 'Manage Programs', ar: 'إدارة البرامج' }, icon: Briefcase, prompt: { en: 'List all innovation programs', ar: 'اعرض جميع برامج الابتكار' } },
    ],
    
    // Municipality Staff actions
    municipality_staff: [
        { id: 'create_pilot', label: { en: 'Create Pilot', ar: 'إنشاء تجربة' }, icon: Zap, prompt: { en: 'Create a new pilot project', ar: 'أنشئ مشروع تجريبي جديد' } },
        { id: 'submit_challenge', label: { en: 'Submit Challenge', ar: 'تقديم تحدي' }, icon: Target, prompt: { en: 'I want to submit a new challenge', ar: 'أريد تقديم تحدي جديد' } },
        { id: 'my_tasks', label: { en: 'My Tasks', ar: 'مهامي' }, icon: ClipboardList, prompt: { en: 'Show me my pending tasks and approvals', ar: 'اعرض لي مهامي والموافقات المعلقة' } },
        { id: 'browse_solutions', label: { en: 'Browse Solutions', ar: 'تصفح الحلول' }, icon: Search, prompt: { en: 'Show available solutions for my challenges', ar: 'اعرض الحلول المتاحة لتحدياتي' } },
    ],
    
    // Provider/Startup actions
    provider: [
        { id: 'browse_challenges', label: { en: 'Browse Challenges', ar: 'تصفح التحديات' }, icon: Target, prompt: { en: 'Show me open challenges I can apply to', ar: 'اعرض لي التحديات المفتوحة للتقديم' } },
        { id: 'submit_proposal', label: { en: 'Submit Proposal', ar: 'تقديم مقترح' }, icon: FileText, prompt: { en: 'I want to submit a proposal', ar: 'أريد تقديم مقترح' } },
        { id: 'my_solutions', label: { en: 'My Solutions', ar: 'حلولي' }, icon: Lightbulb, prompt: { en: 'Show my registered solutions', ar: 'اعرض الحلول المسجلة لدي' } },
        { id: 'opportunities', label: { en: 'Opportunities', ar: 'الفرص' }, icon: Sparkles, prompt: { en: 'What opportunities are available for providers?', ar: 'ما الفرص المتاحة لمقدمي الحلول؟' } },
    ],
    
    // Citizen actions
    citizen: [
        { id: 'submit_idea', label: { en: 'Submit Idea', ar: 'تقديم فكرة' }, icon: Lightbulb, prompt: { en: 'I have an idea to share', ar: 'لدي فكرة أريد مشاركتها' } },
        { id: 'vote_ideas', label: { en: 'Vote on Ideas', ar: 'التصويت على الأفكار' }, icon: Vote, prompt: { en: 'Show me ideas I can vote on', ar: 'اعرض لي الأفكار التي يمكنني التصويت عليها' } },
        { id: 'nearby_pilots', label: { en: 'Pilots Near Me', ar: 'تجارب قريبة مني' }, icon: Building2, prompt: { en: 'Show pilots happening in my city', ar: 'اعرض التجارب الجارية في مدينتي' } },
        { id: 'give_feedback', label: { en: 'Give Feedback', ar: 'تقديم ملاحظات' }, icon: MessageSquare, prompt: { en: 'I want to give feedback', ar: 'أريد تقديم ملاحظات' } },
    ],
    
    // Viewer/Guest actions (default)
    default: [
        { id: 'explore_challenges', label: { en: 'Explore Challenges', ar: 'استكشف التحديات' }, icon: Target, prompt: { en: 'Show me innovation challenges', ar: 'اعرض لي تحديات الابتكار' } },
        { id: 'browse_solutions', label: { en: 'Browse Solutions', ar: 'تصفح الحلول' }, icon: Search, prompt: { en: 'Show available solutions', ar: 'اعرض الحلول المتاحة' } },
        { id: 'learn_programs', label: { en: 'Learn About Programs', ar: 'تعرف على البرامج' }, icon: Eye, prompt: { en: 'Tell me about innovation programs', ar: 'أخبرني عن برامج الابتكار' } },
    ]
};

/**
 * Get starter actions for a user role
 * @param {string} role - User role
 * @returns {Array} Array of starter actions
 */
export function getStarterActionsForRole(role) {
    // Normalize role
    const normalizedRole = role?.toLowerCase()?.replace(/[-\s]/g, '_') || 'default';
    
    // Check for admin variants
    if (normalizedRole.includes('admin') || normalizedRole.includes('super')) {
        return STARTER_ACTIONS.admin;
    }
    
    // Check for staff variants
    if (normalizedRole.includes('staff') || normalizedRole.includes('municipality')) {
        return STARTER_ACTIONS.municipality_staff;
    }
    
    // Check for provider/startup variants
    if (normalizedRole.includes('provider') || normalizedRole.includes('startup') || normalizedRole.includes('vendor')) {
        return STARTER_ACTIONS.provider;
    }
    
    // Check for citizen
    if (normalizedRole.includes('citizen')) {
        return STARTER_ACTIONS.citizen;
    }
    
    return STARTER_ACTIONS.default;
}

/**
 * Get greeting for a user role
 * @param {string} role - User role
 * @returns {Object} Greeting and subtitle
 */
export function getGreetingForRole(role) {
    const normalizedRole = role?.toLowerCase()?.replace(/[-\s]/g, '_') || 'default';
    
    if (normalizedRole.includes('admin') || normalizedRole.includes('super')) {
        return ROLE_GREETINGS.admin;
    }
    if (normalizedRole.includes('staff') || normalizedRole.includes('municipality')) {
        return ROLE_GREETINGS.municipality_staff;
    }
    if (normalizedRole.includes('provider') || normalizedRole.includes('startup')) {
        return ROLE_GREETINGS.provider;
    }
    if (normalizedRole.includes('citizen')) {
        return ROLE_GREETINGS.citizen;
    }
    
    return ROLE_GREETINGS.default;
}

/**
 * Maps Entity Types to Icons and specialized rendering hints.
 */
export const ENTITY_CONFIG = {
    'task': {
        icon: CheckCircle,
        color: 'text-green-500',
        label: { en: 'Task', ar: 'مهمة' }
    },
    'contract': {
        icon: FileText,
        color: 'text-blue-500',
        label: { en: 'Contract', ar: 'عقد' }
    },
    'risk': {
        icon: ShieldAlert,
        color: 'text-red-500',
        label: { en: 'Risk', ar: 'خطر' }
    },
    'pilot': {
        icon: Zap,
        color: 'text-purple-500',
        label: { en: 'Pilot', ar: 'تجربة' }
    },
    'challenge': {
        icon: Sparkles,
        color: 'text-amber-500',
        label: { en: 'Challenge', ar: 'تحدي' }
    },
    'team': {
        icon: Users,
        color: 'text-indigo-500',
        label: { en: 'Team', ar: 'فريق' }
    },
    'event': {
        icon: Calendar,
        color: 'text-pink-500',
        label: { en: 'Event', ar: 'حدث' }
    },
    'default': {
        icon: LayoutDashboard,
        color: 'text-gray-500',
        label: { en: 'Item', ar: 'عنصر' }
    }
};
