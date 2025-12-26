import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { FileText, Sparkles, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAIMapping } from '@/hooks/useAIMapping';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function AIImportFieldMapper({ csvHeaders, entityName, onMappingComplete }) {
  const { t } = useLanguage();
  const {
    mapping,
    validation,
    analyzeMapping,
    status,
    generating,
    isAvailable,
    rateLimitInfo,
    schema,
    schemaLoading
  } = useAIMapping(entityName, csvHeaders);

  return (
    <Card className="border-2 border-blue-300">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            {t({ en: 'AI Field Mapper', ar: 'مخطط الحقول الذكي' })}
          </CardTitle>
          <Button
            onClick={analyzeMapping}
            disabled={generating || schemaLoading || !isAvailable || !schema}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            {(generating || schemaLoading) ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Auto-Map', ar: 'تخطيط تلقائي' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} showDetails className="mb-4" />

        {!validation && !generating && !schemaLoading && (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-blue-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: `AI will map ${csvHeaders.length} CSV columns to entity fields`, ar: `الذكاء سيخطط ${csvHeaders.length} عمود CSV لحقول الكيان` })}
            </p>
          </div>
        )}

        {(generating || schemaLoading) && !validation && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm text-slate-500">
              {schemaLoading ? t({ en: 'Fetching schema...', ar: 'جاري جلب القالب...' }) : t({ en: 'Analyzing headers...', ar: 'جاري تحليل العناوين...' })}
            </p>
          </div>
        )}

        {validation && (
          <div className="space-y-2">
            {validation.map((m, i) => (
              <div key={i} className={`p-3 rounded border ${m.entity_field && m.entity_field !== 'null' ? 'bg-green-50 border-green-300' : 'bg-yellow-50 border-yellow-300'}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {m.entity_field && m.entity_field !== 'null' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                    )}
                    <span className="font-medium text-sm text-slate-900">{m.csv_column}</span>
                  </div>
                  {m.confidence && (
                    <Badge variant="outline" className="text-xs">
                      {Math.round(m.confidence * 100)}% confidence
                    </Badge>
                  )}
                </div>
                {m.entity_field && m.entity_field !== 'null' ? (
                  <>
                    <p className="text-xs text-slate-600 mb-1">
                      → <span className="font-semibold">{m.entity_field}</span>
                    </p>
                    <p className="text-xs text-slate-500">{m.rationale}</p>
                  </>
                ) : (
                  <p className="text-xs text-yellow-700">No suitable field found - will be ignored</p>
                )}
              </div>
            ))}

            <Button
              onClick={() => onMappingComplete?.(mapping)}
              className="w-full bg-blue-600 mt-4 hover:bg-blue-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {t({ en: 'Apply Mapping', ar: 'تطبيق التخطيط' })}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
