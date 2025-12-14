import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/components/LanguageContext';
import { useActivePlan } from '@/contexts/StrategicPlanContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Zap, 
  Play,
  Pause,
  Settings2,
  Clock,
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function AutomationControls() {
  const { t, isRTL } = useLanguage();
  const { activePlanId, activePlan } = useActivePlan();
  const { toast } = useToast();

  const [isRunning, setIsRunning] = useState(false);
  const [settings, setSettings] = useState({
    autoGenerateQueue: true,
    queueThreshold: 5,
    notifyOnReview: true,
    autoApproveAbove: 85
  });
  const [lastRun, setLastRun] = useState(null);

  const runScheduledAnalysis = async () => {
    if (!activePlanId) {
      toast({ title: 'Error', description: 'No active plan selected', variant: 'destructive' });
      return;
    }

    setIsRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('strategy-scheduled-analysis', {
        body: {
          strategic_plan_id: activePlanId,
          auto_generate_queue: settings.autoGenerateQueue,
          queue_threshold: settings.queueThreshold,
          notify_on_review: settings.notifyOnReview,
          trigger_source: 'manual'
        }
      });

      if (error) throw error;

      setLastRun({
        timestamp: new Date().toISOString(),
        results: data
      });

      toast({ 
        title: 'Analysis Complete', 
        description: `Analyzed ${data.plans_analyzed} plan(s) - ${data.results?.[0]?.coverage_pct || 0}% coverage`
      });

    } catch (error) {
      console.error('Scheduled analysis error:', error);
      toast({ 
        title: 'Analysis Failed', 
        description: error.message, 
        variant: 'destructive' 
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              {t({ en: 'Automation Controls', ar: 'تحكمات الأتمتة' })}
            </CardTitle>
            <CardDescription>
              {t({ 
                en: 'Configure and trigger automated gap analysis', 
                ar: 'تكوين وتشغيل تحليل الفجوات الآلي' 
              })}
            </CardDescription>
          </div>
          <Badge variant={activePlanId ? 'default' : 'secondary'}>
            {activePlan?.name_en || t({ en: 'No plan selected', ar: 'لم يتم اختيار خطة' })}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Actions */}
        <div className="flex gap-3">
          <Button 
            onClick={runScheduledAnalysis}
            disabled={isRunning || !activePlanId}
            className="flex-1"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {t({ en: 'Running...', ar: 'جاري التشغيل...' })}
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                {t({ en: 'Run Analysis Now', ar: 'تشغيل التحليل الآن' })}
              </>
            )}
          </Button>
        </div>

        {/* Last Run Status */}
        {lastRun && (
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">
                {t({ en: 'Last Run', ar: 'آخر تشغيل' })}
              </span>
            </div>
            <p className="text-sm text-green-700">
              {new Date(lastRun.timestamp).toLocaleString()} - 
              {lastRun.results?.results?.[0]?.coverage_pct}% {t({ en: 'coverage', ar: 'تغطية' })}
              {lastRun.results?.results?.[0]?.items_created > 0 && (
                <span className="ml-2">
                  ({lastRun.results.results[0].items_created} {t({ en: 'items queued', ar: 'عناصر في القائمة' })})
                </span>
              )}
            </p>
          </Card>
        )}

        {/* Settings */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            {t({ en: 'Automation Settings', ar: 'إعدادات الأتمتة' })}
          </h4>

          <div className="space-y-4">
            {/* Auto Generate Queue */}
            <div className="flex items-center justify-between">
              <div>
                <Label>{t({ en: 'Auto-generate queue', ar: 'توليد القائمة تلقائيًا' })}</Label>
                <p className="text-xs text-muted-foreground">
                  {t({ en: 'Automatically create queue items when gaps are found', ar: 'إنشاء عناصر القائمة تلقائيًا عند العثور على فجوات' })}
                </p>
              </div>
              <Switch 
                checked={settings.autoGenerateQueue}
                onCheckedChange={(checked) => setSettings(s => ({ ...s, autoGenerateQueue: checked }))}
              />
            </div>

            {/* Queue Threshold */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>{t({ en: 'Queue threshold', ar: 'عتبة القائمة' })}</Label>
                <Badge variant="outline">{settings.queueThreshold} {t({ en: 'items', ar: 'عناصر' })}</Badge>
              </div>
              <Slider
                value={[settings.queueThreshold]}
                onValueChange={([value]) => setSettings(s => ({ ...s, queueThreshold: value }))}
                min={1}
                max={20}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t({ en: 'Minimum gaps before auto-generating queue', ar: 'الحد الأدنى للفجوات قبل التوليد التلقائي للقائمة' })}
              </p>
            </div>

            {/* Notify on Review */}
            <div className="flex items-center justify-between">
              <div>
                <Label>{t({ en: 'Notify on review items', ar: 'إشعار عند وجود عناصر للمراجعة' })}</Label>
                <p className="text-xs text-muted-foreground">
                  {t({ en: 'Send notifications when items need manual review', ar: 'إرسال إشعارات عندما تحتاج العناصر لمراجعة يدوية' })}
                </p>
              </div>
              <Switch 
                checked={settings.notifyOnReview}
                onCheckedChange={(checked) => setSettings(s => ({ ...s, notifyOnReview: checked }))}
              />
            </div>

            {/* Auto Approve Threshold */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>{t({ en: 'Auto-approve threshold', ar: 'عتبة الموافقة التلقائية' })}</Label>
                <Badge variant="outline">{settings.autoApproveAbove}%</Badge>
              </div>
              <Slider
                value={[settings.autoApproveAbove]}
                onValueChange={([value]) => setSettings(s => ({ ...s, autoApproveAbove: value }))}
                min={50}
                max={100}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t({ en: 'Items above this quality score are auto-approved', ar: 'العناصر التي تتجاوز هذه النتيجة تُوافق تلقائيًا' })}
              </p>
            </div>
          </div>
        </div>

        {/* Schedule Info */}
        <Card className="p-4 bg-muted/50">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">
              {t({ en: 'Scheduled Automation', ar: 'الأتمتة المجدولة' })}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {t({ 
              en: 'For automatic scheduled runs, configure a cron job to call the strategy-scheduled-analysis function.',
              ar: 'للتشغيل المجدول التلقائي، قم بتكوين مهمة cron لاستدعاء وظيفة strategy-scheduled-analysis.'
            })}
          </p>
        </Card>
      </CardContent>
    </Card>
  );
}
