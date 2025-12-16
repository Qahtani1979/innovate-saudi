import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, Loader2, ChevronDown, ChevronRight, CheckCircle2, AlertTriangle,
  Target, TrendingUp, AlertCircle, Lightbulb, Award, BarChart3, 
  RefreshCw, Zap, ArrowRight, XCircle
} from 'lucide-react';
import { useLanguage } from '../../LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function AIStrategicPlanAnalyzer({ planData }) {
  const { language, t, isRTL } = useLanguage();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    scores: false,
    strengths: false,
    gaps: false,
    sections: false,
    kpis: false,
    recommendations: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('analyze-strategic-plan', {
        body: { planData, language }
      });

      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);
      
      setAnalysis(data.analysis);
      toast.success(t({ en: 'Analysis complete', ar: 'اكتمل التحليل' }));
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message);
      toast.error(t({ en: 'Failed to analyze plan', ar: 'فشل تحليل الخطة' }));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getGradeColor = (grade) => {
    if (grade?.startsWith('A')) return 'bg-green-500';
    if (grade?.startsWith('B')) return 'bg-blue-500';
    if (grade?.startsWith('C')) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getReadinessLabel = (level) => {
    const labels = {
      ready: { en: 'Ready for Approval', ar: 'جاهز للموافقة', color: 'bg-green-100 text-green-800' },
      needs_minor_changes: { en: 'Needs Minor Changes', ar: 'يحتاج تغييرات طفيفة', color: 'bg-blue-100 text-blue-800' },
      needs_major_changes: { en: 'Needs Major Changes', ar: 'يحتاج تغييرات كبيرة', color: 'bg-yellow-100 text-yellow-800' },
      not_ready: { en: 'Not Ready', ar: 'غير جاهز', color: 'bg-red-100 text-red-800' }
    };
    return labels[level] || labels.not_ready;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[priority] || colors.medium;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'excellent': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'good': return <CheckCircle2 className="h-4 w-4 text-blue-600" />;
      case 'needs_improvement': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'missing': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const SectionToggle = ({ sectionKey, title, icon: Icon, count }) => (
    <CollapsibleTrigger asChild>
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors"
        onClick={() => toggleSection(sectionKey)}
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">{title}</span>
          {count !== undefined && (
            <Badge variant="secondary" className="text-xs">{count}</Badge>
          )}
        </div>
        {expandedSections[sectionKey] ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
    </CollapsibleTrigger>
  );

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">
              {t({ en: 'AI Plan Analyzer', ar: 'محلل الخطة الذكي' })}
            </CardTitle>
          </div>
          <Button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing}
            size="sm"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t({ en: 'Analyzing...', ar: 'جاري التحليل...' })}
              </>
            ) : analysis ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                {t({ en: 'Re-analyze', ar: 'إعادة التحليل' })}
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                {t({ en: 'Analyze Plan', ar: 'تحليل الخطة' })}
              </>
            )}
          </Button>
        </div>
        <CardDescription>
          {t({ 
            en: 'Get AI-powered insights, scores, and recommendations for your strategic plan', 
            ar: 'احصل على رؤى وتقييمات وتوصيات مدعومة بالذكاء الاصطناعي لخطتك الاستراتيجية' 
          })}
        </CardDescription>
      </CardHeader>

      {error && (
        <CardContent className="pt-0">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      )}

      {!analysis && !isAnalyzing && !error && (
        <CardContent className="pt-0">
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              {t({ 
                en: 'Click "Analyze Plan" to get AI-powered evaluation and recommendations', 
                ar: 'اضغط "تحليل الخطة" للحصول على تقييم وتوصيات مدعومة بالذكاء الاصطناعي' 
              })}
            </p>
          </div>
        </CardContent>
      )}

      {isAnalyzing && (
        <CardContent className="pt-0">
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 mx-auto mb-3 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              {t({ en: 'Analyzing your strategic plan...', ar: 'جاري تحليل خطتك الاستراتيجية...' })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t({ en: 'This may take a moment', ar: 'قد يستغرق هذا لحظة' })}
            </p>
          </div>
        </CardContent>
      )}

      {analysis && (
        <CardContent className="pt-0 space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
          {/* Executive Summary */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">
                {t({ en: 'Executive Summary', ar: 'الملخص التنفيذي' })}
              </h3>
              <div className="flex items-center gap-2">
                <div className={`w-12 h-12 rounded-full ${getGradeColor(analysis.executive_summary?.grade)} flex items-center justify-center text-white font-bold text-lg`}>
                  {analysis.executive_summary?.grade || '?'}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <div className="text-center p-2 bg-background rounded-lg">
                <p className={`text-2xl font-bold ${getScoreColor(analysis.executive_summary?.overall_score)}`}>
                  {analysis.executive_summary?.overall_score || 0}
                </p>
                <p className="text-xs text-muted-foreground">{t({ en: 'Overall Score', ar: 'النتيجة الإجمالية' })}</p>
              </div>
              <div className="col-span-3 flex items-center">
                <Badge className={getReadinessLabel(analysis.executive_summary?.readiness_level).color}>
                  {t(getReadinessLabel(analysis.executive_summary?.readiness_level))}
                </Badge>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {analysis.executive_summary?.verdict}
            </p>
          </div>

          {/* Quick Wins */}
          {analysis.quick_wins?.length > 0 && (
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-green-600" />
                <span className="font-medium text-sm text-green-800 dark:text-green-200">
                  {t({ en: 'Quick Wins', ar: 'مكاسب سريعة' })}
                </span>
              </div>
              <ul className="space-y-1">
                {analysis.quick_wins.map((win, i) => (
                  <li key={i} className="text-xs text-green-700 dark:text-green-300 flex items-start gap-2">
                    <ArrowRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    {win}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Detailed Scores */}
          <Collapsible open={expandedSections.scores} onOpenChange={() => toggleSection('scores')}>
            <SectionToggle 
              sectionKey="scores" 
              title={t({ en: 'Detailed Scores', ar: 'النتائج التفصيلية' })} 
              icon={BarChart3} 
            />
            <CollapsibleContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3">
                {Object.entries(analysis.scores || {}).map(([key, value]) => {
                  const labels = {
                    completeness: t({ en: 'Completeness', ar: 'الاكتمال' }),
                    coherence: t({ en: 'Coherence', ar: 'التماسك' }),
                    feasibility: t({ en: 'Feasibility', ar: 'الجدوى' }),
                    measurability: t({ en: 'Measurability', ar: 'القابلية للقياس' }),
                    risk_management: t({ en: 'Risk Mgmt', ar: 'إدارة المخاطر' }),
                    stakeholder_engagement: t({ en: 'Stakeholders', ar: 'أصحاب المصلحة' }),
                    national_alignment: t({ en: 'National Align', ar: 'التوافق الوطني' }),
                    change_readiness: t({ en: 'Change Ready', ar: 'جاهزية التغيير' })
                  };
                  return (
                    <div key={key} className="text-center p-2 border rounded-lg">
                      <p className={`text-xl font-bold ${getScoreColor(value)}`}>{value}</p>
                      <p className="text-xs text-muted-foreground">{labels[key] || key}</p>
                      <Progress value={value} className="h-1 mt-1" />
                    </div>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Strengths */}
          <Collapsible open={expandedSections.strengths} onOpenChange={() => toggleSection('strengths')}>
            <SectionToggle 
              sectionKey="strengths" 
              title={t({ en: 'Strengths', ar: 'نقاط القوة' })} 
              icon={Award} 
              count={analysis.strengths?.length}
            />
            <CollapsibleContent>
              <div className="space-y-2 p-3">
                {analysis.strengths?.map((strength, i) => (
                  <div key={i} className="p-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="font-medium text-sm text-green-800 dark:text-green-200">{strength.area}</p>
                    <p className="text-xs text-green-700 dark:text-green-300">{strength.description}</p>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Critical Gaps */}
          <Collapsible open={expandedSections.gaps} onOpenChange={() => toggleSection('gaps')}>
            <SectionToggle 
              sectionKey="gaps" 
              title={t({ en: 'Critical Gaps', ar: 'الفجوات الحرجة' })} 
              icon={AlertCircle} 
              count={analysis.critical_gaps?.length}
            />
            <CollapsibleContent>
              <div className="space-y-2 p-3">
                {analysis.critical_gaps?.map((gap, i) => (
                  <div key={i} className={`p-3 border rounded-lg ${getPriorityColor(gap.priority)}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{gap.area}</span>
                      <Badge variant="outline" className="text-xs capitalize">{gap.priority}</Badge>
                    </div>
                    <p className="text-xs mb-2"><strong>{t({ en: 'Issue', ar: 'المشكلة' })}:</strong> {gap.issue}</p>
                    <p className="text-xs"><strong>{t({ en: 'Recommendation', ar: 'التوصية' })}:</strong> {gap.recommendation}</p>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Section Analysis */}
          <Collapsible open={expandedSections.sections} onOpenChange={() => toggleSection('sections')}>
            <SectionToggle 
              sectionKey="sections" 
              title={t({ en: 'Section-by-Section Analysis', ar: 'تحليل كل قسم' })} 
              icon={Target} 
              count={analysis.section_analysis?.length}
            />
            <CollapsibleContent>
              <div className="space-y-2 p-3">
                {analysis.section_analysis?.map((section, i) => (
                  <div key={i} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(section.status)}
                        <span className="font-medium text-sm">{section.section}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">{section.score}/100</Badge>
                    </div>
                    {section.findings?.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          {t({ en: 'Findings', ar: 'النتائج' })}:
                        </p>
                        <ul className="text-xs space-y-0.5">
                          {section.findings.map((f, j) => (
                            <li key={j}>• {f}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {section.recommendations?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          {t({ en: 'Recommendations', ar: 'التوصيات' })}:
                        </p>
                        <ul className="text-xs space-y-0.5 text-primary">
                          {section.recommendations.map((r, j) => (
                            <li key={j}>→ {r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* SMART KPI Analysis */}
          <Collapsible open={expandedSections.kpis} onOpenChange={() => toggleSection('kpis')}>
            <SectionToggle 
              sectionKey="kpis" 
              title={t({ en: 'SMART KPI Analysis', ar: 'تحليل مؤشرات SMART' })} 
              icon={TrendingUp} 
            />
            <CollapsibleContent>
              <div className="p-3">
                <div className="flex items-center gap-4 mb-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{analysis.smart_kpi_analysis?.smart_compliant || 0}</p>
                    <p className="text-xs text-muted-foreground">{t({ en: 'SMART Compliant', ar: 'متوافق مع SMART' })}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{analysis.smart_kpi_analysis?.total_kpis || 0}</p>
                    <p className="text-xs text-muted-foreground">{t({ en: 'Total KPIs', ar: 'إجمالي المؤشرات' })}</p>
                  </div>
                </div>
                {analysis.smart_kpi_analysis?.issues?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      {t({ en: 'Issues Found', ar: 'المشاكل المكتشفة' })}:
                    </p>
                    <ul className="text-xs space-y-1">
                      {analysis.smart_kpi_analysis.issues.map((issue, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <AlertTriangle className="h-3 w-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Strategic Recommendations */}
          <Collapsible open={expandedSections.recommendations} onOpenChange={() => toggleSection('recommendations')}>
            <SectionToggle 
              sectionKey="recommendations" 
              title={t({ en: 'Strategic Recommendations', ar: 'التوصيات الاستراتيجية' })} 
              icon={Lightbulb} 
              count={analysis.strategic_recommendations?.length}
            />
            <CollapsibleContent>
              <div className="space-y-2 p-3">
                {analysis.strategic_recommendations?.map((rec, i) => (
                  <div key={i} className="p-3 border rounded-lg">
                    <p className="font-medium text-sm mb-1">{rec.title}</p>
                    <p className="text-xs text-muted-foreground mb-2">{rec.description}</p>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {t({ en: 'Impact', ar: 'التأثير' })}: {rec.impact}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {t({ en: 'Effort', ar: 'الجهد' })}: {rec.effort}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      )}
    </Card>
  );
}
