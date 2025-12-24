import { useState } from 'react';
import { useLocations } from '@/hooks/useLocations';
import { useMIIBenchmarking } from '@/hooks/useMIIData';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import {
  TrendingUp,
  Award,
  MapPin,
  Sparkles,
  BarChart3,
  Zap,
  Loader2,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

function MIIPage() {
  const { language, isRTL, t } = useLanguage();
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedMunicipalities, setSelectedMunicipalities] = useState([]);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);

  const { invokeAI, status: aiStatus, isLoading: aiLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { useAllMunicipalities } = useLocations();
  const { data: municipalities = [], isLoading } = useAllMunicipalities();
  const { data: miiResults = [] } = useMIIBenchmarking();

  const filteredMunicipalities = municipalities.filter(m =>
    selectedRegion === 'all' || m.region === selectedRegion
  );

  const regions = [...new Set(municipalities.map(m => m.region))].filter(Boolean);

  const stats = {
    avgScore: municipalities.length > 0
      ? Math.round(municipalities.reduce((sum, m) => sum + (m.mii_score || 0), 0) / municipalities.length)
      : 0,
    improving: municipalities.filter(m => m.mii_score > 60).length,
    totalCities: municipalities.length,
    activePilots: municipalities.reduce((sum, m) => sum + (m.active_pilots || 0), 0)
  };

  // Get real radar data from mii_results or fallback to derived data
  const getRadarValues = (muni) => {
    const result = miiResults.find(r => r.municipality_id === muni.id);
    if (result?.dimension_scores) {
      return {
        Leadership: result.dimension_scores.LEADERSHIP?.score || 0,
        Strategy: result.dimension_scores.STRATEGY?.score || 0,
        Culture: result.dimension_scores.CULTURE?.score || 0,
        Partnerships: result.dimension_scores.PARTNERSHIPS?.score || 0,
        Capabilities: result.dimension_scores.CAPABILITIES?.score || 0,
        Impact: result.dimension_scores.IMPACT?.score || 0
      };
    }
    // Fallback to derived data
    return {
      Leadership: muni.mii_score || 50,
      Strategy: Math.min(100, (muni.mii_score || 50) * 0.9),
      Culture: Math.min(100, (muni.active_pilots || 0) * 10),
      Partnerships: Math.min(100, (muni.completed_pilots || 0) * 7),
      Capabilities: Math.min(100, (muni.active_challenges || 0) * 8),
      Impact: Math.min(100, (muni.mii_score || 50) * 0.85)
    };
  };

  const prepareComparisonData = () => {
    const indicators = ['Leadership', 'Strategy', 'Culture', 'Partnerships', 'Capabilities', 'Impact'];
    return indicators.map(indicator => {
      const point = { indicator };
      selectedMunicipalities.forEach((muni, index) => {
        const values = getRadarValues(muni);
        point[`muni_${muni.id}`] = values[indicator];
      });
      return point;
    });
  };

  const toggleMunicipalityCompare = (muni) => {
    if (selectedMunicipalities.find(m => m.id === muni.id)) {
      setSelectedMunicipalities(selectedMunicipalities.filter(m => m.id !== muni.id));
    } else if (selectedMunicipalities.length < 3) {
      setSelectedMunicipalities([...selectedMunicipalities, muni]);
    }
  };

  const handleAIInsights = async () => {
    setShowAIInsights(true);
    try {
      const topMunicipalities = municipalities.slice(0, 10).map(m => ({
        name: m.name_en,
        score: m.mii_score,
        rank: m.mii_rank,
        active_pilots: m.active_pilots,
        completed_pilots: m.completed_pilots
      }));

      const {
        MII_NATIONAL_INSIGHTS_PROMPT_TEMPLATE,
        MII_NATIONAL_INSIGHTS_RESPONSE_SCHEMA
      } = await import('@/lib/ai/prompts/mii/nationalInsights');

      const result = await invokeAI({
        prompt: MII_NATIONAL_INSIGHTS_PROMPT_TEMPLATE({
          topMunicipalities,
          avgScore: stats.avgScore,
          improving: stats.improving,
          totalCities: stats.totalCities,
          activePilots: stats.activePilots
        }),
        response_json_schema: MII_NATIONAL_INSIGHTS_RESPONSE_SCHEMA,
        system_prompt: "You are an expert municipal innovation analyst."
      });
      if (result.success && result.data) {
        setAiInsights(result.data);
      }
    } catch (error) {
      toast.error(t({ en: 'Failed to generate AI insights', ar: 'ÙØ´Ù„ ØªÙˆÙ„ÙŠØ¯ Ø§Ù„Ø±Ø¤Ù‰ Ø§Ù„Ø°ÙƒÙŠØ©' }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        icon={BarChart3}
        title={{ en: 'Municipal Innovation Index', ar: 'مؤشر الابتكار البلدي' }}
        subtitle={{ en: 'MII scores and rankings across municipalities', ar: 'نتائج وتصنيفات مؤشر الابتكار' }}
        description={null}
        stats={[
          { icon: Award, value: stats.avgScore, label: { en: 'Avg Score', ar: 'متوسط الدرجة' } },
          { icon: TrendingUp, value: stats.improving, label: { en: 'High Performers', ar: 'الأداء العالي' } },
          { icon: MapPin, value: stats.totalCities, label: { en: 'Municipalities', ar: 'البلديات' } },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setCompareMode(!compareMode)}>
              <BarChart3 className="h-4 w-4 mr-2" />
              {compareMode ? t({ en: 'Exit Compare', ar: 'إنهاء المقارنة' }) : t({ en: 'Compare', ar: 'مقارنة' })}
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleAIInsights}>
              <Sparkles className="h-4 w-4" />
              {t({ en: 'AI Insights', ar: 'رؤى ذكية' })}
            </Button>
          </div>
        }
        action={null}
        children={null}
      />

      {/* AI Insights Modal */}
      {showAIInsights && (
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Sparkles className="h-5 w-5" />
              {t({ en: 'AI MII Insights', ar: 'Ø±Ø¤Ù‰ Ø§Ù„Ù…Ø¤Ø´Ø± Ø§Ù„Ø°ÙƒÙŠØ©' })}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowAIInsights(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {aiLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className={`${isRTL ? 'mr-3' : 'ml-3'} text-slate-600`}>{t({ en: 'Analyzing MII data...', ar: 'Ø¬Ø§Ø±ÙŠ ØªØ­Ù„ÙŠÙ„ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø¤Ø´Ø±...' })}</span>
              </div>
            ) : aiInsights ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aiInsights.performance_trends?.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-700 mb-2">{t({ en: 'Performance Trends', ar: 'Ø§ØªØ¬Ø§Ù‡Ø§Øª Ø§Ù„Ø£Ø¯Ø§Ø¡' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.performance_trends.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          â€¢ {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.improvement_strategies?.length > 0 && (
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <h4 className="font-semibold text-amber-700 mb-2">{t({ en: 'Improvement Strategies', ar: 'Ø§Ø³ØªØ±Ø§ØªÙŠØ¬ÙŠØ§Øª Ø§Ù„ØªØ­Ø³ÙŠÙ†' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.improvement_strategies.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          â€¢ {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.best_practices?.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-700 mb-2">{t({ en: 'Best Practices', ar: 'Ø£ÙØ¶Ù„ Ø§Ù„Ù…Ù…Ø§Ø±Ø³Ø§Øª' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.best_practices.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          â€¢ {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.disparity_solutions?.length > 0 && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-700 mb-2">{t({ en: 'Disparity Solutions', ar: 'Ø­Ù„ÙˆÙ„ Ø§Ù„ØªÙØ§ÙˆØª' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.disparity_solutions.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          â€¢ {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.improvement_pathways?.length > 0 && (
                  <div className="p-4 bg-teal-50 rounded-lg md:col-span-2">
                    <h4 className="font-semibold text-teal-700 mb-2">{t({ en: 'Improvement Pathways', ar: 'Ù…Ø³Ø§Ø±Ø§Øª Ø§Ù„ØªØ­Ø³ÙŠÙ†' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.improvement_pathways.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          â€¢ {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Avg MII Score</p>
                <p className="text-sm text-slate-600" dir="rtl">Ù…ØªÙˆØ³Ø· Ø§Ù„Ù…Ø¤Ø´Ø±</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{stats.avgScore}</p>
              </div>
              <Award className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">High Performers</p>
                <p className="text-sm text-slate-600" dir="rtl">Ø§Ù„Ø£Ø¯Ø§Ø¡ Ø§Ù„Ø¹Ø§Ù„ÙŠ</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.improving}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Municipalities</p>
                <p className="text-sm text-slate-600" dir="rtl">Ø§Ù„Ø¨Ù„Ø¯ÙŠØ§Øª</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{stats.totalCities}</p>
              </div>
              <MapPin className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Pilots</p>
                <p className="text-sm text-slate-600" dir="rtl">Ø§Ù„ØªØ¬Ø§Ø±Ø¨ Ø§Ù„Ù†Ø´Ø·Ø©</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">{stats.activePilots}</p>
              </div>
              <Zap className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="bg-gradient-to-br from-blue-50 to-teal-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            {t({ en: 'AI MII Insights', ar: 'Ø±Ø¤Ù‰ Ø°ÙƒÙŠØ© Ù„Ù„Ù…Ø¤Ø´Ø±' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-white rounded-lg">
            <p className="text-sm font-medium text-green-700">
              âœ“ {t({ en: '12 municipalities improved their MII score this quarter', ar: '12 Ø¨Ù„Ø¯ÙŠØ© Ø­Ø³Ù†Øª Ù†ØªÙŠØ¬ØªÙ‡Ø§ Ù‡Ø°Ø§ Ø§Ù„Ø±Ø¨Ø¹' })}
            </p>
          </div>
          <div className="p-3 bg-white rounded-lg">
            <p className="text-sm font-medium text-blue-700">
              ðŸ’¡ {t({ en: 'Top improvement drivers: Digital services adoption and pilot completion rates', ar: 'Ø£Ù‡Ù… Ù…Ø­Ø±ÙƒØ§Øª Ø§Ù„ØªØ­Ø³ÙŠÙ†: ØªØ¨Ù†ÙŠ Ø§Ù„Ø®Ø¯Ù…Ø§Øª Ø§Ù„Ø±Ù‚Ù…ÙŠØ© ÙˆÙ…Ø¹Ø¯Ù„Ø§Øª Ø¥ÙƒÙ…Ø§Ù„ Ø§Ù„ØªØ¬Ø§Ø±Ø¨' })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder={t({ en: 'All Regions', ar: 'Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù…Ù†Ø§Ø·Ù‚' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'All Regions', ar: 'Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù…Ù†Ø§Ø·Ù‚' })}</SelectItem>
                {regions.map(region => (
                  <SelectItem key={region} value={region}>{region}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {compareMode && selectedMunicipalities.length > 0 && (
              <Badge variant="outline" className="text-sm">
                {selectedMunicipalities.length} {t({ en: 'selected for comparison', ar: 'Ù…Ø­Ø¯Ø¯Ø© Ù„Ù„Ù…Ù‚Ø§Ø±Ù†Ø©' })}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Comparison View */}
      {compareMode && selectedMunicipalities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Municipality Comparison', ar: 'Ù…Ù‚Ø§Ø±Ù†Ø© Ø§Ù„Ø¨Ù„Ø¯ÙŠØ§Øª' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={prepareComparisonData()}>
                <PolarGrid />
                <PolarAngleAxis dataKey="indicator" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Tooltip />
                <Legend />
                {selectedMunicipalities.map((muni, idx) => (
                  <Radar
                    key={muni.id}
                    name={language === 'ar' && muni.name_ar ? muni.name_ar : muni.name_en}
                    dataKey={`muni_${muni.id}`}
                    stroke={['#3b82f6', '#10b981', '#f59e0b'][idx]}
                    fill={['#3b82f6', '#10b981', '#f59e0b'][idx]}
                    fillOpacity={0.3}
                  />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Rankings Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'MII Rankings', ar: 'ØªØµÙ†ÙŠÙØ§Øª Ø§Ù„Ù…Ø¤Ø´Ø±' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredMunicipalities.map((muni, index) => (
              <div
                key={muni.id}
                onClick={() => compareMode && toggleMunicipalityCompare(muni)}
                className={`p-4 border rounded-lg transition-all ${compareMode ? 'cursor-pointer hover:border-blue-400' : ''
                  } ${selectedMunicipalities.find(m => m.id === muni.id) ? 'border-blue-500 bg-blue-50' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-center min-w-[60px]">
                      <div className={`text-2xl font-bold ${index === 0 ? 'text-yellow-600' :
                        index === 1 ? 'text-slate-400' :
                          index === 2 ? 'text-orange-600' :
                            'text-slate-600'
                        }`}>
                        {muni.mii_rank || index + 1}
                      </div>
                      <div className="text-xs text-slate-500">{t({ en: 'Rank', ar: 'Ø§Ù„ØªØ±ØªÙŠØ¨' })}</div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span className="font-medium text-slate-900">
                          {language === 'ar' && muni.name_ar ? muni.name_ar : muni.name_en}
                        </span>
                        <Badge variant="outline" className="text-xs">{muni.region}</Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                        <span>{muni.city_type?.replace(/_/g, ' ')}</span>
                        <span>â€¢</span>
                        <span>{muni.population?.toLocaleString()} {t({ en: 'residents', ar: 'Ù†Ø³Ù…Ø©' })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{muni.mii_score || 0}</div>
                      <div className="text-xs text-slate-500">{t({ en: 'MII Score', ar: 'Ø§Ù„Ù†ØªÙŠØ¬Ø©' })}</div>
                    </div>

                    <div className="text-center min-w-[80px]">
                      <div className="text-lg font-semibold text-slate-700">{muni.active_pilots || 0}</div>
                      <div className="text-xs text-slate-500">{t({ en: 'Active Pilots', ar: 'ØªØ¬Ø§Ø±Ø¨ Ù†Ø´Ø·Ø©' })}</div>
                    </div>

                    <div className="text-center min-w-[80px]">
                      <div className="text-lg font-semibold text-slate-700">{muni.completed_pilots || 0}</div>
                      <div className="text-xs text-slate-500">{t({ en: 'Completed', ar: 'Ù…ÙƒØªÙ…Ù„Ø©' })}</div>
                    </div>

                    <Link to={createPageUrl(`MunicipalityProfile?id=${muni.id}`)}>
                      <Button variant="outline" size="sm">
                        {t({ en: 'View Profile', ar: 'Ø¹Ø±Ø¶ Ø§Ù„Ù…Ù„Ù' })}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}

export default ProtectedPage(MIIPage, { requiredPermissions: [] });
