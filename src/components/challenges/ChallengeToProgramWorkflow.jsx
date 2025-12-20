import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../LanguageContext';
import { Sparkles, Calendar, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import {
  PROGRAM_CONVERSION_SYSTEM_PROMPT,
  buildProgramConversionPrompt,
  PROGRAM_CONVERSION_SCHEMA
} from '@/lib/ai/prompts/challenges/programConversion';

export default function ChallengeToProgramWorkflow({ challenge, onClose, onSuccess }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [programType, setProgramType] = useState('');
  const [programData, setProgramData] = useState({
    name_en: '',
    name_ar: '',
    objectives_en: '',
    objectives_ar: '',
    curriculum: [],
    timeline: {}
  });

  const { invokeAI, status, error, rateLimitInfo, isLoading, isAvailable } = useAIWithFallback({
    showToasts: true,
    fallbackData: null
  });

  const createProgramMutation = useMutation({
    mutationFn: async (data) => {
      const { data: program, error: programError } = await supabase.from('programs').insert(data).select().single();
      if (programError) throw programError;
      
      await supabase.from('challenges').update({
        linked_program_ids: [...(challenge.linked_program_ids || []), program.id]
      }).eq('id', challenge.id);

      await supabase.from('challenge_relations').insert({
        challenge_id: challenge.id,
        related_entity_type: 'program',
        related_entity_id: program.id,
        relation_role: 'informed_by',
        created_via: 'manual'
      });

      await supabase.from('system_activities').insert({
        entity_type: 'challenge',
        entity_id: challenge.id,
        activity_type: 'program_created',
        description_en: `Program created from challenge: ${program.name_en}`
      });

      return program;
    },
    onSuccess: (program) => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      toast.success(t({ en: 'Program created', ar: 'تم إنشاء البرنامج' }));
      onSuccess?.(program);
      onClose?.();
    }
  });

  const generateWithAI = async () => {
    if (!programType) {
      toast.error(t({ en: 'Select program type first', ar: 'اختر نوع البرنامج أولاً' }));
      return;
    }

    const { success, data } = await invokeAI({
      system_prompt: PROGRAM_CONVERSION_SYSTEM_PROMPT,
      prompt: buildProgramConversionPrompt({ challenge, programType }),
      response_json_schema: PROGRAM_CONVERSION_SCHEMA
    });

    if (success && data) {
      setProgramData(data);
      toast.success(t({ en: 'AI generated program', ar: 'تم توليد البرنامج' }));
    }
  };

  const handleSubmit = () => {
    if (!programData.name_en) {
      toast.error(t({ en: 'Generate program first', ar: 'يرجى توليد البرنامج' }));
      return;
    }

    createProgramMutation.mutate({
      ...programData,
      program_type: programType,
      focus_areas: [challenge.sector],
      status: 'planning',
      tags: ['challenge_response', challenge.sector]
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-r from-pink-600 to-purple-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            {t({ en: 'Create Program from Challenge', ar: 'إنشاء برنامج من التحدي' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} />
          
          <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
            <p className="text-sm font-semibold text-pink-900 mb-1">
              {t({ en: 'Challenge:', ar: 'التحدي:' })}
            </p>
            <p className="font-medium text-slate-900">{challenge.title_en}</p>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">
              {t({ en: 'Program Type', ar: 'نوع البرنامج' })}
            </label>
            <Select value={programType} onValueChange={setProgramType}>
              <SelectTrigger>
                <SelectValue placeholder={t({ en: 'Choose program type...', ar: 'اختر نوع البرنامج...' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="accelerator">{t({ en: 'Accelerator', ar: 'مسرع' })}</SelectItem>
                <SelectItem value="hackathon">{t({ en: 'Hackathon', ar: 'هاكاثون' })}</SelectItem>
                <SelectItem value="challenge">{t({ en: 'Challenge Competition', ar: 'مسابقة تحدي' })}</SelectItem>
                <SelectItem value="fellowship">{t({ en: 'Fellowship', ar: 'زمالة' })}</SelectItem>
                <SelectItem value="training">{t({ en: 'Training Program', ar: 'برنامج تدريبي' })}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={generateWithAI}
            disabled={isLoading || !programType || !isAvailable}
            className="w-full bg-gradient-to-r from-pink-600 to-purple-600"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                {t({ en: 'AI Designing Program...', ar: 'تصميم البرنامج...' })}
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                {t({ en: `Generate ${programType || 'Program'} Design`, ar: 'توليد تصميم البرنامج' })}
              </>
            )}
          </Button>

          {programData.name_en && (
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="font-bold text-purple-900 text-lg mb-1">{programData.name_en}</p>
                <p className="text-sm text-purple-700 mb-2">{programData.tagline_en}</p>
                <p className="text-sm text-slate-700">{programData.objectives_en}</p>
              </div>

              {programData.curriculum?.length > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-semibold text-blue-900 mb-3">
                    {t({ en: 'Program Structure:', ar: 'هيكل البرنامج:' })}
                  </p>
                  <div className="space-y-2">
                    {programData.curriculum.map((module, i) => (
                      <div key={i} className="p-2 bg-white rounded border">
                        <p className="text-sm font-medium">Week {module.week}: {module.topic_en}</p>
                        <p className="text-xs text-slate-600">{module.activities?.join(', ')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createProgramMutation.isPending || !programData.name_en}
              className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600"
            >
              {createProgramMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              {t({ en: 'Create Program', ar: 'إنشاء البرنامج' })}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
