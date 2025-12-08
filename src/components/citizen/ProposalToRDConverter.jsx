import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Sparkles, Microscope, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProposalToRDConverter({ proposal, onClose, onSuccess }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const [rdData, setRdData] = useState({
    title_en: '',
    title_ar: '',
    abstract_en: '',
    abstract_ar: '',
    methodology_en: '',
    methodology_ar: '',
    expected_outputs: [],
    research_themes: []
  });

  const createRDMutation = useMutation({
    mutationFn: async (data) => {
      const rdProject = await base44.entities.RDProject.create(data);
      
      await base44.entities.InnovationProposal.update(proposal.id, {
        converted_entity_type: 'rd_project',
        converted_entity_id: rdProject.id
      });

      await base44.entities.SystemActivity.create({
        entity_type: 'innovation_proposal',
        entity_id: proposal.id,
        action: 'converted_to_rd_project',
        description: `Proposal converted to R&D Project: ${rdProject.title_en}`
      });

      return rdProject;
    },
    onSuccess: (rdProject) => {
      queryClient.invalidateQueries({ queryKey: ['innovation-proposals'] });
      queryClient.invalidateQueries({ queryKey: ['rd-projects'] });
      toast.success(t({ en: 'R&D Project created', ar: 'تم إنشاء مشروع البحث' }));
      onSuccess?.(rdProject);
      onClose?.();
    }
  });

  const generateWithAI = async () => {
    setGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Convert this innovation proposal into an R&D research project.

PROPOSAL:
${proposal.title_en}
${proposal.description_en}
Implementation Plan: ${proposal.implementation_plan_en}
Sector: ${proposal.sector || 'General'}

Generate R&D project structure:
- Research questions (3-5 specific questions)
- Methodology (detailed research approach in both AR and EN)
- Expected outputs (publications, data, tools - bilingual)
- Research themes/keywords`,
        response_json_schema: {
          type: "object",
          properties: {
            title_en: { type: "string" },
            title_ar: { type: "string" },
            abstract_en: { type: "string" },
            abstract_ar: { type: "string" },
            methodology_en: { type: "string" },
            methodology_ar: { type: "string" },
            expected_outputs: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  output_en: { type: "string" },
                  output_ar: { type: "string" },
                  type: { type: "string" }
                }
              }
            },
            research_themes: { type: "array", items: { type: "string" } }
          }
        }
      });

      setRdData(response);
      toast.success(t({ en: 'AI generated R&D structure', ar: 'تم توليد هيكل البحث' }));
    } catch (error) {
      toast.error(t({ en: 'AI generation failed', ar: 'فشل التوليد' }));
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = () => {
    if (!rdData.title_en) {
      toast.error(t({ en: 'Please generate proposal first', ar: 'يرجى توليد المقترح أولاً' }));
      return;
    }

    createRDMutation.mutate({
      ...rdData,
      institution_en: proposal.submitter_organization || 'Independent',
      institution_type: 'research_center',
      research_area_en: proposal.sector || 'Municipal Innovation',
      challenge_ids: proposal.challenge_alignment_id ? [proposal.challenge_alignment_id] : [],
      budget: proposal.budget_estimate * 1.3,
      duration_months: Math.ceil(proposal.duration_weeks / 4),
      status: 'proposal',
      principal_investigator: {
        name_en: proposal.submitter_name,
        email: proposal.submitter_email
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Microscope className="h-6 w-6" />
            {t({ en: 'Convert to R&D Research Project', ar: 'تحويل إلى مشروع بحث' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <Button
            onClick={generateWithAI}
            disabled={generating}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
            size="lg"
          >
            {generating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                {t({ en: 'Generating R&D Structure...', ar: 'توليد هيكل البحث...' })}
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                {t({ en: 'Generate R&D Project with AI', ar: 'توليد مشروع البحث بالذكاء' })}
              </>
            )}
          </Button>

          {rdData.title_en && (
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="font-semibold text-purple-900 mb-2">{rdData.title_en}</p>
                <p className="text-sm text-slate-700">{rdData.abstract_en?.slice(0, 300)}...</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  {t({ en: 'Methodology (English)', ar: 'المنهجية (إنجليزي)' })}
                </label>
                <Textarea
                  value={rdData.methodology_en}
                  onChange={(e) => setRdData({ ...rdData, methodology_en: e.target.value })}
                  rows={6}
                />
              </div>

              {rdData.expected_outputs?.length > 0 && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-semibold text-green-900 mb-2">
                    {t({ en: 'Expected Outputs:', ar: 'المخرجات المتوقعة:' })}
                  </p>
                  {rdData.expected_outputs.map((output, i) => (
                    <div key={i} className="text-xs text-slate-700">• {output.output_en}</div>
                  ))}
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
              disabled={createRDMutation.isPending || !rdData.title_en}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600"
            >
              {createRDMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              {t({ en: 'Create R&D Project', ar: 'إنشاء مشروع البحث' })}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}