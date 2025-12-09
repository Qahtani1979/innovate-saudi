import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { Award, Globe, Loader2 } from 'lucide-react';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function KPIBenchmarkData({ kpi, sector }) {
  const { language, isRTL, t } = useLanguage();
  const [benchmarks, setBenchmarks] = useState(null);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const fetchBenchmarks = async () => {
    const prompt = `Find international and Saudi benchmark data for this KPI:
      
KPI: ${kpi.name}
Sector: ${sector || 'municipal services'}
Unit: ${kpi.unit || 'N/A'}

Provide benchmark values from:
1. International best practice (OECD, UN-Habitat, World Bank)
2. Saudi national average
3. Regional average (GCC countries)
4. Leading Saudi municipality

Return structured data with sources.`;

    const result = await invokeAI({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          international_best: { 
            type: 'object',
            properties: {
              value: { type: 'string' },
              source: { type: 'string' },
              year: { type: 'number' }
            }
          },
          saudi_average: { 
            type: 'object',
            properties: {
              value: { type: 'string' },
              source: { type: 'string' }
            }
          },
          gcc_average: { 
            type: 'object',
            properties: {
              value: { type: 'string' },
              source: { type: 'string' }
            }
          },
          saudi_leader: { 
            type: 'object',
            properties: {
              city: { type: 'string' },
              value: { type: 'string' },
              source: { type: 'string' }
            }
          },
          interpretation: { type: 'string' }
        }
      }
    });

    if (result.success) {
      setBenchmarks(result.data);
    }
  };

  return (
    <Card className="border-2 border-blue-200" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Award className="h-4 w-4 text-blue-600" />
            {t({ en: 'Benchmark Data', ar: 'بيانات المقارنة المرجعية' })}
          </CardTitle>
          {!benchmarks && (
            <Button size="sm" onClick={fetchBenchmarks} disabled={isLoading || !isAvailable}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Globe className="h-4 w-4" />
              )}
              {t({ en: 'Fetch', ar: 'جلب' })}
            </Button>
          )}
        </div>
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} className="mt-2" />
      </CardHeader>
      {benchmarks && (
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50 rounded border">
              <p className="text-xs text-slate-600 mb-1">{t({ en: 'International Best', ar: 'أفضل دولي' })}</p>
              <p className="text-lg font-bold text-blue-600">{benchmarks.international_best?.value}</p>
              <p className="text-xs text-slate-500">{benchmarks.international_best?.source}</p>
            </div>

            <div className="p-3 bg-green-50 rounded border">
              <p className="text-xs text-slate-600 mb-1">{t({ en: 'Saudi Leader', ar: 'الرائد السعودي' })}</p>
              <p className="text-lg font-bold text-green-600">{benchmarks.saudi_leader?.value}</p>
              <p className="text-xs text-slate-500">{benchmarks.saudi_leader?.city}</p>
            </div>

            <div className="p-3 bg-amber-50 rounded border">
              <p className="text-xs text-slate-600 mb-1">{t({ en: 'Saudi Average', ar: 'المتوسط السعودي' })}</p>
              <p className="text-lg font-bold text-amber-600">{benchmarks.saudi_average?.value}</p>
            </div>

            <div className="p-3 bg-purple-50 rounded border">
              <p className="text-xs text-slate-600 mb-1">{t({ en: 'GCC Average', ar: 'متوسط الخليج' })}</p>
              <p className="text-lg font-bold text-purple-600">{benchmarks.gcc_average?.value}</p>
            </div>
          </div>

          {benchmarks.interpretation && (
            <div className="p-3 bg-slate-50 rounded border">
              <p className="text-xs text-slate-700">{benchmarks.interpretation}</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
