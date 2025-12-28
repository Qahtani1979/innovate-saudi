import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from './LanguageContext';
import { Award, X, Loader2 } from 'lucide-react';

import { useProgramApplications } from '@/hooks/useProgramDetails';
import { useProgramMutations } from '@/hooks/useProgramMutations';

export default function ProgramCompletionWorkflow({ program, onClose }) {
  const { t, isRTL } = useLanguage();

  const { data: participants = [] } = useProgramApplications(program?.id);
  const { completeProgram, isCompleting } = useProgramMutations();

  const [completionData, setCompletionData] = useState({
    completion_summary: '',
    key_achievements: '',
    challenges_faced: '',
    lessons_learned: '',
    pilot_conversions: 0,
    partnerships_formed: 0,
    solutions_deployed: 0,
    post_program_plan: ''
  });

  const [completionChecklist, setCompletionChecklist] = useState({
    all_sessions_delivered: false,
    participant_feedback_collected: false,
    final_presentations_done: false,
    outcomes_documented: false,
    certificates_issued: false,
    final_report_prepared: false
  });

  const handleComplete = async () => {
    try {
      await completeProgram.mutateAsync({
        programId: program.id,
        completionData,
        completionChecklist
      });
      onClose();
    } catch (error) {
      // toast is handled by hook
    }
  };

  const allRequiredChecked = Object.values(completionChecklist).filter(Boolean).length >= 4;

  return (
    <Card className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-green-600" />
          {t({ en: 'Complete Program', ar: 'إكمال البرنامج' })}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm font-medium text-green-900">{program?.name_en}</p>
          <p className="text-xs text-slate-600 mt-1">{participants.length} participants completed</p>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {t({ en: 'Completion Summary', ar: 'ملخص الإكمال' })}
          </label>
          <Textarea
            value={completionData.completion_summary}
            onChange={(e) => setCompletionData({ ...completionData, completion_summary: e.target.value })}
            rows={3}
            placeholder={t({ en: 'Summary of program outcomes...', ar: 'ملخص نتائج البرنامج...' })}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">
              {t({ en: 'Pilots Created', ar: 'التجارب المنشأة' })}
            </label>
            <input
              type="number"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={completionData.pilot_conversions}
              onChange={(e) => setCompletionData({ ...completionData, pilot_conversions: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">
              {t({ en: 'Partnerships', ar: 'الشراكات' })}
            </label>
            <input
              type="number"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={completionData.partnerships_formed}
              onChange={(e) => setCompletionData({ ...completionData, partnerships_formed: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 mb-1 block">
              {t({ en: 'Deployments', ar: 'النشر' })}
            </label>
            <input
              type="number"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={completionData.solutions_deployed}
              onChange={(e) => setCompletionData({ ...completionData, solutions_deployed: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {t({ en: 'Lessons Learned', ar: 'الدروس المستفادة' })}
          </label>
          <Textarea
            value={completionData.lessons_learned}
            onChange={(e) => setCompletionData({ ...completionData, lessons_learned: e.target.value })}
            rows={3}
            placeholder={t({ en: 'Key learnings from this program...', ar: 'التعلمات الرئيسية من البرنامج...' })}
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-900">
            {t({ en: 'Completion Checklist', ar: 'قائمة الإكمال' })}
          </p>
          {Object.entries({
            all_sessions_delivered: t({ en: 'All sessions delivered', ar: 'جميع الجلسات منفذة' }),
            participant_feedback_collected: t({ en: 'Feedback collected', ar: 'التغذية الراجعة مجمعة' }),
            final_presentations_done: t({ en: 'Final presentations completed', ar: 'العروض النهائية مكتملة' }),
            outcomes_documented: t({ en: 'Outcomes documented', ar: 'النتائج موثقة' }),
            certificates_issued: t({ en: 'Certificates issued', ar: 'الشهادات صادرة' }),
            final_report_prepared: t({ en: 'Final report prepared', ar: 'التقرير النهائي جاهز' })
          }).map(([key, label]) => (
            <div key={key} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50">
              <Checkbox
                checked={completionChecklist[key]}
                onCheckedChange={(checked) =>
                  setCompletionChecklist({ ...completionChecklist, [key]: checked })
                }
              />
              <p className="text-sm text-slate-900">{label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={handleComplete}
            disabled={!allRequiredChecked || isCompleting}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {isCompleting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Award className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Mark as Completed', ar: 'وضع علامة كمكتمل' })}
          </Button>
          <Button variant="outline" onClick={onClose}>
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
