import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export default function OverviewTab({ call, t, language }) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t({ en: 'Call Description', ar: 'وصف الدعوة' })}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap" dir={language === 'ar' && call.description_ar ? 'rtl' : 'ltr'}>
                        {language === 'ar' && call.description_ar ? call.description_ar : (call.description_en || t({ en: 'No description provided', ar: 'لا يوجد وصف' }))}
                    </p>
                </CardContent>
            </Card>

            {(call.objectives_en || call.objectives_ar) && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t({ en: 'Objectives', ar: 'الأهداف' })}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-700 leading-relaxed" dir={language === 'ar' && call.objectives_ar ? 'rtl' : 'ltr'}>
                            {language === 'ar' && call.objectives_ar ? call.objectives_ar : call.objectives_en}
                        </p>
                    </CardContent>
                </Card>
            )}

            {call.expected_outcomes && call.expected_outcomes.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t({ en: 'Expected Outcomes', ar: 'النتائج المتوقعة' })}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {call.expected_outcomes.map((outcome, i) => (
                                <div key={i} className="flex items-start gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-slate-700">{outcome}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
