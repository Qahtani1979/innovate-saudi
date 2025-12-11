import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Award, TrendingUp, AlertCircle, TestTube, Target, Building2, Users, Zap } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function MIIDrillDown() {
  const { language, isRTL, t } = useLanguage();
  const urlParams = new URLSearchParams(window.location.search);
  const urlMunicipalityId = urlParams.get('id');

  // Get user's municipality from auth context if no ID provided
  const { data: userProfile } = useQuery({
    queryKey: ['current-user-profile-for-mii'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return null;
      const { data } = await supabase
        .from('user_profiles')
        .select('municipality_id')
        .eq('user_id', session.user.id)
        .maybeSingle();
      return data;
    },
    enabled: !urlMunicipalityId
  });

  // Use URL param if provided, otherwise fallback to user's municipality
  const municipalityId = urlMunicipalityId || userProfile?.municipality_id;

  const { data: municipality } = useQuery({
    queryKey: ['municipality', municipalityId],
    queryFn: async () => {
      const muns = await base44.entities.Municipality.list();
      return muns.find(m => m.id === municipalityId);
    },
    enabled: !!municipalityId
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['mun-challenges', municipalityId],
    queryFn: async () => {
      const all = await base44.entities.Challenge.list();
      return all.filter(c => c.municipality_id === municipalityId);
    },
    enabled: !!municipalityId
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['mun-pilots', municipalityId],
    queryFn: async () => {
      const all = await base44.entities.Pilot.list();
      return all.filter(p => p.municipality_id === municipalityId);
    },
    enabled: !!municipalityId
  });

  const { data: allMunicipalities = [] } = useQuery({
    queryKey: ['all-municipalities'],
    queryFn: () => base44.entities.Municipality.list()
  });

  if (!municipality) {
    return <div className="text-center py-12">{t({ en: 'Loading...', ar: 'جاري التحميل...' })}</div>;
  }

  // MII dimensions (mock data - in real system from MIIResult)
  const radarData = [
    { dimension: 'Leadership', score: municipality.mii_score || 75 },
    { dimension: 'Strategy', score: (municipality.mii_score || 75) - 5 },
    { dimension: 'Innovation', score: (municipality.mii_score || 75) + 3 },
    { dimension: 'Partnerships', score: (municipality.mii_score || 75) - 10 },
    { dimension: 'Impact', score: (municipality.mii_score || 75) + 5 },
    { dimension: 'Sustainability', score: (municipality.mii_score || 75) - 2 }
  ];

  // Historical trend (mock - would come from MIIResult time series)
  const trendData = [
    { year: '2022', score: (municipality.mii_score || 75) - 15 },
    { year: '2023', score: (municipality.mii_score || 75) - 8 },
    { year: '2024', score: (municipality.mii_score || 75) - 3 },
    { year: '2025', score: municipality.mii_score || 75 }
  ];

  const avgScore = allMunicipalities.reduce((sum, m) => sum + (m.mii_score || 0), 0) / (allMunicipalities.length || 1);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
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
            <TrendingUp className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-amber-600">+{((municipality.mii_score || 0) - trendData[0].score).toFixed(0)}</div>
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
                <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
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

      {/* AI Recommendations */}
      <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Zap className="h-5 w-5" />
            {t({ en: 'AI Improvement Recommendations', ar: 'توصيات التحسين الذكية' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 bg-white rounded-lg">
              <p className="font-semibold text-purple-900 mb-2">💡 {t({ en: 'Focus Area: Partnerships', ar: 'مجال التركيز: الشراكات' })}</p>
              <p className="text-sm text-slate-700">{t({ en: 'Score below national average. Recommend engaging with universities and private sector.', ar: 'الدرجة أقل من المتوسط الوطني. يوصى بالتعامل مع الجامعات والقطاع الخاص.' })}</p>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <p className="font-semibold text-blue-900 mb-2">📊 {t({ en: 'Quick Win: Complete 2 pilots', ar: 'نجاح سريع: أكمل تجربتين' })}</p>
              <p className="text-sm text-slate-700">{t({ en: 'Would boost Impact score by ~5 points.', ar: 'سيعزز درجة التأثير بحوالي 5 نقاط.' })}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}