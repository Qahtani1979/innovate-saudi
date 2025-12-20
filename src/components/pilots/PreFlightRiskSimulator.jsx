import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Shield, TrendingUp, DollarSign, Clock, Users, Zap, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { Progress } from "@/components/ui/progress";
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { 
  PREFLIGHT_RISK_SYSTEM_PROMPT, 
  createPreflightRiskPrompt, 
  PREFLIGHT_RISK_SCHEMA 
} from '@/lib/ai/prompts/pilots';
import { getSystemPrompt } from '@/lib/saudiContext';

export default function PreFlightRiskSimulator({ pilot }) {
  const { language, isRTL, t } = useLanguage();
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [mitigationPlans, setMitigationPlans] = useState({});
  const { invokeAI, status, isLoading: loading, isAvailable, rateLimitInfo } = useAIWithFallback();

  useEffect(() => {
    if (pilot) {
      simulateRisks();
    }
  }, [pilot?.id]);

  const simulateRisks = async () => {
    try {
      const allPilots = await base44.entities.Pilot.list();
      
      const budgetMin = (pilot.budget || 0) * 0.7;
      const budgetMax = (pilot.budget || 0) * 1.3;
      
      const similarPilots = allPilots.filter(p => 
        p.sector === pilot.sector &&
        (p.budget || 0) >= budgetMin &&
        (p.budget || 0) <= budgetMax &&
        p.id !== pilot.id &&
        (p.stage === 'completed' || p.stage === 'scaled' || p.stage === 'terminated')
      );

      const totalSimilar = similarPilots.length;
      const failedPilots = similarPilots.filter(p => 
        p.stage === 'terminated' || (p.success_probability || 0) < 50
      );

      const risks = {
        budget_overrun: {
          probability: totalSimilar > 0 ? Math.round((failedPilots.filter(p => 
            p.termination_reason?.toLowerCase().includes('budget') || 
            (p.budget_released || 0) > (p.budget || 0)
          ).length / totalSimilar) * 100) : 35,
          evidence_count: totalSimilar,
          severity: 'high'
        },
        timeline_delays: {
          probability: totalSimilar > 0 ? Math.round((failedPilots.filter(p => 
            p.termination_reason?.toLowerCase().includes('delay') ||
            p.milestones?.some(m => m.status === 'delayed')
          ).length / totalSimilar) * 100) : 45,
          evidence_count: totalSimilar,
          severity: 'medium'
        },
        low_kpi_achievement: {
          probability: totalSimilar > 0 ? Math.round((failedPilots.filter(p => 
            p.kpis?.some(k => k.status === 'off_track')
          ).length / totalSimilar) * 100) : 28,
          evidence_count: totalSimilar,
          severity: 'high'
        },
        stakeholder_issues: {
          probability: totalSimilar > 0 ? Math.round((failedPilots.filter(p => 
            p.issues?.some(i => i.issue?.toLowerCase().includes('stakeholder'))
          ).length / totalSimilar) * 100) : 22,
          evidence_count: totalSimilar,
          severity: 'medium'
        },
        technical_failures: {
          probability: totalSimilar > 0 ? Math.round((failedPilots.filter(p => 
            p.termination_reason?.toLowerCase().includes('technical') ||
            p.risks?.some(r => r.risk?.toLowerCase().includes('technical') && r.status === 'occurred')
          ).length / totalSimilar) * 100) : 38,
          evidence_count: totalSimilar,
          severity: 'high'
        }
      };

      const result = await invokeAI({
        prompt: createPreflightRiskPrompt(pilot, risks),
        response_json_schema: PREFLIGHT_RISK_SCHEMA,
        system_prompt: getSystemPrompt(PREFLIGHT_RISK_SYSTEM_PROMPT)
      });

      if (result.success) {
        // Map response to expected format
        const mitigations = {};
        if (result.data.mitigation_strategies) {
          result.data.mitigation_strategies.forEach(strategy => {
            const category = strategy.risk_category?.toLowerCase().replace(/\s+/g, '_') || 'general';
            if (!mitigations[category]) mitigations[category] = [];
            mitigations[category].push(language === 'ar' ? strategy.strategy_ar : strategy.strategy_en);
          });
        }
        
        setRiskAssessment({ 
          risks, 
          mitigations, 
          recommendation: result.data.contingency_plans_en?.[0] || '', 
          similarPilots: totalSimilar 
        });
      } else {
        setRiskAssessment({ risks, mitigations: {}, recommendation: '', similarPilots: totalSimilar });
      }
    } catch (error) {
      console.error('Risk simulation failed:', error);
    }
  };

  if (loading) {
    return (
      <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600 mr-3" />
            <span className="text-slate-700">{t({ en: 'Simulating launch risks...', ar: 'محاكاة مخاطر الإطلاق...' })}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!riskAssessment) return null;

  const { risks, mitigations, recommendation, similarPilots } = riskAssessment;

  const radarData = [
    { risk: t({ en: 'Budget', ar: 'الميزانية' }), value: risks.budget_overrun.probability },
    { risk: t({ en: 'Timeline', ar: 'الجدول' }), value: risks.timeline_delays.probability },
    { risk: t({ en: 'KPIs', ar: 'المؤشرات' }), value: risks.low_kpi_achievement.probability },
    { risk: t({ en: 'Stakeholders', ar: 'الأطراف' }), value: risks.stakeholder_issues.probability },
    { risk: t({ en: 'Technical', ar: 'التقني' }), value: risks.technical_failures.probability }
  ];

  const overallRiskScore = Math.round(Object.values(risks).reduce((acc, r) => acc + r.probability, 0) / 5);
  const riskLevel = overallRiskScore > 60 ? 'high' : overallRiskScore > 30 ? 'medium' : 'low';

  const riskConfig = {
    budget_overrun: { icon: DollarSign, label: { en: 'Budget Overrun', ar: 'تجاوز الميزانية' } },
    timeline_delays: { icon: Clock, label: { en: 'Timeline Delays', ar: 'تأخيرات الجدول' } },
    low_kpi_achievement: { icon: TrendingUp, label: { en: 'Low KPI Achievement', ar: 'انخفاض تحقيق المؤشرات' } },
    stakeholder_issues: { icon: Users, label: { en: 'Stakeholder Issues', ar: 'قضايا الأطراف' } },
    technical_failures: { icon: Zap, label: { en: 'Technical Failures', ar: 'فشل تقني' } }
  };

  return (
    <Card className={`border-2 ${
      riskLevel === 'high' ? 'border-red-300 bg-red-50' :
      riskLevel === 'medium' ? 'border-yellow-300 bg-yellow-50' :
      'border-green-300 bg-green-50'
    }`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className={`h-5 w-5 ${
              riskLevel === 'high' ? 'text-red-600' :
              riskLevel === 'medium' ? 'text-yellow-600' :
              'text-green-600'
            }`} />
            {t({ en: '🛡️ Pre-Flight Risk Assessment', ar: '🛡️ تقييم المخاطر قبل الإطلاق' })}
          </CardTitle>
          <Badge className={`text-lg px-4 py-1 ${
            riskLevel === 'high' ? 'bg-red-600' :
            riskLevel === 'medium' ? 'bg-yellow-600' :
            'bg-green-600'
          }`}>
            {overallRiskScore}% {t({ en: 'Risk', ar: 'خطر' })}
          </Badge>
        </div>
        <p className="text-sm text-slate-600 mt-2">
          {t({ en: 'Based on', ar: 'بناءً على' })} {similarPilots} {t({ en: 'similar pilots', ar: 'تجربة مماثلة' })}
        </p>
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} showDetails className="mt-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="risk" />
                <PolarRadiusAxis domain={[0, 100]} />
                <Radar name="Risk %" dataKey="value" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {Object.entries(risks).map(([key, risk]) => {
              const config = riskConfig[key];
              const Icon = config.icon;
              const riskColor = risk.probability > 60 ? 'text-red-600' : risk.probability > 30 ? 'text-yellow-600' : 'text-green-600';
              
              return (
                <div key={key} className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${riskColor}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-900">{t(config.label)}</span>
                      <span className={`text-sm font-bold ${riskColor}`}>{risk.probability}%</span>
                    </div>
                    <Progress value={risk.probability} className="h-2" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            {t({ en: 'AI-Generated Mitigation Strategies', ar: 'استراتيجيات التخفيف المولدة بالذكاء' })}
          </h4>
          <div className="space-y-3">
            {Object.entries(risks).filter(([_, risk]) => risk.probability > 30).map(([key, risk]) => {
              const config = riskConfig[key];
              const strategies = mitigations?.[key] || [];
              
              return strategies.length > 0 && (
                <div key={key} className="p-4 bg-white rounded-lg border-2 border-slate-200">
                  <div className="flex items-start gap-3 mb-2">
                    <Badge className={
                      risk.probability > 60 ? 'bg-red-600' :
                      risk.probability > 30 ? 'bg-yellow-600' :
                      'bg-green-600'
                    }>{risk.probability}%</Badge>
                    <h5 className="font-medium text-slate-900">{t(config.label)}</h5>
                  </div>
                  <ul className="space-y-1 text-sm text-slate-700">
                    {strategies.map((strategy, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{strategy}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {recommendation && (
          <div className={`p-4 rounded-lg border-2 ${
            riskLevel === 'high' ? 'bg-red-50 border-red-300' :
            riskLevel === 'medium' ? 'bg-yellow-50 border-yellow-300' :
            'bg-green-50 border-green-300'
          }`}>
            <p className="text-sm font-semibold mb-2">
              {t({ en: '🎯 Overall Recommendation:', ar: '🎯 التوصية العامة:' })}
            </p>
            <p className="text-sm text-slate-700">{recommendation}</p>
          </div>
        )}

        <div className="flex items-center justify-between p-4 bg-slate-100 rounded-lg">
          <div>
            <p className="text-sm font-medium text-slate-900">
              {t({ en: 'Risk Level:', ar: 'مستوى المخاطر:' })} <strong className={
                riskLevel === 'high' ? 'text-red-600' :
                riskLevel === 'medium' ? 'text-yellow-600' :
                'text-green-600'
              }>{riskLevel.toUpperCase()}</strong>
            </p>
            <p className="text-xs text-slate-600 mt-1">
              {riskLevel === 'high' && t({ en: '⚠️ High risk - implement all mitigations before launch', ar: '⚠️ مخاطر عالية - نفذ جميع التخفيفات قبل الإطلاق' })}
              {riskLevel === 'medium' && t({ en: '⚡ Moderate risk - review mitigation strategies', ar: '⚡ مخاطر متوسطة - راجع استراتيجيات التخفيف' })}
              {riskLevel === 'low' && t({ en: '✅ Low risk - proceed with standard monitoring', ar: '✅ مخاطر منخفضة - تابع بالمراقبة القياسية' })}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={simulateRisks} disabled={loading || !isAvailable}>
            <Sparkles className="h-4 w-4 mr-2" />
            {t({ en: 'Refresh', ar: 'تحديث' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
