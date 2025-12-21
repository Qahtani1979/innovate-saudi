import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

/**
 * ActivityFeedWidget - Displays recent activity feed
 * @param {Object} props - Component props
 * @param {Array} props.recentActivities - Array of recent activities
 * @param {Array} props.challenges - Array of challenges
 * @param {Function} props.t - Translation function
 */
export default function ActivityFeedWidget({ recentActivities, challenges, t }) {
    return (
        <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Activity className="h-5 w-5 text-blue-600" />
                    {t({ en: 'Recent Activity', ar: 'النشاط الأخير' })}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {recentActivities.length > 0 ? (
                    recentActivities.map((activity) => {
                        const challenge = challenges.find(c => c.id === activity.challenge_id);
                        return (
                            <div key={activity.id} className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                                <p className="text-xs text-slate-700">{activity.description}</p>
                                {challenge && (
                                    <p className="text-xs text-slate-500 mt-1">{challenge.code}</p>
                                )}
                                <p className="text-xs text-slate-400 mt-1">
                                    {new Date(activity.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-6">
                        <Activity className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-500">{t({ en: 'No recent activity', ar: 'لا يوجد نشاط حديث' })}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
