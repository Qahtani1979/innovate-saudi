import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useUsersWithVisibility } from '@/hooks/useUsersWithVisibility';
import { useChallengeMutations } from '@/hooks/useChallengeMutations';

export default function ChallengeOwnershipTransfer({ challenge, onTransferComplete }) {
  const { user } = useAuth();
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [transferReason, setTransferReason] = useState('');

  // Use visibility-aware users hook - only shows users the current user can see
  const { data: users = [], isLoading: usersLoading } = useUsersWithVisibility();
  const { updateChallenge } = useChallengeMutations();

  const handleTransfer = () => {
    const oldOwner = challenge.challenge_owner_email;

    updateChallenge.mutate({
      id: challenge.id,
      data: {
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
      },
      activityLog: {
        activity_type: 'ownership_transferred',
        description: `Ownership transferred from ${oldOwner} to ${newOwnerEmail}`,
        metadata: { from: oldOwner, to: newOwnerEmail, reason: transferReason }
      }
    }, {
      onSuccess: () => {
        onTransferComplete?.();
      }
    });
  };

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
          onClick={handleTransfer}
          disabled={!newOwnerEmail || !transferReason || updateChallenge.isPending}
          className="w-full bg-orange-600"
        >
          {updateChallenge.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Transfer Ownership
        </Button>
      </CardContent>
    </Card>
  );
}