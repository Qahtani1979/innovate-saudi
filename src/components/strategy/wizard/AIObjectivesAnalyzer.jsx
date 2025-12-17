import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, Loader2, ChevronDown, ChevronRight, CheckCircle2, AlertTriangle,
  Target, TrendingUp, AlertCircle, Lightbulb, Award, BarChart3, 
  RefreshCw, Zap, ArrowRight, XCircle, Building2, Link2, Layers,
  ClipboardList, ShieldCheck, Flag
} from 'lucide-react';
import { useLanguage } from '../../LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

/**
 * AI Objectives Analyzer
 * 
 * Analyzes Step 9 objectives with full context from:
 * - Steps 1-8 (context, vision, stakeholders, PESTEL, SWOT, scenarios, risks, dependencies)
 * - Taxonomy data (sectors, themes, technologies)
 * - Current objectives
 * 
 * Provides actionable recommendations and assessments.
 */
export default function AIObjectivesAnalyzer({ 
  objectives = [],
  wizardData = {},
  sectors = [],
  strategicThemes = [],
  onApplyRecommendation
}) {
  const { language, t, isRTL } = useLanguage();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    gaps: true,
    recommendations: true,
    alignment: false,
    sectorAnalysis: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Build comprehensive context from steps 1-8
  const buildAnalysisContext = () => {
    return {
      // Step 1: Context
      planContext: {
        name: wizardData.name_en || wizardData.name_ar,
        description: wizardData.description_en || wizardData.description_ar,
        startYear: wizardData.start_year,
        endYear: wizardData.end_year,
        entityType: wizardData.entity_type,
        scope: wizardData.scope
      },
      
      // Step 2: Vision & Mission
      vision: {
        vision_en: wizardData.vision_en,
        vision_ar: wizardData.vision_ar,
        mission_en: wizardData.mission_en,
        mission_ar: wizardData.mission_ar,
        coreValues: wizardData.core_values || [],
        pillars: wizardData.strategic_pillars || []
      },
      
      // Step 3: Stakeholders
      stakeholders: (wizardData.stakeholders || []).map(s => ({
        name: s.name_en || s.name_ar,
        type: s.type,
        power: s.power,
        interest: s.interest,
        engagement: s.engagement_level
      })),
      
      // Step 4: PESTEL
      pestel: wizardData.pestel || {},
      
      // Step 5: SWOT
      swot: wizardData.swot || {},
      
      // Step 6: Scenarios
      scenarios: wizardData.scenarios || {},
      
      // Step 7: Risks
      risks: (wizardData.risks || []).map(r => ({
        title: r.title_en || r.title_ar,
        category: r.category,
        likelihood: r.likelihood,
        impact: r.impact,
        mitigation: r.mitigation_strategy_en || r.mitigation_strategy_ar
      })),
      
      // Step 8: Dependencies & Constraints
      dependencies: wizardData.dependencies || [],
      constraints: wizardData.constraints || [],
      assumptions: wizardData.assumptions || [],
      
      // Current objectives (Step 9)
      objectives: objectives.map(o => ({
        name_en: o.name_en,
        name_ar: o.name_ar,
        description_en: o.description_en,
        description_ar: o.description_ar,
        sector_code: o.sector_code,
        priority: o.priority
      })),
      
      // Taxonomy context
      availableSectors: sectors.map(s => ({
        code: s.code,
        name_en: s.name_en,
        name_ar: s.name_ar
      })),
      
      strategicThemes: strategicThemes.map(th => ({
        code: th.code,
        name_en: th.name_en,
        name_ar: th.name_ar
      }))
    };
  };

  const handleAnalyze = async () => {
    if (objectives.length === 0) {
      toast.warning(t({ 
        en: 'Please add at least one objective before analyzing', 
        ar: 'يرجى إضافة هدف واحد على الأقل قبل التحليل' 
      }));
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    
    try {
      const context = buildAnalysisContext();
      
      const { data, error: fnError } = await supabase.functions.invoke('analyze-objectives', {
        body: { 
          context,
          language,
          objectivesCount: objectives.length,
          sectorsCount: sectors.length
        }
      });

      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);
      
      setAnalysis(data.analysis);
      toast.success(t({ en: 'Analysis complete', ar: 'اكتمل التحليل' }));
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message);
      toast.error(t({ en: 'Failed to analyze objectives', ar: 'فشل تحليل الأهداف' }));
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
    if (score >= 80) return { label: t({ en: 'Excellent', ar: 'ممتاز' }), variant: 'default', className: 'bg-green-500' };
    if (score >= 60) return { label: t({ en: 'Good', ar: 'جيد' }), variant: 'default', className: 'bg-yellow-500' };
    if (score >= 40) return { label: t({ en: 'Fair', ar: 'مقبول' }), variant: 'default', className: 'bg-orange-500' };
    return { label: t({ en: 'Needs Work', ar: 'يحتاج تحسين' }), variant: 'destructive', className: '' };
  };

  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'critical': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'medium': return <Flag className="w-4 h-4 text-yellow-500" />;
      default: return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {t({ en: 'AI Objectives Analyzer', ar: 'محلل الأهداف بالذكاء الاصطناعي' })}
              </CardTitle>
              <CardDescription>
                {t({ 
                  en: 'Comprehensive analysis with context from Steps 1-8', 
                  ar: 'تحليل شامل مع سياق الخطوات 1-8' 
                })}
              </CardDescription>
            </div>
          </div>
          
          <Button 
            onClick={handleAnalyze}
            disabled={isAnalyzing || objectives.length === 0}
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
                  : t({ en: 'Analyze Objectives', ar: 'تحليل الأهداف' })
                }
              </>
            )}
          </Button>
        </div>
        
        {/* Context indicators */}
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="outline" className="text-xs">
            <Target className="w-3 h-3 mr-1" />
            {objectives.length} {t({ en: 'objectives', ar: 'أهداف' })}
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Building2 className="w-3 h-3 mr-1" />
            {new Set(objectives.filter(o => o.sector_code).map(o => o.sector_code)).size} {t({ en: 'sectors', ar: 'قطاعات' })}
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Layers className="w-3 h-3 mr-1" />
            {t({ en: 'Steps 1-8 context', ar: 'سياق الخطوات 1-8' })}
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
                en: 'Click "Analyze Objectives" to get AI-powered insights and recommendations', 
                ar: 'انقر على "تحليل الأهداف" للحصول على رؤى وتوصيات الذكاء الاصطناعي' 
              })}
            </p>
          </div>
        )}

        {analysis && (
          <ScrollArea className="max-h-[600px]">
            <div className="space-y-4 pr-4">
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
                            {t({ 
                              en: key.replace(/_/g, ' '), 
                              ar: key.replace(/_/g, ' ') 
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>

              <Separator />

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
                          <div className="flex-1">
                            <p className="font-medium text-sm">{gap.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{gap.description}</p>
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
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 flex-1">
                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                            <div>
                              <p className="font-medium text-sm">{rec.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                              {rec.action && (
                                <p className="text-xs text-green-600 mt-1 font-medium">
                                  <ArrowRight className="w-3 h-3 inline mr-1" />
                                  {rec.action}
                                </p>
                              )}
                            </div>
                          </div>
                          {onApplyRecommendation && rec.autoApply && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="shrink-0"
                              onClick={() => onApplyRecommendation(rec)}
                            >
                              {t({ en: 'Apply', ar: 'تطبيق' })}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Strategic Alignment */}
              {analysis.alignment && (
                <Collapsible open={expandedSections.alignment} onOpenChange={() => toggleSection('alignment')}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors">
                    <div className="flex items-center gap-2">
                      <Link2 className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">
                        {t({ en: 'Strategic Alignment', ar: 'التوافق الاستراتيجي' })}
                      </span>
                    </div>
                    {expandedSections.alignment ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3 space-y-2">
                    {analysis.alignment.visionAlignment && (
                      <div className="p-3 bg-background rounded-lg border">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4 text-primary" />
                          <span className="font-medium text-sm">
                            {t({ en: 'Vision Alignment', ar: 'التوافق مع الرؤية' })}
                          </span>
                          <Badge className={getScoreBadge(analysis.alignment.visionAlignment.score).className}>
                            {analysis.alignment.visionAlignment.score}%
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{analysis.alignment.visionAlignment.notes}</p>
                      </div>
                    )}
                    
                    {analysis.alignment.swotAlignment && (
                      <div className="p-3 bg-background rounded-lg border">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className="w-4 h-4 text-primary" />
                          <span className="font-medium text-sm">
                            {t({ en: 'SWOT Integration', ar: 'تكامل SWOT' })}
                          </span>
                          <Badge className={getScoreBadge(analysis.alignment.swotAlignment.score).className}>
                            {analysis.alignment.swotAlignment.score}%
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{analysis.alignment.swotAlignment.notes}</p>
                      </div>
                    )}
                    
                    {analysis.alignment.riskMitigation && (
                      <div className="p-3 bg-background rounded-lg border">
                        <div className="flex items-center gap-2 mb-2">
                          <ShieldCheck className="w-4 h-4 text-primary" />
                          <span className="font-medium text-sm">
                            {t({ en: 'Risk Mitigation', ar: 'تخفيف المخاطر' })}
                          </span>
                          <Badge className={getScoreBadge(analysis.alignment.riskMitigation.score).className}>
                            {analysis.alignment.riskMitigation.score}%
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{analysis.alignment.riskMitigation.notes}</p>
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Sector Analysis */}
              {analysis.sectorAnalysis && analysis.sectorAnalysis.length > 0 && (
                <Collapsible open={expandedSections.sectorAnalysis} onOpenChange={() => toggleSection('sectorAnalysis')}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-purple-500/10 rounded-lg hover:bg-purple-500/20 transition-colors">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">
                        {t({ en: 'Sector Coverage Analysis', ar: 'تحليل التغطية القطاعية' })}
                      </span>
                    </div>
                    {expandedSections.sectorAnalysis ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {analysis.sectorAnalysis.map((sector, idx) => (
                        <div 
                          key={idx} 
                          className={cn(
                            "p-3 bg-background rounded-lg border",
                            sector.objectivesCount === 0 && "border-orange-300 dark:border-orange-700"
                          )}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{sector.name}</span>
                            <Badge variant={sector.objectivesCount > 0 ? "default" : "outline"}>
                              {sector.objectivesCount} {t({ en: 'objectives', ar: 'أهداف' })}
                            </Badge>
                          </div>
                          {sector.suggestion && (
                            <p className="text-xs text-muted-foreground">{sector.suggestion}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
