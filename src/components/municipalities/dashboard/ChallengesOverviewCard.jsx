
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Zap, Users, AlertCircle, Plus } from 'lucide-react';
import { createPageUrl } from '@/utils';

/**
 * ChallengesOverviewCard - Displays challenges status breakdown and recent challenges.
 * @param {Object} props - Component props
 * @param {Array} props.challenges - Array of challenges
 * @param {Object} props.user - Current user object
 * @param {Function} props.t - Translation function
 * @param {String} props.language - Current language ('en' or 'ar')
 */
export default function ChallengesOverviewCard({ challenges, user, t, language }) {
    return (
        <Card className="lg:col-span-2">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>{t({ en: 'My Challenges Overview', ar: 'نظرة عامة على تحدياتي' })}</CardTitle>
                    <Link to={createPageUrl('MyChallenges')}>
                        <Button variant="outline" size="sm">
                            {t({ en: 'View All', ar: 'عرض الكل' })}
                        </Button>
                    </Link>
                </div>
            </CardHeader>
            <CardContent>
                {/* Status Breakdown */}
                <div className="grid grid-cols-5 gap-2 mb-4">
                    <div className="text-center p-2 bg-slate-50 rounded">
                        <div className="text-lg font-bold text-slate-700">{challenges.filter(c => c.status === 'draft').length}</div>
                        <div className="text-xs text-slate-500">{t({ en: 'Draft', ar: 'مسودة' })}</div>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="text-lg font-bold text-blue-700">{challenges.filter(c => c.status === 'submitted').length}</div>
                        <div className="text-xs text-slate-500">{t({ en: 'Submitted', ar: 'مقدمة' })}</div>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 rounded">
                        <div className="text-lg font-bold text-yellow-700">{challenges.filter(c => c.status === 'under_review').length}</div>
                        <div className="text-xs text-slate-500">{t({ en: 'Review', ar: 'مراجعة' })}</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                        <div className="text-lg font-bold text-green-700">{challenges.filter(c => c.status === 'approved').length}</div>
                        <div className="text-xs text-slate-500">{t({ en: 'Approved', ar: 'معتمد' })}</div>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded">
                        <div className="text-lg font-bold text-purple-700">{challenges.filter(c => c.status === 'in_treatment').length}</div>
                        <div className="text-xs text-slate-500">{t({ en: 'Treatment', ar: 'معالجة' })}</div>
                    </div>
                </div>

                {/* Recent Challenges */}
                <div className="space-y-3">
                    {challenges.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 5).map((challenge) => (
                        <Link
                            key={challenge.id}
                            to={createPageUrl(`ChallengeDetail?id=${challenge.id}`)}
                            className="block p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="outline" className="font-mono text-xs">{challenge.code}</Badge>
                                        <Badge className={
                                            challenge.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                challenge.status === 'in_treatment' ? 'bg-purple-100 text-purple-700' :
                                                    challenge.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                                                        challenge.status === 'resolved' ? 'bg-teal-100 text-teal-700' :
                                                            'bg-slate-100 text-slate-700'
                                        }>{challenge.status}</Badge>
                                        {challenge.escalation_level > 0 && (
                                            <Badge className="bg-red-600 text-white text-xs">
                                                <Zap className="h-3 w-3 mr-1" />
                                                SLA
                                            </Badge>
                                        )}
                                        {challenge.challenge_owner_email === user?.email && (
                                            <Badge variant="outline" className="text-xs">
                                                <Users className="h-3 w-3 mr-1" />
                                                {t({ en: 'Owner', ar: 'مالك' })}
                                            </Badge>
                                        )}
                                    </div>
                                    <h3 className="font-medium text-slate-900 mb-1">
                                        {language === 'ar' && challenge.title_ar ? challenge.title_ar : challenge.title_en}
                                    </h3>
                                    <div className="flex items-center gap-3 text-xs text-slate-600">
                                        <span>{challenge.sector?.replace(/_/g, ' ')}</span>
                                        {challenge.track && <span>• {challenge.track}</span>}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-bold text-blue-600">{challenge.overall_score || 0}</div>
                                    <div className="text-xs text-slate-500">{t({ en: 'Score', ar: 'نقاط' })}</div>
                                </div>
                            </div>
                        </Link>
                    ))}
                    {challenges.length === 0 && (
                        <div className="text-center py-8">
                            <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">{t({ en: 'No challenges yet', ar: 'لا توجد تحديات بعد' })}</p>
                            <Link to={createPageUrl('ChallengeCreate')}>
                                <Button className="mt-3 bg-red-600">
                                    <Plus className="h-4 w-4 mr-2" />
                                    {t({ en: 'Create First Challenge', ar: 'إنشاء أول تحدي' })}
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
