import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Sparkles, TrendingUp, AlertTriangle, Target, Loader2, X } from 'lucide-react';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function PilotsAIInsights({ pilots, challenges, municipalities }) {
  const { language, isRTL, t } = useLanguage();
  const [insights, setInsights] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const { invokeAI, status, error, rateLimitInfo, isLoading, isAvailable } = useAIWithFallback({
    showToasts: true,
    fallbackData: null
  });

  const generateInsights = async () => {
    const activePilots = pilots.filter(p => p.stage === 'active' || p.stage === 'monitoring');
    const highRisk = pilots.filter(p => p.risk_level === 'high' || p.risk_level === 'critical');
    const highSuccess = pilots.filter(p => (p.success_probability || 0) >= 80);
    const readyToScale = pilots.filter(p => p.recommendation === 'scale' || p.stage === 'completed');

    const sectorBreakdown = pilots.reduce((acc, p) => {
      acc[p.sector] = (acc[p.sector] || 0) + 1;
      return acc;
    }, {});

    const { success, data } = await invokeAI({
      prompt: `Analyze this municipal pilot portfolio for Saudi Arabia and provide BILINGUAL strategic insights:

PORTFOLIO OVERVIEW:
- Total Pilots: ${pilots.length}
- Active Pilots: ${activePilots.length}
- High-Success Pilots: ${highSuccess.length}
- High-Risk Pilots: ${highRisk.length}
- Ready to Scale: ${readyToScale.length}

SECTOR BREAKDOWN:
${Object.entries(sectorBreakdown).map(([sector, count]) => `- ${sector}: ${count}`).join('\n')}

TOP 5 PILOTS BY SUCCESS:
${pilots.sort((a, b) => (b.success_probability || 0) - (a.success_probability || 0)).slice(0, 5).map(p => 
  `${p.code}: ${p.title_en} (${p.success_probability}% success probability)`
).join('\n')}

Provide bilingual analysis covering:
1. Portfolio health assessment (strengths/weaknesses)
2. Risk alerts and mitigation priorities (top 3)
3. Scaling opportunities (which pilots to prioritize)
4. Sector balance recommendations
5. Resource optimization suggestions
6. Strategic recommendations for next quarter`,
      response_json_schema: {
        type: 'object',
        properties: {
          portfolio_health: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' }, score: { type: 'number' } } },
          risk_alerts: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' }, priority: { type: 'string' } } } },
          scaling_opportunities: { type: 'array', items: { type: 'object', properties: { pilot_code: { type: 'string' }, reason_en: { type: 'string' }, reason_ar: { type: 'string' } } } },
          sector_recommendations: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
          resource_optimization: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
          strategic_priorities: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } }
        }
      }
    });

    if (success && data) {
      setInsights(data);
      setExpanded(true);
    }
  };

  if (!expanded && !insights) {
    return (
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-purple-600" />
              <div>
                <p className="font-semibold text-slate-900">
                  {t({ en: 'AI Portfolio Intelligence', ar: 'ذكاء المحفظة' })}
                </p>
                <p className="text-sm text-slate-600">
                  {t({ en: 'Get AI-powered analysis of your pilot portfolio', ar: 'احصل على تحليل ذكي لمحفظة التجارب' })}
                </p>
              </div>
            </div>
            <Button onClick={generateInsights} disabled={isLoading || !isAvailable} className="bg-purple-600 hover:bg-purple-700">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t({ en: 'Analyzing...', ar: 'جاري التحليل...' })}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t({ en: 'Generate Insights', ar: 'توليد الرؤى' })}
                </>
              )}
            </Button>
          </div>
          <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} className="mt-3" />
        </CardContent>
      </Card>
    );
  }

  if (!insights) return null;

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            {t({ en: 'AI Portfolio Intelligence', ar: 'ذكاء المحفظة الذكي' })}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setExpanded(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Portfolio Health */}
        <div className="p-4 bg-white rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-slate-900">
              {t({ en: 'Portfolio Health', ar: 'صحة المحفظة' })}
            </h4>
            <div className="text-3xl font-bold text-purple-600">{insights.portfolio_health?.score}/100</div>
          </div>
          <p className="text-sm text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {insights.portfolio_health?.[language] || insights.portfolio_health?.en}
          </p>
        </div>

        {/* Risk Alerts */}
        <div className="p-4 bg-white rounded-lg">
          <h4 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            {t({ en: 'Risk Alerts', ar: 'تنبيهات المخاطر' })}
          </h4>
          <div className="space-y-2">
            {insights.risk_alerts?.map((alert, idx) => (
              <div key={idx} className="p-3 bg-red-50 rounded border border-red-200">
                <div className="flex items-start justify-between">
                  <p className="text-sm text-slate-700 flex-1" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {typeof alert === 'object' ? (alert[language] || alert.en) : alert}
                  </p>
                  {alert.priority && (
                    <Badge className={
                      alert.priority === 'high' ? 'bg-red-100 text-red-700' :
                      alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }>
                      {alert.priority}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scaling Opportunities */}
        <div className="p-4 bg-white rounded-lg">
          <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t({ en: 'Scaling Opportunities', ar: 'فرص التوسع' })}
          </h4>
          <div className="space-y-2">
            {insights.scaling_opportunities?.map((opp, idx) => (
              <div key={idx} className="p-3 bg-green-50 rounded border border-green-200">
                <div className="flex items-start gap-2">
                  <Badge className="bg-green-100 text-green-700 font-mono text-xs">{opp.pilot_code}</Badge>
                  <p className="text-sm text-slate-700 flex-1" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {language === 'ar' ? opp.reason_ar : opp.reason_en}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sector Recommendations */}
        <div className="p-4 bg-white rounded-lg">
          <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
            <Target className="h-5 w-5" />
            {t({ en: 'Sector Balance', ar: 'توازن القطاعات' })}
          </h4>
          <ul className="space-y-2 text-sm">
            {insights.sector_recommendations?.map((rec, idx) => (
              <li key={idx} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                📊 {typeof rec === 'object' ? (rec[language] || rec.en) : rec}
              </li>
            ))}
          </ul>
        </div>

        {/* Resource Optimization */}
        <div className="p-4 bg-white rounded-lg">
          <h4 className="font-semibold text-amber-700 mb-3">
            {t({ en: 'Resource Optimization', ar: 'تحسين الموارد' })}
          </h4>
          <ul className="space-y-2 text-sm">
            {insights.resource_optimization?.map((opt, idx) => (
              <li key={idx} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                💡 {typeof opt === 'object' ? (opt[language] || opt.en) : opt}
              </li>
            ))}
          </ul>
        </div>

        {/* Strategic Priorities */}
        <div className="p-4 bg-white rounded-lg border-2 border-purple-200">
          <h4 className="font-semibold text-purple-700 mb-3">
            {t({ en: 'Strategic Priorities (Next Quarter)', ar: 'الأولويات الاستراتيجية (الربع القادم)' })}
          </h4>
          <ul className="space-y-2 text-sm">
            {insights.strategic_priorities?.map((priority, idx) => (
              <li key={idx} className="text-slate-700 font-medium" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {idx + 1}. {typeof priority === 'object' ? (priority[language] || priority.en) : priority}
              </li>
            ))}
          </ul>
        </div>

        <Button onClick={generateInsights} variant="outline" className="w-full" disabled={isLoading || !isAvailable}>
          <Sparkles className="h-4 w-4 mr-2" />
          {t({ en: 'Refresh Analysis', ar: 'تحديث التحليل' })}
        </Button>
      </CardContent>
    </Card>
  );
}
