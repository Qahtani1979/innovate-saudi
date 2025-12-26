import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '@/components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { UserPlus, Clock, CheckCircle, XCircle } from 'lucide-react';
import RoleRequestDialog from '@/components/access/RoleRequestDialog';
import RoleRequestApprovalQueue from '@/components/access/RoleRequestApprovalQueue';
import { usePermissions } from '@/hooks/usePermissions';
import { useRoles } from '@/hooks/useRoles';
import { useMyRoleRequests } from '@/hooks/useRoleRequests';

export default function RoleRequestContent() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { isAdmin } = usePermissions();
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);

  const { data: roles = [] } = useRoles();
  const { data: myRequests = [] } = useMyRoleRequests(user?.email);

  const userRoleIds = user?.assigned_roles || [];
  const availableRoles = roles.filter(role => !userRoleIds.includes(role.id));

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            {t({ en: 'Approved', ar: 'موافق عليه' })}
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            {t({ en: 'Rejected', ar: 'مرفوض' })}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-orange-600 text-orange-600">
            <Clock className="h-3 w-3 mr-1" />
            {t({ en: 'Pending', ar: 'معلق' })}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-indigo-600" />
              {t({ en: 'My Role Requests', ar: 'طلبات الأدوار الخاصة بي' })}
            </CardTitle>
            <Button onClick={() => setRequestDialogOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              {t({ en: 'Request Role', ar: 'طلب دور' })}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {myRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {t({ en: 'No role requests yet', ar: 'لا توجد طلبات أدوار بعد' })}
            </p>
          ) : (
            <div className="space-y-3">
              {myRequests.map((request) => {
                const role = roles.find(r => r.id === request.requested_role || r.name === request.requested_role);
                return (
                  <div key={request.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Badge className="mb-2 bg-blue-600">{role?.name || request.requested_role}</Badge>
                        <p className="text-sm text-muted-foreground">
                          {t({ en: 'Requested:', ar: 'تم الطلب:' })} {new Date(request.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                        </p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                    {request.justification && (
                      <div className="bg-muted p-3 rounded text-sm">
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          {t({ en: 'Justification:', ar: 'المبرر:' })}
                        </p>
                        <p>{request.justification}</p>
                      </div>
                    )}
                    {request.rejection_reason && request.status === 'rejected' && (
                      <div className="mt-2 bg-red-50 dark:bg-red-950/20 p-3 rounded text-sm border border-red-200 dark:border-red-800">
                        <p className="text-xs font-medium text-red-900 dark:text-red-200 mb-1">
                          {t({ en: 'Rejection Reason:', ar: 'سبب الرفض:' })}
                        </p>
                        <p className="text-red-700 dark:text-red-300">{request.rejection_reason}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {isAdmin && <RoleRequestApprovalQueue />}

      <RoleRequestDialog
        open={requestDialogOpen}
        onOpenChange={setRequestDialogOpen}
        availableRoles={availableRoles} preSelectedRole={undefined} />
    </div>
  );
}
