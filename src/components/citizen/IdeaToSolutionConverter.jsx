import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLanguage } from '../LanguageContext';
import { Lightbulb, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import {
  IDEA_TO_SOLUTION_SYSTEM_PROMPT,
  buildIdeaToSolutionPrompt,
  IDEA_TO_SOLUTION_SCHEMA
} from '@/lib/ai/prompts/citizen/ideaToSolution';
import { useCitizenIdeaMutations } from '@/hooks/useCitizenIdeaMutations';

export default function IdeaToSolutionConverter({ idea, onClose }) {
  const { language, isRTL, t } = useLanguage();
  const { invokeAI, isLoading: enhancing, status, error: aiError, rateLimitInfo } = useAIWithFallback();
  const { convertToSolution } = useCitizenIdeaMutations();
  const isConverting = convertToSolution.isPending;

  const [solutionData, setSolutionData] = useState({
    name_en: idea.title || '',
    name_ar: '',
    description_en: idea.description || '',
    description_ar: '',
    provider_name: idea.submitter_name || '',
    provider_type: 'startup',
    maturity_level: 'concept',
    trl: 1,
    contact_email: idea.submitter_email || '',
    sectors: [idea.category || 'other'],
    value_proposition: '',
    features: []
  });

  const enhanceWithAI = async () => {
    const result = await invokeAI({
      prompt: buildIdeaToSolutionPrompt({ idea }),
      system_prompt: IDEA_TO_SOLUTION_SYSTEM_PROMPT,
      response_json_schema: IDEA_TO_SOLUTION_SCHEMA
    });

    if (result.success && result.data) {
      setSolutionData({
        ...solutionData,
        ...result.data,
        provider_name: solutionData.provider_name,
        contact_email: solutionData.contact_email
      });

      toast.success(t({ en: 'AI enhancement complete', ar: 'تم التحسين الذكي' }));
    }
  };

  const handleConvert = () => {
    if (!solutionData.name_en) return;

    convertToSolution.mutate({ idea, solutionData }, {
      onSuccess: () => {
        if (onClose) onClose();
      }
    });
  };

  return (
    <Card className="max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-purple-600" />
          {t({ en: 'Convert Idea to Solution', ar: 'تحويل الفكرة إلى حل' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AIStatusIndicator status={status} error={aiError} rateLimitInfo={rateLimitInfo} />

        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-900">
            <strong>{t({ en: 'Original Idea:', ar: 'الفكرة الأصلية:' })}</strong> {idea.title}
          </p>
        </div>

        <Button
          onClick={enhanceWithAI}
          disabled={enhancing}
          variant="outline"
          className="w-full"
        >
          {enhancing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          {t({ en: 'AI Enhance Solution Details', ar: 'تحسين تفاصيل الحل بالذكاء' })}
        </Button>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>{t({ en: 'Solution Name (EN)', ar: 'اسم الحل (EN)' })}</Label>
            <Input
              value={solutionData.name_en}
              onChange={(e) => setSolutionData({ ...solutionData, name_en: e.target.value })}
            />
          </div>
          <div>
            <Label>{t({ en: 'Solution Name (AR)', ar: 'اسم الحل (AR)' })}</Label>
            <Input
              value={solutionData.name_ar}
              onChange={(e) => setSolutionData({ ...solutionData, name_ar: e.target.value })}
              dir="rtl"
            />
          </div>
        </div>

        <div>
          <Label>{t({ en: 'Description (EN)', ar: 'الوصف (EN)' })}</Label>
          <Textarea
            value={solutionData.description_en}
            onChange={(e) => setSolutionData({ ...solutionData, description_en: e.target.value })}
            rows={4}
          />
        </div>

        <div>
          <Label>{t({ en: 'Value Proposition', ar: 'عرض القيمة' })}</Label>
          <Textarea
            value={solutionData.value_proposition}
            onChange={(e) => setSolutionData({ ...solutionData, value_proposition: e.target.value })}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>{t({ en: 'Provider Name', ar: 'اسم المزود' })}</Label>
            <Input
              value={solutionData.provider_name}
              onChange={(e) => setSolutionData({ ...solutionData, provider_name: e.target.value })}
            />
          </div>
          <div>
            <Label>{t({ en: 'Maturity Level', ar: 'مستوى النضج' })}</Label>
            <select
              value={solutionData.maturity_level}
              onChange={(e) => setSolutionData({ ...solutionData, maturity_level: e.target.value })}
              className="w-full p-2 border rounded-lg"
            >
              <option value="concept">Concept</option>
              <option value="prototype">Prototype</option>
              <option value="pilot_ready">Pilot Ready</option>
              <option value="market_ready">Market Ready</option>
            </select>
          </div>
          <div>
            <Label>{t({ en: 'TRL', ar: 'مستوى TRL' })}</Label>
            <Input
              type="number"
              min="1"
              max="9"
              value={solutionData.trl}
              onChange={(e) => setSolutionData({ ...solutionData, trl: parseInt(e.target.value) })}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose}>
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
          <Button
            onClick={handleConvert}
            disabled={isConverting || !solutionData.name_en}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
          >
            {isConverting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Lightbulb className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Create Solution', ar: 'إنشاء الحل' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
