import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../LanguageContext';
import {
  CheckCircle,
  Building2,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';

import { useMunicipalities } from '@/hooks/useMunicipalities';
import { usePolicyMutations } from '@/hooks/usePolicyMutations';

export default function PolicyImplementationTracker({ policy }) {
  const { language, isRTL, t } = useLanguage();
  const { data: municipalities = [] } = useMunicipalities();
  const { submitLegalReview } = usePolicyMutations();

  const [reviewData, setReviewData] = useState({
    status: 'pending',
    checklist: [
      { item: t({ en: 'Legal citations verified', ar: 'الاستشهادات القانونية تم التحقق منها' }), checked: false },
      { item: t({ en: 'Compliance check passed', ar: 'فحص الامتثال ناجح' }), checked: false },
      { item: t({ en: 'Risk assessment completed', ar: 'اكتمل تقييم المخاطر' }), checked: false }
    ],
    comments: ''
  });

  const hasReview = policy.legal_review?.status;

  const implementation = policy.implementation_progress || {
    overall_percentage: 0,
    municipalities_adopted: [],
    municipalities_total: municipalities.length,
    milestones: []
  };

  const adoptedMunicipalities = municipalities.filter(m =>
    implementation.municipalities_adopted?.includes(m.id)
  );

  const adoptionRate = municipalities.length > 0
    ? Math.round((adoptedMunicipalities.length / municipalities.length) * 100)
    : 0;

  return (
    <Card className="border-2 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span>{t({ en: 'Implementation Progress', ar: 'تقدم التنفيذ' })}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">
              {t({ en: 'Overall Implementation', ar: 'التنفيذ الإجمالي' })}
            </p>
            <Badge className="bg-green-100 text-green-700">
              {implementation.overall_percentage || 0}%
            </Badge>
          </div>
          <Progress value={implementation.overall_percentage || 0} className="h-3" />
        </div>

        {/* Municipality Adoption */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-semibold text-slate-900">
                {t({ en: 'Municipality Adoption', ar: 'اعتماد البلديات' })}
              </p>
            </div>
            <Badge variant="outline">
              {adoptedMunicipalities.length} / {municipalities.length}
            </Badge>
          </div>
          <Progress value={adoptionRate} className="h-2" />

          {adoptedMunicipalities.length > 0 && (
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-xs font-semibold text-green-900 mb-2">
                {t({ en: 'Adopted by:', ar: 'معتمد من:' })}
              </p>
              <div className="flex flex-wrap gap-2">
                {adoptedMunicipalities.map(m => (
                  <Badge key={m.id} variant="outline" className="text-xs">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      {language === 'ar' && m.name_ar ? m.name_ar : m.name_en}
                    </span>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Milestones */}
        {implementation.milestones && implementation.milestones.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-900">
              {t({ en: 'Implementation Milestones', ar: 'معالم التنفيذ' })}
            </p>
            <div className="space-y-2">
              {implementation.milestones.map((milestone, idx) => {
                const statusConfig = {
                  completed: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
                  in_progress: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
                  delayed: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
                  pending: { icon: Clock, color: 'text-slate-400', bg: 'bg-slate-50' }
                };

                const config = statusConfig[milestone.status] || statusConfig.pending;
                const Icon = config.icon;

                return (
                  <div key={idx} className={`p-3 rounded-lg border ${config.bg}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${config.color}`} />
                        <p className="text-sm font-medium text-slate-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          {language === 'ar' && milestone.name_ar ? milestone.name_ar : milestone.name_en}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {milestone.status}
                      </Badge>
                    </div>
                    {milestone.target_date && (
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {t({ en: 'Target:', ar: 'الهدف:' })} {new Date(milestone.target_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {milestone.completed_date && (
                      <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>
                          {t({ en: 'Completed:', ar: 'مُنجز:' })} {new Date(milestone.completed_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Review Section */}
        {policy.workflow_stage === 'legal_review' && !hasReview && (
          <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded space-y-4">
            <p className="text-sm font-semibold text-blue-900">
              {t({ en: 'Legal Review Required', ar: 'مراجعة قانونية مطلوبة' })}
            </p>

            <div className="space-y-3">
              {reviewData.checklist.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) => {
                      const updated = [...reviewData.checklist];
                      updated[i].checked = e.target.checked;
                      setReviewData({ ...reviewData, checklist: updated });
                    }}
                    className="h-4 w-4 rounded"
                  />
                  <span className="text-sm text-slate-700">{item.item}</span>
                </div>
              ))}
            </div>

            <Textarea
              value={reviewData.comments}
              onChange={(e) => setReviewData({ ...reviewData, comments: e.target.value })}
              rows={3}
              placeholder={t({ en: 'Legal review comments...', ar: 'ملاحظات المراجعة القانونية...' })}
              dir={isRTL ? 'rtl' : 'ltr'}
            />

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  submitLegalReview.mutate({
                    id: policy.id,
                    reviewData: { ...reviewData, status: 'approved' }
                  });
                }}
                disabled={submitLegalReview.isPending}
                className="flex-1 gap-2 bg-green-600"
              >
                <CheckCircle2 className="h-4 w-4" />
                {t({ en: 'Approve', ar: 'موافقة' })}
              </Button>
              <Button
                onClick={() => {
                  submitLegalReview.mutate({
                    id: policy.id,
                    reviewData: { ...reviewData, status: 'requires_changes' }
                  });
                }}
                disabled={submitLegalReview.isPending}
                variant="outline"
                className="flex-1 gap-2"
              >
                <AlertCircle className="h-4 w-4" />
                {t({ en: 'Request Changes', ar: 'طلب تعديلات' })}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}