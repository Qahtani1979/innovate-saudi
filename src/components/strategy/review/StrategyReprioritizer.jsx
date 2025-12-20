import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/components/LanguageContext';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  ArrowUpDown, TrendingUp, Clock, AlertTriangle,
  Users, DollarSign, Save, RotateCcw, Sparkles, Loader2
} from 'lucide-react';
import {
  REPRIORITIZER_SYSTEM_PROMPT,
  buildReprioritizerPrompt,
  REPRIORITIZER_SCHEMA
} from '@/lib/ai/prompts/strategy';

export default function StrategyReprioritizer({ strategicPlanId, strategicPlan, planId, objectives = [], onSave }) {
  const activePlanId = strategicPlanId || planId;
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();
  const { invokeAI, isLoading: aiLoading } = useAIWithFallback();
  const [aiSuggestion, setAiSuggestion] = useState(null);
  
  // Fetch objectives from database
  const { data: dbObjectives, isLoading } = useQuery({
    queryKey: ['strategy-objectives-for-reprioritize', activePlanId],
    queryFn: async () => {
      if (!activePlanId) return [];
      
      const { data, error } = await supabase
        .from('strategic_objectives')
        .select('*')
        .eq('strategic_plan_id', activePlanId)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!activePlanId
  });

  const [items, setItems] = useState([]);
  const [originalItems, setOriginalItems] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync with database data
  useEffect(() => {
    if (dbObjectives && dbObjectives.length > 0) {
      const mapped = dbObjectives.map((obj, index) => ({
        id: obj.id,
        name: language === 'ar' && obj.title_ar ? obj.title_ar : obj.title_en,
        priority: obj.display_order || index + 1,
        strategicImportance: obj.weight || 7,
        resourceAvailability: obj.resource_allocation ? Math.min(10, Math.round(obj.resource_allocation / 10)) : 5,
        quickWinPotential: obj.quick_win_score || 5,
        riskLevel: obj.risk_level || 4,
        stakeholderDemand: obj.stakeholder_priority || 6,
        score: obj.progress_percentage || 70
      }));
      setItems(mapped);
      setOriginalItems(mapped);
    } else if (objectives.length > 0) {
      // Fallback to props
      const mapped = objectives.map((obj, index) => ({
        id: obj.id,
        name: language === 'ar' && obj.title_ar ? obj.title_ar : obj.title_en,
        priority: index + 1,
        strategicImportance: 7,
        resourceAvailability: 5,
        quickWinPotential: 5,
        riskLevel: 4,
        stakeholderDemand: 6,
        score: 70
      }));
      setItems(mapped);
      setOriginalItems(mapped);
    }
  }, [dbObjectives, objectives, language]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (updatedItems) => {
      const updates = updatedItems.map((item, index) => ({
        id: item.id,
        display_order: index + 1,
        updated_at: new Date().toISOString()
      }));
      
      for (const update of updates) {
        const { error } = await supabase
          .from('strategic_objectives')
          .update({ display_order: update.display_order, updated_at: update.updated_at })
          .eq('id', update.id);
        if (error) throw error;
      }
      return updates;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['strategy-objectives-for-reprioritize', activePlanId]);
      toast.success(t({ en: 'Priorities saved successfully', ar: 'تم حفظ الأولويات بنجاح' }));
      setHasChanges(false);
    },
    onError: (error) => {
      console.error('Save error:', error);
      toast.error(t({ en: 'Failed to save priorities', ar: 'فشل في حفظ الأولويات' }));
    }
  });

  const moveItem = (index, direction) => {
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    newItems.forEach((item, i) => item.priority = i + 1);
    
    setItems(newItems);
    setHasChanges(true);
  };

  const handleReset = () => {
    setItems([...originalItems]);
    setHasChanges(false);
    setAiSuggestion(null);
  };

  const handleSave = () => {
    saveMutation.mutate(items);
    onSave?.(items);
  };

  const handleAIReprioritize = async () => {
    if (items.length === 0) {
      toast.error(t({ en: 'No objectives to analyze', ar: 'لا توجد أهداف للتحليل' }));
      return;
    }

    try {
      const result = await invokeAI({
        system_prompt: REPRIORITIZER_SYSTEM_PROMPT,
        prompt: buildReprioritizerPrompt(items),
        response_json_schema: REPRIORITIZER_SCHEMA
      });

      if (result.success && result.data) {
        setAiSuggestion(result.data);
        
        // Optionally auto-apply the suggested order
        const suggestedOrder = result.data.suggested_order || [];
        if (suggestedOrder.length > 0) {
          const reordered = [...items].sort((a, b) => {
            const aIndex = suggestedOrder.findIndex(name => 
              a.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(a.name.toLowerCase())
            );
            const bIndex = suggestedOrder.findIndex(name => 
              b.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(b.name.toLowerCase())
            );
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;
            return aIndex - bIndex;
          });
          reordered.forEach((item, i) => item.priority = i + 1);
          setItems(reordered);
          setHasChanges(true);
        }
        
        toast.success(t({ en: 'AI reprioritization complete', ar: 'اكتملت إعادة الترتيب الذكية' }));
      }
    } catch (error) {
      console.error('AI error:', error);
      toast.error(t({ en: 'AI analysis failed', ar: 'فشل التحليل الذكي' }));
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCriteriaBar = (value, max = 10) => {
    const percentage = (value / max) * 100;
    return (
      <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary rounded-full" 
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Suggestion Panel */}
      {aiSuggestion && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Sparkles className="h-5 w-5" />
              {t({ en: 'AI Priority Recommendation', ar: 'توصية الأولوية الذكية' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">{t({ en: 'Top Priority Reasoning', ar: 'مبررات الأولوية العليا' })}</h4>
                <ul className="space-y-2 text-sm">
                  {aiSuggestion.top_3_reasoning?.map((reason, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Badge variant="outline">{i + 1}</Badge>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {aiSuggestion.deprioritize?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-amber-700">{t({ en: 'Consider Deprioritizing', ar: 'يُنصح بتخفيض الأولوية' })}</h4>
                  <ul className="space-y-1 text-sm">
                    {aiSuggestion.deprioritize.map((item, i) => (
                      <li key={i}><strong>{item.name}:</strong> {item.reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5 text-primary" />
            {t({ en: 'Strategy Reprioritizer', ar: 'إعادة ترتيب الأولويات الاستراتيجية' })}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleAIReprioritize} disabled={aiLoading}>
              {aiLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {t({ en: 'AI Suggest', ar: 'اقتراح ذكي' })}
            </Button>
            {hasChanges && (
              <>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {t({ en: 'Reset', ar: 'إعادة تعيين' })}
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  {t({ en: 'Save Changes', ar: 'حفظ التغييرات' })}
                </Button>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-6 p-3 bg-muted/50 rounded-lg text-xs">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3 w-3" />
              <span>{t({ en: 'Strategic Importance', ar: 'الأهمية الاستراتيجية' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-3 w-3" />
              <span>{t({ en: 'Resource Availability', ar: 'توفر الموارد' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>{t({ en: 'Quick Win', ar: 'مكاسب سريعة' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-3 w-3" />
              <span>{t({ en: 'Risk Level', ar: 'مستوى المخاطر' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-3 w-3" />
              <span>{t({ en: 'Stakeholder Demand', ar: 'طلب أصحاب المصلحة' })}</span>
            </div>
          </div>

          {/* Priority List */}
          {items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {t({ en: 'No objectives found. Create strategic objectives first.', ar: 'لم يتم العثور على أهداف. أنشئ أهدافاً استراتيجية أولاً.' })}
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, index) => (
                <div 
                  key={item.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => moveItem(index, 'up')}
                      disabled={index === 0}
                    >
                      <span className="text-xs">▲</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => moveItem(index, 'down')}
                      disabled={index === items.length - 1}
                    >
                      <span className="text-xs">▼</span>
                    </Button>
                  </div>

                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {item.priority}
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold">{item.name}</p>
                    <div className="flex gap-4 mt-2">
                      <div className="flex items-center gap-1" title={t({ en: 'Strategic Importance', ar: 'الأهمية الاستراتيجية' })}>
                        <TrendingUp className="h-3 w-3 text-muted-foreground" />
                        {getCriteriaBar(item.strategicImportance)}
                      </div>
                      <div className="flex items-center gap-1" title={t({ en: 'Resource Availability', ar: 'توفر الموارد' })}>
                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                        {getCriteriaBar(item.resourceAvailability)}
                      </div>
                      <div className="flex items-center gap-1" title={t({ en: 'Quick Win', ar: 'مكاسب سريعة' })}>
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {getCriteriaBar(item.quickWinPotential)}
                      </div>
                      <div className="flex items-center gap-1" title={t({ en: 'Stakeholder Demand', ar: 'طلب أصحاب المصلحة' })}>
                        <Users className="h-3 w-3 text-muted-foreground" />
                        {getCriteriaBar(item.stakeholderDemand)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-2xl font-bold ${getScoreColor(item.score)}`}>
                      {item.score}
                    </span>
                    <p className="text-xs text-muted-foreground">{t({ en: 'Score', ar: 'النتيجة' })}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
