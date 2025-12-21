import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';

export default function EligibilityTab({ call, t }) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t({ en: 'Eligibility Criteria', ar: 'معايير الأهلية' })}</CardTitle>
                </CardHeader>
                <CardContent>
                    {call.eligibility_criteria && Array.isArray(call.eligibility_criteria) && call.eligibility_criteria.length > 0 ? (
                        <div className="space-y-2">
                            {call.eligibility_criteria.map((criterion, i) => (
                                <div key={i} className="flex items-start gap-2 p-3 border rounded-lg">
                                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-slate-700">{criterion}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm text-center py-8">{t({ en: 'No specific criteria listed', ar: 'لا توجد معايير محددة' })}</p>
                    )}
                </CardContent>
            </Card>

            {call.eligible_institutions && call.eligible_institutions.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t({ en: 'Eligible Institutions', ar: 'المؤسسات المؤهلة' })}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {call.eligible_institutions.map((inst, i) => (
                                <Badge key={i} variant="outline">{inst}</Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
