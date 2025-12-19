import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '@/components/LanguageContext';
import { Network, BookOpen } from 'lucide-react';

export default function ChallengeKnowledgeTab({ challenge, relations = [], allChallenges = [] }) {
  const { language, t } = useLanguage();

  const similarRelations = relations.filter(r => r.relation_role === 'similar_to');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-600" />
            {t({ en: 'Lessons Learned', ar: 'الدروس المستفادة' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {challenge.lessons_learned && challenge.lessons_learned.length > 0 ? (
            <div className="space-y-3">
              {challenge.lessons_learned.map((lesson, i) => (
                <div key={i} className="p-4 border-l-4 border-indigo-500 bg-indigo-50 rounded-r-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">{lesson.category}</Badge>
                  </div>
                  <p className="text-sm font-medium mb-1">{lesson.lesson}</p>
                  {lesson.recommendation && (
                    <p className="text-sm text-muted-foreground mt-2">
                      <span className="font-semibold text-indigo-700">Recommendation:</span> {lesson.recommendation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">{t({ en: 'Lessons will be captured when challenge is resolved', ar: 'سيتم تسجيل الدروس عند حل التحدي' })}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {similarRelations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5 text-teal-600" />
              {t({ en: 'Cross-City Learning', ar: 'التعلم بين المدن' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {t({ en: 'How other cities tackled similar challenges:', ar: 'كيف تعاملت المدن الأخرى مع تحديات مشابهة:' })}
            </p>
            <div className="space-y-3">
              {similarRelations.slice(0, 3).map((rel) => {
                const similar = allChallenges.find(c => c.id === rel.related_entity_id);
                if (!similar) return null;
                
                return (
                  <div key={rel.id} className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm">{similar.title_en}</p>
                        <p className="text-xs text-muted-foreground">{similar.municipality_id}</p>
                      </div>
                      <Badge className={
                        similar.status === 'resolved' ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                      }>
                        {similar.status}
                      </Badge>
                    </div>
                    {similar.status === 'resolved' && similar.lessons_learned?.length > 0 && (
                      <div className="mt-2 p-2 bg-white rounded text-xs">
                        <p className="font-semibold text-teal-700 mb-1">{t({ en: 'Key Lesson:', ar: 'درس رئيسي:' })}</p>
                        <p className="text-muted-foreground">{similar.lessons_learned[0].lesson}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
