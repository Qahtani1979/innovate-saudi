import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { Sparkles, TrendingUp, Eye, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function SmartRecommendationEngine({ challenge, userId, limit = 3 }) {
  const { t } = useLanguage();
  const [recommendations, setRecommendations] = useState([]);
  const [dismissed, setDismissed] = useState([]);

  const { data: solutions = [] } = useQuery({
    queryKey: ['solutions-for-recommendations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('solutions').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: userActivity = [] } = useQuery({
    queryKey: ['user-activity', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_email', userId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId
  });

  const trackInteraction = useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase.from('user_activities').insert({
        user_email: userId,
        activity_type: data.type,
        entity_type: 'solution',
        entity_id: data.solutionId,
        metadata: { recommendation_score: data.score }
      });
      if (error) throw error;
    }
  });

  useEffect(() => {
    if (solutions.length === 0) return;

    // Calculate personalized recommendations with learning
    const userViewedSolutions = userActivity
      .filter(a => a.activity_type === 'view' && a.entity_type === 'solution')
      .map(a => a.entity_id);

    const userLikedSectors = userActivity
      .filter(a => a.activity_type === 'express_interest')
      .map(a => {
        const sol = solutions.find(s => s.id === a.entity_id);
        return sol?.sectors || [];
      })
      .flat();

    const sectorWeights = {};
    userLikedSectors.forEach(sector => {
      sectorWeights[sector] = (sectorWeights[sector] || 0) + 1;
    });

    const scored = solutions
      .filter(s => s.is_verified && !dismissed.includes(s.id) && !userViewedSolutions.includes(s.id))
      .map(solution => {
        let score = 0;

        // Base quality score
        score += (solution.average_rating || 0) * 10;
        score += (solution.success_rate || 0) * 0.5;
        score += (solution.deployment_count || 0) * 2;

        // User preference learning
        const solutionSectors = solution.sectors || [];
        solutionSectors.forEach(sector => {
          if (sectorWeights[sector]) {
            score += sectorWeights[sector] * 15; // Heavy weight for user interests
          }
        });

        // Challenge alignment (if challenge provided)
        if (challenge) {
          if (solution.sectors?.includes(challenge.sector)) score += 30;
          if (solution.maturity_level === 'proven' || solution.maturity_level === 'market_ready') {
            score += 20;
          }
        }

        // Recency boost
        const daysSinceCreated = (new Date() - new Date(solution.created_date)) / (1000 * 60 * 60 * 24);
        if (daysSinceCreated < 30) score += 10;

        return { ...solution, recommendation_score: score };
      })
      .sort((a, b) => b.recommendation_score - a.recommendation_score)
      .slice(0, limit);

    setRecommendations(scored);
  }, [solutions, userActivity, challenge, dismissed, limit]);

  const handleView = (solutionId, score) => {
    trackInteraction.mutate({ type: 'view', solutionId, score });
  };

  const handleDismiss = (solutionId) => {
    setDismissed([...dismissed, solutionId]);
    trackInteraction.mutate({ type: 'dismiss', solutionId, score: 0 });
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