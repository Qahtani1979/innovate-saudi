import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { FileText, Clock, CheckCircle2, XCircle, Loader2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function ProposalWorkflowTracker({ providerId, providerEmail }) {
  const { t } = useLanguage();

  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ['provider-proposals', providerId],
    queryFn: async () => {
      const all = await base44.entities.ChallengeProposal.list();
      return all.filter(p => p.provider_id === providerId || p.submitted_by === providerEmail);
    },
    enabled: !!providerId || !!providerEmail
  });

  const stats = {
    total: proposals.length,
    pending: proposals.filter(p => p.status === 'submitted' || p.status === 'under_review').length,
    approved: proposals.filter(p => p.status === 'approved' || p.status === 'selected').length,
    rejected: proposals.filter(p => p.status === 'rejected').length
  };

  const statusConfig = {
    submitted: { icon: Clock, color: 'blue', label: 'Submitted' },
    under_review: { icon: Loader2, color: 'amber', label: 'Under Review' },
    approved: { icon: CheckCircle2, color: 'green', label: 'Approved' },
    selected: { icon: CheckCircle2, color: 'green', label: 'Selected' },
    rejected: { icon: XCircle, color: 'red', label: 'Rejected' },
    withdrawn: { icon: XCircle, color: 'slate', label: 'Withdrawn' }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400 mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          {t({ en: 'Proposal Workflow Tracker', ar: 'متتبع سير المقترحات' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="p-2 bg-slate-50 rounded text-center">
            <p className="text-xl font-bold text-slate-900">{stats.total}</p>
            <p className="text-xs text-slate-600">Total</p>
          </div>
          <div className="p-2 bg-amber-50 rounded text-center">
            <p className="text-xl font-bold text-amber-600">{stats.pending}</p>
            <p className="text-xs text-slate-600">Pending</p>
          </div>
          <div className="p-2 bg-green-50 rounded text-center">
            <p className="text-xl font-bold text-green-600">{stats.approved}</p>
            <p className="text-xs text-slate-600">Approved</p>
          </div>
          <div className="p-2 bg-red-50 rounded text-center">
            <p className="text-xl font-bold text-red-600">{stats.rejected}</p>
            <p className="text-xs text-slate-600">Rejected</p>
          </div>
        </div>

        {/* Recent Proposals */}
        {proposals.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {proposals.slice(0, 5).map((proposal) => {
              const config = statusConfig[proposal.status] || statusConfig.submitted;
              const Icon = config.icon;

              return (
                <div key={proposal.id} className="p-3 border rounded-lg hover:bg-slate-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`h-4 w-4 text-${config.color}-600 ${proposal.status === 'under_review' ? 'animate-spin' : ''}`} />
                        <p className="font-medium text-sm text-slate-900">
                          {proposal.proposal_title || 'Untitled Proposal'}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500">
                        Challenge: {proposal.challenge_id}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={`bg-${config.color}-100 text-${config.color}-700 text-xs`}>
                          {config.label}
                        </Badge>
                        {proposal.submitted_date && (
                          <span className="text-xs text-slate-500">
                            {new Date(proposal.submitted_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link to={createPageUrl(`ChallengeProposalDetail?id=${proposal.id}`)}>
                      <Button size="sm" variant="ghost">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6">
            <FileText className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">
              {t({ en: 'No proposals submitted yet', ar: 'لا توجد مقترحات' })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}