import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import ReviewerAI from './ReviewerAI';
import { useEmailTrigger } from '@/hooks/useEmailTrigger';
import { toast } from 'sonner';
import { useApprovalRequests } from '@/hooks/useApprovalRequests';

/**
 * InlineApprovalWizard - Quick approval interface for ApprovalCenter
 * Allows reviewers to approve/reject without leaving the queue
 */
export default function InlineApprovalWizard({
  approvalRequest,
  entityData,
  gateConfig,
  onComplete
}) {
  const { t, language, isRTL } = useLanguage();
  const { user: currentUser } = useAuth();
  const [comments, setComments] = useState('');
  const [showAI, setShowAI] = useState(false);
  const { triggerEmail } = useEmailTrigger();

  const { processApproval, isProcessing } = useApprovalRequests();

  const handleDecision = async (decision) => {
    const action = decision === 'approved' ? 'approve' : 'reject';
    const status = decision === 'approved' ? 'approved' :
      decision === 'rejected' ? 'rejected' :
        decision === 'conditional' ? 'conditional' : 'info_requested';

    processApproval({
      id: approvalRequest.entity_id,
      entityType: approvalRequest.entity_type,
      action: action === 'approve' ? 'approve' : 'reject',
      updates: {
        status: status, // Update the actual entity status if needed
        approved_at: new Date().toISOString(),
        approver_email: currentUser?.email
      },
      reason: comments,
      logMetadata: {
        decision,
        gate_name: approvalRequest.metadata?.gate_name
      }
    });

    if (onComplete) onComplete();
  };

  return (
    <Card className="border-2 border-blue-200" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {gateConfig.label[language]}
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAI(!showAI)}
          >
            {t({ en: showAI ? 'Hide AI' : 'Show AI', ar: showAI ? 'إخفاء الذكاء' : 'عرض الذكاء' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Entity Preview */}
        <div className="p-3 bg-slate-50 rounded border">
          <p className="text-xs text-slate-600 mb-1">
            {t({ en: 'Entity', ar: 'الكيان' })}
          </p>
          <p className="font-semibold text-slate-900">
            {entityData.title_en || entityData.name_en || entityData.code}
          </p>
          <p className="text-xs text-slate-600 mt-1">
            {t({ en: 'Submitted by', ar: 'قدمه' })}: {approvalRequest.requester_email}
          </p>
        </div>

        {/* AI Assistant (collapsible) */}
        {showAI && (
          <ReviewerAI
            entityType={approvalRequest.entity_type}
            entityData={entityData}
            gateName={approvalRequest.metadata?.gate_name}
            gateConfig={gateConfig}
            approvalRequest={approvalRequest}
          />
        )}

        {/* Reviewer Checklist */}
        <div>
          <p className="font-semibold text-slate-900 mb-2">
            {t({ en: 'Quick Checklist:', ar: 'قائمة سريعة:' })}
          </p>
          <div className="space-y-1">
            {gateConfig.reviewerChecklistItems?.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-slate-400" />
                {item[language]}
              </div>
            ))}
          </div>
        </div>

        {/* Comments */}
        <Textarea
          placeholder={t({ en: 'Add comments (optional)...', ar: 'أضف تعليقات (اختياري)...' })}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={3}
        />

        {/* Decision Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => handleDecision('approved')}
            disabled={isProcessing}
            className="bg-green-600 hover:bg-green-700"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Approve', ar: 'موافقة' })}
          </Button>
          <Button
            onClick={() => handleDecision('conditional')}
            disabled={isProcessing}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            {t({ en: 'Conditional', ar: 'مشروط' })}
          </Button>
          <Button
            onClick={() => handleDecision('rejected')}
            disabled={isProcessing}
            variant="destructive"
          >
            <XCircle className="h-4 w-4 mr-2" />
            {t({ en: 'Reject', ar: 'رفض' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}