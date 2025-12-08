import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { UserPlus, Clock, CheckCircle, XCircle } from 'lucide-react';
import RoleRequestDialog from '../components/access/RoleRequestDialog';
import RoleRequestApprovalQueue from '../components/access/RoleRequestApprovalQueue';
import { usePermissions } from '../components/permissions/usePermissions';

export default function RoleRequestCenter() {
  const { t } = useLanguage();
  const { user, isAdmin } = usePermissions();
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => base44.entities.Role.list()
  });

  const { data: myRequests = [] } = useQuery({
    queryKey: ['role-requests', user?.email],
    queryFn: () => base44.entities.RoleRequest.filter({ user_email: user?.email }),
    enabled: !!user?.email
  });

  // Filter roles user doesn't already have
  const userRoleIds = user?.assigned_roles || [];
  const availableRoles = roles.filter(role => 
    !userRoleIds.includes(role.id) && role.can_be_requested !== false
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
        <h1 className="text-5xl font-bold mb-2">
          {t({ en: 'Role Request Center', ar: 'مركز طلبات الأدوار' })}
        </h1>
        <p className="text-xl text-white/90">
          {t({ en: 'Request additional roles and manage approvals', ar: 'اطلب أدواراً إضافية وإدارة الموافقات' })}
        </p>
      </div>

      {/* My Requests */}
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
            <p className="text-sm text-slate-600 text-center py-8">
              {t({ en: 'No role requests yet', ar: 'لا توجد طلبات أدوار بعد' })}
            </p>
          ) : (
            <div className="space-y-3">
              {myRequests.map((request) => {
                const role = roles.find(r => r.id === request.requested_role_id);
                
                return (
                  <div key={request.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Badge className="mb-2">{role?.name}</Badge>
                        <p className="text-sm text-slate-600">
                          {t({ en: 'Requested:', ar: 'تم الطلب:' })} {new Date(request.requested_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge 
                        variant={
                          request.status === 'approved' ? 'default' :
                          request.status === 'rejected' ? 'destructive' :
                          'outline'
                        }
                        className={
                          request.status === 'approved' ? 'bg-green-600' :
                          request.status === 'rejected' ? 'bg-red-600' :
                          'border-orange-600 text-orange-600'
                        }
                      >
                        {request.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {request.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                        {request.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                        {request.status}
                      </Badge>
                    </div>
                    <div className="bg-slate-50 p-3 rounded text-sm">
                      <p className="text-xs font-medium text-slate-600 mb-1">
                        {t({ en: 'Justification:', ar: 'المبرر:' })}
                      </p>
                      <p className="text-slate-700">{request.justification}</p>
                    </div>
                    {request.review_notes && (
                      <div className="mt-2 bg-blue-50 p-3 rounded text-sm">
                        <p className="text-xs font-medium text-blue-900 mb-1">
                          {t({ en: 'Admin Notes:', ar: 'ملاحظات الإدارة:' })}
                        </p>
                        <p className="text-blue-700">{request.review_notes}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Approval Queue */}
      {isAdmin && <RoleRequestApprovalQueue />}

      {/* Request Dialog */}
      <RoleRequestDialog
        open={requestDialogOpen}
        onOpenChange={setRequestDialogOpen}
        user={user}
        availableRoles={availableRoles}
      />
    </div>
  );
}