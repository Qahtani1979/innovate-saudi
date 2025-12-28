import { useState } from 'react';
import { usePilotsWithVisibility } from '@/hooks/usePilotsWithVisibility';
import { usePilotMutations } from '@/hooks/usePilotMutations';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../components/LanguageContext';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function BudgetAllocationApprovalGate() {
  const { language, isRTL, t } = useLanguage();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [comments, setComments] = useState('');

  /* Use visibility hook for pilots */
  const { data: pilots = [] } = usePilotsWithVisibility();

  const { approveBudget } = usePilotMutations();

  /* Note: approveBudget is the mutation function itself, so we can use it directly or wrap it if needed for state management like 'isPending'. 
     The original code used 'approvalMutation' with isPending state implicitly or explicitly. 
     The hooks returns 'approveBudget' as the mutateAsync function and 'isApprovingBudget' boolean.
  */
  const { isApprovingBudget } = usePilotMutations();

  /* Re-creating the mutation object structure to minimize changes in usage below or updating usage */
  const approvalMutation = {
    mutate: (variables) => approveBudget(variables).then(() => {
      setSelectedRequest(null);
      setComments('');
      // Toast is handled in hook or we can add specific success logic here if needed, but hook handles generic success.
    }),
    isPending: isApprovingBudget
  };

  const pendingRequests = pilots
    .filter(p => p.budget_approvals?.some(a => a.status === 'pending'))
    .map(p => ({
      pilot: p,
      requests: p.budget_approvals.filter(a => a.status === 'pending')
    }))
    .filter(item => item.requests.length > 0);

  const totalApproved = pilots.reduce((sum, p) =>
    sum + (p.budget_approvals?.filter(a => a.status === 'approved').length || 0), 0);

  const totalRejected = pilots.reduce((sum, p) =>
    sum + (p.budget_approvals?.filter(a => a.status === 'rejected').length || 0), 0);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 p-8 text-white">
        <h1 className="text-5xl font-bold mb-2">
          {t({ en: '💰 Budget Allocation Approval Gate', ar: '💰 بوابة الموافقة على توزيع الميزانية' })}
        </h1>
        <p className="text-xl text-white/90">
          {t({ en: 'Review and approve pilot budget requests', ar: 'مراجعة والموافقة على طلبات ميزانية التجارب' })}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Clock className="h-10 w-10 text-yellow-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-yellow-600">{pendingRequests.reduce((sum, item) => sum + item.requests.length, 0)}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Pending', ar: 'معلق' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{totalApproved}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Approved', ar: 'موافق' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <XCircle className="h-10 w-10 text-red-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-red-600">{totalRejected}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Rejected', ar: 'مرفوض' })}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Pending Budget Requests', ar: 'طلبات الميزانية المعلقة' })}</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <p className="text-center text-slate-500 py-8">{t({ en: 'No pending requests', ar: 'لا توجد طلبات معلقة' })}</p>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map(({ pilot, requests }) => requests.map((request, idx) => (
                <Card key={`${pilot.id}-${idx}`} className="border-2 border-yellow-200">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{language === 'ar' ? pilot.title_ar : pilot.title_en}</h3>
                        <div className="flex gap-2 mt-2">
                          <Badge>{request.phase}</Badge>
                          <Badge className="bg-green-100 text-green-800">{request.amount?.toLocaleString()} SAR</Badge>
                          <Badge variant="outline">{new Date(request.request_date).toLocaleDateString()}</Badge>
                        </div>
                        {selectedRequest === `${pilot.id}-${request.phase}` && (
                          <div className="mt-4 space-y-3">
                            <Textarea
                              value={comments}
                              onChange={(e) => setComments(e.target.value)}
                              placeholder={t({ en: 'Comments...', ar: 'تعليقات...' })}
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={() => approvalMutation.mutate({ pilot_id: pilot.id, phase: request.phase, amount: request.amount, action: 'approve', comments })}
                                className="bg-green-600"
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                {t({ en: 'Approve', ar: 'موافقة' })}
                              </Button>
                              <Button
                                onClick={() => approvalMutation.mutate({ pilot_id: pilot.id, phase: request.phase, amount: request.amount, action: 'reject', comments })}
                                variant="destructive"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                {t({ en: 'Reject', ar: 'رفض' })}
                              </Button>
                              <Button variant="outline" onClick={() => { setSelectedRequest(null); setComments(''); }}>
                                {t({ en: 'Cancel', ar: 'إلغاء' })}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                      {!selectedRequest && (
                        <Button onClick={() => setSelectedRequest(`${pilot.id}-${request.phase}`)} variant="outline">
                          {t({ en: 'Review', ar: 'مراجعة' })}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
