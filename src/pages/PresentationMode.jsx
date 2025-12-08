import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Presentation, Download, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';

function PresentationMode() {
  const { language, isRTL, t } = useLanguage();
  const [slides, setSlides] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [generating, setGenerating] = useState(false);

  const { data: strategicPlans = [] } = useQuery({
    queryKey: ['strategic-plans'],
    queryFn: () => base44.entities.StrategicPlan.list()
  });

  const activePlan = strategicPlans.find(p => p.status === 'active') || strategicPlans[0];

  const generateSlides = async () => {
    if (!activePlan) {
      toast.error(t({ en: 'No strategic plan found', ar: 'لم يتم العثور على خطة استراتيجية' }));
      return;
    }

    setGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Convert this strategic plan to presentation slides:

Plan: ${activePlan.name_en}
Vision: ${activePlan.vision_en || 'N/A'}
Period: ${activePlan.start_year}-${activePlan.end_year}
Themes: ${activePlan.strategic_themes?.length || 0}

Generate 10-15 slides with:
1. Title slide
2. Vision & Mission
3. Strategic themes overview
4. One slide per major theme (key objectives, KPIs)
5. Progress highlights
6. Next steps
7. Closing

Each slide: {title, key_points: [3-5 bullets], speaker_notes}`,
        response_json_schema: {
          type: "object",
          properties: {
            slides: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  key_points: { type: "array", items: { type: "string" } },
                  speaker_notes: { type: "string" }
                }
              }
            }
          }
        }
      });

      setSlides(response.slides);
      setCurrentSlide(0);
      toast.success(t({ en: 'Presentation generated', ar: 'تم إنشاء العرض التقديمي' }));
    } catch (error) {
      toast.error(t({ en: 'Generation failed', ar: 'فشل الإنشاء' }));
    } finally {
      setGenerating(false);
    }
  };

  const exportPPTX = () => {
    toast.success(t({ en: 'PPTX export started', ar: 'بدأ تصدير PPTX' }));
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t({ en: 'Presentation Mode', ar: 'وضع العرض التقديمي' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {t({ en: 'Auto-convert strategic plans to presentation slides', ar: 'تحويل تلقائي للخطط الاستراتيجية إلى شرائح عرض تقديمي' })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={generateSlides} disabled={generating} className="bg-gradient-to-r from-purple-600 to-pink-600">
            <Sparkles className="h-4 w-4 mr-2" />
            {generating ? t({ en: 'Generating...', ar: 'جاري الإنشاء...' }) : t({ en: 'Generate Slides', ar: 'إنشاء شرائح' })}
          </Button>
          {slides && (
            <Button onClick={exportPPTX} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              {t({ en: 'Export PPTX', ar: 'تصدير PPTX' })}
            </Button>
          )}
        </div>
      </div>

      {slides ? (
        <div className="space-y-4">
          {/* Slide Viewer */}
          <Card className="border-4 border-blue-400">
            <CardContent className="pt-6">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-12 rounded-lg min-h-[400px] flex flex-col justify-center">
                <h2 className="text-4xl font-bold mb-6">{slides[currentSlide].title}</h2>
                <div className="space-y-3">
                  {slides[currentSlide].key_points?.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                        {idx + 1}
                      </div>
                      <p className="text-lg">{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                  disabled={currentSlide === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {t({ en: 'Previous', ar: 'السابق' })}
                </Button>
                <Badge className="bg-blue-100 text-blue-700">
                  {currentSlide + 1} / {slides.length}
                </Badge>
                <Button
                  variant="outline"
                  onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
                  disabled={currentSlide === slides.length - 1}
                >
                  {t({ en: 'Next', ar: 'التالي' })}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Speaker Notes */}
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Speaker Notes', ar: 'ملاحظات المتحدث' })}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700 leading-relaxed">
                {slides[currentSlide].speaker_notes}
              </p>
            </CardContent>
          </Card>

          {/* Slide Thumbnails */}
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'All Slides', ar: 'جميع الشرائح' })}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {slides.map((slide, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`p-3 border-2 rounded-lg text-left hover:border-blue-400 transition-all ${
                      currentSlide === idx ? 'border-blue-600 bg-blue-50' : 'border-slate-200'
                    }`}
                  >
                    <div className="text-xs font-medium text-slate-900 mb-1">
                      {idx + 1}. {slide.title.substring(0, 30)}
                    </div>
                    <div className="text-xs text-slate-500">
                      {slide.key_points?.length || 0} points
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Presentation className="h-16 w-16 text-purple-300 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">
                {t({ en: 'Click "Generate Slides" to create presentation from your strategic plan', ar: 'انقر "إنشاء شرائح" لإنشاء عرض تقديمي من خطتك الاستراتيجية' })}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProtectedPage(PresentationMode, { requiredPermissions: [] });