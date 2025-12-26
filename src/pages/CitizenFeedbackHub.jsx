import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '@/components/LanguageContext';
import { Loader2, MessageSquare, BarChart3 } from 'lucide-react';
import PublicFeedbackAggregator from '@/components/citizen/PublicFeedbackAggregator';

export default function CitizenFeedbackHub() {
    const { t } = useLanguage();

    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold">{t({ en: 'Feedback Hub', ar: 'مركز الملاحظات' })}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <Card className="bg-blue-50 border-blue-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-blue-600" />
                                Submit Feedback
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-700 mb-4">
                                Share your thoughts on municipal services, challenges, and initiatives. Your voice matters!
                            </p>
                            {/* Form integration would go here */}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-green-600" />
                                Feedback Analysis
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <PublicFeedbackAggregator />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
