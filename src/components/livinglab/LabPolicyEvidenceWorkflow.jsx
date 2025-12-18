import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '../LanguageContext';
import { Beaker, FileText, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import {
  POLICY_EVIDENCE_SYSTEM_PROMPT,
  buildPolicyEvidencePrompt,
  POLICY_EVIDENCE_SCHEMA
} from '@/lib/ai/prompts/livinglab/policyEvidence';

export default function LabPolicyEvidenceWorkflow({ livingLab }) {
  const { t } = useLanguage();
  const { invokeAI, status, isLoading: generating, isAvailable, rateLimitInfo } = useAIWithFallback();
  const [policyDraft, setPolicyDraft] = useState(null);
  const queryClient = useQueryClient();

  const createPolicyMutation = useMutation({
    mutationFn: (data) => base44.entities.PolicyRecommendation.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      toast.success(t({ en: 'Policy created from citizen evidence', ar: 'تم إنشاء السياسة من أدلة المواطنين' }));
    }
  });

  const generateFromCitizenEvidence = async () => {
    const result = await invokeAI({
      prompt: buildPolicyEvidencePrompt({ livingLab }),
      system_prompt: POLICY_EVIDENCE_SYSTEM_PROMPT,
      response_json_schema: POLICY_EVIDENCE_SCHEMA
    });

    if (result.success) {
      setPolicyDraft(result.data);
    }
  };

  const createPolicy = async () => {
    if (!policyDraft) return;

    const policyData = {
      ...policyDraft,
      policy_type: 'citizen_evidence_based',
      source_entity_type: 'LivingLab',
      source_entity_id: livingLab.id,
      workflow_stage: 'draft',
      evidence_based: true,
      citizen_participation: true
    };

    createPolicyMutation.mutate(policyData);
    setPolicyDraft(null);
  };

  return (
    <Card className="border-2 border-teal-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Beaker className="h-5 w-5 text-teal-600" />
          {t({ en: 'Citizen Evidence → Policy', ar: 'أدلة المواطنين ← السياسة' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!policyDraft ? (
          <div className="text-center p-6">
            <p className="text-sm text-slate-600 mb-4">
              {t({ 
                en: 'Generate policy recommendation from citizen science findings',
                ar: 'توليد توصية سياسة من نتائج علوم المواطنين'
              })}
            </p>
            <Button 
              onClick={generateFromCitizenEvidence} 
              disabled={generating}
              className="bg-teal-600"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t({ en: 'Analyzing Evidence...', ar: 'جاري تحليل الأدلة...' })}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t({ en: 'Generate from Citizen Data', ar: 'توليد من بيانات المواطنين' })}
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
              <h4 className="font-semibold text-teal-900 mb-2">
                {policyDraft.title_en}
              </h4>
              <p className="text-sm text-slate-700 mb-3">{policyDraft.evidence_summary_en}</p>
              <p className="text-sm text-slate-700 mb-3">{policyDraft.problem_statement_en}</p>
              
              <div className="text-xs">
                <p className="font-semibold text-slate-700 mb-1">Recommended Changes:</p>
                <ul className="space-y-1 text-slate-600">
                  {policyDraft.recommended_changes?.map((change, idx) => (
                    <li key={idx}>• {change}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setPolicyDraft(null)} variant="outline" className="flex-1">
                {t({ en: 'Cancel', ar: 'إلغاء' })}
              </Button>
              <Button onClick={createPolicy} className="flex-1 bg-green-600">
                <FileText className="h-4 w-4 mr-2" />
                {t({ en: 'Create Policy', ar: 'إنشاء السياسة' })}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
