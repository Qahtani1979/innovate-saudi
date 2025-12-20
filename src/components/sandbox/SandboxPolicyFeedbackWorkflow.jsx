import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '../LanguageContext';
import { Shield, FileText, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { getPolicyFeedbackPrompt, policyFeedbackSchema } from '@/lib/ai/prompts/sandbox';
import { getSystemPrompt } from '@/lib/saudiContext';

export default function SandboxPolicyFeedbackWorkflow({ sandbox }) {
  const { t } = useLanguage();
  const [policyDraft, setPolicyDraft] = useState(null);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();
  const queryClient = useQueryClient();

  const createPolicyMutation = useMutation({
    mutationFn: (data) => base44.entities.PolicyRecommendation.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      toast.success(t({ en: 'Policy recommendation created', ar: 'تم إنشاء توصية السياسة' }));
    }
  });

  const generatePolicyRecommendation = async () => {
    const response = await invokeAI({
      prompt: getPolicyFeedbackPrompt({ sandbox }),
      system_prompt: getSystemPrompt('FULL', true),
      response_json_schema: policyFeedbackSchema
    });

    if (response.success && response.data) {
      setPolicyDraft(response.data);
    }
  };

  const createPolicy = async () => {
    if (!policyDraft) return;

    const policyData = {
      ...policyDraft,
      policy_type: 'regulatory_reform',
      source_entity_type: 'Sandbox',
      source_entity_id: sandbox.id,
      workflow_stage: 'draft',
      regulatory_scope: sandbox.regulatory_framework_tested || 'general',
      sector: sandbox.sector,
      created_from_sandbox: true
    };

    createPolicyMutation.mutate(policyData);
    setPolicyDraft(null);
  };

  return (
    <Card className="border-2 border-purple-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-purple-600" />
          {t({ en: 'Regulatory Feedback → Policy Reform', ar: 'التغذية الراجعة التنظيمية ← إصلاح السياسة' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} className="mb-4" />
        
        {!policyDraft ? (
          <div className="text-center p-6">
            <p className="text-sm text-slate-600 mb-4">
              {t({ 
                en: 'Generate policy recommendation from sandbox regulatory learnings',
                ar: 'توليد توصية سياسة من تعلمات الصندوق التنظيمية'
              })}
            </p>
            <Button 
              onClick={generatePolicyRecommendation} 
              disabled={isLoading || !isAvailable}
              className="bg-purple-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t({ en: 'Generating...', ar: 'جاري التوليد...' })}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t({ en: 'Generate Policy Recommendation', ar: 'توليد توصية السياسة' })}
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-2">
                {policyDraft.title_en} / {policyDraft.title_ar}
              </h4>
              <p className="text-sm text-slate-700 mb-3">{policyDraft.problem_statement_en}</p>
              
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-1">Proposed Changes:</p>
                  <ul className="text-xs text-slate-600 space-y-1">
                    {policyDraft.proposed_changes?.map((change, idx) => (
                      <li key={idx}>• {change}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-1">Expected Impact:</p>
                  <p className="text-xs text-slate-600">{policyDraft.expected_impact_en}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setPolicyDraft(null)} variant="outline" className="flex-1">
                {t({ en: 'Cancel', ar: 'إلغاء' })}
              </Button>
              <Button onClick={createPolicy} className="flex-1 bg-green-600">
                <FileText className="h-4 w-4 mr-2" />
                {t({ en: 'Create Policy Recommendation', ar: 'إنشاء توصية السياسة' })}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
