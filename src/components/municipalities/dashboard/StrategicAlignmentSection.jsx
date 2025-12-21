
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle2, Activity, Calendar, Target } from 'lucide-react';
import { createPageUrl } from '@/utils';

/**
 * StrategicAlignmentSection - Displays challenge pipeline, treatment progress, and strategic alignment.
 * @param {Object} props - Component props
 * @param {Array} props.challenges - Array of challenges
 * @param {Array} props.strategicPlans - Array of strategic plans
 * @param {Function} props.t - Translation function
 * @param {String} props.language - Current language ('en' or 'ar')
 */
export default function StrategicAlignmentSection({ challenges, strategicPlans, t, language }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Challenge Pipeline by Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">{t({ en: 'Challenge Pipeline', ar: 'خط التحديات' })}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Link to={createPageUrl('MyChallenges') + '?status=draft'}>
                        <div className="p-3 bg-slate-50 rounded-lg border hover:border-slate-400 transition-all cursor-pointer">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-slate-600" />
                                    <span className="text-sm font-medium text-slate-900">{t({ en: 'Drafts', ar: 'مسودات' })}</span>
                                </div>
                                <Badge variant="outline">{challenges.filter(c => c.status === 'draft').length}</Badge>
                            </div>
                        </div>
                    </Link>

                    <Link to={createPageUrl('MyChallenges') + '?status=submitted'}>
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 hover:border-blue-400 transition-all cursor-pointer">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-900">{t({ en: 'In Review', ar: 'قيد المراجعة' })}</span>
                                </div>
                                <Badge className="bg-blue-600 text-white">{challenges.filter(c => c.status === 'submitted' || c.status === 'under_review').length}</Badge>
                            </div>
                        </div>
                    </Link>

                    <Link to={createPageUrl('MyChallenges') + '?status=approved'}>
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200 hover:border-green-400 transition-all cursor-pointer">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-green-900">{t({ en: 'Approved', ar: 'معتمدة' })}</span>
                                </div>
                                <Badge className="bg-green-600 text-white">{challenges.filter(c => c.status === 'approved').length}</Badge>
                            </div>
                        </div>
                    </Link>

                    <Link to={createPageUrl('MyChallenges') + '?status=in_treatment'}>
                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 hover:border-purple-400 transition-all cursor-pointer">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-purple-600" />
                                    <span className="text-sm font-medium text-purple-900">{t({ en: 'In Treatment', ar: 'قيد المعالجة' })}</span>
                                </div>
                                <Badge className="bg-purple-600 text-white">{challenges.filter(c => c.status === 'in_treatment').length}</Badge>
                            </div>
                        </div>
                    </Link>

                    <Link to={createPageUrl('MyChallenges') + '?status=resolved'}>
                        <div className="p-3 bg-teal-50 rounded-lg border border-teal-200 hover:border-teal-400 transition-all cursor-pointer">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-teal-600" />
                                    <span className="text-sm font-medium text-teal-900">{t({ en: 'Resolved', ar: 'محلولة' })}</span>
                                </div>
                                <Badge className="bg-teal-600 text-white">{challenges.filter(c => c.status === 'resolved').length}</Badge>
                            </div>
                        </div>
                    </Link>
                </CardContent>
            </Card>

            {/* Treatment Progress Tracker */}
            <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Activity className="h-5 w-5 text-green-600" />
                        {t({ en: 'Treatment Progress', ar: 'تقدم المعالجة' })}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {challenges.filter(c => c.status === 'in_treatment' && c.treatment_plan).slice(0, 4).map((challenge) => {
                        const milestones = challenge.treatment_plan?.milestones || [];
                        const completed = milestones.filter(m => m.status === 'completed').length;
                        const progress = milestones.length > 0 ? Math.round((completed / milestones.length) * 100) : 0;

                        return (
                            <Link key={challenge.id} to={createPageUrl(`ChallengeDetail?id=${challenge.id}`)}>
                                <div className="p-3 bg-green-50 rounded-lg border border-green-200 hover:border-green-400 transition-all cursor-pointer">
                                    <div className="flex items-center justify-between mb-2">
                                        <Badge variant="outline" className="text-xs font-mono">{challenge.code}</Badge>
                                        <Badge className="bg-green-600 text-white text-xs">{progress}%</Badge>
                                    </div>
                                    <p className="text-sm font-medium text-slate-900 truncate">
                                        {language === 'ar' && challenge.title_ar ? challenge.title_ar : challenge.title_en}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-slate-600 mt-2">
                                        <Calendar className="h-3 w-3" />
                                        <span>{completed}/{milestones.length} {t({ en: 'milestones', ar: 'معالم' })}</span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                    {challenges.filter(c => c.status === 'in_treatment').length === 0 && (
                        <div className="text-center py-6">
                            <Activity className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-xs text-slate-500">{t({ en: 'No active treatments', ar: 'لا توجد معالجات نشطة' })}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Strategic Alignment */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Target className="h-5 w-5 text-indigo-600" />
                            {t({ en: 'Strategic Alignment', ar: 'التوافق الاستراتيجي' })}
                        </CardTitle>
                        <Link to={createPageUrl('StrategyCockpit')}>
                            <Button size="sm" variant="outline">
                                {t({ en: 'Details', ar: 'التفاصيل' })}
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {strategicPlans.slice(0, 3).map((plan) => {
                        const linkedCount = challenges.filter(c =>
                            c.strategic_plan_ids?.includes(plan.id)
                        ).length;
                        return (
                            <div key={plan.id} className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium text-indigo-900 truncate">
                                        {language === 'ar' && plan.name_ar ? plan.name_ar : plan.name_en}
                                    </p>
                                    <Badge variant="outline" className="text-xs">{linkedCount} {t({ en: 'challenges', ar: 'تحديات' })}</Badge>
                                </div>
                                <div className="text-xs text-slate-600">
                                    {linkedCount > 0 ? (
                                        <span className="text-green-700">✓ {t({ en: 'Contributing', ar: 'مساهم' })}</span>
                                    ) : (
                                        <span className="text-slate-500">{t({ en: 'No active challenges', ar: 'لا توجد تحديات نشطة' })}</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>
        </div>
    );
}
