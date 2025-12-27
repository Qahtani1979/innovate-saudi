import { useState } from 'react';
import { useMatchingEntities } from '@/hooks/useMatchingEntities';
import { useProposals } from '@/hooks/useProposals';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import { Sparkles, Loader2, Target, Send, CheckCircle2, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

function SolutionChallengeMatcher() {
  const { language, isRTL, t } = useLanguage();
  const [selectedSolution, setSelectedSolution] = useState(null);
  const [matching, setMatching] = useState(false);
  const [matches, setMatches] = useState([]);
  const [proposalDraft, setProposalDraft] = useState(null);
  const { invokeAI, status: aiStatus, isLoading: generatingProposal, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { useSubmitProposal } = useProposals();
  const createProposal = useSubmitProposal();

  const { useSolutions, useChallenges } = useMatchingEntities();

  const { data: solutions = [] } = useSolutions({ limit: 1000 });

  // Note: Original query filtered challenges by status and is_published.
  // The hook filters by is_deleted=false. I need to filter locally or improve hook.
  // Hook: .eq('is_deleted', false).
  // Original: .in('status', ['approved', 'in_treatment']).eq('is_published', true).
  // I will fetch all (limit 1000) and filter locally to preserve logic, OR add filter options to hook.
  // For now local filter is safer to avoid changing hook logic too much for one page.
  const { data: allChallenges = [] } = useChallenges({ limit: 1000, published: true });
  const challenges = allChallenges.filter(c =>
    ['approved', 'in_treatment'].includes(c.status)
  );

  const runReverseMatching = async () => {
    if (!selectedSolution) return;

    setMatching(true);
    try {
      const scored = challenges.map(challenge => {
        let score = 0;

        // Sector match
        if (selectedSolution.sectors?.includes(challenge.sector)) score += 40;

        // Maturity alignment
        if (['market_ready', 'proven'].includes(selectedSolution.maturity_level)) score += 20;

        // TRL alignment
        if (selectedSolution.trl >= 7) score += 15;

        // Priority boost
        if (challenge.priority === 'tier_1') score += 15;

        // Budget alignment (if solution has pricing)
        if (challenge.budget_estimate && selectedSolution.pricing_details?.monthly_cost) {
          const affordability = (selectedSolution.pricing_details.monthly_cost * 12) / challenge.budget_estimate;
          if (affordability < 0.5) score += 10;
        }

        return { ...challenge, match_score: score };
      })
        .filter(c => c.match_score > 30)
        .sort((a, b) => b.match_score - a.match_score)
        .slice(0, 10);

      setMatches(scored);
      toast.success(t({ en: `Found ${scored.length} matching challenges`, ar: `ØªÙ… Ø¥ÙŠØ¬Ø§Ø¯ ${scored.length} ØªØ­Ø¯ÙŠØ§Øª` }));
    } catch (error) {
      toast.error(t({ en: 'Matching failed', ar: 'ÙØ´Ù„Øª Ø§Ù„Ù…Ø·Ø§Ø¨Ù‚Ø©' }));
    } finally {
      setMatching(false);
    }
  };

  const generateProposal = async (challenge) => {
    const { solutionPrompts, SOLUTION_SYSTEM_PROMPT } = await import('@/lib/ai/prompts/innovation/solutionPrompts');
    const { buildPrompt } = await import('@/lib/ai/promptBuilder');

    const { prompt, schema } = buildPrompt(solutionPrompts.automatedMatching, {
      solution: selectedSolution,
      challenge
    });

    const result = await invokeAI({
      prompt,
      response_json_schema: schema,
      system_prompt: SOLUTION_SYSTEM_PROMPT
    });

    if (result.success) {
      setProposalDraft({ ...result.data, challenge_id: challenge.id, challenge });
      toast.success(t({ en: 'Proposal generated', ar: 'ØªÙ… ØªÙˆÙ„ÙŠØ¯ Ø§Ù„Ù…Ù‚ØªØ±Ø­' }));
    }
  };

  const submitProposal = () => {
    createProposal.mutate({
      challenge_id: proposalDraft.challenge_id,
      solution_id: selectedSolution.id,
      provider_id: selectedSolution.provider_id,
      proposal_title: proposalDraft.proposal_title_en,
      executive_summary: proposalDraft.executive_summary_en,
      technical_approach: proposalDraft.technical_approach_en,
      implementation_plan: proposalDraft.implementation_plan_en,
      expected_outcomes: proposalDraft.expected_outcomes,
      status: 'submitted',
      submitted_date: new Date().toISOString()
    }, {
      onSuccess: () => {
        setProposalDraft(null);
      }
    });
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">
          {t({ en: 'Solution â†’ Challenge Matcher', ar: 'Ù…Ø·Ø§Ø¨Ù‚Ø© Ø§Ù„Ø­Ù„ÙˆÙ„ Ù„Ù„ØªØ­Ø¯ÙŠØ§Øª' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Find challenges your solution can address + generate proposals', ar: 'Ø§ÙƒØªØ´Ù Ø§Ù„ØªØ­Ø¯ÙŠØ§Øª Ø§Ù„ØªÙŠ ÙŠÙ…ÙƒÙ† Ù„Ø­Ù„Ùƒ Ù…Ø¹Ø§Ù„Ø¬ØªÙ‡Ø§ + ØªÙˆÙ„ÙŠØ¯ Ø§Ù„Ù…Ù‚ØªØ±Ø­Ø§Øª' })}
        </p>
      </div>

      <AIStatusIndicator status={aiStatus} rateLimitInfo={rateLimitInfo} error={null} />

      {/* Proposal Draft Modal */}
      {proposalDraft && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-3xl w-full max-h-[90vh] overflow-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {t({ en: 'AI-Generated Proposal', ar: 'Ø§Ù„Ù…Ù‚ØªØ±Ø­ Ø§Ù„Ù…ÙˆÙ„Ø¯' })}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setProposalDraft(null)}>
                  âœ•
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-1">Title:</p>
                <p className="text-lg font-bold text-slate-900">{proposalDraft.proposal_title_en}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700 mb-1">Executive Summary:</p>
                <div className="p-3 bg-slate-50 rounded border text-sm text-slate-800">
                  {proposalDraft.executive_summary_en}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700 mb-1">Technical Approach:</p>
                <div className="p-3 bg-slate-50 rounded border text-sm text-slate-800">
                  {proposalDraft.technical_approach_en}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700 mb-1">Expected Outcomes:</p>
                <ul className="space-y-1">
                  {proposalDraft.expected_outcomes?.map((outcome, i) => (
                    <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-3">
                <Button onClick={submitProposal} disabled={createProposal.isPending} className="flex-1 bg-purple-600">
                  <Send className="h-4 w-4 mr-2" />
                  {t({ en: 'Submit Proposal', ar: 'Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ù…Ù‚ØªØ±Ø­' })}
                </Button>
                <Link to={createPageUrl('ProviderProposalWizard') + `?challenge_id=${proposalDraft.challenge_id}&solution_id=${selectedSolution.id}`}>
                  <Button variant="outline">
                    {t({ en: 'Edit in Full Wizard', ar: 'ØªØ¹Ø¯ÙŠÙ„ ÙÙŠ Ø§Ù„Ù…Ø¹Ø§Ù„Ø¬' })}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Solution Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-purple-600" />
              {t({ en: 'Select Solution', ar: 'Ø§Ø®ØªØ± Ø§Ù„Ø­Ù„' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {solutions.map((solution) => (
              <button
                key={solution.id}
                onClick={() => setSelectedSolution(solution)}
                className={`w-full p-3 text-left border-2 rounded-lg transition-all ${selectedSolution?.id === solution.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-slate-200 hover:border-purple-300'
                  }`}
              >
                <p className="text-sm font-medium text-slate-900 line-clamp-2 mb-1">
                  {language === 'ar' && solution.name_ar ? solution.name_ar : solution.name_en}
                </p>
                <p className="text-xs text-slate-600">{solution.provider_name}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">{solution.maturity_level}</Badge>
                  {solution.is_verified && (
                    <Badge className="bg-green-100 text-green-700 text-xs">
                      <CheckCircle2 className="h-3 w-3" />
                    </Badge>
                  )}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Matching Results */}
        <div className="lg:col-span-2 space-y-6">
          {selectedSolution && (
            <Card className="border-2 border-purple-400">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-purple-600" />
                  {language === 'ar' && selectedSolution.name_ar ? selectedSolution.name_ar : selectedSolution.name_en}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={runReverseMatching}
                  disabled={matching}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  {matching ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t({ en: 'Finding matches...', ar: 'Ø¬Ø§Ø±ÙŠ Ø§Ù„Ø¨Ø­Ø«...' })}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      {t({ en: 'Find Matching Challenges', ar: 'Ø§Ø¨Ø­Ø« Ø¹Ù† Ø§Ù„ØªØ­Ø¯ÙŠØ§Øª' })}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {matches.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  {t({ en: 'Matching Challenges', ar: 'Ø§Ù„ØªØ­Ø¯ÙŠØ§Øª Ø§Ù„Ù…Ø·Ø§Ø¨Ù‚Ø©' })} ({matches.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {matches.map((challenge, idx) => (
                  <div key={challenge.id} className="p-4 border-2 rounded-lg hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-blue-100 text-blue-700 text-xs">
                            #{idx + 1}
                          </Badge>
                          <Badge className="bg-purple-100 text-purple-700 text-xs">
                            {challenge.match_score}% match
                          </Badge>
                          <Badge variant="outline" className="text-xs font-mono">{challenge.code}</Badge>
                          {challenge.priority === 'tier_1' && (
                            <Badge className="bg-red-100 text-red-700 text-xs">High Priority</Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-slate-900 mb-1">
                          {language === 'ar' && challenge.title_ar ? challenge.title_ar : challenge.title_en}
                        </h3>
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {language === 'ar' && challenge.description_ar
                            ? challenge.description_ar.substring(0, 150)
                            : challenge.description_en?.substring(0, 150)}...
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                          <span>{challenge.municipality_id?.substring(0, 25)}</span>
                          <span>â€¢ {challenge.sector?.replace(/_/g, ' ')}</span>
                          {challenge.budget_estimate && (
                            <span>â€¢ {(challenge.budget_estimate / 1000).toFixed(0)}K SAR</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Link to={createPageUrl(`ChallengeDetail?id=${challenge.id}`)}>
                          <Button size="sm" variant="outline">
                            {t({ en: 'View', ar: 'Ø¹Ø±Ø¶' })}
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          onClick={() => generateProposal(challenge)}
                          disabled={generatingProposal || !isAvailable}
                          className="bg-purple-600"
                        >
                          {generatingProposal ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-1" />
                              {t({ en: 'Generate', ar: 'ØªÙˆÙ„ÙŠØ¯' })}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    <Progress value={challenge.match_score} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProtectedPage(SolutionChallengeMatcher, { requiredPermissions: ['solution_view_all'] });
