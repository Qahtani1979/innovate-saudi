import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { Activity, AlertTriangle, TrendingUp, Zap, Target, Loader2, Sparkles, Users } from 'lucide-react';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import ProtectedPage from '../components/permissions/ProtectedPage';

function PipelineHealthDashboardPage() {
  const { language, isRTL, t } = useLanguage();
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const { invokeAI, status, isLoading: loading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges-pipeline'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots-pipeline'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const { data: solutions = [] } = useQuery({
    queryKey: ['solutions-pipeline'],
    queryFn: () => base44.entities.Solution.list()
  });

  const { data: expertAssignments = [] } = useQuery({
    queryKey: ['expert-assignments-pipeline'],
    queryFn: () => base44.entities.ExpertAssignment.list()
  });

  const { data: expertProfiles = [] } = useQuery({
    queryKey: ['experts-pipeline'],
    queryFn: () => base44.entities.ExpertProfile.list()
  });

  const stages = {
    discovery: challenges.filter(c => c.status === 'draft' || c.status === 'submitted').length,
    validation: challenges.filter(c => c.status === 'under_review').length,
    approved: challenges.filter(c => c.status === 'approved').length,
    in_treatment: challenges.filter(c => c.status === 'in_treatment').length,
    pilot_design: pilots.filter(p => p.stage === 'design').length,
    pilot_active: pilots.filter(p => p.stage === 'active').length,
    pilot_eval: pilots.filter(p => p.stage === 'evaluation').length,
    scaled: pilots.filter(p => p.stage === 'scaled').length
  };

  const conversionRate = challenges.length > 0 
    ? Math.round((challenges.filter(c => c.linked_pilot_ids?.length > 0).length / challenges.length) * 100) 
    : 0;

  const scalingRate = pilots.length > 0
    ? Math.round((pilots.filter(p => p.stage === 'scaled').length / pilots.length) * 100)
    : 0;

  const activeExperts = expertProfiles.filter(e => e.is_active).length;
  const expertUtilization = activeExperts > 0 
    ? Math.round((expertAssignments.filter(a => ['in_progress', 'accepted'].includes(a.status)).length / activeExperts) * 100)
    : 0;
  const expertCapacityIssue = expertUtilization > 80 || expertAssignments.filter(a => a.status === 'pending').length > 15;

  const bottlenecks = [
    { stage: 'Validation', count: stages.validation, threshold: 10 },
    { stage: 'Pilot Design', count: stages.pilot_design, threshold: 5 },
    { stage: 'Evaluation', count: stages.pilot_eval, threshold: 8 },
    ...(expertCapacityIssue ? [{ stage: 'Expert Capacity', count: expertUtilization, threshold: 80 }] : [])
  ].filter(b => b.count > b.threshold);

  const pipelineData = [
    { stage: 'Discovery', count: stages.discovery },
    { stage: 'Validation', count: stages.validation },
    { stage: 'Approved', count: stages.approved },
    { stage: 'Treatment', count: stages.in_treatment },
    { stage: 'Pilot Design', count: stages.pilot_design },
    { stage: 'Active', count: stages.pilot_active },
    { stage: 'Evaluation', count: stages.pilot_eval },
    { stage: 'Scaled', count: stages.scaled }
  ];

  const generateAIAnalysis = async () => {
    const result = await invokeAI({
      prompt: `Analyze this innovation pipeline health and provide recommendations:

Pipeline stages: ${JSON.stringify(stages)}
Conversion rate (Challenge→Pilot): ${conversionRate}%
Scaling rate (Pilot→Scaled): ${scalingRate}%
Total solutions: ${solutions.length}

Provide:
1. Overall pipeline health score (0-100)
2. Top 3 bottlenecks identified
3. Recommended actions to improve flow
4. Risk areas requiring attention`,
      response_json_schema: {
        type: 'object',
        properties: {
          health_score: { type: 'number' },
          bottlenecks: { type: 'array', items: { type: 'string' } },
          recommendations: { type: 'array', items: { type: 'string' } },
          risks: { type: 'array', items: { type: 'string' } }
        }
      }
    });
    
    if (result.success) {
      setAiAnalysis(result.data);
    }
  };

  const healthScore = aiAnalysis?.health_score || (conversionRate + scalingRate) / 2;

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            {t({ en: 'Pipeline Health Dashboard', ar: 'لوحة صحة خط الابتكار' })}
          </h1>
          <p className="text-slate-600 mt-2">
            {t({ en: 'Monitor innovation pipeline flow and bottlenecks', ar: 'مراقبة تدفق خط الابتكار والاختناقات' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
          <Button onClick={generateAIAnalysis} disabled={loading || !isAvailable} className="bg-purple-600">
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {t({ en: 'AI Analysis', ar: 'تحليل ذكي' })}
          </Button>
        </div>
      </div>

      {/* Health Score */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={`border-2 ${healthScore >= 70 ? 'border-green-300 bg-green-50' : healthScore >= 50 ? 'border-yellow-300 bg-yellow-50' : 'border-red-300 bg-red-50'}`}>
          <CardContent className="pt-6 text-center">
            <Activity className={`h-8 w-8 mx-auto mb-2 ${healthScore >= 70 ? 'text-green-600' : healthScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`} />
            <p className={`text-4xl font-bold ${healthScore >= 70 ? 'text-green-600' : healthScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
              {Math.round(healthScore)}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Pipeline Health', ar: 'صحة الخط' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-4xl font-bold text-blue-600">{conversionRate}%</p>
            <p className="text-sm text-slate-600">{t({ en: 'Challenge→Pilot', ar: 'تحدي→تجربة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-4xl font-bold text-purple-600">{scalingRate}%</p>
            <p className="text-sm text-slate-600">{t({ en: 'Pilot→Scaled', ar: 'تجربة→توسع' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6 text-center">
            <Zap className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-4xl font-bold text-amber-600">
              {Math.round((stages.pilot_active + stages.in_treatment) / (challenges.length + pilots.length) * 100)}%
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Active Rate', ar: 'معدل النشاط' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Analysis */}
      {aiAnalysis && (
        <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Sparkles className="h-5 w-5" />
              {t({ en: 'AI Pipeline Analysis', ar: 'تحليل الخط الذكي' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-semibold text-slate-900 mb-2">{t({ en: 'Bottlenecks', ar: 'الاختناقات' })}</h4>
              <ul className="space-y-1 text-sm">
                {aiAnalysis.bottlenecks?.map((b, i) => (
                  <li key={i} className="text-slate-700">• {b}</li>
                ))}
              </ul>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-semibold text-slate-900 mb-2">{t({ en: 'Recommendations', ar: 'التوصيات' })}</h4>
              <ul className="space-y-1 text-sm">
                {aiAnalysis.recommendations?.map((r, i) => (
                  <li key={i} className="text-green-700">• {r}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expert Capacity Status */}
      <Card className={`border-2 ${expertCapacityIssue ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            {t({ en: 'Expert Capacity', ar: 'سعة الخبراء' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{activeExperts}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Active Experts', ar: 'خبراء نشطون' })}</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <p className={`text-2xl font-bold ${expertUtilization > 80 ? 'text-red-600' : 'text-green-600'}`}>
                {expertUtilization}%
              </p>
              <p className="text-xs text-slate-600">{t({ en: 'Utilization', ar: 'الاستخدام' })}</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {expertAssignments.filter(a => a.status === 'pending').length}
              </p>
              <p className="text-xs text-slate-600">{t({ en: 'Queue', ar: 'الطابور' })}</p>
            </div>
          </div>
          {expertCapacityIssue && (
            <div className="mt-3 p-3 bg-white rounded border border-red-200">
              <p className="text-sm font-semibold text-red-700">
                ⚠️ {t({ en: 'Expert capacity bottleneck detected', ar: 'تم اكتشاف اختناق في سعة الخبراء' })}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                {t({ en: 'Consider recruiting more experts or redistributing workload', ar: 'فكر في توظيف المزيد من الخبراء أو إعادة توزيع عبء العمل' })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottlenecks Alert */}
      {bottlenecks.length > 0 && (
        <Card className="border-2 border-red-300 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              {t({ en: 'Bottlenecks Detected', ar: 'تم اكتشاف اختناقات' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {bottlenecks.map((b, i) => (
              <div key={i} className="p-3 bg-white rounded-lg border border-red-200">
                <p className="font-medium text-slate-900">{b.stage}</p>
                <p className="text-sm text-slate-600">
                  {b.count} items (threshold: {b.threshold}) - {t({ en: 'Action required', ar: 'مطلوب إجراء' })}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Pipeline Flow Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Pipeline Flow', ar: 'تدفق الخط' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pipelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Stage Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-blue-600">{stages.discovery + stages.validation}</p>
            <p className="text-sm text-slate-600">{t({ en: 'In Discovery', ar: 'في الاكتشاف' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-green-600">{stages.approved + stages.in_treatment}</p>
            <p className="text-sm text-slate-600">{t({ en: 'In Treatment', ar: 'في المعالجة' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-purple-600">{stages.pilot_design + stages.pilot_active + stages.pilot_eval}</p>
            <p className="text-sm text-slate-600">{t({ en: 'In Pilot', ar: 'في التجربة' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-amber-600">{stages.scaled}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Scaled', ar: 'موسّع' })}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ProtectedPage(PipelineHealthDashboardPage, { requiredPermissions: [] });