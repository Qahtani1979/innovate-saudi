import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Target, Sparkles, Loader2, Award, AlertCircle, TestTube } from 'lucide-react';
import { toast } from 'sonner';

export default function PriorityRecommendations() {
  const { language, isRTL, t } = useLanguage();
  const [generating, setGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState(null);

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges-priority'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots-priority'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const { data: municipalities = [] } = useQuery({
    queryKey: ['municipalities-priority'],
    queryFn: () => base44.entities.Municipality.list()
  });

  const generateRecommendations = async () => {
    setGenerating(true);
    try {
      const tier1Challenges = challenges.filter(c => c.priority === 'tier_1');
      const approvedChallenges = challenges.filter(c => c.status === 'approved');
      const lowMIIMunicipalities = municipalities.filter(m => (m.mii_score || 0) < 50);

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `As Saudi Arabia's national innovation strategist, recommend strategic priorities for the next quarter:

Current State:
- Tier 1 Challenges: ${tier1Challenges.length}
- Approved Challenges (no pilot yet): ${approvedChallenges.filter(c => !c.linked_pilot_ids?.length).length}
- Active Pilots: ${pilots.filter(p => p.stage === 'active').length}
- Pilots ready to scale: ${pilots.filter(p => p.stage === 'completed' && p.recommendation === 'scale').length}
- Low MII municipalities: ${lowMIIMunicipalities.length}

Provide 5 strategic priorities with:
1. Priority title
2. Rationale (why this matters now)
3. Quick wins (2-3 immediate actions)
4. Resource estimate (low/medium/high)
5. Expected impact (quantified if possible)
6. Timeline (weeks)`,
        response_json_schema: {
          type: 'object',
          properties: {
            priorities: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  rank: { type: 'number' },
                  rationale: { type: 'string' },
                  quick_wins: { type: 'array', items: { type: 'string' } },
                  resources_needed: { type: 'string' },
                  expected_impact: { type: 'string' },
                  timeline_weeks: { type: 'number' },
                  related_entities: { type: 'array', items: { type: 'string' } }
                }
              }
            }
          }
        }
      });

      setRecommendations(result.priorities);
      toast.success(t({ en: 'Strategic priorities generated', ar: 'تم توليد الأولويات الاستراتيجية' }));
    } catch (error) {
      toast.error(t({ en: 'Failed to generate', ar: 'فشل التوليد' }));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Target className="h-5 w-5" />
            {t({ en: 'AI Priority Recommendations', ar: 'توصيات الأولويات الذكية' })}
          </CardTitle>
          <Button
            onClick={generateRecommendations}
            disabled={generating}
            size="sm"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Generate', ar: 'توليد' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {generating ? (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-slate-600">{t({ en: 'Analyzing national priorities...', ar: 'تحليل الأولويات الوطنية...' })}</p>
          </div>
        ) : recommendations ? (
          <div className="space-y-4">
            {recommendations.map((priority, i) => (
              <div key={i} className="p-4 bg-white border-2 border-purple-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                    {priority.rank || i + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 mb-2">{priority.title}</h4>
                    <p className="text-sm text-slate-700 mb-3">{priority.rationale}</p>

                    <div className="mb-3">
                      <p className="text-xs font-semibold text-purple-800 mb-1">
                        {t({ en: '⚡ Quick Wins:', ar: '⚡ إنجازات سريعة:' })}
                      </p>
                      <ul className="text-sm space-y-1">
                        {priority.quick_wins?.map((win, j) => (
                          <li key={j} className="text-slate-700">✓ {win}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {priority.timeline_weeks} {t({ en: 'weeks', ar: 'أسبوع' })}
                      </Badge>
                      <Badge className={
                        priority.resources_needed === 'high' ? 'bg-red-100 text-red-700' :
                        priority.resources_needed === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }>
                        {priority.resources_needed} {t({ en: 'resources', ar: 'موارد' })}
                      </Badge>
                      {priority.expected_impact && (
                        <Badge className="bg-blue-100 text-blue-700">
                          <Award className="h-3 w-3 mr-1" />
                          {priority.expected_impact}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">
              {t({ en: 'Click to generate strategic priorities', ar: 'انقر لتوليد الأولويات الاستراتيجية' })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}