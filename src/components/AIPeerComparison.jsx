import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
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

export default function AIPeerComparison({ pilot }) {
  const { invokeAI, status, isLoading: analyzing, rateLimitInfo, isAvailable } = useAIWithFallback();
  const [comparison, setComparison] = useState(null);
  const { t } = useLanguage();

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
        prompt: `Analyze this pilot against peer pilots and provide comparative insights:

**Current Pilot:**
- Title: ${pilot.title_en}
- Sector: ${pilot.sector}
- Budget: ${pilot.budget}
- Duration: ${pilot.duration_weeks} weeks
- KPIs: ${JSON.stringify(pilot.kpis)}
- Success Probability: ${pilot.success_probability}%
- Stage: ${pilot.stage}

**Peer Pilots for Comparison:**
${similarPilots.map((p, i) => `
${i + 1}. ${p.title_en}
   - Budget: ${p.budget}
   - Duration: ${p.duration_weeks} weeks
   - Stage: ${p.stage}
   - Success: ${p.success_probability}%
`).join('\n')}

Provide:
1. Overall comparison summary
2. Budget comparison (above/below peers)
3. Timeline comparison
4. Success factors from top performers
5. Risk areas identified in peer failures
6. Recommendations for improvement

Return JSON with structured insights.`,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            budget_comparison: {
              type: "object",
              properties: {
                status: { type: "string", enum: ["above_average", "average", "below_average"] },
                insight: { type: "string" }
              }
            },
            timeline_comparison: {
              type: "object",
              properties: {
                status: { type: "string", enum: ["faster", "average", "slower"] },
                insight: { type: "string" }
              }
            },
            success_factors: {
              type: "array",
              items: { type: "string" }
            },
            risk_areas: {
              type: "array",
              items: { type: "string" }
            },
            recommendations: {
              type: "array",
              items: { type: "string" }
            },
            peer_rankings: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  aspect: { type: "string" },
                  rank: { type: "number" },
                  total: { type: "number" }
                }
              }
            }
          }
        }
      });

      if (response.success && response.data) {
        setComparison({ ...response.data, peers: similarPilots });
        toast.success('Peer analysis complete');
      }
    } catch (error) {
      toast.error('Analysis failed: ' + error.message);
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