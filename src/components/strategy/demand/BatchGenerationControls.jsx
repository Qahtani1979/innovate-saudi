import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLanguage } from '@/components/LanguageContext';
import { useDemandQueue } from '@/hooks/strategy/useDemandQueue';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Zap, 
  Play, 
  Pause, 
  Square, 
  Settings2, 
  Loader2,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Clock
} from 'lucide-react';

const ENTITY_TYPES = [
  { value: 'all', label: { en: 'All Types', ar: 'جميع الأنواع' } },
  { value: 'challenge', label: { en: 'Challenges', ar: 'التحديات' } },
  { value: 'pilot', label: { en: 'Pilots', ar: 'التجارب' } },
  { value: 'program', label: { en: 'Programs', ar: 'البرامج' } },
  { value: 'campaign', label: { en: 'Campaigns', ar: 'الحملات' } },
  { value: 'event', label: { en: 'Events', ar: 'الفعاليات' } },
  { value: 'policy', label: { en: 'Policies', ar: 'السياسات' } },
  { value: 'partnership', label: { en: 'Partnerships', ar: 'الشراكات' } },
  { value: 'rd_call', label: { en: 'R&D Calls', ar: 'دعوات البحث' } },
  { value: 'living_lab', label: { en: 'Living Labs', ar: 'المختبرات الحية' } },
];

