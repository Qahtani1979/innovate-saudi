import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useApproveDelegation, useRejectDelegation } from '@/hooks/useRBACManager';

export default function DelegationApprovalQueue() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  
  // Use unified RBAC hooks
  const { mutateAsync: approveDelegation, isPending: isApproving } = useApproveDelegation();
  const { mutateAsync: rejectDelegation, isPending: isRejecting } = useRejectDelegation();

  const { data: pendingDelegations = [] } = useQuery({
    queryKey: ['pending-delegations'],
    queryFn: async () => {
      // Query delegations that are not yet active and haven't been approved/rejected
      const { data, error } = await supabase
        .from('delegation_rules')
        .select('*')
        .eq('is_active', false)
        .is('approved_by', null)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const handleApprove = async (id) => {
    try {
      await approveDelegation(id);
      queryClient.invalidateQueries(['pending-delegations']);
    } catch (error) {
      console.error('Approve error:', error);
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectDelegation({ delegationId: id, reason: 'Rejected by admin' });
      queryClient.invalidateQueries(['pending-delegations']);
    } catch (error) {
      console.error('Reject error:', error);
    }
  };

  if (pendingDelegations.length === 0) return null;

  return (
    <Card className="border-2 border-blue-300">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-600" />
          {t({ en: 'Pending Delegation Approvals', ar: 'موافقات التفويض المعلقة' })}
          <Badge className="ml-auto">{pendingDelegations.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {pendingDelegations.map(delegation => (
          <div key={delegation.id} className="p-3 bg-white rounded border">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="font-medium text-sm">{delegation.delegator_email}</p>
                <p className="text-xs text-slate-600">→ {delegation.delegate_email}</p>
                <div className="flex gap-1 mt-1">
                  {delegation.permission_types?.slice(0, 3).map((perm, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{perm}</Badge>
                  ))}
                  {delegation.permission_types?.length > 3 && (
                    <Badge variant="outline" className="text-xs">+{delegation.permission_types.length - 3}</Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  onClick={() => handleApprove(delegation.id)}
                  className="bg-green-600"
                  disabled={isApproving}
                >
                  <CheckCircle2 className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReject(delegation.id)}
                  disabled={isRejecting}
                >
                  <XCircle className="h-3 w-3 text-red-600" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}