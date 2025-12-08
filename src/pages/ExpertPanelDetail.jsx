import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  Users, CheckCircle2, XCircle, Clock, Target, Award, 
  MessageSquare, Vote, Eye, Sparkles, TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import EvaluationConsensusPanel from '../components/evaluation/EvaluationConsensusPanel';

function ExpertPanelDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const panelId = urlParams.get('id');
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [vote, setVote] = useState('');
  const [notes, setNotes] = useState('');

  const { data: panel, isLoading } = useQuery({
    queryKey: ['expert-panel', panelId],
    queryFn: async () => {
      const panels = await base44.entities.ExpertPanel.list();
      return panels.find(p => p.id === panelId);
    },
    enabled: !!panelId
  });

  const { data: evaluations = [] } = useQuery({
    queryKey: ['panel-evaluations', panel?.entity_id],
    queryFn: async () => {
      if (!panel) return [];
      const all = await base44.entities.ExpertEvaluation.list();
      return all.filter(e => 
        e.entity_type === panel.entity_type && 
        e.entity_id === panel.entity_id &&
        panel.panel_members?.includes(e.expert_email)
      );
    },
    enabled: !!panel
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const recordDecisionMutation = useMutation({
    mutationFn: (data) => base44.entities.ExpertPanel.update(panelId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['expert-panel']);
      toast.success(t({ en: 'Decision recorded', ar: 'تم تسجيل القرار' }));
    }
  });

  const submitVote = () => {
    if (!vote) return;
    
    const votingResults = panel.voting_results || {};
    votingResults[user?.email] = { vote, timestamp: new Date().toISOString(), notes };

    recordDecisionMutation.mutate({
      voting_results: votingResults,
      status: 'discussion'
    });

    setVote('');
    setNotes('');
  };

  const recordFinalDecision = (decision) => {
    recordDecisionMutation.mutate({
      decision,
      final_recommendation: decision,
      status: 'completed'
    });
  };

  if (isLoading || !panel) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  const voteCount = Object.keys(panel.voting_results || {}).length;
  const approveVotes = Object.values(panel.voting_results || {}).filter(v => v.vote === 'approve').length;
  const consensusReached = voteCount > 0 && (approveVotes / voteCount) >= (panel.consensus_threshold / 100);
  const isPanelMember = panel.panel_members?.includes(user?.email);
  const isChair = panel.panel_chair_email === user?.email;

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold text-slate-900">{panel.panel_name}</h1>
        <div className="flex items-center gap-3 mt-2">
          <Badge className={
            panel.status === 'forming' ? 'bg-yellow-100 text-yellow-700' :
            panel.status === 'reviewing' ? 'bg-blue-100 text-blue-700' :
            panel.status === 'discussion' ? 'bg-purple-100 text-purple-700' :
            panel.status === 'consensus' ? 'bg-green-100 text-green-700' :
            'bg-teal-100 text-teal-700'
          }>
            {panel.status}
          </Badge>
          <Badge variant="outline">{panel.entity_type}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <Users className="h-8 w-8 text-purple-600 mb-2" />
            <p className="text-3xl font-bold text-purple-600">{panel.panel_members?.length || 0}</p>
            <p className="text-sm text-slate-600">Panel Members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Vote className="h-8 w-8 text-blue-600 mb-2" />
            <p className="text-3xl font-bold text-blue-600">{voteCount}</p>
            <p className="text-sm text-slate-600">Votes Recorded</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Target className="h-8 w-8 text-amber-600 mb-2" />
            <p className="text-3xl font-bold text-amber-600">{panel.consensus_threshold}%</p>
            <p className="text-sm text-slate-600">Consensus Threshold</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
            <p className="text-3xl font-bold text-green-600">
              {voteCount > 0 ? Math.round((approveVotes / voteCount) * 100) : 0}%
            </p>
            <p className="text-sm text-slate-600">Approval Rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Entity Link */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-600" />
                {t({ en: 'Entity Being Reviewed', ar: 'الكيان قيد المراجعة' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link to={createPageUrl(`${
                panel.entity_type === 'challenge' ? 'ChallengeDetail' :
                panel.entity_type === 'pilot' ? 'PilotDetail' :
                panel.entity_type === 'rd_project' ? 'RDProjectDetail' :
                panel.entity_type === 'scaling_plan' ? 'ScalingPlanDetail' :
                'ChallengeDetail'
              }?id=${panel.entity_id}`)}>
                <Button variant="outline" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  {t({ en: 'View Full Details', ar: 'عرض التفاصيل' })}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Consensus Display */}
          <EvaluationConsensusPanel
            entityType={panel.entity_type}
            entityId={panel.entity_id}
          />

          {/* Voting */}
          {isPanelMember && panel.status !== 'completed' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Vote className="h-5 w-5 text-purple-600" />
                  {t({ en: 'Cast Your Vote', ar: 'أدلِ بصوتك' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant={vote === 'approve' ? 'default' : 'outline'}
                    onClick={() => setVote('approve')}
                    className={vote === 'approve' ? 'bg-green-600' : ''}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant={vote === 'revise' ? 'default' : 'outline'}
                    onClick={() => setVote('revise')}
                    className={vote === 'revise' ? 'bg-amber-600' : ''}
                  >
                    Revise
                  </Button>
                  <Button
                    variant={vote === 'reject' ? 'default' : 'outline'}
                    onClick={() => setVote('reject')}
                    className={vote === 'reject' ? 'bg-red-600' : ''}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>

                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t({ en: 'Add notes to your vote...', ar: 'أضف ملاحظات لتصويتك...' })}
                  rows={3}
                />

                <Button onClick={submitVote} disabled={!vote} className="w-full bg-purple-600">
                  <Vote className="h-4 w-4 mr-2" />
                  {t({ en: 'Submit Vote', ar: 'إرسال التصويت' })}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Voting Results */}
          {Object.keys(panel.voting_results || {}).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t({ en: 'Voting Results', ar: 'نتائج التصويت' })}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(panel.voting_results || {}).map(([email, voteData]) => (
                  <div key={email} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{email}</span>
                      <Badge className={
                        voteData.vote === 'approve' ? 'bg-green-100 text-green-700' :
                        voteData.vote === 'revise' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }>
                        {voteData.vote}
                      </Badge>
                    </div>
                    {voteData.notes && (
                      <p className="text-xs text-slate-600">{voteData.notes}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(voteData.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Final Decision */}
          {isChair && consensusReached && panel.status !== 'completed' && (
            <Card className="border-2 border-green-300 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <Award className="h-5 w-5" />
                  {t({ en: 'Record Final Decision', ar: 'تسجيل القرار النهائي' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-green-800">
                  Consensus reached ({approveVotes}/{voteCount} approve - {Math.round((approveVotes/voteCount)*100)}%)
                </p>
                <div className="flex gap-3">
                  <Button onClick={() => recordFinalDecision('approve')} className="flex-1 bg-green-600">
                    Approve
                  </Button>
                  <Button onClick={() => recordFinalDecision('conditional')} variant="outline" className="flex-1">
                    Conditional
                  </Button>
                  <Button onClick={() => recordFinalDecision('reject')} variant="outline" className="flex-1">
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {/* Panel Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t({ en: 'Panel Information', ar: 'معلومات اللجنة' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {panel.panel_chair_email && (
                <div>
                  <p className="text-xs text-slate-500">Chair</p>
                  <p className="text-sm font-medium">{panel.panel_chair_email}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-slate-500">Members</p>
                <div className="space-y-1 mt-1">
                  {panel.panel_members?.map((email) => (
                    <div key={email} className="text-sm flex items-center gap-2">
                      <Users className="h-3 w-3 text-slate-400" />
                      {email}
                    </div>
                  ))}
                </div>
              </div>
              {panel.review_due_date && (
                <div>
                  <p className="text-xs text-slate-500">Due Date</p>
                  <p className="text-sm font-medium">{new Date(panel.review_due_date).toLocaleDateString()}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Consensus Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t({ en: 'Consensus Progress', ar: 'تقدم الإجماع' })}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>{voteCount}/{panel.panel_members?.length || 0} voted</span>
                    <span>{panel.consensus_threshold}% needed</span>
                  </div>
                  <Progress value={(voteCount / (panel.panel_members?.length || 1)) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Approval Rate</span>
                    <span className={consensusReached ? 'text-green-600 font-bold' : ''}>
                      {voteCount > 0 ? Math.round((approveVotes / voteCount) * 100) : 0}%
                    </span>
                  </div>
                  <Progress 
                    value={voteCount > 0 ? (approveVotes / voteCount) * 100 : 0} 
                    className={`h-2 ${consensusReached ? 'bg-green-200' : ''}`}
                  />
                </div>
                {consensusReached && (
                  <div className="p-3 bg-green-100 border border-green-300 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mb-1" />
                    <p className="text-sm font-semibold text-green-900">Consensus Reached!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ProtectedPage(ExpertPanelDetail, { requiredPermissions: ['expert_manage_panel', 'expert_evaluate'] });