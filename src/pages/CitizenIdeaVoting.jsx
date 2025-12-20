import { supabase } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, Loader2 } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { toast } from 'sonner';

export default function CitizenIdeaVoting() {
    const { t } = useLanguage();
    const queryClient = useQueryClient();

    const { data: ideas = [], isLoading } = useQuery({
        queryKey: ['open-ideas'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('citizen_ideas')
                .select('*')
                .eq('status', 'open')
                .order('created_date', { ascending: false });
            if (error) throw error;
            return data;
        }
    });

    const voteMutation = useMutation({
        mutationFn: async (ideaId) => {
            // Check if already voted
            const { data: existingVote } = await supabase
                .from('citizen_votes')
                .select('id')
                .eq('entity_id', ideaId)
                .eq('entity_type', 'idea')
                .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
                .single();

            if (existingVote) {
                throw new Error("You have already voted on this idea.");
            }

            // Insert new vote
            const { error } = await supabase
                .from('citizen_votes')
                .insert({
                    entity_id: ideaId,
                    entity_type: 'idea',
                    user_id: (await supabase.auth.getUser()).data.user?.id,
                    vote_type: 'upvote'
                });

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['open-ideas']);
            toast.success(t({ en: 'Vote recorded!', ar: 'تم تسجيل الصوت!' }));
        },
        onError: (error) => {
            toast.error(error.message || t({ en: 'Failed to vote', ar: 'فشل التصويت' }));
        }
    });

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold">{t({ en: 'Vote on Ideas', ar: 'صوّت على الأفكار' })}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ideas.map(idea => (
                    <Card key={idea.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="text-lg line-clamp-2">{idea.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-600 line-clamp-3 mb-4">{idea.description}</p>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold">{idea.vote_count || 0} votes</span>
                                <Button
                                    onClick={() => voteMutation.mutate(idea.id)}
                                    variant="outline"
                                    className="gap-2"
                                >
                                    <ThumbsUp className="h-4 w-4" />
                                    Vote
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
