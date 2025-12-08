import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, CheckCircle2, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AIProposalScreening({ proposal, onScreeningComplete }) {
  const [isScreening, setIsScreening] = useState(false);
  const [screeningResults, setScreeningResults] = useState(proposal.ai_pre_screening || null);

  const runAIScreening = async () => {
    setIsScreening(true);
    try {
      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `AI Pre-Screen this Innovation Proposal for completeness and quality:

Title: ${proposal.title_en}
Description: ${proposal.description_en}
Proposal Type: ${proposal.proposal_type}
Budget Estimate: ${proposal.budget_estimate} SAR
Timeline: ${proposal.timeline_proposal}
Team: ${proposal.team_composition?.length || 0} members
Success Metrics: ${proposal.success_metrics_proposed?.length || 0} defined

Assess the following criteria:
1. Proposal Completeness Score (0-100): Are all required sections filled adequately?
2. Feasibility Score (0-100): Is this technically and operationally feasible?
3. Innovation Type Classification: incremental | radical | disruptive | sustaining
4. Budget Reasonability (boolean): Is the budget estimate reasonable for the scope?
5. Budget Reasonability Score (0-100): How reasonable is the budget?
6. Team Adequacy (boolean): Does the team have adequate expertise?
7. Team Adequacy Score (0-100): Rate the team composition quality
8. Strategic Alignment Preliminary (0-100): Does this align with municipal priorities?
9. Duplicate Check (boolean): Is this similar to existing proposals?
10. Auto Recommendation: approve_for_expert_review | request_clarification | reject_incomplete | merge_with_existing

Provide structured assessment.`,
        response_json_schema: {
          type: "object",
          properties: {
            proposal_completeness_score: { type: "number" },
            feasibility_score: { type: "number" },
            innovation_type_classification: { type: "string" },
            budget_reasonability: { type: "boolean" },
            budget_reasonability_score: { type: "number" },
            team_adequacy: { type: "boolean" },
            team_adequacy_score: { type: "number" },
            strategic_alignment_preliminary: { type: "number" },
            duplicate_check: { type: "boolean" },
            auto_recommendation: { type: "string" }
          }
        }
      });

      // Update proposal with screening results
      await base44.entities.InnovationProposal.update(proposal.id, {
        ai_pre_screening: aiResponse,
        ai_evaluation_score: Math.round(
          (aiResponse.proposal_completeness_score +
           aiResponse.feasibility_score +
           aiResponse.budget_reasonability_score +
           aiResponse.team_adequacy_score +
           aiResponse.strategic_alignment_preliminary) / 5
        )
      });

      setScreeningResults(aiResponse);
      toast.success('AI screening complete');
      onScreeningComplete?.(aiResponse);
    } catch (error) {
      toast.error('Screening failed: ' + error.message);
    } finally {
      setIsScreening(false);
    }
  };

  if (!screeningResults) {
    return (
      <Card className="border-2 border-purple-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI Pre-Screening Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-4">
            Run AI screening to assess proposal completeness, feasibility, budget reasonability, and team adequacy.
          </p>
          <Button onClick={runAIScreening} disabled={isScreening} className="bg-purple-600">
            {isScreening && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Sparkles className="h-4 w-4 mr-2" />
            Run AI Screening
          </Button>
        </CardContent>
      </Card>
    );
  }

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

        <Button onClick={runAIScreening} disabled={isScreening} variant="outline" size="sm">
          {isScreening && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Re-run Screening
        </Button>
      </CardContent>
    </Card>
  );
}