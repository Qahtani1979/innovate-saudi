import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Target, Sparkles, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import {
  DEPLOYMENT_TRACKER_SYSTEM_PROMPT,
  buildDeploymentTrackerPrompt,
  DEPLOYMENT_TRACKER_SCHEMA
} from '@/lib/ai/prompts/solutions/deploymentTracker';

export default function DeploymentSuccessTracker({ solution }) {
  const { language, isRTL, t } = useLanguage();
  const [prediction, setPrediction] = useState(null);

  const { invokeAI, status, error, rateLimitInfo, isLoading, isAvailable } = useAIWithFallback({
    showToasts: true,
    fallbackData: null
  });

  const deployments = solution.deployments || [];
  const avgSatisfaction = deployments.length > 0
    ? deployments.reduce((sum, d) => sum + (d.satisfaction_score || 0), 0) / deployments.filter(d => d.satisfaction_score).length
    : 0;

  const activeDeployments = deployments.filter(d => d.status === 'active').length;

  const predictRenewal = async () => {
    const response = await invokeAI({
      prompt: buildDeploymentTrackerPrompt({ solution, deployments, avgSatisfaction, activeDeployments }),
      system_prompt: DEPLOYMENT_TRACKER_SYSTEM_PROMPT,
      response_json_schema: DEPLOYMENT_TRACKER_SCHEMA
    });

    if (response.success) {
      setPrediction(response.data);
    }
  };

  const performanceData = deployments.slice(0, 6).map((d, idx) => ({
    name: d.organization?.substring(0, 10) || `Client ${idx + 1}`,
    satisfaction: d.satisfaction_score || 0,
    kpi: d.kpi_achievement || 0
  }));

  return (
    <Card className="border-2 border-teal-300">
      <CardHeader className="bg-gradient-to-r from-teal-50 to-green-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-teal-600" />
            {t({ en: 'Deployment Success Tracking', ar: 'تتبع نجاح النشر' })}
          </CardTitle>
          <Button onClick={predictRenewal} disabled={isLoading || !isAvailable} size="sm" className="bg-teal-600">
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Predict Renewals', ar: 'توقع التجديدات' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} showDetails />
        
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-center">
            <p className="text-2xl font-bold text-blue-600">{deployments.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Total', ar: 'الإجمالي' })}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-center">
            <p className="text-2xl font-bold text-green-600">{activeDeployments}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Active', ar: 'نشط' })}</p>
          </div>
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-center">
            <p className="text-2xl font-bold text-yellow-600">{avgSatisfaction.toFixed(1)}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Avg Rating', ar: 'متوسط التقييم' })}</p>
          </div>
        </div>

        {performanceData.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-3">
              {t({ en: 'Performance by Client', ar: 'الأداء حسب العميل' })}
            </h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="satisfaction" stroke="#10b981" name="Satisfaction" />
                <Line type="monotone" dataKey="kpi" stroke="#3b82f6" name="KPI %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {prediction && (
          <div className="space-y-3">
            <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border-2 border-green-300 text-center">
              <p className="text-sm text-slate-600 mb-1">
                {t({ en: 'Overall Renewal Probability', ar: 'احتمالية التجديد الإجمالية' })}
              </p>
              <p className="text-4xl font-bold text-green-600">{prediction.overall_renewal_probability}%</p>
            </div>

            {prediction.deployment_predictions?.map((pred, idx) => (
              <div key={idx} className="p-3 border-2 border-teal-200 rounded-lg bg-white">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-semibold text-slate-900">{pred.client}</h5>
                  <Badge className={
                    pred.renewal_probability >= 75 ? 'bg-green-100 text-green-700' :
                    pred.renewal_probability >= 50 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }>
                    {pred.renewal_probability}%
                  </Badge>
                </div>
                {pred.risk_factors?.length > 0 && (
                  <div className="text-sm mb-2">
                    <p className="font-medium text-red-700">{t({ en: 'Risks:', ar: 'المخاطر:' })}</p>
                    <ul className="text-xs text-slate-600 ml-4">
                      {pred.risk_factors.map((risk, i) => <li key={i}>• {risk}</li>)}
                    </ul>
                  </div>
                )}
                {pred.recommendations?.length > 0 && (
                  <div className="p-2 bg-blue-50 rounded border border-blue-200 text-xs">
                    <p className="font-medium text-blue-900 mb-1">{t({ en: 'Actions:', ar: 'الإجراءات:' })}</p>
                    {pred.recommendations.map((rec, i) => <div key={i}>✓ {rec}</div>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
