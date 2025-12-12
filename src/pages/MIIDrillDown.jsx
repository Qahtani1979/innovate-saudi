import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { Link, Navigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Award, TrendingUp, AlertCircle, TestTube, Target, Building2, Users, Zap, ShieldAlert, ArrowUp, ArrowDown, Minus, RefreshCw, CheckCircle2, Loader2 } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';
import { usePermissions } from '@/components/permissions/usePermissions';
import { useMIIData } from '@/hooks/useMIIData';
import MIIImprovementAI from '@/components/municipalities/MIIImprovementAI';
import PeerBenchmarkingTool from '@/components/municipalities/PeerBenchmarkingTool';
import { toast } from 'sonner';

export default function MIIDrillDown() {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [isRecalculating, setIsRecalculating] = useState(false);
  const urlParams = new URLSearchParams(window.location.search);
  const urlMunicipalityId = urlParams.get('id');
  
  const { 
    isAdmin, 
    isDeputyship, 
    hasPermission, 
    profile,
    isLoading: permissionsLoading 
  } = usePermissions();

  // Determine if user has oversight role (can view any municipality)
  const hasOversightAccess = isAdmin || isDeputyship || hasPermission('analytics_view_all');
  
  // Get user's municipality ID
  const userMunicipalityId = profile?.municipality_id;

  // Determine which municipality to show
  // - If URL has id param and user has oversight access, use URL param
  // - Otherwise, use user's own municipality
  const municipalityId = (urlMunicipalityId && hasOversightAccess) 
    ? urlMunicipalityId 
    : (urlMunicipalityId === userMunicipalityId ? urlMunicipalityId : userMunicipalityId);

  // Check if user is trying to access another municipality without permission
  const isUnauthorizedAccess = urlMunicipalityId && 
    urlMunicipalityId !== userMunicipalityId && 
    !hasOversightAccess;

  const { data: municipality } = useQuery({
    queryKey: ['municipality', municipalityId],
    queryFn: async () => {
      const muns = await base44.entities.Municipality.list();
      return muns.find(m => m.id === municipalityId);
    },
    enabled: !!municipalityId && !isUnauthorizedAccess
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['mun-challenges', municipalityId],
    queryFn: async () => {
      const all = await base44.entities.Challenge.list();
      return all.filter(c => c.municipality_id === municipalityId);
    },
    enabled: !!municipalityId && !isUnauthorizedAccess
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['mun-pilots', municipalityId],
    queryFn: async () => {
      const all = await base44.entities.Pilot.list();
      return all.filter(p => p.municipality_id === municipalityId);
    },
    enabled: !!municipalityId && !isUnauthorizedAccess
  });

  const { data: allMunicipalities = [] } = useQuery({
    queryKey: ['all-municipalities'],
    queryFn: () => base44.entities.Municipality.list(),
    enabled: hasOversightAccess
  });

  // Use centralized MII data hook for real data
  const { 
    radarData: miiRadarData, 
    trendData: miiTrendData, 
    yoyGrowth, 
    rankChange, 
    trend,
    strengths,
    improvementAreas,
    nationalStats,
    hasData: hasMIIData 
  } = useMIIData(municipalityId);

  // Check permissions
  if (permissionsLoading) {
    return <div className="text-center py-12">{t({ en: 'Loading...', ar: 'جاري التحميل...' })}</div>;
  }

  // Check if user has analytics_view permission
  if (!hasPermission('analytics_view') && !isAdmin) {
    return (
      <PageLayout>
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="pt-6 text-center">
            <ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-destructive mb-2">
              {t({ en: 'Access Denied', ar: 'تم رفض الوصول' })}
            </h2>
            <p className="text-muted-foreground">
              {t({ en: 'You do not have permission to view MII analytics.', ar: 'ليس لديك إذن لعرض تحليلات المؤشر.' })}
            </p>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  // Redirect unauthorized access to own municipality
  if (isUnauthorizedAccess && userMunicipalityId) {
    return <Navigate to={`/mii-drill-down?id=${userMunicipalityId}`} replace />;
  }

  if (!municipality) {
    return <div className="text-center py-12">{t({ en: 'Loading...', ar: 'جاري التحميل...' })}</div>;
  }

  // Use real data from useMIIData hook, fallback to calculated values if no data
  const radarData = miiRadarData.length > 0 ? miiRadarData : [
    { dimension: 'Leadership', value: municipality.mii_score || 75 },
    { dimension: 'Strategy', value: (municipality.mii_score || 75) - 5 },
    { dimension: 'Culture', value: (municipality.mii_score || 75) - 8 },
    { dimension: 'Partnerships', value: (municipality.mii_score || 75) - 10 },
    { dimension: 'Capabilities', value: (municipality.mii_score || 75) + 2 },
    { dimension: 'Impact', value: (municipality.mii_score || 75) + 5 }
  ];

  // Use real historical data, fallback to mock
  const trendData = miiTrendData.length > 0 ? miiTrendData : [
    { year: 2023, score: (municipality.mii_score || 75) - 15 },
    { year: 2024, score: (municipality.mii_score || 75) - 8 },
    { year: 2025, score: municipality.mii_score || 75 }
  ];

  const avgScore = nationalStats?.averageScore || (allMunicipalities.reduce((sum, m) => sum + (m.mii_score || 0), 0) / (allMunicipalities.length || 1));
  
  // Calculate display YoY growth
  const displayYoYGrowth = yoyGrowth !== null ? yoyGrowth : (trendData.length >= 2 ? trendData[trendData.length - 1].score - trendData[trendData.length - 2].score : 0);

  // Trend icon
  const TrendIcon = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-amber-600';

  // Recalculate MII function
  const handleRecalculateMII = async () => {
    setIsRecalculating(true);
    try {
      const { data, error } = await supabase.functions.invoke('calculate-mii', {
        body: { municipality_id: municipalityId }
      });
      
      if (error) throw error;
      
      toast.success(t({ 
        en: `MII recalculated: ${data.results?.[0]?.overall_score || 'N/A'} points`, 
        ar: `تم إعادة حساب المؤشر: ${data.results?.[0]?.overall_score || 'N/A'} نقطة` 
      }));
      
      // Refresh data
      queryClient.invalidateQueries(['municipality', municipalityId]);
      queryClient.invalidateQueries(['mii-latest-result', municipalityId]);
      queryClient.invalidateQueries(['mii-history', municipalityId]);
    } catch (error) {
      console.error('Recalculation failed:', error);
      toast.error(t({ en: 'Recalculation failed', ar: 'فشلت إعادة الحساب' }));
    } finally {
      setIsRecalculating(false);
    }
  };

  return (
    <PageLayout>
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 to-teal-600 p-8 text-white">
        <div>
          <Badge variant="outline" className="bg-white/20 text-white border-white/40 mb-3">
            {municipality.region} • {municipality.city_type?.replace(/_/g, ' ')}
          </Badge>
          <h1 className="text-5xl font-bold mb-2">
            {language === 'ar' && municipality.name_ar ? municipality.name_ar : municipality.name_en}
          </h1>
          <div className="flex items-center gap-8 mt-6">
            <div>
              <div className="text-6xl font-bold">{municipality.mii_score || 0}</div>
              <div className="text-sm opacity-90">{t({ en: 'MII Score', ar: 'درجة المؤشر' })}</div>
            </div>
            <div>
              <div className="text-4xl font-bold">#{municipality.mii_rank || '-'}</div>
              <div className="text-sm opacity-90">{t({ en: 'National Rank', ar: 'الترتيب الوطني' })}</div>
            </div>
            <div className="flex-1">
              <Progress value={(municipality.mii_score || 0)} className="h-4 bg-white/20" />
              <p className="text-xs mt-2 opacity-80">
                {municipality.mii_score > avgScore ? 
                  t({ en: 'Above national average', ar: 'أعلى من المتوسط الوطني' }) : 
                  t({ en: 'Below national average', ar: 'أقل من المتوسط الوطني' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-white">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-red-600">{challenges.length}</div>
            <div className="text-sm text-slate-600">{t({ en: 'Challenges', ar: 'تحديات' })}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <TestTube className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-blue-600">{municipality.active_pilots || 0}</div>
            <div className="text-sm text-slate-600">{t({ en: 'Active Pilots', ar: 'تجارب نشطة' })}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-green-600">{municipality.completed_pilots || 0}</div>
            <div className="text-sm text-slate-600">{t({ en: 'Completed', ar: 'مكتمل' })}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-purple-600">{municipality.population ? (municipality.population / 1000).toFixed(0) + 'K' : '-'}</div>
            <div className="text-sm text-slate-600">{t({ en: 'Population', ar: 'السكان' })}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6 text-center">
            <TrendIcon className={`h-8 w-8 mx-auto mb-2 ${trendColor}`} />
            <div className={`text-3xl font-bold ${trendColor}`}>
              {displayYoYGrowth > 0 ? '+' : ''}{displayYoYGrowth.toFixed(0)}
            </div>
            <div className="text-sm text-slate-600">{t({ en: 'YoY Growth', ar: 'النمو السنوي' })}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MII Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'MII Dimensions Breakdown', ar: 'تفصيل أبعاد المؤشر' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="dimension" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Score" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                {nationalStats && <Radar name="National Avg" dataKey="nationalAvg" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.2} />}
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Historical Trend */}
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'MII Score Evolution', ar: 'تطور الدرجة' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} name="MII Score" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Innovation Initiatives */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Active Innovation Initiatives', ar: 'مبادرات الابتكار النشطة' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challenges.slice(0, 6).map((challenge) => (
              <Link
                key={challenge.id}
                to={createPageUrl(`ChallengeDetail?id=${challenge.id}`)}
                className="p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-2 font-mono text-xs">{challenge.code}</Badge>
                    <h4 className="font-medium text-sm text-slate-900">
                      {language === 'ar' && challenge.title_ar ? challenge.title_ar : challenge.title_en}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">{challenge.sector?.replace(/_/g, ' ')}</p>
                  </div>
                  <Badge className={
                    challenge.status === 'approved' ? 'bg-green-100 text-green-700' :
                    challenge.status === 'in_treatment' ? 'bg-purple-100 text-purple-700' :
                    'bg-slate-100 text-slate-700'
                  }>{challenge.status}</Badge>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Pilots */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Active Pilots', ar: 'التجارب النشطة' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pilots.filter(p => p.stage === 'active' || p.stage === 'monitoring').slice(0, 5).map((pilot) => (
              <Link
                key={pilot.id}
                to={createPageUrl(`PilotDetail?id=${pilot.id}`)}
                className="block p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900">
                      {language === 'ar' && pilot.title_ar ? pilot.title_ar : pilot.title_en}
                    </h4>
                    <p className="text-sm text-slate-600 mt-1">{pilot.sector?.replace(/_/g, ' ')}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{pilot.success_probability || 0}%</div>
                    <div className="text-xs text-slate-500">{t({ en: 'Success', ar: 'نجاح' })}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strengths & Improvement Areas */}
      {(strengths.length > 0 || improvementAreas.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {strengths.length > 0 && (
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-5 w-5" />
                  {t({ en: 'Strengths', ar: 'نقاط القوة' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {strengths.map((strength, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-green-800">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          
          {improvementAreas.length > 0 && (
            <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-700">
                  <TrendingUp className="h-5 w-5" />
                  {t({ en: 'Areas for Improvement', ar: 'مجالات التحسين' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {improvementAreas.map((area, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-amber-800">
                      <Target className="h-4 w-4 mt-0.5 text-amber-600" />
                      {area}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* AI Improvement Plan & Peer Benchmarking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MIIImprovementAI municipality={municipality} />
        <PeerBenchmarkingTool municipality={municipality} />
      </div>

      {/* Admin: Recalculate MII Button */}
      {isAdmin && (
        <Card className="border-dashed border-2 border-slate-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-900">
                  {t({ en: 'MII Calculation', ar: 'حساب المؤشر' })}
                </h4>
                <p className="text-sm text-slate-600">
                  {t({ 
                    en: 'Recalculate MII score based on current data (challenges, pilots, partnerships)', 
                    ar: 'إعادة حساب درجة المؤشر بناءً على البيانات الحالية' 
                  })}
                </p>
              </div>
              <Button 
                onClick={handleRecalculateMII} 
                disabled={isRecalculating}
                variant="outline"
                className="gap-2"
              >
                {isRecalculating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t({ en: 'Calculating...', ar: 'جاري الحساب...' })}
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    {t({ en: 'Recalculate MII', ar: 'إعادة حساب المؤشر' })}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}