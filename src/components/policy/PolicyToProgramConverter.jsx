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

export default function PolicyToProgramConverter({ policy, onClose, onSuccess }) {
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
      
      await base44.entities.PolicyRecommendation.update(policy.id, {
        implementation_program_id: program.id
      });

      await base44.entities.SystemActivity.create({
        entity_type: 'policy',
        entity_id: policy.id,
        action: 'implementation_program_created',
        description: `Implementation program created: ${program.name_en}`
      });

      return program;
    },
    onSuccess: (program) => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      toast.success(t({ en: 'Implementation program created', ar: 'تم إنشاء برنامج التنفيذ' }));
      onSuccess?.(program);
      onClose?.();
    }
  });

  const generateWithAI = async () => {
    const result = await invokeAI({
      prompt: `Design a training program to implement this policy.

POLICY:
Title: ${policy.title_en}
Recommendation: ${policy.recommendation_text_en}
Implementation Steps: ${JSON.stringify(policy.implementation_steps || [])}
Affected Stakeholders: ${policy.affected_stakeholders?.join(', ')}

Generate implementation training program:
- Program name (bilingual) - "Implementation of [Policy]"
- Objectives (what stakeholders will learn)
- Training curriculum (4-6 modules covering policy understanding, change management, practical implementation)
- Target participants (stakeholder groups)
- Timeline and rollout plan

Focus on practical implementation and stakeholder readiness.`,
      response_json_schema: {
        type: "object",
        properties: {
          name_en: { type: "string" },
          name_ar: { type: "string" },
          objectives_en: { type: "string" },
          objectives_ar: { type: "string" },
          curriculum: {
            type: "array",
            items: {
              type: "object",
              properties: {
                week: { type: "number" },
                topic_en: { type: "string" },
                topic_ar: { type: "string" },
                activities: { type: "array", items: { type: "string" } }
              }
            }
          },
          target_participants: {
            type: "object",
            properties: {
              stakeholder_groups: { type: "array", items: { type: "string" } }
            }
          }
        }
      }
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
      focus_areas: [policy.sector],
      target_participants: programData.target_participants || { 
        type: ['municipalities', 'agencies'], 
        min_participants: 15,
        max_participants: 60
      },
      duration_weeks: 8,
      status: 'planning',
      tags: ['policy_implementation', 'stakeholder_training']
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            {t({ en: 'Create Policy Implementation Program', ar: 'إنشاء برنامج تنفيذ السياسة' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} showDetails />
          
          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <p className="text-sm font-semibold text-indigo-900 mb-1">
              {t({ en: 'Policy:', ar: 'السياسة:' })}
            </p>
            <p className="font-medium text-slate-900">{policy.title_en}</p>
            <p className="text-xs text-slate-600 mt-1">
              {policy.affected_stakeholders?.length || 0} {t({ en: 'stakeholder groups', ar: 'مجموعات أصحاب المصلحة' })}
            </p>
          </div>

          <Button
            onClick={generateWithAI}
            disabled={isLoading || !isAvailable}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                {t({ en: 'Designing Program...', ar: 'تصميم البرنامج...' })}
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                {t({ en: 'Generate Implementation Program', ar: 'توليد برنامج التنفيذ' })}
              </>
            )}
          </Button>

          {programData.name_en && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-bold text-blue-900 mb-2">{programData.name_en}</p>
                <p className="text-sm text-slate-700">{programData.objectives_en}</p>
              </div>

              {programData.curriculum?.length > 0 && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-semibold text-green-900 mb-3">
                    {t({ en: 'Training Modules:', ar: 'الوحدات التدريبية:' })}
                  </p>
                  <div className="space-y-2">
                    {programData.curriculum.map((module, i) => (
                      <div key={i} className="p-2 bg-white rounded border">
                        <p className="text-sm font-medium">Week {module.week}: {module.topic_en}</p>
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
              className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600"
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
