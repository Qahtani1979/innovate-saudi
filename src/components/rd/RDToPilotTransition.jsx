import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '../LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TestTube, Sparkles, Loader2, AlertCircle, Microscope } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { useEmailTrigger } from '@/hooks/useEmailTrigger';
import { PILOT_TRANSITION_PROMPTS } from '@/lib/ai/prompts/rd';
import { getSystemPrompt } from '@/lib/saudiContext';

export default function RDToPilotTransition({ rdProject, onClose, onSuccess }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const { triggerEmail } = useEmailTrigger();
  const { invokeAI, status: aiStatus, isLoading: aiGenerating, isAvailable, rateLimitInfo } = useAIWithFallback();
  const [selectedMunicipality, setSelectedMunicipality] = useState('');
  const [pilotData, setPilotData] = useState({
    title_en: '',
    title_ar: '',
    description_en: '',
    description_ar: '',
    objective_en: '',
    objective_ar: '',
    hypothesis: '',
    methodology: rdProject.methodology_en || '',
    sector: rdProject.research_area_en || '',
    municipality_id: '',
    challenge_ids: rdProject.challenge_ids || [],
    linked_rd_project_id: rdProject.id,
    trl_start: rdProject.trl_current || 6,
    trl_target: 8,
    stage: 'design',
    duration_weeks: 16,
    budget: Math.round((rdProject.budget || 200000) * 0.7)
  });

  const { data: municipalities = [] } = useQuery({
    queryKey: ['municipalities-for-pilot'],
    queryFn: () => base44.entities.Municipality.list()
  });

  const selectedMunicipalityData = municipalities.find(m => m.id === selectedMunicipality);

  const generatePilotDesign = async () => {
    if (!selectedMunicipality) {
      toast.error(t({ en: 'Select municipality first', ar: 'اختر البلدية أولاً' }));
      return;
    }

    try {
      const result = await invokeAI({
        systemPrompt: getSystemPrompt('rd_pilot_transition'),
        prompt: PILOT_TRANSITION_PROMPTS.buildPrompt(rdProject, selectedMunicipalityData),
        response_json_schema: PILOT_TRANSITION_PROMPTS.schema
      });

      if (result.success && result.data) {
        setPilotData(prev => ({
          ...prev,
          ...result.data,
          municipality_id: selectedMunicipality
        }));
        toast.success(t({ en: 'AI generated pilot design', ar: 'تم إنشاء تصميم التجربة' }));
      }
    } catch (error) {
      toast.error(t({ en: 'AI generation failed', ar: 'فشل الإنشاء' }));
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const pilot = await base44.entities.Pilot.create(data);
      
      await base44.entities.RDProject.update(rdProject.id, {
        pilot_opportunities: [
          ...(rdProject.pilot_opportunities || []),
          {
            description_en: `Pilot created: ${pilot.title_en}`,
            pilot_id: pilot.id,
            municipality: data.municipality_id,
            status: 'created'
          }
        ]
      });

      return pilot;
    },
    onSuccess: async (pilot) => {
      queryClient.invalidateQueries({ queryKey: ['rd-projects'] });
      queryClient.invalidateQueries({ queryKey: ['pilots'] });
      
      await triggerEmail('pilot.created', {
        entityType: 'pilot',
        entityId: pilot.id,
        variables: {
          pilot_title: pilot.title_en,
          pilot_code: pilot.code,
          rd_project_title: rdProject.title_en,
          rd_project_id: rdProject.id
        }
      }).catch(err => console.error('Email trigger failed:', err));
      
      toast.success(t({ en: 'Pilot created!', ar: 'تم إنشاء التجربة!' }));
      onSuccess?.(pilot);
      onClose?.();
    }
  });

  return (
    <Card className="max-w-5xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-teal-50">
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5 text-blue-600" />
          {t({ en: 'Transition to Pilot', ar: 'الانتقال إلى تجربة' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <AIStatusIndicator status={aiStatus} rateLimitInfo={rateLimitInfo} className="mb-2" />

        {rdProject.trl_current < 6 && (
          <div className="p-4 bg-red-50 border border-red-300 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-900">
                {t({ en: 'TRL Too Low', ar: 'مستوى النضج منخفض' })}
              </p>
              <p className="text-xs text-red-700">
                {t({ en: 'TRL must be ≥ 6 for pilot. Current:', ar: 'مستوى النضج يجب أن يكون ≥ 6. الحالي:' })} {rdProject.trl_current}
              </p>
            </div>
          </div>
        )}

        <div className="p-4 bg-purple-50 rounded-lg flex items-start gap-3">
          <Microscope className="h-5 w-5 text-purple-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-medium text-purple-900 mb-1">
              {t({ en: 'Source R&D:', ar: 'المصدر البحثي:' })}
            </p>
            <p className="text-sm font-semibold">{language === 'ar' && rdProject.title_ar ? rdProject.title_ar : rdProject.title_en}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">{t({ en: 'TRL', ar: 'النضج' })}: {rdProject.trl_current}</Badge>
              <Badge>{rdProject.status}</Badge>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            {t({ en: 'Test Municipality', ar: 'بلدية الاختبار' })}
          </label>
          <Select value={selectedMunicipality} onValueChange={setSelectedMunicipality}>
            <SelectTrigger>
              <SelectValue placeholder={t({ en: 'Select municipality...', ar: 'اختر البلدية...' })} />
            </SelectTrigger>
            <SelectContent>
              {municipalities.map(m => (
                <SelectItem key={m.id} value={m.id}>
                  {language === 'ar' && m.name_ar ? m.name_ar : m.name_en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={generatePilotDesign}
          disabled={aiGenerating || !selectedMunicipality}
          className="w-full bg-gradient-to-r from-blue-600 to-teal-600"
        >
          {aiGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t({ en: 'Generating...', ar: 'جاري الإنشاء...' })}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              {t({ en: 'Generate Pilot Design', ar: 'إنشاء تصميم التجربة' })}
            </>
          )}
        </Button>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">{t({ en: 'Title (EN)', ar: 'العنوان (EN)' })}</label>
            <Input
              value={pilotData.title_en}
              onChange={(e) => setPilotData({ ...pilotData, title_en: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t({ en: 'Title (AR)', ar: 'العنوان (AR)' })}</label>
            <Input
              value={pilotData.title_ar}
              onChange={(e) => setPilotData({ ...pilotData, title_ar: e.target.value })}
              dir="rtl"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">{t({ en: 'Hypothesis', ar: 'الفرضية' })}</label>
          <Textarea
            value={pilotData.hypothesis}
            onChange={(e) => setPilotData({ ...pilotData, hypothesis: e.target.value })}
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">{t({ en: 'Objective (EN)', ar: 'الهدف (EN)' })}</label>
            <Textarea
              value={pilotData.objective_en}
              onChange={(e) => setPilotData({ ...pilotData, objective_en: e.target.value })}
              rows={3}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t({ en: 'Objective (AR)', ar: 'الهدف (AR)' })}</label>
            <Textarea
              value={pilotData.objective_ar}
              onChange={(e) => setPilotData({ ...pilotData, objective_ar: e.target.value })}
              rows={3}
              dir="rtl"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
          <Button
            onClick={() => createMutation.mutate(pilotData)}
            disabled={createMutation.isPending || rdProject.trl_current < 6 || !pilotData.title_en}
            className="bg-gradient-to-r from-blue-600 to-teal-600"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t({ en: 'Creating...', ar: 'جاري الإنشاء...' })}
              </>
            ) : (
              <>
                <TestTube className="h-4 w-4 mr-2" />
                {t({ en: 'Create Pilot', ar: 'إنشاء التجربة' })}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
