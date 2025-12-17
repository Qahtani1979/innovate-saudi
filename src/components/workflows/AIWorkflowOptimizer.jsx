import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Sparkles, Loader2, TrendingUp, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import useAIWithFallback, { AI_STATUS } from '@/hooks/useAIWithFallback';
import { WORKFLOW_OPTIMIZER_SYSTEM_PROMPT, buildWorkflowOptimizerPrompt, WORKFLOW_OPTIMIZER_SCHEMA } from '@/lib/ai/prompts/workflows';
import AIStatusIndicator, { AIOptionalBadge } from '@/components/ai/AIStatusIndicator';

export default function AIWorkflowOptimizer({ workflowData }) {
  const { t } = useLanguage();
  const [optimization, setOptimization] = React.useState(null);
  
  const { 
    invokeAI, 
    status, 
    error, 
    rateLimitInfo, 
    isLoading, 
    isAvailable 
  } = useAIWithFallback({
    showToasts: true,
    fallbackData: null
  });

  const handleOptimize = async () => {
    const { success, data } = await invokeAI({
      prompt: buildWorkflowOptimizerPrompt(workflowData),
      system_prompt: WORKFLOW_OPTIMIZER_SYSTEM_PROMPT,
      response_json_schema: WORKFLOW_OPTIMIZER_SCHEMA
    });
    
    if (success && data) {
      setOptimization(data);
    }
  };

  return (
    <Card className="border-2 border-green-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-green-600" />
            {t({ en: 'AI Workflow Optimizer', ar: 'محسن سير العمل الذكي' })}
          </CardTitle>
          <AIOptionalBadge />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI Status Indicator */}
        <AIStatusIndicator 
          status={status} 
          error={error} 
          rateLimitInfo={rateLimitInfo}
          showDetails={true}
        />
        
        {/* Main action button - always available */}
        <Button 
          onClick={handleOptimize} 
          disabled={isLoading || !isAvailable} 
          className="w-full bg-green-600"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          {t({ en: 'Analyze & Optimize Workflow', ar: 'تحليل وتحسين سير العمل' })}
        </Button>

        {/* Fallback message when AI unavailable */}
        {status === AI_STATUS.RATE_LIMITED && (
          <div className="p-3 bg-muted rounded-lg border">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
              <p className="text-sm text-muted-foreground">
                {t({ 
                  en: 'You can still review your workflow manually or try again later when AI is available.', 
                  ar: 'لا يزال بإمكانك مراجعة سير العمل يدويًا أو المحاولة مرة أخرى لاحقًا عندما يتوفر AI.' 
                })}
              </p>
            </div>
          </div>
        )}

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
