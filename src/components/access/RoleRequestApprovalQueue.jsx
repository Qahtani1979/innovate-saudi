import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { CheckCircle, XCircle, Clock, User, FileText, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from 'sonner';

export default function RoleRequestApprovalQueue() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [reviewDialog, setReviewDialog] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');

  // Fetch pending requests from Supabase
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['role-requests', 'pending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('role_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch roles for display
  const { data: roles = [] } = useQuery({
    queryKey: ['roles-supabase'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roles')
        .select('*');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async ({ requestId, requestedRole, userEmail }) => {
      // Update request status
      const { error: updateError } = await supabase
        .from('role_requests')
        .update({
          status: 'approved',
          reviewed_by: user?.email,
          reviewed_date: new Date().toISOString()
        })
        .eq('id', requestId);
      
      if (updateError) throw updateError;

      // Find role ID if it's a role name
      const role = roles.find(r => r.name === requestedRole || r.id === requestedRole);
      
      if (role) {
        // Assign functional role to user via user_functional_roles table
        const { data: targetUser } = await supabase
          .from('user_profiles')
          .select('user_id')
          .eq('user_email', userEmail)
          .maybeSingle();

        if (targetUser?.user_id) {
          const { error: roleError } = await supabase
            .from('user_functional_roles')
            .upsert({
              user_id: targetUser.user_id,
              role_id: role.id,
              assigned_by: user?.id,
              assigned_at: new Date().toISOString(),
              is_active: true
            }, {
              onConflict: 'user_id,role_id'
            });
          
          if (roleError) {
            console.error('Error assigning role:', roleError);
          }
        }
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['role-requests']);
      queryClient.invalidateQueries(['user-functional-roles']);
      toast.success(t({ en: 'Request approved!', ar: 'تمت الموافقة على الطلب!' }));
      setReviewDialog(null);
      setReviewNotes('');
    },
    onError: (error) => {
      toast.error(t({ en: 'Failed to approve request', ar: 'فشل في الموافقة على الطلب' }));
      console.error('Approve error:', error);
    }
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ requestId }) => {
      const { error } = await supabase
        .from('role_requests')
        .update({
          status: 'rejected',
          reviewed_by: user?.email,
          reviewed_date: new Date().toISOString(),
          rejection_reason: reviewNotes || null
        })
        .eq('id', requestId);
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['role-requests']);
      toast.success(t({ en: 'Request rejected', ar: 'تم رفض الطلب' }));
      setReviewDialog(null);
      setReviewNotes('');
    },
    onError: (error) => {
      toast.error(t({ en: 'Failed to reject request', ar: 'فشل في رفض الطلب' }));
      console.error('Reject error:', error);
    }
  });

  const handleApprove = () => {
    approveMutation.mutate({
      requestId: reviewDialog.id,
      requestedRole: reviewDialog.requested_role,
      userEmail: reviewDialog.user_email
    });
  };

  const handleReject = () => {
    rejectMutation.mutate({ requestId: reviewDialog.id });
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
        <DialogContent>
          <DialogHeader>
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

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialog(null)}>
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button 
              variant="outline"
              onClick={handleReject}
              className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
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
