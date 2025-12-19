import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Lightbulb, TestTube, TrendingUp, MapPin, Target, Zap, Plus, FileText, CheckCircle, Clock, Megaphone, MessageCircle, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useLanguage } from '../components/LanguageContext';
import TrendingSolutionsWidget from '../components/home/TrendingSolutionsWidget';
import DeadlineAlerts from '../components/DeadlineAlerts';
import ProgressTracker from '../components/ProgressTracker';
import LivingLabDashboard from '../components/LivingLabDashboard';
import MyWorkPrioritizer from '../components/MyWorkPrioritizer';
import SmartRecommendation from '../components/SmartRecommendation';
import PlatformStatsWidget from '../components/PlatformStatsWidget';
import MyWeekAhead from '../components/MyWeekAhead';
import PlatformInsightsWidget from '../components/PlatformInsightsWidget';
// FirstTimeWizard moved to Layout.jsx
import ActivityFeed from '../components/ActivityFeed';
import QuickActionsPanel from '../components/QuickActionsPanel';
import NationalMap from '../components/NationalMap';
import PersonaDashboardWidget from '../components/PersonaDashboardWidget';
import ProtectedPage from '../components/permissions/ProtectedPage';
import RoleRequestStatusBanner from '../components/profile/RoleRequestStatusBanner';
import { usePersonaRouting } from '@/hooks/usePersonaRouting';

