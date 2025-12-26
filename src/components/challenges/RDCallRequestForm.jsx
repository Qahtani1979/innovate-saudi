import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Microscope, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';

export default function RDCallRequestForm({ challenge }) {
  const { notify, isNotifying } = useNotificationSystem();
  const [requestData, setRequestData] = useState({
    justification: '',
    research_areas_suggested: '',
    expected_outcomes: ''
  });

  const handleSubmit = async () => {
    try {
      await notify({
        type: 'rd_call_request',
        entityType: 'challenge',
        entityId: challenge.id,
        recipientEmails: ['admin@platform.gov.sa'],
        title: `R&D Call Request for Challenge: ${challenge.code}`,
        message: `Researcher requests R&D call for challenge "${challenge.title_en}". Justification: ${requestData.justification}`,
        metadata: requestData
      });
      toast.success('R&D call request submitted - admin will review');
    } catch (err) {
      toast.error('Failed to submit request');
    }
  };

  return (
    <Card className="border-2 border-blue-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Microscope className="h-5 w-5 text-blue-600" />
          Request R&D Call Creation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">
          This challenge requires research. Submit a request for the platform admin to create an R&D call.
        </p>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">
            Research Justification *
          </label>
          <Textarea
            value={requestData.justification}
            onChange={(e) => setRequestData({ ...requestData, justification: e.target.value })}
            placeholder="Why does this challenge require research?"
            className="h-24"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">
            Suggested Research Areas
          </label>
          <Textarea
            value={requestData.research_areas_suggested}
            onChange={(e) => setRequestData({ ...requestData, research_areas_suggested: e.target.value })}
            placeholder="What specific research topics should be covered?"
            className="h-20"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!requestData.justification || isNotifying}
          className="w-full bg-blue-600"
        >
          {isNotifying && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Submit R&D Call Request
        </Button>
      </CardContent>
    </Card>
  );
}