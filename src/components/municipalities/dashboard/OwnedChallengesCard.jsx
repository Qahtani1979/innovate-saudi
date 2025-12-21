
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { createPageUrl } from '@/utils';

/**
 * OwnedChallengesCard - Displays challenges owned by the user.
 * @param {Object} props - Component props
 * @param {Array} props.ownedChallenges - Array of owned challenges
 * @param {Function} props.t - Translation function
 * @param {String} props.language - Current language ('en' or 'ar')
 */
export default function OwnedChallengesCard({ ownedChallenges, t, language }) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Shield className="h-5 w-5 text-blue-600" />
                        {t({ en: 'Challenges I Own', ar: 'التحديات التي أملكها' })}
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                {ownedChallenges.length > 0 ? (
                    ownedChallenges.slice(0, 4).map((challenge) => (
                        <Link key={challenge.id} to={createPageUrl(`ChallengeDetail?id=${challenge.id}`)}>
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 hover:border-blue-400 transition-all cursor-pointer">
                                <div className="flex items-center justify-between mb-1">
                                    <Badge variant="outline" className="font-mono text-xs">{challenge.code}</Badge>
                                    <Badge className={
                                        challenge.status === 'in_treatment' ? 'bg-purple-100 text-purple-700 text-xs' :
                                            challenge.status === 'approved' ? 'bg-green-100 text-green-700 text-xs' :
                                                'bg-blue-100 text-blue-700 text-xs'
                                    }>{challenge.status}</Badge>
                                </div>
                                <p className="text-sm font-medium text-slate-900 truncate">
                                    {language === 'ar' && challenge.title_ar ? challenge.title_ar : challenge.title_en}
                                </p>
                                {challenge.treatment_plan?.milestones && (
                                    <div className="mt-2 text-xs text-slate-600">
                                        {challenge.treatment_plan.milestones.filter(m => m.status === 'completed').length}/{challenge.treatment_plan.milestones.length} {t({ en: 'milestones', ar: 'معالم' })}
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="text-center py-6">
                        <Shield className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-500">{t({ en: 'No owned challenges', ar: 'لا توجد تحديات مملوكة' })}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
