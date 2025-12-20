import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { ChevronRight, ChevronLeft, CheckCircle2, Sparkles, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function TaxonomyWizard({ onComplete }) {
  const { language, isRTL, t } = useLanguage();
  const [step, setStep] = useState(1);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();
  
  const queryClient = useQueryClient();

  const [sectors, setSectors] = useState([]);
  const [subsectors, setSubsectors] = useState([]);
  const [services, setServices] = useState([]);

  const steps = [
    { num: 1, title: { en: 'AI Generation', ar: 'الإنشاء الذكي' } },
    { num: 2, title: { en: 'Review Sectors', ar: 'مراجعة القطاعات' } },
    { num: 3, title: { en: 'Review Subsectors', ar: 'مراجعة القطاعات الفرعية' } },
    { num: 4, title: { en: 'Review Services', ar: 'مراجعة الخدمات' } },
    { num: 5, title: { en: 'Publish', ar: 'النشر' } }
  ];

  const generateAITaxonomy = async () => {
    const response = await invokeAI({
      prompt: `Generate comprehensive municipal innovation taxonomy for Saudi Arabia in BOTH English and Arabic.

Include:
1. 10-12 primary sectors (Urban Design, Transport, Environment, Digital Services, Health, Education, Safety, Economic Development, Social Services, Infrastructure, Governance, Culture)
2. 3-6 subsectors per sector
3. 5-15 key municipal services per subsector

For each service include realistic: service_type, quality benchmarks, digitalization priority.
Focus on Saudi municipal context, Vision 2030, QoL program, and smart city initiatives.
Each item needs: name_ar, name_en, code, description_ar, description_en.`,
      response_json_schema: {
        type: 'object',
        properties: {
          sectors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name_en: { type: 'string' },
                name_ar: { type: 'string' },
                code: { type: 'string' },
                description_en: { type: 'string' },
                description_ar: { type: 'string' },
                subsectors: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name_en: { type: 'string' },
                      name_ar: { type: 'string' },
                      code: { type: 'string' },
                      services: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            name_en: { type: 'string' },
                            name_ar: { type: 'string' },
                            service_code: { type: 'string' },
                            description_en: { type: 'string' },
                            description_ar: { type: 'string' },
                            service_type: { type: 'string' },
                            is_digital: { type: 'boolean' },
                            digitalization_priority: { type: 'string' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (response.success && response.data) {
      const result = response.data;
      setSectors(result.sectors || []);
      const allSubsectors = [];
      const allServices = [];
      
      result.sectors?.forEach(sector => {
        sector.subsectors?.forEach(subsector => {
          allSubsectors.push({ ...subsector, sector_code: sector.code });
          subsector.services?.forEach(service => {
            allServices.push({ ...service, subsector_code: subsector.code });
          });
        });
      });

      setSubsectors(allSubsectors);
      setServices(allServices);
      
      toast.success(t({ en: 'AI generated complete taxonomy', ar: 'تم إنشاء التصنيف الكامل بالذكاء' }));
      setStep(2);
    }
  };

  const publishTaxonomy = async () => {
    try {
      const createdSectors = await Promise.all(
        sectors.map(s => base44.entities.Sector.create({
          name_en: s.name_en,
          name_ar: s.name_ar,
          code: s.code,
          description_en: s.description_en,
          description_ar: s.description_ar
        }))
      );

      const subsectorPromises = subsectors.map(async (ss) => {
        const sector = createdSectors.find(s => s.code === ss.sector_code);
        if (sector) {
          return base44.entities.Subsector.create({
            sector_id: sector.id,
            name_en: ss.name_en,
            name_ar: ss.name_ar,
            code: ss.code
          });
        }
      });
      const createdSubsectors = await Promise.all(subsectorPromises.filter(Boolean));

      const servicePromises = services.map(async (srv) => {
        const subsector = createdSubsectors.find(ss => ss.code === srv.subsector_code);
        if (subsector) {
          return base44.entities.Service.create({
            subsector_id: subsector.id,
            name_en: srv.name_en,
            name_ar: srv.name_ar,
            service_code: srv.service_code,
            description_en: srv.description_en,
            description_ar: srv.description_ar,
            service_type: srv.service_type || 'administrative',
            is_digital: srv.is_digital || false,
            digitalization_priority: srv.digitalization_priority || 'medium'
          });
        }
      });
      await Promise.all(servicePromises.filter(Boolean));

      queryClient.invalidateQueries(['sectors']);
      queryClient.invalidateQueries(['subsectors']);
      queryClient.invalidateQueries(['services']);
      
      toast.success(t({ en: 'Taxonomy published successfully!', ar: 'تم نشر التصنيف بنجاح!' }));
      onComplete();
    } catch (error) {
      toast.error(t({ en: 'Publish failed', ar: 'فشل النشر' }));
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            {steps.map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                    step === s.num ? 'bg-blue-600 text-white' :
                    step > s.num ? 'bg-green-600 text-white' :
                    'bg-slate-200 text-slate-600'
                  }`}>
                    {step > s.num ? <CheckCircle2 className="h-5 w-5" /> : s.num}
                  </div>
                  <p className="text-xs mt-2 text-center">{s.title[language]}</p>
                </div>
                {idx < steps.length - 1 && <div className={`flex-1 h-1 ${step > s.num ? 'bg-green-600' : 'bg-slate-200'}`} />}
              </React.Fragment>
            ))}
          </div>
          <Progress value={(step / 5) * 100} className="h-2" />
        </CardContent>
      </Card>

      {/* Step 1: AI Generate */}
      {step === 1 && (
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader>
            <CardTitle>{t({ en: 'AI Taxonomy Generation', ar: 'إنشاء التصنيف الذكي' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} className="mb-4" />
            <p className="text-slate-700 leading-relaxed" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {t({ 
                en: 'AI will generate a complete 3-level taxonomy (Sectors → Subsectors → Services) based on Saudi municipal best practices, Vision 2030, and smart city frameworks. This will include 10-12 sectors, 40-60 subsectors, and 200+ municipal services.',
                ar: 'سينشئ الذكاء الاصطناعي تصنيفاً كاملاً من 3 مستويات (قطاعات ← قطاعات فرعية ← خدمات) بناءً على أفضل الممارسات البلدية السعودية ورؤية 2030 وأطر المدن الذكية. سيشمل 10-12 قطاعاً و40-60 قطاعاً فرعياً و200+ خدمة بلدية.'
              })}
            </p>
            <Button onClick={generateAITaxonomy} disabled={isLoading || !isAvailable} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-lg py-8">
              {isLoading ? <Loader2 className="h-6 w-6 mr-2 animate-spin" /> : <Sparkles className="h-6 w-6 mr-2" />}
              {t({ en: 'Generate Complete Taxonomy with AI', ar: 'إنشاء التصنيف الكامل بالذكاء الاصطناعي' })}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Steps 2-4: Review */}
      {step >= 2 && step <= 4 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {step === 2 && t({ en: 'Review Generated Sectors', ar: 'مراجعة القطاعات المنشأة' })}
              {step === 3 && t({ en: 'Review Generated Subsectors', ar: 'مراجعة القطاعات الفرعية' })}
              {step === 4 && t({ en: 'Review Generated Services', ar: 'مراجعة الخدمات المنشأة' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-3xl font-bold text-blue-600">{sectors.length}</p>
                <p className="text-sm text-slate-600">{t({ en: 'Sectors', ar: 'قطاعات' })}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg text-center">
                <p className="text-3xl font-bold text-purple-600">{subsectors.length}</p>
                <p className="text-sm text-slate-600">{t({ en: 'Subsectors', ar: 'قطاعات فرعية' })}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <p className="text-3xl font-bold text-green-600">{services.length}</p>
                <p className="text-sm text-slate-600">{t({ en: 'Services', ar: 'خدمات' })}</p>
              </div>
            </div>
            <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
              <p className="text-green-900 font-semibold">
                ✓ {t({ en: 'Taxonomy structure ready. Click Next to continue.', ar: 'بنية التصنيف جاهزة. انقر التالي للمتابعة.' })}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Publish */}
      {step === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Publish Taxonomy to Platform', ar: 'نشر التصنيف على المنصة' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
              <p className="text-lg font-semibold text-green-900 mb-4">
                {t({ en: 'Ready to publish complete taxonomy:', ar: 'جاهز لنشر التصنيف الكامل:' })}
              </p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-4xl font-bold text-green-700">{sectors.length}</p>
                  <p className="text-sm text-slate-600">{t({ en: 'Sectors', ar: 'قطاعات' })}</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-blue-700">{subsectors.length}</p>
                  <p className="text-sm text-slate-600">{t({ en: 'Subsectors', ar: 'قطاعات فرعية' })}</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-purple-700">{services.length}</p>
                  <p className="text-sm text-slate-600">{t({ en: 'Services', ar: 'خدمات' })}</p>
                </div>
              </div>
            </div>
            <Button onClick={publishTaxonomy} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-lg py-6">
              <Save className="h-5 w-5 mr-2" />
              {t({ en: 'Publish Taxonomy to Platform', ar: 'نشر التصنيف على المنصة' })}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>
          {isRTL ? <ChevronRight className="h-4 w-4 ml-2" /> : <ChevronLeft className="h-4 w-4 mr-2" />}
          {t({ en: 'Previous', ar: 'السابق' })}
        </Button>
        <Button onClick={() => setStep(Math.min(5, step + 1))} disabled={step === 5 || (step === 1 && sectors.length === 0)}>
          {t({ en: 'Next', ar: 'التالي' })}
          {isRTL ? <ChevronLeft className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 ml-2" />}
        </Button>
      </div>
    </div>
  );
}