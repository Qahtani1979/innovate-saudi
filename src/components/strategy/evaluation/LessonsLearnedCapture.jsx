import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/components/LanguageContext';
import { useStrategyEvaluation } from '@/hooks/strategy/useStrategyEvaluation';
import {
  BookOpen, Plus, Lightbulb, Cog, Users, FileText,
  CheckCircle2, AlertTriangle, TrendingUp
} from 'lucide-react';

const LESSON_CATEGORIES = [
  { id: 'process', icon: Cog, color: 'blue' },
  { id: 'technology', icon: Lightbulb, color: 'purple' },
  { id: 'people', icon: Users, color: 'green' },
  { id: 'policy', icon: FileText, color: 'amber' }
];

export default function LessonsLearnedCapture({ entityType, entityId }) {
  const { t, language } = useLanguage();
  const { lessonsLearned, addLessonLearned } = useStrategyEvaluation(entityType, entityId);

  const [showForm, setShowForm] = useState(false);
  const [newLesson, setNewLesson] = useState({
    category: '',
    lesson: '',
    recommendation: ''
  });

  const categoryLabels = {
    process: { en: 'Process', ar: 'العملية' },
    technology: { en: 'Technology', ar: 'التكنولوجيا' },
    people: { en: 'People', ar: 'الأشخاص' },
    policy: { en: 'Policy', ar: 'السياسة' }
  };

  const handleSubmit = () => {
    if (!newLesson.category || !newLesson.lesson || !newLesson.recommendation) return;
    
    addLessonLearned(newLesson);
    setNewLesson({ category: '', lesson: '', recommendation: '' });
    setShowForm(false);
  };

  const getCategoryIcon = (categoryId) => {
    const category = LESSON_CATEGORIES.find(c => c.id === categoryId);
    return category?.icon || Lightbulb;
  };

  const getCategoryColor = (categoryId) => {
    const category = LESSON_CATEGORIES.find(c => c.id === categoryId);
    return category?.color || 'gray';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {t({ en: 'Lessons Learned', ar: 'الدروس المستفادة' })}
          </CardTitle>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-1" />
            {t({ en: 'Add Lesson', ar: 'إضافة درس' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Lesson Form */}
        {showForm && (
          <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
            <div className="space-y-2">
              <Label>{t({ en: 'Category', ar: 'الفئة' })}</Label>
              <Select
                value={newLesson.category}
                onValueChange={(value) => setNewLesson(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t({ en: 'Select category', ar: 'اختر الفئة' })} />
                </SelectTrigger>
                <SelectContent>
                  {LESSON_CATEGORIES.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <cat.icon className={`h-4 w-4 text-${cat.color}-600`} />
                        {t(categoryLabels[cat.id])}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t({ en: 'What was learned?', ar: 'ما الذي تم تعلمه؟' })}</Label>
              <Textarea
                value={newLesson.lesson}
                onChange={(e) => setNewLesson(prev => ({ ...prev, lesson: e.target.value }))}
                placeholder={t({ en: 'Describe the lesson learned...', ar: 'صف الدرس المستفاد...' })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>{t({ en: 'How to apply in future?', ar: 'كيف يمكن تطبيقه في المستقبل؟' })}</Label>
              <Textarea
                value={newLesson.recommendation}
                onChange={(e) => setNewLesson(prev => ({ ...prev, recommendation: e.target.value }))}
                placeholder={t({ en: 'Provide actionable recommendations...', ar: 'قدم توصيات قابلة للتنفيذ...' })}
                rows={2}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>
                {t({ en: 'Cancel', ar: 'إلغاء' })}
              </Button>
              <Button 
                size="sm" 
                onClick={handleSubmit}
                disabled={!newLesson.category || !newLesson.lesson || !newLesson.recommendation}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                {t({ en: 'Save Lesson', ar: 'حفظ الدرس' })}
              </Button>
            </div>
          </div>
        )}

        {/* Lessons List */}
        {lessonsLearned.length > 0 ? (
          <div className="space-y-3">
            {lessonsLearned.map((lesson, index) => {
              const Icon = getCategoryIcon(lesson.category);
              const color = getCategoryColor(lesson.category);
              
              return (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full bg-${color}-100`}>
                      <Icon className={`h-4 w-4 text-${color}-600`} />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-${color}-700 border-${color}-300`}>
                          {t(categoryLabels[lesson.category] || { en: lesson.category, ar: lesson.category })}
                        </Badge>
                        {lesson.added_at && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(lesson.added_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="font-medium">{lesson.lesson}</p>
                      <div className="flex items-start gap-2 p-2 bg-muted/50 rounded">
                        <TrendingUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">{lesson.recommendation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {t({ en: 'No lessons captured yet', ar: 'لم يتم تسجيل أي دروس بعد' })}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {t({ 
                en: 'Capture lessons learned to improve future initiatives', 
                ar: 'سجل الدروس المستفادة لتحسين المبادرات المستقبلية' 
              })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
