import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { AlertTriangle, Clock, RefreshCw, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function StalledMatchDetector() {
    const { t, isRTL } = useLanguage();

    const { data: stalledMatches = [], isLoading, refetch } = useQuery({
        queryKey: ['stalled-matches'],
        queryFn: async () => {
            // Definition of stalled: Status is 'pending' or 'accepted' AND updated_at > 14 days ago
            const twoWeeksAgo = new Date();
            twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

            const { data, error } = await supabase
                .from('challenge_solution_matches')
                .select(`
          *,
          matchmaker_applications(organization_name_en, organization_name_ar),
          challenges(title_en)
        `)
                .in('status', ['pending', 'accepted'])
                .lt('updated_at', twoWeeksAgo.toISOString());

            if (error) throw error;
            return data;
        },
        initialData: [] // Return empty if error or loading initially to prevent crash
    });

    if (stalledMatches.length === 0 && !isLoading) return null;

    return (
        <Card className="border-l-4 border-l-amber-500 bg-amber-50/30">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center gap-2 text-amber-800">
                        <AlertTriangle className="h-5 w-5" />
                        {t({ en: 'Stalled Matches Attention', ar: 'تنبيه المطابقات المتعثرة' })}
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => refetch()}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <p className="text-sm text-slate-600 mb-2">
                        {t({
                            en: `${stalledMatches.length} matches have had no activity for over 14 days.`,
                            ar: `يوجد ${stalledMatches.length} مطابقات لم تشهد أي نشاط منذ أكثر من 14 يومًا.`
                        })}
                    </p>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {stalledMatches.map((match) => (
                            <div key={match.id} className="bg-white p-3 rounded border border-amber-200 flex justify-between items-center shadow-sm">
                                <div>
                                    <div className="font-semibold text-sm text-slate-800">
                                        {match.matchmaker_applications?.organization_name_en}
                                    </div>
                                    <div className="text-xs text-slate-500 flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {new Date(match.updated_at).toLocaleDateString()}
                                    </div>
                                </div>
                                <Link to={createPageUrl(`ChallengeDetail?id=${match.challenge_id}`)}>
                                    <Button size="sm" variant="outline" className="h-8 text-xs">
                                        {t({ en: 'View', ar: 'عرض' })}
                                        <ArrowRight className="h-3 w-3 ml-1" />
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
