import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../LanguageContext';
import { Shield, FileText, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

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
      prompt: `Analyze this regulatory sandbox's findings and generate a policy reform recommendation.

Sandbox: ${sandbox.name_en}
Description: ${sandbox.description_en}
Sector: ${sandbox.sector}
Regulatory Framework: ${sandbox.regulatory_framework_tested || 'N/A'}
Key Findings: ${sandbox.key_findings?.join(', ') || 'N/A'}
Regulatory Challenges: ${sandbox.regulatory_challenges_identified?.join(', ') || 'N/A'}
Success Metrics: ${JSON.stringify(sandbox.success_metrics) || 'N/A'}

Generate a policy recommendation that addresses the regulatory gaps identified. Include:
1. Policy title (EN + AR)
2. Problem statement
3. Current regulatory barriers
4. Proposed regulatory changes
5. Expected impact
6. Implementation approach
7. Stakeholders affected
8. Risk considerations

Return as JSON.`,
      response_json_schema: {
        type: "object",
        properties: {
          title_en: { type: "string" },
          title_ar: { type: "string" },
          problem_statement_en: { type: "string" },
          problem_statement_ar: { type: "string" },
          current_barriers: { type: "array", items: { type: "string" } },
          proposed_changes: { type: "array", items: { type: "string" } },
          expected_impact_en: { type: "string" },
          expected_impact_ar: { type: "string" },
          implementation_approach: { type: "string" },
          stakeholders: { type: "array", items: { type: "string" } },
          risks: { type: "array", items: { type: "string" } }
        }
      }
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