import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '../components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';
import {
  Shield,
  Edit,
  Trash2,
  ArrowLeft,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  Network,
  Target,
  TrendingUp,
  Users,
  Sparkles,
  Loader2,
  GitBranch,
  Activity
} from 'lucide-react';
import PolicyImplementationTracker from '../components/policy/PolicyImplementationTracker';
import PolicyActivityLog from '../components/policy/PolicyActivityLog';
import UnifiedWorkflowApprovalTab from '../components/approval/UnifiedWorkflowApprovalTab';
import PolicyAmendmentWizard from '../components/policy/PolicyAmendmentWizard';
import PolicyCommentThread from '../components/policy/PolicyCommentThread';
import PolicyRelatedPolicies from '../components/policy/PolicyRelatedPolicies';
import PolicyConflictDetector from '../components/policy/PolicyConflictDetector';
import PolicyAdoptionMap from '../components/policy/PolicyAdoptionMap';
import PolicyImpactMetrics from '../components/policy/PolicyImpactMetrics';
import PolicyExecutiveSummaryGenerator from '../components/policy/PolicyExecutiveSummaryGenerator';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { usePolicies } from '@/hooks/usePolicies';
import { useMatchingEntities } from '@/hooks/useMatchingEntities';
import { usePolicyMutations } from '@/hooks/usePolicyMutations';
import { PageLayout } from '@/components/layout/PersonaPageLayout';

