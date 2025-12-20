import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from './LanguageContext';
import { Sparkles, Shield, Loader2, Copy, Download } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { buildSafetyProtocolPrompt, SAFETY_PROTOCOL_SCHEMA } from '@/lib/ai/prompts/sandbox';

export default function AISafetyProtocolGenerator({ projectData, sandbox, onGenerated }) {
  const { language, isRTL, t } = useLanguage();
  const [protocol, setProtocol] = useState(null);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const generateProtocol = async () => {
    const prompt = buildSafetyProtocolPrompt({ projectData, sandbox });

    const result = await invokeAI({
      prompt,
      response_json_schema: SAFETY_PROTOCOL_SCHEMA
    });

    if (result.success) {
      setProtocol(result.data);
      toast.success(t({ en: 'Safety protocol generated', ar: 'تم إنشاء بروتوكول السلامة' }));
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(protocol.full_document);
    toast.success(t({ en: 'Copied to clipboard', ar: 'تم النسخ' }));
  };

  const applyToForm = () => {
    if (onGenerated && protocol) {
      onGenerated(protocol.full_document);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-600" />
          {t({ en: 'AI Safety Protocol Generator', ar: 'مولد بروتوكول السلامة الذكي' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} showDetails />
        
        {!protocol ? (
          <div className="text-center py-6">
            <Button
              onClick={generateProtocol}
              disabled={isLoading || !isAvailable || !projectData.project_title}
              className="bg-gradient-to-r from-green-600 to-emerald-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t({ en: 'Generating...', ar: 'جاري الإنشاء...' })}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t({ en: 'Generate Safety Protocol', ar: 'إنشاء بروتوكول السلامة' })}
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Preview Sections */}
            <div className="space-y-3">
              <div className="p-3 bg-white rounded-lg border">
                <p className="text-xs font-semibold text-slate-700 mb-2">
                  {t({ en: 'Public Safety Measures', ar: 'تدابير السلامة العامة' })}
                </p>
                <ul className="text-sm text-slate-600 space-y-1">
                  {protocol.public_safety_measures?.slice(0, 3).map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                  {protocol.public_safety_measures?.length > 3 && (
                    <li className="text-green-600">+ {protocol.public_safety_measures.length - 3} more...</li>
                  )}
                </ul>
              </div>

              <div className="p-3 bg-white rounded-lg border">
                <p className="text-xs font-semibold text-slate-700 mb-2">
                  {t({ en: 'Emergency Response', ar: 'الاستجابة للطوارئ' })}
                </p>
                <ul className="text-sm text-slate-600 space-y-1">
                  {protocol.emergency_response?.slice(0, 3).map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                  {protocol.emergency_response?.length > 3 && (
                    <li className="text-green-600">+ {protocol.emergency_response.length - 3} more...</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Full Document */}
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">
                {t({ en: 'Complete Protocol Document', ar: 'وثيقة البروتوكول الكاملة' })}
              </p>
              <Textarea
                value={protocol.full_document}
                onChange={(e) => setProtocol({...protocol, full_document: e.target.value})}
                rows={12}
                className="font-mono text-xs"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={copyToClipboard}
                variant="outline"
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-2" />
                {t({ en: 'Copy', ar: 'نسخ' })}
              </Button>
              <Button
                onClick={applyToForm}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
              >
                <Download className="h-4 w-4 mr-2" />
                {t({ en: 'Apply to Form', ar: 'تطبيق على النموذج' })}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
