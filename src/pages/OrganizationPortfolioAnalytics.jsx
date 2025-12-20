import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import { Lightbulb, TestTube, Microscope, Handshake, TrendingUp, Activity, BarChart3, Calendar
} from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function OrganizationPortfolioAnalytics() {
  const { t, isRTL } = useLanguage();
  const urlParams = new URLSearchParams(window.location.search);
  const orgId = urlParams.get('id');

  const { data: org, isLoading } = useQuery({
    queryKey: ['org', orgId],
    queryFn: () => base44.entities.Organization.get(orgId),
    enabled: !!orgId
  });

  const { data: solutions = [] } = useQuery({
    queryKey: ['org-solutions', orgId],
    queryFn: () => base44.entities.Solution.filter({ provider_id: orgId }),
    enabled: !!orgId
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['org-pilots', orgId],
    queryFn: () => base44.entities.Pilot.filter({ solution_id: { $in: solutions.map(s => s.id) } }),
    enabled: !!orgId && solutions.length > 0
  });

  const { data: rdProjects = [] } = useQuery({
    queryKey: ['org-rd', orgId],
    queryFn: () => base44.entities.RDProject.filter({ institution_en: org?.name_en }),
    enabled: !!orgId && !!org
  });

  const { data: partnerships = [] } = useQuery({
    queryKey: ['org-partnerships', orgId],
    queryFn: () => base44.entities.OrganizationPartnership.filter({
      $or: [{ organization_a_id: orgId }, { organization_b_id: orgId }]
    }),
    enabled: !!orgId
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['org-programs', orgId],
    queryFn: () => base44.entities.Program.filter({ operator_organization_id: orgId }),
    enabled: !!orgId
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">
      <Activity className="h-8 w-8 animate-spin text-blue-600" />
    </div>;
  }

  if (!org) return null;

  const stats = {
    solutions: solutions.length,
    activePilots: pilots.filter(p => p.stage === 'active').length,
    completedPilots: pilots.filter(p => p.stage === 'completed').length,
    rdProjects: rdProjects.length,
    activeRD: rdProjects.filter(rd => rd.status === 'active').length,
    partnerships: partnerships.length,
    activePartnerships: partnerships.filter(p => p.status === 'active').length,
    programs: programs.length,
    activePrograms: programs.filter(p => p.status === 'active').length,
    avgSolutionRating: solutions.reduce((sum, s) => sum + (s.average_rating || 0), 0) / Math.max(solutions.length, 1),
    totalDeployments: solutions.reduce((sum, s) => sum + (s.deployment_count || 0), 0),
    pilotSuccessRate: pilots.length > 0 ? Math.round((pilots.filter(p => p.recommendation === 'scale').length / pilots.length) * 100) : 0
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          {org.name_en} {org.name_ar && `/ ${org.name_ar}`}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Portfolio Analytics Dashboard', ar: 'لوحة تحليلات المحفظة' })}
        </p>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-2 border-blue-300">
          <CardContent className="pt-6 text-center">
            <Lightbulb className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-slate-900">{stats.solutions}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Solutions', ar: 'الحلول' })}</p>
            <Badge className="mt-2 bg-blue-100 text-blue-700">
              ⭐ {stats.avgSolutionRating.toFixed(1)} avg rating
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-300">
          <CardContent className="pt-6 text-center">
            <TestTube className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-slate-900">{stats.activePilots}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Active Pilots', ar: 'التجارب النشطة' })}</p>
            <Badge className="mt-2 bg-green-100 text-green-700">
              {stats.pilotSuccessRate}% success rate
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-300">
          <CardContent className="pt-6 text-center">
            <Microscope className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-slate-900">{stats.activeRD}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Active R&D', ar: 'بحث نشط' })}</p>
            <Badge className="mt-2 bg-purple-100 text-purple-700">
              {stats.rdProjects} total
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-2 border-teal-300">
          <CardContent className="pt-6 text-center">
            <Handshake className="h-8 w-8 text-teal-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-slate-900">{stats.activePartnerships}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Active Partnerships', ar: 'الشراكات النشطة' })}</p>
            <Badge className="mt-2 bg-teal-100 text-teal-700">
              {stats.partnerships} total
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              {t({ en: 'Deployment Performance', ar: 'أداء النشر' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">{t({ en: 'Total Deployments', ar: 'إجمالي عمليات النشر' })}</span>
              <span className="text-2xl font-bold text-blue-600">{stats.totalDeployments}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">{t({ en: 'Pilot Success Rate', ar: 'معدل نجاح التجارب' })}</span>
              <div className="flex items-center gap-2">
                <Progress value={stats.pilotSuccessRate} className="w-24" />
                <span className="text-lg font-bold text-green-600">{stats.pilotSuccessRate}%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">{t({ en: 'Completed Pilots', ar: 'التجارب المكتملة' })}</span>
              <span className="text-lg font-bold text-slate-900">{stats.completedPilots}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              {t({ en: 'Program & Research Activity', ar: 'نشاط البرامج والبحث' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">{t({ en: 'Programs Operated', ar: 'البرامج المشغلة' })}</span>
              <span className="text-lg font-bold text-slate-900">{stats.programs}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">{t({ en: 'R&D Projects', ar: 'مشاريع البحث' })}</span>
              <span className="text-lg font-bold text-slate-900">{stats.rdProjects}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">{t({ en: 'Reputation Score', ar: 'نقاط السمعة' })}</span>
              <span className="text-lg font-bold text-amber-600">{org.reputation_score || 0}/100</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            {t({ en: 'Portfolio Composition', ar: 'تكوين المحفظة' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Lightbulb className="h-5 w-5 text-blue-600" />
                <span className="font-medium">{t({ en: 'Solutions Portfolio', ar: 'محفظة الحلول' })}</span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">{stats.solutions}</p>
                <p className="text-xs text-slate-600">{stats.totalDeployments} deployments</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <TestTube className="h-5 w-5 text-green-600" />
                <span className="font-medium">{t({ en: 'Pilot Engagement', ar: 'مشاركة التجارب' })}</span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">{pilots.length}</p>
                <p className="text-xs text-slate-600">{stats.activePilots} active</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Microscope className="h-5 w-5 text-purple-600" />
                <span className="font-medium">{t({ en: 'Research Projects', ar: 'مشاريع البحث' })}</span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-600">{stats.rdProjects}</p>
                <p className="text-xs text-slate-600">{stats.activeRD} active</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-teal-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Handshake className="h-5 w-5 text-teal-600" />
                <span className="font-medium">{t({ en: 'Strategic Partnerships', ar: 'الشراكات الاستراتيجية' })}</span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-teal-600">{stats.partnerships}</p>
                <p className="text-xs text-slate-600">{stats.activePartnerships} active</p>
              </div>
            </div>

            {stats.programs > 0 && (
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-amber-600" />
                  <span className="font-medium">{t({ en: 'Programs Operated', ar: 'البرامج المشغلة' })}</span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-amber-600">{stats.programs}</p>
                  <p className="text-xs text-slate-600">{stats.activePrograms} active</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(OrganizationPortfolioAnalytics, { requireAdmin: true });