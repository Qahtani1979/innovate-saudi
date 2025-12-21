import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Building2, Clock } from 'lucide-react';

export default function RDProjectSidebar({ project, t, language }) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">{t({ en: 'Project Info', ar: 'معلومات المشروع' })}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p className="text-xs text-slate-500 mb-1">{t({ en: 'Lead Institution', ar: 'المؤسسة الرائدة' })}</p>
                        <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-slate-400" />
                            <p className="text-sm font-medium">
                                {language === 'ar' && project.institution_ar ? project.institution_ar : (project.institution_en || project.institution)}
                            </p>
                        </div>
                    </div>
                    {project.institution_type && (
                        <div>
                            <p className="text-xs text-slate-500 mb-1">{t({ en: 'Type', ar: 'النوع' })}</p>
                            <Badge variant="outline" className="text-xs capitalize">{project.institution_type.replace(/_/g, ' ')}</Badge>
                        </div>
                    )}
                    {(project.research_area_en || project.research_area) && (
                        <div>
                            <p className="text-xs text-slate-500 mb-1">{t({ en: 'Research Area', ar: 'مجال البحث' })}</p>
                            <p className="text-sm">{language === 'ar' && project.research_area_ar ? project.research_area_ar : (project.research_area_en || project.research_area)}</p>
                        </div>
                    )}
                    {project.living_lab_id && (
                        <div>
                            <p className="text-xs text-slate-500 mb-1">{t({ en: 'Living Lab', ar: 'المختبر الحي' })}</p>
                            <Link to={createPageUrl(`LivingLabDetail?id=${project.living_lab_id}`)} className="text-sm text-blue-600 hover:underline">
                                {t({ en: 'View Lab', ar: 'عرض المختبر' })}
                            </Link>
                        </div>
                    )}
                    {project.rd_call_id && (
                        <div>
                            <p className="text-xs text-slate-500 mb-1">{t({ en: 'R&D Call', ar: 'دعوة البحث' })}</p>
                            <Link to={createPageUrl(`RDCallDetail?id=${project.rd_call_id}`)} className="text-sm text-blue-600 hover:underline">
                                {t({ en: 'View Call', ar: 'عرض الدعوة' })}
                            </Link>
                        </div>
                    )}
                    {project.duration_months && (
                        <div>
                            <p className="text-xs text-slate-500 mb-1">{t({ en: 'Duration', ar: 'المدة' })}</p>
                            <p className="text-sm">{project.duration_months} {t({ en: 'months', ar: 'شهر' })}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {project.challenge_ids && project.challenge_ids.length > 0 && (
                <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                        <CardTitle className="text-sm text-red-900">
                            {t({ en: 'Linked Challenges', ar: 'التحديات المرتبطة' })}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-red-700">{project.challenge_ids.length} challenges</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
