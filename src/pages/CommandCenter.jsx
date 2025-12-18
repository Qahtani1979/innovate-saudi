import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { 
  Target, AlertTriangle, CheckCircle2, Clock, Users, 
  TrendingUp, Activity, Zap, Shield, Sparkles, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { PageLayout, PageHeader, PersonaButton } from '@/components/layout/PersonaPageLayout';
import { COMMAND_CENTER_PROMPT_TEMPLATE, COMMAND_CENTER_SCHEMA } from '@/lib/ai/prompts/command/strategicRecommendations';

function CommandCenterPage() {
  const { language, isRTL, t } = useLanguage();
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const { invokeAI, status: aiStatus, isLoading: aiLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges-command'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots-command'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['programs-command'],
    queryFn: () => base44.entities.Program.list()
  });

  const { data: expertProfiles = [] } = useQuery({
    queryKey: ['experts-command'],
    queryFn: () => base44.entities.ExpertProfile.list()
  });

  const { data: expertAssignments = [] } = useQuery({
    queryKey: ['assignments-command'],
    queryFn: () => base44.entities.ExpertAssignment.list()
  });

  const criticalItems = [
    ...challenges.filter(c => c.priority === 'tier_1' && c.status === 'under_review'),
    ...pilots.filter(p => p.risk_level === 'high' && ['active', 'monitoring'].includes(p.stage))
  ];

  const pendingApprovals = [
    ...challenges.filter(c => c.status === 'submitted'),
    ...pilots.filter(p => p.stage === 'approval_pending')
  ];

  const activeOperations = pilots.filter(p => ['active', 'monitoring'].includes(p.stage));
  
  const activeExperts = expertProfiles.filter(e => e.is_active).length;
  const availableExperts = expertProfiles.filter(e => 
    e.is_active && 
    (expertAssignments.filter(a => a.expert_email === e.user_email && ['pending', 'in_progress'].includes(a.status)).length < 3)
  ).length;
  const expertCapacityRate = activeExperts > 0 ? Math.round((availableExperts / activeExperts) * 100) : 0;

  const generateAIRecommendations = async () => {
    const result = await invokeAI({
      prompt: COMMAND_CENTER_PROMPT_TEMPLATE({
        criticalChallenges: challenges.filter(c => c.priority === 'tier_1').length,
        highRiskPilots: pilots.filter(p => p.risk_level === 'high').length,
        activeOperations: activeOperations.length,
        pendingApprovals: pendingApprovals.length
      }),
      response_json_schema: COMMAND_CENTER_SCHEMA
    });
    if (result.success) {
      setAiRecommendations(result.data);
    }
  };

  return (
    <PageLayout>
      <PageHeader
        icon={Shield}
        title={{ en: 'Command Center', ar: 'مركز القيادة' }}
        description={{ en: 'Mission control for national innovation pipeline', ar: 'مركز التحكم لخط الابتكار الوطني' }}
        stats={[
          { icon: Target, value: challenges.length, label: { en: 'Challenges', ar: 'تحديات' } },
          { icon: Activity, value: activeOperations.length, label: { en: 'Active Pilots', ar: 'تجارب نشطة' } },
          { icon: Clock, value: pendingApprovals.length, label: { en: 'Pending', ar: 'معلق' } },
          { icon: AlertTriangle, value: criticalItems.length, label: { en: 'Critical', ar: 'حرج' } }
        ]}
        action={
          <PersonaButton onClick={generateAIRecommendations} disabled={aiLoading || !isAvailable}>
            {aiLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {t({ en: 'AI Strategy', ar: 'استراتيجية ذكية' })}
          </PersonaButton>
        }
      />

      <AIStatusIndicator status={aiStatus} rateLimitInfo={rateLimitInfo} />

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{challenges.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Total Challenges', ar: 'إجمالي التحديات' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <Activity className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{activeOperations.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Active Pilots', ar: 'تجارب نشطة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white border-2 border-amber-300">
          <CardContent className="pt-6 text-center">
            <Clock className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">{pendingApprovals.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Pending Approvals', ar: 'موافقات معلقة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-white border-2 border-red-300">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-red-600">{criticalItems.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Critical Items', ar: 'عناصر حرجة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{pilots.filter(p => p.stage === 'scaled').length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Scaled Solutions', ar: 'حلول موسعة' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Expert Resource Planning */}
      <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Users className="h-5 w-5" />
            {t({ en: 'Expert Resource Planning', ar: 'تخطيط موارد الخبراء' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-white rounded-lg border">
              <p className="text-3xl font-bold text-purple-600">{activeExperts}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Total Active', ar: 'إجمالي النشطين' })}</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <p className={`text-3xl font-bold ${expertCapacityRate > 50 ? 'text-green-600' : 'text-red-600'}`}>
                {expertCapacityRate}%
              </p>
              <p className="text-xs text-slate-600">{t({ en: 'Available', ar: 'متاح' })}</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <p className="text-3xl font-bold text-blue-600">
                {expertAssignments.filter(a => a.status === 'in_progress').length}
              </p>
              <p className="text-xs text-slate-600">{t({ en: 'In Progress', ar: 'قيد التنفيذ' })}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm p-2 bg-white rounded">
              <span className="text-slate-600">{t({ en: 'Expert Utilization:', ar: 'استخدام الخبراء:' })}</span>
              <span className="font-medium">{100 - expertCapacityRate}%</span>
            </div>
            <div className="flex justify-between text-sm p-2 bg-white rounded">
              <span className="text-slate-600">{t({ en: 'Avg Assignments/Expert:', ar: 'متوسط المهام/خبير:' })}</span>
              <span className="font-medium">
                {activeExperts > 0 ? (expertAssignments.filter(a => a.status !== 'completed').length / activeExperts).toFixed(1) : 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      {aiRecommendations && (
        <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Sparkles className="h-5 w-5" />
              {t({ en: 'AI Strategic Recommendations', ar: 'التوصيات الاستراتيجية الذكية' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                {t({ en: 'Priority Actions', ar: 'الإجراءات ذات الأولوية' })}
              </h4>
              <ul className="space-y-1 text-sm">
                {aiRecommendations.priority_actions?.map((action, i) => (
                  <li key={i} className="text-slate-700">• {action}</li>
                ))}
              </ul>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                {t({ en: 'Resource Allocation', ar: 'توزيع الموارد' })}
              </h4>
              <ul className="space-y-1 text-sm">
                {aiRecommendations.resource_recommendations?.map((rec, i) => (
                  <li key={i} className="text-slate-700">• {rec}</li>
                ))}
              </ul>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-red-600" />
                {t({ en: 'Risk Priorities', ar: 'أولويات المخاطر' })}
              </h4>
              <ul className="space-y-1 text-sm">
                {aiRecommendations.risk_priorities?.map((risk, i) => (
                  <li key={i} className="text-slate-700">• {risk}</li>
                ))}
              </ul>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                {t({ en: 'Opportunities', ar: 'الفرص' })}
              </h4>
              <ul className="space-y-1 text-sm">
                {aiRecommendations.opportunities?.map((opp, i) => (
                  <li key={i} className="text-slate-700">• {opp}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Critical Items */}
      {criticalItems.length > 0 && (
        <Card className="border-2 border-red-300 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              {t({ en: 'Critical Items Requiring Attention', ar: 'عناصر حرجة تحتاج اهتمام' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {criticalItems.slice(0, 5).map((item) => (
                <div key={item.id} className="p-3 bg-white rounded-lg border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge variant="outline" className="mb-1">
                        {item.challenge_id ? 'Challenge' : 'Pilot'}
                      </Badge>
                      <p className="font-medium text-slate-900">
                        {item.title_en || item.title_ar || item.name_en}
                      </p>
                      <p className="text-sm text-slate-600">
                        {item.priority || item.risk_level} - {item.status || item.stage}
                      </p>
                    </div>
                    <Link to={createPageUrl(item.challenge_id ? `ChallengeDetail?id=${item.id}` : `PilotDetail?id=${item.id}`)}>
                      <Button size="sm" variant="outline">{t({ en: 'View', ar: 'عرض' })}</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Approvals */}
      {pendingApprovals.length > 0 && (
        <Card className="border-2 border-amber-300 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <Clock className="h-5 w-5" />
              {t({ en: 'Pending Approvals', ar: 'الموافقات المعلقة' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingApprovals.slice(0, 5).map((item) => (
                <div key={item.id} className="p-3 bg-white rounded-lg border border-amber-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">
                        {item.title_en || item.title_ar || item.name_en}
                      </p>
                      <p className="text-sm text-slate-600">
                        {t({ en: 'Submitted', ar: 'مقدم' })}: {new Date(item.created_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Button size="sm">{t({ en: 'Review', ar: 'مراجعة' })}</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to={createPageUrl('PipelineHealthDashboard')}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6 text-center">
              <Activity className="h-12 w-12 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-900">
                {t({ en: 'Pipeline Health', ar: 'صحة الخط' })}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                {t({ en: 'Monitor flow and bottlenecks', ar: 'مراقبة التدفق والاختناقات' })}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to={createPageUrl('VelocityAnalytics')}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6 text-center">
              <Zap className="h-12 w-12 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-900">
                {t({ en: 'Velocity Metrics', ar: 'مقاييس السرعة' })}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                {t({ en: 'Track throughput and speed', ar: 'تتبع الإنتاجية والسرعة' })}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to={createPageUrl('Approvals')}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-900">
                {t({ en: 'Approvals Queue', ar: 'قائمة الموافقات' })}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                {t({ en: 'Process pending decisions', ar: 'معالجة القرارات المعلقة' })}
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </PageLayout>
  );
}

export default ProtectedPage(CommandCenterPage, { requireAdmin: true });