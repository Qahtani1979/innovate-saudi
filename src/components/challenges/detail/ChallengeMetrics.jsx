import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, TrendingUp, BarChart3, Lightbulb, TestTube, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function ChallengeMetrics({ challenge, t }) {
    const { data: solutionsCount = 0 } = useQuery({
        queryKey: ['challenge-solutions-count', challenge.id],
        queryFn: async () => {
            const { count } = await supabase
                .from('solutions')
                .select('*', { count: 'exact', head: true })
                .eq('challenge_id', challenge.id)
                .eq('is_deleted', false); // assuming logical delete
            return count || 0;
        }
    });

    const { data: pilotsCount = 0 } = useQuery({
        queryKey: ['challenge-pilots-count', challenge.id],
        queryFn: async () => {
            const { count } = await supabase
                .from('pilots')
                .select('*', { count: 'exact', head: true })
                .eq('challenge_id', challenge.id)
                .eq('is_deleted', false);
            return count || 0;
        }
    });

    return (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <Card className="bg-gradient-to-br from-red-50 to-white border-red-200">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">{t({ en: 'Severity', ar: 'الخطورة' })}</p>
                            <p className="text-3xl font-bold text-red-600">{challenge.severity_score || 0}</p>
                        </div>
                        <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-200">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">{t({ en: 'Impact', ar: 'التأثير' })}</p>
                            <p className="text-3xl font-bold text-orange-600">{challenge.impact_score || 0}</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-orange-600" />
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">{t({ en: 'Overall', ar: 'الإجمالي' })}</p>
                            <p className="text-3xl font-bold text-blue-600">{challenge.overall_score || 0}</p>
                        </div>
                        <BarChart3 className="h-8 w-8 text-blue-600" />
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">{t({ en: 'Solutions', ar: 'الحلول' })}</p>
                            <p className="text-3xl font-bold text-purple-600">{solutionsCount}</p>
                        </div>
                        <Lightbulb className="h-8 w-8 text-purple-600" />
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-teal-50 to-white border-teal-200">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">{t({ en: 'Pilots', ar: 'التجارب' })}</p>
                            <p className="text-3xl font-bold text-teal-600">{pilotsCount}</p>
                        </div>

                        <TestTube className="h-8 w-8 text-teal-600" />
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-white border-yellow-200">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">{t({ en: 'Votes', ar: 'الأصوات' })}</p>
                            <p className="text-3xl font-bold text-yellow-600">{challenge.citizen_votes_count || 0}</p>
                        </div>
                        <Users className="h-8 w-8 text-yellow-600" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
