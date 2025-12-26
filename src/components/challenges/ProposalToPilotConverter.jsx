import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '../LanguageContext';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Rocket, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useConvertProposalToPilot } from '@/hooks/useChallengeConversionMutations';
import { useSolution } from '@/hooks/useSolutions';

export default function ProposalToPilotConverter({ proposal, challenge, onSuccess }) {
  const { language, isRTL, t } = useLanguage();
  const navigate = useNavigate();

  const { data: solution } = useSolution(proposal.solution_id);
  const convertProposalToPilot = useConvertProposalToPilot();

  const handleCreatePilot = async () => {
    try {
      const pilot = await convertProposalToPilot.mutateAsync({ proposal, challenge });
      if (onSuccess) onSuccess();
      navigate(createPageUrl(`PilotDetail?id=${pilot.id}`));
    } catch (err) {
      // toast handled in hook
    }
  };

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
          onClick={handleCreatePilot}
          disabled={convertProposalToPilot.isPending}
          className="w-full bg-gradient-to-r from-green-600 to-teal-600"
        >
          {convertProposalToPilot.isPending ? (
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
