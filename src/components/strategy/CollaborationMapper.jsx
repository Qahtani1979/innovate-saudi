import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Network, Sparkles, Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function CollaborationMapper() {
  const { language, isRTL, t } = useLanguage();
  const [projectDescription, setProjectDescription] = useState('');
  const [partners, setPartners] = useState(null);
  const { invokeAI, status: aiStatus, isLoading: loading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const findPartners = async () => {
    if (!projectDescription) {
      toast.error(t({ en: 'Please enter project description', ar: 'الرجاء إدخال وصف المشروع' }));
      return;
    }

    const result = await invokeAI({
      prompt: `Find optimal partners for this R&D project/challenge:

${projectDescription}

Suggest 5 potential partners (universities, startups, municipalities) with:
- Partner name
- Why this partner? (expertise match)
- Past performance/track record
- Suggested role in collaboration`,
      response_json_schema: {
        type: 'object',
        properties: {
          partners: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                type: { type: 'string' },
                expertise_en: { type: 'string' },
                expertise_ar: { type: 'string' },
                rationale_en: { type: 'string' },
                rationale_ar: { type: 'string' },
                role_en: { type: 'string' },
                role_ar: { type: 'string' },
                match_score: { type: 'number' }
              }
            }
          }
        }
      }
    });

    if (result.success) {
      setPartners(result.data.partners);
      toast.success(t({ en: 'Partners identified', ar: 'تم تحديد الشركاء' }));
    } else {
      toast.error(t({ en: 'Failed to find partners', ar: 'فشل العثور على شركاء' }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5" />
          {t({ en: 'Collaboration Mapper', ar: 'خريطة التعاون' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            {t({ en: 'Project/Challenge Description', ar: 'وصف المشروع/التحدي' })}
          </label>
          <Textarea
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            rows={4}
            placeholder={t({ en: 'Describe the project...', ar: 'صف المشروع...' })}
          />
        </div>

        <Button onClick={findPartners} disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          {t({ en: 'Find Partners', ar: 'البحث عن شركاء' })}
        </Button>

        {partners && (
          <div className="space-y-3 pt-4 border-t">
            {partners.map((partner, idx) => (
              <div key={idx} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-900">{partner.name}</p>
                    <Badge className="mt-1">{partner.type}</Badge>
                  </div>
                  <Badge className="bg-blue-600">{partner.match_score}% match</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-slate-600">{t({ en: 'Expertise:', ar: 'الخبرة:' })}</p>
                    <p className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      {language === 'ar' ? partner.expertise_ar : partner.expertise_en}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-600">{t({ en: 'Why this partner?', ar: 'لماذا هذا الشريك؟' })}</p>
                    <p className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      {language === 'ar' ? partner.rationale_ar : partner.rationale_en}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-600">{t({ en: 'Suggested Role:', ar: 'الدور المقترح:' })}</p>
                    <p className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      {language === 'ar' ? partner.role_ar : partner.role_en}
                    </p>
                  </div>
                </div>
                <Button size="sm" className="w-full mt-3 bg-blue-600">
                  <Mail className="h-3 w-3 mr-2" />
                  {t({ en: 'Generate Introduction Email', ar: 'إنشاء بريد تعريفي' })}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}