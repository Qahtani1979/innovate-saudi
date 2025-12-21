import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';

export default function FundingTab({ call, t }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    {t({ en: 'Funding Details', ar: 'تفاصيل التمويل' })}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-green-900">{t({ en: 'Total Pool', ar: 'إجمالي التمويل' })}</p>
                        <span className="text-2xl font-bold text-green-600">
                            {call.total_funding ? `${(call.total_funding / 1000000).toFixed(1)}M SAR` : t({ en: 'N/A', ar: 'غير محدد' })}
                        </span>
                    </div>
                </div>

                {call.funding_per_project && (
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 border rounded-lg">
                            <p className="text-xs text-slate-500">{t({ en: 'Min per Project', ar: 'الحد الأدنى للمشروع' })}</p>
                            <p className="text-lg font-bold text-slate-900">{(call.funding_per_project.min / 1000).toFixed(0)}K SAR</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                            <p className="text-xs text-slate-500">{t({ en: 'Max per Project', ar: 'الحد الأقصى للمشروع' })}</p>
                            <p className="text-lg font-bold text-slate-900">{(call.funding_per_project.max / 1000).toFixed(0)}K SAR</p>
                        </div>
                    </div>
                )}

                {call.number_of_awards && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-900">
                            <span className="font-semibold">{call.number_of_awards}</span> {t({ en: 'awards available', ar: 'جوائز متاحة' })}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
