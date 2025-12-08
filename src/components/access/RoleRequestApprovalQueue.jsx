import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../LanguageContext';
import { CheckCircle, XCircle, Clock, User, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from 'sonner';

export default function RoleRequestApprovalQueue() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [reviewDialog, setReviewDialog] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');

  const { data: requests = [] } = useQuery({
    queryKey: ['role-requests', 'pending'],
    queryFn: () => base44.entities.RoleRequest.filter({ status: 'pending' })
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => base44.entities.Role.list()
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
  });

  const approveMutation = useMutation({
    mutationFn: async ({ requestId, roleId, userEmail, roleName }) => {
      // Update request status
      await base44.entities.RoleRequest.update(requestId, {
        status: 'approved',
        reviewed_date: new Date().toISOString(),
        review_notes: reviewNotes
      });
      
      // Assign role to user
      const user = users.find(u => u.email === userEmail);
      const currentRoles = user?.assigned_roles || [];
      await base44.entities.User.update(user.id, {
        assigned_roles: [...currentRoles, roleId]
      });

      // Send approval notification email
      await base44.integrations.Core.SendEmail({
        to: userEmail,
        subject: 'Role Request Approved',
        body: `Your request for the role "${roleName}" has been approved. You can now access the additional features associated with this role.`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['role-requests']);
      queryClient.invalidateQueries(['users']);
      toast.success(t({ en: 'Request approved!', ar: 'تمت الموافقة!' }));
      setReviewDialog(null);
      setReviewNotes('');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ requestId, userEmail, roleName }) => {
      await base44.entities.RoleRequest.update(requestId, {
        status: 'rejected',
        reviewed_date: new Date().toISOString(),
        review_notes: reviewNotes
      });

      // Send rejection notification email
      await base44.integrations.Core.SendEmail({
        to: userEmail,
        subject: 'Role Request - Update',
        body: `Your request for the role "${roleName}" has been reviewed. ${reviewNotes ? 'Admin notes: ' + reviewNotes : ''}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['role-requests']);
      toast.success(t({ en: 'Request rejected', ar: 'تم رفض الطلب' }));
      setReviewDialog(null);
      setReviewNotes('');
    }
  });

  const handleApprove = () => {
    const role = roles.find(r => r.id === reviewDialog.requested_role_id);
    approveMutation.mutate({
      requestId: reviewDialog.id,
      roleId: reviewDialog.requested_role_id,
      userEmail: reviewDialog.user_email,
      roleName: role?.name
    });
  };

  const handleReject = () => {
    const role = roles.find(r => r.id === reviewDialog.requested_role_id);
    rejectMutation.mutate({ 
      requestId: reviewDialog.id,
      userEmail: reviewDialog.user_email,
      roleName: role?.name
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-600" />
            {t({ en: 'Pending Role Requests', ar: 'طلبات الأدوار المعلقة' })}
            <Badge className="ml-auto">{requests.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-sm text-slate-600 text-center py-8">
              {t({ en: 'No pending requests', ar: 'لا توجد طلبات معلقة' })}
            </p>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => {
                const role = roles.find(r => r.id === request.requested_role_id);
                const user = users.find(u => u.email === request.user_email);

                return (
                  <div key={request.id} className="p-4 border rounded-lg hover:bg-slate-50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4 text-slate-600" />
                          <span className="font-medium">{user?.full_name || request.user_email}</span>
                        </div>
                        <p className="text-sm text-slate-600">
                          {t({ en: 'Requesting:', ar: 'يطلب:' })} <Badge>{role?.name}</Badge>
                        </p>
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(request.requested_date).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded mb-3">
                      <p className="text-xs font-medium text-slate-600 mb-1">
                        {t({ en: 'Justification:', ar: 'المبرر:' })}
                      </p>
                      <p className="text-sm text-slate-700">{request.justification}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => setReviewDialog(request)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {t({ en: 'Approve', ar: 'موافقة' })}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setReviewDialog(request)}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        {t({ en: 'Reject', ar: 'رفض' })}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!reviewDialog} onOpenChange={() => setReviewDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t({ en: 'Review Role Request', ar: 'مراجعة طلب الدور' })}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-slate-50 p-3 rounded">
              <p className="text-sm text-slate-600 mb-1">
                {t({ en: 'User:', ar: 'المستخدم:' })} <strong>{reviewDialog?.user_email}</strong>
              </p>
              <p className="text-sm text-slate-600">
                {t({ en: 'Requested Role:', ar: 'الدور المطلوب:' })}{' '}
                <Badge>{roles.find(r => r.id === reviewDialog?.requested_role_id)?.name}</Badge>
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {t({ en: 'Review Notes (Optional)', ar: 'ملاحظات المراجعة (اختياري)' })}
              </label>
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={3}
                placeholder={t({ en: 'Add notes...', ar: 'أضف ملاحظات...' })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialog(null)}>
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button 
              variant="outline"
              onClick={handleReject}
              className="text-red-600 border-red-600"
              disabled={rejectMutation.isPending}
            >
              <XCircle className="h-4 w-4 mr-2" />
              {t({ en: 'Reject', ar: 'رفض' })}
            </Button>
            <Button 
              onClick={handleApprove}
              className="bg-green-600 hover:bg-green-700"
              disabled={approveMutation.isPending}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {t({ en: 'Approve', ar: 'موافقة' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}