export default function BatchGenerationControls({ strategicPlanId }) {
  const { t, isRTL } = useLanguage();
  const { queueItems, stats, refetch } = useDemandQueue(strategicPlanId);
  
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const [batchSize, setBatchSize] = useState(5);
  const [autoApprove, setAutoApprove] = useState(false);
  const [minQualityScore, setMinQualityScore] = useState(70);
  
  // Progress tracking
  const [progress, setProgress] = useState({
    total: 0,
    completed: 0,
    failed: 0,
    current: null
  });

  const getFilteredQueue = () => {
    if (selectedType === 'all') {
      return queueItems.filter(item => item.status === 'pending');
    }
    return queueItems.filter(
      item => item.entity_type === selectedType && item.status === 'pending'
    );
  };

  const handleStartBatch = async () => {
    const queue = getFilteredQueue().slice(0, batchSize);
    if (queue.length === 0) {
      toast.error(t({ en: 'No items in queue to process', ar: 'لا توجد عناصر في القائمة للمعالجة' }));
      return;
    }

    setIsRunning(true);
    setIsPaused(false);
    setProgress({
      total: queue.length,
      completed: 0,
      failed: 0,
      current: null
    });

    for (let i = 0; i < queue.length; i++) {
      if (!isRunning || isPaused) break;
      
      const item = queue[i];
      setProgress(prev => ({ ...prev, current: item }));

      try {
        // Update item status to in_progress
        await supabase
          .from('demand_queue')
          .update({ status: 'in_progress', last_attempt_at: new Date().toISOString() })
          .eq('id', item.id);

        // Call the appropriate generator edge function
        const generatorFn = getGeneratorFunction(item.entity_type);
        const { data, error } = await supabase.functions.invoke(generatorFn, {
          body: {
            strategic_plan_id: strategicPlanId,
            queue_item_id: item.id,
            prefilled_spec: item.prefilled_spec,
            auto_mode: true
          }
        });

        if (error) throw error;

        // Get quality assessment
        const { data: assessment } = await supabase.functions.invoke('strategy-quality-assessor', {
          body: {
            entity_type: item.entity_type,
            entity_data: data,
            queue_item: item,
            mode: 'quick'
          }
        });

        const qualityScore = assessment?.overall_score || 75;
        const status = autoApprove && qualityScore >= minQualityScore ? 'accepted' : 'review';

        // Update queue item with result
        await supabase
          .from('demand_queue')
          .update({
            status,
            generated_entity_id: data?.id,
            generated_entity_type: item.entity_type,
            quality_score: qualityScore,
            quality_feedback: assessment,
            attempts: item.attempts + 1
          })
          .eq('id', item.id);

        setProgress(prev => ({ ...prev, completed: prev.completed + 1 }));
        
      } catch (error) {
        console.error(`Batch generation error for ${item.id}:`, error);
        
        await supabase
          .from('demand_queue')
          .update({
            status: 'pending',
            attempts: item.attempts + 1,
            quality_feedback: { error: error.message, failed_at: new Date().toISOString() }
          })
          .eq('id', item.id);

        setProgress(prev => ({ ...prev, failed: prev.failed + 1 }));
      }

      // Small delay between items
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setIsRunning(false);
    setProgress(prev => ({ ...prev, current: null }));
    refetch();
    
    toast.success(t({ 
      en: `Batch complete: ${progress.completed} succeeded, ${progress.failed} failed`,
      ar: `اكتملت الدفعة: ${progress.completed} نجحت، ${progress.failed} فشلت`
    }));
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
  };

  const getGeneratorFunction = (entityType) => {
    const map = {
      challenge: 'strategy-challenge-generator',
      pilot: 'strategy-pilot-generator',
      program: 'strategy-program-generator',
      campaign: 'strategy-campaign-generator',
      event: 'strategy-event-planner',
      policy: 'strategy-policy-generator',
      partnership: 'strategy-partnership-matcher',
      rd_call: 'strategy-rd-call-generator',
      living_lab: 'strategy-lab-research-generator'
    };
    return map[entityType] || 'strategy-challenge-generator';
  };

  const pendingByType = ENTITY_TYPES.slice(1).map(type => ({
    ...type,
    count: queueItems.filter(i => i.entity_type === type.value && i.status === 'pending').length
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">
              {t({ en: 'Batch Generation', ar: 'التوليد الدفعي' })}
            </CardTitle>
          </div>
          {isRunning && (
            <Badge variant={isPaused ? 'secondary' : 'default'} className="animate-pulse">
              {isPaused 
                ? t({ en: 'Paused', ar: 'متوقف مؤقتاً' })
                : t({ en: 'Running', ar: 'قيد التشغيل' })
              }
            </Badge>
          )}
        </div>
        <CardDescription>
          {t({ 
            en: 'Automatically generate multiple entities from the queue',
            ar: 'توليد كيانات متعددة تلقائياً من القائمة'
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configuration */}
        {!isRunning && (
          <div className="space-y-4">
            {/* Entity Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t({ en: 'Entity Type', ar: 'نوع الكيان' })}
              </label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENTITY_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {t(type.label)}
                      {type.value !== 'all' && (
                        <span className="ml-2 text-muted-foreground">
                          ({pendingByType.find(p => p.value === type.value)?.count || 0})
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Batch Size */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  {t({ en: 'Batch Size', ar: 'حجم الدفعة' })}
                </label>
                <span className="text-sm text-muted-foreground">{batchSize}</span>
              </div>
              <Slider
                value={[batchSize]}
                onValueChange={([value]) => setBatchSize(value)}
                min={1}
                max={20}
                step={1}
              />
            </div>

            {/* Auto Approve */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">
                  {t({ en: 'Auto-Approve High Quality', ar: 'الموافقة التلقائية على الجودة العالية' })}
                </label>
                <p className="text-xs text-muted-foreground">
                  {t({ 
                    en: `Auto-approve items with quality score ≥ ${minQualityScore}`,
                    ar: `الموافقة التلقائية على العناصر ذات درجة الجودة ≥ ${minQualityScore}`
                  })}
                </p>
              </div>
              <Switch checked={autoApprove} onCheckedChange={setAutoApprove} />
            </div>

            {autoApprove && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    {t({ en: 'Minimum Quality Score', ar: 'الحد الأدنى لدرجة الجودة' })}
                  </label>
                  <span className="text-sm text-muted-foreground">{minQualityScore}%</span>
                </div>
                <Slider
                  value={[minQualityScore]}
                  onValueChange={([value]) => setMinQualityScore(value)}
                  min={50}
                  max={95}
                  step={5}
                />
              </div>
            )}

            {/* Queue Summary */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{getFilteredQueue().length}</div>
                <div className="text-xs text-muted-foreground">{t({ en: 'To Process', ar: 'للمعالجة' })}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                <div className="text-xs text-muted-foreground">{t({ en: 'Completed', ar: 'مكتمل' })}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.review}</div>
                <div className="text-xs text-muted-foreground">{t({ en: 'In Review', ar: 'قيد المراجعة' })}</div>
              </div>
            </div>

            {/* Start Button */}
            <Button 
              className="w-full" 
              onClick={handleStartBatch}
              disabled={getFilteredQueue().length === 0}
            >
              <Play className="h-4 w-4 mr-2" />
              {t({ en: 'Start Batch Generation', ar: 'بدء التوليد الدفعي' })}
            </Button>
          </div>
        )}

        {/* Running State */}
        {isRunning && (
          <div className="space-y-4">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{t({ en: 'Progress', ar: 'التقدم' })}</span>
                <span>
                  {progress.completed + progress.failed} / {progress.total}
                </span>
              </div>
              <Progress 
                value={((progress.completed + progress.failed) / progress.total) * 100} 
                className="h-3"
              />
            </div>

            {/* Current Item */}
            {progress.current && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertTitle>{t({ en: 'Processing', ar: 'قيد المعالجة' })}</AlertTitle>
                <AlertDescription>
                  {progress.current.prefilled_spec?.title_en || `${progress.current.entity_type} item`}
                </AlertDescription>
              </Alert>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">{progress.completed}</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-700">{progress.failed}</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  {progress.total - progress.completed - progress.failed}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-2">
              {!isPaused ? (
                <Button variant="outline" onClick={handlePause} className="flex-1">
                  <Pause className="h-4 w-4 mr-2" />
                  {t({ en: 'Pause', ar: 'إيقاف مؤقت' })}
                </Button>
              ) : (
                <Button variant="outline" onClick={handleResume} className="flex-1">
                  <Play className="h-4 w-4 mr-2" />
                  {t({ en: 'Resume', ar: 'استئناف' })}
                </Button>
              )}
              <Button variant="destructive" onClick={handleStop} className="flex-1">
                <Square className="h-4 w-4 mr-2" />
                {t({ en: 'Stop', ar: 'إيقاف' })}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