export default function PolicyDetail() {
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [showAmendmentWizard, setShowAmendmentWizard] = useState(false);
  const { user } = useAuth();

  const { invokeAI, status: aiStatus, isLoading: isAnalyzing, isAvailable, rateLimitInfo } = useAIWithFallback();
  const urlParams = new URLSearchParams(window.location.search);
  const policyId = urlParams.get('id');
  const { language, isRTL, t } = useLanguage();
  const navigate = useNavigate();

  const { usePolicy } = usePolicies();
  const { data: policy, isLoading } = usePolicy(policyId);

  const { useChallenges, usePilots } = useMatchingEntities();
  const { data: challenges = [] } = useChallenges();
  const { data: pilots = [] } = usePilots();

  // Derived data finding instead of new queries
  const challenge = policy?.challenge_id ? challenges.find(c => c.id === policy.challenge_id) : null;
  const pilot = policy?.pilot_id ? pilots.find(p => p.id === policy.pilot_id) : null;

  const { deletePolicy } = usePolicyMutations();

  const handleDelete = async () => {
    if (confirm(t({ en: 'Delete this policy?', ar: 'حذف هذه السياسة؟' }))) {
      try {
        await deletePolicy.mutateAsync(policyId);
        toast.success(t({ en: 'Policy deleted successfully', ar: 'تم حذف السياسة بنجاح' }));
        navigate(createPageUrl('PolicyHub'));
      } catch (error) {
        console.error('Failed to delete policy:', error);
        toast.error(t({ en: 'Failed to delete policy', ar: 'فشل حذف السياسة' }));
      }
    }
  };

  const generateAIAnalysis = async () => {
    if (!policy) return;

    const { POLICY_ANALYSIS_DETAIL_PROMPT_TEMPLATE } = await import('@/lib/ai/prompts/policy/analysis');
    const promptConfig = POLICY_ANALYSIS_DETAIL_PROMPT_TEMPLATE(policy);

    const result = await invokeAI({
      prompt: promptConfig.prompt,
      system_prompt: promptConfig.system,
      response_json_schema: promptConfig.schema
    });

    if (result.success && result.data) {
      setAiAnalysis(result.data);
      toast.success(t({ en: 'Analysis complete', ar: 'اكتمل التحليل' }));
    }
  };

  if (isLoading || !policy) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  const statusColors = {
    draft: 'bg-slate-100 text-slate-700',
    under_review: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-blue-100 text-blue-700',
    implemented: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700'
  };

  return (
    <PageLayout>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl('PolicyHub')}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t({ en: 'Back', ar: 'رجوع' })}
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              {policy.code && (
                <Badge variant="outline" className="font-mono">{policy.code}</Badge>
              )}
              <Badge className={statusColors[policy.status]}>
                {policy.status?.replace(/_/g, ' ')}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">
              {language === 'ar' && policy.title_ar ? policy.title_ar : policy.title_en}
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAmendmentWizard(!showAmendmentWizard)} variant="outline" className="gap-2">
            <GitBranch className="h-4 w-4" />
            {t({ en: 'Amend', ar: 'تعديل' })}
          </Button>
          <Link to={createPageUrl(`PolicyEdit?id=${policyId}`)}>
            <Button className="gap-2">
              <Edit className="h-4 w-4" />
              {t({ en: 'Edit', ar: 'تعديل' })}
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600 p-8 text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-white/80 text-sm mb-2">
              {policy.submitted_by} • {new Date(policy.submission_date || policy.created_date).toLocaleDateString()}
            </p>
            <h2 className="text-2xl font-bold mb-4">
              {language === 'ar' && policy.title_ar ? policy.title_ar : policy.title_en}
            </h2>
            <div className="flex gap-2">
              {policy.priority_level && (
                <Badge className="bg-white/20 border-white/40">
                  {policy.priority_level} priority
                </Badge>
              )}
              {policy.regulatory_change_needed && (
                <Badge className="bg-orange-500 text-white">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Regulatory Change
                </Badge>
              )}
            </div>
          </div>
          {policy.impact_score && (
            <div className="text-center bg-white/20 rounded-lg p-4">
              <p className="text-4xl font-bold">{policy.impact_score}</p>
              <p className="text-xs text-white/80">{t({ en: 'Impact', ar: 'التأثير' })}</p>
            </div>
          )}
        </div>
      </div>

      {/* Linked Entity */}
      {(challenge || pilot) && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Network className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-semibold text-blue-900">
                {t({ en: 'Linked to', ar: 'مرتبط بـ' })}
              </p>
            </div>
            {challenge && (
              <Link to={createPageUrl(`ChallengeDetail?id=${challenge.id}`)} className="hover:underline">
                <p className="text-sm font-medium text-blue-700">
                  {t({ en: 'Challenge', ar: 'تحدي' })}: {challenge.code} - {challenge.title_en}
                </p>
              </Link>
            )}
            {pilot && (
              <Link to={createPageUrl(`PilotDetail?id=${pilot.id}`)} className="hover:underline">
                <p className="text-sm font-medium text-blue-700">
                  {t({ en: 'Pilot', ar: 'تجربة' })}: {pilot.code} - {pilot.title_en}
                </p>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* Amendment Wizard */}
      {showAmendmentWizard && (
        <PolicyAmendmentWizard policy={policy} onClose={() => setShowAmendmentWizard(false)} />
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="recommendation">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="recommendation">
                <FileText className="h-4 w-4 mr-2" />
                {t({ en: 'Details', ar: 'التفاصيل' })}
              </TabsTrigger>
              <TabsTrigger value="workflow">
                <Shield className="h-4 w-4 mr-2" />
                {t({ en: 'Workflow & Approvals', ar: 'سير العمل والموافقات' })}
              </TabsTrigger>
              <TabsTrigger value="implementation">
                <CheckCircle className="h-4 w-4 mr-2" />
                {t({ en: 'Implementation', ar: 'التنفيذ' })}
              </TabsTrigger>
              <TabsTrigger value="amendments">
                <GitBranch className="h-4 w-4 mr-2" />
                {t({ en: 'Amendments', ar: 'التعديلات' })}
              </TabsTrigger>
              <TabsTrigger value="analysis">
                <Sparkles className="h-4 w-4 mr-2" />
                {t({ en: 'Analysis', ar: 'تحليل' })}
              </TabsTrigger>
              <TabsTrigger value="activity">
                <Activity className="h-4 w-4 mr-2" />
                {t({ en: 'Activity', ar: 'النشاط' })}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="workflow" className="space-y-4">
              <UnifiedWorkflowApprovalTab
                entityType="policy_recommendation"
                entityId={policyId}
                entityData={policy}
                currentUser={user}
              />
            </TabsContent>

            <TabsContent value="implementation" className="space-y-4">
              <PolicyImpactMetrics policy={policy} />
              <PolicyImplementationTracker policy={policy} />

              {policy.implementation_steps?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Implementation Steps', ar: 'خطوات التنفيذ' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {policy.implementation_steps.map((step, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                            {i + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-slate-700">
                              {language === 'ar' && step.ar ? step.ar : step.en}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {policy.success_metrics?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-green-600" />
                      {t({ en: 'Success Metrics', ar: 'مقاييس النجاح' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {policy.success_metrics.map((m, i) => (
                        <div key={i} className="p-3 bg-green-50 rounded border">
                          <p className="text-sm font-medium text-slate-900">
                            {language === 'ar' && m.metric_ar ? m.metric_ar : m.metric_en || m}
                          </p>
                          {m.target && (
                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                              <span>{t({ en: 'Target:', ar: 'الهدف:' })}</span>
                              <Badge variant="outline">{m.target} {m.unit || ''}</Badge>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <PolicyActivityLog policyId={policy.id} />
            </TabsContent>

            <TabsContent value="amendments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5 text-blue-600" />
                    {t({ en: 'Amendment History', ar: 'سجل التعديلات' })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {policy.amendment_history && policy.amendment_history.length > 0 ? (
                    <div className="space-y-3">
                      {policy.amendment_history.map((amendment, idx) => (
                        <div key={idx} className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Badge className="bg-blue-600 text-white">
                              Version {amendment.version}
                            </Badge>
                            <span className="text-xs text-slate-600">
                              {new Date(amendment.amendment_date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-slate-900 mb-2 font-medium">
                            {language === 'ar' && amendment.summary_ar ? amendment.summary_ar : amendment.summary_en}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <Users className="h-3 w-3" />
                            <span>{amendment.amended_by}</span>
                            {amendment.previous_policy_id && (
                              <Link
                                to={createPageUrl(`PolicyDetail?id=${amendment.previous_policy_id}`)}
                                className="ml-auto text-blue-600 hover:underline flex items-center gap-1"
                              >
                                {t({ en: 'View previous version', ar: 'عرض النسخة السابقة' })}
                                <ArrowLeft className="h-3 w-3" />
                              </Link>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <GitBranch className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 text-sm">
                        {t({ en: 'No amendments yet - this is version 1', ar: 'لا تعديلات بعد - هذا الإصدار 1' })}
                      </p>
                      <p className="text-xs text-slate-400 mt-2">
                        {t({ en: 'Amendment history will appear here when policy is amended', ar: 'سيظهر سجل التعديلات هنا عند تعديل السياسة' })}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recommendation" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Policy Recommendation', ar: 'التوصية السياسية' })}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-lg border-2 border-blue-200" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-slate-600">
                        {language === 'ar' ? 'عربي (الأصل)' : 'English (Auto-translated)'}
                      </p>
                      <Badge className={language === 'ar' ? 'bg-green-100 text-green-700 text-xs' : 'bg-blue-100 text-blue-700 text-xs'}>
                        {language === 'ar' ? (
                          'Official'
                        ) : (
                          <span className="flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            Auto-translated
                          </span>
                        )}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {language === 'ar' && policy.recommendation_text_ar
                        ? policy.recommendation_text_ar
                        : policy.recommendation_text_en || policy.recommendation_text}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {policy.regulatory_framework && (
                <Card className="bg-amber-50 border-amber-200">
                  <CardContent className="pt-4">
                    <p className="text-xs font-semibold text-amber-900 mb-2">
                      {t({ en: 'Regulatory Framework', ar: 'الإطار التنظيمي' })}
                    </p>
                    <p className="text-sm text-slate-700">{policy.regulatory_framework}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <div className="flex justify-end mb-4">
                <Button
                  onClick={generateAIAnalysis}
                  disabled={isAnalyzing}
                  className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  {isAnalyzing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {t({ en: 'Generate AI Analysis', ar: 'إنشاء تحليل ذكي' })}
                </Button>
              </div>

              {aiAnalysis ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                        {t({ en: 'Strategic Assessment', ar: 'التقييم الاستراتيجي' })}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <p className="text-xs text-slate-600 mb-1">{t({ en: 'Complexity', ar: 'التعقيد' })}</p>
                          <Badge className={
                            aiAnalysis.complexity === 'high' ? 'bg-red-100 text-red-700' :
                              aiAnalysis.complexity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                          }>
                            {aiAnalysis.complexity}
                          </Badge>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-xs text-slate-600 mb-1">{t({ en: 'Success Probability', ar: 'احتمال النجاح' })}</p>
                          <p className="text-2xl font-bold text-green-600">{aiAnalysis.success_probability}%</p>
                        </div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-700">
                          {typeof aiAnalysis.complexity_reason === 'object'
                            ? t(aiAnalysis.complexity_reason)
                            : aiAnalysis.complexity_reason}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {aiAnalysis.barriers?.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-red-600" />
                          {t({ en: 'Potential Barriers', ar: 'العوائق المحتملة' })}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {aiAnalysis.barriers.map((b, i) => (
                            <div key={i} className="p-3 border-l-4 border-red-500 bg-red-50 rounded-r-lg">
                              <Badge variant="outline" className="text-xs mb-1">
                                {typeof b.type === 'object' ? t(b.type) : b.type}
                              </Badge>
                              <p className="text-sm text-slate-700">
                                {typeof b.description === 'object' ? t(b.description) : b.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {aiAnalysis.international_precedents?.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Network className="h-5 w-5 text-blue-600" />
                          {t({ en: 'International Precedents', ar: 'السوابق الدولية' })}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {aiAnalysis.international_precedents.map((p, i) => (
                            <div key={i} className="p-3 bg-blue-50 rounded-lg border">
                              <p className="text-xs text-blue-600 mb-1">
                                {typeof p.city === 'object' ? t(p.city) : p.city}, {typeof p.country === 'object' ? t(p.country) : p.country}
                              </p>
                              <p className="text-sm text-slate-700">
                                {typeof p.outcome === 'object' ? t(p.outcome) : p.outcome}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Sparkles className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">
                      {t({ en: 'Click to generate AI analysis', ar: 'اضغط لإنشاء تحليل ذكي' })}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>


          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <PolicyExecutiveSummaryGenerator policy={policy} />
          <PolicyRelatedPolicies policy={policy} />
          <PolicyConflictDetector policy={policy} />
          <PolicyAdoptionMap policy={policy} />
          <PolicyCommentThread policyId={policy.id} />
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t({ en: 'Quick Info', ar: 'معلومات سريعة' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Priority', ar: 'الأولوية' })}</p>
                <Badge>{policy.priority_level}</Badge>
              </div>
              {policy.timeline_months && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">{t({ en: 'Timeline', ar: 'المدة' })}</p>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-slate-600" />
                    <p className="font-medium">{policy.timeline_months} months</p>
                  </div>
                </div>
              )}
              {policy.impact_score && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">{t({ en: 'Impact Score', ar: 'نقاط التأثير' })}</p>
                  <p className="text-2xl font-bold text-purple-600">{policy.impact_score}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Created', ar: 'تاريخ الإنشاء' })}</p>
                <p>{new Date(policy.created_date).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}