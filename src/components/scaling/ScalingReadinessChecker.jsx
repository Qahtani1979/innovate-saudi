import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { Shield, CheckCircle2, AlertTriangle, Target, FileText, Users, DollarSign, Sparkles, Loader2 } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

export default function ScalingReadinessChecker({ pilot }) {
  const { language, isRTL, t } = useLanguage();
  const [readinessScore, setReadinessScore] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pilot) {
      calculateReadiness();
    }
  }, [pilot?.id]);

  const calculateReadiness = async () => {
    setLoading(true);
    try {
      // Calculate component scores
      const kpiScore = calculateKPIScore(pilot);
      const costModelScore = calculateCostModelScore(pilot);
      const stakeholderScore = calculateStakeholderScore(pilot);
      const documentationScore = calculateDocumentationScore(pilot);
      const riskScore = calculateRiskScore(pilot);

      const totalScore = Math.round(
        kpiScore * 0.3 +
        costModelScore * 0.2 +
        stakeholderScore * 0.2 +
        documentationScore * 0.15 +
        riskScore * 0.15
      );

      // Get AI enhancement suggestions
      const aiSuggestions = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this pilot's scaling readiness and provide specific improvement actions:

Pilot: ${pilot.title_en}
Overall Readiness: ${totalScore}%
- KPI Achievement: ${kpiScore}%
- Cost Model Clarity: ${costModelScore}%
- Stakeholder Alignment: ${stakeholderScore}%
- Documentation: ${documentationScore}%
- Risk Mitigation: ${riskScore}%

For each dimension below 80%, provide 2-3 specific actionable steps to improve.`,
        response_json_schema: {
          type: 'object',
          properties: {
            kpi_actions: { type: 'array', items: { type: 'string' } },
            cost_actions: { type: 'array', items: { type: 'string' } },
            stakeholder_actions: { type: 'array', items: { type: 'string' } },
            documentation_actions: { type: 'array', items: { type: 'string' } },
            risk_actions: { type: 'array', items: { type: 'string' } },
            overall_recommendation: { type: 'string' }
          }
        }
      });

      setReadinessScore({
        total: totalScore,
        components: {
          kpi: kpiScore,
          cost: costModelScore,
          stakeholder: stakeholderScore,
          documentation: documentationScore,
          risk: riskScore
        },
        actions: aiSuggestions
      });
    } catch (error) {
      console.error('Readiness calculation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateKPIScore = (p) => {
    if (!p.kpis || p.kpis.length === 0) return 0;
    const onTrack = p.kpis.filter(k => k.status === 'on_track' || k.status === 'achieved').length;
    return Math.round((onTrack / p.kpis.length) * 100);
  };

  const calculateCostModelScore = (p) => {
    let score = 0;
    if (p.budget && p.budget > 0) score += 30;
    if (p.budget_breakdown && p.budget_breakdown.length > 0) score += 40;
    if (p.scaling_plan?.estimated_cost) score += 30;
    return score;
  };

  const calculateStakeholderScore = (p) => {
    if (!p.stakeholders || p.stakeholders.length === 0) return 20;
    return Math.min(100, p.stakeholders.length * 20);
  };

  const calculateDocumentationScore = (p) => {
    let score = 0;
    if (p.description_en) score += 20;
    if (p.methodology) score += 20;
    if (p.evaluation_summary_en || p.evaluation_summary_ar) score += 30;
    if (p.lessons_learned && p.lessons_learned.length > 0) score += 30;
    return score;
  };

  const calculateRiskScore = (p) => {
    if (!p.risks || p.risks.length === 0) return 30;
    const mitigated = p.risks.filter(r => r.status === 'mitigated').length;
    return Math.round((mitigated / p.risks.length) * 100);
  };

  if (loading || !readinessScore) {
    return (
      <Card className="border-2 border-blue-300">
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-3" />
              <span>{t({ en: 'Calculating readiness...', ar: 'حساب الجاهزية...' })}</span>
            </div>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  const { total, components, actions } = readinessScore;
  const readinessLevel = total >= 80 ? 'ready' : total >= 60 ? 'conditional' : 'not_ready';

  const dimensions = [
    { key: 'kpi', label: { en: 'KPI Achievement', ar: 'إنجاز المؤشرات' }, icon: Target, weight: 30, actions: actions.kpi_actions },
    { key: 'cost', label: { en: 'Cost Model Clarity', ar: 'وضوح نموذج التكلفة' }, icon: DollarSign, weight: 20, actions: actions.cost_actions },
    { key: 'stakeholder', label: { en: 'Stakeholder Alignment', ar: 'توافق الأطراف' }, icon: Users, weight: 20, actions: actions.stakeholder_actions },
    { key: 'documentation', label: { en: 'Documentation', ar: 'التوثيق' }, icon: FileText, weight: 15, actions: actions.documentation_actions },
    { key: 'risk', label: { en: 'Risk Mitigation', ar: 'تخفيف المخاطر' }, icon: Shield, weight: 15, actions: actions.risk_actions }
  ];

  return (
    <Card className={`border-2 ${
      readinessLevel === 'ready' ? 'border-green-300 bg-green-50' :
      readinessLevel === 'conditional' ? 'border-yellow-300 bg-yellow-50' :
      'border-red-300 bg-red-50'
    }`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className={`h-5 w-5 ${
              readinessLevel === 'ready' ? 'text-green-600' :
              readinessLevel === 'conditional' ? 'text-yellow-600' :
              'text-red-600'
            }`} />
            {t({ en: 'Scaling Readiness Assessment', ar: 'تقييم جاهزية التوسع' })}
          </CardTitle>
          <Badge className={`text-lg px-4 py-1 ${
            readinessLevel === 'ready' ? 'bg-green-600' :
            readinessLevel === 'conditional' ? 'bg-yellow-600' :
            'bg-red-600'
          }`}>
            {total}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Status */}
        <div className={`p-4 rounded-lg border-2 ${
          readinessLevel === 'ready' ? 'bg-green-100 border-green-300' :
          readinessLevel === 'conditional' ? 'bg-yellow-100 border-yellow-300' :
          'bg-red-100 border-red-300'
        }`}>
          <p className="font-semibold mb-2">
            {readinessLevel === 'ready' && t({ en: '✅ READY TO SCALE', ar: '✅ جاهز للتوسع' })}
            {readinessLevel === 'conditional' && t({ en: '⚠️ CONDITIONAL - Address items below', ar: '⚠️ مشروط - عالج العناصر أدناه' })}
            {readinessLevel === 'not_ready' && t({ en: '🚫 NOT READY - Critical gaps must be addressed', ar: '🚫 غير جاهز - يجب معالجة الفجوات الحرجة' })}
          </p>
          {actions.overall_recommendation && (
            <p className="text-sm text-slate-700">{actions.overall_recommendation}</p>
          )}
        </div>

        {/* Dimension Breakdown */}
        <div className="space-y-4">
          {dimensions.map((dim) => {
            const Icon = dim.icon;
            const score = components[dim.key];
            const needsWork = score < 80;
            
            return (
              <div key={dim.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${score >= 80 ? 'text-green-600' : 'text-red-600'}`} />
                    <span className="text-sm font-medium text-slate-900">{t(dim.label)}</span>
                    <Badge variant="outline" className="text-xs">{dim.weight}%</Badge>
                  </div>
                  <span className={`text-sm font-bold ${score >= 80 ? 'text-green-600' : 'text-red-600'}`}>
                    {score}%
                  </span>
                </div>
                <Progress value={score} className="h-2" />
                
                {needsWork && dim.actions && dim.actions.length > 0 && (
                  <div className="ml-6 p-3 bg-white rounded border border-slate-200">
                    <p className="text-xs font-medium text-slate-700 mb-1">
                      {t({ en: 'Action Items:', ar: 'عناصر العمل:' })}
                    </p>
                    <ul className="space-y-1">
                      {dim.actions.map((action, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                          <span className="text-blue-600">•</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Summary */}
        <div className="flex items-center justify-between p-4 bg-slate-100 rounded-lg">
          <p className="text-sm text-slate-700">
            {readinessLevel === 'not_ready' && t({ en: '🔴 Complete critical items before scaling approval', ar: '🔴 أكمل العناصر الحرجة قبل الموافقة على التوسع' })}
            {readinessLevel === 'conditional' && t({ en: '🟡 Address moderate gaps for optimal scaling', ar: '🟡 عالج الفجوات المتوسطة للتوسع الأمثل' })}
            {readinessLevel === 'ready' && t({ en: '🟢 Pilot meets scaling readiness criteria', ar: '🟢 التجربة تستوفي معايير جاهزية التوسع' })}
          </p>
          <Button variant="outline" size="sm" onClick={calculateReadiness} disabled={loading}>
            <Sparkles className="h-4 w-4 mr-2" />
            {t({ en: 'Refresh', ar: 'تحديث' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}