import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Users, Calendar as CalendarIcon, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { format } from 'date-fns';
import RequesterAI from '../approval/RequesterAI';
import ReviewerAI from '../approval/ReviewerAI';

import { usePolicyMutations } from '@/hooks/usePolicy';

export default function PolicyPublicConsultationGate({ policy, approvalRequest, currentUser }) {
  const { t, isRTL } = useLanguage();
  const { updatePolicy } = usePolicyMutations();
  const [consultationData, setConsultationData] = useState({
    stakeholders: policy.stakeholder_list || [],
    consultation_url: policy.public_consultation_url || '',
    start_date: null,
    end_date: null,
    feedback_received: 0
  });

  const handleStartConsultation = async () => {
    await updatePolicy.mutateAsync({
      id: policy.id,
      public_consultation_status: 'active',
      public_consultation_url: consultationData.consultation_url,
      public_consultation_start_date: consultationData.start_date,
      public_consultation_end_date: consultationData.end_date,
      stakeholder_list: consultationData.stakeholders
    });
  };

  const isRequester = currentUser?.email === approvalRequest?.requester_email;
  const isReviewer = currentUser?.role === 'admin' || currentUser?.assigned_roles?.includes('policy_officer');

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Requester View */}
      {isRequester && (
        <>
          <RequesterAI
            entityType="policy_recommendation"
            entityData={policy}
            gateName="public_consultation"
            gateConfig={{
              name: 'public_consultation',
              label: { en: 'Public Consultation', ar: 'الاستشارة العامة' },
              type: 'compliance',
              selfCheckItems: [
                { en: 'Consultation plan prepared', ar: 'خطة الاستشارة جاهزة' },
                { en: 'Stakeholders identified', ar: 'أصحاب المصلحة محددون' },
                { en: 'Public URL configured', ar: 'رابط الاستشارة جاهز' },
                { en: 'Duration set (min 30 days)', ar: 'المدة محددة (30 يوم كحد أدنى)' }
              ]
            }}
            onSelfCheckUpdate={(result) => console.log('AI Check Result:', result)}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                {t({ en: 'Configure Public Consultation', ar: 'تكوين الاستشارة العامة' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  {t({ en: 'Consultation URL', ar: 'رابط الاستشارة' })}
                </label>
                <Input
                  value={consultationData.consultation_url}
                  onChange={(e) => setConsultationData({ ...consultationData, consultation_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    {t({ en: 'Start Date', ar: 'تاريخ البداية' })}
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {consultationData.start_date ? format(consultationData.start_date, 'PPP') : t({ en: 'Select', ar: 'اختر' })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <Calendar
                        mode="single"
                        selected={consultationData.start_date}
                        onSelect={(date) => setConsultationData({ ...consultationData, start_date: date })}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    {t({ en: 'End Date', ar: 'تاريخ النهاية' })}
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {consultationData.end_date ? format(consultationData.end_date, 'PPP') : t({ en: 'Select', ar: 'اختر' })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <Calendar
                        mode="single"
                        selected={consultationData.end_date}
                        onSelect={(date) => setConsultationData({ ...consultationData, end_date: date })}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {consultationData.start_date && consultationData.end_date && (
                <div className="p-3 bg-blue-50 rounded border">
                  <p className="text-sm text-blue-900">
                    {t({ en: 'Duration:', ar: 'المدة:' })} {Math.ceil((consultationData.end_date - consultationData.start_date) / (1000 * 60 * 60 * 24))} {t({ en: 'days', ar: 'يوم' })}
                  </p>
                  {Math.ceil((consultationData.end_date - consultationData.start_date) / (1000 * 60 * 60 * 24)) < 30 && (
                    <div className="flex items-center gap-2 mt-2 text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      <p className="text-xs">{t({ en: 'Minimum 30 days required', ar: 'الحد الأدنى 30 يوم' })}</p>
                    </div>
                  )}
                </div>
              )}

              <Button
                onClick={handleStartConsultation}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={!consultationData.consultation_url || !consultationData.start_date || !consultationData.end_date}
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                {t({ en: 'Launch Consultation', ar: 'إطلاق الاستشارة' })}
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {/* Reviewer View */}
      {isReviewer && approvalRequest && (
        <ReviewerAI
          entityType="policy_recommendation"
          entityData={policy}
          gateName="public_consultation"
          gateConfig={{
            name: 'public_consultation',
            label: { en: 'Public Consultation', ar: 'الاستشارة العامة' },
            type: 'compliance',
            requiredRole: 'policy_officer',
            reviewerChecklistItems: [
              { en: 'Stakeholder list comprehensive', ar: 'قائمة أصحاب المصلحة شاملة' },
              { en: 'Consultation process transparent', ar: 'عملية الاستشارة شفافة' },
              { en: 'Feedback mechanism clear', ar: 'آلية التعليقات واضحة' },
              { en: 'Timeline adequate', ar: 'الجدول الزمني كافٍ' }
            ]
          }}
          approvalRequest={approvalRequest}
        />
      )}
    </div>
  );
}