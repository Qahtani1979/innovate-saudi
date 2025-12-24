import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '@/components/LanguageContext';
import { FileText, Loader2 } from 'lucide-react';
import ProposalSubmissionForm from '@/components/challenges/ProposalSubmissionForm';
import ChallengeRFPGenerator from '@/components/challenges/ChallengeRFPGenerator';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function ChallengeProposalsTab({
  challenge,
  onProposalSuccess,
  onRFPComplete
}) {
  const { t } = useLanguage();
  const challengeId = challenge?.id;

  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ['challenge-proposals', challengeId],
    queryFn: async () => {
      const { data } = await supabase
        .from('challenge_proposals')
        .select('*')
        .eq('challenge_id', challengeId)
        .eq('is_deleted', false);
      return data || [];
    },
    enabled: !!challengeId
  });

  if (isLoading) {
    return <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            {t({ en: 'Provider Proposals', ar: 'مقترحات المزودين' })} ({proposals.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {proposals.length > 0 ? (
            <div className="space-y-3">
              {proposals.map((p) => (
                <Link
                  key={p.id}
                  to={createPageUrl(`ChallengeProposalDetail?id=${p.id}`)}
                  className="block p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold">{p.proposal_title}</p>
                      <p className="text-xs text-muted-foreground">{p.proposer_email}</p>
                    </div>
                    <Badge>{p.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{p.approach_summary}</p>
                  <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                    <span>⏱️ {p.timeline_weeks} weeks</span>
                    <span>💰 {p.estimated_cost} SAR</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">{t({ en: 'No proposals submitted yet', ar: 'لم يتم تقديم مقترحات بعد' })}</p>
              <ProposalSubmissionForm
                challenge={challenge}
                onSuccess={onProposalSuccess}
                onCancel={() => { }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <ChallengeRFPGenerator challenge={challenge} onComplete={onRFPComplete} />
    </div>
  );
}
