import { useCitizenIdeas, useVoteOnIdea } from '@/hooks/useCitizenIdeas';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, Loader2 } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

export default function CitizenIdeaVoting() {
    const { t } = useLanguage();

    const { ideas: { data: ideas = [], isLoading } } = useCitizenIdeas({
        status: 'open',
        limit: 100
    });

    const voteMutation = useVoteOnIdea();

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold">{t({ en: 'Vote on Ideas', ar: 'صوّت على الأفكار' })}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ideas.map(idea => (
                    <Card key={idea.id} className="hover:shadow-lg transition-shadow border-slate-200">
                        <CardHeader>
                            <CardTitle className="text-lg line-clamp-2 text-slate-900">{idea.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-600 line-clamp-3 mb-4 h-16">{idea.description}</p>
                            <div className="flex justify-between items-center pt-4 border-t">
                                <span className="text-sm font-semibold text-blue-600">{idea.votes_count || 0} {t({ en: 'votes', ar: 'أصوات' })}</span>
                                <Button
                                    onClick={() => voteMutation.mutate(idea.id)}
                                    disabled={voteMutation.isPending}
                                    variant="outline"
                                    className="gap-2 border-blue-200 hover:bg-blue-50"
                                >
                                    {voteMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <ThumbsUp className="h-4 w-4" />
                                    )}
                                    {t({ en: 'Vote', ar: 'تصويت' })}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {ideas.length === 0 && (
                <div className="text-center py-20 bg-slate-50 border-2 border-dashed rounded-xl">
                    <p className="text-slate-500">{t({ en: 'No open ideas for voting at the moment', ar: 'لا توجد أفكار مفتوحة للتصويت حالياً' })}</p>
                </div>
            )}
        </div>
    );
}
