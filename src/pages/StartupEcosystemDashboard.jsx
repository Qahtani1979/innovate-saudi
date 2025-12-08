import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import {
  Rocket, TrendingUp, Target, CheckCircle2, Building2, TestTube,
  DollarSign, Users, Lightbulb, BarChart3, Activity
} from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function StartupEcosystemDashboard() {
  const { language, isRTL, t } = useLanguage();

  const { data: startups = [] } = useQuery({
    queryKey: ['startups'],
    queryFn: () => base44.entities.StartupProfile.list()
  });

  const { data: solutions = [] } = useQuery({
    queryKey: ['solutions'],
    queryFn: () => base44.entities.Solution.list()
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const { data: proposals = [] } = useQuery({
    queryKey: ['proposals'],
    queryFn: () => base44.entities.ChallengeProposal.list()
  });

  const { data: matchmakerApps = [] } = useQuery({
    queryKey: ['matchmaker-apps'],
    queryFn: () => base44.entities.MatchmakerApplication.list()
  });

  const startupSolutions = solutions.filter(s => s.provider_type === 'startup');
  const startupPilots = pilots.filter(p => {
    const solution = solutions.find(s => s.id === p.solution_id);
    return solution?.provider_type === 'startup';
  });

  const stats = {
    totalStartups: startups.length,
    activeStartups: startups.filter(s => s.is_verified).length,
    totalSolutions: startupSolutions.length,
    totalProposals: proposals.length,
    pilotsWon: startupPilots.length,
    successfulDeployments: startupPilots.filter(p => p.stage === 'completed' || p.stage === 'scaled').length,
    matchmakerEnrolled: matchmakerApps.length,
    avgSuccessRate: startupPilots.length > 0
      ? Math.round((startupPilots.filter(p => p.stage === 'completed' || p.stage === 'scaled').length / startupPilots.length) * 100)
      : 0,
    conversionRate: proposals.length > 0
      ? Math.round((startupPilots.length / proposals.length) * 100)
      : 0
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <Rocket className="h-10 w-10 text-blue-600" />
          {t({ en: 'Startup Ecosystem Health', ar: 'صحة نظام الشركات الناشئة' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Platform-wide startup engagement and deployment success metrics', ar: 'مقاييس مشاركة الشركات الناشئة ونجاح النشر على مستوى المنصة' })}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-4 text-center">
            <Building2 className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{stats.totalStartups}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Startups', ar: 'شركات' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-4 text-center">
            <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{stats.activeStartups}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Verified', ar: 'معتمدة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-4 text-center">
            <Lightbulb className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{stats.totalSolutions}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Solutions', ar: 'حلول' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-4 text-center">
            <Target className="h-6 w-6 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">{stats.totalProposals}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Proposals', ar: 'مقترحات' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-white">
          <CardContent className="pt-4 text-center">
            <TestTube className="h-6 w-6 text-teal-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-teal-600">{stats.pilotsWon}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Pilots Won', ar: 'تجارب فائزة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-white">
          <CardContent className="pt-4 text-center">
            <TrendingUp className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-emerald-600">{stats.successfulDeployments}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Deployed', ar: 'منشورة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-white">
          <CardContent className="pt-4 text-center">
            <Activity className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-indigo-600">{stats.avgSuccessRate}%</p>
            <p className="text-xs text-slate-600">{t({ en: 'Success Rate', ar: 'معدل النجاح' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-50 to-white">
          <CardContent className="pt-4 text-center">
            <BarChart3 className="h-6 w-6 text-pink-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-pink-600">{stats.conversionRate}%</p>
            <p className="text-xs text-slate-600">{t({ en: 'Conversion', ar: 'تحويل' })}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Ecosystem Health Indicators', ar: 'مؤشرات صحة النظام' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-slate-600">{t({ en: 'Startup Activation Rate', ar: 'معدل تفعيل الشركات' })}</span>
              <span className="font-bold">{Math.round((stats.activeStartups / stats.totalStartups) * 100)}%</span>
            </div>
            <Progress value={(stats.activeStartups / stats.totalStartups) * 100} />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-slate-600">{t({ en: 'Opportunity Conversion Rate', ar: 'معدل تحويل الفرص' })}</span>
              <span className="font-bold">{stats.conversionRate}%</span>
            </div>
            <Progress value={stats.conversionRate} />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-slate-600">{t({ en: 'Deployment Success Rate', ar: 'معدل نجاح النشر' })}</span>
              <span className="font-bold">{stats.avgSuccessRate}%</span>
            </div>
            <Progress value={stats.avgSuccessRate} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(StartupEcosystemDashboard, { requireAdmin: true });