import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from './LanguageContext';
import { Flag, CheckCircle2, XCircle, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';

function MilestoneApprovalGate({ pilot, milestone, milestoneIndex, onClose }) {
  const { language, isRTL, t } = useLanguage();
  const [decision, setDecision] = useState('');
  const [comments, setComments] = useState('');
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const approveMutation = useMutation({
    mutationFn: async (approved) => {
      const updatedMilestones = [...(pilot.milestones || [])];
      updatedMilestones[milestoneIndex] = {
        ...milestone,
        approval_status: approved ? 'approved' : 'rejected',
        approved_by: user?.email,
        approval_date: new Date().toISOString(),
        approval_comments: comments
      };
      
      await base44.entities.Pilot.update(pilot.id, {
        milestones: updatedMilestones
      });

      await base44.entities.SystemActivity.create({
        activity_type: 'milestone_approval',
        entity_type: 'Pilot',
        entity_id: pilot.id,
        description: `Milestone "${milestone.name}" ${approved ? 'approved' : 'rejected'}`,
        metadata: { milestone_index: milestoneIndex, decision: approved ? 'approved' : 'rejected', comments }
      });
    },
    onSuccess: (_, approved) => {
      queryClient.invalidateQueries(['pilot']);
      toast.success(t({
        en: approved ? 'Milestone approved' : 'Milestone rejected',
        ar: approved ? 'تمت الموافقة على المعلم' : 'تم رفض المعلم'
      }));
      if (onClose) onClose();
    }
  });

  const requiresApproval = milestone.requires_approval !== false;

  if (!requiresApproval) {
    return (
      <div className="p-4 bg-slate-50 rounded-lg border">
        <p className="text-sm text-slate-600">
          {t({ en: 'This milestone does not require approval', ar: 'هذا المعلم لا يتطلب موافقة' })}
        </p>
      </div>
    );
  }

  return (
    <Card className="border-2 border-blue-300" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flag className="h-5 w-5 text-blue-600" />
          {t({ en: 'Milestone Approval', ar: 'الموافقة على المعلم' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <Flag className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <p className="font-semibold text-blue-900">
                {language === 'ar' && milestone.name_ar ? milestone.name_ar : milestone.name}
              </p>
              {milestone.due_date && (
                <p className="text-xs text-blue-700 mt-1">
                  {t({ en: 'Due:', ar: 'الموعد:' })} {new Date(milestone.due_date).toLocaleDateString()}
                </p>
              )}
            </div>
            <Badge className={
              milestone.status === 'completed' ? 'bg-green-100 text-green-700' :
              milestone.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
              'bg-slate-100 text-slate-700'
            }>
              {milestone.status}
            </Badge>
          </div>

          {milestone.description && (
            <p className="text-sm text-slate-700 mt-2">
              {language === 'ar' && milestone.description_ar ? milestone.description_ar : milestone.description}
            </p>
          )}

          {milestone.deliverables && milestone.deliverables.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-blue-900 mb-1">
                {t({ en: 'Deliverables:', ar: 'المخرجات:' })}
              </p>
              <ul className="space-y-1">
                {milestone.deliverables.map((del, i) => (
                  <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>{del}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {milestone.evidence_url && (
          <div className="p-3 bg-white rounded-lg border">
            <p className="text-xs text-slate-500 mb-1">{t({ en: 'Supporting Evidence', ar: 'الأدلة الداعمة' })}</p>
            <a
              href={milestone.evidence_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              <FileText className="h-4 w-4" />
              {t({ en: 'View Document', ar: 'عرض المستند' })}
            </a>
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-slate-900 mb-2 block">
            {t({ en: 'Review Comments', ar: 'تعليقات المراجعة' })}
          </label>
          <Textarea
            placeholder={t({ en: 'Add your review comments...', ar: 'أضف تعليقات المراجعة...' })}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={4}
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
          <Button
            onClick={() => approveMutation.mutate(false)}
            disabled={approveMutation.isPending}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            {approveMutation.isPending ? (
              <Loader2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
            ) : (
              <XCircle className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            )}
            {t({ en: 'Reject', ar: 'رفض' })}
          </Button>
          <Button
            onClick={() => approveMutation.mutate(true)}
            disabled={approveMutation.isPending}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {approveMutation.isPending ? (
              <Loader2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
            ) : (
              <CheckCircle2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            )}
            {t({ en: 'Approve', ar: 'موافقة' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default MilestoneApprovalGate;