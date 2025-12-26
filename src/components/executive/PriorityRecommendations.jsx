import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { Target, Sparkles, Loader2, Award } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { getSystemPrompt } from '@/lib/saudiContext';
import {
  buildPriorityRecommendationsPrompt,
  priorityRecommendationsSchema,
  PRIORITY_RECOMMENDATIONS_SYSTEM_PROMPT
} from '@/lib/ai/prompts/executive';
import { useChallengesWithVisibility } from '@/hooks/useChallengesWithVisibility';
import { usePilotsList } from '@/hooks/usePilots';
import { useMunicipalities } from '@/hooks/useMunicipalities';

export default function PriorityRecommendations() {
  const { language, isRTL, t } = useLanguage();
  const [recommendations, setRecommendations] = useState(null);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo, error } = useAIWithFallback();

  const { data: challenges = [] } = useChallengesWithVisibility({ limit: 1000 });
  const { data: pilots = [] } = usePilotsList();
  const { data: municipalities = [] } = useMunicipalities();

  const generateRecommendations = async () => {
    // Safety check for arrays
    if (!Array.isArray(challenges) || !Array.isArray(pilots) || !Array.isArray(municipalities)) return;

    const tier1Challenges = challenges.filter(c => c.priority === 'tier_1');
    const approvedChallenges = challenges.filter(c => c.status === 'approved');
    const lowMIIMunicipalities = municipalities.filter(m => (m.mii_score || 0) < 50);

    const stateData = {
      tier1Challenges: tier1Challenges.length,
      approvedNoPilot: approvedChallenges.filter(c => !c.linked_pilot_ids?.length).length,
      activePilots: pilots.filter(p => p.stage === 'active').length,
      readyToScale: pilots.filter(p => p.stage === 'completed' && p.recommendation === 'scale').length,
      lowMIIMunicipalities: lowMIIMunicipalities.length
    };

    const result = await invokeAI({
      system_prompt: getSystemPrompt(PRIORITY_RECOMMENDATIONS_SYSTEM_PROMPT),
      prompt: buildPriorityRecommendationsPrompt(stateData),
      response_json_schema: priorityRecommendationsSchema
    });

    if (result.success) {
      setRecommendations(result.data.priorities);
      toast.success(t({ en: 'Strategic priorities generated', ar: 'تم توليد الأولويات الاستراتيجية' }));
    }
  };

  return (
    <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Target className="h-5 w-5" />
            {t({ en: 'AI Priority Recommendations', ar: 'توصيات الأولويات الذكية' })}
          </CardTitle>
          <Button
            onClick={generateRecommendations}
            disabled={isLoading || !isAvailable}
            size="sm"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Generate', ar: 'توليد' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} error={error} showDetails className="mb-4" />

        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-slate-600">{t({ en: 'Analyzing national priorities...', ar: 'تحليل الأولويات الوطنية...' })}</p>
          </div>
        ) : recommendations ? (
          <div className="space-y-4">
            {recommendations.map((priority, i) => (
              <div key={i} className="p-4 bg-white border-2 border-purple-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                    {priority.rank || i + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 mb-2">{priority.title}</h4>
                    <p className="text-sm text-slate-700 mb-3">{priority.rationale}</p>

                    <div className="mb-3">
                      <p className="text-xs font-semibold text-purple-800 mb-1">
                        {t({ en: '⚡ Quick Wins:', ar: '⚡ إنجازات سريعة:' })}
                      </p>
                      <ul className="text-sm space-y-1">
                        {priority.quick_wins?.map((win, j) => (
                          <li key={j} className="text-slate-700">✓ {win}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {priority.timeline_weeks} {t({ en: 'weeks', ar: 'أسبوع' })}
                      </Badge>
                      <Badge className={
                        priority.resources_needed === 'high' ? 'bg-red-100 text-red-700' :
                          priority.resources_needed === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                      }>
                        {priority.resources_needed} {t({ en: 'resources', ar: 'موارد' })}
                      </Badge>
                      {priority.expected_impact && (
                        <Badge className="bg-blue-100 text-blue-700">
                          <Award className="h-3 w-3 mr-1" />
                          {priority.expected_impact}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">
              {t({ en: 'Click to generate strategic priorities', ar: 'انقر لتوليد الأولويات الاستراتيجية' })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
