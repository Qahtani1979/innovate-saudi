import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { AlertTriangle, ExternalLink, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function SimilarPolicyDetector({ policyData, onDismiss }) {
  const { language, isRTL, t } = useLanguage();
  const [similarPolicies, setSimilarPolicies] = useState([]);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    checkSimilarPolicies();
  }, [policyData.title_ar, policyData.recommendation_text_ar]);

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

  const checkSimilarPolicies = async () => {
    if (!policyData.title_ar && !policyData.recommendation_text_ar) return;

    setIsChecking(true);
    try {
      const allPolicies = await base44.entities.PolicyRecommendation.list();
      
      // Strategy 1: Use embeddings if available (most accurate)
      if (policyData.embedding && policyData.embedding.length > 0) {
        const withEmbeddings = allPolicies.filter(p => 
          p.embedding && p.embedding.length > 0 && p.id !== policyData.id
        );
        
        const scored = withEmbeddings.map(p => ({
          policy: p,
          score: Math.round(cosineSimilarity(policyData.embedding, p.embedding) * 100)
        }))
        .filter(s => s.score >= 70)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

        if (scored.length > 0) {
          setSimilarPolicies(scored.map(s => ({ ...s.policy, similarity_score: s.score })));
          setIsChecking(false);
          return;
        }
      }

      // Strategy 2: AI-powered semantic analysis (for new policies without embeddings)
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this new policy and find semantically similar policies from the database:

NEW POLICY:
Title AR: ${policyData.title_ar}
Recommendation AR: ${policyData.recommendation_text_ar}
Framework: ${policyData.regulatory_framework || 'N/A'}
Type: ${policyData.policy_type || 'N/A'}

EXISTING POLICIES DATABASE (${allPolicies.length} policies):
${allPolicies.slice(0, 50).map(p => `
ID: ${p.id}
Title AR: ${p.title_ar}
Title EN: ${p.title_en}
Recommendation AR: ${p.recommendation_text_ar?.substring(0, 200)}
Type: ${p.policy_type}
Framework: ${p.regulatory_framework}
`).join('\n---\n')}

Return the IDs of the 3 most semantically similar policies with similarity scores (0-100). Consider:
- Subject matter overlap
- Regulatory framework similarity
- Policy type alignment
- Stakeholder impact similarity

Only return policies with >60% similarity.`,
        response_json_schema: {
          type: 'object',
          properties: {
            similar_policies: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  policy_id: { type: 'string' },
                  similarity_score: { type: 'number' },
                  reason: { type: 'string' }
                }
              }
            }
          }
        }
      });

      const similarWithScores = result.similar_policies
        .map(s => {
          const policy = allPolicies.find(p => p.id === s.policy_id);
          return policy ? { ...policy, similarity_score: s.similarity_score, similarity_reason: s.reason } : null;
        })
        .filter(Boolean);

      setSimilarPolicies(similarWithScores);
    } catch (error) {
      console.error('Similar policy check failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <Card className="border-2 border-yellow-200 bg-yellow-50">
        <CardContent className="pt-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-yellow-600 mx-auto mb-2" />
          <p className="text-sm text-slate-600">
            {t({ en: 'Checking for similar policies...', ar: 'التحقق من السياسات المشابهة...' })}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (similarPolicies.length === 0) return null;

  return (
    <Card className="border-2 border-orange-200 bg-orange-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            {t({ en: 'Similar Policies Found', ar: 'عثر على سياسات مشابهة' })}
          </CardTitle>
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              {t({ en: 'Dismiss', ar: 'تجاهل' })}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-orange-900">
          {t({ 
            en: 'These existing policies may be related. Review them to avoid duplication.',
            ar: 'قد تكون هذه السياسات الحالية ذات صلة. راجعها لتجنب التكرار.'
          })}
        </p>
        
        <div className="space-y-2">
          {similarPolicies.map(policy => (
            <div key={policy.id} className="p-3 bg-white border border-orange-200 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {policy.code && (
                      <Badge variant="outline" className="text-xs font-mono">{policy.code}</Badge>
                    )}
                    {policy.similarity_score && (
                      <Badge className="text-xs bg-teal-600 text-white">
                        {policy.similarity_score}% {t({ en: 'match', ar: 'تطابق' })}
                      </Badge>
                    )}
                    <Badge className="text-xs bg-orange-100 text-orange-700">
                      {policy.workflow_stage || policy.status}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-slate-900">
                    {language === 'ar' && policy.title_ar ? policy.title_ar : policy.title_en}
                  </p>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {language === 'ar' && policy.recommendation_text_ar 
                      ? policy.recommendation_text_ar 
                      : policy.recommendation_text_en}
                  </p>
                  {policy.similarity_reason && (
                    <p className="text-xs text-blue-700 mt-2 italic">
                      💡 {policy.similarity_reason}
                    </p>
                  )}
                </div>
                <Link to={createPageUrl(`PolicyDetail?id=${policy.id}`)} target="_blank">
                  <Button size="sm" variant="ghost">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}