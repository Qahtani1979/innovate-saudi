import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, ExternalLink } from 'lucide-react';

export default function DatasetsTab({ project, t, language }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-teal-600" />
                    {t({ en: 'Datasets Generated', ar: 'مجموعات البيانات' })}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {project.datasets_generated && project.datasets_generated.length > 0 ? (
                    <div className="space-y-3">
                        {project.datasets_generated.map((dataset, i) => (
                            <div key={i} className="p-3 border rounded-lg">
                                <p className="font-medium text-sm text-slate-900">{dataset.name}</p>
                                {dataset.description && (
                                    <p className="text-sm text-slate-600 mt-1">{dataset.description}</p>
                                )}
                                {dataset.url && (
                                    <Button variant="outline" size="sm" asChild className="mt-2">
                                        <a href={dataset.url} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="h-3 w-3 mr-2" />
                                            {t({ en: 'Access Dataset', ar: 'الوصول للبيانات' })}
                                        </a>
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <Database className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">{t({ en: 'No datasets generated yet', ar: 'لا توجد بيانات بعد' })}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
