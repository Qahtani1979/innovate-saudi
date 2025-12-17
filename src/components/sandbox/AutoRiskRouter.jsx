import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { AlertTriangle, Shield, ArrowRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { useAuth } from '@/lib/AuthContext';
import { getAutoRiskRouterPrompt, autoRiskRouterSchema } from '@/lib/ai/prompts/sandbox';
import { getSystemPrompt } from '@/lib/saudiContext';

export default function AutoRiskRouter({ entity, entityType }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [riskAssessment, setRiskAssessment] = useState(null);
  const { invokeAI, status, isLoading: analyzing, isAvailable, rateLimitInfo } = useAIWithFallback();

  const assessRisk = async () => {
    const result = await invokeAI({
      prompt: getAutoRiskRouterPrompt({ entity, entityType }),
      system_prompt: getSystemPrompt('COMPACT', true),
      response_json_schema: autoRiskRouterSchema
    });

    if (result.success) {
      setRiskAssessment(result.data);
    }
  };

  const routeToSandbox = async () => {
    try {
      const { error } = await supabase.from('sandbox_applications').insert({
        applicant_email: user?.email,
        source_entity_type: entityType,
        source_entity_id: entity.id,
        project_title: entity.title_en || entity.name_en,
        project_description: entity.description_en || entity.abstract_en,
        risk_level: riskAssessment.overall_risk >= 70 ? 'high' : riskAssessment.overall_risk >= 40 ? 'medium' : 'low',
        status: 'pending'
      });
      if (error) throw error;

      toast.success(t({ en: 'Sandbox application created', ar: 'تم إنشاء طلب منطقة التجريب' }));
    } catch (error) {
      toast.error(t({ en: 'Failed to create application', ar: 'فشل إنشاء الطلب' }));
    }
  };

  if (!entity) return null;

  return (
    <Card className="border-2 border-orange-300 bg-gradient-to-r from-orange-50 to-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-900">
          <Shield className="h-5 w-5" />
          {t({ en: 'Risk-Based Sandbox Routing', ar: 'توجيه منطقة التجريب حسب المخاطر' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
        {!riskAssessment && (
          <div className="text-center py-6">
            <AlertTriangle className="h-12 w-12 text-orange-600 mx-auto mb-3" />
            <p className="text-sm text-slate-600 mb-4">
              {t({ en: 'AI will assess if this requires sandbox testing before deployment', ar: 'سيقوم الذكاء بتقييم ما إذا كان هذا يتطلب اختبار منطقة التجريب قبل النشر' })}
            </p>
            <Button onClick={assessRisk} disabled={analyzing || !isAvailable} className="gap-2">
              {analyzing ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  {t({ en: 'Analyzing...', ar: 'يحلل...' })}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {t({ en: 'Assess Risk', ar: 'تقييم المخاطر' })}
                </>
              )}
            </Button>
          </div>
        )}

        {riskAssessment && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-red-50 rounded">
                <p className="text-xs text-slate-600">{t({ en: 'Regulatory Risk', ar: 'المخاطر التنظيمية' })}</p>
                <p className="text-xl font-bold text-red-600">{riskAssessment.regulatory_risk}%</p>
              </div>
              <div className="p-3 bg-orange-50 rounded">
                <p className="text-xs text-slate-600">{t({ en: 'Safety Risk', ar: 'مخاطر السلامة' })}</p>
                <p className="text-xl font-bold text-orange-600">{riskAssessment.safety_risk}%</p>
              </div>
              <div className="p-3 bg-amber-50 rounded">
                <p className="text-xs text-slate-600">{t({ en: 'Public Impact', ar: 'التأثير العام' })}</p>
                <p className="text-xl font-bold text-amber-600">{riskAssessment.public_impact_risk}%</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded">
                <p className="text-xs text-slate-600">{t({ en: 'Technical Risk', ar: 'المخاطر التقنية' })}</p>
                <p className="text-xl font-bold text-yellow-600">{riskAssessment.technical_risk}%</p>
              </div>
            </div>

            <div className={`p-4 rounded-lg border-2 ${
              riskAssessment.recommendation === 'sandbox_required' ? 'bg-red-50 border-red-400' :
              riskAssessment.recommendation === 'sandbox_recommended' ? 'bg-yellow-50 border-yellow-400' :
              'bg-green-50 border-green-400'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={
                  riskAssessment.recommendation === 'sandbox_required' ? 'bg-red-600' :
                  riskAssessment.recommendation === 'sandbox_recommended' ? 'bg-yellow-600' :
                  'bg-green-600'
                }>
                  {t({ en: 'Overall Risk:', ar: 'المخاطر الإجمالية:' })} {riskAssessment.overall_risk}%
                </Badge>
              </div>
              <p className="font-semibold text-sm mb-1">
                {riskAssessment.recommendation === 'sandbox_required' 
                  ? t({ en: '⚠️ Sandbox Testing REQUIRED', ar: '⚠️ اختبار منطقة التجريب مطلوب' })
                  : riskAssessment.recommendation === 'sandbox_recommended'
                  ? t({ en: '💡 Sandbox Testing Recommended', ar: '💡 اختبار منطقة التجريب موصى به' })
                  : t({ en: '✅ Can proceed to direct pilot', ar: '✅ يمكن المتابعة للتجربة المباشرة' })}
              </p>
              <p className="text-sm text-slate-700">{riskAssessment.reasoning}</p>
            </div>

            {(riskAssessment.recommendation === 'sandbox_required' || riskAssessment.recommendation === 'sandbox_recommended') && (
              <Button onClick={routeToSandbox} className="w-full bg-orange-600">
                <ArrowRight className="h-4 w-4 mr-2" />
                {t({ en: 'Route to Sandbox', ar: 'توجيه إلى منطقة التجريب' })}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
