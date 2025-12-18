import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { AlertTriangle, Sparkles, Loader2, Shield } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, BarChart, Bar, LineChart, Line, Legend } from 'recharts';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

function RiskPortfolio() {
  const { language, isRTL, t } = useLanguage();
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const { invokeAI, isLoading: analyzing, status, error, rateLimitInfo } = useAIWithFallback();

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const { data: rdProjects = [] } = useQuery({
    queryKey: ['rd-projects'],
    queryFn: () => base44.entities.RDProject.list()
  });

  const analyzeRisks = async () => {
    // Import centralized prompt module
    const { RISK_PORTFOLIO_PROMPT_TEMPLATE, RISK_PORTFOLIO_RESPONSE_SCHEMA } = await import('@/lib/ai/prompts/analytics/riskPortfolio');
    
    const highRiskPilots = pilots.filter(p => p.risk_level === 'high' || p.risk_level === 'critical');
    const activePilotsCount = pilots.filter(p => p.stage === 'active' || p.stage === 'monitoring').length;
    const activeChallengesCount = challenges.filter(c => c.status === 'approved' || c.status === 'in_treatment').length;
    
    const result = await invokeAI({
      prompt: RISK_PORTFOLIO_PROMPT_TEMPLATE({
        highRiskPilots,
        activePilotsCount,
        activeChallengesCount
      }),
      response_json_schema: {
        type: 'object',
        properties: {
          risk_heatmap: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                risk_category_en: { type: 'string' },
                risk_category_ar: { type: 'string' },
                severity: { type: 'string' },
                affected_count: { type: 'number' },
                description_en: { type: 'string' },
                description_ar: { type: 'string' }
              }
            }
          },
          risk_trends: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                period: { type: 'string' },
                high_risk: { type: 'number' },
                medium_risk: { type: 'number' },
                low_risk: { type: 'number' }
              }
            }
          },
          mitigation_priorities: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                action_en: { type: 'string' },
                action_ar: { type: 'string' },
                urgency: { type: 'string' },
                impact_en: { type: 'string' },
                impact_ar: { type: 'string' }
              }
            }
          },
          portfolio_risk_score: { type: 'number' },
          risk_interpretation_en: { type: 'string' },
          risk_interpretation_ar: { type: 'string' }
        }
      }
    });

    if (result.success && result.data) {
      setAiAnalysis(result.data);
      toast.success(t({ en: 'Risk analysis complete', ar: 'اكتمل تحليل المخاطر' }));
    }
  };

  const riskDistribution = {
    high: pilots.filter(p => p.risk_level === 'high' || p.risk_level === 'critical').length,
    medium: pilots.filter(p => p.risk_level === 'medium').length,
    low: pilots.filter(p => p.risk_level === 'low').length
  };

  const riskScatter = pilots.filter(p => p.risk_level).map(p => ({
    name: p.code,
    probability: p.success_probability || 50,
    impact: p.impact_score || 50,
    risk: p.risk_level === 'high' || p.risk_level === 'critical' ? 100 : p.risk_level === 'medium' ? 60 : 30
  }));

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-red-600 via-orange-600 to-yellow-600 p-8 text-white">
        <h1 className="text-5xl font-bold mb-2">
          {t({ en: '⚠️ Risk Portfolio Dashboard', ar: '⚠️ لوحة محفظة المخاطر' })}
        </h1>
        <p className="text-xl text-white/90">
          {t({ en: 'Aggregated risk analysis, trends, and mitigation tracking', ar: 'تحليل المخاطر المجمع والاتجاهات وتتبع التخفيف' })}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-white border-2 border-red-300">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-10 w-10 text-red-600 mx-auto mb-2" />
            <p className="text-4xl font-bold text-red-600">{riskDistribution.high}</p>
            <p className="text-sm text-slate-600">{t({ en: 'High Risk', ar: 'خطر عالي' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-white border-2 border-yellow-300">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-10 w-10 text-yellow-600 mx-auto mb-2" />
            <p className="text-4xl font-bold text-yellow-600">{riskDistribution.medium}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Medium Risk', ar: 'خطر متوسط' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white border-2 border-green-300">
          <CardContent className="pt-6 text-center">
            <Shield className="h-10 w-10 text-green-600 mx-auto mb-2" />
            <p className="text-4xl font-bold text-green-600">{riskDistribution.low}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Low Risk', ar: 'خطر منخفض' })}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <CardContent className="pt-6">
          <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} className="mb-4" />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-blue-900 mb-1 text-lg">
                {t({ en: 'AI Risk Analysis', ar: 'تحليل المخاطر الذكي' })}
              </p>
              <p className="text-sm text-slate-600">
                {t({ en: 'Comprehensive portfolio risk assessment with mitigation priorities', ar: 'تقييم شامل لمخاطر المحفظة مع أولويات التخفيف' })}
              </p>
            </div>
            <Button onClick={analyzeRisks} disabled={analyzing} className="bg-gradient-to-r from-red-600 to-orange-600">
              {analyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {t({ en: 'Analyze Risks', ar: 'تحليل المخاطر' })}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Risk vs Impact Matrix', ar: 'مصفوفة المخاطر والتأثير' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="probability" name="Success Probability" />
                <YAxis dataKey="impact" name="Impact Score" />
                <ZAxis dataKey="risk" range={[50, 400]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Pilots" data={riskScatter} fill="#ef4444" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Risk Distribution', ar: 'توزيع المخاطر' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { level: 'High', count: riskDistribution.high },
                { level: 'Medium', count: riskDistribution.medium },
                { level: 'Low', count: riskDistribution.low }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="level" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {aiAnalysis && (
        <div className="space-y-6">
          {/* Portfolio Risk Score */}
          <Card className="border-4 border-red-400">
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <p className="text-6xl font-bold text-red-600">{aiAnalysis.portfolio_risk_score}/100</p>
                <p className="text-sm text-slate-600 mt-2">{t({ en: 'Portfolio Risk Score', ar: 'درجة مخاطر المحفظة' })}</p>
              </div>
              <p className="text-slate-700 text-center" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {language === 'ar' ? aiAnalysis.risk_interpretation_ar : aiAnalysis.risk_interpretation_en}
              </p>
            </CardContent>
          </Card>

          {/* Risk Heat Map */}
          {aiAnalysis.risk_heatmap?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t({ en: 'Risk Heat Map', ar: 'خريطة المخاطر الحرارية' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {aiAnalysis.risk_heatmap.map((risk, idx) => {
                    const color = risk.severity === 'high' ? 'red' : risk.severity === 'medium' ? 'yellow' : 'green';
                    return (
                      <div key={idx} className={`p-4 border-2 rounded-lg bg-${color}-50 border-${color}-300`}>
                        <Badge className={`bg-${color}-600 mb-2`}>{risk.severity}</Badge>
                        <p className="font-semibold text-slate-900 mb-1">
                          {language === 'ar' ? risk.risk_category_ar : risk.risk_category_en}
                        </p>
                        <p className="text-2xl font-bold text-slate-700 mb-2">{risk.affected_count}</p>
                        <p className="text-xs text-slate-600" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          {language === 'ar' ? risk.description_ar : risk.description_en}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mitigation Priorities */}
          {aiAnalysis.mitigation_priorities?.length > 0 && (
            <Card className="border-2 border-orange-300">
              <CardHeader>
                <CardTitle className="text-orange-900">{t({ en: 'Mitigation Action Plan', ar: 'خطة إجراءات التخفيف' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiAnalysis.mitigation_priorities.map((action, idx) => (
                    <div key={idx} className="p-4 bg-white border-2 border-orange-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold">
                            {idx + 1}
                          </div>
                          <p className="font-semibold text-slate-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                            {language === 'ar' ? action.action_ar : action.action_en}
                          </p>
                        </div>
                        <Badge className={action.urgency === 'high' ? 'bg-red-600' : 'bg-yellow-600'}>
                          {action.urgency}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 ml-11" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        {language === 'ar' ? action.impact_ar : action.impact_en}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Risk Trends */}
          {aiAnalysis.risk_trends?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t({ en: 'Risk Trend Analysis', ar: 'تحليل اتجاه المخاطر' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={aiAnalysis.risk_trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="high_risk" stroke="#ef4444" name="High Risk" />
                    <Line type="monotone" dataKey="medium_risk" stroke="#f59e0b" name="Medium Risk" />
                    <Line type="monotone" dataKey="low_risk" stroke="#10b981" name="Low Risk" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default ProtectedPage(RiskPortfolio, { requiredPermissions: [] });
