import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLanguage } from '../LanguageContext';
import { Microscope, Loader2, Sparkles, CheckCircle2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { useAuth } from '@/lib/AuthContext';
import { getSystemPrompt } from '@/lib/saudiContext';
import { 
  buildRDCollaborationPrompt, 
  rdCollaborationSchema,
  RD_COLLABORATION_SYSTEM_PROMPT 
} from '@/lib/ai/prompts/solution';

export default function SolutionRDCollaborationProposal({ solution, onClose }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title_en: `R&D Collaboration: ${solution.name_en}`,
    title_ar: '',
    research_area_en: solution.sectors?.[0] || '',
    research_area_ar: '',
    abstract_en: '',
    abstract_ar: '',
    collaboration_type: 'joint_development',
    proposed_objectives: '',
    expected_trl_improvement: solution.trl ? solution.trl + 2 : 5,
    proposed_budget: 0,
    duration_months: 12,
    institution_en: '',
    institution_ar: ''
  });
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const createRDProject = useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase
        .from('rd_projects')
        .insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['rd-projects']);
      toast.success(t({ en: 'R&D proposal created', ar: 'تم إنشاء المقترح' }));
      onClose?.();
    }
  });

  const enhanceWithAI = async () => {
    const result = await invokeAI({
      system_prompt: getSystemPrompt(RD_COLLABORATION_SYSTEM_PROMPT),
      prompt: buildRDCollaborationPrompt(solution, formData),
      response_json_schema: rdCollaborationSchema
    });

    if (result.success) {
      setFormData({
        ...formData,
        abstract_en: result.data.abstract_en,
        abstract_ar: result.data.abstract_ar,
        methodology_en: result.data.methodology_en
      });
      toast.success(t({ en: 'Proposal enhanced', ar: 'تم تحسين المقترح' }));
    }
  };

  const handleSubmit = () => {
    const rdProjectData = {
      ...formData,
      status: 'proposal',
      principal_investigator: {
        name_en: user?.full_name || '',
        email: user?.email || ''
      },
      challenge_ids: solution.challenges_discovered || [],
      trl_target: formData.expected_trl_improvement,
      collaboration_agreements: [{
        partner: solution.provider_name,
        agreement_url: '',
        signed_date: new Date().toISOString()
      }]
    };

    createRDProject.mutate(rdProjectData);
  };

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Microscope className="h-5 w-5 text-purple-600" />
            {t({ en: 'Propose R&D Collaboration', ar: 'اقترح تعاون بحثي' })}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-slate-600">
          {t({ en: `Collaborate with ${solution.provider_name} on R&D`, ar: `تعاون مع ${solution.provider_name}` })}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>{t({ en: 'Your Institution (EN)', ar: 'مؤسستك' })}</Label>
            <Input
              value={formData.institution_en}
              onChange={(e) => setFormData({ ...formData, institution_en: e.target.value })}
              placeholder="King Saud University"
            />
          </div>
          <div>
            <Label>{t({ en: 'Research Area (EN)', ar: 'المجال البحثي' })}</Label>
            <Input
              value={formData.research_area_en}
              onChange={(e) => setFormData({ ...formData, research_area_en: e.target.value })}
              placeholder="Smart City Technologies"
            />
          </div>
        </div>

        <div>
          <Label>{t({ en: 'Proposed Objectives', ar: 'الأهداف المقترحة' })}</Label>
          <Textarea
            value={formData.proposed_objectives}
            onChange={(e) => setFormData({ ...formData, proposed_objectives: e.target.value })}
            placeholder="What do you want to achieve together?"
            rows={3}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>{t({ en: 'Target TRL', ar: 'المستوى المستهدف' })}</Label>
            <Input
              type="number"
              value={formData.expected_trl_improvement}
              onChange={(e) => setFormData({ ...formData, expected_trl_improvement: parseInt(e.target.value) })}
              min={1}
              max={9}
            />
          </div>
          <div>
            <Label>{t({ en: 'Duration (months)', ar: 'المدة' })}</Label>
            <Input
              type="number"
              value={formData.duration_months}
              onChange={(e) => setFormData({ ...formData, duration_months: parseInt(e.target.value) })}
            />
          </div>
        </div>

        <Button
          onClick={enhanceWithAI}
          disabled={isLoading || !isAvailable || !formData.institution_en}
          variant="outline"
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t({ en: 'AI enhancing proposal...', ar: 'جاري التحسين...' })}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              {t({ en: 'Enhance with AI', ar: 'تحسين بالذكاء' })}
            </>
          )}
        </Button>

        {formData.abstract_en && (
          <div className="p-3 bg-purple-50 rounded border border-purple-200">
            <p className="text-sm font-semibold text-purple-900 mb-2">
              {t({ en: 'AI-Generated Abstract', ar: 'الملخص المولد' })}
            </p>
            <p className="text-xs text-slate-700 leading-relaxed">{formData.abstract_en}</p>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={createRDProject.isPending || !formData.institution_en || !formData.abstract_en}
          className="w-full bg-purple-600"
        >
          {createRDProject.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4 mr-2" />
          )}
          {t({ en: 'Submit R&D Collaboration Proposal', ar: 'إرسال المقترح' })}
        </Button>
      </CardContent>
    </Card>
  );
}
