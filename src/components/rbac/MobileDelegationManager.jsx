import { useState } from 'react';
import { useMyDelegations, useDelegationMutations } from '@/hooks/useDelegations';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

/**
 * Mobile-optimized delegation manager
 */
export default function MobileDelegationManager() {
  const { user } = useAuth();
  const [delegatee, setDelegatee] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const { data: myDelegations = [] } = useMyDelegations(user?.email);
  const { createDelegation: createMutation } = useDelegationMutations();

  const permissions = ['challenge_create', 'pilot_create', 'solution_create', 'challenge_approve'];

  const handleCreate = () => {
    if (!delegatee || selectedPermissions.length === 0) return;

    createMutation.mutate({
      delegator_email: user?.email,
      delegate_email: delegatee,
      permission_types: selectedPermissions,
      is_active: true, // Ensuring it starts active if created manually here or handled by backend
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Create Delegation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            type="email"
            placeholder="Delegate to (email)..."
            value={delegatee}
            onChange={(e) => setDelegatee(e.target.value)}
            className="w-full px-3 py-2 border rounded text-sm"
          />

          <div className="flex flex-wrap gap-2">
            {permissions.map(perm => (
              <Badge
                key={perm}
                onClick={() => setSelectedPermissions(prev =>
                  prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
                )}
                className={`cursor-pointer ${selectedPermissions.includes(perm) ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                {perm}
              </Badge>
            ))}
          </div>

          <Button onClick={handleCreate} className="w-full" size="sm">
            Create Delegation
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {myDelegations.map(d => (
          <Card key={d.id} className="border">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-sm">{d.delegate_email}</p>
                <Badge className={d.is_active ? 'bg-green-600' : 'bg-amber-600'}>
                  {d.is_active ? 'active' : 'pending'}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                {d.permission_types?.map((p, i) => (
                  <Badge key={i} variant="outline" className="text-xs">{p}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
