import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Sparkles, Network, Users, Target, TrendingUp, Loader2 } from 'lucide-react';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import {
  NETWORK_ANALYSIS_SYSTEM_PROMPT,
  createNetworkAnalysisPrompt,
  NETWORK_ANALYSIS_SCHEMA
} from '@/lib/ai/prompts/organizations';

import { useOrganizations } from '@/hooks/useOrganizations';
import { useSolutions } from '@/hooks/useSolutions';
import { usePilotsList } from '@/hooks/usePilots';
import { useRDProjects } from '@/hooks/useRDProjects';

export default function AINetworkAnalysis({ organization }) {
  const { t, isRTL, language } = useLanguage();
  const [analysis, setAnalysis] = useState(null);

  const { invokeAI, status, error, rateLimitInfo, isLoading: aiLoading, isAvailable } = useAIWithFallback({
    showToasts: true,
    fallbackData: null
  });

  // Fetch data using hooks
  const { data: orgs = [] } = useOrganizations();
  // useSolutions returns { solutions, isLoading... }
  const { solutions = [] } = useSolutions({ publishedOnly: false, limit: 1000 });
  const { data: pilots = [] } = usePilotsList();
  const { data: rdProjects = [] } = useRDProjects();

  const generateAnalysis = async () => {
    // Note: usePilotsList and useRDProjects fetched all, we filter here locally or if we had specific inputs we'd filter there.
    // Original code:
    // pilots.filter(p => p.provider_id === organization.id) - this was done in stats calc.
    // base44.entities.Solution.list().then(all => all.filter(s => s.provider_id === organization.id))

    // So we use the hook data directly.

    const orgSolutions = solutions.filter(s => s.provider_id === organization.id);
    const orgPilots = pilots.filter(p => p.provider_id === organization.id);
    // rdProjects? Original code fetched them but didn't seem to use them explicitly in 'stats' object, 
    // maybe used in prompt creation? 'createNetworkAnalysisPrompt' takes (organization, stats).
    // Let's assume prompt builder might need more or just the stats.
    // Checking prompt builder usage: createNetworkAnalysisPrompt(organization, stats)
    // The lists (orgs, solutions, pilots, rdProjects) were awaited but only `stats` passed to prompt?
    // Wait, the original code: 
    // const [orgs, solutions, pilots, rdProjects] = await Promise.all(...)
    // createNetworkAnalysisPrompt(organization, stats)
    // It seems the lists themselves weren't passed to the prompt builder?
    // Let's check 'stats' object construction: 
    // partnerCount: organization.partners?.length
    // pilotCount: pilots.filter...
    // solutionCount: solutions.length (this was filtered solutions)

    // So if prompt only needs stats, we are good.

    const stats = {
      partnerCount: organization.partners?.length || 0,
      pilotCount: orgPilots.length,
      solutionCount: orgSolutions.length
    };

    const result = await invokeAI({
      systemPrompt: NETWORK_ANALYSIS_SYSTEM_PROMPT,
      prompt: createNetworkAnalysisPrompt(organization, stats),
      response_json_schema: NETWORK_ANALYSIS_SCHEMA
    });

    if (result.success) {
      setAnalysis(result.data);
    }
  };

  const isLoading = aiLoading; // Align loading state

  return (
    <Card className="border-2 border-purple-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5 text-purple-600" />
          {t({ en: 'AI Network Analysis', ar: 'تحليل الشبكة الذكي' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} showDetails />

        {!analysis && (
          <div className="text-center py-8">
            <Button onClick={generateAnalysis} disabled={isLoading || !isAvailable} className="gap-2">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t({ en: 'AI Analyzing Network...', ar: 'الذكاء يحلل الشبكة...' })}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {t({ en: 'Generate Network Insights', ar: 'إنشاء رؤى الشبكة' })}
                </>
              )}
            </Button>
          </div>
        )}

        {analysis && (
          <div className="space-y-4">
            {/* Network Score */}
            <div className="p-4 bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">{t({ en: 'Network Centrality Score', ar: 'درجة مركزية الشبكة' })}</p>
                <Badge className="bg-purple-600 text-white">{analysis.centrality_score}/100</Badge>
              </div>
              <p className="text-xs text-slate-600 mb-2">{analysis.network_tier}</p>
              <div className="h-2 bg-purple-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full"
                  style={{ width: `${analysis.centrality_score}%` }}
                />
              </div>
            </div>

            {/* Strategic Position */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                {t({ en: 'Strategic Position', ar: 'الموقع الاستراتيجي' })}
              </p>
              <p className="text-sm text-slate-700">{analysis.strategic_position}</p>
            </div>

            {/* Recommended Partners */}
            <div>
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                {t({ en: 'Recommended Partnership Opportunities', ar: 'فرص الشراكة الموصى بها' })}
              </h4>
              <div className="space-y-2">
                {analysis.recommended_partners?.map((partner, i) => (
                  <div key={i} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">{partner.organization_type}</p>
                      <Badge className="bg-green-100 text-green-700">
                        Synergy: {partner.synergy_score}/100
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600">{partner.rationale}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Gaps */}
            <div>
              <h4 className="font-semibold text-sm mb-2">{t({ en: 'Collaboration Gaps', ar: 'فجوات التعاون' })}</h4>
              <div className="space-y-1">
                {analysis.collaboration_gaps?.map((gap, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>{gap}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Growth Recommendations */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                {t({ en: 'Growth Recommendations', ar: 'توصيات النمو' })}
              </h4>
              <ul className="space-y-1">
                {analysis.growth_recommendations?.map((rec, i) => (
                  <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                    <span className="text-green-600">→</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
