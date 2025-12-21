import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign } from 'lucide-react';

export default function BudgetTab({ project, t, language }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    {t({ en: 'Budget Breakdown', ar: 'تفصيل الميزانية' })}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {project.budget_breakdown && project.budget_breakdown.length > 0 ? (
                    <div className="space-y-2">
                        {project.budget_breakdown.map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                                <span className="text-sm text-slate-700">
                                    {language === 'ar' && item.category_ar ? item.category_ar : (item.category_en || item.category)}
                                </span>
                                <span className="text-sm font-medium">{(item.amount / 1000).toFixed(0)}K SAR</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm font-medium text-green-900">
                            {t({ en: 'Total Budget', ar: 'إجمالي الميزانية' })}: {project.budget ? `${(project.budget / 1000).toFixed(0)}K SAR` : t({ en: 'N/A', ar: 'غير متاح' })}
                        </p>
                        {(project.funding_source_en || project.funding_source) && (
                            <p className="text-xs text-slate-600 mt-1">
                                {t({ en: 'Source', ar: 'المصدر' })}: {language === 'ar' && project.funding_source_ar ? project.funding_source_ar : (project.funding_source_en || project.funding_source)}
                            </p>
                        )}
                        {project.funding_status && (
                            <Badge variant="outline" className="mt-2 text-xs">{project.funding_status}</Badge>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
