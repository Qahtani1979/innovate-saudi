import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from './LanguageContext';
import { Shield, CheckCircle2, X, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function SolutionVerificationWizard({ solution, onClose }) {
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);

  const verificationChecks = {
    step1_documentation: [
      { id: 'company_registered', label: { en: 'Company legally registered in Saudi Arabia', ar: 'الشركة مسجلة قانونياً في السعودية' } },
      { id: 'solution_documented', label: { en: 'Solution properly documented', ar: 'الحل موثق بشكل صحيح' } },
      { id: 'technical_specs_complete', label: { en: 'Technical specifications complete', ar: 'المواصفات التقنية مكتملة' } },
      { id: 'contact_verified', label: { en: 'Contact information verified', ar: 'معلومات الاتصال موثقة' } }
    ],
    step2_technical: [
      { id: 'tech_stack_validated', label: { en: 'Technology stack validated', ar: 'المكدس التقني موثق' } },
      { id: 'security_reviewed', label: { en: 'Security features reviewed', ar: 'الأمان مراجع' } },
      { id: 'scalability_confirmed', label: { en: 'Scalability confirmed', ar: 'قابلية التوسع مؤكدة' } },
      { id: 'integration_feasible', label: { en: 'Integration feasibility assessed', ar: 'جدوى التكامل مقيمة' } }
    ],
    step3_maturity: [
      { id: 'trl_accurate', label: { en: 'TRL level accurately reported', ar: 'مستوى TRL دقيق' } },
      { id: 'deployments_verified', label: { en: 'Deployment claims verified', ar: 'مطالبات النشر موثقة' } },
      { id: 'references_contacted', label: { en: 'Reference customers contacted', ar: 'تم التواصل مع عملاء مرجعيين' } },
      { id: 'case_studies_authentic', label: { en: 'Case studies authenticated', ar: 'دراسات الحالة موثقة' } }
    ]
  };

  const [checklist, setChecklist] = useState({
    ...verificationChecks.step1_documentation.reduce((acc, c) => ({ ...acc, [c.id]: false }), {}),
    ...verificationChecks.step2_technical.reduce((acc, c) => ({ ...acc, [c.id]: false }), {}),
    ...verificationChecks.step3_maturity.reduce((acc, c) => ({ ...acc, [c.id]: false }), {})
  });

  const [verificationNotes, setVerificationNotes] = useState('');
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState(null);

  const runAIAnalysis = async () => {
    setAiAnalyzing(true);
    try {
      const prompt = `Analyze this solution for verification in Saudi municipal innovation marketplace:

Solution: ${solution.name_en}
Provider: ${solution.provider_name} (${solution.provider_type})
Maturity: ${solution.maturity_level}
TRL: ${solution.trl}
Deployments Claimed: ${solution.deployment_count || 0}
Sectors: ${solution.sectors?.join(', ') || 'N/A'}
Features: ${solution.features?.slice(0, 5).join(', ') || 'N/A'}

Verification Checks Status:
${Object.entries(checklist).map(([k, v]) => `- ${k}: ${v ? 'PASS' : 'PENDING'}`).join('\n')}

Provide:
1. Overall verification recommendation (approve/conditional/reject)
2. Risk assessment (low/medium/high)
3. Specific concerns or red flags
4. Recommended conditions if conditional approval
5. Suggested priority level for marketplace`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            recommendation: { type: 'string' },
            risk_level: { type: 'string' },
            concerns: { type: 'array', items: { type: 'string' } },
            conditions: { type: 'array', items: { type: 'string' } },
            suggested_priority: { type: 'string' },
            reasoning: { type: 'string' }
          }
        }
      });

      setAiRecommendation(result);
      toast.success(t({ en: 'AI analysis completed', ar: 'التحليل الذكي مكتمل' }));
    } catch (error) {
      toast.error(t({ en: 'AI analysis failed', ar: 'فشل التحليل الذكي' }));
    } finally {
      setAiAnalyzing(false);
    }
  };

  const verifyMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Solution.update(solution.id, {
        is_verified: true,
        verification_date: new Date().toISOString().split('T')[0],
        verification_notes: verificationNotes,
        verification_checklist: checklist,
        ai_verification_recommendation: aiRecommendation,
        workflow_stage: 'verified'
      });

      await base44.entities.Notification.create({
        type: 'solution_verified',
        title: `Solution Verified: ${solution.name_en}`,
        message: `${solution.name_en} has been verified and is now available in the marketplace.`,
        severity: 'success',
        link: `/SolutionDetail?id=${solution.id}`
      });

      // Trigger auto-enrollment to Matchmaker
      try {
        await base44.functions.invoke('autoMatchmakerEnrollment', { solution_id: solution.id });
      } catch (error) {
        console.error('Auto-enrollment failed:', error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['solution']);
      toast.success(t({ en: 'Solution verified', ar: 'تم التحقق من الحل' }));
      onClose();
    }
  });

  const steps = [
    { num: 1, title: { en: 'Documentation', ar: 'التوثيق' }, checks: verificationChecks.step1_documentation },
    { num: 2, title: { en: 'Technical Review', ar: 'المراجعة التقنية' }, checks: verificationChecks.step2_technical },
    { num: 3, title: { en: 'Maturity Validation', ar: 'التحقق من النضج' }, checks: verificationChecks.step3_maturity }
  ];

  const currentStepChecks = steps[currentStep - 1].checks;
  const stepProgress = currentStepChecks.filter(c => checklist[c.id]).length / currentStepChecks.length * 100;
  const totalProgress = Object.values(checklist).filter(Boolean).length / Object.keys(checklist).length * 100;

  return (
    <Card className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          {t({ en: 'Solution Verification', ar: 'التحقق من الحل' })}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-blue-900">{solution?.name_en}</p>
            <Badge className="bg-blue-600 text-white">Step {currentStep}/3</Badge>
          </div>
          <Progress value={totalProgress} className="h-2" />
          <p className="text-xs text-slate-600 mt-2">
            {Object.values(checklist).filter(Boolean).length}/{Object.keys(checklist).length} checks completed
          </p>
        </div>

        {/* Step Navigation */}
        <div className="flex gap-2">
          {steps.map((step) => (
            <Button
              key={step.num}
              variant={currentStep === step.num ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentStep(step.num)}
              className={currentStep === step.num ? 'bg-blue-600' : ''}
            >
              {step.num}. {step.title[isRTL ? 'ar' : 'en']}
            </Button>
          ))}
        </div>

        {/* Current Step Checks */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">{steps[currentStep - 1].title[isRTL ? 'ar' : 'en']}</p>
            <Badge variant="outline">{Math.round(stepProgress)}%</Badge>
          </div>
          {currentStepChecks.map((check) => (
            <div key={check.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-slate-50">
              <Checkbox
                checked={checklist[check.id]}
                onCheckedChange={(checked) => setChecklist({ ...checklist, [check.id]: checked })}
                className="mt-0.5"
              />
              <p className="text-sm text-slate-900">{check.label[isRTL ? 'ar' : 'en']}</p>
            </div>
          ))}
        </div>

        {/* AI Analysis */}
        {currentStep === 3 && (
          <div className="border-t pt-4">
            <Button
              onClick={runAIAnalysis}
              disabled={aiAnalyzing}
              className="w-full bg-purple-600 hover:bg-purple-700 mb-4"
            >
              {aiAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t({ en: 'Analyzing...', ar: 'جاري التحليل...' })}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t({ en: 'Run AI Analysis', ar: 'تشغيل التحليل الذكي' })}
                </>
              )}
            </Button>

            {aiRecommendation && (
              <div className={`p-4 rounded-lg border-2 ${
                aiRecommendation.recommendation === 'approve' ? 'bg-green-50 border-green-300' :
                aiRecommendation.recommendation === 'conditional' ? 'bg-yellow-50 border-yellow-300' :
                'bg-red-50 border-red-300'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={
                    aiRecommendation.recommendation === 'approve' ? 'bg-green-600' :
                    aiRecommendation.recommendation === 'conditional' ? 'bg-yellow-600' :
                    'bg-red-600'
                  }>
                    {aiRecommendation.recommendation.toUpperCase()}
                  </Badge>
                  <Badge variant="outline">Risk: {aiRecommendation.risk_level}</Badge>
                </div>
                <p className="text-sm text-slate-700 mb-2">{aiRecommendation.reasoning}</p>
                {aiRecommendation.concerns?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-semibold text-slate-900 mb-1">Concerns:</p>
                    <ul className="text-xs text-slate-600 space-y-1">
                      {aiRecommendation.concerns.map((c, i) => (
                        <li key={i}>⚠ {c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {t({ en: 'Verification Notes', ar: 'ملاحظات التحقق' })}
          </label>
          <Textarea
            value={verificationNotes}
            onChange={(e) => setVerificationNotes(e.target.value)}
            rows={3}
            placeholder={t({ en: 'Add verification notes...', ar: 'أضف ملاحظات التحقق...' })}
          />
        </div>

        {/* Navigation */}
        <div className="flex gap-3 pt-4 border-t">
          {currentStep < 3 && (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {t({ en: 'Next Step', ar: 'الخطوة التالية' })}
            </Button>
          )}
          {currentStep === 3 && (
            <Button
              onClick={() => verifyMutation.mutate()}
              disabled={totalProgress < 80 || verifyMutation.isPending}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {verifyMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Shield className="h-4 w-4 mr-2" />
              )}
              {t({ en: 'Verify Solution', ar: 'التحقق من الحل' })}
            </Button>
          )}
          {currentStep > 1 && (
            <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
              {t({ en: 'Back', ar: 'رجوع' })}
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}