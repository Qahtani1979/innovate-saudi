import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from './LanguageContext';
import { FileText, X, Loader2, Award } from 'lucide-react';
import { toast } from 'sonner';

export default function SolutionCaseStudyWizard({ solution, onClose }) {
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);

  const [caseStudy, setCaseStudy] = useState({
    title: '',
    client: '',
    challenge: '',
    solution_applied: '',
    results: '',
    metrics: {
      cost_savings: '',
      time_saved: '',
      efficiency_gain: '',
      user_satisfaction: ''
    },
    document_url: '',
    testimonial: '',
    contact_person: ''
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const updatedCaseStudies = [
        ...(solution.case_studies || []),
        {
          ...caseStudy,
          submission_date: new Date().toISOString().split('T')[0]
        }
      ];

      await base44.entities.Solution.update(solution.id, {
        case_studies: updatedCaseStudies
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['solution']);
      toast.success(t({ en: 'Case study submitted', ar: 'تم إرسال دراسة الحالة' }));
      onClose();
    }
  });

  return (
    <Card className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          {t({ en: 'Submit Case Study', ar: 'إرسال دراسة حالة' })}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-900">{solution?.name_en}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge className="bg-blue-600 text-white text-xs">Step {currentStep}/3</Badge>
          </div>
        </div>

        {currentStep === 1 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-900">
              {t({ en: 'Basic Information', ar: 'المعلومات الأساسية' })}
            </p>
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">
                {t({ en: 'Case Study Title', ar: 'عنوان دراسة الحالة' })}
              </label>
              <Input
                value={caseStudy.title}
                onChange={(e) => setCaseStudy({ ...caseStudy, title: e.target.value })}
                placeholder={t({ en: 'e.g., Traffic Optimization in Jeddah', ar: 'مثل: تحسين المرور في جدة' })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">
                {t({ en: 'Client', ar: 'العميل' })}
              </label>
              <Input
                value={caseStudy.client}
                onChange={(e) => setCaseStudy({ ...caseStudy, client: e.target.value })}
                placeholder={t({ en: 'Organization name', ar: 'اسم المنظمة' })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">
                {t({ en: 'Challenge Addressed', ar: 'التحدي المعالج' })}
              </label>
              <Textarea
                value={caseStudy.challenge}
                onChange={(e) => setCaseStudy({ ...caseStudy, challenge: e.target.value })}
                rows={3}
                placeholder={t({ en: 'What problem was solved?', ar: 'ما المشكلة التي تم حلها؟' })}
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-900">
              {t({ en: 'Implementation & Results', ar: 'التنفيذ والنتائج' })}
            </p>
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">
                {t({ en: 'Solution Applied', ar: 'الحل المطبق' })}
              </label>
              <Textarea
                value={caseStudy.solution_applied}
                onChange={(e) => setCaseStudy({ ...caseStudy, solution_applied: e.target.value })}
                rows={3}
                placeholder={t({ en: 'How was the solution implemented?', ar: 'كيف تم تطبيق الحل؟' })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">
                {t({ en: 'Results & Impact', ar: 'النتائج والأثر' })}
              </label>
              <Textarea
                value={caseStudy.results}
                onChange={(e) => setCaseStudy({ ...caseStudy, results: e.target.value })}
                rows={4}
                placeholder={t({ en: 'Describe measurable outcomes...', ar: 'وصف النتائج القابلة للقياس...' })}
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-900">
              {t({ en: 'Metrics & Testimonial', ar: 'المقاييس والشهادة' })}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">
                  {t({ en: 'Cost Savings', ar: 'توفير التكلفة' })}
                </label>
                <Input
                  value={caseStudy.metrics.cost_savings}
                  onChange={(e) => setCaseStudy({ ...caseStudy, metrics: { ...caseStudy.metrics, cost_savings: e.target.value } })}
                  placeholder="e.g., 30% reduction"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">
                  {t({ en: 'Time Saved', ar: 'الوقت الموفر' })}
                </label>
                <Input
                  value={caseStudy.metrics.time_saved}
                  onChange={(e) => setCaseStudy({ ...caseStudy, metrics: { ...caseStudy.metrics, time_saved: e.target.value } })}
                  placeholder="e.g., 50% faster"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">
                  {t({ en: 'Efficiency Gain', ar: 'كسب الكفاءة' })}
                </label>
                <Input
                  value={caseStudy.metrics.efficiency_gain}
                  onChange={(e) => setCaseStudy({ ...caseStudy, metrics: { ...caseStudy.metrics, efficiency_gain: e.target.value } })}
                  placeholder="e.g., +40%"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">
                  {t({ en: 'User Satisfaction', ar: 'رضا المستخدمين' })}
                </label>
                <Input
                  value={caseStudy.metrics.user_satisfaction}
                  onChange={(e) => setCaseStudy({ ...caseStudy, metrics: { ...caseStudy.metrics, user_satisfaction: e.target.value } })}
                  placeholder="e.g., 4.5/5"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 mb-1 block">
                {t({ en: 'Client Testimonial (Optional)', ar: 'شهادة العميل (اختياري)' })}
              </label>
              <Textarea
                value={caseStudy.testimonial}
                onChange={(e) => setCaseStudy({ ...caseStudy, testimonial: e.target.value })}
                rows={3}
                placeholder={t({ en: 'Client feedback quote...', ar: 'اقتباس من تعليقات العميل...' })}
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 pt-4 border-t">
          {currentStep < 3 && (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={
                (currentStep === 1 && (!caseStudy.title || !caseStudy.client || !caseStudy.challenge)) ||
                (currentStep === 2 && (!caseStudy.solution_applied || !caseStudy.results))
              }
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {t({ en: 'Next', ar: 'التالي' })}
            </Button>
          )}
          {currentStep === 3 && (
            <Button
              onClick={() => submitMutation.mutate()}
              disabled={submitMutation.isPending}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {submitMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Award className="h-4 w-4 mr-2" />
              )}
              {t({ en: 'Submit Case Study', ar: 'إرسال دراسة الحالة' })}
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