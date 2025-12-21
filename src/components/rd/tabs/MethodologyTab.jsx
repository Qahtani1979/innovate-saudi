import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function MethodologyTab({ project, t, language }) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t({ en: 'Research Methodology', ar: 'المنهجية البحثية' })}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-700 leading-relaxed" dir={language === 'ar' && project.methodology_ar ? 'rtl' : 'ltr'}>
                        {language === 'ar' && project.methodology_ar
                            ? project.methodology_ar
                            : (project.methodology_en || project.methodology || t({ en: 'No methodology specified', ar: 'لم يتم تحديد المنهجية' }))}
                    </p>
                </CardContent>
            </Card>

            {project.expected_outputs && project.expected_outputs.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t({ en: 'Expected Outputs', ar: 'المخرجات المتوقعة' })}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {project.expected_outputs.map((output, i) => (
                                <div key={i} className="p-3 border rounded-lg">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-medium text-sm text-slate-900">{output.output}</p>
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
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
