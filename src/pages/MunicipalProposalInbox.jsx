import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  Inbox, CheckCircle2, XCircle, Clock, Building2, Lightbulb,
  FileText, DollarSign, Calendar, AlertCircle, MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

export default function MunicipalProposalInbox() {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const { user } = useAuth();

  const { data: myMunicipality } = useQuery({
    queryKey: ['my-municipality', user?.email],
    queryFn: async () => {
      const { data } = await supabase.from('municipalities').select('*');
      return data?.find(m => m.contact_email === user?.email);
    },
    enabled: !!user
  });

  const { data: myChallenges = [] } = useQuery({
    queryKey: ['my-challenges', myMunicipality?.id, user?.email],
    queryFn: async () => {
      const { data } = await supabase.from('challenges').select('*');
      return data?.filter(c => 
        c.municipality_id === myMunicipality?.id || 
        c.created_by === user?.email
      ) || [];
    },
    enabled: !!myMunicipality || !!user
  });

  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ['proposals-for-my-challenges', myChallenges.map(c => c.id)],
    queryFn: async () => {
      const challengeIds = myChallenges.map(c => c.id);
      const { data } = await supabase.from('challenge_proposals').select('*');
      return data?.filter(p => challengeIds.includes(p.challenge_id)) || [];
    },
    enabled: myChallenges.length > 0
  });

  const respondMutation = useMutation({
    mutationFn: async ({ proposalId, status, message }) => {
      const proposal = proposals.find(p => p.id === proposalId);
      
      await supabase.from('challenge_proposals').update({
        status,
        municipality_response_date: new Date().toISOString(),
        municipality_response_message: message
      }).eq('id', proposalId);

      await supabase.from('system_activities').insert({
        entity_type: 'ChallengeProposal',
        entity_id: proposalId,
        activity_type: status === 'accepted' ? 'proposal_accepted' : 'proposal_rejected',
        description_en: `Municipality responded: ${status}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['proposals-for-my-challenges']);
      setSelectedProposal(null);
      setResponseMessage('');
      toast.success(t({ en: 'Response sent', ar: 'تم إرسال الرد' }));
    }
  });

  const pendingProposals = proposals.filter(p => p.status === 'pending');
  const reviewedProposals = proposals.filter(p => p.status !== 'pending');

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>;
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
          <Inbox className="h-10 w-10 text-blue-600" />
          {t({ en: 'Solution Proposal Inbox', ar: 'صندوق مقترحات الحلول' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Review and respond to solution proposals from providers', ar: 'مراجعة والرد على مقترحات الحلول من المزودين' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-300">
          <CardContent className="pt-4 text-center">
            <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{pendingProposals.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Pending Review', ar: 'قيد المراجعة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-4 text-center">
            <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">
              {proposals.filter(p => p.status === 'accepted').length}
            </p>
            <p className="text-xs text-slate-600">{t({ en: 'Accepted', ar: 'مقبولة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-4 text-center">
            <FileText className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{proposals.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Total Proposals', ar: 'إجمالي المقترحات' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-4 text-center">
            <MessageSquare className="h-6 w-6 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">
              {proposals.filter(p => p.status === 'more_info_requested').length}
            </p>
            <p className="text-xs text-slate-600">{t({ en: 'More Info', ar: 'معلومات إضافية' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Proposals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            {t({ en: 'Pending Review', ar: 'قيد المراجعة' })}
            <Badge className="bg-blue-600 text-white">{pendingProposals.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingProposals.length === 0 ? (
            <div className="text-center py-12">
              <Inbox className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">
                {t({ en: 'No pending proposals', ar: 'لا توجد مقترحات معلقة' })}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingProposals.map((proposal) => (
                <ProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  onSelect={() => setSelectedProposal(proposal)}
                  isSelected={selectedProposal?.id === proposal.id}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Modal */}
      {selectedProposal && (
        <Card className="border-2 border-blue-400">
          <CardHeader>
            <CardTitle>{t({ en: 'Review Proposal', ar: 'مراجعة المقترح' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-slate-50 rounded">
              <p className="font-semibold text-slate-900 mb-2">{selectedProposal.proposal_title_en}</p>
              <p className="text-sm text-slate-700 mb-3">{selectedProposal.proposal_description_en}</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-slate-600">Timeline:</span>
                  <p className="font-semibold">{selectedProposal.estimated_timeline_weeks} weeks</p>
                </div>
                <div>
                  <span className="text-slate-600">Budget:</span>
                  <p className="font-semibold">{selectedProposal.estimated_budget_range}</p>
                </div>
                <div>
                  <span className="text-slate-600">Provider:</span>
                  <p className="font-semibold">{selectedProposal.proposer_organization}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {t({ en: 'Response Message', ar: 'رسالة الرد' })}
              </label>
              <Textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                rows={3}
                placeholder={t({ en: 'Add your response...', ar: 'أضف ردك...' })}
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setSelectedProposal(null);
                  setResponseMessage('');
                }}
                variant="outline"
                className="flex-1"
              >
                {t({ en: 'Cancel', ar: 'إلغاء' })}
              </Button>
              <Button
                onClick={() => respondMutation.mutate({
                  proposalId: selectedProposal.id,
                  status: 'more_info_requested',
                  message: responseMessage
                })}
                variant="outline"
                className="flex-1"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {t({ en: 'Request Info', ar: 'طلب معلومات' })}
              </Button>
              <Button
                onClick={() => respondMutation.mutate({
                  proposalId: selectedProposal.id,
                  status: 'rejected',
                  message: responseMessage
                })}
                variant="destructive"
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                {t({ en: 'Reject', ar: 'رفض' })}
              </Button>
              <Button
                onClick={() => respondMutation.mutate({
                  proposalId: selectedProposal.id,
                  status: 'accepted',
                  message: responseMessage
                })}
                className="flex-1 bg-green-600"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {t({ en: 'Accept', ar: 'قبول' })}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviewed Proposals */}
      {reviewedProposals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-slate-600" />
              {t({ en: 'Reviewed Proposals', ar: 'المقترحات المراجعة' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reviewedProposals.map((proposal) => (
                <ProposalCard key={proposal.id} proposal={proposal} reviewed />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ProposalCard({ proposal, onSelect, isSelected, reviewed }) {
  const { language, t } = useLanguage();

  const statusConfig = {
    pending: { color: 'bg-blue-100 text-blue-700', icon: Clock },
    accepted: { color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    rejected: { color: 'bg-red-100 text-red-700', icon: XCircle },
    more_info_requested: { color: 'bg-amber-100 text-amber-700', icon: MessageSquare }
  };

  const config = statusConfig[proposal.status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <Card className={`hover:shadow-md transition-all ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-slate-900">
                {proposal.proposal_title_en || 'Untitled Proposal'}
              </h4>
              <Badge className={config.color}>
                <Icon className="h-3 w-3 mr-1" />
                {proposal.status}
              </Badge>
            </div>
            <p className="text-sm text-slate-600 mb-2 line-clamp-2">
              {proposal.proposal_description_en}
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {proposal.proposer_organization}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {proposal.estimated_timeline_weeks} weeks
              </div>
              {proposal.estimated_budget_range && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {proposal.estimated_budget_range}
                </div>
              )}
            </div>
          </div>
        </div>

        {!reviewed && (
          <div className="flex gap-2">
            <Link to={createPageUrl(`ChallengeDetail?id=${proposal.challenge_id}`)} className="flex-1">
              <Button size="sm" variant="outline" className="w-full">
                <Lightbulb className="h-3 w-3 mr-1" />
                {t({ en: 'View Challenge', ar: 'عرض التحدي' })}
              </Button>
            </Link>
            <Button size="sm" onClick={onSelect} className="flex-1 bg-blue-600">
              {t({ en: 'Review', ar: 'مراجعة' })}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}