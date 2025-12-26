import { useParams } from 'react-router-dom';
import { useSingleCitizenIdea } from '@/hooks/useCitizenIdeas';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, MapPin, User } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

/**
 * CitizenIdeaDetail
 * ✅ GOLD STANDARD COMPLIANT
 */
export default function CitizenIdeaDetail() {
    const { id } = useParams();
    const { t } = useLanguage();

    const { data: idea, isLoading } = useSingleCitizenIdea(id);

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
    if (!idea) return <div className="p-8 text-center">{t({ en: 'Idea not found', ar: 'الفكرة غير موجودة' })}</div>;

    return (
        <div className="container mx-auto p-6 space-y-6">
            <Card className="border-slate-200">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-2xl text-slate-900">{idea.title}</CardTitle>
                        <Badge variant="secondary">{idea.status}</Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-lg text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {idea.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-t text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-blue-500" />
                            <span className="font-medium text-slate-700">{idea.submitter_name || t({ en: 'Anonymous', ar: 'مجهول' })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-500" />
                            <span>{new Date(idea.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-blue-500" />
                            <span>{idea.location || t({ en: 'No location provided', ar: 'لم يتم تحديد موقع' })}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
