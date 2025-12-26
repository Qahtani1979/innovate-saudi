import { usePolicy } from '@/hooks/usePolicy';
import { useEntityApprovalHistory } from '@/hooks/useApprovalRequests';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Activity, FileEdit, GitBranch, CheckCircle2, Scale, Building2, Shield, MessageSquare } from 'lucide-react';

export default function PolicyActivityLog({ policyId }) {
  const { language, isRTL, t } = useLanguage();

  const { data: policy } = usePolicy(policyId);
  const { data: approvals = [] } = useEntityApprovalHistory(policyId, 'policy_recommendation');

  // Combine and sort activities
  const activities = [
    ...(policy ? [{
      type: 'created',
      timestamp: policy.created_at,
      // @ts-ignore - submitted_by is from extended type
      user: policy.submitted_by || 'Unknown',
      description: 'Policy recommendation created',
      stage: null,
      status: null,
      comments: null
    }] : []),
    ...approvals.map(approval => ({
      type: 'approval',
      stage: approval.request_type || 'approval',
      timestamp: approval.approved_at || approval.created_at,
      user: approval.approver_email || approval.requester_email,
      status: approval.approval_status || 'pending',
      description: approval.request_type ? `${approval.request_type.replace(/_/g, ' ')} - ${approval.approval_status}` : `Approval - ${approval.approval_status}`,
      comments: approval.rejection_reason || approval.requester_notes
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const activityIcons = {
    created: FileEdit,
    approval: CheckCircle2,
    workflow: GitBranch,
    default: Activity
  };

  const stageIcons = {
    legal_review: Scale,
    council_approval: Building2,
    ministry_approval: Shield,
    public_consultation: MessageSquare
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-slate-600" />
          <span>{t({ en: 'Activity Log', ar: 'سجل النشاط' })}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity, idx) => {
            const Icon = activity.stage ? stageIcons[activity.stage] : activityIcons[activity.type] || activityIcons.default;

            return (
              <div key={idx} className="flex items-start gap-3 pb-3 border-b last:border-0">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                  <Icon className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-slate-900">{activity.description}</p>
                    {activity.status && (
                      <Badge className={
                        activity.status === 'approved' ? 'bg-green-100 text-green-700' :
                          activity.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                      }>
                        {activity.status}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-600">
                    {activity.user} • {new Date(activity.timestamp).toLocaleString()}
                  </p>
                  {activity.comments && (
                    <p className="text-xs text-slate-700 mt-2 p-2 bg-slate-50 rounded">
                      {activity.comments}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
          {activities.length === 0 && (
            <div className="text-center py-6 text-slate-500 text-sm">
              {t({ en: 'No activity yet', ar: 'لا يوجد نشاط بعد' })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
