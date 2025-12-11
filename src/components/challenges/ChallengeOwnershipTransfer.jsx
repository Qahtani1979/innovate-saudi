import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

export default function ChallengeOwnershipTransfer({ challenge, onTransferComplete }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [transferReason, setTransferReason] = useState('');

  const { data: users = [] } = useQuery({
    queryKey: ['users-for-transfer'],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_profiles').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const transferMutation = useMutation({
    mutationFn: async () => {
      const oldOwner = challenge.challenge_owner_email;
      
      const { error } = await supabase
        .from('challenges')
        .update({
          challenge_owner_email: newOwnerEmail,
          ownership_transfer_history: [
            ...(challenge.ownership_transfer_history || []),
            {
              from: oldOwner,
              to: newOwnerEmail,
              reason: transferReason,
              date: new Date().toISOString(),
              transferred_by: user?.email || 'unknown'
            }
          ]
        })
        .eq('id', challenge.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      toast.success('Ownership transferred successfully');
      onTransferComplete?.();
    }
  });

  return (
    <Card className="border-2 border-orange-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-orange-600" />
          Transfer Challenge Ownership
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">
            Current Owner
          </label>
          <p className="text-sm text-slate-600 p-2 bg-slate-50 rounded">
            {challenge.challenge_owner_email || 'Not assigned'}
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">
            New Owner *
          </label>
          <Select value={newOwnerEmail} onValueChange={setNewOwnerEmail}>
            <SelectTrigger>
              <SelectValue placeholder="Select new owner" />
            </SelectTrigger>
            <SelectContent>
              {users.map(user => (
                <SelectItem key={user.id} value={user.email}>
                  {user.full_name} ({user.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">
            Transfer Reason *
          </label>
          <Textarea
            value={transferReason}
            onChange={(e) => setTransferReason(e.target.value)}
            placeholder="Why is ownership being transferred?"
            className="h-20"
          />
        </div>

        <Button 
          onClick={() => transferMutation.mutate()} 
          disabled={!newOwnerEmail || !transferReason || transferMutation.isPending}
          className="w-full bg-orange-600"
        >
          {transferMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Transfer Ownership
        </Button>
      </CardContent>
    </Card>
  );
}