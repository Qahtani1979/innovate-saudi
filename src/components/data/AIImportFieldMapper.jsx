import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { FileText, Sparkles, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AIImportFieldMapper({ csvHeaders, entityName, onMappingComplete }) {
  const { language, t } = useLanguage();
  const [mapping, setMapping] = useState({});
  const [analyzing, setAnalyzing] = useState(false);
  const [validation, setValidation] = useState(null);

  const analyzeMapping = async () => {
    setAnalyzing(true);
    try {
      const schema = await base44.entities[entityName].schema();
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Map CSV columns to entity fields:

CSV Headers: ${csvHeaders.join(', ')}

Entity Fields:
${Object.entries(schema.properties).map(([field, prop]) => 
  `${field} (${prop.type}): ${prop.description || ''}`
).join('\n')}

Suggest mapping for each CSV column to the best matching entity field.
If no good match, suggest null.`,
        response_json_schema: {
          type: "object",
          properties: {
            mappings: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  csv_column: { type: "string" },
                  entity_field: { type: "string" },
                  confidence: { type: "number" },
                  rationale: { type: "string" }
                }
              }
            }
          }
        }
      });

      const newMapping = {};
      response.mappings.forEach(m => {
        if (m.entity_field && m.entity_field !== 'null') {
          newMapping[m.csv_column] = m.entity_field;
        }
      });

      setMapping(newMapping);
      setValidation(response.mappings);
      toast.success(t({ en: 'Mapping suggested', ar: 'التخطيط مقترح' }));
    } catch (error) {
      toast.error(t({ en: 'Analysis failed', ar: 'فشل التحليل' }));
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Card className="border-2 border-blue-300">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            {t({ en: 'AI Field Mapper', ar: 'مخطط الحقول الذكي' })}
          </CardTitle>
          <Button onClick={analyzeMapping} disabled={analyzing} size="sm" className="bg-blue-600">
            {analyzing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Auto-Map', ar: 'تخطيط تلقائي' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {!validation && !analyzing && (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-blue-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: `AI will map ${csvHeaders.length} CSV columns to entity fields`, ar: `الذكاء سيخطط ${csvHeaders.length} عمود CSV لحقول الكيان` })}
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
              className="w-full bg-blue-600 mt-4"
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