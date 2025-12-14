import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, Target, BookOpen, Lightbulb, CheckCircle2, 
  AlertTriangle, ArrowRight, BarChart3, Users 
} from 'lucide-react';
import { useLanguage } from '../components/LanguageContext';
import ProtectedPage from '../components/permissions/ProtectedPage';
import StrategyToProgramGenerator from '../components/strategy/StrategyToProgramGenerator';
import StrategicGapProgramRecommender from '../components/strategy/StrategicGapProgramRecommender';
import { useStrategicKPI } from '../hooks/useStrategicKPI';

function StrategyFeedbackDashboardPage() {
  const { language, isRTL, t } = useLanguage();
  const { strategicPlans, strategicKPIs, getStrategicCoverage, isLoading: kpiLoading } = useStrategicKPI();

  const { data: programs = [], isLoading: programsLoading } = useQuery({
    queryKey: ['programs-feedback'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: events = [] } = useQuery({
    queryKey: ['events-feedback'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('id, title_en, title_ar, status')
        .eq('is_deleted', false);
      if (error) return [];
      return data || [];
    }
  });

  const isLoading = kpiLoading || programsLoading;

  // Calculate metrics
  const programsWithStrategicLink = programs.filter(p => 
    p.strategic_plan_ids?.length > 0 || p.strategic_objective_ids?.length > 0
  );
  const strategyDerivedPrograms = programs.filter(p => p.is_strategy_derived);
  const programsWithLessons = programs.filter(p => p.lessons_learned?.length > 0);
  const programsWithKPIContributions = programs.filter(p => p.kpi_contributions?.length > 0);

  const coverage = getStrategicCoverage(programs);

  // Aggregate all lessons
  const allLessons = programs.flatMap(p => 
    (p.lessons_learned || []).map(l => ({ ...l, program: p }))
  ).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // Aggregate all feedback
  const allFeedback = strategicPlans.flatMap(plan => 
    (plan.program_feedback || []).map(f => ({ ...f, plan }))
  ).sort((a, b) => new Date(b.feedback_date) - new Date(a.feedback_date));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 container mx-auto py-6 px-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-3xl font-bold">
          {t({ en: 'Strategy ↔ Programs Dashboard', ar: 'لوحة الاستراتيجية ↔ البرامج' })}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t({ en: 'Bidirectional integration between strategic planning and program execution', ar: 'التكامل ثنائي الاتجاه بين التخطيط الاستراتيجي وتنفيذ البرامج' })}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-indigo-50 to-background">
          <CardContent className="pt-4 text-center">
            <Target className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-indigo-600">{strategicPlans.length}</p>
            <p className="text-xs text-muted-foreground">{t({ en: 'Strategic Plans', ar: 'الخطط الاستراتيجية' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-background">
          <CardContent className="pt-4 text-center">
            <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">{coverage.planCoverage}%</p>
            <p className="text-xs text-muted-foreground">{t({ en: 'Plan Coverage', ar: 'تغطية الخطط' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-background">
          <CardContent className="pt-4 text-center">
            <BarChart3 className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">{strategicKPIs.length}</p>
            <p className="text-xs text-muted-foreground">{t({ en: 'Strategic KPIs', ar: 'مؤشرات الأداء' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-background">
          <CardContent className="pt-4 text-center">
            <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{programsWithStrategicLink.length}/{programs.length}</p>
            <p className="text-xs text-muted-foreground">{t({ en: 'Linked Programs', ar: 'برامج مرتبطة' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-background">
          <CardContent className="pt-4 text-center">
            <Lightbulb className="h-6 w-6 text-amber-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-amber-600">{strategyDerivedPrograms.length}</p>
            <p className="text-xs text-muted-foreground">{t({ en: 'Strategy-Derived', ar: 'مشتق من الاستراتيجية' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-teal-50 to-background">
          <CardContent className="pt-4 text-center">
            <BookOpen className="h-6 w-6 text-teal-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-teal-600">{allLessons.length}</p>
            <p className="text-xs text-muted-foreground">{t({ en: 'Lessons Captured', ar: 'دروس مسجلة' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Bidirectional Flow Diagram */}
      <Card className="bg-gradient-to-r from-muted to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            {t({ en: 'Strategy ↔ Programs Integration Flow', ar: 'تدفق التكامل: الاستراتيجية ↔ البرامج' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-4 py-6">
            <div className="text-center p-4 bg-background rounded-lg shadow-sm min-w-[140px]">
              <Target className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
              <p className="font-semibold">{t({ en: 'Strategy', ar: 'الاستراتيجية' })}</p>
              <p className="text-xs text-muted-foreground">{strategicPlans.length} {t({ en: 'plans', ar: 'خطط' })}</p>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-green-600">
                <ArrowRight className="h-5 w-5" />
                <span className="text-xs font-medium">{t({ en: 'Drives', ar: 'يقود' })}</span>
              </div>
              <div className="flex items-center gap-2 text-blue-600">
                <span className="text-xs font-medium">{t({ en: 'Informs', ar: 'يُعلم' })}</span>
                <ArrowRight className="h-5 w-5 rotate-180" />
              </div>
            </div>
            
            <div className="text-center p-4 bg-background rounded-lg shadow-sm min-w-[140px]">
              <BookOpen className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="font-semibold">{t({ en: 'Programs', ar: 'البرامج' })}</p>
              <p className="text-xs text-muted-foreground">{programs.length} {t({ en: 'programs', ar: 'برنامج' })}</p>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-green-600">
                <ArrowRight className="h-5 w-5" />
                <span className="text-xs font-medium">{t({ en: 'Updates', ar: 'يحدث' })}</span>
              </div>
            </div>
            
            <div className="text-center p-4 bg-background rounded-lg shadow-sm min-w-[140px]">
              <BarChart3 className="h-8 w-8 text-teal-600 mx-auto mb-2" />
              <p className="font-semibold">{t({ en: 'KPIs', ar: 'المؤشرات' })}</p>
              <p className="text-xs text-muted-foreground">{coverage.kpiCoverage}% {t({ en: 'tracked', ar: 'متابع' })}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="generate">{t({ en: 'Generate Programs', ar: 'توليد البرامج' })}</TabsTrigger>
          <TabsTrigger value="gaps">{t({ en: 'Gap Analysis', ar: 'تحليل الفجوات' })}</TabsTrigger>
          <TabsTrigger value="lessons">{t({ en: 'Lessons Learned', ar: 'الدروس المستفادة' })}</TabsTrigger>
          <TabsTrigger value="feedback">{t({ en: 'Strategy Feedback', ar: 'ملاحظات الاستراتيجية' })}</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="mt-6">
          <StrategyToProgramGenerator />
        </TabsContent>

        <TabsContent value="gaps" className="mt-6">
          <StrategicGapProgramRecommender />
        </TabsContent>

        <TabsContent value="lessons" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Recent Lessons from Programs', ar: 'الدروس الأخيرة من البرامج' })}</CardTitle>
            </CardHeader>
            <CardContent>
              {allLessons.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>{t({ en: 'No lessons captured yet', ar: 'لم يتم تسجيل دروس بعد' })}</p>
                  <p className="text-sm mt-1">{t({ en: 'Add lessons from individual program pages', ar: 'أضف الدروس من صفحات البرامج الفردية' })}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allLessons.slice(0, 10).map((lesson, index) => (
                    <div key={lesson.id || index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {lesson.type === 'success' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                            {lesson.type === 'challenge' && <AlertTriangle className="h-4 w-4 text-amber-600" />}
                            {lesson.type === 'improvement' && <TrendingUp className="h-4 w-4 text-blue-600" />}
                            <Badge variant="outline" className="text-xs">
                              {lesson.program?.name_en || 'Unknown Program'}
                            </Badge>
                          </div>
                          <p className="text-sm">{lesson.description}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(lesson.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Feedback Sent to Strategic Plans', ar: 'الملاحظات المرسلة للخطط الاستراتيجية' })}</CardTitle>
            </CardHeader>
            <CardContent>
              {allFeedback.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>{t({ en: 'No feedback submitted yet', ar: 'لم يتم إرسال ملاحظات بعد' })}</p>
                  <p className="text-sm mt-1">{t({ en: 'Generate and send feedback from program lesson pages', ar: 'قم بتوليد وإرسال الملاحظات من صفحات دروس البرامج' })}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allFeedback.slice(0, 5).map((feedback, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-indigo-50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-indigo-600" />
                          <span className="font-medium text-indigo-800">
                            {feedback.plan?.name_en || feedback.plan?.title_en}
                          </span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {t({ en: 'From:', ar: 'من:' })} {feedback.program_name}
                        </Badge>
                      </div>
                      {feedback.strategy_refinements?.length > 0 && (
                        <div className="text-sm">
                          <p className="font-medium mb-1">{t({ en: 'Refinements:', ar: 'التحسينات:' })}</p>
                          <ul className="list-disc list-inside">
                            {feedback.strategy_refinements.slice(0, 2).map((r, i) => (
                              <li key={i}>{language === 'ar' ? r.ar : r.en}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(feedback.feedback_date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProtectedPage(StrategyFeedbackDashboardPage, { requiredPermissions: ['strategy_view'] });