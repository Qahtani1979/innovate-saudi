import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from './LanguageContext';
import { CheckCircle2, Circle, Loader2, Rocket, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

function PilotPreparationChecklist({ pilot, onClose }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();

  const preparationTasks = [
    {
      id: 'finalize_team',
      category: 'team',
      label: { en: 'Finalize team assignments', ar: 'إتمام تعيينات الفريق' },
      required: true
    },
    {
      id: 'secure_budget',
      category: 'budget',
      label: { en: 'Secure budget approval & allocation', ar: 'تأمين موافقة وتخصيص الميزانية' },
      required: true
    },
    {
      id: 'setup_infrastructure',
      category: 'technical',
      label: { en: 'Set up technical infrastructure', ar: 'إعداد البنية التحتية التقنية' },
      required: true
    },
    {
      id: 'sign_agreements',
      category: 'legal',
      label: { en: 'Sign agreements with partners', ar: 'توقيع اتفاقيات مع الشركاء' },
      required: true
    },
    {
      id: 'obtain_permits',
      category: 'legal',
      label: { en: 'Obtain necessary permits', ar: 'الحصول على التصاريح اللازمة' },
      required: true
    },
    {
      id: 'configure_monitoring',
      category: 'technical',
      label: { en: 'Configure monitoring systems', ar: 'تكوين أنظمة المراقبة' },
      required: true
    },
    {
      id: 'stakeholder_briefing',
      category: 'communication',
      label: { en: 'Conduct stakeholder briefing', ar: 'إجراء إحاطة للأطراف المعنية' },
      required: false
    },
    {
      id: 'train_team',
      category: 'team',
      label: { en: 'Train team members', ar: 'تدريب أعضاء الفريق' },
      required: false
    },
    {
      id: 'prepare_communications',
      category: 'communication',
      label: { en: 'Prepare public communications', ar: 'تحضير الاتصالات العامة' },
      required: false
    },
    {
      id: 'setup_data_collection',
      category: 'technical',
      label: { en: 'Set up data collection tools', ar: 'إعداد أدوات جمع البيانات' },
      required: true
    }
  ];

  const [checklist, setChecklist] = useState(
    preparationTasks.reduce((acc, task) => ({ ...acc, [task.id]: false }), {})
  );

  const moveToPreparationMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Pilot.update(pilot.id, {
        stage: 'preparation',
        timeline: {
          ...pilot.timeline,
          prep_start: new Date().toISOString()
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pilot']);
      toast.success(t({ en: 'Moved to preparation stage', ar: 'تم الانتقال لمرحلة التحضير' }));
    }
  });

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const totalCount = preparationTasks.length;
  const requiredCompleted = preparationTasks
    .filter(t => t.required)
    .every(t => checklist[t.id]);
  const progress = (completedCount / totalCount) * 100;

  const categories = {
    team: { label: { en: 'Team', ar: 'الفريق' }, color: 'bg-purple-100 text-purple-700' },
    budget: { label: { en: 'Budget', ar: 'الميزانية' }, color: 'bg-green-100 text-green-700' },
    technical: { label: { en: 'Technical', ar: 'التقني' }, color: 'bg-blue-100 text-blue-700' },
    legal: { label: { en: 'Legal', ar: 'القانوني' }, color: 'bg-red-100 text-red-700' },
    communication: { label: { en: 'Communication', ar: 'الاتصالات' }, color: 'bg-amber-100 text-amber-700' }
  };

  return (
    <Card className="border-2 border-purple-300" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-purple-600" />
            {t({ en: 'Preparation Checklist', ar: 'قائمة التحضير' })}
          </CardTitle>
          <div className="text-right">
            <p className="text-2xl font-bold text-purple-600">{completedCount}/{totalCount}</p>
            <p className="text-xs text-slate-500">{t({ en: 'Tasks Complete', ar: 'مهمة مكتملة' })}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">{t({ en: 'Overall Progress', ar: 'التقدم الإجمالي' })}</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {!requiredCompleted && (
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
            <p className="text-xs text-amber-900">
              {t({ en: 'Complete all required tasks before proceeding', ar: 'أكمل جميع المهام المطلوبة قبل المتابعة' })}
            </p>
          </div>
        )}

        <div className="space-y-4">
          {Object.entries(categories).map(([catKey, catInfo]) => {
            const catTasks = preparationTasks.filter(t => t.category === catKey);
            if (catTasks.length === 0) return null;

            return (
              <div key={catKey} className="space-y-2">
                <Badge className={catInfo.color}>{catInfo.label[language]}</Badge>
                {catTasks.map(task => (
                  <div
                    key={task.id}
                    className={`p-3 border rounded-lg flex items-center justify-between transition-all ${
                      checklist[task.id] ? 'bg-green-50 border-green-300' : 'bg-white hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        onClick={() => setChecklist({ ...checklist, [task.id]: !checklist[task.id] })}
                        className="flex-shrink-0"
                      >
                        {checklist[task.id] ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-slate-400" />
                        )}
                      </button>
                      <div className="flex-1">
                        <p className={`text-sm ${checklist[task.id] ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                          {task.label[language]}
                        </p>
                        {task.required && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {t({ en: 'Required', ar: 'مطلوب' })}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        <div className="flex gap-2 pt-4 border-t">
          {pilot.stage === 'approved' && (
            <Button
              onClick={() => moveToPreparationMutation.mutate()}
              disabled={moveToPreparationMutation.isPending}
              variant="outline"
              className="flex-1"
            >
              {moveToPreparationMutation.isPending ? (
                <Loader2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
              ) : null}
              {t({ en: 'Start Preparation', ar: 'بدء التحضير' })}
            </Button>
          )}
          <Button
            onClick={onClose}
            disabled={!requiredCompleted}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
          >
            {t({ en: 'Save & Continue', ar: 'حفظ ومتابعة' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default PilotPreparationChecklist;