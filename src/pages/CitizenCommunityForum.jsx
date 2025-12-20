import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from '@/components/LanguageContext';
import { Loader2, MessageCircle, Users } from 'lucide-react';

export default function CitizenCommunityForum() {
    const { t } = useLanguage();

    const { data: threads = [], isLoading } = useQuery({
        queryKey: ['forum-threads'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('forum_threads')
                .select('*')
                .order('last_activity', { ascending: false })
                .limit(20);
            if (error) throw error;
            return data;
        }
    });

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">{t({ en: 'Community Forum', ar: 'منتدى المجتمع' })}</h1>
                <Button>New Discussion</Button>
            </div>

            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                ) : threads.length === 0 ? (
                    <div className="text-center p-12 bg-slate-50 rounded-lg">
                        <Users className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                        <p>No discussions yet. Be the first to start one!</p>
                    </div>
                ) : (
                    threads.map(thread => (
                        <Card key={thread.id} className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-blue-50 rounded-full">
                                        <MessageCircle className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg">{thread.title}</h3>
                                        <p className="text-slate-600 line-clamp-1">{thread.content}</p>
                                        <div className="flex gap-4 mt-2 text-sm text-slate-500">
                                            <span>{new Date(thread.created_at).toLocaleDateString()}</span>
                                            <span>{thread.replies_count || 0} replies</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
