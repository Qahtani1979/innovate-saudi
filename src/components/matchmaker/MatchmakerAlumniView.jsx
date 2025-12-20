import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { GraduationCap, Award, ExternalLink } from 'lucide-react';

export default function MatchmakerAlumniView() {
    const { t, isRTL } = useLanguage();

    const { data: alumni = [] } = useQuery({
        queryKey: ['matchmaker-alumni'],
        queryFn: async () => {
            // Alumni logic: Providers who have at least one completed partnership or pilot associated with them
            // This is a complex query, simplified here by fetching partnerships
            const { data, error } = await supabase
                .from('organization_partnerships')
                .select(`
          provider_id,
          provider:organizations!provider_id(name_en, name_ar, logo_url, website)
        `)
                .eq('status', 'completed'); // or active for current almonds? Alumni usually means graduated/completed.

            if (error) throw error;

            // Deduplicate providers
            const uniqueDetails = new Map();
            data?.forEach(item => {
                if (!uniqueDetails.has(item.provider_id)) {
                    uniqueDetails.set(item.provider_id, item.provider);
                }
            });

            return Array.from(uniqueDetails.values());
        }
    });

    return (
        <Card className="bg-slate-50 border-slate-200">
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2 text-slate-800">
                    <GraduationCap className="h-6 w-6 text-slate-600" />
                    {t({ en: 'Matchmaker Alumni Network', ar: 'شبكة خريجي التوفيق' })}
                </CardTitle>
                <CardDescription>
                    {t({ en: 'Celebrate the success of providers who have graduated from our program with successful partnerships.', ar: 'نحتفل بنجاح المزودين الذين تخرجوا من برنامجنا بشراكات ناجحة.' })}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {alumni.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {alumni.map((alum, i) => (
                            <Card key={i} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center text-xl font-bold text-slate-500">
                                        {alum?.logo_url ? <img src={alum.logo_url} className="h-full w-full rounded-full object-cover" /> : (alum.name_en?.[0] || 'A')}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">{isRTL ? alum.name_ar : alum.name_en}</h4>
                                        {alum.website && (
                                            <a href={alum.website} target="_blank" className="text-xs text-blue-600 flex items-center gap-1 hover:underline">
                                                {t({ en: 'Visit Website', ar: 'زيارة الموقع' })} <ExternalLink className="h-3 w-3" />
                                            </a>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Award className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">{t({ en: 'No alumni yet. Be the first success story!', ar: 'لا يوجد خريجين بعد. كن قصة النجاح الأولى!' })}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
