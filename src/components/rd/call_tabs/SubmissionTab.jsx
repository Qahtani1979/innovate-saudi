import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

export default function SubmissionTab({ call, t }) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t({ en: 'Submission Requirements', ar: 'متطلبات التقديم' })}</CardTitle>
                </CardHeader>
                <CardContent>
                    {call.submission_requirements && call.submission_requirements.length > 0 ? (
                        <div className="space-y-3">
                            {call.submission_requirements.map((req, i) => (
                                <div key={i} className={`p-4 border rounded-lg ${req.mandatory ? 'border-red-300 bg-red-50' : ''}`}>
                                    <div className="flex items-start justify-between mb-1">
                                        <p className="font-medium text-sm text-slate-900">{req.requirement}</p>
                                        {req.mandatory && (
                                            <Badge className="bg-red-100 text-red-700 text-xs">{t({ en: 'Mandatory', ar: 'إلزامي' })}</Badge>
                                        )}
                                    </div>
                                    {req.description && (
                                        <p className="text-sm text-slate-600">{req.description}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-sm text-center py-8">{t({ en: 'No requirements specified', ar: 'لم يتم تحديد المتطلبات' })}</p>
                    )}
                </CardContent>
            </Card>

            {call.document_urls && call.document_urls.length > 0 && (
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>{t({ en: 'Documents', ar: 'المستندات' })}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {call.document_urls.map((doc, i) => (
                                <Button key={i} variant="outline" asChild className="w-full justify-start">
                                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                        <FileText className="h-4 w-4 mr-2" />
                                        {doc.name}
                                    </a>
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
