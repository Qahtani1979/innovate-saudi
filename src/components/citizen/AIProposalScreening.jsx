import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, CheckCircle2, AlertTriangle, XCircle, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';
import useAIWithFallback, { AI_STATUS } from '@/hooks/useAIWithFallback';
import AIStatusIndicator, { AIOptionalBadge } from '@/components/ai/AIStatusIndicator';
import {
  generateProposalScreeningPrompt,
  getProposalScreeningSchema,
  getProposalScreeningSystemPrompt
} from '@/lib/ai/prompts/citizen';

export default function AIProposalScreening({ proposal, onScreeningComplete }) {
  const [screeningResults, setScreeningResults] = useState(proposal.ai_pre_screening || null);
  
  const { invokeAI, status, error, rateLimitInfo, isLoading, isAvailable } = useAIWithFallback({
    showToasts: true,
    fallbackData: null
  });

  const runAIScreening = async () => {
    const { success, data } = await invokeAI({
      prompt: generateProposalScreeningPrompt(proposal),
      response_json_schema: getProposalScreeningSchema(),
      system_prompt: getProposalScreeningSystemPrompt()
    });

    if (success && data) {
      try {
        // Update proposal with screening results
        await base44.entities.InnovationProposal.update(proposal.id, {
          ai_pre_screening: data,
          ai_evaluation_score: Math.round(
            (data.proposal_completeness_score +
             data.feasibility_score +
             data.budget_reasonability_score +
             data.team_adequacy_score +
             data.strategic_alignment_preliminary) / 5
          )
        });

        setScreeningResults(data);
        toast.success('AI screening complete');
        onScreeningComplete?.(data);
      } catch (updateError) {
        toast.error('Failed to save screening results');
      }
    }
  };

  const getStatusIcon = (score) => {
    if (score >= 70) return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    if (score >= 40) return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  const getStatusColor = (score) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!screeningResults) {
    return (
      <Card className="border-2 border-purple-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              AI Pre-Screening Required
            </CardTitle>
            <AIOptionalBadge />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} showDetails={true} />
          
          <p className="text-sm text-slate-600">
            Run AI screening to assess proposal completeness, feasibility, budget reasonability, and team adequacy.
          </p>
          
          <Button onClick={runAIScreening} disabled={isLoading || !isAvailable} className="bg-purple-600">
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Sparkles className="h-4 w-4 mr-2" />
            Run AI Screening
          </Button>

          {status === AI_STATUS.RATE_LIMITED && (
            <div className="p-3 bg-muted rounded-lg border">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  You can still review this proposal manually or wait for AI to become available.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-purple-300 bg-purple-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI Pre-Screening Results
          </CardTitle>
          <Badge className={
            screeningResults.auto_recommendation === 'approve_for_expert_review' ? 'bg-green-600' :
            screeningResults.auto_recommendation === 'request_clarification' ? 'bg-yellow-600' :
            'bg-red-600'
          }>
            {screeningResults.auto_recommendation?.replace(/_/g, ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-white rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-600">Completeness</span>
              {getStatusIcon(screeningResults.proposal_completeness_score)}
            </div>
            <div className={`text-2xl font-bold ${getStatusColor(screeningResults.proposal_completeness_score)}`}>
              {screeningResults.proposal_completeness_score}
            </div>
            <Progress value={screeningResults.proposal_completeness_score} className="mt-2 h-1" />
          </div>

          <div className="p-3 bg-white rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-600">Feasibility</span>
              {getStatusIcon(screeningResults.feasibility_score)}
            </div>
            <div className={`text-2xl font-bold ${getStatusColor(screeningResults.feasibility_score)}`}>
              {screeningResults.feasibility_score}
            </div>
            <Progress value={screeningResults.feasibility_score} className="mt-2 h-1" />
          </div>

          <div className="p-3 bg-white rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-600">Budget</span>
              {screeningResults.budget_reasonability ? 
                <CheckCircle2 className="h-5 w-5 text-green-600" /> : 
                <XCircle className="h-5 w-5 text-red-600" />
              }
            </div>
            <div className={`text-2xl font-bold ${getStatusColor(screeningResults.budget_reasonability_score)}`}>
              {screeningResults.budget_reasonability_score}
            </div>
            <Progress value={screeningResults.budget_reasonability_score} className="mt-2 h-1" />
          </div>

          <div className="p-3 bg-white rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-600">Team</span>
              {screeningResults.team_adequacy ? 
                <CheckCircle2 className="h-5 w-5 text-green-600" /> : 
                <XCircle className="h-5 w-5 text-red-600" />
              }
            </div>
            <div className={`text-2xl font-bold ${getStatusColor(screeningResults.team_adequacy_score)}`}>
              {screeningResults.team_adequacy_score}
            </div>
            <Progress value={screeningResults.team_adequacy_score} className="mt-2 h-1" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-white rounded-lg">
            <span className="text-xs text-slate-600">Strategic Alignment</span>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={screeningResults.strategic_alignment_preliminary} className="flex-1" />
              <span className="text-sm font-bold">{screeningResults.strategic_alignment_preliminary}</span>
            </div>
          </div>
          <div className="p-3 bg-white rounded-lg">
            <span className="text-xs text-slate-600">Innovation Type</span>
            <div className="mt-2">
              <Badge className="capitalize">{screeningResults.innovation_type_classification}</Badge>
            </div>
          </div>
        </div>

        {screeningResults.duplicate_check && (
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-300">
            <AlertTriangle className="h-4 w-4 text-yellow-600 inline mr-2" />
            <span className="text-sm text-yellow-900 font-medium">
              Potential duplicate detected - review similar proposals before approval
            </span>
          </div>
        )}

        <Button onClick={runAIScreening} disabled={isLoading || !isAvailable} variant="outline" size="sm">
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Re-run Screening
        </Button>
      </CardContent>
    </Card>
  );
}
