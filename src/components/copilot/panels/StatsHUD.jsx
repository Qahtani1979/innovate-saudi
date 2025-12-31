import { useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GenUICard } from '@/components/copilot/widgets/GenUICard';
import { useLanguage } from '@/components/LanguageContext';
import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { useCopilotStore } from '@/lib/store/copilotStore';
import { 
    MessageSquare, 
    Zap, 
    TrendingUp,
    Bot,
    Target,
    Sparkles
} from 'lucide-react';

function StatItem({ icon: Icon, label, value, trend, color = 'text-primary' }) {
    return (
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg bg-background flex items-center justify-center ${color}`}>
                    <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <div className="text-end">
                <span className="text-sm font-semibold">{value}</span>
                {trend && (
                    <span className={`text-[10px] ms-1 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {trend > 0 ? '↑' : '↓'}{Math.abs(trend)}%
                    </span>
                )}
            </div>
        </div>
    );
}

function QuickAction({ icon: Icon, label, onClick }) {
    return (
        <button 
            onClick={onClick}
            className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 hover:bg-primary/10 hover:text-primary transition-colors text-xs w-full"
        >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
        </button>
    );
}

export function StatsHUD() {
    const { t } = useLanguage();
    const { activeSessionId } = useCopilotStore();

    const { data: sessions } = useQuery({
        queryKey: ['copilot-sessions'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('copilot_sessions')
                .select('*')
                .order('updated_at', { ascending: false });
            if (error) throw error;
            return data;
        }
    });

    // Calculate stats from sessions
    const stats = useMemo(() => {
        if (!sessions) return { total: 0, today: 0, avgPerDay: 0 };
        
        const today = new Date().toDateString();
        const todaySessions = sessions.filter(s => 
            new Date(s.created_at).toDateString() === today
        );

        // Get sessions from last 7 days for average
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const recentSessions = sessions.filter(s => 
            new Date(s.created_at) > weekAgo
        );

        return {
            total: sessions.length,
            today: todaySessions.length,
            avgPerDay: Math.round((recentSessions.length / 7) * 10) / 10
        };
    }, [sessions]);

    // Current session info
    const currentSession = useMemo(() => {
        if (!activeSessionId || !sessions) return null;
        return sessions.find(s => s.id === activeSessionId);
    }, [activeSessionId, sessions]);

    return (
        <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
                {/* Session Stats */}
                <GenUICard 
                    title={t({ en: 'Session Stats', ar: 'إحصائيات الجلسة' })} 
                    subtitle={t({ en: 'Your AI assistant usage', ar: 'استخدام المساعد الذكي' })}
                >
                    <div className="space-y-2 mt-3">
                        <StatItem 
                            icon={MessageSquare} 
                            label={t({ en: 'Total Chats', ar: 'إجمالي المحادثات' })}
                            value={stats.total}
                            color="text-blue-500"
                        />
                        <StatItem 
                            icon={Zap} 
                            label={t({ en: 'Today', ar: 'اليوم' })}
                            value={stats.today}
                            color="text-amber-500"
                        />
                        <StatItem 
                            icon={TrendingUp} 
                            label={t({ en: 'Avg/Day', ar: 'المعدل اليومي' })}
                            value={stats.avgPerDay}
                            color="text-green-500"
                        />
                    </div>
                </GenUICard>

                {/* Current Session */}
                {currentSession && (
                    <GenUICard 
                        title={t({ en: 'Current Session', ar: 'الجلسة الحالية' })}
                        variant="highlight"
                    >
                        <div className="mt-2 space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <Target className="w-4 h-4 text-primary" />
                                <span className="truncate">{currentSession.title || t({ en: 'New Chat', ar: 'محادثة جديدة' })}</span>
                            </div>
                            {currentSession.mode && (
                                <div className="text-[10px] px-2 py-1 bg-muted rounded-full inline-block">
                                    {currentSession.mode}
                                </div>
                            )}
                        </div>
                    </GenUICard>
                )}

                {/* Quick Actions */}
                <GenUICard 
                    title={t({ en: 'Quick Actions', ar: 'إجراءات سريعة' })}
                    subtitle={t({ en: 'Common operations', ar: 'العمليات الشائعة' })}
                >
                    <div className="space-y-1.5 mt-3">
                        <QuickAction 
                            icon={Sparkles}
                            label={t({ en: 'Generate Report', ar: 'إنشاء تقرير' })}
                        />
                        <QuickAction 
                            icon={Target}
                            label={t({ en: 'View Challenges', ar: 'عرض التحديات' })}
                        />
                        <QuickAction 
                            icon={Bot}
                            label={t({ en: 'AI Analysis', ar: 'تحليل ذكي' })}
                        />
                    </div>
                </GenUICard>

                {/* Capabilities Info */}
                <div className="p-3 rounded-lg border border-dashed border-muted-foreground/20 bg-muted/5">
                    <div className="flex items-start gap-2">
                        <Bot className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div className="text-[11px] text-muted-foreground">
                            <p className="font-medium mb-1">
                                {t({ en: 'Copilot Capabilities', ar: 'قدرات المساعد' })}
                            </p>
                            <ul className="space-y-0.5 list-disc list-inside opacity-70">
                                <li>{t({ en: 'Navigate pages', ar: 'التنقل بين الصفحات' })}</li>
                                <li>{t({ en: 'Search data', ar: 'البحث في البيانات' })}</li>
                                <li>{t({ en: 'Create drafts', ar: 'إنشاء مسودات' })}</li>
                                <li>{t({ en: 'Generate insights', ar: 'توليد رؤى' })}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </ScrollArea>
    );
}
