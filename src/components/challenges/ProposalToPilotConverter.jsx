import React from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '../LanguageContext';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Rocket, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useEmailTrigger } from '@/hooks/useEmailTrigger';

export default function ProposalToPilotConverter({ proposal, challenge, onSuccess }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { triggerEmail } = useEmailTrigger();

  const { data: solution } = useQuery({
    queryKey: ['solution', proposal.solution_id],
    queryFn: () => base44.entities.Solution.get(proposal.solution_id),
    enabled: !!proposal.solution_id
  });

  const convertMutation = useMutation({
    mutationFn: async () => {
      const pilot = await base44.entities.Pilot.create({
        code: `PLT-${Date.now().toString().slice(-6)}`,
        title_en: `Pilot: ${proposal.proposal_title}`,
        title_ar: proposal.proposal_title,
        challenge_id: challenge.id,
        solution_id: proposal.solution_id,
        municipality_id: challenge.municipality_id,
        sector: challenge.sector,
        description_en: proposal.proposal_text,
        objective_en: proposal.approach_summary,
        duration_weeks: proposal.timeline_weeks,
        budget: proposal.estimated_cost,
        stage: 'design',
        status: 'draft'
      });

      // Update proposal with pilot reference
      await base44.entities.ChallengeProposal.update(proposal.id, {
        converted_to_pilot_id: pilot.id,
        status: 'accepted'
      });

      // Update challenge with linked pilot
      await base44.entities.Challenge.update(challenge.id, {
        linked_pilot_ids: [...(challenge.linked_pilot_ids || []), pilot.id],
        track: 'pilot'
      });

      return pilot;
    },
    onSuccess: async (pilot) => {
      queryClient.invalidateQueries(['proposals']);
      queryClient.invalidateQueries(['pilots']);
      queryClient.invalidateQueries(['challenge']);
      
      // Trigger email notification for pilot creation from proposal
      await triggerEmail('pilot.created', {
        entityType: 'pilot',
        entityId: pilot.id,
        variables: {
          pilot_title: pilot.title_en,
          pilot_code: pilot.code,
          challenge_id: challenge.id,
          proposal_title: proposal.proposal_title
        }
      }).catch(err => console.error('Email trigger failed:', err));
      
      // Trigger proposal accepted notification
      await triggerEmail('proposal.approved', {
        entityType: 'challenge_proposal',
        entityId: proposal.id,
        variables: {
          proposal_title: proposal.proposal_title,
          challenge_title: challenge.title_en,
          pilot_id: pilot.id
        }
      }).catch(err => console.error('Email trigger failed:', err));
      
      toast.success(t({ en: 'Pilot created from proposal!', ar: 'تم إنشاء تجربة من المقترح!' }));
      navigate(createPageUrl(`PilotDetail?id=${pilot.id}`));
      if (onSuccess) onSuccess();
    }
  });

  return (
    <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-900">
          <Rocket className="h-5 w-5" />
          {t({ en: 'Convert to Pilot', ar: 'تحويل إلى تجربة' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-white rounded-lg border">
          <p className="text-xs text-slate-500 mb-1">{t({ en: 'Proposal', ar: 'المقترح' })}</p>
          <p className="font-semibold text-slate-900">{proposal.proposal_title}</p>
          <div className="flex gap-3 mt-2 text-xs text-slate-600">
            <span>⏱️ {proposal.timeline_weeks} weeks</span>
            <span>💰 {proposal.estimated_cost?.toLocaleString()} SAR</span>
          </div>
        </div>

        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            {t({ 
              en: 'This will create a pilot with pre-filled data from the proposal', 
              ar: 'سيؤدي هذا إلى إنشاء تجربة بيانات مملوءة مسبقاً من المقترح' 
            })}
          </p>
        </div>

        <Button
          onClick={() => convertMutation.mutate()}
          disabled={convertMutation.isPending}
          className="w-full bg-gradient-to-r from-green-600 to-teal-600"
        >
          {convertMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t({ en: 'Creating Pilot...', ar: 'جاري إنشاء التجربة...' })}
            </>
          ) : (
            <>
              <Rocket className="h-4 w-4 mr-2" />
              {t({ en: 'Create Pilot from Proposal', ar: 'إنشاء تجربة من المقترح' })}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}