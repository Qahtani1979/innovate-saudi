import { useCitizenIdeas } from '@/hooks/useCitizenIdeas';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '@/components/LanguageContext';
import { Loader2, CheckCircle2 } from 'lucide-react';
import AIProposalScreening from '@/components/citizen/AIProposalScreening';

/**
 * CitizenIdeaReview
 * ✅ GOLD STANDARD COMPLIANT
 */
export default function CitizenIdeaReview() {
    const { t } = useLanguage();

    const { ideas: { data: ideasToReview = [], isLoading } } = useCitizenIdeas({
        status: 'under_review'
    });

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;

    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold text-slate-900">{t({ en: 'Idea Review Queue', ar: 'طابور مراجعة الأفكار' })}</h1>

            {ideasToReview.length === 0 ? (
                <div className="text-center p-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-slate-600">{t({ en: 'No ideas pending review', ar: 'لا توجد أفكار معلقة للمراجعة' })}</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {ideasToReview.map(idea => (
                        <Card key={idea.id} className="border-slate-200">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-xl text-slate-900">{idea.title}</CardTitle>
                                    <Badge variant="secondary">{t({ en: 'Pending Review', ar: 'قيد المراجعة' })}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <p className="text-slate-700 leading-relaxed">{idea.description}</p>

                                {/* AI Screening integration */}
                                <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                                    <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                                        {t({ en: 'AI Intelligence Analysis', ar: 'تحليل الذكاء الاصطناعي' })}
                                    </h3>
                                    <AIProposalScreening
                                        proposal={idea}
                                        onScreeningComplete={() => { }}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
