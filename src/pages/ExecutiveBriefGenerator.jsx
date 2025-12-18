import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { FileText, Download, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { PageLayout, PageHeader, PersonaButton } from '@/components/layout/PersonaPageLayout';

function ExecutiveBriefGenerator() {
  const { language, isRTL, t } = useLanguage();
  const [brief, setBrief] = useState(null);
  const [customTitle, setCustomTitle] = useState('');
  const { invokeAI, status, isLoading: generating, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const { data: municipalities = [] } = useQuery({
    queryKey: ['municipalities'],
    queryFn: () => base44.entities.Municipality.list()
  });

  const { data: strategicPlans = [] } = useQuery({
    queryKey: ['strategic-plans'],
    queryFn: () => base44.entities.StrategicPlan.list()
  });

  const generateBrief = async () => {
    const activePlan = strategicPlans.find(p => p.status === 'active') || strategicPlans[0];
    
    // Import centralized prompt module
    const { EXECUTIVE_BRIEF_PROMPT_TEMPLATE, EXECUTIVE_BRIEF_RESPONSE_SCHEMA } = await import('@/lib/ai/prompts/executive/briefGenerator');
    
    const promptData = {
      activeChallenges: challenges.filter(c => c.status !== 'archived').length,
      activePilots: pilots.filter(p => p.stage === 'active' || p.stage === 'in_progress').length,
      scaledSolutions: pilots.filter(p => p.stage === 'scaled').length,
      municipalityCount: municipalities.length,
      avgMiiScore: (municipalities.reduce((sum, m) => sum + (m.mii_score || 0), 0) / municipalities.length).toFixed(1),
      strategicPlanName: activePlan?.name_en || 'N/A',
      highRiskChallenges: challenges.filter(c => c.severity_score > 75).slice(0, 5).map(c => `- ${c.title_en} (Score: ${c.severity_score})`).join('\n')
    };

    const response = await invokeAI({
      prompt: EXECUTIVE_BRIEF_PROMPT_TEMPLATE(promptData),
      response_json_schema: EXECUTIVE_BRIEF_RESPONSE_SCHEMA
    });

    if (response.success) {
      setBrief(response.data);
      toast.success(t({ en: 'Executive brief generated', ar: 'تم إنشاء الموجز التنفيذي' }));
    }
  };

  const exportPDF = () => {
    toast.success(t({ en: 'PDF export started', ar: 'بدأ تصدير PDF' }));
  };

  return (
    <PageLayout>
      <PageHeader
        icon={FileText}
        title={{ en: 'Executive Brief Generator', ar: 'مولد الموجز التنفيذي' }}
        description={{ en: 'One-click generation of strategic summary with bilingual PDF export', ar: 'توليد بنقرة واحدة للملخص الاستراتيجي مع تصدير PDF ثنائي اللغة' }}
        action={
          <div className="flex gap-2">
            <PersonaButton onClick={generateBrief} disabled={generating || !isAvailable}>
              {generating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {t({ en: 'Generate Brief', ar: 'إنشاء موجز' })}
            </PersonaButton>
            {brief && (
              <PersonaButton onClick={exportPDF} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                {t({ en: 'Export PDF', ar: 'تصدير PDF' })}
              </PersonaButton>
            )}
          </div>
        }
      />

      <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Brief Configuration', ar: 'تكوين الموجز' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t({ en: 'Custom Title (Optional)', ar: 'عنوان مخصص (اختياري)' })}
              </label>
              <Input
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder={t({ en: 'Q4 2025 Strategic Brief', ar: 'الموجز الاستراتيجي للربع الرابع 2025' })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {brief && (
        <div className="space-y-6">
          {/* Executive Summary */}
          <Card className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-300">
            <CardHeader>
              <CardTitle>{t({ en: 'Executive Summary', ar: 'الملخص التنفيذي' })}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Badge className="mb-2">English</Badge>
                  <p className="text-sm text-slate-700 leading-relaxed">{brief.executive_summary_en}</p>
                </div>
                <div dir="rtl">
                  <Badge className="mb-2">العربية</Badge>
                  <p className="text-sm text-slate-700 leading-relaxed">{brief.executive_summary_ar}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Highlights */}
          <Card className="bg-gradient-to-br from-green-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <CheckCircle2 className="h-5 w-5" />
                {t({ en: 'Progress Highlights', ar: 'أبرز التقدم' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {brief.progress_highlights?.map((highlight, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200">
                    <div className="h-6 w-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {idx + 1}
                    </div>
                    <p className="text-sm text-slate-700">{highlight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Risk Alerts */}
          <Card className="bg-gradient-to-br from-red-50 to-white border-2 border-red-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-900">
                <Sparkles className="h-5 w-5" />
                {t({ en: 'Risk Alerts', ar: 'تنبيهات المخاطر' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {brief.risk_alerts?.map((alert, idx) => (
                <div key={idx} className="p-4 bg-white rounded-lg border border-red-200">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-red-900">{alert.risk}</h4>
                    <Badge className={
                      alert.severity === 'critical' ? 'bg-red-600 text-white' :
                      alert.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                      'bg-yellow-100 text-yellow-700'
                    }>
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-700">
                    <strong>{t({ en: 'Mitigation:', ar: 'التخفيف:' })}</strong> {alert.mitigation}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Next Quarter Priorities */}
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Next Quarter Priorities', ar: 'أولويات الربع القادم' })}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {brief.next_quarter_priorities?.map((priority, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-blue-50 transition-colors">
                    <Badge className="bg-blue-600 text-white">{idx + 1}</Badge>
                    <p className="text-sm text-slate-700">{priority}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Strategic Recommendations */}
          <Card className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-300">
            <CardHeader>
              <CardTitle className="text-purple-900">
                {t({ en: 'Strategic Recommendations', ar: 'التوصيات الاستراتيجية' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {brief.strategic_recommendations?.map((rec, idx) => (
                  <div key={idx} className="p-4 bg-white rounded-lg border border-purple-200">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                        {idx + 1}
                      </div>
                      <p className="text-sm text-slate-700">{rec}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </PageLayout>
  );
}

export default ProtectedPage(ExecutiveBriefGenerator, { requiredPermissions: [] });