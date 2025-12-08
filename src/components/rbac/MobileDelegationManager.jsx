import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, X } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Mobile-optimized delegation manager
 */
export default function MobileDelegationManager() {
  const [delegatee, setDelegatee] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: myDelegations = [] } = useQuery({
    queryKey: ['my-delegations'],
    queryFn: () => base44.entities.DelegationRule.filter({ delegator_email: user?.email })
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.DelegationRule.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-delegations']);
      toast.success('Delegation created');
      setDelegatee('');
      setSelectedPermissions([]);
    }
  });

  const permissions = ['challenge_create', 'pilot_create', 'solution_create', 'challenge_approve'];

  const handleCreate = () => {
    if (!delegatee || selectedPermissions.length === 0) return;

    createMutation.mutate({
      delegator_email: user.email,
      delegatee_email: delegatee,
      delegated_permissions: selectedPermissions,
      approval_status: 'pending',
      is_active: false
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
                <p className="font-medium text-sm">{d.delegatee_email}</p>
                <Badge className={d.approval_status === 'approved' ? 'bg-green-600' : 'bg-amber-600'}>
                  {d.approval_status}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                {d.delegated_permissions?.map((p, i) => (
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