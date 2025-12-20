import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '@/components/LanguageContext';
import { Network, Sparkles } from 'lucide-react';

export default function ChallengeRelatedTab({ relations = [], allChallenges = [] }) {
  const { language, t } = useLanguage();

  const similarRelations = relations.filter(r => r.relation_role === 'similar_to');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5 text-teal-600" />
              {t({ en: 'Similar Challenges Network', ar: 'شبكة التحديات المشابهة' })}
            </div>
            <Link to={createPageUrl('RelationManagementHub')}>
              <Button className="bg-gradient-to-r from-teal-600 to-blue-600">
                <Network className="h-4 w-4 mr-2" />
                {t({ en: 'AI Matching Hub', ar: 'مركز المطابقة الذكية' })}
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {similarRelations.length > 0 ? (
            <div className="space-y-3">
              {similarRelations.map((rel) => {
                const similar = allChallenges.find(c => c.id === rel.related_entity_id);
                if (!similar) return null;
                
                return (
                  <Link
                    key={rel.id}
                    to={createPageUrl(`ChallengeDetail?id=${similar.id}`)}
                    className="block p-4 border rounded-lg hover:border-teal-300 hover:bg-teal-50 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="font-mono text-xs">{similar.code}</Badge>
                          <Badge variant="outline" className="text-xs">{similar.sector?.replace(/_/g, ' ')}</Badge>
                          {rel.created_via === 'ai' && (
                            <Badge className="text-xs bg-purple-100 text-purple-700">
                              <Sparkles className="h-3 w-3 mr-1" />
                              AI
                            </Badge>
                          )}
                        </div>
                        <p className="font-medium">{similar.title_en}</p>
                        <p className="text-xs text-muted-foreground mt-1">{similar.municipality_id}</p>
                        {rel.notes && (
                          <p className="text-xs text-muted-foreground mt-2">{rel.notes}</p>
                        )}
                      </div>
                      {rel.strength && (
                        <div className="text-right">
                          <div className="text-2xl font-bold text-teal-600">{Math.round(rel.strength)}%</div>
                          <div className="text-xs text-muted-foreground">{t({ en: 'Match', ar: 'تطابق' })}</div>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Network className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">
                {t({ en: 'No similar challenges mapped yet', ar: 'لم يتم رسم تحديات مشابهة بعد' })}
              </p>
              <Link to={createPageUrl('RelationManagementHub')}>
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t({ en: 'Discover Similar Challenges', ar: 'اكتشاف تحديات مشابهة' })}
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
