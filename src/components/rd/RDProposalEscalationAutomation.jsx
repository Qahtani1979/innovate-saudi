import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';

export default function RDProposalEscalationAutomation({ proposal, rdCall }) {
  const queryClient = useQueryClient();

  const escalateMutation = useMutation({
    mutationFn: async (escalationData) => {
      // Update proposal with escalation
      const { error: updateError } = await supabase
        .from('rd_proposals')
        .update(escalationData)
        .eq('id', proposal.id);
      if (updateError) throw updateError;
      
      // Create notification
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_email: rdCall?.organizer_email || 'admin@platform.com',
          title: `🚨 R&D Proposal Escalation: ${proposal.title_en}`,
          message: `Proposal ${proposal.proposal_code} has been escalated (Level ${escalationData.escalation_level})`,
          type: 'escalation',
          entity_type: 'RDProposal',
          entity_id: proposal.id,
          priority: 'high'
        });
      if (notifError) console.error('Notification error:', notifError);

      // Send email notification via email-trigger-hub
      if (rdCall?.organizer_email) {
        await supabase.functions.invoke('email-trigger-hub', {
          body: {
            trigger: 'challenge.escalated',
            recipient_email: rdCall.organizer_email,
            entity_type: 'rd_proposal',
            entity_id: proposal.id,
            variables: {
              proposalTitle: proposal.title_en,
              proposalCode: proposal.proposal_code,
              escalationLevel: escalationData.escalation_level
            },
            triggered_by: 'system'
          }
        });
      }
    },

      // Send email notification via email-trigger-hub
      if (rdCall?.organizer_email) {
        const { supabase } = await import('@/integrations/supabase/client');
        await supabase.functions.invoke('email-trigger-hub', {
          body: {
            trigger: 'challenge.escalated',
            recipient_email: rdCall.organizer_email,
            entity_type: 'rd_proposal',
            entity_id: proposal.id,
            variables: {
              proposalTitle: proposal.title_en,
              proposalCode: proposal.proposal_code,
              escalationLevel: escalationData.escalation_level
            },
            triggered_by: 'system'
          }
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['rd-proposal']);
    }
  });

  useEffect(() => {
    if (!proposal || !rdCall) return;

    const checkEscalation = () => {
      const now = new Date();
      
      // If submitted, check review SLA
      if (proposal.status === 'submitted' && proposal.submission_date) {
        const submittedDate = new Date(proposal.submission_date);
        const daysSinceSubmit = (now - submittedDate) / (1000 * 60 * 60 * 24);

        // Escalation rules based on call timeline
        const reviewDeadline = rdCall?.evaluation_deadline ? 
          new Date(rdCall.evaluation_deadline) : 
          new Date(submittedDate.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days default

        const daysUntilDeadline = (reviewDeadline - now) / (1000 * 60 * 60 * 24);

        // Escalate if approaching deadline or overdue
        if (daysUntilDeadline < 0 && proposal.escalation_level !== 2) {
          // Critical: Overdue
          escalateMutation.mutate({
            escalation_level: 2,
            escalation_date: now.toISOString(),
            escalation_reason: 'Review deadline passed'
          });
        } else if (daysUntilDeadline < 3 && daysUntilDeadline >= 0 && proposal.escalation_level !== 1) {
          // Warning: 3 days to deadline
          escalateMutation.mutate({
            escalation_level: 1,
            escalation_date: now.toISOString(),
            escalation_reason: 'Review deadline approaching (3 days)'
          });
        }
      }

      // If under_review, check if stalled
      if (proposal.status === 'under_review' && proposal.review_start_date) {
        const reviewStart = new Date(proposal.review_start_date);
        const daysSinceReviewStart = (now - reviewStart) / (1000 * 60 * 60 * 24);

        // Escalate if review taking too long (>7 days without decision)
        if (daysSinceReviewStart > 7 && proposal.escalation_level !== 1) {
          escalateMutation.mutate({
            escalation_level: 1,
            escalation_date: now.toISOString(),
            escalation_reason: 'Review stalled for 7+ days'
          });
        }
      }
    };

    // Run check immediately and then every hour
    checkEscalation();
    const interval = setInterval(checkEscalation, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [proposal, rdCall]);

  // Visual indicator only (escalation runs in background)
  if (proposal?.escalation_level > 0) {
    return (
      <div className={`p-3 rounded-lg border-2 flex items-center gap-2 ${
        proposal.escalation_level === 2 ? 'bg-red-50 border-red-400' : 'bg-amber-50 border-amber-400'
      }`}>
        <AlertCircle className={`h-5 w-5 ${proposal.escalation_level === 2 ? 'text-red-600' : 'text-amber-600'}`} />
        <div className="flex-1">
          <p className={`font-semibold text-sm ${proposal.escalation_level === 2 ? 'text-red-900' : 'text-amber-900'}`}>
            {proposal.escalation_level === 2 ? '🚨 Critical Escalation' : '⚠️ Warning Escalation'}
          </p>
          <p className="text-xs text-slate-600">{proposal.escalation_reason}</p>
        </div>
      </div>
    );
  }

  return null;
}