import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from './LanguageContext';
import { Microscope, Sparkles, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { createPageUrl } from '../utils';
import { useRDCalls } from '@/hooks/useRDCalls';
import { useChallengeToRDConversion } from '@/hooks/useChallengeConversionMutations';

export default function ChallengeToRDWizard({ challenge, onClose }) {
  const { language, isRTL, t } = useLanguage();
  const navigate = useNavigate();

  const [rdTitle, setRdTitle] = useState('');
  const [researchQuestions, setResearchQuestions] = useState('');
  const [expectedOutputs, setExpectedOutputs] = useState('');
  const [aiScope, setAiScope] = useState(null);

  const { invokeAI, status, isLoading: generatingScope, isAvailable, rateLimitInfo } = useAIWithFallback();
  const { data: rdCalls = [] } = useRDCalls();
  const challengeToRD = useChallengeToRDConversion();

  const [selectedCall, setSelectedCall] = useState('');

  const handleCreateRD = async () => {
    try {
      const rdProject = await challengeToRD.mutateAsync({
        challenge,
        rdData: {
          title: rdTitle,
          researchQuestions,
          expectedOutputs
        },
        selectedCallId: selectedCall
      });

      navigate(createPageUrl(`RDProjectDetail?id=${rdProject.id}`));
      if (onClose) onClose();
    } catch (err) {
      // error handled in hook
    }
  };

  const generateScope = async () => {
    const result = await invokeAI({
      system_prompt: CHALLENGE_TO_RD_PROMPTS.buildScope,
      prompt: buildRDScopePrompt(challenge),
      response_json_schema: RD_SCOPE_SCHEMA
    });

    if (result.success && result.data) {
      setAiScope(result.data);
      setRdTitle(result.data.project_title);
      setResearchQuestions(result.data.research_questions?.join('\n'));
      setExpectedOutputs(result.data.expected_outputs?.join('\n'));
      toast.success(t({ en: 'AI scope generated', ar: 'تم إنشاء النطاق الذكي' }));
    }
  };

  return (
    <Card className="max-w-3xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Microscope className="h-5 w-5 text-blue-600" />
            {t({ en: 'Convert to R&D Project', ar: 'تحويل لمشروع بحث' })}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Challenge Info */}
        <div className="p-4 bg-slate-50 rounded-lg border">
          <p className="text-xs text-slate-500 mb-1">{challenge.code}</p>
          <p className="font-semibold text-slate-900">{challenge.title_en}</p>
        </div>

        {/* AI Status */}
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} error={null} />

        {/* AI Scope Generator */}
        <div className="text-center">
          <Button
            onClick={generateScope}
            disabled={generatingScope || !isAvailable}
            className="bg-gradient-to-r from-blue-600 to-purple-600"
          >
            {generatingScope ? (
              <Loader2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
            ) : (
              <Sparkles className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            )}
            {t({ en: 'Generate AI R&D Scope', ar: 'إنشاء نطاق البحث الذكي' })}
          </Button>
        </div>

        {/* R&D Project Fields */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {t({ en: 'R&D Project Title', ar: 'عنوان مشروع البحث' })}
          </label>
          <Input
            value={rdTitle}
            onChange={(e) => setRdTitle(e.target.value)}
            placeholder={t({ en: 'Project title...', ar: 'عنوان المشروع...' })}
          />
        </div>

        {/* Link to R&D Call (Optional) */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {t({ en: 'Link to R&D Call (Optional)', ar: 'الربط بدعوة البحث (اختياري)' })}
          </label>
          <select
            value={selectedCall}
            onChange={(e) => setSelectedCall(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">{t({ en: 'None - Independent project', ar: 'بدون - مشروع مستقل' })}</option>
            {rdCalls.map(call => (
              <option key={call.id} value={call.id}>
                {call.title_en}
              </option>
            ))}
          </select>
        </div>

        {/* Research Questions */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {t({ en: 'Research Questions', ar: 'أسئلة البحث' })}
          </label>
          <Textarea
            value={researchQuestions}
            onChange={(e) => setResearchQuestions(e.target.value)}
            placeholder={t({ en: 'One question per line...', ar: 'سؤال واحد لكل سطر...' })}
            rows={5}
          />
        </div>

        {/* Expected Outputs */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {t({ en: 'Expected Research Outputs', ar: 'مخرجات البحث المتوقعة' })}
          </label>
          <Textarea
            value={expectedOutputs}
            onChange={(e) => setExpectedOutputs(e.target.value)}
            placeholder={t({ en: 'Publications, prototypes, datasets, etc...', ar: 'المنشورات، النماذج الأولية، مجموعات البيانات، إلخ...' })}
            rows={4}
          />
        </div>

        {/* AI Suggestions */}
        {aiScope && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs font-semibold text-blue-800 mb-2">
              {t({ en: 'AI Methodology Suggestion', ar: 'اقتراح المنهجية الذكي' })}
            </p>
            <p className="text-sm text-slate-700">{aiScope.methodology}</p>
            <p className="text-xs text-blue-700 mt-2">
              {t({ en: 'Est. Timeline:', ar: 'الجدول الزمني المقدر:' })} {aiScope.timeline_months} {t({ en: 'months', ar: 'أشهر' })}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
          <Button
            onClick={handleCreateRD}
            disabled={!rdTitle || !researchQuestions || createRDProject.isPending}
            className="bg-gradient-to-r from-blue-600 to-purple-600"
          >
            {createRDProject.isPending ? (
              <Loader2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
            ) : (
              <Microscope className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            )}
            {t({ en: 'Create R&D Project', ar: 'إنشاء مشروع البحث' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
