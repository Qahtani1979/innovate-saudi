import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function EvaluationTab({ call, t }) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t({ en: 'Evaluation Criteria', ar: 'معايير التقييم' })}</CardTitle>
                </CardHeader>
                <CardContent>
                    {call.evaluation_criteria && call.evaluation_criteria.length > 0 ? (
                        <div className="space-y-3">
                            {call.evaluation_criteria.map((criterion, i) => (
                                <div key={i} className="p-4 border rounded-lg">
                                    <div className="flex items-start justify-between mb-2">
                                        <p className="font-medium text-sm text-slate-900">{criterion.criterion}</p>
                                        <Badge variant="outline" className="text-xs">{criterion.weight}%</Badge>
                                    </div>
                                    {criterion.description && (
                                        <p className="text-sm text-slate-600">{criterion.description}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm text-center py-8">{t({ en: 'No evaluation criteria specified', ar: 'لم يتم تحديد معايير التقييم' })}</p>
                    )}
                </CardContent>
            </Card>

            {call.review_process && (
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>{t({ en: 'Review Process', ar: 'عملية المراجعة' })}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-700 leading-relaxed">{call.review_process}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
