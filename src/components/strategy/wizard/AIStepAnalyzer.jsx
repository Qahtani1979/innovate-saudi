import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain, Loader2, ChevronDown, ChevronRight, CheckCircle2, AlertTriangle,
  Target, TrendingUp, AlertCircle, Lightbulb, Award, BarChart3, 
  RefreshCw, Zap, ArrowRight, XCircle, Layers
} from 'lucide-react';
import { useLanguage } from '../../LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

/**
 * Generic AI Step Analyzer
 * 
 * Reusable component for AI analysis of any wizard step.
 * Supports customizable context, titles, and analysis endpoints.
 */
export default function AIStepAnalyzer({ 
  stepNumber,
  stepName,
  items = [],
  itemsLabel,
  wizardData = {},
  taxonomyData = {},
  contextBuilderFn,
  edgeFunctionName = 'analyze-step',
  icon: StepIcon = Target
}) {
  const { language, t, isRTL } = useLanguage();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    gaps: true,
    recommendations: true,
    alignment: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Build context from wizard data
  const buildAnalysisContext = () => {
    if (contextBuilderFn) {
      return contextBuilderFn(wizardData, items, taxonomyData);
    }
    
    // Default context builder
    return {
      stepNumber,
      stepName,
      planContext: {
        name: wizardData.name_en || wizardData.name_ar,
        description: wizardData.description_en || wizardData.description_ar,
        startYear: wizardData.start_year,
        endYear: wizardData.end_year,
        vision: wizardData.vision_en || wizardData.vision_ar,
        mission: wizardData.mission_en || wizardData.mission_ar
      },
      objectives: (wizardData.objectives || []).map(o => ({
        name_en: o.name_en,
        name_ar: o.name_ar,
        sector_code: o.sector_code,
        priority: o.priority
      })),
      items: items,
      taxonomyData
    };
  };

  const handleAnalyze = async () => {
    if (items.length === 0) {
      toast.warning(t({ 
        en: `Please add at least one ${itemsLabel?.en || 'item'} before analyzing`, 
        ar: `يرجى إضافة ${itemsLabel?.ar || 'عنصر'} واحد على الأقل قبل التحليل` 
      }));
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    
    try {
      const context = buildAnalysisContext();
      
      const { data, error: fnError } = await supabase.functions.invoke(edgeFunctionName, {
        body: { 
          context,
          language,
          stepNumber,
          stepName,
          itemsCount: items.length
        }
      });

      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);
      
      setAnalysis(data.analysis);
      toast.success(t({ en: 'Analysis complete', ar: 'اكتمل التحليل' }));
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message);
      toast.error(t({ en: 'Failed to analyze', ar: 'فشل التحليل' }));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreBadge = (score) => {
    if (score >= 80) return { label: t({ en: 'Excellent', ar: 'ممتاز' }), className: 'bg-green-500' };
    if (score >= 60) return { label: t({ en: 'Good', ar: 'جيد' }), className: 'bg-yellow-500' };
    if (score >= 40) return { label: t({ en: 'Fair', ar: 'مقبول' }), className: 'bg-orange-500' };
    return { label: t({ en: 'Needs Work', ar: 'يحتاج تحسين' }), className: 'bg-red-500' };
  };

  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'critical': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'medium': return <TrendingUp className="w-4 h-4 text-yellow-500" />;
      default: return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {t({ en: `AI ${stepName} Analyzer`, ar: `محلل ${stepName} بالذكاء الاصطناعي` })}
              </CardTitle>
              <CardDescription>
                {t({ 
                  en: 'Comprehensive analysis with full strategic context', 
                  ar: 'تحليل شامل مع السياق الاستراتيجي الكامل' 
                })}
              </CardDescription>
            </div>
          </div>
          
          <Button 
            onClick={handleAnalyze}
            disabled={isAnalyzing || items.length === 0}
            className="gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t({ en: 'Analyzing...', ar: 'جارٍ التحليل...' })}
              </>
            ) : (
              <>
                {analysis ? <RefreshCw className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                {analysis 
                  ? t({ en: 'Re-analyze', ar: 'إعادة التحليل' })
                  : t({ en: 'Analyze', ar: 'تحليل' })
                }
              </>
            )}
          </Button>
        </div>
        
        {/* Context indicators */}
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="outline" className="text-xs">
            <StepIcon className="w-3 h-3 mr-1" />
            {items.length} {t(itemsLabel || { en: 'items', ar: 'عناصر' })}
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Layers className="w-3 h-3 mr-1" />
            {t({ en: `Step ${stepNumber}`, ar: `الخطوة ${stepNumber}` })}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <XCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!analysis && !isAnalyzing && (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              {t({ 
                en: 'Click "Analyze" to get AI-powered insights and recommendations', 
                ar: 'انقر على "تحليل" للحصول على رؤى وتوصيات الذكاء الاصطناعي' 
              })}
            </p>
          </div>
        )}

        {analysis && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {/* Overall Score */}
            <Collapsible open={expandedSections.overview} onOpenChange={() => toggleSection('overview')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  <span className="font-medium">
                    {t({ en: 'Overall Assessment', ar: 'التقييم العام' })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn("text-2xl font-bold", getScoreColor(analysis.overallScore || 0))}>
                    {analysis.overallScore || 0}%
                  </span>
                  {expandedSections.overview ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3 space-y-3">
                <Progress value={analysis.overallScore || 0} className="h-2" />
                
                {analysis.summary && (
                  <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                    {analysis.summary}
                  </p>
                )}
                
                {/* Score breakdown */}
                {analysis.scores && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(analysis.scores).map(([key, value]) => (
                      <div key={key} className="p-2 bg-background rounded border text-center">
                        <div className={cn("text-lg font-bold", getScoreColor(value))}>
                          {value}%
                        </div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {key.replace(/_/g, ' ')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>

            {/* Gaps & Issues */}
            {analysis.gaps && analysis.gaps.length > 0 && (
              <Collapsible open={expandedSections.gaps} onOpenChange={() => toggleSection('gaps')}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-orange-500/10 rounded-lg hover:bg-orange-500/20 transition-colors">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    <span className="font-medium">
                      {t({ en: 'Identified Gaps', ar: 'الفجوات المحددة' })}
                    </span>
                    <Badge variant="secondary">{analysis.gaps.length}</Badge>
                  </div>
                  {expandedSections.gaps ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-3 space-y-2">
                  {analysis.gaps.map((gap, idx) => (
                    <div 
                      key={idx} 
                      className="p-3 bg-background rounded-lg border border-orange-200 dark:border-orange-800"
                    >
                      <div className="flex items-start gap-2">
                        {getPriorityIcon(gap.priority)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{gap.title}</p>
                          <p className="text-xs text-muted-foreground mt-1 break-words">{gap.description}</p>
                          {gap.impact && (
                            <p className="text-xs text-orange-600 mt-1">
                              <strong>{t({ en: 'Impact:', ar: 'التأثير:' })}</strong> {gap.impact}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Recommendations */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <Collapsible open={expandedSections.recommendations} onOpenChange={() => toggleSection('recommendations')}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-green-500/10 rounded-lg hover:bg-green-500/20 transition-colors">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-green-600" />
                    <span className="font-medium">
                      {t({ en: 'Actionable Recommendations', ar: 'التوصيات القابلة للتنفيذ' })}
                    </span>
                    <Badge variant="secondary">{analysis.recommendations.length}</Badge>
                  </div>
                  {expandedSections.recommendations ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-3 space-y-2">
                  {analysis.recommendations.map((rec, idx) => (
                    <div 
                      key={idx} 
                      className="p-3 bg-background rounded-lg border border-green-200 dark:border-green-800"
                    >
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-sm">{rec.title}</p>
                            <p className="text-xs text-muted-foreground mt-1 break-words">{rec.description}</p>
                            {rec.action && (
                              <div className="flex items-start gap-1 mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded text-xs text-green-700 dark:text-green-400">
                                <ArrowRight className="w-3 h-3 mt-0.5 shrink-0" />
                                <span className="break-words">{rec.action}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {rec.priority && (
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "shrink-0",
                              rec.priority === 'critical' && "border-red-500 text-red-600",
                              rec.priority === 'high' && "border-orange-500 text-orange-600",
                              rec.priority === 'medium' && "border-yellow-500 text-yellow-600"
                            )}
                          >
                            {rec.priority}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Alignment */}
            {analysis.alignment && (
              <Collapsible open={expandedSections.alignment} onOpenChange={() => toggleSection('alignment')}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">
                      {t({ en: 'Strategic Alignment', ar: 'التوافق الاستراتيجي' })}
                    </span>
                  </div>
                  {expandedSections.alignment ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-3 space-y-2">
                  {Object.entries(analysis.alignment).map(([key, value]) => (
                    <div key={key} className="p-3 bg-background rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-primary" />
                        <span className="font-medium text-sm capitalize">
                          {key.replace(/_/g, ' ')}
                        </span>
                        {value.score && (
                          <Badge className={getScoreBadge(value.score).className}>
                            {value.score}%
                          </Badge>
                        )}
                      </div>
                      {value.notes && (
                        <p className="text-xs text-muted-foreground">{value.notes}</p>
                      )}
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
