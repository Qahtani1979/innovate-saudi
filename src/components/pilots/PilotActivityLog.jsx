import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '../LanguageContext';
import {
  Activity,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  FileText,
  PlayCircle,
  PauseCircle,
  StopCircle,
  TrendingUp,
  DollarSign,
  Users,
  Flag,
  Target,
  AlertTriangle,
  Repeat,
  RefreshCw,
  Upload,
  MessageSquare,
  BarChart3,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { useEntityActivity } from '@/hooks/useUserActivity';
import { useComments } from '@/hooks/useComments';
import { useEntityApprovalHistory } from '@/hooks/useApprovalRequests';

const ACTIVITY_ICONS = {
  created: PlayCircle,
  updated: RefreshCw,
  status_changed: TrendingUp,
  stage_changed: Target,
  submitted: Upload,
  approved: CheckCircle2,
  rejected: XCircle,
  launched: Flag,
  paused: PauseCircle,
  resumed: PlayCircle,
  terminated: StopCircle,
  completed: CheckCircle2,
  milestone_completed: Target,
  budget_approved: DollarSign,
  budget_updated: DollarSign,
  kpi_updated: BarChart3,
  risk_flagged: AlertTriangle,
  issue_logged: AlertCircle,
  pivot_approved: Repeat,
  team_updated: Users,
  comment_added: MessageSquare,
  evaluation_submitted: CheckCircle2,
  scaling_approved: Zap,
  archived: FileText,
  shared: Users,
  viewed: Activity
};

const ACTIVITY_COLORS = {
  created: 'text-blue-600 bg-blue-50 border-blue-200',
  updated: 'text-slate-600 bg-slate-50 border-slate-200',
  status_changed: 'text-purple-600 bg-purple-50 border-purple-200',
  stage_changed: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  submitted: 'text-blue-600 bg-blue-50 border-blue-200',
  approved: 'text-green-600 bg-green-50 border-green-200',
  rejected: 'text-red-600 bg-red-50 border-red-200',
  launched: 'text-teal-600 bg-teal-50 border-teal-200',
  paused: 'text-orange-600 bg-orange-50 border-orange-200',
  resumed: 'text-green-600 bg-green-50 border-green-200',
  terminated: 'text-red-600 bg-red-50 border-red-200',
  completed: 'text-green-600 bg-green-50 border-green-200',
  milestone_completed: 'text-teal-600 bg-teal-50 border-teal-200',
  budget_approved: 'text-green-600 bg-green-50 border-green-200',
  budget_updated: 'text-amber-600 bg-amber-50 border-amber-200',
  kpi_updated: 'text-blue-600 bg-blue-50 border-blue-200',
  risk_flagged: 'text-red-600 bg-red-50 border-red-200',
  issue_logged: 'text-orange-600 bg-orange-50 border-orange-200',
  pivot_approved: 'text-purple-600 bg-purple-50 border-purple-200',
  team_updated: 'text-blue-600 bg-blue-50 border-blue-200',
  comment_added: 'text-slate-600 bg-slate-50 border-slate-200',
  evaluation_submitted: 'text-green-600 bg-green-50 border-green-200',
  scaling_approved: 'text-purple-600 bg-purple-50 border-purple-200',
  archived: 'text-slate-600 bg-slate-50 border-slate-200',
  shared: 'text-blue-600 bg-blue-50 border-blue-200',
  viewed: 'text-slate-400 bg-slate-50 border-slate-200'
};

export default function PilotActivityLog({ pilotId }) {
  const { language, isRTL, t } = useLanguage();
  const [viewMode, setViewMode] = useState('timeline');

  /* 
   * Refactored to use Gold Standard Hooks
   */
  const { data: activities = [], isLoading } = useEntityActivity(pilotId);
  const { data: comments = [] } = useComments('pilot', pilotId);
  const { data: approvals = [] } = useEntityApprovalHistory(pilotId, 'pilot');

  // Combine all into unified timeline
  const combinedTimeline = [
    ...(activities || []).map(a => ({ ...a, source: 'activity' })),
    ...(comments || []).map(c => ({
      ...c,
      source: 'comment',
      activity_type: 'comment_added',
      description: c.comment_text,
      created_date: c.created_at, // Map created_at to created_date for consistency
      performed_by: c.user_email
    })),
    ...(approvals || []).map(a => ({
      ...a,
      source: 'approval',
      activity_type: a.approval_status === 'approved' ? 'approved' : a.approval_status === 'rejected' ? 'rejected' : 'submitted',
      description: `${a.approval_step || 'Approval'} gate: ${a.approval_status}`,
      created_date: a.review_date || a.created_at,
      performed_by: a.reviewer_email || 'System'
    }))
  ].sort((a, b) => new Date(b.created_date || b.created_at) - new Date(a.created_date || a.created_at));

  // Filter by category
  const [categoryFilter, setCategoryFilter] = useState('all');
  const filtered = categoryFilter === 'all'
    ? combinedTimeline
    : combinedTimeline.filter(item => {
      if (categoryFilter === 'workflow') return ['status_changed', 'stage_changed', 'submitted', 'approved', 'rejected'].includes(item.activity_type);
      if (categoryFilter === 'milestones') return ['milestone_completed', 'kpi_updated'].includes(item.activity_type);
      if (categoryFilter === 'budget') return ['budget_approved', 'budget_updated'].includes(item.activity_type);
      if (categoryFilter === 'risks') return ['risk_flagged', 'issue_logged'].includes(item.activity_type);
      return true;
    });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <Activity className="h-8 w-8 text-slate-400 animate-spin" />
            <span className="ml-3 text-slate-600">{t({ en: 'Loading activity...', ar: 'جاري التحميل...' })}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            {t({ en: 'Activity Log', ar: 'سجل النشاط' })}
            <Badge variant="outline">{filtered.length} {t({ en: 'events', ar: 'حدث' })}</Badge>
          </CardTitle>

          <div className="flex items-center gap-2">
            <Tabs value={viewMode} onValueChange={setViewMode}>
              <TabsList>
                <TabsTrigger value="timeline">{t({ en: 'Timeline', ar: 'الجدول الزمني' })}</TabsTrigger>
                <TabsTrigger value="table">{t({ en: 'Table', ar: 'جدول' })}</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 mt-4 flex-wrap">
          <Button
            size="sm"
            variant={categoryFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setCategoryFilter('all')}
          >
            {t({ en: 'All', ar: 'الكل' })}
          </Button>
          <Button
            size="sm"
            variant={categoryFilter === 'workflow' ? 'default' : 'outline'}
            onClick={() => setCategoryFilter('workflow')}
          >
            {t({ en: 'Workflow', ar: 'سير العمل' })}
          </Button>
          <Button
            size="sm"
            variant={categoryFilter === 'milestones' ? 'default' : 'outline'}
            onClick={() => setCategoryFilter('milestones')}
          >
            {t({ en: 'Milestones', ar: 'المعالم' })}
          </Button>
          <Button
            size="sm"
            variant={categoryFilter === 'budget' ? 'default' : 'outline'}
            onClick={() => setCategoryFilter('budget')}
          >
            {t({ en: 'Budget', ar: 'الميزانية' })}
          </Button>
          <Button
            size="sm"
            variant={categoryFilter === 'risks' ? 'default' : 'outline'}
            onClick={() => setCategoryFilter('risks')}
          >
            {t({ en: 'Risks', ar: 'المخاطر' })}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {viewMode === 'timeline' ? (
          <div className="space-y-4">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                {t({ en: 'No activity logged yet', ar: 'لا يوجد نشاط مسجل بعد' })}
              </div>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className={`absolute ${isRTL ? 'right-6' : 'left-6'} top-0 bottom-0 w-0.5 bg-slate-200`} />

                {filtered.map((item, idx) => {
                  const Icon = ACTIVITY_ICONS[item.activity_type] || Activity;
                  const colorClass = ACTIVITY_COLORS[item.activity_type] || 'text-slate-600 bg-slate-50 border-slate-200';

                  return (
                    <div key={idx} className="relative flex gap-4 mb-6">
                      {/* Icon */}
                      <div className={`relative z-10 flex-shrink-0 h-12 w-12 rounded-full border-2 ${colorClass} flex items-center justify-center`}>
                        <Icon className="h-5 w-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 pt-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">
                              {item.activity_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </p>
                            {item.description && (
                              <p className="text-sm text-slate-700 mt-1">{item.description}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-500">
                              {item.created_date && format(new Date(item.created_date), 'MMM dd, yyyy')}
                            </p>
                            <p className="text-xs text-slate-400">
                              {item.created_date && format(new Date(item.created_date), 'HH:mm')}
                            </p>
                          </div>
                        </div>

                        {/* Metadata */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {item.performed_by && (
                            <Badge variant="outline" className="text-xs">
                              <User className="h-3 w-3 mr-1" />
                              {item.performed_by}
                            </Badge>
                          )}

                          {item.source === 'approval' && (
                            <Badge className="bg-purple-100 text-purple-700 text-xs">
                              {item.gate_name}
                            </Badge>
                          )}

                          {item.metadata && Object.keys(item.metadata).length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {Object.keys(item.metadata).length} details
                            </Badge>
                          )}
                        </div>

                        {/* Old/New Values */}
                        {(item.old_value || item.new_value) && (
                          <div className="mt-3 p-3 bg-slate-50 rounded-lg border text-xs">
                            {item.old_value && (
                              <div className="mb-2">
                                <span className="text-slate-500">{t({ en: 'From:', ar: 'من:' })} </span>
                                <span className="font-medium text-red-700">{item.old_value}</span>
                              </div>
                            )}
                            {item.new_value && (
                              <div>
                                <span className="text-slate-500">{t({ en: 'To:', ar: 'إلى:' })} </span>
                                <span className="font-medium text-green-700">{item.new_value}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Approval-specific data */}
                        {item.source === 'approval' && (
                          <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200 text-xs">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-slate-600">{t({ en: 'Requester:', ar: 'الطالب:' })} </span>
                                <span className="font-medium">{item.requester_email}</span>
                              </div>
                              {item.reviewer_email && (
                                <div>
                                  <span className="text-slate-600">{t({ en: 'Reviewer:', ar: 'المراجع:' })} </span>
                                  <span className="font-medium">{item.reviewer_email}</span>
                                </div>
                              )}
                            </div>
                            {item.comments && (
                              <div className="mt-2 pt-2 border-t border-purple-200">
                                <p className="text-slate-700">{item.comments}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Comment-specific */}
                        {item.source === 'comment' && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm">
                            <p className="text-slate-700">{item.comment_text}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left p-3 font-semibold">{t({ en: 'Date', ar: 'التاريخ' })}</th>
                  <th className="text-left p-3 font-semibold">{t({ en: 'Event', ar: 'الحدث' })}</th>
                  <th className="text-left p-3 font-semibold">{t({ en: 'User', ar: 'المستخدم' })}</th>
                  <th className="text-left p-3 font-semibold">{t({ en: 'Details', ar: 'التفاصيل' })}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => {
                  const Icon = ACTIVITY_ICONS[item.activity_type] || Activity;

                  return (
                    <tr key={idx} className="border-b hover:bg-slate-50">
                      <td className="p-3">
                        <div className="text-xs text-slate-600">
                          {item.created_date && format(new Date(item.created_date), 'MMM dd, yyyy HH:mm') || item.created_at && format(new Date(item.created_at), 'MMM dd, yyyy HH:mm')}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-slate-900">
                            {item.activity_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-slate-700">
                        {item.performed_by || '-'}
                      </td>
                      <td className="p-3">
                        <p className="text-slate-700 text-xs">{item.description || '-'}</p>
                        {item.old_value && item.new_value && (
                          <p className="text-xs text-slate-500 mt-1">
                            <span className="text-red-600">{item.old_value}</span> → <span className="text-green-600">{item.new_value}</span>
                          </p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
