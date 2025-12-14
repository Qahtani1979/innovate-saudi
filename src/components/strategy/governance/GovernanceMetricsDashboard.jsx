import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/components/LanguageContext';
import { useStrategySignoffs } from '@/hooks/strategy/useStrategySignoffs';
import { useStrategyVersions } from '@/hooks/strategy/useStrategyVersions';
import { useCommitteeDecisions } from '@/hooks/strategy/useCommitteeDecisions';
import { 
  BarChart3, TrendingUp, Clock, CheckCircle2, AlertTriangle, 
  Users, GitBranch, FileSignature, Loader2
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function GovernanceMetricsDashboard({ planId }) {
  const { t } = useLanguage();
  const { signoffs, isLoading: signoffsLoading } = useStrategySignoffs(planId);
  const { versions, isLoading: versionsLoading } = useStrategyVersions(planId);
  const { decisions, isLoading: decisionsLoading } = useCommitteeDecisions(planId);

  const isLoading = signoffsLoading || versionsLoading || decisionsLoading;

  const signoffStats = {
    total: signoffs?.length || 0,
    approved: signoffs?.filter(s => s.status === 'approved').length || 0,
    pending: signoffs?.filter(s => s.status === 'pending').length || 0,
    overdue: signoffs?.filter(s => s.status === 'pending' && s.due_date && new Date(s.due_date) < new Date()).length || 0
  };

  const versionStats = {
    total: versions?.length || 0,
    current: versions?.filter(v => v.status === 'approved').length || 0,
    drafts: versions?.filter(v => v.status === 'draft').length || 0
  };

  const decisionStats = {
    total: decisions?.length || 0,
    approvals: decisions?.filter(d => d.decision_type === 'approval').length || 0,
    pending: decisions?.filter(d => d.decision_type === 'deferral').length || 0
  };

  const slaCompliance = signoffStats.total > 0 
    ? Math.round(((signoffStats.total - signoffStats.overdue) / signoffStats.total) * 100) 
    : 100;

  const approvalRate = signoffStats.total > 0 
    ? Math.round((signoffStats.approved / signoffStats.total) * 100) 
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              {t({ en: 'SLA Compliance', ar: 'الالتزام بالاتفاقية' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{slaCompliance}%</div>
            <Progress value={slaCompliance} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {signoffStats.overdue} {t({ en: 'overdue', ar: 'متأخر' })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileSignature className="h-4 w-4 text-blue-600" />
              {t({ en: 'Approval Rate', ar: 'معدل الموافقة' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvalRate}%</div>
            <Progress value={approvalRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {signoffStats.approved}/{signoffStats.total} {t({ en: 'approved', ar: 'موافق عليه' })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-purple-600" />
              {t({ en: 'Versions', ar: 'الإصدارات' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{versionStats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {versionStats.current} {t({ en: 'current', ar: 'حالي' })}, {versionStats.drafts} {t({ en: 'drafts', ar: 'مسودات' })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-orange-600" />
              {t({ en: 'Committee Decisions', ar: 'قرارات اللجان' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{decisionStats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {decisionStats.approvals} {t({ en: 'approvals', ar: 'موافقات' })}, {decisionStats.pending} {t({ en: 'pending', ar: 'معلق' })}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            {t({ en: 'Governance Summary', ar: 'ملخص الحوكمة' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-medium">{t({ en: 'Sign-offs', ar: 'التوقيعات' })}</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span>{t({ en: 'Total', ar: 'الإجمالي' })}</span><span>{signoffStats.total}</span></div>
                <div className="flex justify-between"><span>{t({ en: 'Approved', ar: 'موافق' })}</span><span className="text-green-600">{signoffStats.approved}</span></div>
                <div className="flex justify-between"><span>{t({ en: 'Pending', ar: 'معلق' })}</span><span className="text-yellow-600">{signoffStats.pending}</span></div>
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <GitBranch className="h-5 w-5 text-purple-600" />
                <span className="font-medium">{t({ en: 'Versions', ar: 'الإصدارات' })}</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span>{t({ en: 'Total', ar: 'الإجمالي' })}</span><span>{versionStats.total}</span></div>
                <div className="flex justify-between"><span>{t({ en: 'Current', ar: 'حالي' })}</span><span className="text-green-600">{versionStats.current}</span></div>
                <div className="flex justify-between"><span>{t({ en: 'Drafts', ar: 'مسودات' })}</span><span className="text-blue-600">{versionStats.drafts}</span></div>
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-orange-600" />
                <span className="font-medium">{t({ en: 'Decisions', ar: 'القرارات' })}</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span>{t({ en: 'Total', ar: 'الإجمالي' })}</span><span>{decisionStats.total}</span></div>
                <div className="flex justify-between"><span>{t({ en: 'Approvals', ar: 'موافقات' })}</span><span className="text-green-600">{decisionStats.approvals}</span></div>
                <div className="flex justify-between"><span>{t({ en: 'Deferred', ar: 'مؤجل' })}</span><span className="text-yellow-600">{decisionStats.pending}</span></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
