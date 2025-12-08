import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Users, Sparkles, Loader2, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { toast } from 'sonner';

export default function ResearcherMunicipalityMatcher({ researcherProfile }) {
  const { language, isRTL, t } = useLanguage();
  const [matching, setMatching] = useState(false);
  const [matches, setMatches] = useState([]);

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const { data: municipalities = [] } = useQuery({
    queryKey: ['municipalities'],
    queryFn: () => base44.entities.Municipality.list()
  });

  const findMatches = async () => {
    setMatching(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Match researcher with municipalities that have challenges in their expertise:

RESEARCHER: ${researcherProfile.full_name_en}
EXPERTISE: ${researcherProfile.research_areas?.join(', ')}
KEYWORDS: ${researcherProfile.expertise_keywords?.join(', ')}

CHALLENGES (sample):
${challenges.slice(0, 20).map(c => `- ${c.municipality_id}: ${c.title_en} (${c.sector})`).join('\n')}

Find top 5 municipalities with matching challenges. For each:
1. Municipality name
2. Number of relevant challenges
3. Match reason
4. Collaboration opportunity`,
        response_json_schema: {
          type: "object",
          properties: {
            matches: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  municipality: { type: "string" },
                  challenge_count: { type: "number" },
                  match_score: { type: "number" },
                  reason: { type: "string" },
                  opportunity: { type: "string" }
                }
              }
            }
          }
        }
      });

      setMatches(response.matches || []);
      toast.success(t({ en: 'Matches found', ar: 'وُجدت مطابقات' }));
    } catch (error) {
      toast.error(t({ en: 'Matching failed', ar: 'فشلت المطابقة' }));
    } finally {
      setMatching(false);
    }
  };

  return (
    <Card className="border-2 border-blue-300">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            {t({ en: 'Municipality Collaboration Matcher', ar: 'مطابق التعاون مع البلديات' })}
          </CardTitle>
          <Button onClick={findMatches} disabled={matching} size="sm" className="bg-blue-600">
            {matching ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Find Matches', ar: 'ابحث عن مطابقات' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {!matches.length && !matching && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-blue-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'Find municipalities that need your research expertise', ar: 'ابحث عن البلديات التي تحتاج خبرتك البحثية' })}
            </p>
          </div>
        )}

        {matches.length > 0 && (
          <div className="space-y-3">
            {matches.map((match, idx) => (
              <div key={idx} className="p-4 border-2 border-blue-200 rounded-lg bg-white hover:border-blue-400 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{match.municipality}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-blue-100 text-blue-700">
                        {match.challenge_count} challenges
                      </Badge>
                      <span className="text-2xl font-bold text-green-600">{match.match_score}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                    <p className="font-medium text-blue-900 mb-1">{t({ en: 'Why Match:', ar: 'لماذا المطابقة:' })}</p>
                    <p className="text-slate-700">{match.reason}</p>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded border border-green-200">
                    <p className="font-medium text-green-900 mb-1">{t({ en: 'Opportunity:', ar: 'الفرصة:' })}</p>
                    <p className="text-slate-700">{match.opportunity}</p>
                  </div>
                </div>

                <Button size="sm" className="mt-3 w-full bg-gradient-to-r from-blue-600 to-indigo-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {t({ en: 'Request Introduction', ar: 'طلب تعريف' })}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}