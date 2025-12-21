import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Beaker } from 'lucide-react';

export default function ThemesTab({ call, t }) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Beaker className="h-5 w-5 text-teal-600" />
                        {t({ en: 'Research Themes', ar: 'المواضيع البحثية' })}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {call.research_themes && call.research_themes.length > 0 ? (
                        <div className="space-y-4">
                            {call.research_themes.map((theme, i) => (
                                <div key={i} className="p-4 border-l-4 border-teal-500 bg-teal-50 rounded-r-lg">
                                    <h4 className="font-semibold text-slate-900">{theme.theme}</h4>
                                    {theme.description && (
                                        <p className="text-sm text-slate-700 mt-1">{theme.description}</p>
                                    )}
                                    {theme.budget_allocation && (
                                        <p className="text-sm text-teal-900 font-medium mt-2">
                                            {t({ en: 'Budget', ar: 'الميزانية' })}: {(theme.budget_allocation / 1000).toFixed(0)}K SAR
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm text-center py-8">{t({ en: 'No research themes defined', ar: 'لم يتم تحديد المواضيع البحثية' })}</p>
                    )}
                </CardContent>
            </Card>

            {call.focus_areas && call.focus_areas.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t({ en: 'Focus Areas', ar: 'مجالات التركيز' })}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {call.focus_areas.map((area, i) => (
                                <Badge key={i} variant="outline">{area}</Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
