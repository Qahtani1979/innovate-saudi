import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StrategicAlignmentWidget from '../../strategy/StrategicAlignmentWidget';

export default function OverviewTab({ project, t, language, projectId }) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t({ en: 'Abstract', ar: 'الملخص' })}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-700 leading-relaxed" dir={language === 'ar' && (project.abstract_ar || project.description_ar) ? 'rtl' : 'ltr'}>
                        {language === 'ar' && (project.abstract_ar || project.description_ar)
                            ? (project.abstract_ar || project.description_ar)
                            : (project.abstract_en || project.description_en || t({ en: 'No abstract provided', ar: 'لا يوجد ملخص' }))}
                    </p>
                </CardContent>
            </Card>

            {project.research_themes && project.research_themes.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t({ en: 'Research Themes', ar: 'المواضيع البحثية' })}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {project.research_themes.map((theme, i) => (
                                <Badge key={i} variant="outline">{theme}</Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {project.keywords && project.keywords.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t({ en: 'Keywords', ar: 'الكلمات المفتاحية' })}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {project.keywords.map((keyword, i) => (
                                <Badge key={i} variant="outline" className="text-xs">{keyword}</Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <StrategicAlignmentWidget
                entityType="rd_project"
                entityId={projectId}
                title={t({ en: 'Strategic Alignment', ar: 'التوافق الاستراتيجي' })}
            />
        </div>
    );
}
