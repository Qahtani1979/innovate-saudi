import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, TrendingDown, Minus, Loader2, Network } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useLanguage } from './LanguageContext';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { 
  buildPeerComparisonPrompt, 
  peerComparisonSchema,
  PEER_COMPARISON_SYSTEM_PROMPT 
} from '@/lib/ai/prompts/core';

export default function AIPeerComparison({ pilot }) {
  const { invokeAI, status, isLoading: analyzing, rateLimitInfo, isAvailable } = useAIWithFallback();
  const [comparison, setComparison] = useState(null);
  const { t, language } = useLanguage();

  const analyzePeers = async () => {
    if (!isAvailable) return;
    
    try {
      const allPilots = await base44.entities.Pilot.list();
      
      // Find similar pilots
      const similarPilots = allPilots.filter(p => 
        p.id !== pilot.id &&
        (p.sector === pilot.sector || p.challenge_id === pilot.challenge_id) &&
        (p.stage === 'completed' || p.stage === 'evaluation' || p.stage === 'scaled')
      ).slice(0, 5);

      const response = await invokeAI({
        prompt: buildPeerComparisonPrompt(pilot, similarPilots),
        response_json_schema: peerComparisonSchema,
        system_prompt: PEER_COMPARISON_SYSTEM_PROMPT
      });

      if (response.success && response.data) {
        const data = response.data;
        // Map bilingual fields based on language
        setComparison({
          summary: language === 'ar' ? data.summary_ar : data.summary_en,
          budget_comparison: {
            status: data.budget_comparison?.status,
            insight: language === 'ar' ? data.budget_comparison?.insight_ar : data.budget_comparison?.insight_en
          },
          timeline_comparison: {
            status: data.timeline_comparison?.status,
            insight: language === 'ar' ? data.timeline_comparison?.insight_ar : data.timeline_comparison?.insight_en
          },
          success_factors: language === 'ar' ? data.success_factors_ar : data.success_factors_en,
          risk_areas: language === 'ar' ? data.risk_areas_ar : data.risk_areas_en,
          recommendations: language === 'ar' ? data.recommendations_ar : data.recommendations_en,
          peer_rankings: data.peer_rankings?.map(r => ({
            aspect: language === 'ar' ? r.aspect_ar : r.aspect_en,
            rank: r.rank,
            total: r.total
          })),
          peers: similarPilots
        });
        toast.success(t({ en: 'Peer analysis complete', ar: 'اكتمل تحليل الأقران' }));
      }
    } catch (error) {
      toast.error(t({ en: 'Analysis failed', ar: 'فشل التحليل' }) + ': ' + error.message);
    }
  };

  const getComparisonIcon = (status) => {
    if (status === 'above_average' || status === 'faster') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (status === 'below_average' || status === 'slower') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-slate-600" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Network className="h-5 w-5 text-purple-600" />
            {t({ en: 'AI Peer Comparison', ar: 'مقارنة الأقران بالذكاء الاصطناعي' })}
          </span>
          <Button
            onClick={analyzePeers}
            disabled={analyzing || !isAvailable}
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            {analyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t({ en: 'Analyzing...', ar: 'جاري التحليل...' })}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                {t({ en: 'Analyze vs Peers', ar: 'تحليل مع الأقران' })}
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} className="mb-4" />
        {!comparison ? (
          <div className="text-center py-12">
            <Network className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">
              {t({ 
                en: 'Compare this pilot with similar pilots in the platform', 
                ar: 'قارن هذه التجربة مع تجارب مماثلة في المنصة' 
              })}
            </p>
            <Button onClick={analyzePeers} disabled={analyzing || !isAvailable}>
              <Sparkles className="h-4 w-4 mr-2" />
              {t({ en: 'Run Analysis', ar: 'تشغيل التحليل' })}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <p className="text-sm text-slate-700 leading-relaxed">{comparison.summary}</p>
            </div>

            {/* Comparative Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-2">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-700">Budget Position</p>
                    {getComparisonIcon(comparison.budget_comparison.status)}
                  </div>
                  <Badge className={
                    comparison.budget_comparison.status === 'above_average' ? 'bg-green-100 text-green-700' :
                    comparison.budget_comparison.status === 'below_average' ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-700'
                  }>
                    {comparison.budget_comparison.status.replace(/_/g, ' ')}
                  </Badge>
                  <p className="text-xs text-slate-600 mt-2">{comparison.budget_comparison.insight}</p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-700">Timeline Position</p>
                    {getComparisonIcon(comparison.timeline_comparison.status)}
                  </div>
                  <Badge className={
                    comparison.timeline_comparison.status === 'faster' ? 'bg-green-100 text-green-700' :
                    comparison.timeline_comparison.status === 'slower' ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-700'
                  }>
                    {comparison.timeline_comparison.status}
                  </Badge>
                  <p className="text-xs text-slate-600 mt-2">{comparison.timeline_comparison.insight}</p>
                </CardContent>
              </Card>
            </div>

            {/* Rankings */}
            {comparison.peer_rankings?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Performance Rankings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {comparison.peer_rankings.map((ranking, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                        <span className="text-sm text-slate-700">{ranking.aspect}</span>
                        <Badge variant="outline">
                          #{ranking.rank} of {ranking.total}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Success Factors */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-sm text-green-900">✅ Success Factors</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {comparison.success_factors.map((factor, idx) => (
                      <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                        <span className="text-green-600">•</span>
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-sm text-red-900">⚠️ Risk Areas</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {comparison.risk_areas.map((risk, idx) => (
                      <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                        <span className="text-red-600">•</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Recommendations */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-sm text-blue-900">💡 AI Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {comparison.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-blue-600 font-bold">{idx + 1}.</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Peer Pilots */}
            {comparison.peers?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Similar Pilots ({comparison.peers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {comparison.peers.map((peer) => (
                      <Link
                        key={peer.id}
                        to={createPageUrl(`PilotDetail?id=${peer.id}`)}
                        className="block p-3 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm text-slate-900">{peer.title_en}</p>
                            <p className="text-xs text-slate-500">{peer.sector?.replace(/_/g, ' ')}</p>
                          </div>
                          <Badge className={
                            peer.stage === 'scaled' ? 'bg-green-100 text-green-700' :
                            peer.stage === 'completed' ? 'bg-blue-100 text-blue-700' :
                            'bg-amber-100 text-amber-700'
                          }>
                            {peer.stage}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}