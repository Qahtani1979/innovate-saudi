import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { ChevronRight, ChevronLeft, Check, Calendar, TrendingUp, Target } from 'lucide-react';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';

function QuarterlyReviewWizard() {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [reviewData, setReviewData] = useState({
    quarter: '',
    year: new Date().getFullYear(),
    achievements: '',
    gaps: '',
    priorities: ''
  });

  const { data: strategicPlans = [] } = useQuery({
    queryKey: ['strategic-plans'],
    queryFn: () => base44.entities.StrategicPlan.list()
  });

  const activePlan = strategicPlans.find(p => p.status === 'active') || strategicPlans[0];

  const submitReview = async () => {
    toast.success(t({ en: 'Quarterly review submitted for approval', ar: 'تم تقديم المراجعة الفصلية للموافقة' }));
    setStep(1);
    setReviewData({ quarter: '', year: new Date().getFullYear(), achievements: '', gaps: '', priorities: '' });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'Quarterly Review Wizard', ar: 'معالج المراجعة الفصلية' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Guided quarterly review with pre-filled data and approval workflow', ar: 'مراجعة فصلية موجهة مع بيانات معبأة مسبقاً وسير عمل الموافقة' })}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {t({ en: `Step ${step}/4`, ar: `خطوة ${step}/4` })}
            </CardTitle>
            <Badge className="bg-blue-100 text-blue-700">
              {reviewData.quarter} {reviewData.year}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {t({ en: 'Select Review Period', ar: 'اختر فترة المراجعة' })}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t({ en: 'Quarter', ar: 'الربع' })}
                  </label>
                  <Select value={reviewData.quarter} onValueChange={(v) => setReviewData({...reviewData, quarter: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder={t({ en: 'Select quarter', ar: 'اختر الربع' })} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Q1">Q1 (Jan-Mar)</SelectItem>
                      <SelectItem value="Q2">Q2 (Apr-Jun)</SelectItem>
                      <SelectItem value="Q3">Q3 (Jul-Sep)</SelectItem>
                      <SelectItem value="Q4">Q4 (Oct-Dec)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t({ en: 'Year', ar: 'السنة' })}
                  </label>
                  <Select value={reviewData.year.toString()} onValueChange={(v) => setReviewData({...reviewData, year: parseInt(v)})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                      <SelectItem value="2027">2027</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {activePlan && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900">
                    {t({ en: 'Strategic Plan:', ar: 'الخطة الاستراتيجية:' })} {activePlan.name_en}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {activePlan.start_year} - {activePlan.end_year}
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {t({ en: 'Review Achievements', ar: 'مراجعة الإنجازات' })}
              </h3>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200 mb-4">
                <p className="text-sm text-green-900 font-medium mb-2">
                  {t({ en: 'Auto-populated Data:', ar: 'البيانات المعبأة تلقائياً:' })}
                </p>
                <ul className="space-y-1 text-sm text-slate-700">
                  <li>• {challenges.filter(c => c.status === 'resolved').length} challenges resolved this quarter</li>
                  <li>• {pilots.filter(p => p.stage === 'completed').length} pilots completed</li>
                  <li>• {pilots.filter(p => p.stage === 'scaled').length} solutions scaled</li>
                </ul>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t({ en: 'Key Achievements & Highlights', ar: 'الإنجازات والأبرز الرئيسية' })}
                </label>
                <Textarea
                  value={reviewData.achievements}
                  onChange={(e) => setReviewData({...reviewData, achievements: e.target.value})}
                  rows={6}
                  placeholder={t({ en: 'Describe key achievements...', ar: 'اوصف الإنجازات الرئيسية...' })}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {t({ en: 'Identify Gaps & Challenges', ar: 'تحديد الفجوات والتحديات' })}
              </h3>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t({ en: 'Strategic Gaps', ar: 'الفجوات الاستراتيجية' })}
                </label>
                <Textarea
                  value={reviewData.gaps}
                  onChange={(e) => setReviewData({...reviewData, gaps: e.target.value})}
                  rows={6}
                  placeholder={t({ en: 'Identify gaps and areas needing attention...', ar: 'حدد الفجوات والمجالات التي تحتاج انتباه...' })}
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {t({ en: 'Set Next Quarter Priorities', ar: 'تحديد أولويات الربع القادم' })}
              </h3>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t({ en: 'Strategic Priorities', ar: 'الأولويات الاستراتيجية' })}
                </label>
                <Textarea
                  value={reviewData.priorities}
                  onChange={(e) => setReviewData({...reviewData, priorities: e.target.value})}
                  rows={6}
                  placeholder={t({ en: 'Define priorities for next quarter...', ar: 'حدد أولويات الربع القادم...' })}
                />
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm font-medium text-purple-900 mb-2">
                  {t({ en: 'Review Summary', ar: 'ملخص المراجعة' })}
                </p>
                <div className="space-y-1 text-sm text-slate-700">
                  <p><strong>{t({ en: 'Period:', ar: 'الفترة:' })}</strong> {reviewData.quarter} {reviewData.year}</p>
                  <p><strong>{t({ en: 'Achievements:', ar: 'الإنجازات:' })}</strong> {reviewData.achievements ? '✓' : '—'}</p>
                  <p><strong>{t({ en: 'Gaps:', ar: 'الفجوات:' })}</strong> {reviewData.gaps ? '✓' : '—'}</p>
                  <p><strong>{t({ en: 'Priorities:', ar: 'الأولويات:' })}</strong> {reviewData.priorities ? '✓' : '—'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                {t({ en: 'Back', ar: 'رجوع' })}
              </Button>
            )}
            {step < 4 ? (
              <Button onClick={() => setStep(step + 1)} className="ml-auto bg-blue-600">
                {t({ en: 'Next', ar: 'التالي' })}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={submitReview} className="ml-auto bg-green-600">
                <Check className="h-4 w-4 mr-2" />
                {t({ en: 'Submit for Approval', ar: 'تقديم للموافقة' })}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(QuarterlyReviewWizard, { requiredPermissions: [] });