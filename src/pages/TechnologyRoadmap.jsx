import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Cpu, Sparkles, TrendingUp, Loader2, ArrowRight } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { TECHNOLOGY_ROADMAP_PROMPT_TEMPLATE, TECHNOLOGY_ROADMAP_RESPONSE_SCHEMA } from '@/lib/ai/prompts/technology/roadmap';
import { usePilotsWithVisibility } from '@/hooks/usePilotsWithVisibility';
import { useSolutionsWithVisibility } from '@/hooks/useSolutionsWithVisibility';
import { useRDProjects } from '@/hooks/useRDProjects';
import { toast } from 'sonner';

function TechnologyRoadmap() {
  const { language, isRTL, t } = useLanguage();
  const [aiRoadmap, setAiRoadmap] = useState(null);
  const { invokeAI, status, isLoading: loading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: pilots = [] } = usePilotsWithVisibility();
  const { data: solutions = [] } = useSolutionsWithVisibility();
  const { data: rdProjects = [] } = useRDProjects();

  const generateRoadmap = async () => {
    const pilotTech = pilots.map(p => p.technology_stack?.map(t => t.technology).join(', ')).filter(Boolean).slice(0, 10).join('; ');
    const solutionTech = solutions.map(s => s.technical_specifications?.technology_stack?.join(', ')).filter(Boolean).slice(0, 10).join('; ');
    const rdFocus = rdProjects.map(r => r.research_area_en).filter(Boolean).slice(0, 8).join(', ');

    const response = await invokeAI({
      prompt: TECHNOLOGY_ROADMAP_PROMPT_TEMPLATE({ pilotTech, solutionTech, rdFocus }),
      system_prompt: "You are an expert Technology Strategist for Innovate Saudi. Your goal is to analyze the current technology landscape and generate a roadmap for adoption.",
      response_json_schema: TECHNOLOGY_ROADMAP_RESPONSE_SCHEMA
    });

    if (response.success) {
      setAiRoadmap(response.data);
      toast.success(t({ en: 'Technology roadmap generated', ar: 'تم إنشاء خارطة التقنية' }));
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8 text-white">
        <h1 className="text-5xl font-bold mb-2">
          {t({ en: '🚀 Technology Roadmap', ar: '🚀 خارطة طريق التقنية' })}
        </h1>
        <p className="text-xl text-white/90">
          {t({ en: 'Technology adoption planning: emerging → pilot → mainstream', ar: 'تخطيط اعتماد التقنية: ناشئة → تجريب → سائدة' })}
        </p>
      </div>

      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-blue-900 mb-1 text-lg">
                {t({ en: 'AI Technology Roadmap Generator', ar: 'مولد خارطة التقنية الذكي' })}
              </p>
              <p className="text-sm text-slate-600">
                {t({ en: 'Analyze current technology landscape and generate adoption roadmap', ar: 'تحليل المشهد التقني الحالي وإنشاء خارطة الاعتماد' })}
              </p>
            </div>
            <Button onClick={generateRoadmap} disabled={loading || !isAvailable} className="bg-gradient-to-r from-blue-600 to-purple-600">
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {t({ en: 'Generate Roadmap', ar: 'إنشاء خارطة' })}
            </Button>
          </div>
          <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} className="mt-4" />
        </CardContent>
      </Card>

      {aiRoadmap && (
        <div className="space-y-6">
          {/* Emerging Technologies */}
          {aiRoadmap.emerging_tech?.length > 0 && (
            <Card className="border-2 border-blue-300">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Cpu className="h-5 w-5" />
                  {t({ en: '🔵 Emerging Technologies (0-12 months)', ar: '🔵 التقنيات الناشئة (0-12 شهر)' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiRoadmap.emerging_tech.map((tech, idx) => (
                    <div key={idx} className="p-4 bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <p className="font-bold text-blue-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          {language === 'ar' ? tech.tech_name_ar : tech.tech_name_en}
                        </p>
                        <Badge className={tech.priority === 'high' ? 'bg-red-600' : tech.priority === 'medium' ? 'bg-yellow-600' : 'bg-blue-600'}>
                          {tech.priority}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {tech.sectors?.map((s, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
                        ))}
                      </div>
                      <p className="text-sm text-slate-700 mb-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        {language === 'ar' ? tech.use_cases_ar : tech.use_cases_en}
                      </p>
                      <Badge variant="outline">{tech.timeline}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Maturing Technologies */}
          {aiRoadmap.maturing_tech?.length > 0 && (
            <Card className="border-2 border-purple-300">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="flex items-center gap-2 text-purple-900">
                  <TrendingUp className="h-5 w-5" />
                  {t({ en: '🟣 Maturing Technologies (1-2 years)', ar: '🟣 التقنيات الناضجة (1-2 سنة)' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {aiRoadmap.maturing_tech.map((tech, idx) => (
                    <div key={idx} className="p-4 bg-white border-2 border-purple-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-bold text-purple-900">
                          {language === 'ar' ? tech.tech_name_ar : tech.tech_name_en}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{tech.current_stage}</Badge>
                          <Badge className="bg-purple-600">{tech.pilots_count} pilots</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        {language === 'ar' ? tech.next_steps_ar : tech.next_steps_en}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mainstream Technologies */}
          {aiRoadmap.mainstream_tech?.length > 0 && (
            <Card className="border-2 border-green-300">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <ArrowRight className="h-5 w-5" />
                  {t({ en: '🟢 Mainstream Technologies (Ready to Scale)', ar: '🟢 التقنيات السائدة (جاهزة للتوسع)' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {aiRoadmap.mainstream_tech.map((tech, idx) => (
                    <div key={idx} className="p-4 bg-white border-2 border-green-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-bold text-green-900">
                          {language === 'ar' ? tech.tech_name_ar : tech.tech_name_en}
                        </p>
                        <Badge className="bg-green-600">{tech.deployment_readiness}</Badge>
                      </div>
                      <p className="text-sm text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        {language === 'ar' ? tech.scaling_plan_ar : tech.scaling_plan_en}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sector-Technology Map */}
          {aiRoadmap.sector_tech_map?.length > 0 && (
            <Card className="border-2 border-amber-300">
              <CardHeader>
                <CardTitle>{t({ en: 'Technology Priorities by Sector', ar: 'أولويات التقنية حسب القطاع' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiRoadmap.sector_tech_map.map((sector, idx) => (
                    <div key={idx} className="p-4 border rounded-lg">
                      <p className="font-semibold text-slate-900 mb-2">
                        {language === 'ar' ? sector.sector_ar : sector.sector_en}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {sector.priority_technologies?.map((tech, i) => (
                          <Badge key={i} variant="outline">{tech}</Badge>
                        ))}
                      </div>
                      <p className="text-sm text-slate-600">{sector.investment_recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!aiRoadmap && (
        <Card>
          <CardContent className="py-16 text-center">
            <Cpu className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">
              {t({ en: 'Generate AI roadmap to see technology adoption plan', ar: 'أنشئ خارطة ذكية لرؤية خطة اعتماد التقنية' })}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProtectedPage(TechnologyRoadmap, { requiredPermissions: [] });
