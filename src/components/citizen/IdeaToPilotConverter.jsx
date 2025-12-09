import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLanguage } from '../LanguageContext';
import { TestTube, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function IdeaToPilotConverter({ idea, onClose }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const { invokeAI, status, isLoading: enhancing, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: municipalities = [] } = useQuery({
    queryKey: ['municipalities-brief'],
    queryFn: () => base44.entities.Municipality.list()
  });

  const [pilotData, setPilotData] = useState({
    title_en: idea.title || '',
    title_ar: '',
    description_en: idea.description || '',
    description_ar: '',
    municipality_id: idea.municipality_id || '',
    sector: idea.category || 'other',
    stage: 'design',
    hypothesis: '',
    methodology: '',
    duration_weeks: 12,
    budget: 100000
  });

  const enhanceWithAI = async () => {
    const response = await invokeAI({
      prompt: `Convert this citizen idea into a pilot proposal:

Idea: ${idea.title}
Description: ${idea.description}

Generate:
1. Pilot title (EN & AR)
2. Detailed pilot description (EN & AR)
3. Hypothesis to test
4. Methodology
5. Success criteria
6. Estimated duration (weeks)
7. Estimated budget (SAR)`,
      response_json_schema: {
        type: 'object',
        properties: {
          title_en: { type: 'string' },
          title_ar: { type: 'string' },
          description_en: { type: 'string' },
          description_ar: { type: 'string' },
          hypothesis: { type: 'string' },
          methodology: { type: 'string' },
          duration_weeks: { type: 'number' },
          budget: { type: 'number' }
        }
      }
    });

    if (response.success) {
      setPilotData({ ...pilotData, ...response.data });
      toast.success(t({ en: 'AI enhancement complete', ar: 'تم التحسين' }));
    }
  };

  const createPilotMutation = useMutation({
    mutationFn: async (data) => {
      const pilot = await base44.entities.Pilot.create({
        ...data,
        code: `PLT-IDEA-${Date.now()}`,
        citizen_origin_idea_id: idea.id
      });

      await base44.entities.CitizenIdea.update(idea.id, {
        status: 'converted_to_pilot',
        converted_pilot_id: pilot.id
      });

      await base44.functions.invoke('citizenNotifications', {
        eventType: 'idea_converted_pilot',
        ideaId: idea.id,
        pilotId: pilot.id,
        citizenEmail: idea.submitter_email
      });

      return pilot;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['citizen-ideas']);
      toast.success(t({ en: 'Pilot created!', ar: 'تم إنشاء التجربة!' }));
      if (onClose) onClose();
    }
  });

  return (
    <Card className="max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5 text-blue-600" />
          {t({ en: 'Convert Idea to Pilot', ar: 'تحويل الفكرة إلى تجربة' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
        
        <Button onClick={enhanceWithAI} disabled={enhancing || !isAvailable} variant="outline" className="w-full">
          {enhancing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          {t({ en: 'AI Enhance Pilot Proposal', ar: 'تحسين مقترح التجربة' })}
        </Button>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>{t({ en: 'Pilot Title (EN)', ar: 'عنوان التجربة (EN)' })}</Label>
            <Input
              value={pilotData.title_en}
              onChange={(e) => setPilotData({ ...pilotData, title_en: e.target.value })}
            />
          </div>
          <div>
            <Label>{t({ en: 'Municipality', ar: 'البلدية' })}</Label>
            <select
              value={pilotData.municipality_id}
              onChange={(e) => setPilotData({ ...pilotData, municipality_id: e.target.value })}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">Select...</option>
              {municipalities.map(m => (
                <option key={m.id} value={m.id}>{m.name_en}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <Label>{t({ en: 'Hypothesis', ar: 'الفرضية' })}</Label>
          <Textarea
            value={pilotData.hypothesis}
            onChange={(e) => setPilotData({ ...pilotData, hypothesis: e.target.value })}
            rows={3}
          />
        </div>

        <div>
          <Label>{t({ en: 'Methodology', ar: 'المنهجية' })}</Label>
          <Textarea
            value={pilotData.methodology}
            onChange={(e) => setPilotData({ ...pilotData, methodology: e.target.value })}
            rows={3}
          />
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose}>{t({ en: 'Cancel', ar: 'إلغاء' })}</Button>
          <Button
            onClick={() => createPilotMutation.mutate(pilotData)}
            disabled={createPilotMutation.isPending}
            className="flex-1 bg-blue-600"
          >
            {t({ en: 'Create Pilot', ar: 'إنشاء التجربة' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
