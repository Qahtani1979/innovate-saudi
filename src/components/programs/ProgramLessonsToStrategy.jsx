import { useState } from 'react';
import { useStrategiesWithVisibility } from '@/hooks/useStrategiesWithVisibility';
import { useProgramMutations } from '@/hooks/useProgramMutations';
import { useStrategyMutations } from '@/hooks/useStrategyMutations';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Lightbulb, BookOpen, AlertTriangle, TrendingUp,
  Loader2, Send, CheckCircle2
} from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import {
  LESSONS_STRATEGY_SYSTEM_PROMPT,
  buildLessonsStrategyPrompt,
  LESSONS_STRATEGY_SCHEMA
} from '@/lib/ai/prompts/programs/lessonsStrategy';

/**
 * ProgramLessonsToStrategy
 * ✅ GOLD STANDARD COMPLIANT
 */
export default function ProgramLessonsToStrategy({ program }) {
  const { language, isRTL, t } = useLanguage();
  const [newLesson, setNewLesson] = useState('');
  const [lessonType, setLessonType] = useState('success');
  const [aiSummary, setAiSummary] = useState(null);
  const { invokeAI, status: aiStatus, isLoading: aiLoading, rateLimitInfo } = useAIWithFallback();

  const { data: strategicPlans = [] } = useStrategiesWithVisibility();
  const linkedPlans = strategicPlans.filter(p =>
    program?.['strategic_plan_ids']?.includes(p.id) ||
    program?.['strategic_objective_ids']?.includes(p.id)
  );

  // Get existing lessons
  const lessons = program.lessons_learned || [];
  const successLessons = lessons.filter(l => l.type === 'success');
  const challengeLessons = lessons.filter(l => l.type === 'challenge' || l.type === 'failure');
  const improvementLessons = lessons.filter(l => l.type === 'improvement');

  const {
    updateProgram,
    isUpdating: isUpdatingProgram,
    generateLessonsSummary,
    isGeneratingLessonsSummary
  } = useProgramMutations();
  const { updateStrategy } = useStrategyMutations();

  const handleAddLesson = async () => {
    if (!newLesson.trim()) return;

    const lesson = {
      id: crypto.randomUUID(),
      type: lessonType,
      description: newLesson,
      created_at: new Date().toISOString()
    };

    const updatedLessons = [...lessons, lesson];
    try {
      await updateProgram.mutateAsync({
        id: program.id,
        data: { lessons_learned: updatedLessons }
      });
      setNewLesson('');
      toast.success(t({ en: 'Lesson added', ar: 'تمت إضافة الدرس' }));
    } catch (e) {
      // Error handled by mutation
    }
  };

  const handleFeedbackToStrategy = async () => {
    if (!aiSummary || linkedPlans.length === 0) return;

    try {
      // For each linked plan, add the refinements as a feedback entry
      await Promise.all(linkedPlans.map(plan => {
        const feedback = plan.feedback || [];
        const newFeedback = {
          id: crypto.randomUUID(),
          source_program_id: program.id,
          source_program_name: program.name_en,
          type: 'lessons_learned',
          content: aiSummary.strategy_refinements,
          created_at: new Date().toISOString(),
          status: 'pending_review'
        };

        return updateStrategy.mutateAsync({
          id: plan.id,
          data: {
            feedback: [...feedback, newFeedback],
            has_pending_feedback: true
          }
        });
      }));

      toast.success(t({ en: 'Feedback sent to strategic plans', ar: 'تم إرسال الملاحظات للخطط الاستراتيجية' }));
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleGenerateAISummary = async () => {
    try {
      const data = await generateLessonsSummary.mutateAsync({
        invokeAI,
        prompts: {
          system: LESSONS_STRATEGY_SYSTEM_PROMPT,
          user: buildLessonsStrategyPrompt({
            program,
            successLessons,
            challengeLessons,
            improvementLessons,
            linkedPlans
          })
        },
        schema: LESSONS_STRATEGY_SCHEMA
      });
      setAiSummary(data);
    } catch (error) {
      // Error handled by mutation toast
    }
  };

  const lessonTypeConfig = {
    success: { icon: CheckCircle2, color: 'text-green-600 bg-green-50', label: { en: 'Success', ar: 'نجاح' } },
    challenge: { icon: AlertTriangle, color: 'text-amber-600 bg-amber-50', label: { en: 'Challenge', ar: 'تحدي' } },
    improvement: { icon: TrendingUp, color: 'text-blue-600 bg-blue-50', label: { en: 'Improvement', ar: 'تحسين' } }
  };

  return (
    <Card className="border-2 border-teal-200">
      <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50">
        <CardTitle className="flex items-center gap-2 text-teal-700">
          <BookOpen className="h-5 w-5" />
          {t({ en: 'Program Lessons → Strategy Feedback', ar: 'دروس البرنامج → ملاحظات الاستراتيجية' })}
        </CardTitle>
        <p className="text-sm text-slate-600 mt-1">
          {t({
            en: 'Capture lessons learned and feed them back to strategic planning',
            ar: 'تسجيل الدروس المستفادة وإعادتها للتخطيط الاستراتيجي'
          })}
        </p>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <AIStatusIndicator status={aiStatus} rateLimitInfo={rateLimitInfo} error={null} />

        {/* Lessons Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-green-50 rounded-lg text-center">
            <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-green-600">{successLessons.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Successes', ar: 'نجاحات' })}</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-center">
            <AlertTriangle className="h-5 w-5 text-amber-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-amber-600">{challengeLessons.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Challenges', ar: 'تحديات' })}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-center">
            <TrendingUp className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-blue-600">{improvementLessons.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Improvements', ar: 'تحسينات' })}</p>
          </div>
        </div>

        <Tabs defaultValue="add" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="add">{t({ en: 'Add Lesson', ar: 'إضافة درس' })}</TabsTrigger>
            <TabsTrigger value="view">{t({ en: 'View All', ar: 'عرض الكل' })}</TabsTrigger>
            <TabsTrigger value="feedback">{t({ en: 'Strategy Feedback', ar: 'ملاحظات الاستراتيجية' })}</TabsTrigger>
          </TabsList>

          <TabsContent value="add" className="space-y-4 mt-4">
            <div className="space-y-3">
              <Select value={lessonType} onValueChange={setLessonType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="success">✅ {t({ en: 'Success', ar: 'نجاح' })}</SelectItem>
                  <SelectItem value="challenge">⚠️ {t({ en: 'Challenge/Failure', ar: 'تحدي/فشل' })}</SelectItem>
                  <SelectItem value="improvement">📈 {t({ en: 'Improvement', ar: 'تحسين' })}</SelectItem>
                </SelectContent>
              </Select>

              <Textarea
                placeholder={t({ en: 'Describe the lesson learned...', ar: 'صف الدرس المستفاد...' })}
                value={newLesson}
                onChange={(e) => setNewLesson(e.target.value)}
                rows={3}
              />

              <Button
                onClick={handleAddLesson}
                disabled={!newLesson.trim() || isUpdatingProgram}
                className="w-full"
              >
                {isUpdatingProgram ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Lightbulb className="h-4 w-4 mr-2" />
                    {t({ en: 'Add Lesson', ar: 'إضافة درس' })}
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="view" className="mt-4">
            {lessons.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>{t({ en: 'No lessons recorded yet', ar: 'لم يتم تسجيل دروس بعد' })}</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {lessons.map((lesson, index) => {
                  const config = lessonTypeConfig[lesson.type] || lessonTypeConfig.improvement;
                  const LessonIcon = config.icon;
                  return (
                    <div key={lesson.id || index} className={`p-3 rounded-lg ${config.color}`}>
                      <div className="flex items-start gap-2">
                        <LessonIcon className="h-4 w-4 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm">{lesson.description}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(lesson.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="feedback" className="space-y-4 mt-4">
            {linkedPlans.length === 0 ? (
              <div className="text-center py-6 text-amber-600 bg-amber-50 rounded-lg">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                <p className="font-medium">{t({ en: 'No linked strategic plans', ar: 'لا توجد خطط استراتيجية مرتبطة' })}</p>
                <p className="text-sm">{t({ en: 'Link this program to strategic plans first', ar: 'اربط هذا البرنامج بالخطط الاستراتيجية أولاً' })}</p>
              </div>
            ) : (
              <>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm font-medium text-slate-700">
                    {t({ en: 'Linked to:', ar: 'مرتبط بـ:' })}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {linkedPlans.map(plan => (
                      <Badge key={plan.id} variant="secondary">
                        {language === 'ar' && plan?.['name_ar'] ? plan?.['name_ar'] : plan?.['name_en'] || plan?.['title_en']}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleGenerateAISummary}
                  disabled={lessons.length === 0 || isGeneratingLessonsSummary || aiLoading}
                  variant="outline"
                  className="w-full"
                >
                  {isGeneratingLessonsSummary ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Lightbulb className="h-4 w-4 mr-2" />
                  )}
                  {t({ en: 'Generate Strategic Summary', ar: 'توليد ملخص استراتيجي' })}
                </Button>

                {aiSummary && (
                  <div className="space-y-3">
                    {aiSummary.strategy_refinements?.length > 0 && (
                      <div className="p-3 bg-indigo-50 rounded-lg">
                        <h5 className="font-medium text-indigo-700 text-sm mb-2">
                          {t({ en: 'Strategy Refinements', ar: 'تحسينات الاستراتيجية' })}
                        </h5>
                        <ul className="text-sm space-y-1">
                          {aiSummary.strategy_refinements.map((item, i) => (
                            <li key={i}>• {language === 'ar' ? item.ar : item.en}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Button
                      onClick={handleFeedbackToStrategy}
                      disabled={false}
                      className="w-full bg-teal-600 hover:bg-teal-700"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {t({ en: 'Send Feedback to Strategic Plans', ar: 'إرسال الملاحظات للخطط الاستراتيجية' })}
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
