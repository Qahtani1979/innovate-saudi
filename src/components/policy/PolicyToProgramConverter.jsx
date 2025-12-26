import { useState } from 'react';
import { usePolicyMutations } from '@/hooks/usePolicyMutations';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '../LanguageContext';
import { Sparkles, Calendar, Loader2, CheckCircle2, Wand2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  buildPolicyToProgramPrompt,
  POLICY_TO_PROGRAM_SYSTEM_PROMPT,
  POLICY_TO_PROGRAM_SCHEMA
} from '@/lib/ai/prompts/policy/policyToProgram';

export default function PolicyToProgramConverter({ policy, open, onOpenChange, onClose, onSuccess }) {
  const { language, isRTL, t } = useLanguage();
  const [programData, setProgramData] = useState({
    name_en: '',
    name_ar: '',
    objectives_en: '',
    objectives_ar: '',
    curriculum: []
  });
  const { convertPolicyToProgram } = usePolicyMutations();
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const handleCreateProgram = () => {
    if (!programData.name_en) {
      toast.error(t({ en: 'Generate program first', ar: 'يرجى توليد البرنامج' }));
      return;
    }

    convertPolicyToProgram.mutate({
      policyId: policy.id,
      programData: {
        ...programData,
        program_type: 'training',
        focus_areas: [policy.sector],
        target_participants: programData.target_participants || {
          type: ['municipalities', 'agencies'],
          min_participants: 15,
          max_participants: 60
        },
        duration_weeks: 8,
        status: 'planning',
        tags: ['policy_implementation', 'stakeholder_training']
      }
    }, {
      onSuccess: (program) => {
        onSuccess?.(program);
        onClose?.();
      }
    });
  };

  const generateWithAI = async () => {
    const result = await invokeAI({
      system_prompt: POLICY_TO_PROGRAM_SYSTEM_PROMPT,
      prompt: buildPolicyToProgramPrompt({ policy }),
      response_json_schema: POLICY_TO_PROGRAM_SCHEMA
    });

    if (result.success) {
      setProgramData(result.data);
      toast.success(t({ en: 'AI generated program', ar: 'تم توليد البرنامج' }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle>
            {t({
              en: 'Convert Policy to Implementation Program',
              ar: 'تحويل السياسة إلى برنامج تنفيذ'
            })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} showDetails />

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="font-semibold text-blue-900 mb-2">
              {language === 'en' ? policy.title_en : policy.title_ar}
            </h3>
            <p className="text-sm text-blue-700">
              {language === 'en' ? policy.description_en : policy.description_ar}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <label className="text-sm font-medium">
                {t({ en: 'Program Name (EN)', ar: 'اسم البرنامج (EN)' })}
              </label>
              <Input
                value={programData.name_en}
                onChange={(e) => setProgramData({ ...programData, name_en: e.target.value })}
                placeholder="Ex: Urban Planning Masterclass"
              />
            </div>
            <div className="space-y-4">
              <label className="text-sm font-medium">
                {t({ en: 'Program Name (AR)', ar: 'اسم البرنامج (AR)' })}
              </label>
              <Input
                value={programData.name_ar}
                onChange={(e) => setProgramData({ ...programData, name_ar: e.target.value })}
                placeholder="مثال: دورة التخطيط الحضري"
                dir="rtl"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium">
              {t({ en: 'Program Objectives', ar: 'أهداف البرنامج' })}
            </label>
            <Textarea
              value={language === 'en' ? programData.objectives_en : programData.objectives_ar}
              onChange={(e) => setProgramData({
                ...programData,
                [language === 'en' ? 'objectives_en' : 'objectives_ar']: e.target.value
              })}
              className="h-24"
            />
          </div>

          {programData.curriculum?.length > 0 && (
            <div className="space-y-4 border rounded-lg p-4">
              <h4 className="font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                {t({ en: 'Proposed Curriculum', ar: 'المنهج المقترح' })}
              </h4>
              <div className="space-y-2">
                {programData.curriculum.map((module, idx) => (
                  <div key={idx} className="flex gap-2 text-sm bg-gray-50 p-2 rounded">
                    <span className="font-medium w-20">Week {module.week}:</span>
                    <span>{module.topic_en || module.topic}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={generateWithAI}
              disabled={isLoading || !isAvailable}
              className="gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4 text-purple-600" />
              )}
              {t({ en: 'Generate with AI', ar: 'توليد بالذكاء الاصطناعي' })}
            </Button>

            <Button variant="ghost" onClick={onClose}>
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button
              onClick={handleCreateProgram}
              disabled={convertPolicyToProgram.isPending || !programData.name_en}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600"
            >
              {convertPolicyToProgram.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              {t({ en: 'Create Program', ar: 'إنشاء البرنامج' })}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
