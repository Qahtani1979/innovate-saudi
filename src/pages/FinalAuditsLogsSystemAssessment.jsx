import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { 
  Shield, 
  CheckCircle2, 
  Database, 
  FileText,
  AlertTriangle,
  Activity,
  Lock,
  Eye
} from 'lucide-react';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

export default function FinalAuditsLogsSystemAssessment() {
  const { t } = useLanguage();

  const systemSummary = {
    name: 'Audits & Logs System',
    tables: 3,
    hooks: 2,
    pages: 4,
    components: 4,
    edgeFunctions: 1,
    dbFunctions: 7
  };

  const databaseTables = [
    {
      name: 'access_logs',
      columns: 14,
      description: 'Comprehensive audit trail for all platform actions',
      keyFields: ['id', 'action', 'entity_type', 'entity_id', 'user_id', 'user_email', 'ip_address', 'user_agent', 'metadata', 'old_values', 'new_values', 'is_admin_action', 'created_at'],
      status: 'complete'
    },
    {
      name: 'audits',
      columns: 29,
      description: 'Formal compliance and operational audits',
      keyFields: ['id', 'audit_code', 'entity_type', 'entity_id', 'audit_type', 'audit_scope', 'auditor_email', 'auditor_name', 'auditor_organization', 'audit_start_date', 'audit_end_date', 'status', 'findings', 'overall_rating', 'compliance_score', 'issues_identified', 'issues_critical', 'issues_high', 'corrective_actions', 'follow_up_required', 'follow_up_date', 'report_url', 'supporting_documents', 'audit_trail', 'is_deleted'],
      status: 'complete'
    },
    {
      name: 'incident_reports',
      columns: 22,
      description: 'Incident tracking for pilots and sandboxes',
      keyFields: ['id', 'pilot_id', 'sandbox_id', 'incident_type', 'severity', 'description', 'reported_by', 'status', 'corrective_actions', 'resolution_date'],
      status: 'complete'
    }
  ];

  const databaseFunctions = [
    { name: 'prevent_audit_log_deletion', description: 'Prevents deletion of audit logs for compliance', status: 'complete' },
    { name: 'prevent_audit_log_update', description: 'Prevents modification of audit logs for compliance', status: 'complete' },
    { name: 'set_admin_action_flag', description: 'Auto-flags admin actions in access_logs', status: 'complete' },
    { name: 'cleanup_old_audit_logs', description: 'Retention policy - cleans logs older than retention period', status: 'complete' },
    { name: 'log_challenge_changes_with_diff', description: 'Logs challenge changes with old/new value diffs', status: 'complete' },
    { name: 'log_challenge_permission_changes', description: 'Logs ownership and permission changes', status: 'complete' },
    { name: 'mask_email', description: 'Masks email addresses for privacy in logs', status: 'complete' }
  ];

  const hooks = [
    {
      name: 'useAuditLogger',
      path: 'src/hooks/useAuditLogger.js',
      description: 'Primary audit logging hook with specialized loggers',
      features: ['logAuditEvent', 'logBulkOperation', 'logDataExport', 'logAuthEvent', 'logStatusChange', 'logPermissionChange', 'logViewEvent', 'logCrudOperation'],
      status: 'complete'
    },
    {
      name: 'useAuditLog',
      path: 'src/hooks/useAuditLog.js',
      description: 'Entity-specific logging for Programs, Events, Challenges',
      features: ['logActivity', 'logProgramActivity', 'logEventActivity', 'logChallengeActivity', 'logApprovalActivity', 'logRegistrationActivity', 'logBulkActivity', 'logExportActivity'],
      status: 'complete'
    }
  ];

  const pages = [
    {
      name: 'AuditTrail',
      path: 'src/pages/AuditTrail.jsx',
      description: 'Activity log viewer for access_logs with filtering',
      features: ['Real-time data from access_logs', 'Entity/action filters', 'Search', 'Stats dashboard', 'Metadata display'],
      status: 'complete'
    },
    {
      name: 'AuditRegistry',
      path: 'src/pages/AuditRegistry.jsx',
      description: 'Formal audit management for compliance audits',
      features: ['CRUD for audits table', 'Type/status filters', 'Findings tracking', 'Critical issues count'],
      status: 'complete'
    },
    {
      name: 'AuditDetail',
      path: 'src/pages/AuditDetail.jsx',
      description: 'Detailed view of individual audits',
      features: ['Compliance score visualization', 'Findings list', 'Recommendations', 'Follow-up tracking'],
      status: 'complete'
    },
    {
      name: 'ErrorLogsConsole',
      path: 'src/pages/ErrorLogsConsole.jsx',
      description: 'System error monitoring console',
      features: ['Error/warning levels', 'Timestamp display', 'Admin-only access'],
      status: 'complete'
    }
  ];

  const components = [
    {
      name: 'ProgramEventAuditLog',
      path: 'src/components/programs/ProgramEventAuditLog.jsx',
      description: 'Audit log component for Programs & Events',
      features: ['Tab-based filtering (All/Programs/Events/Approvals)', 'Action icons', 'Metadata display', 'Date formatting'],
      status: 'complete'
    },
    {
      name: 'ImpersonationAuditLog',
      path: 'src/components/access/ImpersonationAuditLog.jsx',
      description: 'Tracks admin impersonation sessions',
      features: ['Duration tracking', 'Actions count', 'Admin user display'],
      status: 'complete'
    },
    {
      name: 'RoleAuditDetail',
      path: 'src/components/access/RoleAuditDetail.jsx',
      description: 'Role-based access audit details',
      features: ['7-day activity window', 'Permission tracking'],
      status: 'complete'
    },
    {
      name: 'PermissionUsageAnalytics',
      path: 'src/components/access/PermissionUsageAnalytics.jsx',
      description: 'Analytics on permission usage patterns',
      features: ['Date range filtering', 'Usage statistics'],
      status: 'complete'
    }
  ];

  const edgeFunctions = [
    {
      name: 'log-auth-event',
      path: 'supabase/functions/log-auth-event/index.ts',
      description: 'Server-side auth event logging',
      features: ['Failed login tracking', 'Brute force detection (5+ failures/hour)', 'Security alerts', 'IP address capture'],
      status: 'complete'
    }
  ];

  const entityLoggers = [
    {
      name: 'pilotAuditLogger',
      path: 'src/lib/api/pilotAuditLogger.js',
      description: 'Pilot-specific audit logging',
      features: ['logPilotAction', 'logBulkOperation', 'logDataExport', 'logStageChange'],
      status: 'complete'
    }
  ];

  const auditFeatures = [
    { feature: 'CRUD Operation Logging', description: 'All create/update/delete operations logged', status: 'complete' },
    { feature: 'Bulk Operation Logging', description: 'Bulk imports/exports/updates tracked', status: 'complete' },
    { feature: 'Data Export Logging', description: 'All data exports logged with filters and counts', status: 'complete' },
    { feature: 'Authentication Event Logging', description: 'Login success/failure, logout, password changes', status: 'complete' },
    { feature: 'Permission Change Logging', description: 'Role assignments, permission changes tracked', status: 'complete' },
    { feature: 'Stage/Status Change Logging', description: 'Workflow stage transitions logged', status: 'complete' },
    { feature: 'Admin Action Flagging', description: 'Admin actions auto-flagged in logs', status: 'complete' },
    { feature: 'IP Address Capture', description: 'Client IP captured for security audits', status: 'complete' },
    { feature: 'User Agent Capture', description: 'Browser/device info captured', status: 'complete' },
    { feature: 'Old/New Value Tracking', description: 'Change diffs stored for auditing', status: 'complete' },
    { feature: 'Metadata Storage', description: 'Rich JSONB metadata for each log entry', status: 'complete' },
    { feature: 'Immutable Logs', description: 'DB triggers prevent log modification/deletion', status: 'complete' },
    { feature: 'Brute Force Detection', description: 'Alerts on multiple failed login attempts', status: 'complete' },
    { feature: 'Log Retention Policy', description: 'Configurable cleanup of old logs', status: 'complete' }
  ];

  return (
    <PageLayout>
      <PageHeader
        icon={Shield}
        title={{ en: 'Audits & Logs System Assessment', ar: 'تقييم نظام التدقيق والسجلات' }}
        description={{ en: 'Deep validation of audit logging, compliance tracking, and activity monitoring', ar: 'التحقق العميق من تسجيل التدقيق وتتبع الامتثال ومراقبة النشاط' }}
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-4 text-center">
            <Database className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{systemSummary.tables}</p>
            <p className="text-xs text-slate-600">Tables</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-4 text-center">
            <Activity className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">{systemSummary.hooks}</p>
            <p className="text-xs text-slate-600">Hooks</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-4 text-center">
            <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">{systemSummary.pages}</p>
            <p className="text-xs text-slate-600">Pages</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-4 text-center">
            <Eye className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-amber-600">{systemSummary.components}</p>
            <p className="text-xs text-slate-600">Components</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-indigo-50 to-white">
          <CardContent className="pt-4 text-center">
            <Lock className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-indigo-600">{systemSummary.edgeFunctions}</p>
            <p className="text-xs text-slate-600">Edge Functions</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-white">
          <CardContent className="pt-4 text-center">
            <Shield className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-600">{systemSummary.dbFunctions}</p>
            <p className="text-xs text-slate-600">DB Functions</p>
          </CardContent>
        </Card>
      </div>

      {/* Database Tables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Tables ({databaseTables.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {databaseTables.map((table, idx) => (
              <div key={idx} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold">{table.name}</h4>
                    <Badge variant="outline">{table.columns} columns</Badge>
                    <Badge className="bg-green-100 text-green-700">{table.status}</Badge>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-2">{table.description}</p>
                <div className="flex flex-wrap gap-1">
                  {table.keyFields.slice(0, 10).map((field, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{field}</Badge>
                  ))}
                  {table.keyFields.length > 10 && (
                    <Badge variant="secondary" className="text-xs">+{table.keyFields.length - 10} more</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Database Functions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Database Functions ({databaseFunctions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {databaseFunctions.map((func, idx) => (
              <div key={idx} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-sm">{func.name}</h4>
                  <Badge className="bg-green-100 text-green-700 text-xs">{func.status}</Badge>
                </div>
                <p className="text-xs text-slate-600">{func.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hooks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            React Hooks ({hooks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {hooks.map((hook, idx) => (
              <div key={idx} className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-semibold">{hook.name}</h4>
                  <Badge className="bg-green-100 text-green-700">{hook.status}</Badge>
                </div>
                <p className="text-xs text-slate-500 font-mono mb-2">{hook.path}</p>
                <p className="text-sm text-slate-600 mb-2">{hook.description}</p>
                <div className="flex flex-wrap gap-1">
                  {hook.features.map((feature, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{feature}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Pages ({pages.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pages.map((page, idx) => (
              <div key={idx} className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-semibold">{page.name}</h4>
                  <Badge className="bg-green-100 text-green-700">{page.status}</Badge>
                </div>
                <p className="text-xs text-slate-500 font-mono mb-2">{page.path}</p>
                <p className="text-sm text-slate-600 mb-2">{page.description}</p>
                <div className="flex flex-wrap gap-1">
                  {page.features.map((feature, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{feature}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Components */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Components ({components.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {components.map((comp, idx) => (
              <div key={idx} className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">{comp.name}</h4>
                  <Badge className="bg-green-100 text-green-700 text-xs">{comp.status}</Badge>
                </div>
                <p className="text-xs text-slate-600 mb-2">{comp.description}</p>
                <div className="flex flex-wrap gap-1">
                  {comp.features.slice(0, 3).map((f, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{f}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edge Functions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Edge Functions ({edgeFunctions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {edgeFunctions.map((func, idx) => (
            <div key={idx} className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="font-semibold">{func.name}</h4>
                <Badge className="bg-green-100 text-green-700">{func.status}</Badge>
              </div>
              <p className="text-xs text-slate-500 font-mono mb-2">{func.path}</p>
              <p className="text-sm text-slate-600 mb-2">{func.description}</p>
              <div className="flex flex-wrap gap-1">
                {func.features.map((feature, i) => (
                  <Badge key={i} variant="outline" className="text-xs">{feature}</Badge>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Entity Loggers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Entity-Specific Loggers ({entityLoggers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {entityLoggers.map((logger, idx) => (
            <div key={idx} className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="font-semibold">{logger.name}</h4>
                <Badge className="bg-green-100 text-green-700">{logger.status}</Badge>
              </div>
              <p className="text-xs text-slate-500 font-mono mb-2">{logger.path}</p>
              <p className="text-sm text-slate-600 mb-2">{logger.description}</p>
              <div className="flex flex-wrap gap-1">
                {logger.features.map((feature, i) => (
                  <Badge key={i} variant="outline" className="text-xs">{feature}</Badge>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Audit Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Audit Features ({auditFeatures.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {auditFeatures.map((item, idx) => (
              <div key={idx} className="p-3 border rounded-lg flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-sm">{item.feature}</h4>
                  <p className="text-xs text-slate-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Final Assessment */}
      <Card className="border-2 border-green-500 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle2 className="h-6 w-6" />
            System Assessment: COMPLETE
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">Validation Summary</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>3 database tables verified (access_logs, audits, incident_reports)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>7 database functions for audit protection and logging</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>2 comprehensive React hooks (useAuditLogger, useAuditLog)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>4 pages migrated to use supabase client</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>4 reusable audit log components</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>1 edge function for server-side auth logging</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>14 audit features implemented (CRUD, bulk, export, auth, permissions, etc.)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Immutable logs enforced via database triggers</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Brute force detection implemented</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-white rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">Fixes Applied</h4>
              <ul className="space-y-1 text-sm text-slate-700">
                <li>• AuditTrail.jsx: Replaced mock data with real access_logs queries</li>
                <li>• AuditRegistry.jsx: Switched from base44 to supabase client</li>
                <li>• AuditDetail.jsx: Switched from base44 to supabase client</li>
                <li>• AuditRegistry.jsx: Fixed column references (audit_scope, auditor_email, audit_start_date)</li>
                <li>• AuditDetail.jsx: Fixed column references (auditor_name, auditor_organization, audit_start_date)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}