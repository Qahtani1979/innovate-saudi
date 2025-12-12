import React from 'react';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  Building2,
  MapPin,
  Users,
  TrendingUp,
  Award,
  AlertCircle,
  TestTube,
  Target,
  Mail,
  Phone,
  BarChart3,
  FileText,
  Sparkles,
  Loader2,
  X
} from 'lucide-react';
import MIIImprovementAI from '../components/municipalities/MIIImprovementAI';
import PeerBenchmarkingTool from '../components/municipalities/PeerBenchmarkingTool';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

function MunicipalityProfile() {
  const urlParams = new URLSearchParams(window.location.search);
  const urlMunicipalityId = urlParams.get('id');
  const { language, isRTL, t } = useLanguage();
  const [showAIInsights, setShowAIInsights] = React.useState(false);
  const [aiInsights, setAiInsights] = React.useState(null);
  
  const { invokeAI, status: aiStatus, isLoading: aiLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  // Get user's municipality from auth context if no ID provided
  const { data: userProfile } = useQuery({
    queryKey: ['current-user-profile-for-municipality'],
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

  const { data: municipality, isLoading } = useQuery({
    queryKey: ['municipality', municipalityId],
    queryFn: async () => {
      const municipalities = await base44.entities.Municipality.list();
      return municipalities.find(m => m.id === municipalityId);
    },
    enabled: !!municipalityId
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['municipality-challenges', municipalityId],
    queryFn: async () => {
      const all = await base44.entities.Challenge.list();
      return all.filter(c => c.municipality_id === municipalityId);
    },
    enabled: !!municipalityId
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['municipality-pilots', municipalityId],
    queryFn: async () => {
      const all = await base44.entities.Pilot.list();
      return all.filter(p => p.municipality_id === municipalityId);
    },
    enabled: !!municipalityId
  });

  const { data: miiResults = [] } = useQuery({
    queryKey: ['mii-results', municipalityId],
    queryFn: async () => {
      const all = await base44.entities.MIIResult.list();
      return all.filter(r => r.city_id === municipalityId);
    },
    enabled: !!municipalityId
  });

  if (isLoading || !municipality) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  const latestMII = miiResults.sort((a, b) => b.period.localeCompare(a.period))[0];

  const radarData = latestMII?.dimension_scores ? [
    { dimension: 'Challenges', value: latestMII.dimension_scores.challenges_score || 0 },
    { dimension: 'Pilots', value: latestMII.dimension_scores.pilots_score || 0 },
    { dimension: 'Capacity', value: latestMII.dimension_scores.innovation_capacity_score || 0 },
    { dimension: 'Partners', value: latestMII.dimension_scores.partnership_score || 0 },
    { dimension: 'Digital', value: latestMII.dimension_scores.digital_maturity_score || 0 }
  ] : [];

  const handleAIInsights = async () => {
    setShowAIInsights(true);
    const result = await invokeAI({
      prompt: `Analyze this Saudi municipality for innovation performance and provide strategic insights in BOTH English AND Arabic:

Municipality: ${municipality.name_en}
Region: ${municipality.region}
City Type: ${municipality.city_type}
Population: ${municipality.population || 'N/A'}
MII Score: ${municipality.mii_score || 'N/A'}
MII Rank: ${municipality.mii_rank || 'N/A'}
Active Challenges: ${municipality.active_challenges || challenges.length}
Active Pilots: ${municipality.active_pilots || pilots.filter(p => p.stage === 'active').length}
Completed Pilots: ${municipality.completed_pilots || pilots.filter(p => p.stage === 'completed').length}

Provide bilingual insights (each item should have both English and Arabic versions):
1. MII improvement recommendations
2. Sector-specific focus areas for innovation
3. Capacity building needs
4. Partnership opportunities with other municipalities
5. Quick wins for score improvement`,
      response_json_schema: {
        type: 'object',
        properties: {
          mii_improvements: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
          sector_focus: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
          capacity_building: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
          partnership_opportunities: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
          quick_wins: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } }
        }
      }
    });
    
    if (result.success && result.data) {
      setAiInsights(result.data);
    }
  };

  return (
    <PageLayout>
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="outline" className="bg-white/20 text-white border-white/40 capitalize">
                  {municipality.city_type?.replace(/_/g, ' ')}
                </Badge>
                <Badge variant="outline" className="bg-white/20 text-white border-white/40">
                  #{municipality.mii_rank || 'N/A'} Nationally
                </Badge>
              </div>
              <h1 className="text-5xl font-bold mb-2">
                {language === 'ar' && municipality.name_ar ? municipality.name_ar : municipality.name_en}
              </h1>
              {municipality.name_ar && municipality.name_en && (
                <p className="text-xl text-white/90">
                  {language === 'en' ? municipality.name_ar : municipality.name_en}
                </p>
              )}
              <div className="flex items-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{municipality.region}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{municipality.population?.toLocaleString()} residents</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/40">
                <div className="text-5xl font-bold mb-1">{municipality.mii_score || 0}</div>
                <div className="text-sm">MII Score</div>
              </div>
              <Button className="bg-white text-emerald-600 hover:bg-white/90" onClick={handleAIInsights}>
                <Sparkles className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'AI Insights', ar: 'رؤى ذكية' })}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Modal */}
      {showAIInsights && (
        <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-emerald-700">
              <Sparkles className="h-5 w-5" />
              {t({ en: 'AI Strategic Insights', ar: 'الرؤى الاستراتيجية الذكية' })}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowAIInsights(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {aiLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                <span className={`${isRTL ? 'mr-3' : 'ml-3'} text-slate-600`}>{t({ en: 'Analyzing municipality...', ar: 'جاري تحليل البلدية...' })}</span>
              </div>
            ) : aiInsights ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aiInsights.mii_improvements?.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-700 mb-2">{t({ en: 'MII Improvements', ar: 'تحسينات المؤشر' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.mii_improvements.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.sector_focus?.length > 0 && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-700 mb-2">{t({ en: 'Sector Focus', ar: 'تركيز القطاعات' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.sector_focus.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.capacity_building?.length > 0 && (
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <h4 className="font-semibold text-amber-700 mb-2">{t({ en: 'Capacity Building', ar: 'بناء القدرات' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.capacity_building.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.partnership_opportunities?.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-700 mb-2">{t({ en: 'Partnerships', ar: 'الشراكات' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.partnership_opportunities.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.quick_wins?.length > 0 && (
                  <div className="p-4 bg-teal-50 rounded-lg md:col-span-2">
                    <h4 className="font-semibold text-teal-700 mb-2">{t({ en: 'Quick Wins', ar: 'المكاسب السريعة' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.quick_wins.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Challenges</p>
                <p className="text-sm text-slate-600" dir="rtl">التحديات</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{municipality.active_challenges || 0}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Pilots</p>
                <p className="text-sm text-slate-600" dir="rtl">التجارب النشطة</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{municipality.active_pilots || 0}</p>
              </div>
              <TestTube className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Completed</p>
                <p className="text-sm text-slate-600" dir="rtl">مكتمل</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{municipality.completed_pilots || 0}</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">MII Trend</p>
                <p className="text-sm text-slate-600" dir="rtl">اتجاه المؤشر</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">
                  {latestMII?.trend === 'up' ? '↑' : latestMII?.trend === 'down' ? '↓' : '→'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-auto">
          <TabsTrigger value="overview" className="flex flex-col gap-1 py-3">
            <FileText className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Overview', ar: 'نظرة' })}</span>
          </TabsTrigger>
          <TabsTrigger value="mii" className="flex flex-col gap-1 py-3">
            <BarChart3 className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'MII', ar: 'مؤشر' })}</span>
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex flex-col gap-1 py-3">
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Challenges', ar: 'تحديات' })}</span>
          </TabsTrigger>
          <TabsTrigger value="pilots" className="flex flex-col gap-1 py-3">
            <TestTube className="h-4 w-4" />
            <span className="text-xs">{t({ en: 'Pilots', ar: 'تجارب' })}</span>
          </TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Tab Contents */}

            <TabsContent value="overview" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Municipality Overview', ar: 'نظرة عامة على البلدية' })}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">{t({ en: 'Region', ar: 'المنطقة' })}</p>
                      <p className="font-medium text-slate-900">{municipality.region}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">{t({ en: 'City Type', ar: 'نوع المدينة' })}</p>
                      <p className="font-medium text-slate-900 capitalize">{municipality.city_type?.replace(/_/g, ' ')}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">{t({ en: 'Population', ar: 'السكان' })}</p>
                      <p className="font-medium text-slate-900">{municipality.population?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">{t({ en: 'MII Rank', ar: 'ترتيب المؤشر' })}</p>
                      <p className="font-medium text-slate-900">#{municipality.mii_rank || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mii" className="mt-6 space-y-6">
              <MIIImprovementAI municipality={municipality} />
              <PeerBenchmarkingTool municipality={municipality} />
              
              {latestMII ? (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'MII Dimension Breakdown', ar: 'تفصيل أبعاد المؤشر' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="dimension" />
                        <PolarRadiusAxis domain={[0, 100]} />
                        <Radar dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                      </RadarChart>
                    </ResponsiveContainer>

                    {latestMII.strengths && latestMII.strengths.length > 0 && (
                      <div className="mt-6 space-y-3">
                        <h4 className="font-semibold text-slate-900">{t({ en: 'Strengths', ar: 'نقاط القوة' })}</h4>
                        {latestMII.strengths.map((strength, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-green-700">
                            <Award className="h-4 w-4" />
                            <span>{strength}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {latestMII.improvement_areas && latestMII.improvement_areas.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <h4 className="font-semibold text-slate-900">{t({ en: 'Improvement Areas', ar: 'مجالات التحسين' })}</h4>
                        {latestMII.improvement_areas.map((area, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-amber-700">
                            <TrendingUp className="h-4 w-4" />
                            <span>{area}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">{t({ en: 'No MII data available', ar: 'لا توجد بيانات للمؤشر' })}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="challenges" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Municipality Challenges', ar: 'تحديات البلدية' })}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {challenges.map((challenge) => (
                      <Link
                        key={challenge.id}
                        to={createPageUrl(`ChallengeDetail?id=${challenge.id}`)}
                        className="block p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{challenge.code}</Badge>
                              <Badge>{challenge.status}</Badge>
                            </div>
                            <h3 className="font-medium text-slate-900">
                              {language === 'ar' && challenge.title_ar ? challenge.title_ar : challenge.title_en}
                            </h3>
                            <p className="text-sm text-slate-600 mt-1">{challenge.sector?.replace(/_/g, ' ')}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">{challenge.overall_score || 0}</div>
                            <div className="text-xs text-slate-500">Score</div>
                          </div>
                        </div>
                      </Link>
                    ))}
                    {challenges.length === 0 && (
                      <div className="text-center py-8">
                        <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">{t({ en: 'No challenges', ar: 'لا توجد تحديات' })}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pilots" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Municipality Pilots', ar: 'تجارب البلدية' })}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pilots.map((pilot) => (
                      <Link
                        key={pilot.id}
                        to={createPageUrl(`PilotDetail?id=${pilot.id}`)}
                        className="block p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{pilot.code}</Badge>
                              <Badge>{pilot.stage}</Badge>
                            </div>
                            <h3 className="font-medium text-slate-900">
                              {language === 'ar' && pilot.title_ar ? pilot.title_ar : pilot.title_en}
                            </h3>
                            <p className="text-sm text-slate-600 mt-1">{pilot.sector?.replace(/_/g, ' ')}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-purple-600">{pilot.success_probability || 0}%</div>
                            <div className="text-xs text-slate-500">Success</div>
                          </div>
                        </div>
                      </Link>
                    ))}
                    {pilots.length === 0 && (
                      <div className="text-center py-8">
                        <TestTube className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">{t({ en: 'No pilots', ar: 'لا توجد تجارب' })}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>

          {/* Right Sidebar */}
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Contact Information', ar: 'معلومات الاتصال' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Innovation Focal Point', ar: 'نقطة الاتصال للابتكار' })}</p>
                <p className="font-medium">{municipality.contact_person || 'N/A'}</p>
              </div>
              {municipality.contact_email && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">{t({ en: 'Email', ar: 'البريد' })}</p>
                  <a href={`mailto:${municipality.contact_email}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {municipality.contact_email}
                  </a>
                </div>
              )}
              {municipality.contact_phone && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">{t({ en: 'Phone', ar: 'الهاتف' })}</p>
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3 text-slate-400" />
                    <span className="text-sm">{municipality.contact_phone}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Tabs>
    </PageLayout>
  );
}

export default ProtectedPage(MunicipalityProfile, { requiredPermissions: [] });