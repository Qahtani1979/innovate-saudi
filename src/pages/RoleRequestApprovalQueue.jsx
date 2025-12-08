import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../components/LanguageContext';
import ProtectedPage from '../components/permissions/ProtectedPage';

function RoleRequestApprovalQueue() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const { data: requests = [] } = useQuery({
    queryKey: ['role-requests-pending'],
    queryFn: () => base44.entities.RoleRequest.filter({ status: 'pending' })
  });

  const approveMutation = useMutation({
    mutationFn: async ({ requestId, approved }) => {
      const request = await base44.entities.RoleRequest.filter({ id: requestId }).then(r => r[0]);
      
      await base44.entities.RoleRequest.update(requestId, {
        status: approved ? 'approved' : 'rejected',
        reviewed_by: (await base44.auth.me()).email,
        reviewed_date: new Date().toISOString()
      });

      if (approved) {
        const targetUser = await base44.asServiceRole.entities.User.filter({ email: request.user_email }).then(r => r[0]);
        const currentRoles = targetUser.assigned_roles || [];
        
        await base44.asServiceRole.entities.User.update(targetUser.id, {
          assigned_roles: [...currentRoles, request.requested_role]
        });
      }

      return { approved };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['role-requests-pending']);
      toast.success(data.approved ? 'Role request approved' : 'Role request rejected');
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'Role Request Approval Queue', ar: 'قائمة موافقات طلبات الأدوار' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: `${requests.length} pending requests`, ar: `${requests.length} طلب معلق` })}
        </p>
      </div>

      <div className="space-y-3">
        {requests.map(request => (
          <Card key={request.id} className="border-2 border-amber-200">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <UserPlus className="h-4 w-4 text-amber-600" />
                    <p className="font-medium">{request.user_email}</p>
                  </div>
                  <p className="text-sm text-slate-600 mb-1">
                    Requested role: <Badge className="bg-blue-600">{request.requested_role}</Badge>
                  </p>
                  {request.justification && (
                    <p className="text-xs text-slate-600 mt-2 p-2 bg-slate-50 rounded">
                      {request.justification}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-2">
                    Requested: {new Date(request.created_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-green-600"
                    onClick={() => approveMutation.mutate({ requestId: request.id, approved: true })}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-600 text-red-600"
                    onClick={() => approveMutation.mutate({ requestId: request.id, approved: false })}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {requests.length === 0 && (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-3" />
              <p className="text-slate-600">
                {t({ en: 'No pending role requests', ar: 'لا توجد طلبات أدوار معلقة' })}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default ProtectedPage(RoleRequestApprovalQueue, { requireAdmin: true });