import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { Shield, Loader2, CheckCircle2, XCircle, AlertTriangle, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import {
  generateComplianceValidationPrompt,
  getComplianceValidationSchema,
  getDocumentExtractionSchema,
  getComplianceValidationSystemPrompt
} from '@/lib/ai/prompts/solution';

export default function ComplianceValidationAI({ solution, onValidationComplete }) {
  const { t } = useLanguage();
  const [validation, setValidation] = useState(null);
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const { invokeAI, status, isLoading: validating, rateLimitInfo, isAvailable } = useAIWithFallback();

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    const uploaded = [];

    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      uploaded.push({ name: file.name, url: file_url });
    }

    setUploadedDocs([...uploadedDocs, ...uploaded]);
    toast.success(t({ en: 'Documents uploaded', ar: 'تم رفع المستندات' }));
  };

  const validateCompliance = async () => {
    // Extract data from uploaded compliance documents
    const extractedData = [];
    for (const doc of uploadedDocs) {
      try {
        const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
          file_url: doc.url,
          json_schema: getDocumentExtractionSchema()
        });
        if (result.status === 'success') {
          extractedData.push(result.output);
        }
      } catch (error) {
        console.error('Failed to extract from', doc.name);
      }
    }

    // AI validation of compliance
    const result = await invokeAI({
      prompt: generateComplianceValidationPrompt(solution, extractedData),
      response_json_schema: getComplianceValidationSchema(),
      system_prompt: getComplianceValidationSystemPrompt()
    });

    if (result.success) {
      setValidation(result.data);
      onValidationComplete?.(result.data);
      toast.success(t({ en: 'Validation complete', ar: 'اكتمل التحقق' }));
    }
  };

  const riskColor = {
    low: 'green',
    medium: 'yellow',
    high: 'orange',
    critical: 'red'
  }[validation?.compliance_risk] || 'slate';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          {t({ en: 'AI Compliance Validation', ar: 'التحقق من الامتثال' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />

        {/* Document Upload */}
        <div className="p-4 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
          <label className="cursor-pointer flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-slate-400" />
            <span className="text-sm text-slate-600">
              {t({ en: 'Upload compliance documents (PDF, images)', ar: 'رفع مستندات الامتثال' })}
            </span>
            <input
              type="file"
              multiple
              accept=".pdf,image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button size="sm" variant="outline">
              {t({ en: 'Choose Files', ar: 'اختر الملفات' })}
            </Button>
          </label>
          {uploadedDocs.length > 0 && (
            <div className="mt-3 space-y-1">
              {uploadedDocs.map((doc, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-white rounded border">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-slate-700">{doc.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button
          onClick={validateCompliance}
          disabled={validating || !isAvailable}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
        >
          {validating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t({ en: 'Validating compliance...', ar: 'جاري التحقق...' })}
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              {t({ en: 'Run AI Validation', ar: 'تشغيل التحقق الذكي' })}
            </>
          )}
        </Button>

        {validation && (
          <div className="space-y-4">
            {/* Compliance Score */}
            <div className={`p-4 bg-${riskColor}-50 border-2 border-${riskColor}-300 rounded-lg`}>
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-slate-900">
                  {t({ en: 'Compliance Score', ar: 'درجة الامتثال' })}
                </p>
                <Badge className={`bg-${riskColor}-600 text-white`}>
                  {validation.compliance_risk} risk
                </Badge>
              </div>
              <div className="flex items-center gap-4">
                <div className={`text-5xl font-bold text-${riskColor}-600`}>
                  {validation.compliance_score}%
                </div>
                <div className="flex-1">
                  <Progress value={validation.compliance_score} className="h-3" />
                </div>
              </div>
            </div>

            {/* Verified Certifications */}
            {validation.verified_certifications?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-slate-900 mb-2">
                  {t({ en: 'Verified Certifications', ar: 'الشهادات المحققة' })}
                </p>
                <div className="space-y-2">
                  {validation.verified_certifications.map((cert, i) => (
                    <div key={i} className="flex items-center justify-between p-2 border rounded">
                      {cert.status === 'verified' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : cert.status === 'expired' ? (
                        <XCircle className="h-4 w-4 text-red-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      )}
                      <div className="flex-1 ml-2">
                        <p className="text-sm font-medium">{cert.name}</p>
                        <p className="text-xs text-slate-500">{cert.issuer}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">{cert.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Certifications */}
            {validation.missing_certifications?.length > 0 && (
              <div className="p-3 bg-red-50 rounded border border-red-200">
                <p className="text-sm font-semibold text-red-900 mb-2">
                  {t({ en: 'Missing Critical Certifications', ar: 'الشهادات المفقودة' })}
                </p>
                <ul className="space-y-1">
                  {validation.missing_certifications.map((cert, i) => (
                    <li key={i} className="text-xs text-red-800">❌ {cert}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Discrepancies */}
            {validation.discrepancies_found?.length > 0 && (
              <div className="p-3 bg-amber-50 rounded border border-amber-200">
                <p className="text-sm font-semibold text-amber-900 mb-2">
                  {t({ en: 'Discrepancies Found', ar: 'تناقضات موجودة' })}
                </p>
                <ul className="space-y-1">
                  {validation.discrepancies_found.map((disc, i) => (
                    <li key={i} className="text-xs text-amber-800">⚠️ {disc}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommended Actions */}
            {validation.recommended_actions?.length > 0 && (
              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm font-semibold text-blue-900 mb-2">
                  {t({ en: 'Recommended Actions', ar: 'الإجراءات الموصى بها' })}
                </p>
                <ol className="space-y-1">
                  {validation.recommended_actions.map((action, i) => (
                    <li key={i} className="text-xs text-blue-800">{i + 1}. {action}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
