import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from 'sonner';
import { Users, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useInnovationProposalMutations } from '@/hooks/useInnovationProposalMutations';

export default function StakeholderAlignmentGate({ proposal, onGateComplete }) {
  const { user } = useAuth();
  const [alignment, setAlignment] = useState({
    stakeholder_buy_in: null,
    resource_availability: null,
    policy_alignment: null,
    notes: '',
    decision: 'pending'
  });

  const { updateProposal } = useInnovationProposalMutations();
  const isSubmitting = updateProposal.isPending;

  const handleAlignmentSubmission = async (data) => {
    try {
      {/* @ts-ignore */ }
      await updateProposal.mutateAsync({
        id: proposal.id,
        data: {
          stakeholder_alignment_gate: {
            stakeholder_buy_in: data.stakeholder_buy_in,
            resource_availability: data.resource_availability,
            policy_alignment: data.policy_alignment,
            notes: data.notes,
            decision: data.decision,
            reviewed_by: user?.email,
            review_date: new Date().toISOString(),
            passed: data.decision === 'approved'
          },
          status: data.decision === 'approved' ? 'approved' :
            data.decision === 'rejected' ? 'rejected' :
              'under_evaluation'
        }
      });
      onGateComplete?.();
    } catch (error) {
      console.error('Alignment submission error:', error);
    }
  };

  const handleSubmit = () => {
    if (!alignment.stakeholder_buy_in || !alignment.resource_availability || !alignment.policy_alignment) {
      toast.error('Please complete all assessment fields');
      return;
    }

    const allApproved =
      alignment.stakeholder_buy_in === 'approved' &&
      alignment.resource_availability === 'approved' &&
      alignment.policy_alignment === 'approved';

    const decision = allApproved ? 'approved' : 'conditional';

    handleAlignmentSubmission({ ...alignment, decision });
  };

  const existingGate = proposal.stakeholder_alignment_gate;

  if (existingGate?.passed) {
    return (
      <Card className="border-green-200 bg-green-50/30">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-4 text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">Alignment Verified</h3>
              <p className="text-muted-foreground text-xs">
                Stakeholder agreement and resource availability confirmed.
              </p>
              <Badge variant="success" className="mt-2 text-[10px]">
                Passed on {new Date(existingGate.review_date).toLocaleDateString()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="bg-primary/5 pb-3">
        <CardTitle className="text-base flex items-center">
          <Users className="h-5 w-5 mr-3 text-primary" />
          Stakeholder Alignment Gate
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Stakeholder Buy-in */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Stakeholder Buy-in</Label>
          {/* @ts-ignore */}
          <RadioGroup
            value={alignment.stakeholder_buy_in}
            onValueChange={(val) => setAlignment(p => ({ ...p, stakeholder_buy_in: val }))}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="approved" id="buyin-approved" />
              <Label htmlFor="buyin-approved" className="cursor-pointer text-xs">Confirmed</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pending" id="buyin-pending" />
              <Label htmlFor="buyin-pending" className="cursor-pointer text-xs">Discussion</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="rejected" id="buyin-rejected" />
              <Label htmlFor="buyin-rejected" className="cursor-pointer text-xs">Lacking</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Resource Availability */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Resource Availability</Label>
          {/* @ts-ignore */}
          <RadioGroup
            value={alignment.resource_availability}
            onValueChange={(val) => setAlignment(p => ({ ...p, resource_availability: val }))}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="approved" id="res-approved" />
              <Label htmlFor="res-approved" className="cursor-pointer text-xs">Available</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pending" id="res-pending" />
              <Label htmlFor="res-pending" className="cursor-pointer text-xs">Partially</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="rejected" id="res-rejected" />
              <Label htmlFor="res-rejected" className="cursor-pointer text-xs">Unavailable</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Policy Alignment */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Policy Alignment</Label>
          {/* @ts-ignore */}
          <RadioGroup
            value={alignment.policy_alignment}
            onValueChange={(val) => setAlignment(p => ({ ...p, policy_alignment: val }))}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="approved" id="pol-approved" />
              <Label htmlFor="pol-approved" className="cursor-pointer text-xs">Aligned</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pending" id="pol-pending" />
              <Label htmlFor="pol-pending" className="cursor-pointer text-xs">Review</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="rejected" id="pol-rejected" />
              <Label htmlFor="pol-rejected" className="cursor-pointer text-xs">Conflicts</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold">Additional Notes</Label>
          <Textarea
            placeholder="Notes..."
            value={alignment.notes}
            onChange={(e) => setAlignment(p => ({ ...p, notes: e.target.value }))}
            rows={3}
            className="text-xs"
          />
        </div>

        <Button
          className="w-full h-10 text-sm"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Finalize Alignment
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
