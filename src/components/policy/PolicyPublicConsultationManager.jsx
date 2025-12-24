import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { toast } from 'sonner';
import { MessageSquare, Calendar, Users, ExternalLink, Loader2, CheckCircle2 } from 'lucide-react';

export default function PolicyPublicConsultationManager({ policy }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [configuring, setConfiguring] = useState(false);
  const [consultationData, setConsultationData] = useState({
    required: true,
    duration_days: 30,
    start_date: '',
    summary: ''
  });

  const consultation = policy.public_consultation || {};
  const hasConsultation = consultation.start_date;

  const startMutation = useMutation({
    mutationFn: async () => {
      const startDate = new Date(consultationData.start_date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + consultationData.duration_days);

      return await base44.entities.PolicyRecommendation.update(policy.id, {
        public_consultation: {
          required: true,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          duration_days: consultationData.duration_days,
          feedback_count: 0,
          summary: consultationData.summary,
          public_url: `${window.location.origin}/public/policy-consultation?id=${policy.id}`
        },
        workflow_stage: 'public_consultation'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['policy', policy.id]);
      toast.success(t({ en: 'Public consultation started', ar: 'بدأت الاستشارة العامة' }));
      setConfiguring(false);
    }
  });

  const completeMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.PolicyRecommendation.update(policy.id, {
        public_consultation: {
          ...consultation,
          summary: consultationData.summary
        },
        workflow_stage: 'council_approval'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['policy', policy.id]);
      toast.success(t({ en: 'Consultation completed', ar: 'اكتملت الاستشارة' }));
    }
  });

  const daysElapsed = hasConsultation && consultation.start_date 
    ? Math.floor((new Date() - new Date(consultation.start_date)) / (1000 * 60 * 60 * 24))
    : 0;

  const daysRemaining = consultation.duration_days - daysElapsed;
  const progressPercentage = Math.min(100, Math.round((daysElapsed / consultation.duration_days) * 100));
  const isActive = hasConsultation && daysRemaining > 0;
  const isCompleted = hasConsultation && daysRemaining <= 0;

  return (
    <Card className="border-2 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-purple-600" />
          <span>{t({ en: 'Public Consultation', ar: 'الاستشارة العامة' })}</span>
          {isActive && (
            <Badge className="bg-purple-100 text-purple-700">
              {t({ en: 'Active', ar: 'نشط' })}
            </Badge>
          )}
          {isCompleted && (
            <Badge className="bg-green-100 text-green-700">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {t({ en: 'Completed', ar: 'مكتمل' })}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasConsultation && !configuring ? (
          <div className="text-center py-6 space-y-3">
            <MessageSquare className="h-12 w-12 text-slate-300 mx-auto" />
            <p className="text-sm text-slate-600">
              {t({ en: 'No public consultation scheduled', ar: 'لم يتم جدولة استشارة عامة' })}
            </p>
            {policy.workflow_stage === 'public_consultation' && (
              <Button onClick={() => setConfiguring(true)} className="gap-2 bg-purple-600">
                <Calendar className="h-4 w-4" />
                {t({ en: 'Schedule Consultation', ar: 'جدولة الاستشارة' })}
              </Button>
            )}
          </div>
        ) : configuring ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t({ en: 'Start Date', ar: 'تاريخ البدء' })}</Label>
              <Input
                type="date"
                value={consultationData.start_date}
                onChange={(e) => setConsultationData({ ...consultationData, start_date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label>{t({ en: 'Duration (days)', ar: 'المدة (أيام)' })}</Label>
              <Input
                type="number"
                value={consultationData.duration_days}
                onChange={(e) => setConsultationData({ ...consultationData, duration_days: parseInt(e.target.value) })}
                min={15}
                max={90}
              />
              <p className="text-xs text-slate-500">
                {t({ en: 'Recommended: 30-60 days', ar: 'موصى به: 30-60 يوم' })}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => startMutation.mutate()}
                disabled={!consultationData.start_date || startMutation.isPending}
                className="flex-1 gap-2 bg-purple-600"
              >
                {startMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {t({ en: 'Start Consultation', ar: 'بدء الاستشارة' })}
              </Button>
              <Button variant="outline" onClick={() => setConfiguring(false)}>
                {t({ en: 'Cancel', ar: 'إلغاء' })}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-slate-600 mb-1">{t({ en: 'Period', ar: 'الفترة' })}</p>
                <div className="flex items-center gap-1 text-sm font-medium">
                  <Calendar className="h-3 w-3 text-purple-600" />
                  <span>{new Date(consultation.start_date).toLocaleDateString()}</span>
                  <span>→</span>
                  <span>{new Date(consultation.end_date).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-slate-600 mb-1">{t({ en: 'Feedback Received', ar: 'تعليقات مستلمة' })}</p>
                <div className="flex items-center gap-1 text-sm font-medium">
                  <Users className="h-3 w-3 text-blue-600" />
                  <span className="text-2xl font-bold text-blue-600">{consultation.feedback_count || 0}</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-slate-900">
                  {t({ en: 'Progress', ar: 'التقدم' })}
                </p>
                <Badge variant="outline">
                  {isActive ? `${daysRemaining} ${t({ en: 'days left', ar: 'يوم متبقي' })}` : t({ en: 'Completed', ar: 'مكتمل' })}
                </Badge>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-xs text-slate-500 mt-1">
                {daysElapsed} / {consultation.duration_days} {t({ en: 'days', ar: 'أيام' })}
              </p>
            </div>

            {consultation.public_url && (
              <a href={consultation.public_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full gap-2">
                  <ExternalLink className="h-4 w-4" />
                  {t({ en: 'View Public Page', ar: 'عرض الصفحة العامة' })}
                </Button>
              </a>
            )}

            {isCompleted && policy.workflow_stage === 'public_consultation' && (
              <div className="space-y-3 p-4 bg-green-50 border-l-4 border-green-500 rounded">
                <p className="text-sm font-semibold text-green-900">
                  {t({ en: 'Consultation Period Ended', ar: 'انتهت فترة الاستشارة' })}
                </p>
                <div className="space-y-2">
                  <Label>{t({ en: 'Summary & Outcomes', ar: 'الملخص والنتائج' })}</Label>
                  <Textarea
                    value={consultationData.summary}
                    onChange={(e) => setConsultationData({ ...consultationData, summary: e.target.value })}
                    rows={4}
                    placeholder={t({ 
                      en: 'Summarize public feedback and key recommendations...', 
                      ar: 'لخص التعليقات العامة والتوصيات الرئيسية...' 
                    })}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                </div>
                <Button
                  onClick={() => completeMutation.mutate()}
                  disabled={completeMutation.isPending}
                  className="w-full gap-2 bg-green-600"
                >
                  {completeMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t({ en: 'Complete Consultation & Move to Council Approval', ar: 'إنهاء الاستشارة والانتقال لموافقة المجلس' })}
                </Button>
              </div>
            )}

            {consultation.summary && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs font-semibold text-slate-700 mb-1">
                  {t({ en: 'Summary:', ar: 'الملخص:' })}
                </p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{consultation.summary}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}