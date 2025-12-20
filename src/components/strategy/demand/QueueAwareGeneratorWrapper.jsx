import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/components/LanguageContext';
import { useQueueAutoPopulation } from '@/hooks/strategy/useQueueAutoPopulation';
import { 
  ListOrdered, 
  Play, 
  SkipForward, 
  X,
  Loader2,
  Sparkles,
  ChevronRight,
  Zap
} from 'lucide-react';

/**
 * QueueAwareGeneratorWrapper - Wraps any generator component to add queue-driven functionality
 * 
 * Features:
 * - Shows queue status for entity type
 * - Auto-populates generator form with queue item data
 * - Provides controls to navigate queue (next, skip, exit)
 * - Tracks completion and quality scores
 */
export default function QueueAwareGeneratorWrapper({ 
  entityType,
  strategicPlanId,
  children,
  onPrefillApplied,
  onQueueComplete
}) {
  const { t, isRTL } = useLanguage();
  const [showQueuePanel, setShowQueuePanel] = useState(true);
  
  const {
    queueItem,
    isAutoMode,
    setIsAutoMode,
    loadNextFromQueue,
    completeQueueItem,
    completeAndLoadNext,
    skipItem,
    rejectItem,
    exitAutoMode,
    prefillData,
    pendingCount,
    isProcessing
  } = useQueueAutoPopulation(entityType, strategicPlanId);

  // Notify parent when prefill data is available
  useEffect(() => {
    if (prefillData && onPrefillApplied) {
      onPrefillApplied(prefillData);
    }
  }, [prefillData, onPrefillApplied]);

  const handleStartQueue = async () => {
    const spec = await loadNextFromQueue();
    if (!spec) {
      // No items in queue
      setIsAutoMode(false);
    }
  };

  const handleSkip = async () => {
    await skipItem('manual_skip');
    const spec = await loadNextFromQueue();
    if (!spec) {
      onQueueComplete?.();
    }
  };

  const handleReject = async () => {
    await rejectItem('Quality not acceptable');
    const spec = await loadNextFromQueue();
    if (!spec) {
      onQueueComplete?.();
    }
  };

  const handleCompleteAndNext = async (entityId, qualityScore) => {
    const spec = await completeAndLoadNext(entityId, qualityScore, entityType);
    if (!spec) {
      onQueueComplete?.();
    }
  };

  // Expose queue controls to parent
  const queueControls = {
    completeItem: completeQueueItem,
    completeAndNext: handleCompleteAndNext,
    skipItem: handleSkip,
    rejectItem: handleReject,
    isAutoMode,
    queueItem,
    prefillData
  };

  // If no pending items, show minimal UI
  if (pendingCount === 0 && !isAutoMode) {
    return (
      <div className="space-y-4">
        {children}
      </div>
    );
  }

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Queue Control Panel */}
      {showQueuePanel && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListOrdered className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">
                  {t({ en: 'Queue-Driven Generation', ar: 'التوليد القائم على القائمة' })}
                </CardTitle>
                <Badge variant="secondary" className="ml-2">
                  {pendingCount} {t({ en: 'pending', ar: 'معلق' })}
                </Badge>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowQueuePanel(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>
              {isAutoMode 
                ? t({ en: 'Processing queue item with AI-prefilled data', ar: 'معالجة عنصر القائمة ببيانات مملوءة بالذكاء الاصطناعي' })
                : t({ en: 'Start queue processing to auto-populate forms', ar: 'ابدأ معالجة القائمة لملء النماذج تلقائياً' })
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isAutoMode ? (
              <div className="flex items-center gap-4">
                <Button 
                  onClick={handleStartQueue} 
                  disabled={isProcessing || pendingCount === 0}
                  className="gap-2"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  {t({ en: 'Start Queue Processing', ar: 'بدء معالجة القائمة' })}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {t({ 
                    en: 'Forms will be auto-populated with AI-generated data',
                    ar: 'سيتم ملء النماذج تلقائياً ببيانات الذكاء الاصطناعي'
                  })}
                </span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Current Item Info */}
                {queueItem && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">
                          {prefillData?.title_en || prefillData?.name_en || `${entityType} item`}
                        </span>
                      </div>
                      <Badge variant="outline">
                        Priority: {queueItem.priority_score}
                      </Badge>
                    </div>
                    {prefillData?.ai_context?.objective_text && (
                      <p className="text-xs text-muted-foreground">
                        {t({ en: 'Objective:', ar: 'الهدف:' })} {prefillData.ai_context.objective_text.substring(0, 100)}...
                      </p>
                    )}
                  </div>
                )}

                {/* Queue Navigation Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleSkip}
                      disabled={isProcessing}
                    >
                      <SkipForward className="h-4 w-4 mr-1" />
                      {t({ en: 'Skip', ar: 'تخطي' })}
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={handleReject}
                      disabled={isProcessing}
                    >
                      <X className="h-4 w-4 mr-1" />
                      {t({ en: 'Reject', ar: 'رفض' })}
                    </Button>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={exitAutoMode}
                  >
                    {t({ en: 'Exit Queue Mode', ar: 'الخروج من وضع القائمة' })}
                  </Button>
                </div>

                {/* Progress Indicator */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Zap className="h-3 w-3" />
                  <span>
                    {t({ en: 'Auto-mode active', ar: 'الوضع التلقائي نشط' })} • 
                    {pendingCount} {t({ en: 'items remaining', ar: 'عنصر متبقي' })}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Collapsed Queue Indicator */}
      {!showQueuePanel && pendingCount > 0 && (
        <Alert 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setShowQueuePanel(true)}
        >
          <ListOrdered className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between w-full">
            <span>
              {pendingCount} {t({ en: 'queue items available', ar: 'عنصر متاح في القائمة' })}
            </span>
            <ChevronRight className="h-4 w-4" />
          </AlertDescription>
        </Alert>
      )}

      {/* Render the wrapped generator with queue controls */}
      {typeof children === 'function' 
        ? children(queueControls)
        : React.cloneElement(children, { queueControls })
      }
    </div>
  );
}
