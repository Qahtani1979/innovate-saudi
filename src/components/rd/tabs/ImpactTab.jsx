import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp } from 'lucide-react';

export default function ImpactTab({ project, t, language }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    {t({ en: 'Impact Assessment', ar: 'تقييم التأثير' })}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {project.impact_assessment ? (
                    <div className="space-y-4">
                        {(project.impact_assessment.academic_impact_en || project.impact_assessment.academic_impact) && (
                            <div>
                                <p className="text-sm font-medium text-slate-700">{t({ en: 'Academic Impact', ar: 'التأثير الأكاديمي' })}:</p>
                                <p className="text-sm text-slate-600 mt-1" dir={language === 'ar' && project.impact_assessment.academic_impact_ar ? 'rtl' : 'ltr'}>
                                    {language === 'ar' && project.impact_assessment.academic_impact_ar
                                        ? project.impact_assessment.academic_impact_ar
                                        : (project.impact_assessment.academic_impact_en || project.impact_assessment.academic_impact)}
                                </p>
                            </div>
                        )}
                        {(project.impact_assessment.practical_impact_en || project.impact_assessment.practical_impact) && (
                            <div>
                                <p className="text-sm font-medium text-slate-700">{t({ en: 'Practical Impact', ar: 'التأثير العملي' })}:</p>
                                <p className="text-sm text-slate-600 mt-1" dir={language === 'ar' && project.impact_assessment.practical_impact_ar ? 'rtl' : 'ltr'}>
                                    {language === 'ar' && project.impact_assessment.practical_impact_ar
                                        ? project.impact_assessment.practical_impact_ar
                                        : (project.impact_assessment.practical_impact_en || project.impact_assessment.practical_impact)}
                                </p>
                            </div>
                        )}
                        {(project.impact_assessment.policy_impact_en || project.impact_assessment.policy_impact) && (
                            <div>
                                <p className="text-sm font-medium text-slate-700">{t({ en: 'Policy Impact', ar: 'التأثير على السياسات' })}:</p>
                                <p className="text-sm text-slate-600 mt-1" dir={language === 'ar' && project.impact_assessment.policy_impact_ar ? 'rtl' : 'ltr'}>
                                    {language === 'ar' && project.impact_assessment.policy_impact_ar
                                        ? project.impact_assessment.policy_impact_ar
                                        : (project.impact_assessment.policy_impact_en || project.impact_assessment.policy_impact)}
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-slate-500 text-sm text-center py-8">{t({ en: 'Impact assessment pending', ar: 'تقييم التأثير قيد الانتظار' })}</p>
                )}
            </CardContent>
        </Card>
    );
}
