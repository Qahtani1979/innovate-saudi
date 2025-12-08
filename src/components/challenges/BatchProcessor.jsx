import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Upload, FileText, AlertTriangle, CheckCircle2, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function BatchProcessor() {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [file, setFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setProcessing(true);

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: uploadedFile });

      const extracted = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
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
                  priority: { type: "string" },
                  municipality_id: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (extracted.status === 'success') {
        setExtractedData(extracted.output.challenges || []);
        await validateData(extracted.output.challenges);
      } else {
        toast.error(t({ en: 'Extraction failed', ar: 'فشل الاستخراج' }));
      }
    } catch (error) {
      toast.error(t({ en: 'Upload failed', ar: 'فشل الرفع' }));
    } finally {
      setProcessing(false);
    }
  };

  const validateData = async (challenges) => {
    setProcessing(true);
    try {
      const validation = await base44.integrations.Core.InvokeLLM({
        prompt: `Validate these ${challenges.length} challenges for import:

${challenges.map((c, i) => `${i+1}. ${c.title_en || c.title_ar}`).join('\n')}

Check for:
1. Duplicates (semantic similarity >85%)
2. Missing required fields
3. Data quality issues
4. Suggested improvements

Return validation results.`,
        response_json_schema: {
          type: "object",
          properties: {
            duplicates: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  challenge_index: { type: "number" },
                  similar_to_index: { type: "number" },
                  similarity: { type: "number" }
                }
              }
            },
            missing_fields: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  challenge_index: { type: "number" },
                  fields: { type: "array", items: { type: "string" } }
                }
              }
            },
            quality_issues: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  challenge_index: { type: "number" },
                  issue: { type: "string" }
                }
              }
            }
          }
        }
      });

      setValidationResults(validation);
      toast.success(t({ en: 'Validation complete', ar: 'اكتمل التحقق' }));
    } catch (error) {
      toast.error(t({ en: 'Validation failed', ar: 'فشل التحقق' }));
    } finally {
      setProcessing(false);
    }
  };

  const bulkImportMutation = useMutation({
    mutationFn: (challenges) => base44.entities.Challenge.bulkCreate(challenges),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      toast.success(t({ en: 'Challenges imported successfully', ar: 'تم استيراد التحديات بنجاح' }));
      setFile(null);
      setExtractedData(null);
      setValidationResults(null);
    }
  });

  const handleImport = () => {
    const validChallenges = extractedData.filter((c, idx) => {
      const hasDuplicate = validationResults?.duplicates?.some(d => d.challenge_index === idx);
      const hasMissingFields = validationResults?.missing_fields?.some(m => m.challenge_index === idx);
      return !hasDuplicate && !hasMissingFields;
    });

    bulkImportMutation.mutate(validChallenges);
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
              />
              <label htmlFor="file-upload">
                <Button asChild variant="outline">
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

              {processing && (
                <div className="text-center py-6">
                  <Loader2 className="h-8 w-8 text-blue-600 mx-auto mb-3 animate-spin" />
                  <p className="text-sm text-slate-600">
                    {t({ en: 'Processing file with AI...', ar: 'معالجة الملف بالذكاء الاصطناعي...' })}
                  </p>
                </div>
              )}

              {extractedData && validationResults && !processing && (
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