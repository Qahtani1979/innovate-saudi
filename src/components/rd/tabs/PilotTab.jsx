import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TestTube } from 'lucide-react';

export default function PilotTab({ project, t, language }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{t({ en: 'Pilot Opportunities', ar: 'فرص التجريب' })}</CardTitle>
            </CardHeader>
            <CardContent>
                {project.pilot_opportunities && project.pilot_opportunities.length > 0 ? (
                    <div className="space-y-3">
                        {project.pilot_opportunities.map((opp, i) => (
                            <div key={i} className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
                                <p className="text-sm text-slate-700" dir={language === 'ar' && opp.description_ar ? 'rtl' : 'ltr'}>
                                    {language === 'ar' && opp.description_ar ? opp.description_ar : (opp.description_en || opp.description)}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs text-slate-600">{opp.municipality}</span>
                                    <Badge variant="outline" className="text-xs">{opp.status}</Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <TestTube className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">{t({ en: 'No pilot opportunities identified yet', ar: 'لم يتم تحديد فرص التجريب بعد' })}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
