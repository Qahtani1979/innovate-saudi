import { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { buildChallengeToRDPrompt, CHALLENGE_TO_RD_SCHEMA } from '@/lib/ai/prompts/challenges/challengeToRD';

import { useConvertChallengeToRDCall } from '@/hooks/useChallengeConversionMutations';

export default function ChallengeToRDWizard({ challenge, onClose, onSuccess }) {
  const { language, isRTL, t } = useLanguage();
  // queryClient removed
  const [rdCallData, setRdCallData] = useState({
    title_en: '',
    title_ar: '',
    research_area_en: challenge.sector || '',
    research_area_ar: '',
    objectives_en: '',
    objectives_ar: '',
    scope_en: '',
    scope_ar: '',
    challenge_ids: [challenge.id],
    keywords: challenge.keywords || [],
    focus_areas: [challenge.sector, challenge.sub_sector].filter(Boolean),
    budget_range_min: 100000,
    budget_range_max: 500000,
    duration_months: 18,
    max_proposals: 10,
    status: 'draft',
    call_type: 'applied_research'
  });

  const { invokeAI, status, error, rateLimitInfo, isLoading, isAvailable } = useAIWithFallback({
    showToasts: true,
    fallbackData: null
  });

  const generateRDCall = async () => {
    const response = await invokeAI({
      prompt: buildChallengeToRDPrompt(challenge),
      response_json_schema: CHALLENGE_TO_RD_SCHEMA
    });

    if (response.success) {
      setRdCallData(prev => ({
        ...prev,
        ...response.data,
        keywords: [...prev.keywords, ...(response.data.research_themes || [])]
      }));
      toast.success(t({ en: 'AI generated R&D call', ar: 'تم إنشاء دعوة البحث' }));
    }
  };

  const createMutation = useConvertChallengeToRDCall();

  const handleCreate = () => {
    createMutation.mutate({ challenge, rdCallData }, {
      onSuccess: (rdCall) => {
        onSuccess?.(rdCall);
        onClose?.();
      }
    });
  };

  return (
    <Card className="max-w-5xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-purple-600" />
          {t({ en: 'Create R&D Call from Challenge', ar: 'إنشاء دعوة بحث من التحدي' })}
        </CardTitle>
        <p className="text-sm text-slate-600 mt-2">
          {t({ en: 'Transform municipal challenge into research opportunity', ar: 'تحويل التحدي البلدي إلى فرصة بحثية' })}
        </p>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} showDetails />

        {/* Challenge Context */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-xs font-medium text-blue-900 mb-2">
            {t({ en: 'Source Challenge:', ar: 'التحدي المصدر:' })}
          </p>
          <p className="text-sm font-semibold text-slate-900">{challenge.title_en}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{challenge.sector}</Badge>
            <Badge>{challenge.priority}</Badge>
          </div>
        </div>

        {/* AI Generation */}
        <Button
          onClick={generateRDCall}
          disabled={isLoading || !isAvailable}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              {t({ en: 'AI Generating R&D Call...', ar: 'جاري إنشاء دعوة البحث...' })}
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              {t({ en: 'Generate R&D Call with AI', ar: 'إنشاء دعوة بحث بالذكاء' })}
            </>
          )}
        </Button>

        {/* Form */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">{t({ en: 'Call Title (EN)', ar: 'عنوان الدعوة (EN)' })}</label>
            <Input
              value={rdCallData.title_en}
              onChange={(e) => setRdCallData({ ...rdCallData, title_en: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t({ en: 'Call Title (AR)', ar: 'عنوان الدعوة (AR)' })}</label>
            <Input
              value={rdCallData.title_ar}
              onChange={(e) => setRdCallData({ ...rdCallData, title_ar: e.target.value })}
              dir="rtl"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">{t({ en: 'Research Objectives (EN)', ar: 'الأهداف (EN)' })}</label>
            <Textarea
              value={rdCallData.objectives_en}
              onChange={(e) => setRdCallData({ ...rdCallData, objectives_en: e.target.value })}
              rows={4}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t({ en: 'Research Objectives (AR)', ar: 'الأهداف (AR)' })}</label>
            <Textarea
              value={rdCallData.objectives_ar}
              onChange={(e) => setRdCallData({ ...rdCallData, objectives_ar: e.target.value })}
              rows={4}
              dir="rtl"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">{t({ en: 'Scope (EN)', ar: 'النطاق (EN)' })}</label>
            <Textarea
              value={rdCallData.scope_en}
              onChange={(e) => setRdCallData({ ...rdCallData, scope_en: e.target.value })}
              rows={3}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t({ en: 'Scope (AR)', ar: 'النطاق (AR)' })}</label>
            <Textarea
              value={rdCallData.scope_ar}
              onChange={(e) => setRdCallData({ ...rdCallData, scope_ar: e.target.value })}
              rows={3}
              dir="rtl"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">{t({ en: 'Budget Min (SAR)', ar: 'الميزانية الدنيا' })}</label>
            <Input
              type="number"
              value={rdCallData.budget_range_min}
              onChange={(e) => setRdCallData({ ...rdCallData, budget_range_min: parseFloat(e.target.value) })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t({ en: 'Budget Max (SAR)', ar: 'الميزانية القصوى' })}</label>
            <Input
              type="number"
              value={rdCallData.budget_range_max}
              onChange={(e) => setRdCallData({ ...rdCallData, budget_range_max: parseFloat(e.target.value) })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t({ en: 'Duration (months)', ar: 'المدة (أشهر)' })}</label>
            <Input
              type="number"
              value={rdCallData.duration_months}
              onChange={(e) => setRdCallData({ ...rdCallData, duration_months: parseInt(e.target.value) })}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
          <Button
            onClick={handleCreate}
            disabled={createMutation.isPending || !rdCallData.title_en || !rdCallData.title_ar}
            className="bg-gradient-to-r from-purple-600 to-indigo-600"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t({ en: 'Creating...', ar: 'جاري الإنشاء...' })}
              </>
            ) : (
              <>
                <Megaphone className="h-4 w-4 mr-2" />
                {t({ en: 'Create R&D Call', ar: 'إنشاء دعوة البحث' })}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}