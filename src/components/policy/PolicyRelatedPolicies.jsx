import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Network, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function PolicyRelatedPolicies({ policy }) {
  const { language, isRTL, t } = useLanguage();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [relatedPolicies, setRelatedPolicies] = useState([]);

  const { data: allPolicies = [] } = useQuery({
    queryKey: ['all-policies'],
    queryFn: () => base44.entities.PolicyRecommendation.list()
  });

  const findRelated = async () => {
    if (!policy.embedding) {
      return;
    }

    setIsAnalyzing(true);
    try {
      const similarities = allPolicies
        .filter(p => p.id !== policy.id && p.embedding)
        .map(p => {
          const similarity = cosineSimilarity(policy.embedding, p.embedding);
          return {
            policy: p,
            score: Math.round(similarity * 100),
            similarity
          };
        })
        .filter(s => s.score >= 60)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5);

      setRelatedPolicies(similarities);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const cosineSimilarity = (a, b) => {
    if (!a || !b || a.length !== b.length) return 0;
    let dotProduct = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  };

  React.useEffect(() => {
    if (policy.embedding && allPolicies.length > 0) {
      findRelated();
    }
  }, [policy.id, allPolicies.length]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5 text-purple-600" />
          {t({ en: 'Related Policies', ar: 'السياسات ذات الصلة' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isAnalyzing ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : relatedPolicies.length === 0 ? (
          <div className="text-center py-8">
            <Network className="h-12 w-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">
              {t({ en: 'No similar policies found', ar: 'لم يتم العثور على سياسات مشابهة' })}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {relatedPolicies.map(({ policy: p, score }) => (
              <Link key={p.id} to={createPageUrl(`PolicyDetail?id=${p.id}`)}>
                <div className="p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                     <p className="text-sm font-medium text-slate-900 mb-1" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                       {language === 'ar' && p.title_ar ? p.title_ar : p.title_en}
                     </p>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          {(p.workflow_stage || p.status)?.replace(/_/g, ' ')}
                        </Badge>
                        {p.regulatory_change_needed && (
                          <Badge className="bg-orange-100 text-orange-700 text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Reg. Change
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-3">
                      <div className="text-lg font-bold text-purple-600">{score}%</div>
                      <div className="text-xs text-slate-500">{t({ en: 'match', ar: 'تطابق' })}</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}