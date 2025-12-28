import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from 'lucide-react';

/**
 * Solution Features Tab Component
 * Displays key features, use cases, and value proposition
 * 
 * @param {Object} props
 * @param {Object} props.solution - Solution data object
 * @param {Function} props.t - Translation function
 * @returns {JSX.Element}
 */
export default function SolutionFeaturesTab({ solution, t }) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t({ en: 'Key Features', ar: 'المميزات الرئيسية' })}</CardTitle>
                </CardHeader>
                <CardContent>
                    {solution.features && solution.features.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {solution.features.map((feature, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 border rounded-lg">
                                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-slate-700">{feature}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500 text-center py-8">No features listed</p>
                    )}
                </CardContent>
            </Card>

            {solution.use_cases && solution.use_cases.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t({ en: 'Use Cases', ar: 'حالات الاستخدام' })}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {solution.use_cases.map((useCase, i) => (
                                <div key={i} className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
                                    <h4 className="font-semibold text-slate-900 mb-1">{useCase.title}</h4>
                                    <p className="text-sm text-slate-700">{useCase.description}</p>
                                    {useCase.sector && (
                                        <Badge variant="outline" className="mt-2 text-xs">{useCase.sector}</Badge>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {solution.value_proposition && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t({ en: 'Value Proposition', ar: 'القيمة المقترحة' })}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-700 leading-relaxed">{solution.value_proposition}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
