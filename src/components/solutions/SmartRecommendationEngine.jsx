import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { Sparkles, TrendingUp, Eye, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { useSolutions } from '@/hooks/useSolutions';
import { useUserActivity, useLogActivity } from '@/hooks/useUserActivity';
import { useSmartRecommendations } from '@/hooks/useAIInsights';

/**
 * SmartRecommendationEngine
 * ✅ GOLD STANDARD COMPLIANT
 */
export default function SmartRecommendationEngine({ challenge, userId, limit = 3 }) {
  const { t } = useLanguage();
  const [dismissed, setDismissed] = useState([]);

  const { solutions = [] } = useSolutions({ publishedOnly: true, limit: 100 });
  const { activities: userActivity = [] } = useUserActivity(userId, userId);
  const trackInteraction = useLogActivity();

  const { recommendations } = useSmartRecommendations({
    challenge,
    userId,
    solutions,
    userActivity,
    dismissed
  });

  const handleView = (solutionId, score) => {
    trackInteraction.mutate({
      user_email: userId,
      activity_type: 'view',
      entity_type: 'solution',
      entity_id: solutionId,
      metadata: { recommendation_score: Number(score) }
    });
  };

  const handleDismiss = (solutionId) => {
    setDismissed([...dismissed, solutionId]);
    trackInteraction.mutate({
      user_email: userId,
      activity_type: 'dismiss',
      entity_type: 'solution',
      entity_id: solutionId,
      metadata: { recommendation_score: 0 }
    });
  };

  if (recommendations.length === 0) return null;

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <Sparkles className="h-5 w-5" />
          {t({ en: 'AI Recommendations', ar: 'التوصيات الذكية' })}
          <Badge className="bg-purple-600 text-white text-xs">
            Personalized
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((solution, idx) => (
          <div key={solution.id} className="p-3 bg-white rounded-lg border border-purple-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-purple-100 text-purple-700 text-xs">
                    #{idx + 1}
                  </Badge>
                  <p className="font-semibold text-slate-900 text-sm">{solution.name_en}</p>
                </div>
                <p className="text-xs text-slate-600">{solution.provider_name}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">{solution.maturity_level}</Badge>
                  {solution.average_rating && (
                    <div className="flex items-center gap-1 text-xs">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span>{solution.average_rating.toFixed(1)}/5</span>
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDismiss(solution.id)}
                className="h-6 w-6"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1">
                <p className="text-xs text-slate-500 mb-1">Match Score</p>
                <Progress value={Math.min(solution.recommendation_score, 100)} className="h-2" />
              </div>
              <Link to={createPageUrl(`SolutionDetail?id=${solution.id}`)}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleView(solution.id, solution.recommendation_score)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  {t({ en: 'View', ar: 'عرض' })}
                </Button>
              </Link>
            </div>
          </div>
        ))}

        <p className="text-xs text-slate-500 text-center pt-2">
          {t({ en: 'Recommendations improve as you interact with solutions', ar: 'تتحسن التوصيات مع تفاعلك' })}
        </p>
      </CardContent>
    </Card>
  );
}
