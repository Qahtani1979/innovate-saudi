import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '@/components/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
    Clock, FileText, Activity, TrendingUp, MessageSquare,
    Lightbulb, TestTube, CheckCircle2, Archive, Users, Target
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ChallengeHistoryTab({ challenge }) {
    const { t, language } = useLanguage();
    const challengeId = challenge?.id;

    const { data: activities = [], isLoading } = useQuery({
        queryKey: ['challenge-activities', challengeId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('activity_logs')
                .select('*')
                .eq('entity_id', challengeId)
                .eq('entity_type', 'challenge')
                .order('timestamp', { ascending: false });

            if (error) throw error;
            return data;
        },
        enabled: !!challengeId
    });

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading history...</div>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-600" />
                        {t({ en: 'Approval & Status Timeline', ar: 'الجدول الزمني للموافقات' })}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {activities.length > 0 ? (
                            <div className="relative">
                                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
                                {activities.map((activity, i) => {
                                    const activityIcons = {
                                        created: FileText,
                                        updated: Activity,
                                        status_changed: TrendingUp,
                                        comment_added: MessageSquare,
                                        solution_matched: Lightbulb,
                                        pilot_created: TestTube,
                                        approved: CheckCircle2,
                                        archived: Archive,
                                        shared: Users,
                                        viewed: Target
                                    };
                                    const ActivityIcon = activityIcons[activity.activity_type] || Activity;

                                    return (
                                        <div key={activity.id} className="relative flex gap-4 pl-10">
                                            <div className="absolute left-0 w-8 h-8 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center">
                                                <ActivityIcon className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div className="flex-1 pb-4">
                                                <div className="flex items-start justify-between mb-1">
                                                    <p className="font-medium text-slate-900">{activity.activity_type?.replace(/_/g, ' ')}</p>
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(activity.timestamp).toLocaleString()}
                                                    </span>
                                                </div>
                                                {activity.description && (
                                                    <p className="text-sm text-slate-600">{activity.description}</p>
                                                )}
                                                {activity.performed_by && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        by {activity.performed_by}
                                                    </p>
                                                )}
                                                {activity.metadata && (
                                                    <div className="mt-2 p-2 bg-slate-50 rounded text-xs">
                                                        {JSON.stringify(activity.metadata, null, 2)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Clock className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500">{t({ en: 'No activity recorded yet', ar: 'لا يوجد نشاط مسجل' })}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {challenge.version_number > 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-purple-600" />
                            {t({ en: 'Version History', ar: 'سجل الإصدارات' })}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                            <Badge variant="outline">v{challenge.version_number}</Badge>
                            <span>{t({ en: 'Current version', ar: 'الإصدار الحالي' })}</span>
                            {challenge.previous_version_id && (
                                <Button variant="link" size="sm" className="text-xs">
                                    {t({ en: 'View previous versions', ar: 'عرض الإصدارات السابقة' })}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
