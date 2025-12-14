import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import { 
  Target, 
  Plus, 
  Save, 
  Sparkles, 
  Loader2, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp,
  FileSearch,
  Layers,
  BarChart3,
  Lightbulb,
  X
} from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { useStrategyContext, buildStrategyContextPrompt, checkObjectiveSimilarity } from '@/hooks/strategy/useStrategyContext';
import { toast } from 'sonner';

function StrategicPlanBuilder() {
  const { language, t } = useLanguage();
  const queryClient = useQueryClient();
  const [plan, setPlan] = useState({
    title_en: '',
    title_ar: '',
    vision_en: '',
    vision_ar: '',
    objectives: []
  });
  const [activeTab, setActiveTab] = useState('context');
  const [duplicateWarnings, setDuplicateWarnings] = useState([]);
  
  const { invokeAI, status, isLoading: generating, isAvailable, rateLimitInfo } = useAIWithFallback();
  
  // Fetch strategic context for informed plan creation
  const strategyContext = useStrategyContext();
  const { 
    existingPlans, 
    existingObjectives,
    gaps, 
    unresolvedChallenges, 
    uncoveredSectors,
    pestleSummary,
    swotSummary,
    stats,
    isLoading: contextLoading 
  } = strategyContext;

  // Check for duplicate title
  const duplicateTitleWarning = useMemo(() => {
    if (!plan.title_en) return null;
    const duplicate = existingPlans.find(p => 
      p.name_en?.toLowerCase() === plan.title_en.toLowerCase()
    );
    return duplicate ? `A plan with this title already exists: "${duplicate.name_en}"` : null;
  }, [plan.title_en, existingPlans]);

  // Check for similar vision
  const similarVisionWarning = useMemo(() => {
    if (!plan.vision_en || plan.vision_en.length < 20) return null;
    const planVision = plan.vision_en.toLowerCase();
    const similar = existingPlans.find(p => {
      if (!p.vision_en) return false;
      const existingVision = p.vision_en.toLowerCase();
      // Simple word overlap check
      const planWords = new Set(planVision.split(/\s+/).filter(w => w.length > 3));
      const existingWords = new Set(existingVision.split(/\s+/).filter(w => w.length > 3));
      const overlap = [...planWords].filter(w => existingWords.has(w)).length;
      return overlap > 5 && overlap / planWords.size > 0.5;
    });
    return similar ? `Similar vision exists in plan: "${similar.name_en}"` : null;
  }, [plan.vision_en, existingPlans]);

  const savePlan = useMutation({
    mutationFn: (data) => base44.entities.StrategicPlan.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['strategic-plans']);
      queryClient.invalidateQueries(['strategy-context-plans']);
      setPlan({ title_en: '', title_ar: '', vision_en: '', vision_ar: '', objectives: [] });
      setDuplicateWarnings([]);
      toast.success(t({ en: 'Strategic plan saved successfully', ar: 'تم حفظ الخطة الاستراتيجية بنجاح' }));
    },
    onError: (error) => {
      toast.error(t({ en: 'Failed to save plan', ar: 'فشل في حفظ الخطة' }));
      console.error('Save error:', error);
    }
  });

  const generateWithAI = async () => {
    // Build context-aware prompt
    const contextPrompt = buildStrategyContextPrompt(strategyContext);
    
    const result = await invokeAI({
      system_prompt: `You are a strategic planning expert for municipal innovation. You analyze existing strategic landscape and create NEW plans that fill identified gaps while avoiding duplication.`,
      prompt: `${contextPrompt}

Based on the strategic context above, generate a NEW strategic plan that:
1. Addresses identified gaps
2. Avoids duplicating existing plans
3. Focuses on uncovered sectors and unresolved challenges
4. Builds on SWOT strengths and opportunities

Format as JSON with:
- title_en: Unique, descriptive title
- vision_en: Compelling vision statement
- objectives: Array of 3-5 objectives, each with name_en and description_en`,
      response_json_schema: {
        type: "object",
        properties: {
          title_en: { type: "string" },
          vision_en: { type: "string" },
          objectives: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name_en: { type: "string" },
                description_en: { type: "string" }
              }
            }
          }
        }
      }
    });
    
    if (result.success && result.data?.response) {
      const generatedPlan = result.data.response;
      
      // Check generated objectives for duplicates
      const warnings = [];
      generatedPlan.objectives?.forEach((obj, index) => {
        const duplicates = checkObjectiveSimilarity(obj, existingObjectives);
        if (duplicates.length > 0) {
          warnings.push({
            index,
            objective: obj.name_en,
            duplicates: duplicates.slice(0, 2)
          });
        }
      });
      
      setDuplicateWarnings(warnings);
      setPlan({ ...plan, ...generatedPlan });
      
      if (warnings.length > 0) {
        toast.warning(t({ 
          en: `${warnings.length} objectives may be similar to existing ones. Review below.`,
          ar: `${warnings.length} أهداف قد تكون مشابهة للأهداف الحالية. راجع أدناه.`
        }));
      } else {
        toast.success(t({ en: 'Strategic plan generated', ar: 'تم إنشاء الخطة الاستراتيجية' }));
      }
    }
  };

  const removeObjective = (index) => {
    setPlan({ 
      ...plan, 
      objectives: plan.objectives.filter((_, i) => i !== index) 
    });
    setDuplicateWarnings(duplicateWarnings.filter(w => w.index !== index));
  };

  const handleSave = () => {
    if (duplicateTitleWarning) {
      toast.error(t({ en: 'Please use a unique plan title', ar: 'يرجى استخدام عنوان خطة فريد' }));
      return;
    }
    savePlan.mutate(plan);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Target className="h-8 w-8 text-primary" />
            {t({ en: 'Strategic Plan Builder', ar: 'بناء الخطة الاستراتيجية' })}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t({ en: 'Create context-aware strategic plans that fill identified gaps', ar: 'إنشاء خطط استراتيجية مدركة للسياق تسد الفجوات المحددة' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
          <Button onClick={generateWithAI} disabled={generating || !isAvailable || contextLoading}>
            {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {t({ en: 'Generate with AI', ar: 'إنشاء بالذكاء الاصطناعي' })}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="context" className="flex items-center gap-2">
            <FileSearch className="h-4 w-4" />
            {t({ en: 'Context', ar: 'السياق' })}
          </TabsTrigger>
          <TabsTrigger value="gaps" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {t({ en: 'Gaps', ar: 'الفجوات' })}
            {gaps.length > 0 && <Badge variant="destructive" className="ml-1">{gaps.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            {t({ en: 'Create', ar: 'إنشاء' })}
          </TabsTrigger>
        </TabsList>

        {/* Context Tab - Shows existing strategic landscape */}
        <TabsContent value="context" className="space-y-4">
          {contextLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Target className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.totalPlans}</p>
                        <p className="text-sm text-muted-foreground">{t({ en: 'Strategic Plans', ar: 'الخطط الاستراتيجية' })}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500/10 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.unresolvedChallenges}</p>
                        <p className="text-sm text-muted-foreground">{t({ en: 'Unlinked Challenges', ar: 'التحديات غير المرتبطة' })}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.coveredSectorCount}</p>
                        <p className="text-sm text-muted-foreground">{t({ en: 'Covered Sectors', ar: 'القطاعات المغطاة' })}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-500/10 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.uncoveredSectorCount}</p>
                        <p className="text-sm text-muted-foreground">{t({ en: 'Uncovered Sectors', ar: 'القطاعات غير المغطاة' })}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Existing Plans */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {t({ en: 'Existing Strategic Plans', ar: 'الخطط الاستراتيجية الحالية' })}
                  </CardTitle>
                  <CardDescription>
                    {t({ en: 'Review existing plans to avoid duplication', ar: 'راجع الخطط الحالية لتجنب التكرار' })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-3">
                      {existingPlans.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">
                          {t({ en: 'No existing plans found', ar: 'لم يتم العثور على خطط حالية' })}
                        </p>
                      ) : (
                        existingPlans.map((p) => (
                          <div key={p.id} className="p-3 border rounded-lg">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium">{language === 'ar' ? p.name_ar : p.name_en}</h4>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {language === 'ar' ? p.vision_ar : p.vision_en}
                                </p>
                              </div>
                              <Badge variant={p.status === 'active' ? 'default' : 'secondary'}>
                                {p.status || 'draft'}
                              </Badge>
                            </div>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {(p.objectives || []).length} {t({ en: 'objectives', ar: 'أهداف' })}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {(p.pillars || []).length} {t({ en: 'pillars', ar: 'ركائز' })}
                              </Badge>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* PESTLE & SWOT Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      {t({ en: 'PESTLE Summary', ar: 'ملخص PESTLE' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-green-600">{t({ en: 'Opportunities', ar: 'الفرص' })}</span>
                        <Badge variant="secondary">{pestleSummary.opportunities.length}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-red-600">{t({ en: 'Threats', ar: 'التهديدات' })}</span>
                        <Badge variant="secondary">{pestleSummary.threats.length}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-amber-600">{t({ en: 'High Impact', ar: 'تأثير عالي' })}</span>
                        <Badge variant="secondary">{pestleSummary.highImpact.length}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      {t({ en: 'SWOT Summary', ar: 'ملخص SWOT' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-green-600">{t({ en: 'Strengths', ar: 'نقاط القوة' })}</span>
                        <Badge variant="secondary">{swotSummary.strengths.length}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-red-600">{t({ en: 'Weaknesses', ar: 'نقاط الضعف' })}</span>
                        <Badge variant="secondary">{swotSummary.weaknesses.length}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-600">{t({ en: 'Opportunities', ar: 'الفرص' })}</span>
                        <Badge variant="secondary">{swotSummary.opportunities.length}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-amber-600">{t({ en: 'Threats', ar: 'التهديدات' })}</span>
                        <Badge variant="secondary">{swotSummary.threats.length}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Gaps Tab - Shows identified gaps */}
        <TabsContent value="gaps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                {t({ en: 'Identified Strategic Gaps', ar: 'الفجوات الاستراتيجية المحددة' })}
              </CardTitle>
              <CardDescription>
                {t({ en: 'These gaps should be addressed in new strategic plans', ar: 'يجب معالجة هذه الفجوات في الخطط الاستراتيجية الجديدة' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {gaps.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-3" />
                  <p className="text-muted-foreground">
                    {t({ en: 'No critical gaps identified', ar: 'لم يتم تحديد فجوات حرجة' })}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {gaps.map((gap, index) => (
                    <Alert key={index} variant={gap.severity === 'high' ? 'destructive' : 'default'}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{gap.title}</p>
                            <p className="text-sm mt-1">{gap.description}</p>
                            <p className="text-sm text-muted-foreground mt-2">
                              <strong>{t({ en: 'Recommendation:', ar: 'التوصية:' })}</strong> {gap.recommendation}
                            </p>
                          </div>
                          <Badge variant={gap.severity === 'high' ? 'destructive' : 'secondary'}>
                            {gap.severity}
                          </Badge>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Uncovered Sectors */}
          {uncoveredSectors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t({ en: 'Uncovered Sectors', ar: 'القطاعات غير المغطاة' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {uncoveredSectors.map((sector) => (
                    <Badge key={sector.id} variant="outline" className="text-sm">
                      {language === 'ar' ? sector.name_ar : sector.name_en}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Unresolved Challenges */}
          {unresolvedChallenges.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t({ en: 'Unlinked Challenges', ar: 'التحديات غير المرتبطة' })}</CardTitle>
                <CardDescription>
                  {t({ en: 'These challenges are not linked to any strategic plan', ar: 'هذه التحديات غير مرتبطة بأي خطة استراتيجية' })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {unresolvedChallenges.slice(0, 10).map((challenge) => (
                      <div key={challenge.id} className="p-2 border rounded-lg flex items-center justify-between">
                        <span className="text-sm">{challenge.title_en}</span>
                        <Badge variant="outline">{challenge.priority || 'Not set'}</Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Create Tab - Plan creation form */}
        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Plan Details', ar: 'تفاصيل الخطة' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title with duplicate check */}
              <div>
                <label className="text-sm font-medium">{t({ en: 'Title (English)', ar: 'العنوان (إنجليزي)' })}</label>
                <Input
                  value={plan.title_en}
                  onChange={(e) => setPlan({ ...plan, title_en: e.target.value })}
                  placeholder={t({ en: 'Enter title...', ar: 'أدخل العنوان...' })}
                  className={duplicateTitleWarning ? 'border-red-500' : ''}
                />
                {duplicateTitleWarning && (
                  <p className="text-sm text-red-500 mt-1">{duplicateTitleWarning}</p>
                )}
              </div>

              {/* Vision with similarity check */}
              <div>
                <label className="text-sm font-medium">{t({ en: 'Vision', ar: 'الرؤية' })}</label>
                <Textarea
                  value={plan.vision_en}
                  onChange={(e) => setPlan({ ...plan, vision_en: e.target.value })}
                  placeholder={t({ en: 'Enter vision statement...', ar: 'أدخل بيان الرؤية...' })}
                  rows={4}
                  className={similarVisionWarning ? 'border-amber-500' : ''}
                />
                {similarVisionWarning && (
                  <p className="text-sm text-amber-500 mt-1">{similarVisionWarning}</p>
                )}
              </div>
              
              {/* Objectives */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">{t({ en: 'Strategic Objectives', ar: 'الأهداف الاستراتيجية' })}</label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPlan({ ...plan, objectives: [...plan.objectives, { name_en: '', description_en: '' }] })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t({ en: 'Add', ar: 'إضافة' })}
                  </Button>
                </div>
                <div className="space-y-3">
                  {plan.objectives.map((obj, i) => {
                    const warning = duplicateWarnings.find(w => w.index === i);
                    return (
                      <div key={i} className={`p-3 border rounded-lg space-y-2 ${warning ? 'border-amber-500 bg-amber-50' : ''}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <Input
                              placeholder={t({ en: 'Objective name', ar: 'اسم الهدف' })}
                              value={obj.name_en}
                              onChange={(e) => {
                                const newObjs = [...plan.objectives];
                                newObjs[i].name_en = e.target.value;
                                setPlan({ ...plan, objectives: newObjs });
                              }}
                            />
                            <Textarea
                              placeholder={t({ en: 'Description', ar: 'الوصف' })}
                              value={obj.description_en}
                              onChange={(e) => {
                                const newObjs = [...plan.objectives];
                                newObjs[i].description_en = e.target.value;
                                setPlan({ ...plan, objectives: newObjs });
                              }}
                              rows={2}
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="ml-2 text-destructive"
                            onClick={() => removeObjective(i)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        {warning && (
                          <Alert variant="default" className="bg-amber-100 border-amber-300">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            <AlertDescription className="text-amber-800 text-sm">
                              <strong>{t({ en: 'Potential duplicate:', ar: 'تكرار محتمل:' })}</strong>
                              {warning.duplicates.map((d, di) => (
                                <div key={di} className="mt-1">
                                  "{d.existing.name_en}" ({d.similarity}% {t({ en: 'similar', ar: 'متشابه' })}) - {d.existing.planName}
                                </div>
                              ))}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <Button 
                onClick={handleSave} 
                className="w-full" 
                disabled={!plan.title_en || duplicateTitleWarning || savePlan.isPending}
              >
                {savePlan.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                {t({ en: 'Save Strategic Plan', ar: 'حفظ الخطة الاستراتيجية' })}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProtectedPage(StrategicPlanBuilder, { requiredPermissions: ['strategy_manage'] });
