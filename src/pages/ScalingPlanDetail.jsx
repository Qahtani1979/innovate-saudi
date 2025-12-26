import { useScalingPlan, useScalingExpertSignOffs } from '@/hooks/useScalingPlans';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { TrendingUp, MapPin, Target, Award, Users, FileText, Activity, Loader2 } from 'lucide-react';
import ScalingExecutionDashboard from '../components/scaling/ScalingExecutionDashboard';
import StrategicAlignmentWidget from '../components/strategy/StrategicAlignmentWidget';
import ProtectedPage from '../components/permissions/ProtectedPage';

/**
 * ScalingPlanDetail
 * ✅ GOLD STANDARD COMPLIANT
 */
function ScalingPlanDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const planId = urlParams.get('id');
  const { language, isRTL, t } = useLanguage();

  const { data: scalingPlan, isLoading } = useScalingPlan(planId);
  const { data: expertSignOffs = [] } = useScalingExpertSignOffs(planId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!scalingPlan) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-slate-500">{t({ en: 'Scaling plan not found', ar: 'خطة التوسع غير موجودة' })}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-teal-600 via-emerald-600 to-green-600 p-8 text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Badge variant="outline" className="bg-white/20 text-white border-white/40">
                Scaling Plan
              </Badge>
              <Badge className="bg-green-100 text-green-700">
                {scalingPlan.status?.replace(/_/g, ' ')}
              </Badge>
            </div>
            <h1 className="text-5xl font-bold mb-2">
              {language === 'ar' && scalingPlan.title_ar ? scalingPlan.title_ar : (scalingPlan.title_en || scalingPlan.title)}
            </h1>
            <p className="text-xl text-white/90">
              {scalingPlan.target_municipalities?.length || 0} {t({ en: 'municipalities', ar: 'بلدية' })} • {scalingPlan.estimated_timeline_months || scalingPlan.timeline_months} {t({ en: 'months', ar: 'شهر' })}
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Municipalities', ar: 'البلديات' })}</p>
                <p className="text-3xl font-bold text-green-600">{scalingPlan.target_municipalities?.length || 0}</p>
              </div>
              <MapPin className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Progress', ar: 'التقدم' })}</p>
                <p className="text-3xl font-bold text-blue-600">{scalingPlan.rollout_progress || 0}%</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Timeline', ar: 'الجدول' })}</p>
                <p className="text-3xl font-bold text-purple-600">{scalingPlan.estimated_timeline_months || scalingPlan.timeline_months || 0}m</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Budget', ar: 'الميزانية' })}</p>
                <p className="text-2xl font-bold text-amber-600">
                  {scalingPlan.estimated_total_budget ? `${(scalingPlan.estimated_total_budget / 1000).toFixed(0)}K` :
                    scalingPlan.budget_total ? `${(scalingPlan.budget_total / 1000).toFixed(0)}K` : 'N/A'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-8 h-auto">
          <TabsTrigger value="overview" className="flex flex-col gap-1 py-3">
            <FileText className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Overview', ar: 'نظرة' })}</span>
          </TabsTrigger>
          <TabsTrigger value="strategy" className="flex flex-col gap-1 py-3">
            <Target className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Strategy', ar: 'استراتيجية' })}</span>
          </TabsTrigger>
          <TabsTrigger value="municipalities" className="flex flex-col gap-1 py-3">
            <MapPin className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Cities', ar: 'مدن' })}</span>
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex flex-col gap-1 py-3">
            <Target className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Timeline', ar: 'جدول' })}</span>
          </TabsTrigger>
          <TabsTrigger value="budget" className="flex flex-col gap-1 py-3">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Budget', ar: 'ميزانية' })}</span>
          </TabsTrigger>
          <TabsTrigger value="execution" className="flex flex-col gap-1 py-3">
            <Activity className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Execution', ar: 'تنفيذ' })}</span>
          </TabsTrigger>
          <TabsTrigger value="experts" className="flex flex-col gap-1 py-3">
            <Award className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Experts', ar: 'خبراء' })}</span>
          </TabsTrigger>
          <TabsTrigger value="impact" className="flex flex-col gap-1 py-3">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Impact', ar: 'تأثير' })}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Scaling Plan Overview', ar: 'نظرة عامة على خطة التوسع' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(scalingPlan.description_en || scalingPlan.description) && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">{t({ en: 'Description', ar: 'الوصف' })}</p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {language === 'ar' && scalingPlan.description_ar ? scalingPlan.description_ar : (scalingPlan.description_en || scalingPlan.description)}
                  </p>
                </div>
              )}
              {scalingPlan.approach && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">{t({ en: 'Scaling Approach', ar: 'نهج التوسع' })}</p>
                  <p className="text-sm text-slate-600">{scalingPlan.approach}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategy">
          <StrategicAlignmentWidget
            entityType="scaling_plan"
            entityId={planId}
            title={t({ en: 'Strategic Alignment', ar: 'التوافق الاستراتيجي' })}
          />
        </TabsContent>

        <TabsContent value="municipalities">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Target Municipalities', ar: 'البلديات المستهدفة' })}</CardTitle>
            </CardHeader>
            <CardContent>
              {scalingPlan.target_municipalities?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scalingPlan.target_municipalities.map((mun, idx) => (
                    <div key={idx} className="p-4 border rounded-lg">
                      <p className="font-medium text-slate-900">{mun}</p>
                      <Badge variant="outline" className="mt-2">Pending</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm text-center py-8">No municipalities defined</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="execution">
          <ScalingExecutionDashboard scalingPlanId={planId} />
        </TabsContent>

        <TabsContent value="experts">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  {t({ en: 'Expert Sign-Offs & Approval', ar: 'موافقات الخبراء' })}
                </CardTitle>
                <Link to={createPageUrl(`ExpertMatchingEngine?entity_type=scaling_plan&entity_id=${planId}`)} target="_blank">
                  <Button size="sm" className="bg-purple-600">
                    <Users className="h-4 w-4 mr-2" />
                    {t({ en: 'Request Expert Review', ar: 'طلب مراجعة خبير' })}
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {expertSignOffs.length > 0 ? (
                <div className="space-y-4">
                  {expertSignOffs.map((evaluation) => (
                    <div key={evaluation.id} className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium text-slate-900">{evaluation.expert_email}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(evaluation.evaluation_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-purple-600">{evaluation.overall_score}</div>
                          <Badge className={
                            evaluation.recommendation === 'approve' ? 'bg-green-100 text-green-700' :
                              evaluation.recommendation === 'reject' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                          }>
                            {evaluation.recommendation?.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2 mb-3">
                        <div className="text-center p-2 bg-white rounded">
                          <div className="text-sm font-bold text-green-600">{evaluation.feasibility_score}</div>
                          <div className="text-xs text-slate-600">{t({ en: 'Feasibility', ar: 'الجدوى' })}</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded">
                          <div className="text-sm font-bold text-blue-600">{evaluation.impact_score}</div>
                          <div className="text-xs text-slate-600">{t({ en: 'Impact', ar: 'التأثير' })}</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded">
                          <div className="text-sm font-bold text-amber-600">{evaluation.scalability_score}</div>
                          <div className="text-xs text-slate-600">{t({ en: 'Scalability', ar: 'قابلية التوسع' })}</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded">
                          <div className="text-sm font-bold text-red-600">{evaluation.risk_score}</div>
                          <div className="text-xs text-slate-600">{t({ en: 'Risk', ar: 'المخاطر' })}</div>
                        </div>
                      </div>

                      {evaluation.feedback_text && (
                        <div className="p-3 bg-white rounded border">
                          <p className="text-sm text-slate-700">{evaluation.feedback_text}</p>
                        </div>
                      )}
                    </div>
                  ))}

                  {expertSignOffs.length >= 2 && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-semibold text-blue-900 mb-2">
                        {t({ en: 'Multi-Expert Consensus', ar: 'إجماع متعدد الخبراء' })}
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">{t({ en: 'Total Reviewers:', ar: 'إجمالي المراجعين:' })}</span>
                          <span className="font-medium">{expertSignOffs.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">{t({ en: 'Approval Rate:', ar: 'معدل الموافقة:' })}</span>
                          <span className="font-medium text-green-600">
                            {(expertSignOffs.filter(e => e.recommendation === 'approve').length / expertSignOffs.length * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">{t({ en: 'Avg. Score:', ar: 'متوسط النقاط:' })}</span>
                          <span className="font-medium text-purple-600">
                            {(expertSignOffs.reduce((sum, e) => sum + (e.overall_score || 0), 0) / expertSignOffs.length).toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Award className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 mb-4">{t({ en: 'No expert sign-offs yet', ar: 'لا توجد موافقات خبراء' })}</p>
                  <Link to={createPageUrl(`ExpertMatchingEngine?entity_type=scaling_plan&entity_id=${planId}`)} target="_blank">
                    <Button className="bg-purple-600">
                      <Users className="h-4 w-4 mr-2" />
                      {t({ en: 'Request Expert Review', ar: 'طلب مراجعة خبير' })}
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="impact">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Expected Impact', ar: 'التأثير المتوقع' })}</CardTitle>
            </CardHeader>
            <CardContent>
              {scalingPlan.expected_impact ? (
                <div className="space-y-3">
                  {Object.entries(scalingPlan.expected_impact).map(([key, value]) => (
                    <div key={key} className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm font-medium capitalize">{key.replace(/_/g, ' ')}</p>
                      <p className="text-sm text-slate-600">{value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm text-center py-8">No impact data</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProtectedPage(ScalingPlanDetail, {
  requiredPermissions: ['scaling_plan_view']
});
