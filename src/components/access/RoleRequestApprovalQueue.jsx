import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { useApproveRoleRequest, useRejectRoleRequest, useSendRoleNotification } from '@/hooks/useRBACManager';
import { CheckCircle, XCircle, Clock, User, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRoles } from '@/hooks/useRoles';
import { usePendingRoleRequests } from '@/hooks/useRoleRequests';

export default function RoleRequestApprovalQueue() {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [reviewDialog, setReviewDialog] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');

  // Use unified RBAC hooks (mutations)
  // Assuming these are fine as is, or I could use useRoleRequestMutations if I wanted to consolidate.
  // For now, I'll keep existing mutation hooks if they work, but replacing queries is the goal.
  const { mutateAsync: approveRequest, isPending: isApproving } = useApproveRoleRequest();
  const { mutateAsync: rejectRequest, isPending: isRejecting } = useRejectRoleRequest();
  const { mutateAsync: sendNotification } = useSendRoleNotification();

  // Fetch pending requests using new hook
  const { data: requests = [], isLoading } = usePendingRoleRequests();

  // Fetch roles using new hook
  const { data: roles = [] } = useRoles();

  const handleApprove = async () => {
    try {
      await approveRequest({
        request_id: reviewDialog.id,
        user_id: reviewDialog.user_id,
        user_email: reviewDialog.user_email,
        role: reviewDialog.requested_role,
        municipality_id: reviewDialog.municipality_id,
        organization_id: reviewDialog.organization_id,
        approver_email: user?.email
      });

      // Send notification
      try {
        await sendNotification({
          type: 'approved',
          user_id: reviewDialog.user_id,
          user_email: reviewDialog.user_email,
          user_name: reviewDialog.user_name || reviewDialog.user_email?.split('@')[0],
          requested_role: reviewDialog.requested_role,
          language: language
        });
      } catch (e) {
        console.error('Notification error:', e);
      }

      setReviewDialog(null);
      setReviewNotes('');
    } catch (error) {
      console.error('Approve error:', error);
    }
  };

  const handleReject = async () => {
    try {
      await rejectRequest({
        request_id: reviewDialog.id,
        reason: reviewNotes,
        approver_email: user?.email
      });

      // Send notification
      try {
        await sendNotification({
          type: 'rejected',
          user_id: reviewDialog.user_id,
          user_email: reviewDialog.user_email,
          user_name: reviewDialog.user_name || reviewDialog.user_email?.split('@')[0],
          requested_role: reviewDialog.requested_role,
          rejection_reason: reviewNotes,
          language: language
        });
      } catch (e) {
        console.error('Notification error:', e);
      }

      setReviewDialog(null);
      setReviewNotes('');
    } catch (error) {
      console.error('Reject error:', error);
    }
  };

  const getRoleName = (requestedRole) => {
    const role = roles.find(r => r.id === requestedRole || r.name === requestedRole);
    return role?.name || requestedRole;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

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
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {t({ en: 'No pending requests', ar: 'لا توجد طلبات معلقة' })}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <div key={request.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{request.user_email}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t({ en: 'Requesting:', ar: 'يطلب:' })}{' '}
                        <Badge variant="secondary">{getRoleName(request.requested_role)}</Badge>
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(request.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                    </span>
                  </div>

                  {request.justification && (
                    <div className="bg-muted p-3 rounded mb-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        {t({ en: 'Justification:', ar: 'المبرر:' })}
                      </p>
                      <p className="text-sm">{request.justification}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setReviewDialog(request);
                        setReviewNotes('');
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {t({ en: 'Review', ar: 'مراجعة' })}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!reviewDialog} onOpenChange={() => setReviewDialog(null)}>
        {/* @ts-ignore */}
        <DialogContent className="max-w-md">
          {/* @ts-ignore */}
          <DialogHeader className="text-left">
            {/* @ts-ignore */}
            <DialogTitle>
              {t({ en: 'Review Role Request', ar: 'مراجعة طلب الدور' })}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-muted p-3 rounded">
              <p className="text-sm text-muted-foreground mb-1">
                {t({ en: 'User:', ar: 'المستخدم:' })} <strong>{reviewDialog?.user_email}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                {t({ en: 'Requested Role:', ar: 'الدور المطلوب:' })}{' '}
                <Badge variant="secondary">{getRoleName(reviewDialog?.requested_role)}</Badge>
              </p>
            </div>

            {reviewDialog?.justification && (
              <div className="bg-muted/50 p-3 rounded">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  {t({ en: 'Justification:', ar: 'المبرر:' })}
                </p>
                <p className="text-sm">{reviewDialog.justification}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">
                {t({ en: 'Review Notes (Optional)', ar: 'ملاحظات المراجعة (اختياري)' })}
              </label>
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={3}
                placeholder={t({ en: 'Add notes for rejection reason...', ar: 'أضف ملاحظات لسبب الرفض...' })}
              />
            </div>
          </div>

          {/* @ts-ignore */}
          <DialogFooter className="flex-row justify-end gap-2">
            <Button variant="outline" onClick={() => setReviewDialog(null)}>
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button
              variant="outline"
              onClick={handleReject}
              className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              disabled={isRejecting}
            >
              <XCircle className="h-4 w-4 mr-2" />
              {t({ en: 'Reject', ar: 'رفض' })}
            </Button>
            <Button
              onClick={handleApprove}
              className="bg-green-600 hover:bg-green-700"
              disabled={isApproving}
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
