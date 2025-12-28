import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { createPageUrl } from '@/utils';

/**
 * MatchedSolutionsWidget - Displays AI-matched solutions for challenges
 * @param {Object} props - Component props
 * @param {Array} props.matchedSolutions - Array of matched solutions
 * @param {Array} props.challenges - Array of challenges
 * @param {Function} props.t - Translation function
 */
export default function MatchedSolutionsWidget({ matchedSolutions, challenges, t }) {
    return (
        <Card className="border-l-4 border-l-teal-500">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Sparkles className="h-5 w-5 text-teal-600" />
                    {t({ en: 'New Solution Matches', ar: 'مطابقات حلول جديدة' })}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {matchedSolutions.length > 0 ? (
                    matchedSolutions.map((match) => {
                        const challenge = challenges.find(c => c.id === match.challenge_id);
                        return (
                            <div key={match.id} className="p-3 bg-teal-50 rounded-lg border border-teal-200">
                                <div className="flex items-center justify-between mb-2">
                                    <Badge className="bg-teal-600 text-white text-xs">{match.match_score}% Match</Badge>
                                    <Badge variant="outline" className="text-xs">{challenge?.code}</Badge>
                                </div>
                                <p className="text-xs text-slate-700 mb-1 truncate">{match.solution_name}</p>
                                <Link to={createPageUrl(`ChallengeSolutionMatching?challenge_id=${match.challenge_id}`)}>
                                    <Button size="sm" variant="outline" className="w-full text-xs mt-2">
                                        {t({ en: 'Review Match', ar: 'مراجعة المطابقة' })}
                                    </Button>
                                </Link>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-6">
                        <Sparkles className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-500">{t({ en: 'No new matches', ar: 'لا توجد مطابقات جديدة' })}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
