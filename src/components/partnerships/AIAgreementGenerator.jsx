import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { FileText, Sparkles, Loader2, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { buildAgreementGeneratorPrompt, agreementGeneratorSchema, AGREEMENT_GENERATOR_SYSTEM_PROMPT } from '@/lib/ai/prompts/partnerships';
import { getSystemPrompt } from '@/lib/saudiContext';

export default function AIAgreementGenerator({ partnership }) {
  const { language, t } = useLanguage();
  const [agreement, setAgreement] = useState(null);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const generateAgreement = async () => {
    const result = await invokeAI({
      prompt: buildAgreementGeneratorPrompt(partnership),
      systemPrompt: getSystemPrompt(AGREEMENT_GENERATOR_SYSTEM_PROMPT),
      response_json_schema: agreementGeneratorSchema
    });

    if (result.success) {
      setAgreement(result.data);
      toast.success(t({ en: 'Agreement generated', ar: 'الاتفاقية مولدة' }));
    }
  };

  return (
    <Card className="border-2 border-purple-300">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            {t({ en: 'AI Agreement Generator', ar: 'مولد الاتفاقيات الذكي' })}
          </CardTitle>
          <Button onClick={generateAgreement} disabled={isLoading || !isAvailable || agreement} size="sm" className="bg-purple-600">
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Generate', ar: 'توليد' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} showDetails />
        
        {!agreement && !isLoading && (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-purple-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'AI generates professional bilingual MOU/contract based on partnership details', ar: 'الذكاء يولد مذكرة تفاهم/عقد ثنائي اللغة احترافي بناءً على تفاصيل الشراكة' })}
            </p>
          </div>
        )}

        {agreement && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Badge className="bg-blue-600">English</Badge>
              <Badge className="bg-green-600">العربية</Badge>
            </div>

            <div className="p-4 bg-white rounded border max-h-96 overflow-y-auto">
              <div className="prose prose-sm max-w-none">
                <div className="mb-6">
                  <h4 className="font-bold text-slate-900 mb-2">ENGLISH VERSION</h4>
                  <pre className="whitespace-pre-wrap text-xs">{agreement.mou_en}</pre>
                </div>
                <div className="border-t pt-6">
                  <h4 className="font-bold text-slate-900 mb-2">النسخة العربية</h4>
                  <pre className="whitespace-pre-wrap text-xs" dir="rtl">{agreement.mou_ar}</pre>
                </div>
              </div>
            </div>

            {agreement.key_terms?.length > 0 && (
              <div className="p-3 bg-purple-50 rounded border border-purple-300">
                <h4 className="text-sm font-semibold text-purple-900 mb-2">
                  {t({ en: 'Key Terms', ar: 'الشروط الرئيسية' })}
                </h4>
                <ul className="space-y-1">
                  {agreement.key_terms.map((term, i) => (
                    <li key={i} className="text-xs text-slate-700">• {term}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button 
              onClick={() => {
                const text = `ENGLISH:\n\n${agreement.mou_en}\n\n\nARABIC:\n\n${agreement.mou_ar}`;
                navigator.clipboard.writeText(text);
                toast.success(t({ en: 'Copied', ar: 'منسوخ' }));
              }}
              variant="outline"
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {t({ en: 'Copy Agreement', ar: 'نسخ الاتفاقية' })}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
