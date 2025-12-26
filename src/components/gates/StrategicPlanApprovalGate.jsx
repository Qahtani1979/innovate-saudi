import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { CheckCircle2, XCircle, AlertTriangle, FileText, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import {
  STRATEGIC_APPROVAL_SYSTEM_PROMPT,
  buildStrategicApprovalPrompt,
  STRATEGIC_APPROVAL_SCHEMA
} from '@/lib/ai/prompts/gates';
import { useGovernanceMutations } from '@/hooks/useGovernance';

export default function StrategicPlanApprovalGate({ plan, onClose }) {
  const { language, isRTL, t } = useLanguage();
  const [comments, setComments] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const { invokeAI, status, isLoading: analyzing, isAvailable, rateLimitInfo } = useAIWithFallback();
  const { submitStrategicReview } = useGovernanceMutations();

  const handleDecision = (decisionType) => {
    submitStrategicReview.mutate({
      planId: plan.id,
      status: decisionType === 'approve' ? 'approved' : 'draft',
      reviewNotes: comments
    }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  const generateAIBrief = async () => {
    const result = await invokeAI({
      systemPrompt: STRATEGIC_APPROVAL_SYSTEM_PROMPT,
      prompt: buildStrategicApprovalPrompt(plan),
      response_json_schema: STRATEGIC_APPROVAL_SCHEMA
    });

    if (result.success) {
      setAiAnalysis({
        strengths: result.data.strengths?.map(s => ({ en: s.point_en, ar: s.point_ar })),
        risks: result.data.risks?.map(r => ({ en: r.risk_en, ar: r.risk_ar })),
        feasibility_en: result.data.recommendation_reason_en,
        feasibility_ar: result.data.recommendation_reason_ar,
        recommendation: result.data.recommendation,
        justification_en: result.data.recommendation_reason_en,
        justification_ar: result.data.recommendation_reason_ar
      });
    }
  };

  const checklist = [
    { item: 'Vision aligned with national innovation strategy', checked: true },
    { item: 'All strategic themes have measurable KPIs', checked: plan.kpis?.length >= 5 },
    { item: 'Budget allocation totals 100%', checked: Object.values(plan.budget_allocation || {}).reduce((a, b) => a + b, 0) === 100 },
    { item: 'Timeline is realistic (3-5 years)', checked: (plan.end_year - plan.start_year) >= 3 }
  ];

  return (
    <Card className="max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          {t({ en: 'Strategic Plan Approval Gate', ar: 'بوابة الموافقة على الخطة الاستراتيجية' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Plan Summary */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-bold text-blue-900 mb-2">{language === 'ar' ? plan.name_ar : plan.name_en}</h3>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-slate-600">{t({ en: 'Duration:', ar: 'المدة:' })}</p>
              <p className="font-medium">{plan.start_year} - {plan.end_year}</p>
            </div>
            <div>
              <p className="text-slate-600">{t({ en: 'Themes:', ar: 'المحاور:' })}</p>
              <p className="font-medium">{plan.strategic_themes?.length || 0}</p>
            </div>
            <div>
              <p className="text-slate-600">{t({ en: 'KPIs:', ar: 'المؤشرات:' })}</p>
              <p className="font-medium">{plan.kpis?.length || 0}</p>
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div>
          <p className="font-semibold text-slate-900 mb-3">{t({ en: 'Approval Checklist', ar: 'قائمة الموافقة' })}</p>
          <div className="space-y-2">
            {checklist.map((item, idx) => (
              <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg ${item.checked ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                {item.checked ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="text-sm text-slate-900">{item.item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Brief */}
        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-purple-900">{t({ en: 'AI Decision Brief', ar: 'ملخص القرار الذكي' })}</p>
              <Button onClick={generateAIBrief} disabled={analyzing || !isAvailable} size="sm" variant="outline">
                {analyzing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                {t({ en: 'Generate', ar: 'إنشاء' })}
              </Button>
              <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
            </div>
            {aiAnalysis && (
              <div className="space-y-3">
                <div className="p-3 bg-white rounded">
                  <p className="text-xs font-medium text-slate-600 mb-1">{t({ en: 'AI Recommendation:', ar: 'توصية الذكاء:' })}</p>
                  <Badge className={aiAnalysis.recommendation === 'approve' ? 'bg-green-600' : 'bg-yellow-600'}>
                    {aiAnalysis.recommendation}
                  </Badge>
                  <p className="text-sm text-slate-700 mt-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {language === 'ar' ? aiAnalysis.justification_ar : aiAnalysis.justification_en}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Decision */}
        <div>
          <label className="text-sm font-medium text-slate-900 mb-2 block">{t({ en: 'Comments:', ar: 'التعليقات:' })}</label>
          <Textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={4}
            placeholder={t({ en: 'Review comments...', ar: 'تعليقات المراجعة...' })}
            disabled={submitStrategicReview.isPending}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => handleDecision('approve')}
            disabled={submitStrategicReview.isPending}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
          >
            {submitStrategicReview.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CheckCircle2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            )}
            {t({ en: 'Approve Plan', ar: 'الموافقة على الخطة' })}
          </Button>
          <Button
            onClick={() => handleDecision('revise')}
            disabled={submitStrategicReview.isPending}
            variant="outline"
            className="flex-1 border-yellow-600 text-yellow-600"
          >
            <AlertTriangle className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t({ en: 'Request Revision', ar: 'طلب تنقيح' })}
          </Button>
          <Button onClick={onClose} variant="outline">
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}