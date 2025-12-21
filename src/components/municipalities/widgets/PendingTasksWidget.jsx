import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle2, Activity, Zap, Lightbulb } from 'lucide-react';
import { createPageUrl } from '@/utils';

/**
 * PendingTasksWidget - Displays all pending tasks for the municipality
 * @param {Object} props - Component props
 * @param {Array} props.pendingReviews - Pending reviews
 * @param {Array} props.escalatedChallenges - Escalated challenges
 * @param {Array} props.challenges - All challenges
 * @param {Array} props.citizenIdeas - Citizen ideas
 * @param {Object} props.myMunicipality - Municipality data
 * @param {Function} props.t - Translation function
 */
export default function PendingTasksWidget({
    pendingReviews,
    escalatedChallenges,
    challenges,
    citizenIdeas,
    myMunicipality,
    t
}) {
    const hasTasks = pendingReviews.length > 0 ||
        escalatedChallenges.length > 0 ||
        challenges.filter(c => c.treatment_plan?.milestones?.some(m => m.status !== 'completed')).length > 0 ||
        citizenIdeas.length > 0;

    return (
        <Card className="border-l-4 border-l-orange-500">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Clock className="h-5 w-5 text-orange-600" />
                    {t({ en: 'Pending Tasks', ar: 'المهام المعلقة' })}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {pendingReviews.length > 0 && (
                    <Link to={createPageUrl('ChallengeReviewQueue')}>
                        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 hover:border-yellow-400 transition-all cursor-pointer">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-yellow-700" />
                                    <span className="text-sm font-medium text-yellow-900">
                                        {t({ en: 'Reviews', ar: 'مراجعات' })}
                                    </span>
                                </div>
                                <Badge className="bg-yellow-600 text-white">{pendingReviews.length}</Badge>
                            </div>
                        </div>
                    </Link>
                )}

                {challenges.filter(c => c.treatment_plan?.milestones?.some(m => m.status !== 'completed')).length > 0 && (
                    <Link to={createPageUrl('MyChallenges') + '?filter=in_treatment'}>
                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 hover:border-purple-400 transition-all cursor-pointer">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-purple-700" />
                                    <span className="text-sm font-medium text-purple-900">
                                        {t({ en: 'Milestones Due', ar: 'معالم مستحقة' })}
                                    </span>
                                </div>
                                <Badge className="bg-purple-600 text-white">
                                    {challenges.filter(c => c.treatment_plan?.milestones?.some(m => m.status !== 'completed')).length}
                                </Badge>
                            </div>
                        </div>
                    </Link>
                )}

                {escalatedChallenges.length > 0 && (
                    <Link to={createPageUrl('MyChallenges') + '?filter=escalated'}>
                        <div className="p-3 bg-red-50 rounded-lg border border-red-200 hover:border-red-400 transition-all cursor-pointer">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-red-700" />
                                    <span className="text-sm font-medium text-red-900">
                                        {t({ en: 'SLA Violations', ar: 'انتهاكات SLA' })}
                                    </span>
                                </div>
                                <Badge className="bg-red-600 text-white">{escalatedChallenges.filter(c => c.escalation_level === 2).length}</Badge>
                            </div>
                        </div>
                    </Link>
                )}

                {citizenIdeas.length > 0 && (
                    <Link to={createPageUrl('IdeasManagement') + `?municipality=${myMunicipality?.id}`}>
                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 hover:border-purple-400 transition-all cursor-pointer">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Lightbulb className="h-4 w-4 text-purple-700" />
                                    <span className="text-sm font-medium text-purple-900">
                                        {t({ en: 'Ideas to Convert', ar: 'أفكار للتحويل' })}
                                    </span>
                                </div>
                                <Badge className="bg-purple-600 text-white">{citizenIdeas.length}</Badge>
                            </div>
                        </div>
                    </Link>
                )}

                {!hasTasks && (
                    <div className="text-center py-6">
                        <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-600">{t({ en: 'All caught up!', ar: 'كل شيء محدث!' })}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
