import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLanguage } from '../LanguageContext';
import { Microscope, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import {
  IDEA_TO_RD_CONVERTER_SYSTEM_PROMPT,
  buildIdeaToRDConverterPrompt,
  IDEA_TO_RD_CONVERTER_SCHEMA
} from '@/lib/ai/prompts/citizen';
import { useConvertIdeaToRD } from '@/hooks/useCitizenIdeas';

export default function IdeaToRDConverter({ idea, onClose }) {
  const { language, isRTL, t } = useLanguage();
  const { invokeAI, status, isLoading, error: aiError, isAvailable, rateLimitInfo } = useAIWithFallback();
  const { mutate: convertToRD, isPending: isConverting } = useConvertIdeaToRD();

  const [rdData, setRdData] = useState({
    title_en: idea.title || '',
    title_ar: '',
    abstract_en: idea.description || '',
    abstract_ar: '',
    institution_en: '',
    research_area_en: idea.category || '',
    keywords: [idea.category],
    methodology_en: '',
    trl_start: 1,
    trl_target: 4,
    duration_months: 12,
    budget: 500000
  });

  const enhanceWithAI = async () => {
    const response = await invokeAI({
      system_prompt: IDEA_TO_RD_CONVERTER_SYSTEM_PROMPT,
      prompt: buildIdeaToRDConverterPrompt({ idea }),
      response_json_schema: IDEA_TO_RD_CONVERTER_SCHEMA
    });

    if (response.success && response.data) {
      setRdData({ ...rdData, ...response.data });
      toast.success(t({ en: 'AI enhancement complete', ar: 'تم التحسين' }));
    }
  };

  const handleConvert = () => {
    convertToRD({ idea, rdData }, {
      onSuccess: () => {
        if (onClose) onClose();
      }
    });
  };

  return (
    <Card className="max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Microscope className="h-5 w-5 text-indigo-600" />
          {t({ en: 'Convert Idea to R&D Project', ar: 'تحويل الفكرة إلى مشروع بحثي' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AIStatusIndicator status={status} error={aiError} rateLimitInfo={rateLimitInfo} className="mb-4" />

        <Button onClick={enhanceWithAI} disabled={isLoading || !isAvailable} variant="outline" className="w-full">
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          {t({ en: 'AI Enhance R&D Proposal', ar: 'تحسين مقترح البحث' })}
        </Button>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>{t({ en: 'R&D Title (EN)', ar: 'عنوان البحث (EN)' })}</Label>
            <Input
              value={rdData.title_en}
              onChange={(e) => setRdData({ ...rdData, title_en: e.target.value })}
            />
          </div>
          <div>
            <Label>{t({ en: 'Institution', ar: 'المؤسسة' })}</Label>
            <Input
              value={rdData.institution_en}
              onChange={(e) => setRdData({ ...rdData, institution_en: e.target.value })}
              placeholder="University / Research Center"
            />
          </div>
        </div>

        <div>
          <Label>{t({ en: 'Research Abstract', ar: 'ملخص البحث' })}</Label>
          <Textarea
            value={rdData.abstract_en}
            onChange={(e) => setRdData({ ...rdData, abstract_en: e.target.value })}
            rows={4}
          />
        </div>

        <div>
          <Label>{t({ en: 'Research Methodology', ar: 'منهجية البحث' })}</Label>
          <Textarea
            value={rdData.methodology_en}
            onChange={(e) => setRdData({ ...rdData, methodology_en: e.target.value })}
            rows={4}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>{t({ en: 'Duration (months)', ar: 'المدة (أشهر)' })}</Label>
            <Input
              type="number"
              value={rdData.duration_months}
              onChange={(e) => setRdData({ ...rdData, duration_months: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <Label>{t({ en: 'TRL Start', ar: 'TRL البداية' })}</Label>
            <Input
              type="number"
              min="1"
              max="9"
              value={rdData.trl_start}
              onChange={(e) => setRdData({ ...rdData, trl_start: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <Label>{t({ en: 'TRL Target', ar: 'TRL المستهدف' })}</Label>
            <Input
              type="number"
              min="1"
              max="9"
              value={rdData.trl_target}
              onChange={(e) => setRdData({ ...rdData, trl_target: parseInt(e.target.value) })}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose}>{t({ en: 'Cancel', ar: 'إلغاء' })}</Button>
          <Button
            onClick={handleConvert}
            disabled={isConverting}
            className="flex-1 bg-indigo-600"
          >
            {isConverting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t({ en: 'Create R&D Project', ar: 'إنشاء مشروع بحثي' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}