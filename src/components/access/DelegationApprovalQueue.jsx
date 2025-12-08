import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../LanguageContext';
import { CheckCircle2, XCircle, Clock, Users, Calendar, Shield } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function DelegationApprovalQueue() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedDelegation, setSelectedDelegation] = useState(null);
  const [comments, setComments] = useState('');
  const [showDialog, setShowDialog] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  // Fetch pending delegations
  const { data: pendingDelegations = [] } = useQuery({
    queryKey: ['pending-delegations'],
    queryFn: async () => {
      if (!user) return [];
      
      return base44.entities.DelegationRule.filter({
        $or: [
          { delegator_email: user.email },
          { created_by: user.email }
        ],
        approval_status: { $in: ['pending', null] }
      });
    },
    enabled: !!user
  });

  const approveMutation = useMutation({
    mutationFn: async ({ delegation_id, action }) => {
      const response = await base44.functions.invoke('approveDelegation', {
        delegation_id,
        action,
        comments
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-delegations']);
      setShowDialog(false);
      setSelectedDelegation(null);
      setComments('');
    }
  });

  const handleAction = (delegation, action) => {
    setSelectedDelegation({ ...delegation, action });
    setShowDialog(true);
  };

  const confirmAction = () => {
    if (selectedDelegation) {
      approveMutation.mutate({
        delegation_id: selectedDelegation.id,
        action: selectedDelegation.action
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600" />
            {t({ en: 'Pending Delegation Approvals', ar: 'موافقات التفويض المعلقة' })}
            <Badge className="ml-auto">{pendingDelegations.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingDelegations.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">
                {t({ en: 'No pending delegations', ar: 'لا توجد تفويضات معلقة' })}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingDelegations.map((delegation) => (
                <Card key={delegation.id} className="border-2">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">
                              {delegation.delegator_email}
                            </span>
                            <span className="text-slate-500">→</span>
                            <span className="font-medium">
                              {delegation.delegate_email}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {delegation.permission_types?.map((perm, i) => (
                              <Badge key={i} variant="secondary">
                                {perm}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(delegation.start_date).toLocaleDateString()} - {new Date(delegation.end_date).toLocaleDateString()}
                            </div>
                            {delegation.reason && (
                              <div className="flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                {delegation.reason}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAction(delegation, 'approve')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            {t({ en: 'Approve', ar: 'موافقة' })}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleAction(delegation, 'reject')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            {t({ en: 'Reject', ar: 'رفض' })}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDelegation?.action === 'approve' ? 
                t({ en: 'Approve Delegation', ar: 'الموافقة على التفويض' }) :
                t({ en: 'Reject Delegation', ar: 'رفض التفويض' })}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              {selectedDelegation?.action === 'approve' ? 
                t({ en: 'Are you sure you want to approve this delegation?', ar: 'هل أنت متأكد من الموافقة على هذا التفويض؟' }) :
                t({ en: 'Are you sure you want to reject this delegation?', ar: 'هل أنت متأكد من رفض هذا التفويض؟' })}
            </p>

            <div>
              <label className="text-sm font-medium">
                {t({ en: 'Comments (Optional)', ar: 'تعليقات (اختياري)' })}
              </label>
              <Textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder={t({ en: 'Add notes...', ar: 'أضف ملاحظات...' })}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                {t({ en: 'Cancel', ar: 'إلغاء' })}
              </Button>
              <Button
                onClick={confirmAction}
                className={selectedDelegation?.action === 'approve' ? 
                  'bg-green-600 hover:bg-green-700' : ''}
                variant={selectedDelegation?.action === 'reject' ? 'destructive' : 'default'}
              >
                {selectedDelegation?.action === 'approve' ? 
                  t({ en: 'Approve', ar: 'موافقة' }) :
                  t({ en: 'Reject', ar: 'رفض' })}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}