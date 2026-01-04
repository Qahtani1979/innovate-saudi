import { useState } from 'react';
import { useStrategicPlanInvalidator } from '@/hooks/useStrategicPlanInvalidator';
import { useStrategiesWithVisibility } from '@/hooks/useStrategiesWithVisibility';
import { useStrategyMutations } from '@/hooks/useStrategyMutations';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Shield, CheckCircle2, XCircle, Clock, FileText } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';

function StrategicPlanApprovalGate() {
  const { language, isRTL, t } = useLanguage();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [reviewComments, setReviewComments] = useState('');
  const { invalidateStrategicPlans } = useStrategicPlanInvalidator();
  const { user } = useAuth();

  const { updateStrategy } = useStrategyMutations();

  const { data: plans = [] } = useStrategiesWithVisibility();

  const handleDecision = (plan_id, action, comments) => {
    const updateData = {
      approval_status: action === 'approve' ? 'approved' : 'rejected',
      approval_comments: comments,
      approved_at: action === 'approve' ? new Date().toISOString() : null,
      approved_by: user?.email,
      updated_at: new Date().toISOString()
    };

    // If approving, also set status to active
    if (action === 'approve') {
      updateData.status = 'active';
      updateData.activated_at = new Date().toISOString();
      updateData.activated_by = user?.email;
    }

    updateStrategy.mutate({
      id: plan_id,
      data: updateData,
      metadata: { action, comments }
    }, {
      onSuccess: () => {
        setSelectedPlan(null);
        setReviewComments('');
        // Additional invalidations if needed, but hook handles main keys
        invalidateStrategicPlans();
      }
    });
  };

  const pendingPlans = plans.filter(p => p.approval_status === 'pending' || !p.approval_status);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
        <h1 className="text-5xl font-bold mb-2">
          {t({ en: '🛡️ Strategic Plan Approval Gate', ar: '🛡️ بوابة الموافقة على الخطة الاستراتيجية' })}
        </h1>
        <p className="text-xl text-white/90">
          {t({ en: 'Review and approve strategic plans before execution', ar: 'مراجعة والموافقة على الخطط الاستراتيجية قبل التنفيذ' })}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-yellow-50 to-white">
          <CardContent className="pt-6 text-center">
            <Clock className="h-10 w-10 text-yellow-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-yellow-600">{pendingPlans.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Pending Review', ar: 'قيد المراجعة' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">
              {plans.filter(p => p.approval_status === 'approved').length}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Approved', ar: 'موافق عليه' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-white">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-10 w-10 text-red-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-red-600">
              {plans.filter(p => p.approval_status === 'rejected').length}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Rejected', ar: 'مرفوض' })}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Plans Awaiting Approval', ar: 'الخطط بانتظار الموافقة' })}</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingPlans.length > 0 ? (
            <div className="space-y-4">
              {pendingPlans.map(plan => (
                <Card key={plan.id} className="border-2 border-yellow-200">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge>{plan.code}</Badge>
                          <Badge variant="outline">{plan.start_year} - {plan.end_year}</Badge>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          {language === 'ar' ? plan.name_ar : plan.name_en}
                        </h3>
                        <p className="text-sm text-slate-600 mt-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          {language === 'ar' ? plan.vision_ar : plan.vision_en}
                        </p>
                      </div>
                      <Button onClick={() => setSelectedPlan(selectedPlan?.id === plan.id ? null : plan)}>
                        <FileText className="h-4 w-4 mr-2" />
                        {t({ en: 'Review', ar: 'مراجعة' })}
                      </Button>
                    </div>

                    {selectedPlan?.id === plan.id && (
                      <div className="mt-4 p-4 bg-slate-50 rounded-lg border-t space-y-4">
                        <div>
                          <p className="font-medium text-slate-900 mb-2">{t({ en: 'Strategic Themes:', ar: 'المحاور الاستراتيجية:' })}</p>
                          <div className="flex flex-wrap gap-2">
                            {plan.strategic_themes?.map((theme, idx) => (
                              <Badge key={idx} variant="outline">{language === 'ar' ? theme.name_ar : theme.name_en}</Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium mb-2 block">{t({ en: 'Review Comments', ar: 'ملاحظات المراجعة' })}</label>
                          <Textarea
                            value={reviewComments}
                            onChange={(e) => setReviewComments(e.target.value)}
                            rows={3}
                            placeholder={t({ en: 'Add your review comments...', ar: 'أضف ملاحظات المراجعة...' })}
                            dir={language === 'ar' ? 'rtl' : 'ltr'}
                          />
                        </div>

                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleDecision(plan.id, 'approve', reviewComments)}
                            disabled={updateStrategy.isPending}
                            className="flex-1 bg-green-600"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            {t({ en: 'Approve', ar: 'موافقة' })}
                          </Button>
                          <Button
                            onClick={() => handleDecision(plan.id, 'reject', reviewComments)}
                            disabled={updateStrategy.isPending}
                            variant="outline"
                            className="flex-1 border-red-600 text-red-600"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            {t({ en: 'Reject', ar: 'رفض' })}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Shield className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">{t({ en: 'No plans awaiting approval', ar: 'لا توجد خطط بانتظار الموافقة' })}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(StrategicPlanApprovalGate, { requiredPermissions: ['strategy_manage'] });
