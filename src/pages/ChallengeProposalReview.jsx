import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { CheckCircle2, XCircle, FileText, DollarSign, Clock, Loader2, Rocket } from 'lucide-react';
import { toast } from 'sonner';
import ProposalToPilotConverter from '../components/challenges/ProposalToPilotConverter';

export default function ChallengeProposalReview() {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [reviewNotes, setReviewNotes] = useState({});
  const [convertingProposal, setConvertingProposal] = useState(null);

  const { data: proposals = [] } = useQuery({
    queryKey: ['challenge-proposals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenge_proposals')
        .select('*')
        .order('submitted_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: async () => {
      const { data, error } = await supabase.from('challenges').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ proposalId, status, notes }) => {
      const { error } = await supabase
        .from('challenge_proposals')
        .update({
          status,
          review_notes: notes,
          reviewer_email: user?.email,
          review_date: new Date().toISOString()
        })
        .eq('id', proposalId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['challenge-proposals']);
      toast.success(t({ en: 'Proposal reviewed', ar: 'تمت مراجعة المقترح' }));
    }
  });

  const pendingProposals = proposals.filter(p => p.status === 'submitted');
  const shortlistedProposals = proposals.filter(p => p.status === 'shortlisted');

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          {t({ en: 'Challenge Proposal Review', ar: 'مراجعة مقترحات التحديات' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Review provider proposals for challenges', ar: 'مراجعة مقترحات مزودي الحلول للتحديات' })}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{proposals.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Total Proposals', ar: 'إجمالي المقترحات' })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Clock className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">{pendingProposals.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Pending Review', ar: 'قيد المراجعة' })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{shortlistedProposals.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Shortlisted', ar: 'القائمة القصيرة' })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-red-600">
              {proposals.filter(p => p.status === 'rejected').length}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Rejected', ar: 'مرفوض' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Proposals */}
      {convertingProposal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full">
            <ProposalToPilotConverter
              proposal={convertingProposal}
              challenge={challenges.find(c => c.id === convertingProposal.challenge_id)}
              onSuccess={() => setConvertingProposal(null)}
            />
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Pending Review', ar: 'قيد المراجعة' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pendingProposals.length === 0 ? (
            <p className="text-center text-slate-500 py-8">
              {t({ en: 'No pending proposals', ar: 'لا توجد مقترحات معلقة' })}
            </p>
          ) : (
            pendingProposals.map((proposal) => {
              const challenge = challenges.find(c => c.id === proposal.challenge_id);
              return (
                <div key={proposal.id} className="p-4 border-2 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-blue-600">{t({ en: 'Challenge', ar: 'تحدي' })}</Badge>
                        <Link to={createPageUrl(`ChallengeDetail?id=${challenge?.id}`)}>
                          <span className="text-sm font-semibold text-blue-600 hover:underline">
                            {challenge?.title_en}
                          </span>
                        </Link>
                      </div>
                      <h4 className="font-semibold text-slate-900">{proposal.proposal_title}</h4>
                      <p className="text-sm text-slate-600 mt-1">{proposal.approach_summary}</p>
                      
                      <div className="flex gap-4 mt-3 text-xs text-slate-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {proposal.timeline_weeks} {t({ en: 'weeks', ar: 'أسابيع' })}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {proposal.estimated_cost?.toLocaleString()} {proposal.currency || 'SAR'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Textarea
                      placeholder={t({ en: 'Review notes...', ar: 'ملاحظات المراجعة...' })}
                      value={reviewNotes[proposal.id] || ''}
                      onChange={(e) => setReviewNotes({ ...reviewNotes, [proposal.id]: e.target.value })}
                      rows={2}
                    />

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => setConvertingProposal(proposal)}
                        className="bg-green-600"
                      >
                        <Rocket className="h-4 w-4 mr-2" />
                        {t({ en: 'Accept → Pilot', ar: 'قبول → تجربة' })}
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => reviewMutation.mutate({
                          proposalId: proposal.id,
                          status: 'accepted',
                          notes: reviewNotes[proposal.id]
                        })}
                        variant="outline"
                        className="bg-green-50"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        {t({ en: 'Accept', ar: 'قبول' })}
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => reviewMutation.mutate({
                          proposalId: proposal.id,
                          status: 'shortlisted',
                          notes: reviewNotes[proposal.id]
                        })}
                        variant="outline"
                      >
                        {t({ en: 'Shortlist', ar: 'قائمة قصيرة' })}
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => reviewMutation.mutate({
                          proposalId: proposal.id,
                          status: 'rejected',
                          notes: reviewNotes[proposal.id]
                        })}
                        variant="outline"
                        className="text-red-600 border-red-300"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        {t({ en: 'Reject', ar: 'رفض' })}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}