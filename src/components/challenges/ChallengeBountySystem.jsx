import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Award, DollarSign, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ChallengeBountySystem({ challenge }) {
  const queryClient = useQueryClient();
  const [bountyData, setBountyData] = useState({
    prize_amount: '',
    prize_currency: 'SAR',
    deadline_date: '',
    eligibility: '',
    evaluation_criteria: ''
  });

  const createBountyMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('challenges')
        .update({
          bounty_enabled: true,
          bounty_details: {
            ...bountyData,
            created_date: new Date().toISOString(),
            status: 'open'
          }
        })
        .eq('id', challenge.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      toast.success('Bounty created - challenge is now open for crowdsourced solutions');
    }
  });

  const existingBounty = challenge.bounty_details;

  if (existingBounty) {
    return (
      <Card className="border-2 border-yellow-300 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-600" />
            Active Bounty
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Prize Amount</p>
              <p className="text-2xl font-bold text-yellow-600">
                {existingBounty.prize_amount?.toLocaleString()} {existingBounty.prize_currency}
              </p>
            </div>
            <Badge className="bg-green-600">Open</Badge>
          </div>
          <div>
            <p className="text-sm text-slate-600">Deadline</p>
            <p className="text-sm font-medium">{existingBounty.deadline_date}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Submissions</p>
            <p className="text-sm font-medium">{challenge.proposal_count || 0} proposals received</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-yellow-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-yellow-600" />
          Create Challenge Bounty
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">
          Offer a prize for the best crowdsourced solution to this challenge. 
          Opens competition to public, startups, and innovators.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">
              Prize Amount *
            </label>
            <Input
              type="number"
              value={bountyData.prize_amount}
              onChange={(e) => setBountyData({ ...bountyData, prize_amount: e.target.value })}
              placeholder="50000"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">
              Deadline *
            </label>
            <Input
              type="date"
              value={bountyData.deadline_date}
              onChange={(e) => setBountyData({ ...bountyData, deadline_date: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">
            Eligibility Requirements
          </label>
          <Textarea
            value={bountyData.eligibility}
            onChange={(e) => setBountyData({ ...bountyData, eligibility: e.target.value })}
            placeholder="Who can participate? Any requirements?"
            className="h-20"
          />
        </div>

        <Button 
          onClick={() => createBountyMutation.mutate()}
          disabled={!bountyData.prize_amount || !bountyData.deadline_date || createBountyMutation.isPending}
          className="w-full bg-yellow-600"
        >
          {createBountyMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          <Award className="h-4 w-4 mr-2" />
          Launch Bounty Competition
        </Button>
      </CardContent>
    </Card>
  );
}