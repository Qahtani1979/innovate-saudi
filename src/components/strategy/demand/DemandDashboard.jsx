import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/components/LanguageContext';
import { useGapAnalysis } from '@/hooks/strategy/useGapAnalysis';
import { useDemandQueue } from '@/hooks/strategy/useDemandQueue';
import { useQueueNotifications } from '@/hooks/strategy/useQueueNotifications';
import { useActivePlan } from '@/contexts/StrategicPlanContext';
import CoverageHeatmap from './CoverageHeatmap';
import QueueByTypeChart from './QueueByTypeChart';
import BatchGenerationControls from './BatchGenerationControls';
import QueueReviewPanel from './QueueReviewPanel';
import RejectionFeedbackAnalysis from './RejectionFeedbackAnalysis';
import AutomationControls from './AutomationControls';
import { 
  BarChart3, 
  Target, 
  Loader2, 
  RefreshCw, 
  ListOrdered,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Zap,
  Eye,
  Bell,
  Settings2
} from 'lucide-react';

export default function DemandDashboard() {
  const { t, isRTL } = useLanguage();
  const { activePlanId, activePlan } = useActivePlan();
  const { 
    analysis, 
    runAnalysis, 
    generateQueue, 
    isAnalyzing, 
    isGeneratingQueue,
    hasAnalysis 
  } = useGapAnalysis(activePlanId);
  const { queueItems, stats, byType, clearPendingItems, refetch } = useDemandQueue(activePlanId);
  const { reviewCount } = useQueueNotifications(activePlanId);
  const [activeTab, setActiveTab] = useState('analysis');

  if (!activePlanId) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          {t({ en: 'Please select a strategic plan first', ar: 'الرجاء اختيار خطة استراتيجية أولاً' })}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            {t({ en: 'Demand-Driven Generation', ar: 'التوليد القائم على الطلب' })}
          </h2>
          <p className="text-muted-foreground">
            {t({ 
              en: 'AI-powered gap analysis and automated entity generation',
              ar: 'تحليل الفجوات بالذكاء الاصطناعي والتوليد الآلي للكيانات'
            })}
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {activePlan?.name_en || 'Active Plan'}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="analysis" className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            {t({ en: 'Analysis', ar: 'التحليل' })}
          </TabsTrigger>
          <TabsTrigger value="queue" className="flex items-center gap-1">
            <ListOrdered className="h-4 w-4" />
            {t({ en: 'Queue', ar: 'القائمة' })}
            {stats.pending > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 p-0 justify-center text-xs">{stats.pending}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="review" className="flex items-center gap-1">
            <Bell className="h-4 w-4" />
            {t({ en: 'Review', ar: 'مراجعة' })}
            {reviewCount > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 min-w-5 p-0 justify-center text-xs">{reviewCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="batch" className="flex items-center gap-1">
            <Zap className="h-4 w-4" />
            {t({ en: 'Batch', ar: 'دفعة' })}
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-1">
            <Settings2 className="h-4 w-4" />
            {t({ en: 'Auto', ar: 'آلي' })}
          </TabsTrigger>
        </TabsList>

        {/* Coverage Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {t({ en: 'Gap Analysis', ar: 'تحليل الفجوات' })}
                </CardTitle>
                <Button 
                  onClick={() => runAnalysis.mutate('comprehensive')} 
                  disabled={isAnalyzing}
                  size="sm"
                >
                  {isAnalyzing ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> {t({ en: 'Analyzing...', ar: 'جاري التحليل...' })}</>
                  ) : (
                    <><RefreshCw className="h-4 w-4 mr-2" /> {t({ en: 'Run Analysis', ar: 'تشغيل التحليل' })}</>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!hasAnalysis ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t({ en: 'Run gap analysis to see coverage data', ar: 'قم بتشغيل تحليل الفجوات لرؤية بيانات التغطية' })}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Overall Coverage */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {t({ en: 'Overall Coverage', ar: 'التغطية الإجمالية' })}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {analysis?.overall_coverage_pct || 0}%
                        </span>
                      </div>
                      <Progress value={analysis?.overall_coverage_pct || 0} className="h-3" />
                    </div>
                  </div>

                  {/* Entity Coverage Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(analysis?.entity_coverage || {}).map(([type, data]) => (
                      <Card key={type} className="p-4">
                        <div className="text-sm font-medium capitalize mb-2">{type}</div>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold">{data.current}</span>
                          <span className="text-muted-foreground">/ {data.target}</span>
                        </div>
                        <Progress value={data.coverage_pct} className="h-2 mt-2" />
                        <Badge 
                          variant={data.coverage_pct >= 100 ? 'default' : data.coverage_pct >= 60 ? 'secondary' : 'destructive'}
                          className="mt-2 text-xs"
                        >
                          {data.coverage_pct}%
                        </Badge>
                      </Card>
                    ))}
                  </div>

                  {/* Total Needed */}
                  {analysis?.total_generation_needed?.total > 0 && (
                    <Card className="bg-amber-50 border-amber-200">
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                            <span className="font-medium text-amber-800">
                              {analysis.total_generation_needed.total} {t({ en: 'items needed to reach targets', ar: 'عنصر مطلوب للوصول للأهداف' })}
                            </span>
                          </div>
                          <Button 
                            onClick={() => generateQueue.mutate(20)}
                            disabled={isGeneratingQueue}
                            size="sm"
                          >
                            {isGeneratingQueue ? (
                              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> {t({ en: 'Generating...', ar: 'جاري التوليد...' })}</>
                            ) : (
                              <><Sparkles className="h-4 w-4 mr-2" /> {t({ en: 'Generate Queue', ar: 'توليد القائمة' })}</>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Coverage Heatmap */}
          {hasAnalysis && (
            <CoverageHeatmap 
              analysis={analysis} 
              objectives={activePlan?.objectives || []} 
            />
          )}
        </TabsContent>

        {/* Queue Tab */}
        <TabsContent value="queue" className="space-y-4">
          {/* Queue Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">{t({ en: 'Total', ar: 'الإجمالي' })}</div>
              <div className="text-2xl font-bold">{stats.total}</div>
            </Card>
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="text-sm text-blue-600">{t({ en: 'Pending', ar: 'قيد الانتظار' })}</div>
              <div className="text-2xl font-bold text-blue-700">{stats.pending}</div>
            </Card>
            <Card className="p-4 bg-amber-50 border-amber-200">
              <div className="text-sm text-amber-600">{t({ en: 'In Progress', ar: 'قيد التنفيذ' })}</div>
              <div className="text-2xl font-bold text-amber-700">{stats.inProgress}</div>
            </Card>
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="text-sm text-green-600">{t({ en: 'Completed', ar: 'مكتمل' })}</div>
              <div className="text-2xl font-bold text-green-700">{stats.completed}</div>
            </Card>
            <Card className="p-4 bg-purple-50 border-purple-200">
              <div className="text-sm text-purple-600">{t({ en: 'Review', ar: 'مراجعة' })}</div>
              <div className="text-2xl font-bold text-purple-700">{stats.review}</div>
            </Card>
          </div>

          {/* Queue Charts */}
          <QueueByTypeChart queueItems={queueItems} byType={byType} />

          {/* Queue Items */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {t({ en: 'Queue Items', ar: 'عناصر القائمة' })}
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  {stats.pending > 0 && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => clearPendingItems.mutate()}
                    >
                      {t({ en: 'Clear Pending', ar: 'مسح المعلقة' })}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {queueItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ListOrdered className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t({ en: 'No items in queue', ar: 'لا توجد عناصر في القائمة' })}</p>
                  <p className="text-sm mt-2">
                    {t({ en: 'Run gap analysis and generate queue to get started', ar: 'قم بتشغيل تحليل الفجوات وتوليد القائمة للبدء' })}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {queueItems.map((item) => (
                    <div 
                      key={item.id} 
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        item.status === 'pending' ? 'bg-muted/30' :
                        item.status === 'in_progress' ? 'bg-amber-50 border-amber-200' :
                        item.status === 'accepted' ? 'bg-green-50 border-green-200' :
                        item.status === 'review' ? 'bg-purple-50 border-purple-200' :
                        'bg-muted/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="capitalize">
                          {item.entity_type}
                        </Badge>
                        <div>
                          <p className="font-medium text-sm">
                            {item.prefilled_spec?.title_en || item.prefilled_spec?.name_en || `${item.entity_type} item`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.prefilled_spec?.ai_context?.objective_text?.substring(0, 50)}...
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {item.priority_score}
                        </Badge>
                        <Badge 
                          variant={
                            item.status === 'pending' ? 'outline' :
                            item.status === 'in_progress' ? 'secondary' :
                            item.status === 'accepted' ? 'default' :
                            'destructive'
                          }
                          className="capitalize"
                        >
                          {item.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                          {item.status === 'accepted' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Review Tab */}
        <TabsContent value="review" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <QueueReviewPanel strategicPlanId={activePlanId} />
            <RejectionFeedbackAnalysis strategicPlanId={activePlanId} />
          </div>
        </TabsContent>

        {/* Batch Generation Tab */}
        <TabsContent value="batch" className="space-y-4">
          <BatchGenerationControls strategicPlanId={activePlanId} />
        </TabsContent>

        {/* Automation Tab */}
        <TabsContent value="automation" className="space-y-4">
          <AutomationControls />
        </TabsContent>
      </Tabs>
    </div>
  );
}
