import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { AlertTriangle, TrendingDown, Shield, Zap, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function AIRiskForecasting() {
  const { language, isRTL, t } = useLanguage();
  const [risks, setRisks] = useState(null);
  const { invokeAI, status, isLoading: forecasting, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots-risk'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges-risk'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const generateForecast = async () => {
    const activePilots = pilots.filter(p => p.stage === 'active' || p.stage === 'monitoring');
    const criticalChallenges = challenges.filter(c => c.priority === 'tier_1' && c.status === 'approved');

    const result = await invokeAI({
      prompt: `Analyze the Saudi municipal innovation ecosystem and forecast strategic risks:

Active Pilots: ${activePilots.length}
Critical Challenges: ${criticalChallenges.length}
High-Budget Pilots: ${pilots.filter(p => p.budget > 5000000).length}

Based on this data, identify:
1. Top 5 strategic risks (with severity: critical/high/medium)
2. Early warning indicators for each risk
3. Recommended mitigation actions
4. Timeline forecast (when risk might materialize: weeks/months)`,
      response_json_schema: {
        type: 'object',
        properties: {
          risks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                severity: { type: 'string' },
                probability: { type: 'string' },
                early_indicators: { type: 'array', items: { type: 'string' } },
                mitigation: { type: 'array', items: { type: 'string' } },
                timeline: { type: 'string' },
                affected_areas: { type: 'array', items: { type: 'string' } }
              }
            }
          }
        }
      }
    });

    if (result.success) {
      setRisks(result.data?.risks);
      toast.success(t({ en: 'Risk forecast generated', ar: 'تم إنشاء توقع المخاطر' }));
    }
  };

  const severityConfig = {
    critical: { color: 'bg-red-100 text-red-700 border-red-300', icon: AlertTriangle },
    high: { color: 'bg-orange-100 text-orange-700 border-orange-300', icon: TrendingDown },
    medium: { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: Shield }
  };

  return (
    <Card className="border-2 border-red-300 bg-gradient-to-br from-red-50 to-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-red-900">
            <Zap className="h-5 w-5" />
            {t({ en: 'AI Risk Forecasting', ar: 'توقع المخاطر الذكي' })}
          </CardTitle>
          <Button
            onClick={generateForecast}
            disabled={forecasting || !isAvailable}
            size="sm"
          >
            {forecasting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Generate Forecast', ar: 'توليد التوقع' })}
          </Button>
        </div>
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} className="mt-2" />
      </CardHeader>
      <CardContent>
        {forecasting ? (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-red-600 mx-auto mb-4" />
            <p className="text-slate-600">{t({ en: 'Analyzing ecosystem risks...', ar: 'تحليل مخاطر المنظومة...' })}</p>
          </div>
        ) : risks ? (
          <div className="space-y-4">
            {risks.map((risk, i) => {
              const config = severityConfig[risk.severity?.toLowerCase()] || severityConfig.medium;
              const Icon = config.icon;
              
              return (
                <div key={i} className={`p-4 border-2 rounded-lg ${config.color}`}>
                  <div className="flex items-start gap-3">
                    <Icon className="h-6 w-6 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-slate-900">{risk.title}</h4>
                        <div className="flex gap-2">
                          <Badge className={config.color}>{risk.severity}</Badge>
                          <Badge variant="outline">{risk.probability}%</Badge>
                        </div>
                      </div>

                      {risk.early_indicators?.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-semibold text-slate-700 mb-1">
                            {t({ en: '⚠️ Early Indicators:', ar: '⚠️ مؤشرات مبكرة:' })}
                          </p>
                          <ul className="text-sm space-y-1">
                            {risk.early_indicators.map((ind, j) => (
                              <li key={j} className="text-slate-700">• {ind}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {risk.mitigation?.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs font-semibold text-green-800 mb-1">
                            {t({ en: '✅ Recommended Actions:', ar: '✅ الإجراءات الموصى بها:' })}
                          </p>
                          <ul className="text-sm space-y-1">
                            {risk.mitigation.map((action, j) => (
                              <li key={j} className="text-slate-700">• {action}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-slate-600 mt-3">
                        <span>⏱ {risk.timeline}</span>
                        {risk.affected_areas?.length > 0 && (
                          <span>📍 {risk.affected_areas.join(', ')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Shield className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">
              {t({ en: 'Click to generate AI risk forecast', ar: 'انقر لتوليد توقع المخاطر الذكي' })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}