import React from 'react';
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, XCircle, Target, FileText, Layers } from 'lucide-react';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

// Challenge Detail Tab Audit Data
const tabAuditData = [
  { name: 'Overview', status: 'complete', features: ['Title/Description', 'Status badges', 'Priority', 'Municipality/Sector'], coverage: 100 },
  { name: 'Problem Statement', status: 'complete', features: ['Current situation', 'Root cause', 'Affected population', 'Data evidence'], coverage: 100 },
  { name: 'Desired Outcome', status: 'complete', features: ['Expected results', 'Success criteria', 'KPIs', 'Timeline'], coverage: 100 },
  { name: 'Stakeholders', status: 'complete', features: ['Stakeholder map', 'Contact info', 'Roles', 'Engagement level'], coverage: 100 },
  { name: 'Strategy Alignment', status: 'complete', features: ['Linked plans', 'Objectives alignment', 'Gap derivation', 'Priority scoring'], coverage: 100 },
  { name: 'Treatment Plan', status: 'complete', features: ['Approach', 'Milestones', 'Progress tracking', 'Assigned owner'], coverage: 100 },
  { name: 'Attachments', status: 'complete', features: ['File upload', 'Preview', 'Download', 'Delete'], coverage: 100 },
  { name: 'Activity Log', status: 'complete', features: ['Timeline view', 'User actions', 'Status changes', 'Comments'], coverage: 100 },
  { name: 'Comments', status: 'complete', features: ['Add comment', 'Reply', 'Internal/External', 'Resolve'], coverage: 100 },
  { name: 'Proposals', status: 'complete', features: ['List proposals', 'Review workflow', 'Scoring', 'Selection'], coverage: 100 },
  { name: 'Linked Entities', status: 'complete', features: ['Pilots', 'R&D Projects', 'Programs', 'Solutions'], coverage: 100 },
  { name: 'AI Analysis', status: 'complete', features: ['Innovation framing', 'Root cause AI', 'Solution recommendations', 'Impact prediction'], coverage: 100 },
  { name: 'Impact Report', status: 'complete', features: ['Metrics summary', 'Before/After', 'Lessons learned', 'Export PDF'], coverage: 100 },
  { name: 'Publishing', status: 'complete', features: ['Publish workflow', 'Approval gate', 'Public visibility', 'Unpublish'], coverage: 100 },
  { name: 'Versioning', status: 'complete', features: ['Version history', 'Compare versions', 'Restore', 'Audit trail'], coverage: 100 },
];

const crudStatus = [
  { operation: 'Create', status: 'complete', page: 'ChallengeCreate', notes: 'Multi-step wizard with validation' },
  { operation: 'Read', status: 'complete', page: 'ChallengeDetail', notes: '15 tabs with full data display' },
  { operation: 'Update', status: 'complete', page: 'ChallengeEdit', notes: 'Full edit with field-level permissions' },
  { operation: 'Delete', status: 'complete', page: 'Soft delete', notes: 'is_deleted flag with audit trail' },
  { operation: 'List', status: 'complete', page: 'Challenges', notes: 'Filters, search, pagination, export' },
  { operation: 'Bulk Import', status: 'complete', page: 'ChallengeImport', notes: 'CSV/Excel with validation' },
  { operation: 'Export', status: 'complete', page: 'Challenges', notes: 'CSV, Excel, PDF export' },
];

function ChallengeDetailFullAudit() {
  const { t, isRTL } = useLanguage();

  const getStatusIcon = (status) => {
    switch (status) {
      case 'complete': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'partial': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'missing': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'complete': return <Badge className="bg-green-100 text-green-700">Complete</Badge>;
      case 'partial': return <Badge className="bg-yellow-100 text-yellow-700">Partial</Badge>;
      case 'missing': return <Badge className="bg-red-100 text-red-700">Missing</Badge>;
      default: return null;
    }
  };

  const completeTabs = tabAuditData.filter(t => t.status === 'complete').length;
  const overallCoverage = Math.round(tabAuditData.reduce((sum, t) => sum + t.coverage, 0) / tabAuditData.length);

  return (
    <PageLayout>
      <PageHeader
        icon={FileText}
        title={{ en: 'Challenge Detail Full Audit', ar: 'تدقيق كامل لتفاصيل التحديات' }}
        description={{ en: 'Comprehensive audit of ChallengeDetail page tabs and CRUD operations', ar: 'تدقيق شامل لعلامات تبويب صفحة تفاصيل التحديات وعمليات CRUD' }}
      />

      <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-900">{completeTabs}/{tabAuditData.length}</p>
              <p className="text-sm text-green-600">{t({ en: 'Tabs Complete', ar: 'علامات تبويب مكتملة' })}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-blue-900">{overallCoverage}%</p>
              <p className="text-sm text-blue-600">{t({ en: 'Overall Coverage', ar: 'التغطية الإجمالية' })}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-purple-900">{crudStatus.filter(c => c.status === 'complete').length}/{crudStatus.length}</p>
              <p className="text-sm text-purple-600">{t({ en: 'CRUD Operations', ar: 'عمليات CRUD' })}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-amber-900">{tabAuditData.reduce((sum, t) => sum + t.features.length, 0)}</p>
              <p className="text-sm text-amber-600">{t({ en: 'Total Features', ar: 'إجمالي الميزات' })}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tab Audit */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              {t({ en: 'ChallengeDetail Tab Audit', ar: 'تدقيق علامات تبويب تفاصيل التحديات' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">{t({ en: 'Tab Name', ar: 'اسم التبويب' })}</th>
                    <th className="text-left p-3">{t({ en: 'Status', ar: 'الحالة' })}</th>
                    <th className="text-left p-3">{t({ en: 'Features', ar: 'الميزات' })}</th>
                    <th className="text-center p-3">{t({ en: 'Coverage', ar: 'التغطية' })}</th>
                  </tr>
                </thead>
                <tbody>
                  {tabAuditData.map((tab) => (
                    <tr key={tab.name} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(tab.status)}
                          <span className="font-medium">{tab.name}</span>
                        </div>
                      </td>
                      <td className="p-3">{getStatusBadge(tab.status)}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {tab.features.map((feature, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">{feature}</Badge>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <Badge className={tab.coverage === 100 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                          {tab.coverage}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* CRUD Operations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {t({ en: 'CRUD Operations Audit', ar: 'تدقيق عمليات CRUD' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">{t({ en: 'Operation', ar: 'العملية' })}</th>
                    <th className="text-left p-3">{t({ en: 'Status', ar: 'الحالة' })}</th>
                    <th className="text-left p-3">{t({ en: 'Page/Component', ar: 'الصفحة/المكون' })}</th>
                    <th className="text-left p-3">{t({ en: 'Notes', ar: 'ملاحظات' })}</th>
                  </tr>
                </thead>
                <tbody>
                  {crudStatus.map((crud) => (
                    <tr key={crud.operation} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{crud.operation}</td>
                      <td className="p-3">{getStatusBadge(crud.status)}</td>
                      <td className="p-3">
                        <Badge variant="outline">{crud.page}</Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">{crud.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

export default ProtectedPage(ChallengeDetailFullAudit, { requireAdmin: true });
