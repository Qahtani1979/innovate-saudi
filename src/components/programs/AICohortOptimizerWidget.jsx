import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Users, Target, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function AICohortOptimizerWidget({ program, applications }) {
  const { t } = useLanguage();
  const [optimization, setOptimization] = useState(null);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const optimizeCohort = async () => {
    if (!applications || applications.length === 0) {
      toast.error(t({ en: 'No applications available', ar: 'لا توجد طلبات متاحة' }));
      return;
    }

    const result = await invokeAI({
      prompt: `Optimize cohort selection for innovation program:

Program: ${program.name_en}
Type: ${program.program_type}
Max Participants: ${program.target_participants?.max_participants || 20}
Objectives: ${program.objectives_en || 'N/A'}
Focus Areas: ${program.focus_areas?.join(', ') || 'N/A'}

Applications: ${applications.length} total
Current Selected: ${applications.filter(a => a.status === 'accepted').length}

Analyze applications and recommend optimal cohort composition for:
1. Diversity (sectors, backgrounds, experience levels)
2. Skill balance (technical, business, domain expertise)
3. Collaboration potential (complementary skills, partnership opportunities)
4. Predicted retention (graduation likelihood)

Provide recommendations:`,
      response_json_schema: {
        type: 'object',
        properties: {
          recommended_participants: { type: 'array', items: { type: 'string' } },
          diversity_score: { type: 'number', description: '0-100' },
          skill_balance_analysis: { type: 'string' },
          collaboration_potential_pairs: { type: 'array', items: { type: 'object', properties: { participant1: { type: 'string' }, participant2: { type: 'string' }, synergy: { type: 'string' } } } },
          predicted_graduation_rate: { type: 'number' },
          rationale: { type: 'string' },
          warnings: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    if (result.success) {
      setOptimization(result.data);
      toast.success(t({ en: 'Cohort optimized', ar: 'تم تحسين الفوج' }));
    }
  };

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Users className="h-5 w-5" />
            {t({ en: 'AI Cohort Optimizer', ar: 'محسّن الفوج الذكي' })}
          </CardTitle>
          <Button onClick={optimizeCohort} disabled={isLoading || !isAvailable} size="sm">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t({ en: 'Optimizing...', ar: 'جاري التحسين...' })}
              </>
            ) : (
              <>
                <Target className="h-4 w-4 mr-2" />
                {t({ en: 'Optimize', ar: 'تحسين' })}
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} showDetails />
        
        {optimization && (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white rounded-lg border">
                <p className="text-xs text-slate-600 mb-1">{t({ en: 'Diversity Score', ar: 'درجة التنوع' })}</p>
                <p className="text-2xl font-bold text-blue-600">{optimization.diversity_score}%</p>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <p className="text-xs text-slate-600 mb-1">{t({ en: 'Predicted Graduation', ar: 'التخرج المتوقع' })}</p>
                <p className="text-2xl font-bold text-green-600">{optimization.predicted_graduation_rate}%</p>
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded border">
              <p className="text-xs font-semibold text-blue-900 mb-1">{t({ en: 'Skill Balance', ar: 'توازن المهارات' })}</p>
              <p className="text-xs text-slate-700">{optimization.skill_balance_analysis}</p>
            </div>

            {optimization.collaboration_potential_pairs?.length > 0 && (
              <div className="p-3 bg-purple-50 rounded border">
                <p className="text-xs font-semibold text-purple-900 mb-2">{t({ en: 'Collaboration Synergies', ar: 'تآزر التعاون' })}</p>
                <div className="space-y-1">
                  {optimization.collaboration_potential_pairs.slice(0, 3).map((pair, i) => (
                    <div key={i} className="text-xs text-purple-800">
                      <strong>{pair.participant1}</strong> + <strong>{pair.participant2}</strong>: {pair.synergy}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {optimization.warnings?.length > 0 && (
              <div className="p-3 bg-amber-50 rounded border border-amber-200">
                <p className="text-xs font-semibold text-amber-900 mb-1 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {t({ en: 'Warnings', ar: 'تحذيرات' })}
                </p>
                <ul className="text-xs text-amber-800 space-y-0.5">
                  {optimization.warnings.map((warning, i) => (
                    <li key={i}>• {warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
