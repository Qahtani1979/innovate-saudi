import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '@/components/LanguageContext';
import { Loader2, CheckCircle2 } from 'lucide-react';
import AIProposalScreening from '@/components/citizen/AIProposalScreening';

export default function CitizenIdeaReview() {
    const { t } = useLanguage();

    const { data: ideasToReview = [], isLoading } = useQuery({
        queryKey: ['ideas-review'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('citizen_ideas')
                .select('*')
                .eq('status', 'under_review');
            if (error) throw error;
            return data;
        }
    });

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold">{t({ en: 'Idea Review Queue', ar: 'طابور مراجعة الأفكار' })}</h1>

            {ideasToReview.length === 0 ? (
                <div className="text-center p-12 bg-slate-50 rounded-lg border-2 border-dashed">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p>No ideas pending review</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {ideasToReview.map(idea => (
                        <Card key={idea.id}>
                            <CardHeader>
                                <div className="flex justify-between">
                                    <CardTitle>{idea.title}</CardTitle>
                                    <Badge variant="outline">Pending Review</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-slate-700">{idea.description}</p>
                                {/* AI Screening integration */}
                                <div className="bg-slate-50 p-4 rounded-lg">
                                    <h3 className="font-semibold mb-2">AI Analysis</h3>
                                    <AIProposalScreening proposal={idea} />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
