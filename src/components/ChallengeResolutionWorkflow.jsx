import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useLanguage } from './LanguageContext';
import { CheckCircle2, Plus, X, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useChallengeMutations } from '@/hooks/useChallengeMutations';
import CitizenClosureNotification from './challenges/CitizenClosureNotification';

export default function ChallengeResolutionWorkflow({ challenge, onClose }) {
  const { language, isRTL, t } = useLanguage();

  const [resolutionSummary, setResolutionSummary] = useState('');
  const [outcome, setOutcome] = useState('fully_resolved');
  const [impactAchieved, setImpactAchieved] = useState('');
  const [lessonsLearned, setLessonsLearned] = useState(challenge?.lessons_learned || []);
  const [showCitizenNotification, setShowCitizenNotification] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const { updateChallenge } = useChallengeMutations();

  const handleResolve = () => {
    updateChallenge.mutate({
      id: challenge.id,
      data: {
        status: 'resolved',
        resolution_date: new Date().toISOString(),
        resolution_summary: resolutionSummary,
        resolution_outcome: outcome,
        impact_achieved: impactAchieved,
        lessons_learned: lessonsLearned,
        metadata: {
          resolution_summary: resolutionSummary,
          impact_achieved: impactAchieved,
          resolution_outcome: outcome
        }
      }
    }, {
      onSuccess: () => {
        // Show citizen notification if challenge originated from idea
        if (challenge.citizen_origin_idea_id) {
          setShowCitizenNotification(true);
        } else {
          onClose();
        }
      }
    });
  };

  const addLesson = () => {
    setLessonsLearned([...lessonsLearned, {
      category: '',
      lesson: '',
      recommendation: ''
    }]);
  };

  const updateLesson = (index, field, value) => {
    const updated = [...lessonsLearned];
    updated[index][field] = value;
    setLessonsLearned(updated);
  };

  const removeLesson = (index) => {
    setLessonsLearned(lessonsLearned.filter((_, i) => i !== index));
  };

  if (showCitizenNotification) {
    return (
      <CitizenClosureNotification
        challenge={challenge}
        onSent={() => {
          setShowCitizenNotification(false);
          onClose();
        }}
      />
    );
  }

  return (
    <Card className="max-w-3xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            {t({ en: 'Resolve Challenge', ar: 'حل التحدي' })}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Challenge Info */}
        <div className="p-4 bg-slate-50 rounded-lg border">
          <p className="text-xs text-slate-500 mb-1">{challenge.code}</p>
          <p className="font-semibold text-slate-900">{challenge.title_en}</p>
          <Badge className="mt-2">{challenge.status}</Badge>
        </div>

        {/* Resolution Outcome */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {t({ en: 'Resolution Outcome', ar: 'نتيجة الحل' })}
          </label>
          <select
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="fully_resolved">{t({ en: 'Fully Resolved', ar: 'تم الحل بالكامل' })}</option>
            <option value="partially_resolved">{t({ en: 'Partially Resolved', ar: 'تم الحل جزئياً' })}</option>
            <option value="alternative_approach">{t({ en: 'Alternative Approach', ar: 'نهج بديل' })}</option>
            <option value="deferred">{t({ en: 'Deferred', ar: 'مؤجل' })}</option>
          </select>
        </div>

        {/* Resolution Summary */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {t({ en: 'Resolution Summary', ar: 'ملخص الحل' })}
          </label>
          <Textarea
            value={resolutionSummary}
            onChange={(e) => setResolutionSummary(e.target.value)}
            placeholder={t({ en: 'Describe how the challenge was addressed...', ar: 'صف كيف تمت معالجة التحدي...' })}
            rows={5}
          />
        </div>

        {/* Impact Achieved */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {t({ en: 'Impact Achieved', ar: 'التأثير المحقق' })}
          </label>
          <Textarea
            value={impactAchieved}
            onChange={(e) => setImpactAchieved(e.target.value)}
            placeholder={t({ en: 'Quantify the impact (e.g., complaints reduced by 40%)...', ar: 'قدّر التأثير (مثلاً، الشكاوى انخفضت بنسبة 40%)...' })}
            rows={3}
          />
        </div>

        {/* Lessons Learned - MANDATORY */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">
              {t({ en: 'Lessons Learned', ar: 'الدروس المستفادة' })} <span className="text-red-600">*</span>
            </label>
            <Button size="sm" variant="outline" onClick={addLesson}>
              <Plus className="h-4 w-4 mr-2" />
              {t({ en: 'Add Lesson', ar: 'إضافة درس' })}
            </Button>
          </div>

          {showValidation && (!lessonsLearned || lessonsLearned.length === 0 || !lessonsLearned.every(l => l.lesson && l.recommendation)) && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-700">
                {t({
                  en: 'At least 1 complete lesson is required to resolve this challenge',
                  ar: 'مطلوب درس واحد كامل على الأقل لحل هذا التحدي'
                })}
              </p>
            </div>
          )}

          {(!lessonsLearned || lessonsLearned.length === 0) ? (
            <div className="text-center py-6 bg-slate-50 rounded-lg border">
              <p className="text-sm text-slate-500">
                {t({ en: 'No lessons captured yet', ar: 'لم يتم تسجيل دروس بعد' })}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {lessonsLearned.map((lesson, index) => (
                <div key={index} className="p-3 border rounded-lg bg-purple-50">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-2">
                      <Input
                        value={lesson.category || ''}
                        onChange={(e) => updateLesson(index, 'category', e.target.value)}
                        placeholder={t({ en: 'Category (e.g., Process, Technology)', ar: 'الفئة (مثلاً، العملية، التقنية)' })}
                        className="text-sm"
                      />
                      <Textarea
                        value={lesson.lesson || ''}
                        onChange={(e) => updateLesson(index, 'lesson', e.target.value)}
                        placeholder={t({ en: 'What was learned... *', ar: 'ما تم تعلمه... *' })}
                        rows={2}
                        className={showValidation && !lesson.lesson ? 'border-red-300' : ''}
                      />
                      <Textarea
                        value={lesson.recommendation || ''}
                        onChange={(e) => updateLesson(index, 'recommendation', e.target.value)}
                        placeholder={t({ en: 'Recommendation for future... *', ar: 'توصية للمستقبل... *' })}
                        rows={2}
                        className={showValidation && !lesson.recommendation ? 'border-red-300' : ''}
                      />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeLesson(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
          <Button
            onClick={() => {
              const isValid = lessonsLearned && lessonsLearned.length >= 1 &&
                lessonsLearned.every(l => l.lesson && l.recommendation);
              if (!isValid) {
                setShowValidation(true);
                toast.error(t({ en: 'Please add at least 1 complete lesson', ar: 'يرجى إضافة درس واحد كامل على الأقل' }));
                return;
              }
              handleResolve();
            }}
            disabled={!resolutionSummary || !impactAchieved || updateChallenge.isPending}
            className="bg-gradient-to-r from-green-600 to-teal-600"
          >
            {updateChallenge.isPending ? (
              <Loader2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
            ) : (
              <CheckCircle2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            )}
            {t({ en: 'Mark as Resolved', ar: 'وضع علامة كمحلول' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}