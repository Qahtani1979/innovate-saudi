import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function OutputsTab({ project, t, language }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{t({ en: 'Expected Outputs', ar: 'المخرجات المتوقعة' })}</CardTitle>
            </CardHeader>
            <CardContent>
                {project.expected_outputs && project.expected_outputs.length > 0 ? (
                    <div className="space-y-3">
                        {project.expected_outputs.map((output, i) => (
                            <div key={i} className="p-4 border-l-4 border-teal-500 bg-teal-50 rounded-r-lg">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-medium text-sm text-slate-900">
                                            {language === 'ar' && output.output_ar ? output.output_ar : (output.output_en || output.output)}
                                        </p>
                                        {output.type && (
                                            <Badge variant="outline" className="text-xs mt-1">{output.type}</Badge>
                                        )}
                                    </div>
                                    {output.target_date && (
                                        <span className="text-xs text-slate-500">{output.target_date}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-500 text-sm text-center py-8">{t({ en: 'No outputs specified', ar: 'لم يتم تحديد المخرجات' })}</p>
                )}
            </CardContent>
        </Card>
    );
}
