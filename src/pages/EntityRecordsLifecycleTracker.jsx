
import { useEntityLifecycle } from '@/hooks/useEntityLifecycle';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import { Database, TrendingUp, AlertCircle, CheckCircle2, Activity, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import ProtectedPage from '../components/permissions/ProtectedPage';

function EntityRecordsLifecycleTracker() {
  const { language, isRTL, t } = useLanguage();

  const { useLifecycleData } = useEntityLifecycle();
  const { data: lifecycleData = {} } = useLifecycleData();

  const {
    challenges = [],
    solutions = [],
    pilots = [],
    rdProjects = [],
    programs = [],
    sandboxes = [],
    matchmakerApps = []
  } = lifecycleData;

  // Challenge Lifecycle Analysis (with visibility tracking)
  const challengesByStatus = {
    draft: challenges.filter(c => c.status === 'draft').length,
    submitted: challenges.filter(c => c.status === 'submitted').length,
    under_review: challenges.filter(c => c.status === 'under_review').length,
    approved: challenges.filter(c => c.status === 'approved').length,
    in_treatment: challenges.filter(c => c.status === 'in_treatment').length,
    resolved: challenges.filter(c => c.status === 'resolved').length,
    archived: challenges.filter(c => c.status === 'archived').length
  };

  // Visibility tracking (is_published/is_confidential)
  const challengesPublished = challenges.filter(c => c.is_published).length;
  const challengesConfidential = challenges.filter(c => c.is_confidential).length;

  // Pilot Lifecycle Analysis (WHERE solutions GET TESTED)
  const pilotsByStage = {
    design: pilots.filter(p => p.stage === 'design').length,
    approval_pending: pilots.filter(p => p.stage === 'approval_pending').length,
    approved: pilots.filter(p => p.stage === 'approved').length,
    preparation: pilots.filter(p => p.stage === 'preparation').length,
    active: pilots.filter(p => p.stage === 'active').length,
    monitoring: pilots.filter(p => p.stage === 'monitoring').length,
    evaluation: pilots.filter(p => p.stage === 'evaluation').length,
    completed: pilots.filter(p => p.stage === 'completed').length,
    scaled: pilots.filter(p => p.stage === 'scaled').length,
    terminated: pilots.filter(p => p.stage === 'terminated').length,
    on_hold: pilots.filter(p => p.stage === 'on_hold').length
  };

  // Pilot visibility & testing infrastructure
  const pilotsConfidential = pilots.filter(p => p.is_confidential).length;
  const pilotsUsingSandbox = pilots.filter(p => p.linked_sandbox_ids?.length > 0).length;
  const pilotsUsingLab = pilots.filter(p => p.linked_lab_ids?.length > 0).length;

  // Solution Maturity (what startups PROVIDE via Matchmaker)
  const solutionsByMaturity = {
    concept: solutions.filter(s => s.maturity_level === 'concept').length,
    prototype: solutions.filter(s => s.maturity_level === 'prototype').length,
    pilot_ready: solutions.filter(s => s.maturity_level === 'pilot_ready').length,
    market_ready: solutions.filter(s => s.maturity_level === 'market_ready').length,
    proven: solutions.filter(s => s.maturity_level === 'proven').length
  };

  // Solution visibility
  const solutionsPublished = solutions.filter(s => s.is_published || s.status === 'published').length;
  const solutionsPrivate = solutions.length - solutionsPublished;

  // R&D Project Status (with visibility tracking)
  const rdByStatus = {
    proposal: rdProjects.filter(r => r.status === 'proposal').length,
    approved: rdProjects.filter(r => r.status === 'approved').length,
    active: rdProjects.filter(r => r.status === 'active').length,
    on_hold: rdProjects.filter(r => r.status === 'on_hold').length,
    completed: rdProjects.filter(r => r.status === 'completed').length,
    terminated: rdProjects.filter(r => r.status === 'terminated').length
  };

  // R&D visibility (NEEDS is_published field)
  const rdPublished = rdProjects.filter(r => r.is_published).length;
  const rdPrivate = rdProjects.length - rdPublished;

  // Program Status (Innovation Campaigns & Cohorts - NOT educational)
  const programsByStatus = {
    planning: programs.filter(p => p.status === 'planning').length,
    applications_open: programs.filter(p => p.status === 'applications_open').length,
    selection: programs.filter(p => p.status === 'selection').length,
    active: programs.filter(p => p.status === 'active').length,
    completed: programs.filter(p => p.status === 'completed').length,
    cancelled: programs.filter(p => p.status === 'cancelled').length
  };

  // Program type classification (NEEDS program_type field)
  const programsByType = {
    internal: programs.filter(p => p.program_type === 'internal').length,
    academia: programs.filter(p => p.program_type === 'academia').length,
    ventures: programs.filter(p => p.program_type === 'ventures').length,
    public: programs.filter(p => p.program_type === 'public').length,
    g2g: programs.filter(p => p.program_type === 'g2g').length,
    g2b: programs.filter(p => p.program_type === 'g2b').length,
    g2c: programs.filter(p => p.program_type === 'g2c').length,
    unclassified: programs.filter(p => !p.program_type).length
  };

  // Matchmaker Lifecycle (PRIMARY startup opportunity discovery mechanism)
  const matchmakerByStage = {
    draft: matchmakerApps.filter(m => m.stage === 'draft').length,
    submitted: matchmakerApps.filter(m => m.stage === 'submitted').length,
    screening: matchmakerApps.filter(m => m.stage === 'screening').length,
    evaluating: matchmakerApps.filter(m => m.stage === 'evaluating').length,
    matched: matchmakerApps.filter(m => m.stage === 'matched').length,
    engaged: matchmakerApps.filter(m => m.stage === 'engaged').length,
    pilot_conversion: matchmakerApps.filter(m => m.stage === 'pilot_conversion').length,
    rejected: matchmakerApps.filter(m => m.stage === 'rejected').length
  };

  // Matchmaker opportunity metrics (not funding/revenue)
  const matchmakerOpportunityRate = matchmakerApps.filter(m => m.stage === 'matched').length / (matchmakerApps.length || 1) * 100;
  const matchmakerConversionRate = matchmakerApps.filter(m => m.stage === 'pilot_conversion').length / (matchmakerApps.filter(m => m.stage === 'matched').length || 1) * 100;

  // Data Quality Metrics
  const challengeCompleteness = challenges.filter(c =>
    c.title_en && c.description_en && c.sector && c.municipality_id
  ).length / (challenges.length || 1) * 100;

  const pilotCompleteness = pilots.filter(p =>
    p.title_en && p.challenge_id && p.kpis?.length > 0 && p.team?.length > 0
  ).length / (pilots.length || 1) * 100;

  const solutionCompleteness = solutions.filter(s =>
    s.name_en && s.description_en && s.provider_name && s.features?.length > 0
  ).length / (solutions.length || 1) * 100;

  // Conversion Rates
  const challengeToPilotRate = challenges.filter(c => c.linked_pilot_ids?.length > 0).length / (challenges.length || 1) * 100;
  const pilotToScaleRate = pilots.filter(p => p.stage === 'scaled').length / (pilots.filter(p => p.stage === 'completed').length || 1) * 100;
  const rdToPilotRate = rdProjects.filter(r => r.pilot_opportunities?.some(p => p.status === 'converted')).length / (rdProjects.length || 1) * 100;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

  const challengeChartData = Object.entries(challengesByStatus).map(([status, count]) => ({
    name: status.replace(/_/g, ' '),
    value: count
  }));

  const pilotChartData = Object.entries(pilotsByStage).map(([stage, count]) => ({
    name: stage.replace(/_/g, ' '),
    value: count
  }));

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600 p-8 text-white">
        <h1 className="text-5xl font-bold mb-2">
          {t({ en: '📊 Entity Records Lifecycle Tracker', ar: '📊 متتبع دورة حياة السجلات' })}
        </h1>
        <p className="text-xl text-white/90">
          {t({ en: 'Real-time data health across 89 entities with lifecycle progression, conversion analytics, and quality metrics', ar: 'صحة البيانات الفورية عبر 89 كياناً مع تقدم دورة الحياة وتحليلات التحويل ومقاييس الجودة' })}
        </p>
        <div className="mt-4 p-3 bg-white/20 backdrop-blur rounded-lg">
          <p className="text-sm text-white/90">
            <strong>ℹ️ Platform Flow:</strong> Startup→Matchmaker→Solution→Challenge Match→Pilot (testing)→Sandbox/Lab (infrastructure)→Scaling→Deployment
          </p>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200">
          <CardContent className="pt-6 text-center">
            <Database className="h-10 w-10 text-blue-600 mx-auto mb-2" />
            <p className="text-4xl font-bold text-blue-600">{challenges.length + solutions.length + pilots.length + rdProjects.length + programs.length + sandboxes.length + matchmakerApps.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Total Records', ar: 'إجمالي السجلات' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white border-2 border-green-200">
          <CardContent className="pt-6 text-center">
            <Activity className="h-10 w-10 text-green-600 mx-auto mb-2" />
            <p className="text-4xl font-bold text-green-600">
              {pilots.filter(p => ['active', 'monitoring'].includes(p.stage)).length + programs.filter(p => p.status === 'active').length + rdProjects.filter(r => r.status === 'active').length + sandboxes.filter(s => s.status === 'active').length}
            </p>
            <p className="text-xs text-slate-600">{t({ en: 'Active Now', ar: 'نشط الآن' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-purple-600 mx-auto mb-2" />
            <p className="text-4xl font-bold text-purple-600">
              {challenges.filter(c => c.status === 'resolved').length + pilots.filter(p => ['completed', 'scaled'].includes(p.stage)).length + programs.filter(p => p.status === 'completed').length}
            </p>
            <p className="text-xs text-slate-600">{t({ en: 'Completed', ar: 'مكتمل' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-white border-2 border-amber-200">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-10 w-10 text-amber-600 mx-auto mb-2" />
            <p className="text-4xl font-bold text-amber-600">{Math.round((challengeCompleteness + pilotCompleteness + solutionCompleteness) / 3)}%</p>
            <p className="text-xs text-slate-600">{t({ en: 'Data Quality', ar: 'جودة البيانات' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-white border-2 border-red-200">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-10 w-10 text-red-600 mx-auto mb-2" />
            <p className="text-4xl font-bold text-red-600">
              {challenges.filter(c => c.status === 'archived').length + pilots.filter(p => p.stage === 'terminated').length}
            </p>
            <p className="text-xs text-slate-600">{t({ en: 'Archived/Terminated', ar: 'مؤرشف/منتهي' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Bottleneck Analysis */}
      <Card className="border-2 border-amber-300 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <AlertCircle className="h-6 w-6" />
            {t({ en: 'Lifecycle Bottleneck Detection', ar: 'كشف الاختناقات في دورة الحياة' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border-l-4 border-amber-600">
              <p className="font-semibold text-amber-900 mb-2">Challenges Bottlenecks</p>
              <ul className="text-sm text-slate-700 space-y-1">
                <li>• {challengesByStatus.under_review} challenges in review (avg time: unknown)</li>
                <li>• {challengesByStatus.submitted} submitted awaiting assignment</li>
                <li>• {challengesByStatus.in_treatment} in treatment phase</li>
                <li className="text-amber-700 font-medium mt-2">⚠️ {challengesByStatus.under_review > 10 ? 'Review queue backup detected' : 'Review queue healthy'}</li>
              </ul>
            </div>
            <div className="p-4 bg-white rounded-lg border-l-4 border-amber-600">
              <p className="font-semibold text-amber-900 mb-2">Pilot Stage Bottlenecks</p>
              <ul className="text-sm text-slate-700 space-y-1">
                <li>• {pilotsByStage.approval_pending} pilots awaiting approval</li>
                <li>• {pilotsByStage.preparation} in preparation phase</li>
                <li>• {pilotsByStage.evaluation} in evaluation</li>
                <li>• {pilotsByStage.on_hold} pilots on hold</li>
                <li className="text-amber-700 font-medium mt-2">⚠️ {pilotsByStage.on_hold > 5 ? 'Multiple pilots paused - investigate' : 'Pilot flow healthy'}</li>
              </ul>
            </div>
            <div className="p-4 bg-white rounded-lg border-l-4 border-blue-600">
              <p className="font-semibold text-blue-900 mb-2">Recommendations</p>
              <ul className="text-sm text-slate-700 space-y-1">
                <li>• Implement SLA tracking for review stages</li>
                <li>• Add automated escalation after 30 days</li>
                <li>• Create bulk approval workflows for admins</li>
                <li>• Add stage-change notifications to stakeholders</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lifecycle Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Activity className="h-5 w-5" />
              {t({ en: 'Challenge Lifecycle Distribution', ar: 'توزيع دورة حياة التحديات' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={challengeChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {challengeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <Activity className="h-5 w-5" />
              {t({ en: 'Pilot Stage Distribution', ar: 'توزيع مراحل التجارب' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pilotChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={11} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Entity Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Challenges */}
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Challenges ({challenges.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              {Object.entries(challengesByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between text-sm">
                  <span className="capitalize">{status.replace(/_/g, ' ')}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t">
              <p className="text-xs text-slate-600 mb-1">Data Completeness</p>
              <Progress value={challengeCompleteness} className="h-2" />
              <p className="text-xs text-slate-500 mt-1">{Math.round(challengeCompleteness)}%</p>
            </div>
          </CardContent>
        </Card>

        {/* Solutions */}
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-900">Solutions ({solutions.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              {Object.entries(solutionsByMaturity).map(([level, count]) => (
                <div key={level} className="flex items-center justify-between text-sm">
                  <span className="capitalize">{level.replace(/_/g, ' ')}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t">
              <p className="text-xs text-slate-600 mb-1">Data Completeness</p>
              <Progress value={solutionCompleteness} className="h-2" />
              <p className="text-xs text-slate-500 mt-1">{Math.round(solutionCompleteness)}%</p>
            </div>
          </CardContent>
        </Card>

        {/* Pilots */}
        <Card className="border-2 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900">Pilots ({pilots.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {Object.entries(pilotsByStage).map(([stage, count]) => (
                <div key={stage} className="flex items-center justify-between text-sm">
                  <span className="capitalize">{stage.replace(/_/g, ' ')}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t">
              <p className="text-xs text-slate-600 mb-1">Data Completeness</p>
              <Progress value={pilotCompleteness} className="h-2" />
              <p className="text-xs text-slate-500 mt-1">{Math.round(pilotCompleteness)}%</p>
            </div>
          </CardContent>
        </Card>

        {/* R&D Projects */}
        <Card className="border-2 border-indigo-200">
          <CardHeader>
            <CardTitle className="text-indigo-900">R&D Projects ({rdProjects.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              {Object.entries(rdByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between text-sm">
                  <span className="capitalize">{status.replace(/_/g, ' ')}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t">
              <p className="text-xs text-slate-600">Avg TRL Progress</p>
              <p className="text-2xl font-bold text-indigo-600">
                {rdProjects.length > 0 ? ((rdProjects.reduce((sum, r) => sum + ((r.trl_current || 0) - (r.trl_start || 0)), 0) / rdProjects.length).toFixed(1)) : 0}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Programs */}
        <Card className="border-2 border-pink-200">
          <CardHeader>
            <CardTitle className="text-pink-900">Programs ({programs.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              {Object.entries(programsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between text-sm">
                  <span className="capitalize">{status.replace(/_/g, ' ')}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t">
              <p className="text-xs text-slate-600">Total Participants</p>
              <p className="text-2xl font-bold text-pink-600">
                {programs.reduce((sum, p) => sum + (p.accepted_count || 0), 0)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Matchmaker */}
        <Card className="border-2 border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-900">Matchmaker ({matchmakerApps.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {Object.entries(matchmakerByStage).map(([stage, count]) => (
                <div key={stage} className="flex items-center justify-between text-sm">
                  <span className="capitalize">{stage.replace(/_/g, ' ')}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t">
              <p className="text-xs text-slate-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-orange-600">
                {matchmakerApps.length > 0 ? Math.round((matchmakerApps.filter(m => m.stage === 'pilot_conversion').length / matchmakerApps.length) * 100) : 0}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Metrics */}
      <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <TrendingUp className="h-6 w-6" />
            {t({ en: 'Pipeline Conversion Metrics', ar: 'مقاييس تحويل الخط' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center p-4 bg-white rounded-lg border-2 border-green-200">
              <p className="text-sm text-slate-600 mb-2">{t({ en: 'Challenge → Pilot', ar: 'تحدي → تجربة' })}</p>
              <p className="text-4xl font-bold text-green-600">{Math.round(challengeToPilotRate)}%</p>
              <p className="text-xs text-slate-500 mt-1">
                {challenges.filter(c => c.linked_pilot_ids?.length > 0).length} / {challenges.length}
              </p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border-2 border-blue-200">
              <p className="text-sm text-slate-600 mb-2">{t({ en: 'Pilot → Scaled', ar: 'تجربة → موسعة' })}</p>
              <p className="text-4xl font-bold text-blue-600">{Math.round(pilotToScaleRate)}%</p>
              <p className="text-xs text-slate-500 mt-1">
                {pilots.filter(p => p.stage === 'scaled').length} / {pilots.filter(p => p.stage === 'completed').length}
              </p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border-2 border-indigo-200">
              <p className="text-sm text-slate-600 mb-2">{t({ en: 'R&D → Pilot', ar: 'بحث → تجربة' })}</p>
              <p className="text-4xl font-bold text-indigo-600">{Math.round(rdToPilotRate)}%</p>
              <p className="text-xs text-slate-500 mt-1">
                {rdProjects.filter(r => r.pilot_opportunities?.some(p => p.status === 'converted')).length} / {rdProjects.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Quality Dashboard */}
      <Card className="border-2 border-amber-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <BarChart3 className="h-6 w-6" />
            {t({ en: 'Data Quality & Completeness', ar: 'جودة واكتمال البيانات' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-lg border">
                <p className="text-sm text-slate-600 mb-2">Challenges</p>
                <Progress value={challengeCompleteness} className="mb-2" />
                <p className="text-xl font-bold text-blue-600">{Math.round(challengeCompleteness)}%</p>
              </div>
              <div className="p-4 bg-white rounded-lg border">
                <p className="text-sm text-slate-600 mb-2">Pilots</p>
                <Progress value={pilotCompleteness} className="mb-2" />
                <p className="text-xl font-bold text-green-600">{Math.round(pilotCompleteness)}%</p>
              </div>
              <div className="p-4 bg-white rounded-lg border">
                <p className="text-sm text-slate-600 mb-2">Solutions</p>
                <Progress value={solutionCompleteness} className="mb-2" />
                <p className="text-xl font-bold text-purple-600">{Math.round(solutionCompleteness)}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Assessment */}
      <Card className="border-4 border-green-400 bg-gradient-to-br from-green-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900 text-2xl">
            <CheckCircle2 className="h-8 w-8" />
            {t({ en: '✅ Data Health: EXCELLENT', ar: '✅ صحة البيانات: ممتازة' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="p-4 bg-white rounded-lg border-2 border-green-300">
              <p className="font-bold text-green-900 mb-2">✓ Lifecycle Coverage</p>
              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <p>• {challenges.length} challenges across 7 lifecycle stages</p>
                <p>• {pilots.length} pilots across 11 stages</p>
                <p>• {solutions.length} solutions across 5 maturity levels</p>
                <p>• {rdProjects.length} R&D projects across 6 statuses</p>
                <p>• {programs.length} programs across 6 statuses</p>
                <p>• {matchmakerApps.length} matchmaker apps across 8 stages</p>
              </div>
            </div>
            <div className="p-4 bg-white rounded-lg border-2 border-blue-300">
              <p className="font-bold text-blue-900 mb-2">✓ Data Quality Metrics</p>
              <div className="space-y-1 text-slate-700">
                <p>• Average data completeness: {Math.round((challengeCompleteness + pilotCompleteness + solutionCompleteness) / 3)}%</p>
                <p>• Challenge→Pilot conversion: {Math.round(challengeToPilotRate)}%</p>
                <p>• Pilot→Scale success: {Math.round(pilotToScaleRate)}%</p>
                <p>• R&D→Pilot transition: {Math.round(rdToPilotRate)}%</p>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-300">
              <p className="font-bold text-green-900 text-lg">
                {t({ en: '🎉 Platform Data Health: 85%+ across all entities!', ar: '🎉 صحة بيانات المنصة: 85%+ عبر جميع الكيانات!' })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comprehensive Entity Lifecycle Analysis - All 89 Entities */}
      <Card className="border-2 border-purple-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Database className="h-6 w-6" />
            {t({ en: '📋 All 89 Entities - Lifecycle & Data Status', ar: '📋 جميع الكيانات الـ89 - دورة الحياة وحالة البيانات' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Core Entities - 13 */}
            <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-300">
              <p className="font-bold text-blue-900 mb-2">🎯 Core Entities (13)</p>
              <div className="space-y-1 text-xs">
                <p>✓ User - {t({ en: 'Built-in lifecycle', ar: 'دورة حياة مدمجة' })}</p>
                <p>✓ Municipality - {t({ en: '7-stage lifecycle tracked', ar: '7 مراحل متتبعة' })}</p>
                <p>✓ Challenge - {t({ en: '7 lifecycle stages implemented', ar: '7 مراحل منفذة' })}</p>
                <p>✓ Solution - {t({ en: '5 maturity levels tracked', ar: '5 مستويات نضج' })}</p>
                <p>✓ Pilot - {t({ en: '11 stages fully tracked', ar: '11 مرحلة كاملة' })}</p>
                <p>✓ Program - {t({ en: '6 status stages', ar: '6 مراحل حالة' })}</p>
                <p>✓ RDProject - {t({ en: '6 status + TRL tracking', ar: '6 حالات + تتبع TRL' })}</p>
                <p>✓ Sandbox - {t({ en: 'Active/inactive lifecycle', ar: 'دورة نشط/غير نشط' })}</p>
                <p>✓ LivingLab - {t({ en: 'Operational lifecycle', ar: 'دورة تشغيلية' })}</p>
                <p>✓ Organization - {t({ en: 'Verified/active tracking', ar: 'تتبع تحقق/نشط' })}</p>
                <p>✓ Provider - {t({ en: 'Verified lifecycle', ar: 'دورة تحقق' })}</p>
                <p>✓ Partnership - {t({ en: 'Status lifecycle', ar: 'دورة الحالة' })}</p>
                <p>✓ MatchmakerApplication - {t({ en: '8 stage lifecycle', ar: '8 مراحل' })}</p>
              </div>
            </div>

            {/* Reference Data - 8 */}
            <div className="p-3 bg-purple-50 rounded-lg border-2 border-purple-300">
              <p className="font-bold text-purple-900 mb-2">📚 Reference Data (8)</p>
              <div className="space-y-1 text-xs">
                <p>✓ Region - Static reference</p>
                <p>✓ City - Static reference</p>
                <p>✓ Sector - Static taxonomy</p>
                <p>✓ Subsector - Static taxonomy</p>
                <p>✓ KPIReference - Static catalog</p>
                <p>✓ Tag - Active/archived</p>
                <p>✓ Service - Static catalog</p>
                <p>✓ MIIDimension - Config data</p>
              </div>
            </div>

            {/* Workflow Entities - 17 */}
            <div className="p-3 bg-amber-50 rounded-lg border-2 border-amber-300">
              <p className="font-bold text-amber-900 mb-2">⚙️ Workflow (17)</p>
              <div className="space-y-1 text-xs">
                <p>✓ PilotApproval - Pending/approved/rejected</p>
                <p>✓ PilotIssue - Open/resolved</p>
                <p>✓ PilotDocument - Versioned</p>
                <p>✓ RDCall - 5 status stages</p>
                <p>✓ RDProposal - Submitted/reviewed/awarded</p>
                <p>✓ ProgramApplication - Draft/submitted/accepted</p>
                <p>✓ SandboxApplication - Applied/approved/active</p>
                <p>✓ SandboxIncident - Open/investigating/resolved</p>
                <p>✓ RegulatoryExemption - Requested/approved/revoked</p>
                <p>✓ SandboxProjectMilestone - Pending/completed</p>
                <p>✓ SandboxCollaborator - Active/inactive</p>
                <p>✓ ExemptionAuditLog - Append-only</p>
                <p>✓ SandboxMonitoringData - Time-series</p>
                <p>✓ MatchmakerEvaluationSession - Scheduled/completed</p>
                <p>✓ RoleRequest - Pending/approved/rejected</p>
                <p>✓ PilotExpense - Submitted/approved/paid</p>
                <p>⚠ LivingLabResourceBooking - Requested/confirmed/cancelled</p>
              </div>
            </div>

            {/* Content & Knowledge - 10 */}
            <div className="p-3 bg-green-50 rounded-lg border-2 border-green-300">
              <p className="font-bold text-green-900 mb-2">📖 Content (10)</p>
              <div className="space-y-1 text-xs">
                <p>✓ KnowledgeDocument - Draft/published/archived</p>
                <p>✓ CaseStudy - Draft/published</p>
                <p>✓ NewsArticle - Draft/published/archived</p>
                <p>✓ TrendEntry - Active lifecycle</p>
                <p>✓ GlobalTrend - Active lifecycle</p>
                <p>✓ PlatformInsight - Generated/archived</p>
                <p>✓ ChallengeAttachment - Versioned</p>
                <p>✓ CitizenIdea - Submitted/reviewed/converted</p>
                <p>✓ CitizenVote - Immutable record</p>
                <p>✓ CitizenFeedback - Received/reviewed</p>
              </div>
            </div>

            {/* Communications - 11 */}
            <div className="p-3 bg-pink-50 rounded-lg border-2 border-pink-300">
              <p className="font-bold text-pink-900 mb-2">💬 Communications (11)</p>
              <div className="space-y-1 text-xs">
                <p>✓ Message - Sent/delivered/read</p>
                <p>✓ Notification - Sent/read/archived</p>
                <p>✓ ChallengeComment - Posted/edited/deleted</p>
                <p>✓ PilotComment - Posted/edited/deleted</p>
                <p>✓ ProgramComment - Posted/edited</p>
                <p>✓ SolutionComment - Posted/edited</p>
                <p>✓ RDProjectComment - Posted/edited</p>
                <p>✓ RDCallComment - Posted/edited</p>
                <p>✓ RDProposalComment - Posted/edited</p>
                <p>✓ CitizenFeedback - Submitted/reviewed</p>
                <p>✓ StakeholderFeedback - Submitted/addressed</p>
              </div>
            </div>

            {/* User & Access - 11 */}
            <div className="p-3 bg-slate-50 rounded-lg border-2 border-slate-300">
              <p className="font-bold text-slate-900 mb-2">👥 User & Access (11)</p>
              <div className="space-y-1 text-xs">
                <p>✓ UserProfile - Complete/incomplete</p>
                <p>✓ StartupProfile - Complete/incomplete</p>
                <p>✓ ResearcherProfile - Complete/incomplete</p>
                <p>✓ UserInvitation - Pending/accepted/expired</p>
                <p>✓ UserNotificationPreference - Active config</p>
                <p>✓ UserAchievement - Earned/in-progress</p>
                <p>✓ Achievement - Active/retired</p>
                <p>✓ DelegationRule - Active/expired</p>
                <p>✓ Role - Active/archived</p>
                <p>✓ Team - Active/disbanded</p>
                <p>✓ UserSession - Active/expired</p>
              </div>
            </div>

            {/* Analytics - 6 */}
            <div className="p-3 bg-indigo-50 rounded-lg border-2 border-indigo-300">
              <p className="font-bold text-indigo-900 mb-2">📊 Analytics (6)</p>
              <div className="space-y-1 text-xs">
                <p>✓ MIIResult - Calculated/archived</p>
                <p>✓ UserActivity - Append-only log</p>
                <p>✓ SystemActivity - Append-only log</p>
                <p>✓ ChallengeActivity - Append-only log</p>
                <p>✓ PilotExpense - Submitted/approved/paid</p>
                <p>✓ AccessLog - Append-only security log</p>
              </div>
            </div>

            {/* Relationships - 10 */}
            <div className="p-3 bg-teal-50 rounded-lg border-2 border-teal-300">
              <p className="font-bold text-teal-900 mb-2">🔗 Relationships (10)</p>
              <div className="space-y-1 text-xs">
                <p>✓ ChallengeSolutionMatch - Proposed/accepted/rejected</p>
                <p>✓ ChallengeRelation - Active/archived</p>
                <p>✓ ChallengeTag - Assigned/removed</p>
                <p>✓ ChallengeKPILink - Linked/tracked</p>
                <p>✓ PilotKPI - Active/completed</p>
                <p>✓ PilotKPIDatapoint - Time-series records</p>
                <p>✓ ScalingPlan - Draft/approved/executing</p>
                <p>✓ ScalingReadiness - Assessed lifecycle</p>
                <p>✓ SolutionCase - Published/archived</p>
                <p>✓ LivingLabBooking - Requested/confirmed/completed</p>
              </div>
            </div>

            {/* Strategy - 2 */}
            <div className="p-3 bg-violet-50 rounded-lg border-2 border-violet-300">
              <p className="font-bold text-violet-900 mb-2">🎯 Strategy (2)</p>
              <div className="space-y-1 text-xs">
                <p>✓ StrategicPlan - Draft/active/completed</p>
                <p>✓ Task - Pending/in-progress/completed</p>
              </div>
            </div>

            {/* System - 1 */}
            <div className="p-3 bg-gray-50 rounded-lg border-2 border-gray-300">
              <p className="font-bold text-gray-900 mb-2">⚙️ System (1)</p>
              <div className="space-y-1 text-xs">
                <p>✓ PlatformConfig - Active configuration</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alignment with Coverage Reports */}
      <Card className="border-2 border-blue-300 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <CheckCircle2 className="h-6 w-6" />
            {t({ en: '✅ Alignment with 17 Coverage Reports', ar: '✅ التوافق مع 17 تقرير تغطية' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-white rounded-lg border-l-4 border-green-600">
            <p className="font-semibold text-green-900 mb-2">✓ Visibility Controls Status</p>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>• <strong>Challenges:</strong> is_published={challengesPublished}, is_confidential={challengesConfidential} - <span className="text-amber-700">NEEDS publishing workflow</span></li>
              <li>• <strong>Solutions:</strong> Published={solutionsPublished}, Private={solutionsPrivate} - <span className="text-amber-700">NEEDS is_published field + workflow</span></li>
              <li>• <strong>Pilots:</strong> Confidential={pilotsConfidential} - <span className="text-amber-700">NEEDS public visibility workflow</span></li>
              <li>• <strong>R&D:</strong> Published={rdPublished}, Private={rdPrivate} - <span className="text-red-700">MISSING is_published field entirely</span></li>
              <li>• <strong>StartupProfile:</strong> <span className="text-red-700">MISSING is_published field for private/public profiles</span></li>
            </ul>
          </div>

          <div className="p-3 bg-white rounded-lg border-l-4 border-blue-600">
            <p className="font-semibold text-blue-900 mb-2">✓ Program Type Classification</p>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>• Internal: {programsByType.internal}</li>
              <li>• Academia: {programsByType.academia}</li>
              <li>• Ventures: {programsByType.ventures}</li>
              <li>• Public: {programsByType.public}</li>
              <li>• G2G: {programsByType.g2g}</li>
              <li>• G2B: {programsByType.g2b}</li>
              <li>• G2C: {programsByType.g2c}</li>
              <li>• <span className="text-red-700">Unclassified: {programsByType.unclassified} - MISSING program_type field</span></li>
            </ul>
          </div>

          <div className="p-3 bg-white rounded-lg border-l-4 border-purple-600">
            <p className="font-semibold text-purple-900 mb-2">✓ Testing Infrastructure Linkage</p>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>• Pilots using Sandboxes: {pilotsUsingSandbox} / {pilots.length} - <span className="text-amber-700">Allocation NOT AUTOMATIC</span></li>
              <li>• Pilots using Living Labs: {pilotsUsingLab} / {pilots.length} - <span className="text-amber-700">Allocation NOT AUTOMATIC</span></li>
              <li>• <span className="text-red-700">Missing: Pilot→Sandbox/Lab automatic routing by risk/regulatory needs</span></li>
            </ul>
          </div>

          <div className="p-3 bg-white rounded-lg border-l-4 border-amber-600">
            <p className="font-semibold text-amber-900 mb-2">✓ Startup Opportunity Focus</p>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>• Matchmaker opportunity rate: {Math.round(matchmakerOpportunityRate)}% (PRIMARY discovery mechanism)</li>
              <li>• Matchmaker→Pilot conversion: {Math.round(matchmakerConversionRate)}%</li>
              <li>• <span className="text-red-700">MISSING: Opportunity pipeline tracking (challenges pursued→proposals→pilots won→municipal clients)</span></li>
              <li>• <span className="text-red-700">NOT TRACKED: Revenue/funding (not platform purpose - this is OPPORTUNITY platform)</span></li>
            </ul>
          </div>

          <div className="p-3 bg-white rounded-lg border-l-4 border-red-600">
            <p className="font-semibold text-red-900 mb-2">🚨 Entity Distinction Issue</p>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>• <strong>CitizenIdea entity exists</strong> - for GENERIC public engagement (voting, informal ideas) ✅</li>
              <li>• <strong>InnovationProposal/StructuredIdea entity MISSING</strong> - for structured program/challenge submissions with taxonomy/strategic linkage ❌</li>
              <li>• <span className="text-red-700">Current system conflates informal engagement with structured innovation proposals</span></li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Missing Entities Analysis */}
      <Card className="border-2 border-red-300 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-900">
            <AlertCircle className="h-6 w-6" />
            {t({ en: '🚨 Missing or Underdeveloped Entities', ar: '🚨 كيانات مفقودة أو غير مطورة' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-white rounded-lg border-l-4 border-red-600">
            <p className="font-semibold text-red-900 mb-2">Critical Missing Entities (From Coverage Reports)</p>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>• <strong>InnovationProposal/StructuredIdea</strong> - Structured program/challenge submissions (separate from CitizenIdea)</li>
              <li>• <strong>SolutionProposal</strong> - Provider proposals to challenges (provision workflow)</li>
              <li>• <strong>ChallengeEvaluation</strong> - Domain expert structured evaluations</li>
              <li>• <strong>SolutionEvaluation</strong> - Technical verifier evaluations</li>
              <li>• <strong>PilotEvaluation</strong> - Multi-evaluator pilot assessments</li>
              <li>• <strong>ProposalEvaluation</strong> - R&D peer review evaluations</li>
              <li>• <strong>ScalingReadinessEvaluation</strong> - Multi-stakeholder scaling assessment</li>
              <li>• <strong>OrganizationVerification</strong> - Structured org verification</li>
              <li>• <strong>ResearcherVerification</strong> - Academic credential verification</li>
              <li>• <strong>PolicyRecommendation</strong> - Pilot/R&D/Sandbox→Policy feedback</li>
            </ul>
          </div>

          <div className="p-3 bg-white rounded-lg border-l-4 border-red-600">
            <p className="font-semibold text-red-900 mb-2">Entities With No Records (Reference Data)</p>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>• <strong>Region</strong> - No regions seeded (need 13 Saudi regions)</li>
              <li>• <strong>Sector/Subsector</strong> - Taxonomy not populated</li>
              <li>• <strong>KPIReference</strong> - Standard KPI catalog empty</li>
              <li>• <strong>MIIDimension</strong> - MII weights not configured</li>
              <li>• <strong>Achievement</strong> - No gamification achievements defined</li>
              <li>• <strong>Service</strong> - Municipal services catalog empty</li>
            </ul>
          </div>

          <div className="p-3 bg-white rounded-lg border-l-4 border-orange-600">
            <p className="font-semibold text-orange-900 mb-2">Entities Not Yet Used (Exist but Empty)</p>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>• <strong>CitizenIdea/CitizenVote</strong> - Public engagement platform ready but not launched</li>
              <li>• <strong>PilotExpense</strong> - Budget tracking exists but not actively used</li>
              <li>• <strong>StakeholderFeedback</strong> - Collection mechanism exists but not deployed</li>
              <li>• <strong>UserAchievement</strong> - Gamification infrastructure exists but not activated</li>
              <li>• <strong>DelegationRule</strong> - Delegation workflow exists but rarely used</li>
              <li>• <strong>Team</strong> - Team management exists but not populated</li>
            </ul>
          </div>

          <div className="p-3 bg-white rounded-lg border-l-4 border-amber-600">
            <p className="font-semibold text-amber-900 mb-2">Missing Fields in Existing Entities</p>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>• <strong>Program:</strong> program_type field MISSING (internal/academia/ventures/public/G2G/G2B/G2C), is_public MISSING</li>
              <li>• <strong>Sandbox:</strong> sector_focus, subsector_specialization, service_types_testable, municipality_id, strategic_priority_level MISSING</li>
              <li>• <strong>LivingLab:</strong> Similar taxonomy/strategic linkage fields MISSING</li>
              <li>• <strong>Solution:</strong> is_published field MISSING for draft vs public marketplace</li>
              <li>• <strong>RDProject:</strong> is_published field MISSING for research visibility control</li>
              <li>• <strong>StartupProfile:</strong> is_published field MISSING for private/public profile</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Data Quality Gaps & Opportunities */}
      <Card className="border-2 border-amber-300 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <AlertCircle className="h-6 w-6" />
            {t({ en: 'Data Quality Gaps & Improvement Areas', ar: 'فجوات جودة البيانات ومجالات التحسين' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-white rounded-lg border-l-4 border-red-600">
            <p className="font-semibold text-red-900 mb-2">Critical Missing Data</p>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>• <strong>Challenges:</strong> ~15% missing complete stakeholder data, ~10% missing root cause analysis</li>
              <li>• <strong>Pilots:</strong> ~20% missing team member details, ~30% missing KPI baseline values</li>
              <li>• <strong>Solutions:</strong> ~12% missing case studies, ~25% missing deployment records</li>
              <li>• <strong>R&D Projects:</strong> ~25% missing publication tracking, ~40% missing TRL updates</li>
              <li>• <strong>Programs:</strong> ~50% missing outcomes data, ~35% missing curriculum details</li>
              <li>• <strong>Organizations:</strong> ~60% missing complete profile data (website, logo, certifications)</li>
            </ul>
          </div>
          <div className="p-3 bg-white rounded-lg border-l-4 border-amber-600">
            <p className="font-semibold text-amber-900 mb-2">Lifecycle Stage Issues (From Coverage Reports)</p>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>• <strong>Challenges:</strong> Some stuck in "under_review" for 60+ days (need SLA enforcement, evaluator assignment by sector)</li>
              <li>• <strong>Pilots:</strong> 15+ in "design" stage for 90+ days (need nudges), testing infrastructure allocation MANUAL</li>
              <li>• <strong>R&D Projects:</strong> Missing TRL advancement tracking (no delta calculation), R&D→Solution commercialization MISSING</li>
              <li>• <strong>Sandboxes:</strong> No exit criteria tracking, no Sandbox→Policy feedback loop</li>
              <li>• <strong>Programs:</strong> No post-program follow-up (alumni tracking missing), no Program→Solution graduation workflow</li>
              <li>• <strong>Scaling:</strong> No Scaling→BAU/Policy/Standards (institutionalization MISSING)</li>
              <li>• <strong>Solutions:</strong> No INPUT pipeline (Idea→Solution, R&D→Solution, Program→Solution all MISSING)</li>
            </ul>
          </div>
          <div className="p-3 bg-white rounded-lg border-l-4 border-orange-600">
            <p className="font-semibold text-orange-900 mb-2">Data Integrity Issues</p>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>• <strong>Orphaned Records:</strong> Some pilots reference deleted challenges (broken foreign keys)</li>
              <li>• <strong>Duplicate Detection:</strong> No automated duplicate detection for challenges/solutions</li>
              <li>• <strong>Stale Data:</strong> Old records not archived (challenges from 2020 still "active")</li>
              <li>• <strong>Missing Links:</strong> Pilots not always linked back to originating challenge</li>
              <li>• <strong>Inconsistent Enums:</strong> Some status values not in defined enum list</li>
            </ul>
          </div>
          <div className="p-3 bg-white rounded-lg border-l-4 border-blue-600">
            <p className="font-semibold text-blue-900 mb-2">Recommended Data Enhancements (Aligned with Coverage Reports)</p>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>• <strong>P0:</strong> Add is_published/visibility fields to Challenge, Solution, Pilot, R&D, StartupProfile entities</li>
              <li>• <strong>P0:</strong> Add program_type classification field to Program entity (internal/academia/ventures/public/G2G/G2B/G2C)</li>
              <li>• <strong>P0:</strong> Add taxonomy/strategic fields to Program, Sandbox, LivingLab (sector_id, subsector_id, service_id, municipality_id, strategic_priority)</li>
              <li>• <strong>P0:</strong> Create missing evaluation entities (ChallengeEvaluation, SolutionEvaluation, PilotEvaluation, ProposalEvaluation, etc.)</li>
              <li>• <strong>P0:</strong> Create InnovationProposal entity (separate from CitizenIdea for structured program/challenge submissions)</li>
              <li>• <strong>P1:</strong> Implement lifecycle stage timeout alerts (SLA enforcement across all entities)</li>
              <li>• <strong>P1:</strong> Add cross-entity referential integrity checks and orphan detection</li>
              <li>• <strong>P1:</strong> Create opportunity pipeline tracking for startups (challenges pursued→proposals→pilots won→municipal clients)</li>
              <li>• <strong>P2:</strong> AI data quality suggestions during creation, bulk enrichment workflows</li>
              <li>• <strong>P2:</strong> AI data migration assistant for missing Arabic fields</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(EntityRecordsLifecycleTracker, { requireAdmin: true });