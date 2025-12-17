import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { MapPin, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { buildGeographicClusteringPrompt, geographicClusteringSchema, GEOGRAPHIC_CLUSTERING_SYSTEM_PROMPT } from '@/lib/ai/prompts/geography';
import { getSystemPrompt } from '@/lib/saudiContext';

export default function GeographicClustering({ entities, entityType = 'challenge' }) {
  const { t, language } = useLanguage();
  const [clusters, setClusters] = useState(null);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const analyzeGeographicPatterns = async () => {
    const result = await invokeAI({
      prompt: buildGeographicClusteringPrompt(entities, entityType),
      systemPrompt: getSystemPrompt(GEOGRAPHIC_CLUSTERING_SYSTEM_PROMPT),
      response_json_schema: geographicClusteringSchema
    });

    if (result.success) {
      setClusters(result.data);
      toast.success(t({ en: 'Analysis complete', ar: 'اكتمل التحليل' }));
    }
  };

  return (
    <Card className="border-2 border-green-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-green-600" />
          {t({ en: 'Geographic Intelligence', ar: 'الذكاء الجغرافي' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} showDetails />
        
        {!clusters && (
          <div className="text-center py-6">
            <Sparkles className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <p className="text-sm text-slate-600 mb-4">
              {t({ en: 'AI will analyze geographic patterns and identify opportunities', ar: 'سيقوم الذكاء بتحليل الأنماط الجغرافية وتحديد الفرص' })}
            </p>
            <Button onClick={analyzeGeographicPatterns} disabled={isLoading || !isAvailable} className="gap-2">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t({ en: 'Analyzing...', ar: 'يحلل...' })}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {t({ en: 'Analyze Geography', ar: 'تحليل الجغرافيا' })}
                </>
              )}
            </Button>
          </div>
        )}

        {clusters && (
          <div className="space-y-4">
            {clusters.clusters?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">{t({ en: 'Geographic Clusters', ar: 'التجمعات الجغرافية' })}</h4>
                <div className="space-y-2">
                  {clusters.clusters.map((cluster, i) => (
                    <div key={i} className="p-3 bg-green-50 rounded border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{cluster.region}</p>
                        <Badge>{cluster.entity_count} {entityType}s</Badge>
                      </div>
                      <div className="flex flex-wrap gap-1 text-xs">
                        {cluster.common_themes?.map((theme, j) => (
                          <Badge key={j} variant="outline">{theme}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {clusters.underserved_areas?.length > 0 && (
              <div className="p-4 bg-red-50 rounded border border-red-200">
                <h4 className="font-semibold text-sm text-red-900 mb-2">{t({ en: 'Underserved Areas', ar: 'مناطق محرومة' })}</h4>
                <ul className="text-sm text-red-800 space-y-1">
                  {clusters.underserved_areas.map((area, i) => (
                    <li key={i}>• {area}</li>
                  ))}
                </ul>
              </div>
            )}

            {clusters.collaboration_opportunities?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">{t({ en: 'Collaboration Opportunities', ar: 'فرص التعاون' })}</h4>
                <div className="space-y-2">
                  {clusters.collaboration_opportunities.map((opp, i) => (
                    <div key={i} className="p-3 bg-blue-50 rounded border border-blue-200">
                      <p className="font-medium text-sm mb-1">{opp.theme}</p>
                      <p className="text-xs text-slate-600">
                        {opp.municipalities?.join(', ')}
                      </p>
                      <Badge className="mt-2 bg-blue-600 text-white text-xs">{opp.potential}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
