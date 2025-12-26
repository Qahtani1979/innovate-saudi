import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { ThumbsUp, TrendingUp, MapPin } from 'lucide-react';
import { useVisibilitySystem } from '@/hooks/visibility/useVisibilitySystem';
import { useCitizenFeedback } from '@/hooks/useCitizenFeedback';

export default function IdeaVotingBoard() {
  const { language, t } = useLanguage();
  const { userMunicipalityId, hasFullVisibility, isNational } = useVisibilitySystem();

  // Use visibility-aware feedback hook for suggestions
  const { data: ideas = [] } = useCitizenFeedback({
    feedbackType: 'suggestion',
    entityId: (!hasFullVisibility && !isNational) ? userMunicipalityId : undefined,
    orderBy: 'rating',
    orderDirection: 'desc',
    isPublished: true
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          {t({ en: 'Trending Ideas', ar: 'الأفكار الرائجة' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {ideas.slice(0, 10).map((idea, idx) => (
            <div key={idea.id} className="p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all">
              <div className="flex items-start gap-3">
                <div className="text-center">
                  <Button size="sm" variant="outline" className="w-12 h-12 flex flex-col">
                    <ThumbsUp className="h-4 w-4 text-green-600" />
                    <span className="text-xs font-bold">{idea.rating || 0}</span>
                  </Button>
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-slate-900">
                        {idea.feedback_text?.split('\n')[0] || 'Untitled'}
                      </h4>
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                        {idea.feedback_text}
                      </p>
                    </div>
                    <Badge className="ml-2">#{idx + 1}</Badge>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    {!idea.is_anonymous && idea.user_email && (
                      <span>By {idea.user_email}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {idea.category || 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {ideas.length === 0 && (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-600">
                {t({ en: 'No ideas submitted yet', ar: 'لا أفكار مقدمة بعد' })}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
