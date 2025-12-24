import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '@/components/LanguageContext';
import { Users } from 'lucide-react';
import CollaborativeEditing from '@/components/CollaborativeEditing';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function ChallengeTeamTab({ challenge }) {
    const { t } = useLanguage();
    const challengeId = challenge?.id;
    const stakeholders = challenge?.stakeholders || [];

    // Fetch counts for stats
    const { data: stats = { comments: 0, evaluations: 0, activities: 0 } } = useQuery({
        queryKey: ['challenge-team-stats', challengeId],
        queryFn: async () => {
            const [comments, evaluations, activities] = await Promise.all([
                supabase.from('comments').select('id', { count: 'exact', head: true }).eq('challenge_id', challengeId),
                supabase.from('expert_evaluations').select('id', { count: 'exact', head: true }).eq('challenge_id', challengeId),
                supabase.from('activity_logs').select('id', { count: 'exact', head: true }).eq('entity_id', challengeId)
            ]);

            return {
                comments: comments.count || 0,
                evaluations: evaluations.count || 0,
                activities: activities.count || 0
            };
        },
        enabled: !!challengeId
    });

    return (
        <div className="space-y-6">
            <CollaborativeEditing entityId={challengeId} entityType="Challenge" />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        {t({ en: 'Team Workspace', ar: 'مساحة عمل الفريق' })}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Challenge Owner */}
                        {challenge.challenge_owner && (
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                                        {challenge.challenge_owner.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">{challenge.challenge_owner}</p>
                                        <p className="text-xs text-slate-600">{t({ en: 'Challenge Owner', ar: 'مالك التحدي' })}</p>
                                        {challenge.challenge_owner_email && (
                                            <p className="text-xs text-blue-600">{challenge.challenge_owner_email}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Reviewer */}
                        {challenge.reviewer && (
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-yellow-600 flex items-center justify-center text-white font-bold">
                                        {challenge.reviewer.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">{challenge.reviewer}</p>
                                        <p className="text-xs text-slate-600">{t({ en: 'Assigned Reviewer', ar: 'المراجع المعين' })}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Stakeholders */}
                        {stakeholders.length > 0 && (
                            <div>
                                <p className="font-semibold text-slate-900 mb-3">{t({ en: 'Key Stakeholders', ar: 'أصحاب المصلحة الرئيسيون' })}</p>
                                <div className="space-y-2">
                                    {stakeholders.map((stakeholder, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 bg-white border rounded-lg">
                                            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm">
                                                {stakeholder.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-sm text-slate-900">{stakeholder.name}</p>
                                                <p className="text-xs text-slate-600">{stakeholder.role}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Team Activity Stats */}
                        <div className="grid grid-cols-3 gap-3 pt-4 border-t">
                            <div className="text-center p-3 bg-slate-50 rounded">
                                <p className="text-2xl font-bold text-blue-600">{stats.comments}</p>
                                <p className="text-xs text-slate-600">{t({ en: 'Comments', ar: 'تعليقات' })}</p>
                            </div>
                            <div className="text-center p-3 bg-slate-50 rounded">
                                <p className="text-2xl font-bold text-purple-600">{stats.evaluations}</p>
                                <p className="text-xs text-slate-600">{t({ en: 'Evaluations', ar: 'تقييمات' })}</p>
                            </div>
                            <div className="text-center p-3 bg-slate-50 rounded">
                                <p className="text-2xl font-bold text-green-600">{stats.activities}</p>
                                <p className="text-xs text-slate-600">{t({ en: 'Activities', ar: 'نشاطات' })}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
