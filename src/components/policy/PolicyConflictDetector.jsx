import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { AlertCircle, Loader2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { buildPolicyConflictPrompt, POLICY_CONFLICT_SCHEMA } from '@/lib/ai/prompts/policy/conflictDetector';
import { usePoliciesList } from '@/hooks/usePolicies';

export default function PolicyConflictDetector({ policy }) {
  const { language, isRTL, t } = useLanguage();
  const [conflicts, setConflicts] = useState(null);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: allPolicies = [] } = usePoliciesList();

  const detectConflicts = async () => {
    const activePolicies = allPolicies.filter(p =>
      p.id !== policy.id &&
      ['published', 'active', 'council_approval', 'ministry_approval'].includes(p.workflow_stage || p.status)
    );

    const result = await invokeAI({
      prompt: buildPolicyConflictPrompt(policy, activePolicies),
      response_json_schema: POLICY_CONFLICT_SCHEMA
    });

    if (result.success) {
      setConflicts(result.data);
      if (result.data.has_conflicts && result.data.direct_conflicts?.length > 0) {
        toast.warning(t({
          en: `Found ${result.data.direct_conflicts.length} potential conflicts`,
          ar: `تم العثور على ${result.data.direct_conflicts.length} تعارضات محتملة`
        }));
      } else {
        toast.success(t({ en: 'No conflicts detected', ar: 'لم يتم اكتشاف تعارضات' }));
      }
    }
  };

  return (
    <Card className={conflicts?.has_conflicts ? 'border-2 border-red-200' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            {t({ en: 'Conflict Detection', ar: 'كشف التعارضات' })}
          </CardTitle>
          <Button
            onClick={detectConflicts}
            disabled={isLoading || !isAvailable}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Shield className="h-4 w-4" />
            )}
            {t({ en: 'Analyze', ar: 'تحليل' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} className="mb-4" />

        {!conflicts ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">
              {t({ en: 'Click Analyze to detect conflicts with existing policies', ar: 'انقر تحليل لكشف التعارضات مع السياسات الحالية' })}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {conflicts.direct_conflicts?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-red-900 mb-2">
                  {t({ en: '⚠️ Direct Conflicts', ar: '⚠️ تعارضات مباشرة' })}
                </p>
                <div className="space-y-2">
                  {conflicts.direct_conflicts.map((conflict, idx) => (
                    <div key={idx} className={`p-3 border-l-4 rounded-r-lg ${conflict.severity === 'high' ? 'bg-red-50 border-red-500' :
                        conflict.severity === 'medium' ? 'bg-orange-50 border-orange-500' :
                          'bg-yellow-50 border-yellow-500'
                      }`}>
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-sm font-medium text-slate-900">{conflict.policy_title}</p>
                        <Badge className={
                          conflict.severity === 'high' ? 'bg-red-600' :
                            conflict.severity === 'medium' ? 'bg-orange-600' :
                              'bg-yellow-600'
                        }>{conflict.severity}</Badge>
                      </div>
                      <p className="text-xs text-slate-700 mb-1">
                        <span className="font-medium">{conflict.conflict_type}</span>
                      </p>
                      <p className="text-xs text-slate-600">{conflict.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {conflicts.overlaps?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-amber-900 mb-2">
                  {t({ en: '📋 Policy Overlaps', ar: '📋 تداخلات السياسات' })}
                </p>
                <div className="space-y-2">
                  {conflicts.overlaps.map((overlap, idx) => (
                    <div key={idx} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm font-medium text-slate-900">{overlap.policy_title}</p>
                      <p className="text-xs text-slate-600 mt-1">{overlap.overlap_area}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {conflicts.dependencies?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-2">
                  {t({ en: '🔗 Policy Dependencies', ar: '🔗 التبعيات السياسية' })}
                </p>
                <div className="space-y-2">
                  {conflicts.dependencies.map((dep, idx) => (
                    <div key={idx} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-blue-900">{dep.policy_needed}</p>
                      <p className="text-xs text-slate-600 mt-1">{dep.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {conflicts.recommendations?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-green-900 mb-2">
                  {t({ en: '✓ Recommendations', ar: '✓ التوصيات' })}
                </p>
                <div className="space-y-2">
                  {conflicts.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                      <Shield className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-slate-700">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!conflicts.has_conflicts && conflicts.direct_conflicts?.length === 0 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-green-900">
                  {t({ en: '✓ No conflicts detected', ar: '✓ لا توجد تعارضات' })}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
