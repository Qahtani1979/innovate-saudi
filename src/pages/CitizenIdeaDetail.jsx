import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, MapPin, User } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

export default function CitizenIdeaDetail() {
    const { id } = useParams();
    const { t } = useLanguage();

    const { data: idea, isLoading } = useQuery({
        queryKey: ['citizen-idea', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('citizen_ideas')
                .select('*')
                .eq('id', id)
                .single();
            if (error) throw error;
            return data;
        }
    });

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
    if (!idea) return <div className="p-8 text-center">Idea not found</div>;

    return (
        <div className="container mx-auto p-6 space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-2xl">{idea.title}</CardTitle>
                        <Badge>{idea.status}</Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-lg text-slate-700 whitespace-pre-wrap">{idea.description}</p>

                    <div className="grid grid-cols-3 gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {idea.submitter_name || 'Anonymous'}
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(idea.created_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {idea.location || 'No location'}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
