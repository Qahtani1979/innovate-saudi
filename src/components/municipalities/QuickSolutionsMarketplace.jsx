import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import {
  Lightbulb, Star, TrendingUp, ArrowRight, CheckCircle2
} from 'lucide-react';
import ExpressInterestButton from '../solutions/ExpressInterestButton';

export default function QuickSolutionsMarketplace({ municipalityId, challenges = [] }) {
  const { language, isRTL, t } = useLanguage();

  const { data: matchedSolutions = [] } = useQuery({
    queryKey: ['matched-solutions', municipalityId],
    queryFn: async () => {
      const challengeIds = challenges.map(c => c.id);
      const matches = await base44.entities.ChallengeSolutionMatch.list();
      const relevantMatches = matches.filter(m => challengeIds.includes(m.challenge_id));
      
      const solutionIds = [...new Set(relevantMatches.map(m => m.solution_id))];
      const solutions = await base44.entities.Solution.list();
      
      return solutions
        .filter(s => solutionIds.includes(s.id) && s.is_published && s.is_verified)
        .slice(0, 6);
    },
    enabled: challenges.length > 0
  });

  if (matchedSolutions.length === 0) return null;

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-blue-600" />
            {t({ en: 'Recommended Solutions for Your Challenges', ar: 'الحلول الموصى بها لتحدياتك' })}
          </CardTitle>
          <Link to={createPageUrl('Solutions')}>
            <Button size="sm" variant="outline">
              {t({ en: 'View All', ar: 'عرض الكل' })}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matchedSolutions.map((solution) => (
            <Card key={solution.id} className="hover:shadow-md transition-all">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-slate-900 line-clamp-2">
                      {language === 'ar' && solution.name_ar ? solution.name_ar : solution.name_en}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">{solution.provider_name}</p>
                  </div>
                  {solution.is_verified && (
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                  )}
                </div>

                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Badge className="text-xs">{solution.maturity_level}</Badge>
                  {solution.average_rating && (
                    <div className="flex items-center gap-1 text-xs">
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                      {solution.average_rating.toFixed(1)}
                    </div>
                  )}
                  {solution.deployment_count > 0 && (
                    <Badge variant="outline" className="text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {solution.deployment_count}
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link to={createPageUrl(`SolutionDetail?id=${solution.id}`)} className="flex-1">
                    <Button size="sm" variant="outline" className="w-full">
                      {t({ en: 'View', ar: 'عرض' })}
                    </Button>
                  </Link>
                  <ExpressInterestButton solution={solution} variant="sm" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}