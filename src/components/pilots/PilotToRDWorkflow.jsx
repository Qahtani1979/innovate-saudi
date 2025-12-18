import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '../LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Microscope, Sparkles, Loader2, TestTube } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { buildPilotToRDPrompt, PILOT_TO_RD_SCHEMA } from '@/lib/ai/prompts/pilots/pilotToRD';

export default function PilotToRDWorkflow({ pilot, onClose, onSuccess }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const { invokeAI, status, isLoading: aiGenerating, rateLimitInfo, isAvailable } = useAIWithFallback();
  const [rdData, setRdData] = useState({
    title_en: `Research Follow-up: ${pilot.title_en || ''}`,
    title_ar: `متابعة بحثية: ${pilot.title_ar || ''}`,
    abstract_en: '',
    abstract_ar: '',
    research_area_en: pilot.sector || '',
    research_area_ar: '',
    methodology_en: '',
    methodology_ar: '',
    pilot_id: pilot.id,
    challenge_ids: pilot.challenge_id ? [pilot.challenge_id] : [],
    budget: Math.round((pilot.budget || 0) * 1.5),
    duration_months: 12,
    status: 'proposal',
    research_themes: [pilot.sector, 'pilot_follow_up'],
    trl_start: pilot.trl_current || 6,
    trl_target: 8
  });

  const generateResearchProposal = async () => {
    const { success, data } = await invokeAI({
      prompt: buildPilotToRDPrompt(pilot),
      response_json_schema: PILOT_TO_RD_SCHEMA
    });

    if (success) {
      setRdData(prev => ({
        ...prev,
        abstract_en: data.abstract_en,
        abstract_ar: data.abstract_ar,
        research_area_ar: data.research_area_ar,
        methodology_en: data.methodology_en,
        methodology_ar: data.methodology_ar,
        expected_outputs: data.expected_outputs,
        research_themes: [...prev.research_themes, ...data.research_themes]
      }));
      toast.success(t({ en: 'AI generated research proposal', ar: 'تم إنشاء المقترح البحثي' }));
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const rdProject = await base44.entities.RDProject.create(data);
      
      // Update pilot with R&D link
      await base44.entities.Pilot.update(pilot.id, {
        linked_rd_ids: [...(pilot.linked_rd_ids || []), rdProject.id]
      });

      // Create relation
      if (pilot.challenge_id) {
        await base44.entities.ChallengeRelation.create({
          challenge_id: pilot.challenge_id,
          related_entity_type: 'rd_project',
          related_entity_id: rdProject.id,
          relation_role: 'informed_by'
        });
      }

      return rdProject;
    },
    onSuccess: (rdProject) => {
      queryClient.invalidateQueries({ queryKey: ['pilots'] });
      queryClient.invalidateQueries({ queryKey: ['rd-projects'] });
      toast.success(t({ en: 'R&D project created!', ar: 'تم إنشاء المشروع البحثي!' }));
      onSuccess?.(rdProject);
      onClose?.();
    }
  });

  return (
    <Card className="max-w-4xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-blue-50">
        <CardTitle className="flex items-center gap-2">
          <Microscope className="h-5 w-5 text-purple-600" />
          {t({ en: 'Create R&D Follow-up', ar: 'إنشاء متابعة بحثية' })}
        </CardTitle>
        <p className="text-sm text-slate-600 mt-2">
          {t({ en: 'Generate research project from pilot learnings', ar: 'إنشاء مشروع بحثي من نتائج التجربة' })}
        </p>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Pilot Context */}
        <div className="p-4 bg-blue-50 rounded-lg flex items-start gap-3">
          <TestTube className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-blue-900 mb-1">
              {t({ en: 'Source Pilot:', ar: 'التجربة المصدر:' })}
            </p>
            <p className="text-sm font-semibold text-slate-900">{pilot.title_en}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">{pilot.stage}</Badge>
              {pilot.recommendation && <Badge>{pilot.recommendation}</Badge>}
            </div>
          </div>
        </div>

        {/* AI Generation */}
        <div className="flex justify-end items-center gap-2">
          <Button
            onClick={generateResearchProposal}
            disabled={aiGenerating || !isAvailable}
            className="bg-gradient-to-r from-purple-600 to-indigo-600"
          >
            {aiGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t({ en: 'Generating...', ar: 'جاري الإنشاء...' })}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                {t({ en: 'Generate AI Proposal', ar: 'إنشاء مقترح ذكي' })}
              </>
            )}
          </Button>
          <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
        </div>

        {/* Form */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">{t({ en: 'Title (EN)', ar: 'العنوان (EN)' })}</label>
            <Input
              value={rdData.title_en}
              onChange={(e) => setRdData({ ...rdData, title_en: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t({ en: 'Title (AR)', ar: 'العنوان (AR)' })}</label>
            <Input
              value={rdData.title_ar}
              onChange={(e) => setRdData({ ...rdData, title_ar: e.target.value })}
              dir="rtl"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">{t({ en: 'Abstract (EN)', ar: 'الملخص (EN)' })}</label>
            <Textarea
              value={rdData.abstract_en}
              onChange={(e) => setRdData({ ...rdData, abstract_en: e.target.value })}
              rows={4}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t({ en: 'Abstract (AR)', ar: 'الملخص (AR)' })}</label>
            <Textarea
              value={rdData.abstract_ar}
              onChange={(e) => setRdData({ ...rdData, abstract_ar: e.target.value })}
              rows={4}
              dir="rtl"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">{t({ en: 'Methodology (EN)', ar: 'المنهجية (EN)' })}</label>
            <Textarea
              value={rdData.methodology_en}
              onChange={(e) => setRdData({ ...rdData, methodology_en: e.target.value })}
              rows={3}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t({ en: 'Methodology (AR)', ar: 'المنهجية (AR)' })}</label>
            <Textarea
              value={rdData.methodology_ar}
              onChange={(e) => setRdData({ ...rdData, methodology_ar: e.target.value })}
              rows={3}
              dir="rtl"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">{t({ en: 'Budget (SAR)', ar: 'الميزانية (ريال)' })}</label>
            <Input
              type="number"
              value={rdData.budget}
              onChange={(e) => setRdData({ ...rdData, budget: parseFloat(e.target.value) })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t({ en: 'Duration (months)', ar: 'المدة (أشهر)' })}</label>
            <Input
              type="number"
              value={rdData.duration_months}
              onChange={(e) => setRdData({ ...rdData, duration_months: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t({ en: 'Target TRL', ar: 'مستوى النضج المستهدف' })}</label>
            <Input
              type="number"
              min="1"
              max="9"
              value={rdData.trl_target}
              onChange={(e) => setRdData({ ...rdData, trl_target: parseInt(e.target.value) })}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
          <Button
            onClick={() => createMutation.mutate(rdData)}
            disabled={createMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-indigo-600"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t({ en: 'Creating...', ar: 'جاري الإنشاء...' })}
              </>
            ) : (
              <>
                <Microscope className="h-4 w-4 mr-2" />
                {t({ en: 'Create R&D Project', ar: 'إنشاء مشروع بحثي' })}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}