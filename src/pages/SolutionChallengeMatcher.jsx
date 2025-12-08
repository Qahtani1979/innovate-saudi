import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../components/LanguageContext';
import { Sparkles, Loader2, Target, FileText, Send, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';

function SolutionChallengeMatcher() {
  const { language, isRTL, t } = useLanguage();
  const [selectedSolution, setSelectedSolution] = useState(null);
  const [matching, setMatching] = useState(false);
  const [matches, setMatches] = useState([]);
  const [generatingProposal, setGeneratingProposal] = useState(null);
  const [proposalDraft, setProposalDraft] = useState(null);

  const { data: solutions = [] } = useQuery({
    queryKey: ['solutions-for-reverse-matching'],
    queryFn: async () => {
      const all = await base44.entities.Solution.list();
      return all.filter(s => s.is_verified && s.is_published);
    }
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges-for-reverse-matching'],
    queryFn: async () => {
      const all = await base44.entities.Challenge.list();
      return all.filter(c => c.is_published && ['approved', 'in_treatment'].includes(c.status));
    }
  });

  const createProposal = useMutation({
    mutationFn: (data) => base44.entities.ChallengeProposal.create(data),
    onSuccess: () => {
      toast.success(t({ en: 'Proposal created', ar: 'تم إنشاء المقترح' }));
      setProposalDraft(null);
    }
  });

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
      toast.success(t({ en: `Found ${scored.length} matching challenges`, ar: `تم إيجاد ${scored.length} تحديات` }));
    } catch (error) {
      toast.error(t({ en: 'Matching failed', ar: 'فشلت المطابقة' }));
    } finally {
      setMatching(false);
    }
  };

  const generateProposal = async (challenge) => {
    setGeneratingProposal(challenge.id);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a comprehensive proposal for this solution to address this challenge.

SOLUTION:
Name: ${selectedSolution.name_en}
Provider: ${selectedSolution.provider_name}
Description: ${selectedSolution.description_en}
Features: ${selectedSolution.features?.join(', ') || 'N/A'}
Maturity: ${selectedSolution.maturity_level}
TRL: ${selectedSolution.trl || 'N/A'}
Deployments: ${selectedSolution.deployment_count || 0}
Success Rate: ${selectedSolution.success_rate || 0}%

CHALLENGE:
Title: ${challenge.title_en}
Description: ${challenge.description_en}
Sector: ${challenge.sector}
Priority: ${challenge.priority}
Budget: ${challenge.budget_estimate || 'N/A'} SAR

Generate bilingual (English + Arabic) proposal:
1. Executive Summary (why this solution fits)
2. Technical Approach (how it addresses the challenge)
3. Implementation Plan (timeline, phases)
4. Expected Outcomes (KPIs, impact)
5. Budget Breakdown
6. Risk Mitigation
7. Provider Qualifications

Be persuasive and detailed.`,
        response_json_schema: {
          type: 'object',
          properties: {
            proposal_title_en: { type: 'string' },
            proposal_title_ar: { type: 'string' },
            executive_summary_en: { type: 'string' },
            executive_summary_ar: { type: 'string' },
            technical_approach_en: { type: 'string' },
            implementation_plan_en: { type: 'string' },
            expected_outcomes: { type: 'array', items: { type: 'string' } },
            budget_breakdown: { type: 'array', items: { type: 'object' } },
            risk_mitigation: { type: 'array', items: { type: 'string' } },
            qualifications_summary: { type: 'string' }
          }
        }
      });

      setProposalDraft({ ...result, challenge_id: challenge.id, challenge });
      toast.success(t({ en: 'Proposal generated', ar: 'تم توليد المقترح' }));
    } catch (error) {
      toast.error(t({ en: 'Generation failed', ar: 'فشل التوليد' }));
    } finally {
      setGeneratingProposal(null);
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
    });
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">
          {t({ en: 'Solution → Challenge Matcher', ar: 'مطابقة الحلول للتحديات' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Find challenges your solution can address + generate proposals', ar: 'اكتشف التحديات التي يمكن لحلك معالجتها + توليد المقترحات' })}
        </p>
      </div>

      {/* Proposal Draft Modal */}
      {proposalDraft && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-3xl w-full max-h-[90vh] overflow-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {t({ en: 'AI-Generated Proposal', ar: 'المقترح المولد' })}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setProposalDraft(null)}>
                  ✕
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
                  {t({ en: 'Submit Proposal', ar: 'إرسال المقترح' })}
                </Button>
                <Link to={createPageUrl('ProviderProposalWizard') + `?challenge_id=${proposalDraft.challenge_id}&solution_id=${selectedSolution.id}`}>
                  <Button variant="outline">
                    {t({ en: 'Edit in Full Wizard', ar: 'تعديل في المعالج' })}
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
              {t({ en: 'Select Solution', ar: 'اختر الحل' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {solutions.map((solution) => (
              <button
                key={solution.id}
                onClick={() => setSelectedSolution(solution)}
                className={`w-full p-3 text-left border-2 rounded-lg transition-all ${
                  selectedSolution?.id === solution.id
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
                      {t({ en: 'Finding matches...', ar: 'جاري البحث...' })}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      {t({ en: 'Find Matching Challenges', ar: 'ابحث عن التحديات' })}
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
                  {t({ en: 'Matching Challenges', ar: 'التحديات المطابقة' })} ({matches.length})
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
                          <span>• {challenge.sector?.replace(/_/g, ' ')}</span>
                          {challenge.budget_estimate && (
                            <span>• {(challenge.budget_estimate / 1000).toFixed(0)}K SAR</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Link to={createPageUrl(`ChallengeDetail?id=${challenge.id}`)}>
                          <Button size="sm" variant="outline">
                            {t({ en: 'View', ar: 'عرض' })}
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          onClick={() => generateProposal(challenge)}
                          disabled={generatingProposal === challenge.id}
                          className="bg-purple-600"
                        >
                          {generatingProposal === challenge.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-1" />
                              {t({ en: 'Generate', ar: 'توليد' })}
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