import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { Sparkles, Lightbulb, MessageSquare } from 'lucide-react';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';

export default function AIEngagementCoach({ application, match }) {
    const { t } = useLanguage();
    const { invokeAI, status, isLoading } = useAIWithFallback();
    const [tips, setTips] = useState([]);

    useEffect(() => {
        if (application && match) {
            generateTips();
        }
    }, [application, match]);

    const generateTips = async () => {
        // In a real implementation, this would call the AI service
        // For now, we simulate AI response structure for the "Gap Fix"
        // tailored to the specific match sector/type

        // Mock simulation delay
        await new Promise(r => setTimeout(r, 1000));

        const sector = match?.sector || 'General';
        const sectorTips = getTipsForSector(sector);

        setTips(sectorTips);
    };

    const getTipsForSector = (sector) => {
        const common = [
            {
                title: { en: 'Schedule a Kickoff', ar: 'جدولة اجتماع انطلاق' },
                content: { en: 'Early momentum is key. Propose 3 time slots for next week.', ar: 'الزخم المبكر هو المفتاح. اقترح 3 أوقات للأسبوع القادم.' },
                action: 'schedule'
            }
        ];

        if (sector.includes('Smart City') || sector.includes('Environment')) {
            return [
                ...common,
                {
                    title: { en: 'Focus on Pilot Metrics', ar: 'التركيز على مقاييس التجربة' },
                    content: { en: 'Municipalities in this sector value clear KPI dashboards. Prepare a sample report.', ar: 'تقدر البلديات في هذا القطاع لوحات معلومات KPI الواضحة. قم بإعداد نموذج تقرير.' },
                    action: 'prepare_report'
                },
                {
                    title: { en: 'Regulatory Compliance', ar: 'الامتثال التنظيمي' },
                    content: { en: 'Check local environmental regulations early to avoid blockers.', ar: 'تحقق من اللوائح البيئية المحلية مبكراً لتجنب العوائق.' },
                    action: 'check_compliance'
                }
            ];
        }

        return [
            ...common,
            {
                title: { en: 'Stakeholder Alignment', ar: 'مواءمة أصحاب المصلحة' },
                content: { en: 'Identify the implementation team vs the decision makers.', ar: 'حدد فريق التنفيذ مقابل صناع القرار.' },
                action: 'identify_stakeholders'
            }
        ];
    };

    return (
        <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-indigo-700">
                    <Sparkles className="h-5 w-5" />
                    {t({ en: 'AI Engagement Coach', ar: 'مدرب المشاركة الذكي' })}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-2">
                        <div className="h-4 bg-indigo-100 rounded w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-indigo-100 rounded w-1/2 animate-pulse"></div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {tips.map((tip, i) => (
                            <div key={i} className="flex gap-3 p-3 bg-white rounded-lg border border-indigo-100 shadow-sm">
                                <div className="mt-1">
                                    <Lightbulb className="h-4 w-4 text-amber-500" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-indigo-900">{t(tip.title)}</h4>
                                    <p className="text-xs text-slate-600 mt-1">{t(tip.content)}</p>
                                </div>
                            </div>
                        ))}

                        <Button variant="ghost" size="sm" className="w-full text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            {t({ en: 'Ask me a question about this match', ar: 'اسألني سؤالاً حول هذه المطابقة' })}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
