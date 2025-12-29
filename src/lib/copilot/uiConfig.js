
import {
    LayoutDashboard, History, Sparkles, CheckCircle,
    FileText, Zap, ShieldAlert, Users, Calendar
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
    starter_create_pilot: {
        en: "Create Pilot",
        ar: "إنشاء تجربة"
    },
    starter_navigate: {
        en: "Navigate Dashboard",
        ar: "تصفح اللوحة"
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
