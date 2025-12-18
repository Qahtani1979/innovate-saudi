import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '../LanguageContext';
import { Sparkles, Calendar, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import {
  PROGRAM_CONVERTER_SYSTEM_PROMPT,
  buildProgramConverterPrompt,
  PROGRAM_CONVERTER_SCHEMA
} from '@/lib/ai/prompts/scaling/programConverter';

export default function ScalingToProgramConverter({ scalingPlan, onClose, onSuccess }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [programData, setProgramData] = useState({
    name_en: '',
    name_ar: '',
    objectives_en: '',
    objectives_ar: '',
    curriculum: []
  });
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const createProgramMutation = useMutation({
    mutationFn: async (data) => {
      const program = await base44.entities.Program.create(data);
      
      await base44.entities.ScalingPlan.update(scalingPlan.id, {
        institutionalization_program_id: program.id,
        institutionalization_date: new Date().toISOString()
      });

      await base44.entities.SystemActivity.create({
        entity_type: 'scaling_plan',
        entity_id: scalingPlan.id,
        action: 'institutionalized_as_program',
        description: `Scaling knowledge institutionalized: ${program.name_en}`
      });

      return program;
    },
    onSuccess: (program) => {
      queryClient.invalidateQueries({ queryKey: ['scaling-plans'] });
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      toast.success(t({ en: 'Training program created', ar: 'تم إنشاء البرنامج التدريبي' }));
      onSuccess?.(program);
      onClose?.();
    }
  });

  const generateWithAI = async () => {
    const result = await invokeAI({
      prompt: buildProgramConverterPrompt({ scalingPlan }),
      system_prompt: PROGRAM_CONVERTER_SYSTEM_PROMPT,
      response_json_schema: PROGRAM_CONVERTER_SCHEMA
    });

    if (result.success) {
      setProgramData(result.data);
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
      program_type: 'training',
      focus_areas: [scalingPlan.sector],
      target_participants: {
        type: ['municipalities'],
        min_participants: 10,
        max_participants: 50
      },
      duration_weeks: 12,
      status: 'planning',
      tags: ['knowledge_transfer', 'scaling', 'best_practices']
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-r from-orange-600 to-amber-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            {t({ en: 'Institutionalize as Training Program', ar: 'تحويل لبرنامج تدريبي' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} showDetails />
          
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-sm font-semibold text-orange-900 mb-2">
              {t({ en: 'Scaling Plan:', ar: 'خطة التوسع:' })}
            </p>
            <p className="font-medium text-slate-900">{scalingPlan.title_en}</p>
            <p className="text-xs text-slate-600 mt-1">
              {scalingPlan.deployed_count} {t({ en: 'cities deployed', ar: 'مدن منفذة' })}
            </p>
          </div>

          <Button
            onClick={generateWithAI}
            disabled={isLoading || !isAvailable}
            className="w-full bg-gradient-to-r from-orange-600 to-amber-600"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                {t({ en: 'Generating Curriculum...', ar: 'توليد المنهج...' })}
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                {t({ en: 'Generate Training Program from Lessons', ar: 'توليد برنامج تدريبي من الدروس' })}
              </>
            )}
          </Button>

          {programData.name_en && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="font-bold text-amber-900 text-lg mb-1">{programData.name_en}</p>
                <p className="text-sm text-slate-700">{programData.objectives_en}</p>
              </div>

              {programData.curriculum?.length > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-semibold text-blue-900 mb-3">
                    {t({ en: 'Training Curriculum:', ar: 'المنهج التدريبي:' })}
                  </p>
                  <div className="space-y-2">
                    {programData.curriculum.map((module, i) => (
                      <div key={i} className="p-2 bg-white rounded border">
                        <p className="text-sm font-medium text-slate-900">
                          Week {module.week}: {module.topic_en}
                        </p>
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
              className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600"
            >
              {createProgramMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              {t({ en: 'Create Training Program', ar: 'إنشاء البرنامج التدريبي' })}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
