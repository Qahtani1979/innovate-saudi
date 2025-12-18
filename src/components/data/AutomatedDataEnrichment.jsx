import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Database, Sparkles, Loader2, Check } from 'lucide-react';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import {
  DATA_ENRICHMENT_SYSTEM_PROMPT,
  buildDataEnrichmentPrompt,
  DATA_ENRICHMENT_SCHEMA
} from '@/lib/ai/prompts/data/enrichment';

export default function AutomatedDataEnrichment({ entity, entityType, onEnriched }) {
  const { language, t } = useLanguage();
  const [enrichments, setEnrichments] = useState(null);

  const { invokeAI, status, error, rateLimitInfo, isLoading, isAvailable } = useAIWithFallback({
    showToasts: true,
    fallbackData: null
  });

  const enrichData = async () => {
    const response = await invokeAI({
      prompt: buildDataEnrichmentPrompt({ entity, entityType }),
      system_prompt: DATA_ENRICHMENT_SYSTEM_PROMPT,
      response_json_schema: DATA_ENRICHMENT_SCHEMA
    });

    if (response.success) {
      setEnrichments(response.data);
      if (onEnriched) {
        onEnriched(response.data);
      }
    }
  };

  return (
    <Card className="border-2 border-teal-300">
      <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-teal-600" />
            {t({ en: 'AI Data Enrichment', ar: 'إثراء البيانات بالذكاء' })}
          </CardTitle>
          <Button onClick={enrichData} disabled={isLoading || !isAvailable} size="sm" className="bg-teal-600">
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Enrich', ar: 'إثراء' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} showDetails />
        
        {!enrichments && !isLoading && (
          <div className="text-center py-8">
            <Database className="h-12 w-12 text-teal-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'AI adds missing fields, translations, and metadata', ar: 'الذكاء يضيف الحقول المفقودة، الترجمات، والبيانات الوصفية' })}
            </p>
          </div>
        )}

        {enrichments && (
          <div className="space-y-3">
            {enrichments.translations && (
              <div className="p-3 bg-green-50 rounded border border-green-300">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <p className="font-semibold text-sm text-green-900">
                    {t({ en: 'Arabic Translation Added', ar: 'الترجمة العربية أُضيفت' })}
                  </p>
                </div>
                {enrichments.translations.title_ar && (
                  <p className="text-sm text-slate-700 bg-white p-2 rounded">{enrichments.translations.title_ar}</p>
                )}
              </div>
            )}

            {enrichments.tags?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-900 mb-2">
                  {t({ en: 'Suggested Tags:', ar: 'الوسوم المقترحة:' })}
                </p>
                <div className="flex flex-wrap gap-2">
                  {enrichments.tags.map((tag, i) => (
                    <Badge key={i} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}

            {enrichments.kpis?.length > 0 && (
              <div className="p-3 bg-blue-50 rounded border border-blue-300">
                <p className="font-semibold text-sm text-blue-900 mb-2">
                  {t({ en: 'Recommended KPIs:', ar: 'المؤشرات الموصى بها:' })}
                </p>
                <div className="space-y-1">
                  {enrichments.kpis.map((kpi, i) => (
                    <div key={i} className="text-xs text-slate-700 bg-white p-2 rounded">
                      <strong>{kpi.name}:</strong> {kpi.baseline} → {kpi.target}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
