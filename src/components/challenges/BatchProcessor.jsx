import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { Upload, FileText, AlertTriangle, CheckCircle2, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import {
  buildBatchValidationPrompt,
  BATCH_VALIDATION_SCHEMA
} from '@/lib/ai/prompts/challenges';

import { useImportChallenges } from '@/hooks/useChallengeMutations';

export default function BatchProcessor() {
  const { language, isRTL, t } = useLanguage();
  // queryClient removed
  const [file, setFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  const [processing, setProcessing] = useState(false);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const bulkImportMutation = useImportChallenges();

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setProcessing(true);

    try {
      // For now, use AI to extract from file content read as text
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target?.result;
        // Use AI to parse the content
        const parseResult = await invokeAI({
          prompt: `Extract challenge data from this file content. Return as JSON with array of challenges having title_en, title_ar, description_en, sector, priority fields:\n\n${content}`,
          response_json_schema: {
            type: "object",
            properties: {
              challenges: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title_en: { type: "string" },
                    title_ar: { type: "string" },
                    description_en: { type: "string" },
                    sector: { type: "string" },
                    priority: { type: "string" }
                  }
                }
              }
            }
          }
        });

        if (parseResult.success && parseResult.data?.challenges) {
          setExtractedData(parseResult.data.challenges);
          await validateData(parseResult.data.challenges);
        } else {
          toast.error(t({ en: 'Extraction failed', ar: 'فشل الاستخراج' }));
        }
        setProcessing(false);
      };
      reader.readAsText(uploadedFile);
    } catch (error) {
      toast.error(t({ en: 'Upload failed', ar: 'فشل الرفع' }));
      setProcessing(false);
    }
  };

  const validateData = async (challenges) => {
    setProcessing(true);
    try {
      const result = await invokeAI({
        prompt: buildBatchValidationPrompt({ challenges }),
        response_json_schema: BATCH_VALIDATION_SCHEMA
      });

      if (result.success) {
        setValidationResults(result.data);
        toast.success(t({ en: 'Validation complete', ar: 'اكتمل التحقق' }));
      }
    } catch (error) {
      toast.error(t({ en: 'Validation failed', ar: 'فشل التحقق' }));
    } finally {
      setProcessing(false);
    }
  };

  const handleImport = () => {
    const validChallenges = extractedData.filter((c, idx) => {
      const hasDuplicate = validationResults?.duplicates?.some(d => d.challenge_index === idx);
      const hasMissingFields = validationResults?.missing_fields?.some(m => m.challenge_index === idx);
      return !hasDuplicate && !hasMissingFields;
    });

    bulkImportMutation.mutate(validChallenges, {
      onSuccess: () => {
        setFile(null);
        setExtractedData(null);
        setValidationResults(null);
      }
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {t({ en: 'Batch Challenge Import', ar: 'الاستيراد الجماعي للتحديات' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} showDetails className="mb-4" />

          {!file ? (
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
              <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">
                {t({ en: 'Upload Excel, CSV, or PDF with challenge data', ar: 'رفع Excel، CSV، أو PDF مع بيانات التحديات' })}
              </p>
              <input
                type="file"
                accept=".xlsx,.xls,.csv,.pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                disabled={!isAvailable}
              />
              <label htmlFor="file-upload">
                <Button asChild variant="outline" disabled={!isAvailable}>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    {t({ en: 'Choose File', ar: 'اختر ملف' })}
                  </span>
                </Button>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">{file.name}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => { setFile(null); setExtractedData(null); setValidationResults(null); }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {(processing || isLoading) && (
                <div className="text-center py-6">
                  <Loader2 className="h-8 w-8 text-blue-600 mx-auto mb-3 animate-spin" />
                  <p className="text-sm text-slate-600">
                    {t({ en: 'Processing file with AI...', ar: 'معالجة الملف بالذكاء الاصطناعي...' })}
                  </p>
                </div>
              )}

              {extractedData && validationResults && !processing && !isLoading && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="pt-4 text-center">
                        <p className="text-2xl font-bold text-blue-600">{extractedData.length}</p>
                        <p className="text-xs text-slate-600">{t({ en: 'Total', ar: 'الإجمالي' })}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-red-50 border-red-200">
                      <CardContent className="pt-4 text-center">
                        <p className="text-2xl font-bold text-red-600">{validationResults.duplicates?.length || 0}</p>
                        <p className="text-xs text-slate-600">{t({ en: 'Duplicates', ar: 'مكررات' })}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="pt-4 text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {extractedData.length - (validationResults.duplicates?.length || 0)}
                        </p>
                        <p className="text-xs text-slate-600">{t({ en: 'Valid', ar: 'صالح' })}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {validationResults.duplicates?.length > 0 && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h5 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        {t({ en: 'Duplicates Detected', ar: 'مكررات محددة' })}
                      </h5>
                      <div className="space-y-2">
                        {validationResults.duplicates.map((dup, idx) => (
                          <div key={idx} className="text-sm text-slate-700 bg-white p-2 rounded">
                            Challenge #{dup.challenge_index + 1} is {dup.similarity}% similar to #{dup.similar_to_index + 1}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button onClick={handleImport} className="w-full bg-green-600">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {t({ en: `Import ${extractedData.length - (validationResults.duplicates?.length || 0)} Valid Challenges`, ar: `استيراد ${extractedData.length - (validationResults.duplicates?.length || 0)} تحدي صالح` })}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
