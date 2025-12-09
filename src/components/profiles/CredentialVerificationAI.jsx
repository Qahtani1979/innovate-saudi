import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Shield, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import FileUploader from '../FileUploader';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function CredentialVerificationAI({ profileType, profileId }) {
  const { language, isRTL, t } = useLanguage();
  const [verification, setVerification] = useState(null);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const handleVerify = async (fileUrl) => {
    const result = await invokeAI({
      prompt: `Verify the credentials for a ${profileType} profile.
Analyze the uploaded document and extract:
1. Credential type (degree, certification, license, etc.)
2. Issuing institution
3. Date issued
4. Verification status (appears legitimate / needs review / suspicious)
5. Extracted key details`,
      file_urls: [fileUrl],
      response_json_schema: {
        type: 'object',
        properties: {
          credential_type: { type: 'string' },
          issuer: { type: 'string' },
          date_issued: { type: 'string' },
          verification_status: { type: 'string', enum: ['legitimate', 'needs_review', 'suspicious'] },
          details: { type: 'object' },
          confidence_score: { type: 'number' }
        }
      }
    });

    if (result.success) {
      setVerification(result.data);
      toast.success(t({ en: 'Verification complete', ar: 'اكتمل التحقق' }));
    }
  };

  return (
    <Card className="border-2 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-600" />
          {t({ en: 'AI Credential Verification', ar: 'التحقق الذكي من الشهادات' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} showDetails />
        
        <FileUploader
          onUpload={(url) => handleVerify(url)}
          accept=".pdf,.jpg,.png"
          label={t({ en: 'Upload credential document', ar: 'رفع وثيقة الشهادة' })}
          disabled={!isAvailable}
        />

        {isLoading && (
          <div className="text-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-slate-600">{t({ en: 'AI is verifying credentials...', ar: 'الذكاء يتحقق من الشهادات...' })}</p>
          </div>
        )}

        {verification && (
          <div className={`p-4 rounded-lg border-2 ${
            verification.verification_status === 'legitimate' ? 'bg-green-50 border-green-300' :
            verification.verification_status === 'needs_review' ? 'bg-amber-50 border-amber-300' :
            'bg-red-50 border-red-300'
          }`}>
            <div className="flex items-start gap-3">
              {verification.verification_status === 'legitimate' ? (
                <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-amber-600 mt-1" />
              )}
              <div className="flex-1">
                <p className="font-bold text-slate-900">{verification.credential_type}</p>
                <p className="text-sm text-slate-600 mt-1">Issued by: {verification.issuer}</p>
                <p className="text-sm text-slate-600">Date: {verification.date_issued}</p>
                <Badge className="mt-2">
                  {t({ en: 'Confidence:', ar: 'الثقة:' })} {verification.confidence_score}%
                </Badge>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
