import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Activity, FileEdit, GitBranch, CheckCircle2, Scale, Building2, Shield, MessageSquare } from 'lucide-react';

export default function PolicyActivityLog({ policyId }) {
  const { language, isRTL, t } = useLanguage();

  const { data: activities = [] } = useQuery({
    queryKey: ['policy-activities', policyId],
    queryFn: async () => {
      // For now, generate from policy data - in production, would track in separate entity
      const policies = await base44.entities.PolicyRecommendation.list();
      const policy = policies.find(p => p.id === policyId);
      if (!policy) return [];

      const log = [];
      
      // Creation
      log.push({
        type: 'created',
        timestamp: policy.created_date,
        user: policy.created_by,
        description: 'Policy recommendation created'
      });

      // Workflow transitions (inferred from approvals)
      if (policy.approvals) {
        policy.approvals.forEach(approval => {
          log.push({
            type: 'approval',
            stage: approval.stage,
            timestamp: approval.approved_date,
            user: approval.approved_by,
            status: approval.status,
            description: `${approval.stage.replace(/_/g, ' ')} - ${approval.status}`,
            comments: approval.comments
          });
        });
      }

      // Sort by date
      return log.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
  });

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