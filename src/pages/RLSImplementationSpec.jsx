import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { 
  Database, Shield, Code, CheckCircle2, Copy, Download,
  ChevronDown, ChevronRight, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';

function RLSImplementationSpec() {
  const { t } = useLanguage();
  const [expandedSection, setExpandedSection] = useState(null);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('SQL copied to clipboard');
  };

  const sqlFunctions = {
    has_permission: `-- SQL Function: has_permission
-- Checks if a user has a specific permission through their assigned roles
CREATE OR REPLACE FUNCTION has_permission(user_email TEXT, permission_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM "User" u
    CROSS JOIN LATERAL unnest(u.assigned_roles) AS role_id
    JOIN "Role" r ON r.id = role_id
    WHERE u.email = user_email
      AND permission_name = ANY(r.permissions)
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_user_assigned_roles ON "User" USING GIN(assigned_roles);
CREATE INDEX IF NOT EXISTS idx_role_permissions ON "Role" USING GIN(permissions);`,

    has_active_delegation: `-- SQL Function: has_active_delegation
-- Checks if a user has an active delegation for a specific permission
CREATE OR REPLACE FUNCTION has_active_delegation(user_email TEXT, permission_name TEXT, check_date TIMESTAMP)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM "DelegationRule" d
    WHERE d.delegated_to_email = user_email
      AND permission_name = ANY(d.permissions)
      AND d.is_active = true
      AND check_date >= d.start_date
      AND (d.end_date IS NULL OR check_date <= d.end_date)
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;`,

    current_user_email: `-- SQL Function: current_user_email
-- Returns the email of the current authenticated user from JWT claims
CREATE OR REPLACE FUNCTION current_user_email()
RETURNS TEXT AS $$
BEGIN
  RETURN current_setting('request.jwt.claims.email', true);
END;
$$ LANGUAGE plpgsql STABLE;`,

    current_user_municipality: `-- SQL Function: current_user_municipality
-- Returns the municipality_id of the current user
CREATE OR REPLACE FUNCTION current_user_municipality()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT municipality_id 
    FROM "User" 
    WHERE email = current_user_email()
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;`,

    is_team_member: `-- SQL Function: is_team_member
-- Checks if user is a member of a specific team
CREATE OR REPLACE FUNCTION is_team_member(user_email TEXT, team_id_to_check TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM "TeamMember" tm
    WHERE tm.user_email = user_email
      AND tm.team_id = team_id_to_check
      AND tm.status = 'active'
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;`
  };

  const rlsPolicies = {
    Challenge: {
      entity: 'Challenge',
      policies: [
        {
          name: 'challenge_view_all',
          sql: `CREATE POLICY challenge_view_all ON "Challenge" FOR SELECT
USING (
  has_permission(current_user_email(), 'challenge_view_all')
  OR created_by = current_user_email()
  OR has_active_delegation(current_user_email(), 'challenge_view_all', now())
);`
        },
        {
          name: 'challenge_edit_all',
          sql: `CREATE POLICY challenge_edit_all ON "Challenge" FOR UPDATE
USING (
  has_permission(current_user_email(), 'challenge_edit_all')
  OR has_active_delegation(current_user_email(), 'challenge_edit_all', now())
);`
        },
        {
          name: 'challenge_edit_own',
          sql: `CREATE POLICY challenge_edit_own ON "Challenge" FOR UPDATE
USING (
  created_by = current_user_email()
  AND NOT EXISTS (
    SELECT 1 FROM "Challenge" c WHERE c.id = "Challenge".id AND c.status = 'archived'
  )
);`
        },
        {
          name: 'challenge_municipality_isolation',
          sql: `CREATE POLICY challenge_municipality_isolation ON "Challenge" FOR SELECT
USING (
  municipality_id = current_user_municipality()
  OR has_permission(current_user_email(), 'challenge_view_all')
);`
        },
        {
          name: 'challenge_team_access',
          sql: `CREATE POLICY challenge_team_access ON "Challenge" FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM unnest("Challenge".team_ids) AS team_id
    WHERE is_team_member(current_user_email(), team_id)
  )
);`
        },
        {
          name: 'challenge_delete',
          sql: `CREATE POLICY challenge_delete ON "Challenge" FOR DELETE
USING (
  has_permission(current_user_email(), 'challenge_delete')
);`
        },
        {
          name: 'challenge_hide_deleted',
          sql: `CREATE POLICY challenge_hide_deleted ON "Challenge" FOR SELECT
USING (
  is_deleted = false
  OR has_permission(current_user_email(), 'challenge_view_all')
);`
        }
      ]
    },
    Pilot: {
      entity: 'Pilot',
      policies: [
        {
          name: 'pilot_view_all',
          sql: `CREATE POLICY pilot_view_all ON "Pilot" FOR SELECT
USING (
  has_permission(current_user_email(), 'pilot_view_all')
  OR created_by = current_user_email()
);`
        },
        {
          name: 'pilot_manage',
          sql: `CREATE POLICY pilot_manage ON "Pilot" FOR UPDATE
USING (
  has_permission(current_user_email(), 'pilot_manage')
  OR has_active_delegation(current_user_email(), 'pilot_manage', now())
);`
        },
        {
          name: 'pilot_evaluate',
          sql: `CREATE POLICY pilot_evaluate ON "Pilot" FOR SELECT
USING (
  has_permission(current_user_email(), 'pilot_evaluate')
  OR has_active_delegation(current_user_email(), 'pilot_evaluate', now())
);`
        },
        {
          name: 'pilot_approve',
          sql: `CREATE POLICY pilot_approve ON "Pilot" FOR UPDATE
USING (
  has_permission(current_user_email(), 'pilot_approve')
  AND stage IN ('proposal', 'evaluation', 'approval_pending')
);`
        },
        {
          name: 'pilot_municipality_isolation',
          sql: `CREATE POLICY pilot_municipality_isolation ON "Pilot" FOR SELECT
USING (
  municipality_id = current_user_municipality()
  OR has_permission(current_user_email(), 'pilot_view_all')
);`
        }
      ]
    },
    Solution: {
      entity: 'Solution',
      policies: [
        {
          name: 'solution_view_all',
          sql: `CREATE POLICY solution_view_all ON "Solution" FOR SELECT
USING (
  is_verified = true
  OR created_by = current_user_email()
  OR has_permission(current_user_email(), 'solution_view_all')
);`
        },
        {
          name: 'solution_verify',
          sql: `CREATE POLICY solution_verify ON "Solution" FOR UPDATE
USING (
  has_permission(current_user_email(), 'solution_verify')
);`
        },
        {
          name: 'solution_edit_own',
          sql: `CREATE POLICY solution_edit_own ON "Solution" FOR UPDATE
USING (
  created_by = current_user_email()
  OR provider_id IN (
    SELECT id FROM "Organization" WHERE primary_contact_email = current_user_email()
  )
);`
        }
      ]
    },
    Budget: {
      entity: 'Budget',
      policies: [
        {
          name: 'budget_view',
          sql: `CREATE POLICY budget_view ON "Budget" FOR SELECT
USING (
  has_permission(current_user_email(), 'budget_view')
  OR created_by = current_user_email()
);`
        },
        {
          name: 'budget_approve',
          sql: `CREATE POLICY budget_approve ON "Budget" FOR UPDATE
USING (
  has_permission(current_user_email(), 'budget_approve')
  AND status = 'pending_approval'
);`
        }
      ]
    },
    RDProject: {
      entity: 'RDProject',
      policies: [
        {
          name: 'rd_view_all',
          sql: `CREATE POLICY rd_view_all ON "RDProject" FOR SELECT
USING (
  has_permission(current_user_email(), 'rd_view')
  OR created_by = current_user_email()
);`
        },
        {
          name: 'rd_manage',
          sql: `CREATE POLICY rd_manage ON "RDProject" FOR ALL
USING (
  has_permission(current_user_email(), 'rd_manage')
);`
        }
      ]
    },
    Program: {
      entity: 'Program',
      policies: [
        {
          name: 'program_view_all',
          sql: `CREATE POLICY program_view_all ON "Program" FOR SELECT
USING (
  is_published = true
  OR has_permission(current_user_email(), 'program_view_all')
  OR created_by = current_user_email()
);`
        },
        {
          name: 'program_manage',
          sql: `CREATE POLICY program_manage ON "Program" FOR ALL
USING (
  has_permission(current_user_email(), 'program_manage')
);`
        }
      ]
    },
    Audit: {
      entity: 'Audit',
      policies: [
        {
          name: 'audit_view',
          sql: `CREATE POLICY audit_view ON "Audit" FOR SELECT
USING (
  has_permission(current_user_email(), 'audit_view')
);`
        }
      ]
    },
    Contract: {
      entity: 'Contract',
      policies: [
        {
          name: 'contract_view',
          sql: `CREATE POLICY contract_view ON "Contract" FOR SELECT
USING (
  has_permission(current_user_email(), 'contract_view')
  OR party_a_id IN (SELECT id FROM "Municipality" WHERE contact_email = current_user_email())
  OR party_b_id IN (SELECT id FROM "Organization" WHERE primary_contact_email = current_user_email())
);`
        }
      ]
    },
    SandboxApplication: {
      entity: 'SandboxApplication',
      policies: [
        {
          name: 'sandbox_view_own',
          sql: `CREATE POLICY sandbox_view_own ON "SandboxApplication" FOR SELECT
USING (
  applicant_email = current_user_email()
  OR has_permission(current_user_email(), 'sandbox_view_all')
);`
        },
        {
          name: 'sandbox_approve',
          sql: `CREATE POLICY sandbox_approve ON "SandboxApplication" FOR UPDATE
USING (
  has_permission(current_user_email(), 'sandbox_approve')
  AND status IN ('submitted', 'under_review')
);`
        }
      ]
    },
    User: {
      entity: 'User',
      policies: [
        {
          name: 'user_view_own',
          sql: `-- User entity has built-in RLS from Base44 platform
-- Admin can view all, users can view only their own record
-- No additional policies needed unless custom requirements`
        }
      ]
    },
    PolicyRecommendation: {
      entity: 'PolicyRecommendation',
      policies: [
        {
          name: 'policy_view_all',
          sql: `CREATE POLICY policy_view_all ON "PolicyRecommendation" FOR SELECT
USING (
  has_permission(current_user_email(), 'view_all_policies')
  OR created_by = current_user_email()
);`
        },
        {
          name: 'policy_edit_own',
          sql: `CREATE POLICY policy_edit_own ON "PolicyRecommendation" FOR UPDATE
USING (
  (created_by = current_user_email() AND has_permission(current_user_email(), 'edit_own_policy'))
  OR has_permission(current_user_email(), 'policy_admin')
);`
        },
        {
          name: 'policy_legal_review',
          sql: `CREATE POLICY policy_legal_review ON "PolicyRecommendation" FOR UPDATE
USING (
  has_permission(current_user_email(), 'approve_legal_review')
  AND workflow_stage = 'legal_review'
);`
        },
        {
          name: 'policy_council_approve',
          sql: `CREATE POLICY policy_council_approve ON "PolicyRecommendation" FOR UPDATE
USING (
  has_permission(current_user_email(), 'approve_council')
  AND workflow_stage IN ('council_approval', 'public_consultation')
);`
        },
        {
          name: 'policy_ministry_approve',
          sql: `CREATE POLICY policy_ministry_approve ON "PolicyRecommendation" FOR UPDATE
USING (
  has_permission(current_user_email(), 'approve_ministry')
  AND workflow_stage = 'ministry_approval'
);`
        },
        {
          name: 'policy_implementation_update',
          sql: `CREATE POLICY policy_implementation_update ON "PolicyRecommendation" FOR UPDATE
USING (
  has_permission(current_user_email(), 'update_implementation')
  AND workflow_stage IN ('implementation', 'active')
);`
        }
      ]
    }
  };

  const deploymentSteps = [
    {
      step: 1,
      title: 'Backup Database',
      commands: ['pg_dump -h <host> -U <user> -d <database> -F c -b -v -f backup_pre_rls.dump'],
      critical: true
    },
    {
      step: 2,
      title: 'Create SQL Functions',
      commands: Object.keys(sqlFunctions),
      critical: true
    },
    {
      step: 3,
      title: 'Enable RLS on Tables',
      commands: [
        'ALTER TABLE "Challenge" ENABLE ROW LEVEL SECURITY;',
        'ALTER TABLE "Pilot" ENABLE ROW LEVEL SECURITY;',
        'ALTER TABLE "Solution" ENABLE ROW LEVEL SECURITY;',
        'ALTER TABLE "Budget" ENABLE ROW LEVEL SECURITY;',
        'ALTER TABLE "RDProject" ENABLE ROW LEVEL SECURITY;',
        'ALTER TABLE "Program" ENABLE ROW LEVEL SECURITY;',
        'ALTER TABLE "Audit" ENABLE ROW LEVEL SECURITY;',
        'ALTER TABLE "Contract" ENABLE ROW LEVEL SECURITY;',
        'ALTER TABLE "SandboxApplication" ENABLE ROW LEVEL SECURITY;',
        'ALTER TABLE "PolicyRecommendation" ENABLE ROW LEVEL SECURITY;'
      ],
      critical: true
    },
    {
      step: 4,
      title: 'Create RLS Policies',
      commands: ['Execute all policies from RLS Policies section'],
      critical: true
    },
    {
      step: 5,
      title: 'Test with Different User Roles',
      commands: ['Run validation queries from RLS Validation Dashboard'],
      critical: true
    },
    {
      step: 6,
      title: 'Monitor Performance',
      commands: ['Check query execution plans', 'Monitor database load'],
      critical: false
    }
  ];

  const allPoliciesSQL = () => {
    let sql = '-- ========================================\n';
    sql += '-- POSTGRESQL RLS IMPLEMENTATION\n';
    sql += '-- Saudi Innovates - National Municipal Innovation Platform\n';
    sql += '-- ========================================\n\n';
    
    sql += '-- STEP 1: CREATE SQL FUNCTIONS\n';
    sql += '-- ========================================\n\n';
    Object.entries(sqlFunctions).forEach(([name, code]) => {
      sql += code + '\n\n';
    });

    sql += '\n-- STEP 2: ENABLE RLS ON TABLES\n';
    sql += '-- ========================================\n\n';
    Object.keys(rlsPolicies).forEach(entity => {
      sql += `ALTER TABLE "${entity}" ENABLE ROW LEVEL SECURITY;\n`;
    });

    sql += '\n\n-- STEP 3: CREATE RLS POLICIES\n';
    sql += '-- ========================================\n\n';
    Object.entries(rlsPolicies).forEach(([entity, data]) => {
      sql += `-- ${entity} Policies\n`;
      sql += '-- ----------------------------------------\n\n';
      data.policies.forEach(policy => {
        sql += policy.sql + '\n\n';
      });
    });

    return sql;
  };

  const downloadSQL = () => {
    const sql = allPoliciesSQL();
    const blob = new Blob([sql], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rls_implementation.sql';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    toast.success('SQL file downloaded');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-red-900 via-red-800 to-red-700 p-8 text-white">
        <Shield className="absolute top-4 right-4 h-32 w-32 opacity-10" />
        <h1 className="text-4xl font-bold mb-2">
          {t({ en: '🔒 RLS Implementation Specification', ar: '🔒 مواصفات تنفيذ RLS' })}
        </h1>
        <p className="text-lg text-white/90">
          {t({ 
            en: 'Complete PostgreSQL Row-Level Security policies for all 80 RBAC permissions', 
            ar: 'سياسات أمان مستوى الصفوف الكاملة لجميع الـ 80 صلاحية RBAC' 
          })}
        </p>
        <div className="mt-4 flex gap-3">
          <Button onClick={downloadSQL} variant="secondary" className="gap-2">
            <Download className="h-4 w-4" />
            Download Complete SQL
          </Button>
          <Button onClick={() => copyToClipboard(allPoliciesSQL())} variant="outline" className="gap-2 text-white border-white hover:bg-white/10">
            <Copy className="h-4 w-4" />
            Copy All SQL
          </Button>
        </div>
      </div>

      {/* Warning */}
      <Card className="border-2 border-amber-400 bg-amber-50">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <AlertTriangle className="h-8 w-8 text-amber-600 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-amber-900 mb-2">
                {t({ en: '⚠️ Critical Implementation Notes', ar: '⚠️ ملاحظات التنفيذ الحرجة' })}
              </h3>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• <strong>Backup database before deployment</strong></li>
                <li>• Test in staging environment first</li>
                <li>• JWT claims must include: email, role, municipality_id</li>
                <li>• Service role connections must bypass RLS (for backend operations)</li>
                <li>• Monitor query performance after deployment (indexes may need tuning)</li>
                <li>• Use RLS Validation Dashboard to verify all policies work correctly</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deployment Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            {t({ en: 'Deployment Steps', ar: 'خطوات النشر' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deploymentSteps.map((step) => (
              <div key={step.step} className="flex gap-4 p-4 bg-slate-50 rounded-lg border">
                <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center font-bold ${step.critical ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}>
                  {step.step}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{step.title}</h4>
                    {step.critical && <Badge variant="destructive">Critical</Badge>}
                  </div>
                  <div className="space-y-1">
                    {step.commands.map((cmd, idx) => (
                      <code key={idx} className="block text-xs bg-slate-800 text-green-400 p-2 rounded font-mono">
                        {cmd}
                      </code>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SQL Functions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-6 w-6 text-blue-600" />
            {t({ en: 'SQL Functions', ar: 'دوال SQL' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(sqlFunctions).map(([name, sql]) => (
              <div key={name} className="border rounded-lg overflow-hidden">
                <div className="bg-slate-100 px-4 py-2 flex justify-between items-center">
                  <code className="font-mono text-sm font-semibold">{name}()</code>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(sql)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <pre className="bg-slate-900 text-green-400 p-4 overflow-x-auto text-xs">
                  {sql}
                </pre>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* RLS Policies by Entity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6 text-purple-600" />
            {t({ en: 'RLS Policies by Entity', ar: 'سياسات RLS حسب الكيان' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(rlsPolicies).map(([entity, data]) => {
              const isExpanded = expandedSection === entity;
              return (
                <div key={entity} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedSection(isExpanded ? null : entity)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Database className="h-5 w-5 text-purple-600" />
                      <span className="font-semibold text-lg">{entity}</span>
                      <Badge>{data.policies.length} policies</Badge>
                    </div>
                    {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  </button>
                  
                  {isExpanded && (
                    <div className="border-t bg-white p-4 space-y-4">
                      {data.policies.map((policy, idx) => (
                        <div key={idx} className="border rounded-lg overflow-hidden">
                          <div className="bg-purple-50 px-4 py-2 flex justify-between items-center">
                            <code className="font-mono text-sm font-semibold text-purple-900">{policy.name}</code>
                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(policy.sql)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <pre className="bg-slate-900 text-purple-400 p-4 overflow-x-auto text-xs">
                            {policy.sql}
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Database className="h-12 w-12 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{Object.keys(rlsPolicies).length}</p>
            <p className="text-sm text-slate-600">Entities</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">
              {Object.values(rlsPolicies).reduce((acc, data) => acc + data.policies.length, 0)}
            </p>
            <p className="text-sm text-slate-600">RLS Policies</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Code className="h-12 w-12 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{Object.keys(sqlFunctions).length}</p>
            <p className="text-sm text-slate-600">SQL Functions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-red-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-red-600">80</p>
            <p className="text-sm text-slate-600">RBAC Permissions</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ProtectedPage(RLSImplementationSpec, { 
  requiredPermissions: ['platform_admin', 'security_manage'] 
});