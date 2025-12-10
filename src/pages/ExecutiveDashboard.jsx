import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { TrendingUp, AlertTriangle, Target, Sparkles, MapPin, BarChart3, Map, Users, Zap, Award, CheckCircle2, Activity, Rocket, Bell, Shield, Microscope, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import NationalMap from '../components/NationalMap';
import AIRiskForecasting from '../components/executive/AIRiskForecasting';
import PriorityRecommendations from '../components/executive/PriorityRecommendations';
import ExecutiveBriefingGenerator from '../components/executive/ExecutiveBriefingGenerator';
import ProtectedPage from '../components/permissions/ProtectedPage';

function ExecutiveDashboard() {
  const { language, isRTL, t } = useLanguage();
  const [showMap, setShowMap] = useState(false);
  const { user } = useAuth();

  // RLS: Executive sees ALL data but prioritizes strategic/high-impact items
  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges-executive'],
    queryFn: async () => {
      const { data } = await supabase
        .from('challenges')
        .select('*')
        .order('overall_score', { ascending: false, nullsFirst: false })
        .limit(200);
      return data || [];
    }
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots-executive'],
    queryFn: async () => {
      const { data } = await supabase
        .from('pilots')
        .select('*')
        .order('success_probability', { ascending: false, nullsFirst: false })
        .limit(100);
      return data || [];
    }
  });

  const { data: municipalities = [] } = useQuery({
    queryKey: ['municipalities-executive'],
    queryFn: async () => {
      const { data } = await supabase.from('municipalities').select('*');
      return data || [];
    }
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['programs-executive'],
    queryFn: async () => {
      const { data } = await supabase.from('programs').select('*');
      return data || [];
    }
  });

  const { data: insights = [] } = useQuery({
    queryKey: ['executive-insights'],
    queryFn: async () => {
      const all = await base44.entities.PlatformInsight.list('-created_date');
      return all.filter(i => i.visibility === 'executive' && i.is_active);
    }
  });

  const { data: strategicPlans = [] } = useQuery({
    queryKey: ['strategic-plans-exec'],
    queryFn: () => base44.entities.StrategicPlan.list()
  });

  const { data: rdProjects = [] } = useQuery({
    queryKey: ['rd-projects-executive'],
    queryFn: () => base44.entities.RDProject.list('-trl_current', 100)
  });

  const { data: rdCalls = [] } = useQuery({
    queryKey: ['rd-calls-executive'],
    queryFn: () => base44.entities.RDCall.list()
  });

  // Strategic filters - Tier 1 & 2 priorities
  const strategicChallenges = challenges.filter(c => 
    c.priority === 'tier_1' || c.priority === 'tier_2' || 
    c.is_featured || c.overall_score >= 80 || 
    c.strategic_plan_ids?.length > 0
  );

  const criticalChallenges = challenges.filter(c => 
    c.escalation_level === 2 || (c.priority === 'tier_1' && c.status === 'submitted')
  );

  const flagshipPilots = pilots.filter(p => 
    p.is_flagship || p.success_probability >= 80 || 
    ['active', 'monitoring'].includes(p.stage)
  ).slice(0, 6);

  const scaledSolutions = pilots.filter(p => p.stage === 'scaled' || p.recommendation === 'scale');

  const sectorData = [
    { sector: t({ en: 'Urban', ar: 'عمراني' }), count: challenges.filter(c => c.sector === 'urban_design').length },
    { sector: t({ en: 'Transport', ar: 'نقل' }), count: challenges.filter(c => c.sector === 'transport').length },
    { sector: t({ en: 'Environment', ar: 'بيئة' }), count: challenges.filter(c => c.sector === 'environment').length },
    { sector: t({ en: 'Digital', ar: 'رقمي' }), count: challenges.filter(c => c.sector === 'digital_services').length },
    { sector: t({ en: 'Health', ar: 'صحة' }), count: challenges.filter(c => c.sector === 'health').length },
  ];

  const topMunicipalities = municipalities
    .sort((a, b) => (b.mii_score || 0) - (a.mii_score || 0))
    .slice(0, 5);

  const avgMIIScore = municipalities.length > 0 
    ? municipalities.reduce((sum, m) => sum + (m.mii_score || 0), 0) / municipalities.length 
    : 0;

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-900 to-blue-900 bg-clip-text text-transparent">
            {t({ en: 'Executive Dashboard', ar: 'لوحة القيادة التنفيذية' })}
          </h1>
          <p className="text-slate-600 mt-2">
            {t({ en: 'National innovation overview and strategic insights', ar: 'نظرة عامة وطنية ورؤى استراتيجية' })}
          </p>
        </div>
        <Link to={createPageUrl('ExecutiveStrategicChallengeQueue')}>
          <Button className="bg-gradient-to-r from-purple-600 to-indigo-600">
            <Zap className="h-4 w-4 mr-2" />
            {t({ en: 'Strategic Queue', ar: 'قائمة استراتيجية' })}
          </Button>
        </Link>
      </div>

      {/* Critical Alerts */}
      {criticalChallenges.length > 0 && (
        <Card className="border-2 border-red-500 bg-gradient-to-r from-red-50 to-orange-50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center">
                <Bell className="h-5 w-5 text-white animate-pulse" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-red-900 text-lg">
                  {criticalChallenges.length} {t({ en: 'Critical Challenge(s) Need Executive Attention', ar: 'تحديات حرجة تحتاج انتباه تنفيذي' })}
                </p>
                <p className="text-sm text-red-700">
                  {t({ en: 'Tier-1 priorities and escalated items requiring immediate decision', ar: 'أولويات المستوى 1 والعناصر المتصاعدة تتطلب قرار فوري' })}
                </p>
              </div>
              <Link to={createPageUrl('ExecutiveStrategicChallengeQueue')}>
                <Button className="bg-red-600 hover:bg-red-700">
                  {t({ en: 'Review Now', ar: 'مراجعة الآن' })}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Executive KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Strategic', ar: 'استراتيجية' })}</p>
                <p className="text-3xl font-bold text-purple-600">{strategicChallenges.length}</p>
                <p className="text-xs text-slate-500 mt-1">{t({ en: 'challenges', ar: 'تحديات' })}</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Active Pilots', ar: 'تجارب نشطة' })}</p>
                <p className="text-3xl font-bold text-blue-600">
                  {pilots.filter(p => ['active', 'monitoring'].includes(p.stage)).length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-2 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Scaled', ar: 'موسعة' })}</p>
                <p className="text-3xl font-bold text-green-600">{scaledSolutions.length}</p>
                <p className="text-xs text-slate-500 mt-1">{t({ en: 'solutions', ar: 'حلول' })}</p>
              </div>
              <Rocket className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-white border-2 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'High Risk', ar: 'مخاطر عالية' })}</p>
                <p className="text-3xl font-bold text-red-600">
                  {challenges.filter(c => c.severity_score >= 80).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-white border-2 border-teal-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Avg MII', ar: 'متوسط MII' })}</p>
                <p className="text-3xl font-bold text-teal-600">{avgMIIScore.toFixed(1)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white border-2 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Programs', ar: 'برامج' })}</p>
                <p className="text-3xl font-bold text-amber-600">
                  {programs.filter(p => p.status === 'active').length}
                </p>
              </div>
              <Award className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map & Sector View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t({ en: 'National Innovation Map', ar: 'خريطة الابتكار الوطنية' })}</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setShowMap(!showMap)}>
                <Map className="h-4 w-4 mr-2" />
                {showMap ? t({ en: 'Chart', ar: 'رسم' }) : t({ en: 'Map', ar: 'خريطة' })}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showMap ? (
              <NationalMap 
                municipalities={municipalities}
                onClick={(muni) => window.location.href = createPageUrl(`MunicipalityProfile?id=${muni.id}`)}
              />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={sectorData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sector" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-600" />
              {t({ en: 'Top Performing Municipalities', ar: 'البلديات الأفضل أداءً' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topMunicipalities.map((muni, idx) => (
                <Link key={muni.id} to={createPageUrl(`MunicipalityProfile?id=${muni.id}`)} className="flex items-center justify-between p-3 border rounded-lg hover:bg-blue-50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-white ${
                      idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-slate-400' : idx === 2 ? 'bg-amber-700' : 'bg-blue-600'
                    }`}>
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{language === 'ar' && muni.name_ar ? muni.name_ar : muni.name_en}</p>
                      <p className="text-xs text-slate-500">
                        {muni.active_challenges || 0} challenges • {muni.active_pilots || 0} pilots
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{muni.mii_score || 0}</div>
                    <div className="text-xs text-slate-500">MII</div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategic Challenges Requiring Decision */}
      <Card className="border-2 border-purple-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              {t({ en: 'Strategic Priorities Needing Decision', ar: 'الأولويات الاستراتيجية التي تحتاج قرار' })}
            </CardTitle>
            <Link to={createPageUrl('ExecutiveStrategicChallengeQueue')}>
              <Button size="sm" className="bg-purple-600">
                {t({ en: 'Full Queue', ar: 'القائمة الكاملة' })}
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {strategicChallenges.filter(c => 
            ['submitted', 'under_review', 'approved'].includes(c.status) && !c.track
          ).slice(0, 5).map((challenge) => (
            <Link key={challenge.id} to={createPageUrl(`ChallengeDetail?id=${challenge.id}`)}>
              <div className="p-4 border-2 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="font-mono text-xs">{challenge.code}</Badge>
                      <Badge className={
                        challenge.priority === 'tier_1' ? 'bg-red-600' :
                        challenge.priority === 'tier_2' ? 'bg-orange-600' :
                        'bg-blue-600'
                      }>{challenge.priority}</Badge>
                      {challenge.is_featured && (
                        <Badge className="bg-purple-600">
                          <Zap className="h-3 w-3 mr-1" />
                          {t({ en: 'Featured', ar: 'مميز' })}
                        </Badge>
                      )}
                      {challenge.escalation_level > 0 && (
                        <Badge className="bg-red-600 animate-pulse">
                          {t({ en: 'SLA Alert', ar: 'تنبيه SLA' })}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-slate-900">
                      {language === 'ar' && challenge.title_ar ? challenge.title_ar : challenge.title_en}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">{challenge.sector?.replace(/_/g, ' ')} • {challenge.municipality_id?.substring(0, 25)}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">{challenge.overall_score || 0}</div>
                    <div className="text-xs text-slate-500">{t({ en: 'Score', ar: 'نقاط' })}</div>
                  </div>
                </div>
                {challenge.strategic_plan_ids?.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-indigo-700">
                    <Shield className="h-3 w-3" />
                    <span>{t({ en: 'Linked to', ar: 'مرتبط بـ' })} {challenge.strategic_plan_ids.length} {t({ en: 'strategic objective(s)', ar: 'هدف استراتيجي' })}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
          {strategicChallenges.filter(c => !c.track).length === 0 && (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-3" />
              <p className="text-slate-500">{t({ en: 'All strategic challenges have assigned tracks', ar: 'جميع التحديات الاستراتيجية لها مسارات معينة' })}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Flagship Pilots */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-blue-600" />
              {t({ en: 'Flagship & High-Impact Pilots', ar: 'التجارب الرائدة وعالية التأثير' })}
            </CardTitle>
            <Link to={createPageUrl('Pilots') + '?filter=flagship'}>
              <Button size="sm" variant="outline">
                {t({ en: 'View All', ar: 'عرض الكل' })}
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {flagshipPilots.map((pilot) => (
              <Link key={pilot.id} to={createPageUrl(`PilotDetail?id=${pilot.id}`)}>
                <Card className="hover:shadow-lg transition-all border-2 hover:border-blue-300">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-blue-100 text-blue-700 text-xs">{pilot.stage?.replace(/_/g, ' ')}</Badge>
                      {pilot.is_flagship && (
                        <Badge className="bg-purple-600 text-white text-xs">
                          <Award className="h-3 w-3 mr-1" />
                          {t({ en: 'Flagship', ar: 'رائد' })}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                      {language === 'ar' && pilot.title_ar ? pilot.title_ar : pilot.title_en}
                    </h3>
                    <p className="text-xs text-slate-600 mb-3">{pilot.sector?.replace(/_/g, ' ')}</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">{t({ en: 'Success Prob.', ar: 'احتمال النجاح' })}</span>
                        <span className="font-bold text-green-600">{pilot.success_probability || 0}%</span>
                      </div>
                      <div className="flex-1 bg-slate-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            (pilot.success_probability || 0) >= 80 ? 'bg-green-600' :
                            (pilot.success_probability || 0) >= 60 ? 'bg-blue-600' :
                            'bg-amber-600'
                          }`}
                          style={{ width: `${pilot.success_probability || 0}%` }} 
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card className="bg-gradient-to-br from-blue-50 to-teal-50 border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            {t({ en: 'AI Strategic Intelligence', ar: 'الذكاء الاستراتيجي الذكي' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {insights.length > 0 ? (
            insights.slice(0, 5).map((insight) => {
              const colorMap = {
                success: 'bg-green-50 border-green-300 text-green-800',
                warning: 'bg-yellow-50 border-yellow-300 text-yellow-800',
                recommendation: 'bg-blue-50 border-blue-300 text-blue-800',
                alert: 'bg-red-50 border-red-300 text-red-800',
                opportunity: 'bg-purple-50 border-purple-300 text-purple-800'
              };
              return (
                <div key={insight.id} className={`p-4 rounded-lg border-2 ${colorMap[insight.insight_type] || colorMap.recommendation}`}>
                  <p className="text-sm font-semibold mb-1">
                    {language === 'ar' && insight.title_ar ? insight.title_ar : insight.title_en}
                  </p>
                  {insight.description_en && (
                    <p className="text-xs opacity-90">
                      {language === 'ar' && insight.description_ar ? insight.description_ar : insight.description_en}
                    </p>
                  )}
                  {insight.confidence_score && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      {t({ en: 'Confidence:', ar: 'الثقة:' })} {insight.confidence_score}%
                    </Badge>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-4 bg-white rounded-lg border text-center">
              <Sparkles className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">
                {t({ en: 'No active AI insights', ar: 'لا توجد رؤى ذكية نشطة' })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Strategic Programs */}
      <Card className="border-2 border-pink-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-pink-600" />
              {t({ en: 'Strategic Innovation Programs', ar: 'برامج الابتكار الاستراتيجية' })}
            </CardTitle>
            <div className="flex gap-2">
              <Link to={createPageUrl('ProgramROIDashboard')}>
                <Button size="sm" variant="outline">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {t({ en: 'ROI', ar: 'العائد' })}
                </Button>
              </Link>
              <Link to={createPageUrl('Programs')}>
                <Button size="sm" className="bg-pink-600">
                  {t({ en: 'All Programs', ar: 'كل البرامج' })}
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {programs.filter(p => 
              p.is_featured || 
              p.status === 'active' ||
              p.strategic_objective_ids?.length > 0
            ).slice(0, 6).map((program) => {
              const appCount = program.application_count || 0;
              const acceptedCount = program.accepted_count || 0;
              const outcomeScore = (program.outcomes?.pilots_generated || 0) + (program.outcomes?.solutions_deployed || 0);
              
              return (
                <Link key={program.id} to={createPageUrl(`ProgramDetail?id=${program.id}`)}>
                  <Card className="hover:shadow-lg transition-all border-2 hover:border-pink-400">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={
                          program.status === 'active' ? 'bg-green-100 text-green-700 text-xs' :
                          program.status === 'applications_open' ? 'bg-blue-100 text-blue-700 text-xs' :
                          'bg-slate-100 text-slate-700 text-xs'
                        }>{program.status?.replace(/_/g, ' ')}</Badge>
                        {program.is_featured && (
                          <Badge className="bg-pink-600 text-white text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            {t({ en: 'Featured', ar: 'مميز' })}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                        {language === 'ar' && program.name_ar ? program.name_ar : program.name_en}
                      </h3>
                      <p className="text-xs text-slate-600 mb-3">{program.program_type?.replace(/_/g, ' ')}</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600">{t({ en: 'Applications', ar: 'طلبات' })}</span>
                          <span className="font-bold text-blue-600">{appCount}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600">{t({ en: 'Accepted', ar: 'مقبول' })}</span>
                          <span className="font-bold text-green-600">{acceptedCount}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600">{t({ en: 'Outcomes', ar: 'نتائج' })}</span>
                          <span className="font-bold text-purple-600">{outcomeScore}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* R&D Portfolio */}
      <Card className="border-2 border-indigo-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Microscope className="h-5 w-5 text-indigo-600" />
              {t({ en: 'R&D Portfolio', ar: 'محفظة البحث والتطوير' })}
            </CardTitle>
            <Link to={createPageUrl('RDPortfolioControlDashboard')}>
              <Button size="sm" className="bg-indigo-600">
                {t({ en: 'Portfolio Dashboard', ar: 'لوحة المحفظة' })}
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">{rdProjects.filter(r => r.status === 'active').length}</div>
              <div className="text-xs text-slate-600 mt-1">{t({ en: 'Active Projects', ar: 'مشاريع نشطة' })}</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{rdProjects.filter(r => r.status === 'completed').length}</div>
              <div className="text-xs text-slate-600 mt-1">{t({ en: 'Completed', ar: 'مكتمل' })}</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{rdCalls.filter(c => c.status === 'open').length}</div>
              <div className="text-xs text-slate-600 mt-1">{t({ en: 'Open Calls', ar: 'دعوات مفتوحة' })}</div>
            </div>
            <div className="text-center p-4 bg-teal-50 rounded-lg">
              <div className="text-3xl font-bold text-teal-600">
                {rdProjects.length > 0 ? (rdProjects.reduce((sum, r) => sum + (r.trl_current || 0), 0) / rdProjects.length).toFixed(1) : '0'}
              </div>
              <div className="text-xs text-slate-600 mt-1">{t({ en: 'Avg TRL', ar: 'متوسط TRL' })}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {rdProjects.filter(r => r.trl_current >= 7 || r.is_featured).slice(0, 3).map(project => (
              <Link key={project.id} to={createPageUrl(`RDProjectDetail?id=${project.id}`)}>
                <Card className="hover:shadow-lg transition-all border hover:border-indigo-400">
                  <CardContent className="pt-4">
                    <Badge className="mb-2 text-xs bg-indigo-100 text-indigo-700">TRL {project.trl_current || project.trl_start}</Badge>
                    <h4 className="font-semibold text-sm line-clamp-2 mb-2">
                      {language === 'ar' && project.title_ar ? project.title_ar : project.title_en}
                    </h4>
                    <p className="text-xs text-slate-600">{project.institution_en || project.institution}</p>
                    <Badge className="mt-2 text-xs" variant="outline">{project.status}</Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Policy Pipeline */}
      <PolicyPipelineWidget />

      {/* AI Components */}
      <AIRiskForecasting />
      <PriorityRecommendations />
      <ExecutiveBriefingGenerator />
    </div>
  );
}

export default ProtectedPage(ExecutiveDashboard, { 
  requiredPermissions: ['executive_view'],
  requireAdmin: true 
});