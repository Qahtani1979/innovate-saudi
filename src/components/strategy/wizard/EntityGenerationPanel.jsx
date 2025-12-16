import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Zap, Loader2, CheckCircle, AlertCircle, RefreshCw, 
  PlayCircle, Pause, List, ChevronDown, ChevronUp 
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useLanguage } from '../../LanguageContext';
import { useEntityGeneration } from '@/hooks/strategy/useEntityGeneration';
import { useDemandQueue } from '@/hooks/strategy/useDemandQueue';

const ENTITY_TYPE_CONFIG = {
  challenge: { label_en: 'Challenges', label_ar: 'التحديات', color: 'bg-red-500' },
  pilot: { label_en: 'Pilots', label_ar: 'التجريبية', color: 'bg-orange-500' },
  program: { label_en: 'Programs', label_ar: 'البرامج', color: 'bg-purple-500' },
  campaign: { label_en: 'Campaigns', label_ar: 'الحملات', color: 'bg-pink-500' },
  event: { label_en: 'Events', label_ar: 'الفعاليات', color: 'bg-blue-500' },
  policy: { label_en: 'Policies', label_ar: 'السياسات', color: 'bg-slate-500' },
  rd_call: { label_en: 'R&D Calls', label_ar: 'الدعوات البحثية', color: 'bg-emerald-500' },
  partnership: { label_en: 'Partnerships', label_ar: 'الشراكات', color: 'bg-cyan-500' },
  living_lab: { label_en: 'Living Labs', label_ar: 'المختبرات الحية', color: 'bg-amber-500' },
};

export default function EntityGenerationPanel({ 
  strategicPlanId, 
  actionPlans = [], 
  objectives = [],
  wizardData = {},
  onEntitiesGenerated
}) {
  const { language, t, isRTL } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([]);

  const {
    queueForGeneration,
    triggerBatchGeneration,
    generationStatus,
    getEntityStatus,
    isQueuing,
    isGenerating
  } = useEntityGeneration(strategicPlanId);

  const { queueItems, stats, refetch } = useDemandQueue(strategicPlanId);

  // Fetch status on mount and after operations
  useEffect(() => {
    if (strategicPlanId) {
      getEntityStatus();
    }
  }, [strategicPlanId, getEntityStatus]);

  const queuedPlans = actionPlans.filter(ap => ap.should_create_entity);
  const hasQueuedPlans = queuedPlans.length > 0;

  // Group by entity type
  const queuedByType = queuedPlans.reduce((acc, ap) => {
    acc[ap.type] = (acc[ap.type] || 0) + 1;
    return acc;
  }, {});

  const handleQueueAll = async () => {
    try {
      await queueForGeneration.mutateAsync({ actionPlans, objectives, wizardData });
      await getEntityStatus();
      refetch();
    } catch (error) {
      console.error('Queue error:', error);
    }
  };

  const handleGenerateSelected = async () => {
    const types = selectedTypes.length > 0 ? selectedTypes : Object.keys(queuedByType);
    try {
      await triggerBatchGeneration.mutateAsync({ entityTypes: types, maxItems: 20 });
      await getEntityStatus();
      refetch();
      onEntitiesGenerated?.();
    } catch (error) {
      console.error('Generation error:', error);
    }
  };

  const toggleTypeSelection = (type) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const totalProgress = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100) 
    : 0;

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-primary/5 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">
                    {t({ en: 'Entity Generation', ar: 'إنشاء الكيانات' })}
                  </CardTitle>
                  <CardDescription>
                    {hasQueuedPlans ? (
                      t({ 
                        en: `${queuedPlans.length} action plans ready for generation`, 
                        ar: `${queuedPlans.length} خطة عمل جاهزة للإنشاء` 
                      })
                    ) : (
                      t({ 
                        en: 'Toggle "Auto-Create Entity" on action plans to queue them', 
                        ar: 'فعّل "إنشاء كيان تلقائياً" على خطط العمل لإضافتها للقائمة' 
                      })
                    )}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {stats.total > 0 && (
                  <Badge variant="outline" className="gap-1">
                    <List className="h-3 w-3" />
                    {stats.pending} {t({ en: 'pending', ar: 'قيد الانتظار' })}
                  </Badge>
                )}
                {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Entity Type Summary */}
            {hasQueuedPlans && (
              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
                {Object.entries(queuedByType).map(([type, count]) => {
                  const config = ENTITY_TYPE_CONFIG[type] || { label_en: type, color: 'bg-gray-500' };
                  const isSelected = selectedTypes.includes(type) || selectedTypes.length === 0;
                  const status = generationStatus[type];
                  
                  return (
                    <button
                      key={type}
                      onClick={() => toggleTypeSelection(type)}
                      className={`p-2 rounded-lg border transition-all ${
                        isSelected 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border bg-muted/30 opacity-60'
                      }`}
                    >
                      <div className={`h-2 w-full rounded ${config.color} mb-2`} />
                      <p className="text-lg font-bold">{count}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {language === 'ar' ? config.label_ar : config.label_en}
                      </p>
                      {status && (
                        <div className="flex items-center justify-center gap-1 mt-1">
                          {status.generated > 0 && (
                            <Badge variant="outline" className="text-xs px-1 bg-green-50 text-green-600">
                              <CheckCircle className="h-2 w-2 mr-0.5" />{status.generated}
                            </Badge>
                          )}
                          {status.failed > 0 && (
                            <Badge variant="outline" className="text-xs px-1 bg-red-50 text-red-600">
                              <AlertCircle className="h-2 w-2 mr-0.5" />{status.failed}
                            </Badge>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Progress Bar */}
            {stats.total > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t({ en: 'Generation Progress', ar: 'تقدم الإنشاء' })}
                  </span>
                  <span className="font-medium">{stats.completed}/{stats.total}</span>
                </div>
                <Progress value={totalProgress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{stats.pending} {t({ en: 'pending', ar: 'قيد الانتظار' })}</span>
                  <span>{stats.inProgress} {t({ en: 'in progress', ar: 'جاري' })}</span>
                  <span>{stats.review} {t({ en: 'review', ar: 'مراجعة' })}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleQueueAll}
                disabled={!hasQueuedPlans || isQueuing || !strategicPlanId}
                variant="outline"
              >
                {isQueuing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <List className="h-4 w-4 mr-2" />
                )}
                {t({ en: 'Add to Queue', ar: 'إضافة للقائمة' })}
              </Button>

              <Button
                onClick={handleGenerateSelected}
                disabled={stats.pending === 0 || isGenerating}
                className="bg-primary"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <PlayCircle className="h-4 w-4 mr-2" />
                )}
                {t({ en: 'Generate Entities', ar: 'إنشاء الكيانات' })}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => { getEntityStatus(); refetch(); }}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            {/* Queue Status Details */}
            {stats.total > 0 && (
              <div className="text-xs text-muted-foreground border-t pt-3">
                <p>
                  {t({ 
                    en: `Queue contains ${stats.total} items across ${Object.keys(generationStatus).length} entity types.`,
                    ar: `تحتوي القائمة على ${stats.total} عنصر عبر ${Object.keys(generationStatus).length} أنواع كيانات.`
                  })}
                </p>
                {stats.rejected > 0 && (
                  <p className="text-amber-600 mt-1">
                    {t({ 
                      en: `${stats.rejected} items were rejected and may need review.`,
                      ar: `${stats.rejected} عنصر تم رفضه وقد يحتاج مراجعة.`
                    })}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
