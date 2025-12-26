import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { BookOpen, ExternalLink, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { useKnowledgeDocuments } from '@/hooks/useKnowledgeDocuments';

export default function ContextualKnowledgeWidget({ context }) {
  const { language, t } = useLanguage();
  const [recommendations, setRecommendations] = useState([]);

  const { useAllDocuments } = useKnowledgeDocuments();
  const { data: allDocs = [] } = useAllDocuments();

  useEffect(() => {
    if (context?.entityType && context?.sector && allDocs.length > 0) {
      const relevant = allDocs
        .filter(doc => {
          const sectorMatch = doc.sector === context.sector;
          const typeMatch = doc.type?.includes(context.entityType);
          return sectorMatch || typeMatch;
        })
        .slice(0, 3);

      setRecommendations(relevant);
    }
  }, [context, allDocs]);

  if (recommendations.length === 0) return null;

  return (
    <Card className="border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Lightbulb className="h-4 w-4 text-indigo-600" />
          {t({ en: '📚 Suggested Reading', ar: '📚 قراءة مقترحة' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {recommendations.map((doc) => (
          <Link
            key={doc.id}
            to={createPageUrl(`KnowledgeDocumentDetail?id=${doc.id}`)}
            className="block p-3 bg-white rounded-lg border hover:border-indigo-400 hover:bg-indigo-50 transition-all"
          >
            <div className="flex items-start gap-2">
              <BookOpen className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-slate-900 line-clamp-2">
                  {language === 'ar' && doc.title_ar ? doc.title_ar : doc.title_en}
                </p>
                {doc.type && (
                  <Badge variant="outline" className="text-xs mt-1">{doc.type}</Badge>
                )}
              </div>
              <ExternalLink className="h-3 w-3 text-slate-400 flex-shrink-0" />
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
