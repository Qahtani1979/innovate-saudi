import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from 'sonner';
import { Users, CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function StakeholderAlignmentGate({ proposal, onGateComplete }) {
  const { user } = useAuth();
  const [alignment, setAlignment] = useState({
    stakeholder_buy_in: null,
    resource_availability: null,
    policy_alignment: null,
    notes: '',
    decision: 'pending'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const submitAlignmentMutation = useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase
        .from('innovation_proposals')
        .update({
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
        })
        .eq('id', proposal.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['innovation-proposals']);
      toast.success('Stakeholder alignment assessment saved');
      onGateComplete?.();
    },
    onError: (error) => {
      toast.error('Failed to save: ' + error.message);
    }
  });

  const handleSubmit = () => {
    // Validate all fields are selected
    if (alignment.stakeholder_buy_in === null || 
        alignment.resource_availability === null || 
        alignment.policy_alignment === null) {
      toast.error('Please complete all assessments');
      return;
    }

    // Auto-determine decision
    const allApproved = alignment.stakeholder_buy_in && 
                        alignment.resource_availability && 
                        alignment.policy_alignment;
    
    const decision = allApproved ? 'approved' : 'conditional';

    setAlignment(prev => ({ ...prev, decision }));
    submitAlignmentMutation.mutate({ ...alignment, decision });
  };

  const existingGate = proposal.stakeholder_alignment_gate;

  if (existingGate?.decision) {
    return (
      <Card className="border-2 border-green-300 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Stakeholder Alignment - Completed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-xs text-slate-600 mb-1">Buy-In</p>
              {existingGate.stakeholder_buy_in ? 
                <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto" /> : 
                <XCircle className="h-6 w-6 text-red-600 mx-auto" />
              }
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-xs text-slate-600 mb-1">Resources</p>
              {existingGate.resource_availability ? 
                <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto" /> : 
                <XCircle className="h-6 w-6 text-red-600 mx-auto" />
              }
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-xs text-slate-600 mb-1">Policy</p>
              {existingGate.policy_alignment ? 
                <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto" /> : 
                <XCircle className="h-6 w-6 text-red-600 mx-auto" />
              }
            </div>
          </div>
          <Badge className={existingGate.decision === 'approved' ? 'bg-green-600' : 'bg-yellow-600'}>
            {existingGate.decision}
          </Badge>
          {existingGate.notes && (
            <div className="p-3 bg-white rounded-lg text-sm">
              <p className="text-slate-600">{existingGate.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-indigo-300">
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          Stakeholder Alignment Gate - Stage 3
        </CardTitle>
        <p className="text-sm text-white/90 mt-1">
          Assess stakeholder buy-in, resource availability, and policy alignment
        </p>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Stakeholder Buy-In */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">1. Stakeholder Buy-In</Label>
          <p className="text-sm text-slate-600">
            Do key stakeholders (municipality leadership, department heads) support this proposal?
          </p>
          <RadioGroup 
            value={alignment.stakeholder_buy_in?.toString()} 
            onValueChange={(val) => setAlignment({...alignment, stakeholder_buy_in: val === 'true'})}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="buy-in-yes" />
              <Label htmlFor="buy-in-yes" className="cursor-pointer">
                <CheckCircle2 className="h-4 w-4 text-green-600 inline mr-1" />
                Yes - Strong stakeholder support
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="buy-in-no" />
              <Label htmlFor="buy-in-no" className="cursor-pointer">
                <XCircle className="h-4 w-4 text-red-600 inline mr-1" />
                No - Insufficient buy-in
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Resource Availability */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">2. Resource Availability</Label>
          <p className="text-sm text-slate-600">
            Are the required resources (budget, personnel, infrastructure) available?
          </p>
          <RadioGroup 
            value={alignment.resource_availability?.toString()} 
            onValueChange={(val) => setAlignment({...alignment, resource_availability: val === 'true'})}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="resources-yes" />
              <Label htmlFor="resources-yes" className="cursor-pointer">
                <CheckCircle2 className="h-4 w-4 text-green-600 inline mr-1" />
                Yes - Resources available
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="resources-no" />
              <Label htmlFor="resources-no" className="cursor-pointer">
                <XCircle className="h-4 w-4 text-red-600 inline mr-1" />
                No - Resource constraints
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Policy Alignment */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">3. Policy Alignment</Label>
          <p className="text-sm text-slate-600">
            Does this align with current policies, regulations, and strategic priorities?
          </p>
          <RadioGroup 
            value={alignment.policy_alignment?.toString()} 
            onValueChange={(val) => setAlignment({...alignment, policy_alignment: val === 'true'})}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="policy-yes" />
              <Label htmlFor="policy-yes" className="cursor-pointer">
                <CheckCircle2 className="h-4 w-4 text-green-600 inline mr-1" />
                Yes - Aligned with policy
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="policy-no" />
              <Label htmlFor="policy-no" className="cursor-pointer">
                <XCircle className="h-4 w-4 text-red-600 inline mr-1" />
                No - Policy conflicts
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label>Notes & Recommendations</Label>
          <Textarea
            value={alignment.notes}
            onChange={(e) => setAlignment({...alignment, notes: e.target.value})}
            placeholder="Additional context, conditions, or recommendations..."
            rows={4}
          />
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-4 border-t">
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || alignment.stakeholder_buy_in === null}
            className="flex-1 bg-indigo-600"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Submit Assessment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
