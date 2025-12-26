import { useState } from 'react';
import { useScaling } from '@/hooks/useScaling';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useLanguage } from '../components/LanguageContext';
import { TrendingUp, CheckCircle2, Target, DollarSign, Sparkles, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';
import ScalingPlanningWizard from '../components/scaling/ScalingPlanningWizard';
import ScalingExecutionDashboard from '../components/scaling/ScalingExecutionDashboard';
import BudgetApprovalGate from '../components/scaling/BudgetApprovalGate';
import ScalingListAIInsights from '../components/scaling/ScalingListAIInsights';
import NationalIntegrationGate from '../components/scaling/NationalIntegrationGate';
import ProtectedPage from '../components/permissions/ProtectedPage';
import PolicyTabWidget from '../components/policy/PolicyTabWidget';
import { useAuth } from '@/lib/AuthContext';

function ScalingWorkflow() {
  const { language, isRTL, t } = useLanguage();

  const { user } = useAuth();
  const [scalingPlans, setScalingPlans] = useState({});
  const [showAdvancedWizard, setShowAdvancedWizard] = useState(false);
  const [selectedPilotForWizard, setSelectedPilotForWizard] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [showBudgetGate, setShowBudgetGate] = useState(false);
  const [showIntegrationGate, setShowIntegrationGate] = useState(false);

  const {
    useCompletedPilots,
    useScaledPilots,
    useScalingPlans,
    useApproveScaling,
    invalidateScalingPlans
  } = useScaling();

  const { data: completedPilots = [] } = useCompletedPilots(user);
  const { data: scaledPilots = [] } = useScaledPilots(user);
  const { data: scalingPlansData = [] } = useScalingPlans();
  const scaleApprovalMutation = useApproveScaling();

  const handleApproveScaling = (pilotId) => {
    const plan = scalingPlans[pilotId] || {};
    scaleApprovalMutation.mutate({ pilotId, plan });
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Advanced Planning Wizard Modal */}
      {showAdvancedWizard && selectedPilotForWizard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-6">{t({ en: 'AI-Powered Scaling Plan', ar: 'خطة التوسع الذكية' })}</h2>
            <ScalingPlanningWizard
              pilot={selectedPilotForWizard}
              onComplete={() => {
                setShowAdvancedWizard(false);
                setSelectedPilotForWizard(null);
                invalidateScalingPlans();
              }}
              onCancel={() => {
                setShowAdvancedWizard(false);
                setSelectedPilotForWizard(null);
              }}
            />
          </div>
        </div>
      )}

      {/* National Integration Gate Modal */}
      {showIntegrationGate && selectedPlanId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <NationalIntegrationGate
              scalingPlan={scalingPlansData.find(p => p.id === selectedPlanId)}
              onApproved={(data) => {
                setShowIntegrationGate(false);
                invalidateScalingPlans();
              }}
              onClose={() => setShowIntegrationGate(false)}
            />
          </div>
        </div>
      )}

      {/* Budget Approval Gate Modal */}
      {showBudgetGate && selectedPlanId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <BudgetApprovalGate
              scalingPlan={scalingPlansData.find(p => p.id === selectedPlanId)}
              onApproved={() => {
                setShowBudgetGate(false);
                invalidateScalingPlans();
              }}
              onRejected={() => {
                setShowBudgetGate(false);
                invalidateScalingPlans();
              }}
            />
            <Button variant="outline" onClick={() => setShowBudgetGate(false)} className="w-full mt-4">
              {t({ en: 'Close', ar: 'إغلاق' })}
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            {t({ en: 'Scaling Workflow', ar: 'سير عمل التوسع' })}
          </h1>
          <p className="text-slate-600 mt-2">
            {t({ en: 'Scale successful pilots to national implementation', ar: 'توسيع التجارب الناجحة للتطبيق الوطني' })}
          </p>
        </div>
        <ScalingListAIInsights completedPilots={completedPilots} scaledPilots={scaledPilots} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Ready to Scale', ar: 'جاهز للتوسع' })}</p>
                <p className="text-3xl font-bold text-green-600">{completedPilots.length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Scaled', ar: 'تم التوسع' })}</p>
                <p className="text-3xl font-bold text-blue-600">{scaledPilots.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Avg Success', ar: 'متوسط النجاح' })}</p>
                <p className="text-3xl font-bold text-purple-600">
                  {completedPilots.length > 0 ? Math.round(completedPilots.reduce((acc, p) => acc + (p.success_probability || 0), 0) / completedPilots.length) : 0}%
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-slate-900">
          {t({ en: 'Pilots Ready for Scaling', ar: 'التجارب الجاهزة للتوسع' })}
        </h2>

        {completedPilots.map((pilot) => (
          <Card key={pilot.id} className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{pilot.code}</Badge>
                      <Badge className="bg-green-100 text-green-700">{pilot.recommendation}</Badge>
                      <Badge variant="outline">{pilot.sector?.replace(/_/g, ' ')}</Badge>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      {language === 'ar' && pilot.title_ar ? pilot.title_ar : pilot.title_en}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {pilot.municipality_id} • {pilot.duration_weeks}w • Success Rate: {pilot.success_probability}%
                    </p>
                  </div>
                  <Link to={createPageUrl(`PilotDetail?id=${pilot.id}`)}>
                    <Button variant="outline">{t({ en: 'View Pilot', ar: 'عرض التجربة' })}</Button>
                  </Link>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-900 mb-3">
                    {t({ en: 'Scaling Plan', ar: 'خطة التوسع' })}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-600 mb-1 block">
                        {t({ en: 'Target Municipalities', ar: 'البلديات المستهدفة' })}
                      </label>
                      <Input
                        placeholder="5"
                        type="number"
                        className="bg-white"
                        value={scalingPlans[pilot.id]?.target_municipalities || ''}
                        onChange={(e) => setScalingPlans({
                          ...scalingPlans,
                          [pilot.id]: { ...scalingPlans[pilot.id], target_municipalities: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600 mb-1 block">
                        {t({ en: 'Timeline (months)', ar: 'المدة (أشهر)' })}
                      </label>
                      <Input
                        placeholder="12"
                        type="number"
                        className="bg-white"
                        value={scalingPlans[pilot.id]?.timeline_months || ''}
                        onChange={(e) => setScalingPlans({
                          ...scalingPlans,
                          [pilot.id]: { ...scalingPlans[pilot.id], timeline_months: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600 mb-1 block">
                        {t({ en: 'Budget (SAR)', ar: 'الميزانية (ريال)' })}
                      </label>
                      <Input
                        placeholder="500000"
                        type="number"
                        className="bg-white"
                        value={scalingPlans[pilot.id]?.budget || ''}
                        onChange={(e) => setScalingPlans({
                          ...scalingPlans,
                          [pilot.id]: { ...scalingPlans[pilot.id], budget: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600 mb-1 block">
                        {t({ en: 'Target Date', ar: 'التاريخ المستهدف' })}
                      </label>
                      <Input
                        type="date"
                        className="bg-white"
                        value={scalingPlans[pilot.id]?.target_date || ''}
                        onChange={(e) => setScalingPlans({
                          ...scalingPlans,
                          [pilot.id]: { ...scalingPlans[pilot.id], target_date: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                  <Textarea
                    placeholder={t({ en: 'Scaling approach and strategy...', ar: 'نهج واستراتيجية التوسع...' })}
                    className="mt-3 bg-white"
                    rows={3}
                    value={scalingPlans[pilot.id]?.approach || ''}
                    onChange={(e) => setScalingPlans({
                      ...scalingPlans,
                      [pilot.id]: { ...scalingPlans[pilot.id], approach: e.target.value }
                    })}
                  />
                </div>

                {/* Policy Requirements */}
                <PolicyTabWidget entityType="pilot" entityId={pilot.id} />

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleApproveScaling(pilot.id)}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
                    disabled={scaleApprovalMutation.isPending}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    {t({ en: 'Quick Approve', ar: 'موافقة سريعة' })}
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedPilotForWizard(pilot);
                      setShowAdvancedWizard(true);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {t({ en: 'Advanced Planning', ar: 'تخطيط متقدم' })}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {completedPilots.length === 0 && (
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">
              {t({ en: 'No completed pilots ready for scaling', ar: 'لا توجد تجارب مكتملة جاهزة للتوسع' })}
            </p>
          </div>
        )}
      </div>

      {/* Execution Dashboards */}
      {selectedPlanId && !showBudgetGate && !showAdvancedWizard && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-900">
              {t({ en: 'Scaling Execution Dashboard', ar: 'لوحة تنفيذ التوسع' })}
            </h2>
            <Button variant="outline" onClick={() => setSelectedPlanId(null)}>
              {t({ en: 'Back to List', ar: 'العودة للقائمة' })}
            </Button>
          </div>
          <ScalingExecutionDashboard scalingPlanId={selectedPlanId} />
        </div>
      )}

      {!selectedPlanId && scalingPlansData.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">
            {t({ en: 'Active Scaling Plans', ar: 'خطط التوسع النشطة' })}
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {scalingPlansData.map((plan) => (
              <Card key={plan.id} className="border-l-4 border-l-purple-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{isRTL ? plan.title_ar : plan.title_en}</h3>
                      <p className="text-sm text-slate-600">
                        {plan.target_municipalities?.length || 0} municipalities • {plan.estimated_timeline_months} months
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!plan.budget_approved && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedPlanId(plan.id);
                            setShowBudgetGate(true);
                          }}
                          className="gap-2"
                        >
                          <DollarSign className="h-4 w-4" />
                          {t({ en: 'Budget Gate', ar: 'بوابة الميزانية' })}
                        </Button>
                      )}
                      {plan.budget_approved && plan.rollout_progress >= 80 && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedPlanId(plan.id);
                            setShowIntegrationGate(true);
                          }}
                          className="gap-2 bg-blue-600"
                        >
                          <Shield className="h-4 w-4" />
                          {t({ en: 'Integration Gate', ar: 'بوابة التكامل' })}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedPlanId(plan.id)}
                      >
                        {t({ en: 'View Dashboard', ar: 'عرض لوحة التحكم' })}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {!selectedPlanId && scaledPilots.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">
            {t({ en: 'Scaled Solutions - Legacy View', ar: 'الحلول الموسعة - عرض قديم' })}
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {scaledPilots.map((pilot) => (
              <Card key={pilot.id} className="border-l-4 border-l-teal-500">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-teal-100 text-teal-700">SCALED</Badge>
                          <Badge variant="outline">{pilot.code}</Badge>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                          {language === 'ar' && pilot.title_ar ? pilot.title_ar : pilot.title_en}
                        </h3>
                        <p className="text-sm text-slate-600">{pilot.sector?.replace(/_/g, ' ')}</p>
                      </div>
                      <Link to={createPageUrl(`PilotDetail?id=${pilot.id}`)}>
                        <Button variant="outline">{t({ en: 'View Details', ar: 'عرض التفاصيل' })}</Button>
                      </Link>
                    </div>

                    {pilot.scaling_plan && (
                      <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                        <p className="text-sm font-medium text-teal-900 mb-2">{t({ en: 'Scaling Execution', ar: 'تنفيذ التوسع' })}</p>
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div>
                            <span className="text-slate-600">Target Locations:</span>
                            <p className="font-medium">{pilot.scaling_plan.target_locations?.length || 0}</p>
                          </div>
                          <div>
                            <span className="text-slate-600">Timeline:</span>
                            <p className="font-medium">{pilot.scaling_plan.timeline || 'TBD'}</p>
                          </div>
                          <div>
                            <span className="text-slate-600">Budget:</span>
                            <p className="font-medium">{pilot.scaling_plan.estimated_cost ? `${(pilot.scaling_plan.estimated_cost / 1000).toFixed(0)}K` : 'TBD'}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-4 gap-2">
                      <div className="text-center p-3 bg-slate-50 rounded">
                        <p className="text-2xl font-bold text-blue-600">0</p>
                        <p className="text-xs text-slate-500">Deployed</p>
                      </div>
                      <div className="text-center p-3 bg-slate-50 rounded">
                        <p className="text-2xl font-bold text-green-600">
                          {pilot.scaling_plan?.target_locations?.length || 0}
                        </p>
                        <p className="text-xs text-slate-500">Target</p>
                      </div>
                      <div className="text-center p-3 bg-slate-50 rounded">
                        <p className="text-2xl font-bold text-purple-600">0%</p>
                        <p className="text-xs text-slate-500">Progress</p>
                      </div>
                      <div className="text-center p-3 bg-slate-50 rounded">
                        <p className="text-2xl font-bold text-teal-600">{pilot.success_probability || 'N/A'}%</p>
                        <p className="text-xs text-slate-500">Success</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProtectedPage(ScalingWorkflow, {
  requiredPermissions: ['pilot_scale_approve']
});
