import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Network, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { getSystemPrompt } from '@/lib/saudiContext';
import {
  buildClusteringPrompt,
  clusteringSchema,
  CLUSTERING_SYSTEM_PROMPT
} from '@/lib/ai/prompts/challenges';

import { useChallengesWithVisibility } from '@/hooks/useChallengesWithVisibility';
import { useChallengeMutations } from '@/hooks/useChallengeMutations';

export default function ChallengeClustering() {
  const { language, isRTL, t } = useLanguage();
  const [clusters, setClusters] = useState(null);
  const { createChallenge } = useChallengeMutations();

  const { invokeAI, status, error, rateLimitInfo, isLoading, isAvailable } = useAIWithFallback({
    showToasts: true,
    fallbackData: null
  });

  // Use Gold Standard hook for fetching
  const { data: result = { data: [] } } = useChallengesWithVisibility({
    pageSize: 200, // Fetch a reasonable large set for clustering
    filters: { is_deleted: false }
  });

  const challenges = result.data || [];

  const analyzeClusters = async () => {
    const activeChallenges = challenges.filter(c => c.status !== 'archived' && c.status !== 'resolved');

    if (activeChallenges.length === 0) {
      toast.info(t({ en: 'Not enough challenges to analyze', ar: 'لا توجد تحديات كافية للتحليل' }));
      return;
    }

    const response = await invokeAI({
      systemPrompt: getSystemPrompt(CLUSTERING_SYSTEM_PROMPT),
      prompt: buildClusteringPrompt(activeChallenges),
      response_json_schema: clusteringSchema
    });

    if (response.success && response.data?.clusters) {
      setClusters(response.data.clusters);
    }
  };

  const createMegaChallenge = (cluster) => {
    const megaChallengeData = {
      title_en: cluster.name,
      title_ar: cluster.name,
      description_en: cluster.mega_challenge_description,
      sector_id: null,
      keywords: cluster.suggested_tags,
      challenge_type: 'other',
      status: 'draft'
    };

    createChallenge.mutate(megaChallengeData, {
      onSuccess: () => {
        toast.success(t({ en: 'Mega-challenge created', ar: 'تم إنشاء التحدي الضخم' }));
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              {t({ en: 'Challenge Clustering & Smart Grouping', ar: 'تجميع التحديات والتجميع الذكي' })}
            </CardTitle>
            <Button onClick={analyzeClusters} disabled={isLoading || !isAvailable} className="bg-gradient-to-r from-purple-600 to-pink-600">
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {t({ en: 'Analyze Clusters', ar: 'تحليل العناقيد' })}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} showDetails />

          {!clusters && !isLoading && (
            <div className="text-center py-12">
              <Network className="h-16 w-16 text-purple-300 mx-auto mb-4" />
              <p className="text-slate-600">
                {t({ en: 'Click "Analyze Clusters" to group similar challenges using AI', ar: 'انقر "تحليل العناقيد" لتجميع التحديات المشابهة باستخدام الذكاء الاصطناعي' })}
              </p>
            </div>
          )}

          {clusters && (
            <div className="space-y-4">
              {clusters.map((cluster, idx) => {
                const clusterChallenges = challenges.filter(c => cluster.challenge_ids?.includes(c.id));

                return (
                  <Card key={idx} className="border-2 border-purple-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="h-5 w-5 text-purple-600" />
                            <CardTitle className="text-lg">{cluster.name}</CardTitle>
                            <Badge className="bg-purple-100 text-purple-700">
                              {clusterChallenges.length} challenges
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {cluster.suggested_tags?.map((tag, i) => (
                              <Badge key={i} variant="outline">{tag}</Badge>
                            ))}
                          </div>
                        </div>
                        {cluster.mega_challenge_recommended && (
                          <Button
                            onClick={() => createMegaChallenge(cluster)}
                            size="sm"
                            className="bg-gradient-to-r from-purple-600 to-pink-600"
                            disabled={createChallenge.isPending}
                          >
                            <Sparkles className="h-3 w-3 mr-1" />
                            {t({ en: 'Create Mega', ar: 'إنشاء ضخم' })}
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {cluster.mega_challenge_recommended && (
                        <div className="p-3 bg-purple-50 rounded-lg mb-3 border border-purple-200">
                          <p className="text-sm font-medium text-purple-900 mb-1">
                            💡 {t({ en: 'Mega-Challenge Opportunity', ar: 'فرصة تحدي ضخم' })}
                          </p>
                          <p className="text-sm text-slate-700">{cluster.mega_challenge_description}</p>
                        </div>
                      )}

                      <div className="space-y-2">
                        {clusterChallenges.slice(0, 5).map((challenge) => (
                          <Link
                            key={challenge.id}
                            to={createPageUrl(`ChallengeDetail?id=${challenge.id}`)}
                            className="block p-2 border rounded hover:bg-purple-50 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-slate-900">
                                {challenge.title_en || challenge.title_ar}
                              </p>
                              <Badge variant="outline" className="text-xs">{challenge.code}</Badge>
                            </div>
                          </Link>
                        ))}
                        {clusterChallenges.length > 5 && (
                          <p className="text-xs text-slate-500 text-center">
                            + {clusterChallenges.length - 5} more
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
