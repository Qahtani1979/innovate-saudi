import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '../LanguageContext';
import { BookOpen, Plus, X, AlertCircle } from 'lucide-react';

export default function LessonsLearnedEnforcer({ lessonsLearned, onChange, showValidation = false }) {
  const { language, isRTL, t } = useLanguage();

  const addLesson = () => {
    onChange([...(lessonsLearned || []), { category: '', lesson: '', recommendation: '' }]);
  };

  const updateLesson = (index, field, value) => {
    const updated = [...(lessonsLearned || [])];
    updated[index][field] = value;
    onChange(updated);
  };

  const removeLesson = (index) => {
    onChange((lessonsLearned || []).filter((_, i) => i !== index));
  };

  const isValid = lessonsLearned && lessonsLearned.length >= 1 && 
    lessonsLearned.every(l => l.lesson && l.recommendation);

  return (
    <Card className={showValidation && !isValid ? 'border-2 border-red-300' : ''} dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-600" />
            {t({ en: 'Lessons Learned', ar: 'الدروس المستفادة' })}
            <span className="text-red-600">*</span>
          </CardTitle>
          <Button size="sm" variant="outline" onClick={addLesson}>
            <Plus className="h-4 w-4 mr-2" />
            {t({ en: 'Add Lesson', ar: 'إضافة درس' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showValidation && !isValid && (
          <div className="p-3 bg-red-50 rounded-lg border border-red-200 flex items-center gap-2">
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
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm mb-3">
              {t({ en: 'No lessons captured yet', ar: 'لم يتم تسجيل دروس بعد' })}
            </p>
            <Button size="sm" onClick={addLesson} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              {t({ en: 'Add First Lesson', ar: 'إضافة أول درس' })}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {lessonsLearned.map((lesson, index) => (
              <div key={index} className="p-4 border rounded-lg bg-purple-50">
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-3">
                    <Input
                      value={lesson.category || ''}
                      onChange={(e) => updateLesson(index, 'category', e.target.value)}
                      placeholder={t({ en: 'Category (e.g., Process, Technology, Collaboration)', ar: 'الفئة (مثلاً، العملية، التقنية، التعاون)' })}
                    />
                    <Textarea
                      value={lesson.lesson || ''}
                      onChange={(e) => updateLesson(index, 'lesson', e.target.value)}
                      placeholder={t({ en: 'What was learned from this challenge... *', ar: 'ما تم تعلمه من هذا التحدي... *' })}
                      rows={2}
                      className={showValidation && !lesson.lesson ? 'border-red-300' : ''}
                    />
                    <Textarea
                      value={lesson.recommendation || ''}
                      onChange={(e) => updateLesson(index, 'recommendation', e.target.value)}
                      placeholder={t({ en: 'Recommendation for similar challenges in future... *', ar: 'توصية للتحديات المشابهة مستقبلاً... *' })}
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
      </CardContent>
    </Card>
  );
}