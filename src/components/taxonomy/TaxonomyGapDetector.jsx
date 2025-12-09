import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { AlertTriangle, Sparkles, Loader2, Target } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function TaxonomyGapDetector({ sectors, subsectors, services }) {
  const { language, isRTL, t } = useLanguage();
  const [gaps, setGaps] = useState(null);
  const { invokeAI, status, isLoading: analyzing, isAvailable, rateLimitInfo } = useAIWithFallback();

  const analyzeGaps = async () => {
    const taxonomyData = sectors.map(sector => ({
      sector: sector.name_en,
      subsector_count: subsectors.filter(ss => ss.sector_id === sector.id).length,
      service_count: subsectors
        .filter(ss => ss.sector_id === sector.id)
        .reduce((sum, ss) => sum + services.filter(srv => srv.subsector_id === ss.id).length, 0)
    }));

    const response = await invokeAI({
      prompt: `Analyze taxonomy completeness for Saudi municipal innovation platform:

Current Taxonomy:
${JSON.stringify(taxonomyData, null, 2)}

Sectors with no subsectors: ${sectors.filter(s => !subsectors.some(ss => ss.sector_id === s.id)).map(s => s.name_en).join(', ')}
Subsectors with no services: ${subsectors.filter(ss => !services.some(srv => srv.subsector_id === ss.id)).length}

Generate bilingual gap analysis:
1. Missing subsectors (sectors that need more breakdown)
2. Missing services (subsectors without mapped services)
3. Structural gaps (taxonomy imbalances or missing areas)
4. Recommendations (specific additions needed)`,
      response_json_schema: {
        type: 'object',
        properties: {
          missing_subsectors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                sector_en: { type: 'string' },
                sector_ar: { type: 'string' },
                suggested_subsectors: { type: 'array', items: { type: 'string' } }
              }
            }
          },
          missing_services: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                subsector_en: { type: 'string' },
                subsector_ar: { type: 'string' },
                suggested_services: { type: 'array', items: { type: 'string' } }
              }
            }
          },
          structural_gaps: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                gap_en: { type: 'string' },
                gap_ar: { type: 'string' },
                severity: { type: 'string' },
                recommendation_en: { type: 'string' },
                recommendation_ar: { type: 'string' }
              }
            }
          }
        }
      }
    });

    if (response.success) {
      setGaps(response.data);
      toast.success(t({ en: 'Gap analysis complete', ar: 'اكتمل تحليل الفجوات' }));
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-orange-900 mb-1 text-lg">
                {t({ en: 'AI Gap Detector', ar: 'كاشف الفجوات الذكي' })}
              </p>
              <p className="text-sm text-slate-600">
                {t({ en: 'Identify missing taxonomy elements and structural gaps', ar: 'تحديد عناصر التصنيف المفقودة والفجوات الهيكلية' })}
              </p>
            </div>
            <Button onClick={analyzeGaps} disabled={analyzing || !isAvailable} className="bg-orange-600">
              {analyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {t({ en: 'Detect Gaps', ar: 'كشف الفجوات' })}
            </Button>
          </div>
          <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} className="mt-4" />
        </CardContent>
      </Card>

      {gaps && (
        <div className="space-y-6">
          {gaps.missing_subsectors?.length > 0 && (
            <Card className="border-2 border-yellow-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-900">
                  <AlertTriangle className="h-5 w-5" />
                  {t({ en: 'Missing Subsectors', ar: 'القطاعات الفرعية المفقودة' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {gaps.missing_subsectors.map((gap, idx) => (
                    <div key={idx} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="font-semibold text-slate-900 mb-2">
                        {language === 'ar' ? gap.sector_ar : gap.sector_en}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {gap.suggested_subsectors?.map((ss, i) => (
                          <Badge key={i} variant="outline" className="bg-white">+ {ss}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {gaps.missing_services?.length > 0 && (
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Target className="h-5 w-5" />
                  {t({ en: 'Missing Services', ar: 'الخدمات المفقودة' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {gaps.missing_services.map((gap, idx) => (
                    <div key={idx} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="font-medium text-slate-900 mb-2 text-sm">
                        {language === 'ar' ? gap.subsector_ar : gap.subsector_en}
                      </p>
                      <div className="space-y-1">
                        {gap.suggested_services?.slice(0, 5).map((srv, i) => (
                          <p key={i} className="text-xs text-slate-600">+ {srv}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {gaps.structural_gaps?.length > 0 && (
            <Card className="border-2 border-red-200">
              <CardHeader>
                <CardTitle className="text-red-900">{t({ en: 'Structural Gaps', ar: 'الفجوات الهيكلية' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {gaps.structural_gaps.map((gap, idx) => (
                    <div key={idx} className={`p-4 border-2 rounded-lg ${
                      gap.severity === 'high' ? 'bg-red-50 border-red-300' : 
                      gap.severity === 'medium' ? 'bg-yellow-50 border-yellow-300' : 
                      'bg-green-50 border-green-300'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-semibold text-slate-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          {language === 'ar' ? gap.gap_ar : gap.gap_en}
                        </p>
                        <Badge className={gap.severity === 'high' ? 'bg-red-600' : gap.severity === 'medium' ? 'bg-yellow-600' : 'bg-green-600'}>
                          {gap.severity}
                        </Badge>
                      </div>
                      <div className="p-3 bg-white rounded border">
                        <p className="text-xs font-medium text-slate-600 mb-1">
                          {t({ en: '💡 Recommendation:', ar: '💡 التوصية:' })}
                        </p>
                        <p className="text-sm text-slate-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          {language === 'ar' ? gap.recommendation_ar : gap.recommendation_en}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