function Home() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const { language, isRTL, t } = useLanguage();
  const navigate = useNavigate();
  const personaRouting = usePersonaRouting();

  // Redirect to persona-specific dashboard if not /home
  useEffect(() => {
    // Wait for auth to load and ensure we have persona data
    if (!isLoadingAuth && isAuthenticated && personaRouting?.persona) {
      const targetDashboard = personaRouting.defaultDashboard;
      // Only redirect if the target is NOT /home (to avoid infinite loop)
      // and persona is not 'user' (which defaults to /home)
      if (targetDashboard && targetDashboard !== '/home' && personaRouting.persona !== 'user') {
        navigate(targetDashboard, { replace: true });
      }
    }
  }, [isLoadingAuth, isAuthenticated, personaRouting, navigate]);

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: async () => {
      const { data } = await supabase
        .from('challenges')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      return data || [];
    }
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: async () => {
      const { data } = await supabase
        .from('pilots')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      return data || [];
    }
  });

  const { data: solutions = [] } = useQuery({
    queryKey: ['solutions'],
    queryFn: async () => {
      const { data } = await supabase
        .from('solutions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      return data || [];
    }
  });

  const { data: municipalities = [] } = useQuery({
    queryKey: ['municipalities'],
    queryFn: async () => {
      const { data } = await supabase.from('municipalities').select('*');
      return data || [];
    }
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['programs-home'],
    queryFn: async () => {
      const { data } = await supabase
        .from('programs')
        .select('*')
        .eq('is_published', true)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(10);
      return data || [];
    }
  });

  const { data: recentActivities = [] } = useQuery({
    queryKey: ['recent-activities'],
    queryFn: async () => {
      const all = await base44.entities.SystemActivity.list('-created_date');
      return all.slice(0, 10);
    }
  });

  const { data: userProfile } = useQuery({
    queryKey: ['user-profile-onboarding', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_email: user?.email });
      return profiles[0] || null;
    },
    enabled: !!user
  });

  const { data: myExpertAssignments = [] } = useQuery({
    queryKey: ['expert-assignments-home', user?.email],
    queryFn: async () => {
      const assignments = await base44.entities.ExpertAssignment.list();
      return assignments.filter(a => a.expert_email === user?.email && a.status !== 'completed');
    },
    enabled: !!user
  });

  // Onboarding wizard is now handled in Layout.jsx

  const stats = [
    {
      label: { en: 'Active Challenges', ar: 'التحديات النشطة' },
      value: challenges.filter(c => c.status === 'approved' || c.status === 'in_treatment').length,
      total: challenges.length,
      icon: AlertCircle,
      gradient: 'from-red-500 to-orange-500',
      bgGradient: 'from-red-50 to-orange-50'
    },
    {
      label: { en: 'Validated Solutions', ar: 'الحلول المعتمدة' },
      value: solutions.filter(s => s.maturity_level === 'pilot_ready' || s.maturity_level === 'market_ready').length,
      total: solutions.length,
      icon: Lightbulb,
      gradient: 'from-yellow-500 to-amber-500',
      bgGradient: 'from-yellow-50 to-amber-50'
    },
    {
      label: { en: 'Active Pilots', ar: 'التجارب النشطة' },
      value: pilots.filter(p => p.stage === 'active' || p.stage === 'monitoring').length,
      total: pilots.length,
      icon: TestTube,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50'
    },
    {
      label: { en: 'Municipalities', ar: 'البلديات' },
      value: (municipalities || []).filter(m => m.active_challenges > 0 || m.active_pilots > 0).length,
      total: (municipalities || []).length,
      icon: MapPin,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50'
    }
  ];

  const recentActivity = [
    ...challenges.slice(0, 3).map(c => ({
      type: 'challenge',
      title: c.title_en,
      subtitle: c.municipality_id,
      time: new Date(c.created_date).toLocaleDateString(),
      icon: AlertCircle,
      color: 'text-red-600'
    })),
    ...pilots.slice(0, 2).map(p => ({
      type: 'pilot',
      title: p.title_en,
      subtitle: p.municipality_id,
      time: new Date(p.created_date).toLocaleDateString(),
      icon: TestTube,
      color: 'text-blue-600'
    }))
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-700" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Role Request Status Banner */}
      <RoleRequestStatusBanner />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            {t({ en: `Welcome back, ${user?.full_name || 'User'}`, ar: `مرحباً بعودتك، ${user?.full_name || 'مستخدم'}` })}
          </h1>
          <p className="text-slate-600 mt-2 text-sm md:text-base">
            {t({ en: "Here's what's happening with municipal innovation today", ar: 'إليك ما يحدث في الابتكار البلدي اليوم' })}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border border-blue-100">
            <Zap className="h-4 md:h-5 w-4 md:w-5 text-blue-600" />
            <span className="text-xs md:text-sm font-medium text-blue-900">
              {t({ en: 'AI Assistant Active', ar: 'المساعد الذكي نشط' })}
            </span>
          </div>
          {/* WhatsApp Advisor - disabled pending integration */}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className={`relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br ${stat.bgGradient}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-700">
                    {t(stat.label)}
                  </CardTitle>
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-slate-900">{stat.value}</span>
                    <span className="text-lg text-slate-500">/ {stat.total}</span>
                  </div>
                  <div className="w-full bg-white/50 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full transition-all duration-500`}
                      style={{ width: `${(stat.value / stat.total) * 100}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Role Portals & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Role-Specific Portals */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              {t({ en: 'Portals', ar: 'البوابات' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to={createPageUrl('ExecutiveDashboard')}>
              <button className="w-full p-3 bg-white rounded-lg border hover:border-purple-300 hover:shadow-md transition-all text-left">
                <p className="font-medium text-sm">{t({ en: 'Executive Dashboard', ar: 'لوحة القيادة' })}</p>
              </button>
            </Link>
            <Link to={createPageUrl('MyChallenges')}>
              <button className="w-full p-3 bg-white rounded-lg border hover:border-purple-300 hover:shadow-md transition-all text-left">
                <p className="font-medium text-sm">{t({ en: 'Municipality Portal', ar: 'بوابة البلدية' })}</p>
              </button>
            </Link>
            <Link to={createPageUrl('OpportunityFeed')}>
              <button className="w-full p-3 bg-white rounded-lg border hover:border-purple-300 hover:shadow-md transition-all text-left">
                <p className="font-medium text-sm">{t({ en: 'Startup Portal', ar: 'بوابة الشركات' })}</p>
              </button>
            </Link>
            <Link to={createPageUrl('AcademiaDashboard')}>
              <button className="w-full p-3 bg-white rounded-lg border hover:border-purple-300 hover:shadow-md transition-all text-left">
                <p className="font-medium text-sm">{t({ en: 'Academia Portal', ar: 'بوابة الباحثين' })}</p>
              </button>
            </Link>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" />
              {t({ en: 'Quick Actions', ar: 'إجراءات سريعة' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to={createPageUrl('ChallengeCreate')} className="block p-4 bg-white rounded-xl border hover:border-blue-300 hover:shadow-md transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{t({ en: 'Add Challenge', ar: 'إضافة تحدي' })}</p>
                  <p className="text-xs text-slate-500">{t({ en: 'Register new challenge', ar: 'تسجيل تحدي جديد' })}</p>
                </div>
              </div>
            </Link>

            <Link to={createPageUrl('PilotCreate')} className="block p-4 bg-white rounded-xl border hover:border-blue-300 hover:shadow-md transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <TestTube className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{t({ en: 'Create Pilot', ar: 'إنشاء تجربة' })}</p>
                  <p className="text-xs text-slate-500">{t({ en: 'Design pilot project', ar: 'تصميم مشروع تجريبي' })}</p>
                </div>
              </div>
            </Link>

            <Link to={createPageUrl('ProposalWizard')} className="block p-4 bg-white rounded-xl border hover:border-blue-300 hover:shadow-md transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{t({ en: 'Submit Proposal', ar: 'تقديم مقترح' })}</p>
                  <p className="text-xs text-slate-500">{t({ en: 'R&D proposal wizard', ar: 'معالج المقترحات' })}</p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="md:col-span-2 border-0 shadow-lg bg-gradient-to-br from-slate-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              {t({ en: 'Recent Activity', ar: 'النشاط الأخير' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-200 hover:shadow-md transition-all"
                  >
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <Icon className={`h-5 w-5 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{activity.title}</p>
                      <p className="text-sm text-slate-500">{activity.subtitle}</p>
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap">{activity.time}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Programs */}
      {programs.filter(p => p.status === 'applications_open' && p.is_published).length > 0 && (
        <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                {t({ en: 'Open for Applications', ar: 'مفتوحة للتقديم' })}
              </CardTitle>
              <Link to={createPageUrl('Programs')}>
                <Button size="sm" className="bg-purple-600">
                  {t({ en: 'All Programs', ar: 'كل البرامج' })}
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {programs.filter(p => p.status === 'applications_open' && p.is_published).slice(0, 3).map((program) => (
                <Link key={program.id} to={createPageUrl(`ProgramDetail?id=${program.id}`)}>
                  <Card className="hover:shadow-lg transition-all border hover:border-purple-400">
                    <CardContent className="pt-6">
                      <Badge className="mb-3 bg-purple-100 text-purple-700 text-xs">{program.program_type?.replace(/_/g, ' ')}</Badge>
                      <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">
                        {language === 'ar' && program.name_ar ? program.name_ar : program.name_en}
                      </h3>
                      {program.timeline?.application_close && (
                        <div className="flex items-center gap-1 text-xs text-red-600 mb-3">
                          <Clock className="h-3 w-3" />
                          <span>{t({ en: 'Deadline:', ar: 'الموعد:' })} {new Date(program.timeline.application_close).toLocaleDateString()}</span>
                        </div>
                      )}
                      <Button size="sm" className="w-full bg-purple-600">
                        {t({ en: 'Apply Now', ar: 'قدم الآن' })}
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trending Solutions */}
      <TrendingSolutionsWidget />

      {/* Platform Overview Widgets */}
      <PlatformStatsWidget />

      {/* Week Ahead & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MyWeekAhead />
        <PlatformInsightsWidget />
      </div>

      {/* Quick Actions & Persona Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActionsPanel userRole={user?.role} />

        {/* What's New Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-purple-600" />
              {t({ en: "What's New", ar: 'ما الجديد' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-3">
              {t({ en: 'Stay updated with the latest platform features and announcements', ar: 'ابق محدثاً بأحدث ميزات وإعلانات المنصة' })}
            </p>
            <Link to={createPageUrl('WhatsNewHub')}>
              <Button variant="outline" className="w-full" size="sm">
                {t({ en: 'View Announcements', ar: 'عرض الإعلانات' })}
              </Button>
            </Link>
          </CardContent>
        </Card>
        <PersonaDashboardWidget user={user} />
      </div>

      {/* National Map & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <NationalMap />
        </div>
        <div className="lg:col-span-1">
          <ActivityFeed limit={8} />
        </div>
      </div>

      {/* AI Work Prioritizer */}
      <MyWorkPrioritizer />

      {/* Smart AI Recommendation */}
      <SmartRecommendation 
        context="portfolio_view"
        entity={{
          challenge_count: challenges.length,
          pilot_count: pilots.length,
          solution_count: solutions.length
        }}
        entityType="portfolio"
      />

      {/* Deadline Alerts */}
      <DeadlineAlerts />

      {/* Development Progress */}
      <ProgressTracker />

      {/* Living Labs Dashboard */}
      <LivingLabDashboard />

      {/* Onboarding wizard is now handled in Layout.jsx */}

      {/* Expert Assignments Widget (if user is expert) */}
      {myExpertAssignments.length > 0 && (
        <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                {t({ en: 'Your Expert Assignments', ar: 'مهامك كخبير' })}
              </CardTitle>
              <Link to={createPageUrl('ExpertAssignmentQueue')}>
                <Button size="sm" className="bg-purple-600">
                  {t({ en: 'View All', ar: 'عرض الكل' })}
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myExpertAssignments.slice(0, 3).map((assignment) => (
                <div key={assignment.id} className="p-3 bg-white rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={
                      assignment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }>
                      {assignment.status}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {assignment.due_date ? t({ en: `Due: ${assignment.due_date}`, ar: `الموعد: ${assignment.due_date}` }) : ''}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-900">
                    {assignment.assignment_type} - {assignment.entity_type?.replace(/_/g, ' ')}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Insights Panel */}
      <Card className={`border-0 shadow-lg bg-gradient-to-br from-blue-50 via-white to-teal-50 ${isRTL ? 'border-r-4 border-r-blue-500' : 'border-l-4 border-l-blue-500'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            {t({ en: 'AI Insights & Recommendations', ar: 'رؤى وتوصيات الذكاء الاصطناعي' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 bg-white rounded-xl border border-blue-100">
            <p className="text-sm text-slate-700">
              <span className="font-semibold text-blue-600">{t({ en: 'Trend Alert:', ar: 'تنبيه الاتجاه:' })}</span>{' '}
              {t({ en: `${challenges.filter(c => c.sector === 'environment').length} environment challenges identified this quarter.`, ar: `${challenges.filter(c => c.sector === 'environment').length} تحدي بيئي تم تحديده هذا الربع.` })}
            </p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-teal-100">
            <p className="text-sm text-slate-700">
              <span className="font-semibold text-teal-600">{t({ en: 'Recommendation:', ar: 'التوصية:' })}</span>{' '}
              {t({ en: `${pilots.filter(p => (p.success_probability || 0) >= 85).length} pilots show high success probability and are ready for scale-up.`, ar: `${pilots.filter(p => (p.success_probability || 0) >= 85).length} تجربة تظهر احتمالية نجاح عالية وجاهزة للتوسع.` })}
            </p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-amber-100">
            <p className="text-sm text-slate-700">
              <span className="font-semibold text-amber-600">{t({ en: 'Opportunity:', ar: 'الفرصة:' })}</span>{' '}
              {t({ en: `${challenges.filter(c => c.track === 'r_and_d').length} challenges flagged for R&D track - consider launching targeted calls.`, ar: `${challenges.filter(c => c.track === 'r_and_d').length} تحدي محدد لمسار البحث - فكر في إطلاق دعوات موجهة.` })}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(Home, {
  requiredPermissions: []
});