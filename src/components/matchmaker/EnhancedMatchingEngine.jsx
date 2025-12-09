import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useLanguage } from '../LanguageContext';
import { Network, Sparkles, Loader2, Target, MapPin, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function EnhancedMatchingEngine({ application, onMatchComplete }) {
  const { language, isRTL, t } = useLanguage();
  const [preferences, setPreferences] = useState({
    preferred_sectors: application.sectors || [],
    preferred_regions: [],
    min_score: 70,
    max_matches: 10,
    include_tier_1_only: false
  });
  const { invokeAI, status, isLoading: matching, isAvailable, rateLimitInfo } = useAIWithFallback();
  const [matches, setMatches] = useState([]);

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges-for-matching'],
    queryFn: () => base44.entities.Challenge.list('-overall_score', 100)
  });

  const runBilateralMatching = async () => {
    const filteredChallenges = challenges.filter(c => {
      if (preferences.include_tier_1_only && c.priority !== 'tier_1') return false;
      if (preferences.preferred_sectors.length > 0 && !preferences.preferred_sectors.includes(c.sector)) return false;
      return true;
    }).slice(0, 30);

    const result = await invokeAI({
      prompt: `Perform bilateral matching between this provider and available challenges:

PROVIDER:
- Organization: ${application.organization_name_en}
- Sectors: ${application.sectors?.join(', ')}
- Scope: ${application.geographic_scope?.join(', ')}
- Stage: ${application.company_stage}
- Total Score: ${application.evaluation_score?.total_score}
- Collaboration: ${application.collaboration_approach}

PREFERENCES:
- Min Score Threshold: ${preferences.min_score}
- Max Matches: ${preferences.max_matches}
- Tier 1 Only: ${preferences.include_tier_1_only}

AVAILABLE CHALLENGES:
${filteredChallenges.map(c => `- ${c.code}: ${c.title_en} (Sector: ${c.sector}, Priority: ${c.priority}, Score: ${c.overall_score})`).join('\n')}

Return top ${preferences.max_matches} matches with:
- challenge_code
- match_score (0-100)
- sector_fit (0-100)
- capability_fit (0-100)
- strategic_fit (0-100)
- match_rationale (1 sentence)`,
      response_json_schema: {
        type: 'object',
        properties: {
          matches: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                challenge_code: { type: 'string' },
                match_score: { type: 'number' },
                sector_fit: { type: 'number' },
                capability_fit: { type: 'number' },
                strategic_fit: { type: 'number' },
                match_rationale: { type: 'string' }
              }
            }
          }
        }
      }
    });

    if (result.success) {
      const enrichedMatches = (result.data?.matches || []).map(m => ({
        ...challenges.find(c => c.code === m.challenge_code),
        ...m
      })).filter(m => m.id);

      setMatches(enrichedMatches);
      toast.success(t({ en: `${enrichedMatches.length} matches found`, ar: `تم العثور على ${enrichedMatches.length} مطابقات` }));
    }
  };

  return (
    <Card className="border-2 border-purple-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5 text-purple-600" />
          {t({ en: 'Enhanced Matching Engine (AI)', ar: 'محرك المطابقة المحسّن (ذكاء)' })}
        </CardTitle>
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} className="mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preferences */}
        <div className="p-4 bg-white border-2 border-purple-200 rounded-lg space-y-4">
          <p className="font-medium text-sm">{t({ en: 'Matching Preferences:', ar: 'تفضيلات المطابقة:' })}</p>
          
          <div>
            <label className="text-xs text-slate-600">{t({ en: 'Minimum Match Score', ar: 'الحد الأدنى لدرجة المطابقة' })}</label>
            <div className="flex items-center gap-3 mt-2">
              <Slider
                value={[preferences.min_score]}
                onValueChange={([v]) => setPreferences({...preferences, min_score: v})}
                min={0}
                max={100}
                step={5}
                className="flex-1"
              />
              <span className="text-sm font-bold w-12">{preferences.min_score}</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-600 mb-2 block">{t({ en: 'Max Matches', ar: 'أقصى عدد مطابقات' })}</label>
            <input
              type="number"
              min="5"
              max="50"
              value={preferences.max_matches}
              onChange={(e) => setPreferences({...preferences, max_matches: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={preferences.include_tier_1_only}
              onCheckedChange={(checked) => setPreferences({...preferences, include_tier_1_only: checked})}
            />
            <label className="text-sm">{t({ en: 'Tier 1 Challenges Only', ar: 'تحديات المستوى 1 فقط' })}</label>
          </div>
        </div>

        <Button
          onClick={runBilateralMatching}
          disabled={matching}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {matching ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t({ en: 'Matching...', ar: 'جاري المطابقة...' })}</>
          ) : (
            <><Sparkles className="h-4 w-4 mr-2" />{t({ en: 'Run Bilateral Matching', ar: 'تشغيل المطابقة الثنائية' })}</>
          )}
        </Button>

        {matches.length > 0 && (
          <div className="space-y-3">
            <p className="font-medium text-sm">{t({ en: 'Match Results:', ar: 'نتائج المطابقة:' })} ({matches.length})</p>
            {matches.map((match, i) => (
              <Link key={i} to={createPageUrl(`ChallengeDetail?id=${match.id}`)}>
                <div className="p-4 border-2 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="font-mono text-xs">{match.code}</Badge>
                        <Badge variant="outline" className="text-xs">{match.sector?.replace(/_/g, ' ')}</Badge>
                      </div>
                      <p className="font-medium text-sm text-slate-900">{match.title_en}</p>
                      <p className="text-xs text-slate-600 mt-1">{match.match_rationale}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-purple-600">{match.match_score}</p>
                      <p className="text-xs text-slate-500">{t({ en: 'Match', ar: 'مطابقة' })}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div>
                      <p className="text-xs text-slate-500">{t({ en: 'Sector', ar: 'قطاع' })}</p>
                      <p className="text-sm font-bold">{match.sector_fit}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">{t({ en: 'Capability', ar: 'قدرة' })}</p>
                      <p className="text-sm font-bold">{match.capability_fit}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">{t({ en: 'Strategic', ar: 'استراتيجي' })}</p>
                      <p className="text-sm font-bold">{match.strategic_fit}</p>
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