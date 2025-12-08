import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../LanguageContext';
import { Mail, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SmartWelcomeEmail({ userEmail, userRole }) {
  const { language, t } = useLanguage();
  const [generating, setGenerating] = useState(false);
  const [emailContent, setEmailContent] = useState('');

  const generateEmail = async () => {
    setGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate personalized welcome email for:
Email: ${userEmail}
Role: ${userRole}

Include:
1. Warm personalized greeting
2. Role-specific platform benefits
3. Quick start guide (3 steps)
4. Current relevant opportunities (generic examples)
5. Support contact

Tone: Professional, welcoming, encouraging. Bilingual (English + Arabic).`,
        response_json_schema: {
          type: "object",
          properties: {
            subject: { type: "string" },
            body_en: { type: "string" },
            body_ar: { type: "string" }
          }
        }
      });

      setEmailContent(`Subject: ${response.subject}\n\n--- ENGLISH ---\n${response.body_en}\n\n--- ARABIC ---\n${response.body_ar}`);
      toast.success(t({ en: 'Email generated', ar: 'البريد مُولد' }));
    } catch (error) {
      toast.error(t({ en: 'Generation failed', ar: 'فشل التوليد' }));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="border-2 border-blue-300">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            {t({ en: 'Smart Welcome Email', ar: 'بريد الترحيب الذكي' })}
          </CardTitle>
          <Button onClick={generateEmail} disabled={generating} size="sm" className="bg-blue-600">
            {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {t({ en: 'Generate', ar: 'توليد' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {!emailContent && !generating && (
          <div className="text-center py-8">
            <Mail className="h-12 w-12 text-blue-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'AI creates personalized bilingual welcome email', ar: 'الذكاء ينشئ بريد ترحيب مخصص ثنائي اللغة' })}
            </p>
          </div>
        )}

        {emailContent && (
          <div>
            <Textarea
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              rows={20}
              className="font-mono text-xs"
            />
            <Button className="w-full mt-3 bg-blue-600">
              {t({ en: 'Use This Email', ar: 'استخدم هذا البريد' })}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}