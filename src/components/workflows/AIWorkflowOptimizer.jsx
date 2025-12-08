import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Sparkles, Loader2, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AIWorkflowOptimizer({ workflowData }) {
  const { language, isRTL, t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [optimization, setOptimization] = useState(null);

  const handleOptimize = async () => {
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this workflow and suggest optimizations:
Workflow: ${JSON.stringify(workflowData)}

Provide:
1. Bottleneck identification
2. Efficiency improvements
3. Suggested stage reductions or merges
4. SLA optimization
5. Automation opportunities`,
        response_json_schema: {
          type: 'object',
          properties: {
            bottlenecks: { type: 'array', items: { type: 'object', properties: { stage: { type: 'string' }, issue: { type: 'string' }, impact: { type: 'string' } } } },
            improvements: { type: 'array', items: { type: 'object', properties: { suggestion: { type: 'string' }, benefit: { type: 'string' } } } },
            efficiency_score: { type: 'number' },
            automation_opportunities: { type: 'array', items: { type: 'string' } }
          }
        }
      });
      setOptimization(result);
      toast.success(t({ en: 'AI analysis complete', ar: 'اكتمل التحليل' }));
    } catch (error) {
      toast.error(t({ en: 'Optimization failed', ar: 'فشل التحسين' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-green-600" />
          {t({ en: 'AI Workflow Optimizer', ar: 'محسن سير العمل الذكي' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleOptimize} disabled={loading} className="w-full bg-green-600">
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          {t({ en: 'Analyze & Optimize Workflow', ar: 'تحليل وتحسين سير العمل' })}
        </Button>

        {optimization && (
          <div className="space-y-3">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-900">{t({ en: 'Efficiency Score', ar: 'نقاط الكفاءة' })}</span>
                <Badge className="bg-green-600 text-white">{optimization.efficiency_score}%</Badge>
              </div>
            </div>

            {optimization.bottlenecks?.length > 0 && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <p className="font-semibold text-red-900">{t({ en: 'Bottlenecks Detected', ar: 'اختناقات مكتشفة' })}</p>
                </div>
                <div className="space-y-2">
                  {optimization.bottlenecks.map((b, i) => (
                    <div key={i} className="text-sm">
                      <p className="font-medium text-red-900">{b.stage}</p>
                      <p className="text-xs text-red-700">{b.issue} - {b.impact}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {optimization.improvements?.length > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <p className="font-semibold text-blue-900">{t({ en: 'Suggested Improvements', ar: 'تحسينات مقترحة' })}</p>
                </div>
                <div className="space-y-2">
                  {optimization.improvements.map((imp, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="flex-1 text-sm">
                        <p className="font-medium text-blue-900">{imp.suggestion}</p>
                        <p className="text-xs text-blue-700">{imp.benefit}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}