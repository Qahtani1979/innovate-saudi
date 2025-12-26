import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

/**
 * Reusable RBAC Section for Coverage Reports
 * 
 * @param {Object} props
 * @param {string} props.entityName - Name of the entity (e.g., "Challenge", "Solution", "Pilot")
 * @param {Array} props.permissions - Array of permission objects: { key: string, label: string, description: string }
 * @param {Array} props.roles - Array of role objects: { name: string, badge: string, access: string, permissions: string[], description: string, rls: string }
 * @param {Array} props.statusBasedRules - Array of status-based access rules
 * @param {Object} props.fieldLevelSecurity - { confidential: string[], publicSafe: string[] }
 * @param {Object} props.municipalScoping - { description: string, rules: string[] }
 * @param {Object} props.expertSystem - { status: string, entities: number, pages: number, integration: string }
 * @param {Object} props.expandedSections - State for section expansion
 * @param {Function} props.toggleSection - Function to toggle sections
 * @param {string} props.sectionKey - Unique key for this RBAC section
 */
export default function RBACSection({
  entityName,
  permissions = [],
  roles = [],
  statusBasedRules = [],
  fieldLevelSecurity = {},
  municipalScoping = {},
  expertSystem = {},
  expandedSections = {},
  toggleSection,
  sectionKey = 'rbac'
}) {
  const { t } = useLanguage();

  return (
    <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-white">
      <CardHeader>
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between"
        >
          <CardTitle className="flex items-center gap-2 text-green-900">
            <Shield className="h-6 w-6" />
            {t({ en: `RBAC & Access Control - ${entityName}`, ar: `التحكم بالوصول والأدوار - ${entityName}` })}
            <Badge className="bg-green-600 text-white">Complete</Badge>
          </CardTitle>
          {expandedSections[sectionKey] ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>
      </CardHeader>
      {expandedSections[sectionKey] && (
        <CardContent className="space-y-6">
          {/* Entity-Specific Permissions */}
          <div>
            <p className="font-semibold text-green-900 mb-3">✅ {entityName}-Specific Permissions</p>
            <p className="text-xs text-slate-600 mb-3">From RolePermissionManager - Role entity with permissions[] array</p>
            <div className="grid md:grid-cols-3 gap-2">
              {permissions.map((perm, i) => (
                <div key={i} className="p-3 bg-white rounded border border-green-300 text-sm text-green-700">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mb-1" />
                  <strong>{perm.key}</strong>
                  <p className="text-xs text-slate-600">{perm.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Role-Based Access Matrix */}
          <div>
            <p className="font-semibold text-green-900 mb-3">✅ Platform Roles & {entityName} Access Matrix</p>
            <p className="text-xs text-slate-600 mb-4">Based on Role entity with permissions[], is_expert_role, parent_role_id</p>
            
            <div className="space-y-3">
              {roles.map((role, i) => (
                <div key={i} className={`p-4 bg-white rounded border-2 ${role.borderColor || 'border-blue-300'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={role.badgeColor || 'bg-blue-600'}>{role.name}</Badge>
                    <span className="text-sm font-medium">{role.access}</span>
                    {role.expertRole && (
                      <Badge variant="outline" className="text-xs">is_expert_role = true</Badge>
                    )}
                    {role.parentRole && (
                      <Badge variant="outline" className="text-xs">parent_role_id → {role.parentRole}</Badge>
                    )}
                  </div>
                  <div className="mb-2">
                    <p className="text-xs font-semibold text-slate-700 mb-1">{entityName} Permissions:</p>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.map((p, j) => (
                        <Badge key={j} variant="outline" className="text-xs">{p}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 mt-2">{role.description}</div>
                  {role.rls && (
                    <div className="text-xs text-blue-700 mt-2 italic">RLS: {role.rls}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Field-Level Security */}
          {fieldLevelSecurity && Object.keys(fieldLevelSecurity).length > 0 && (
            <div>
              <p className="font-semibold text-green-900 mb-3">✅ Field-Level Security & Visibility</p>
              <div className="grid md:grid-cols-2 gap-3">
                {fieldLevelSecurity.confidential && (
                  <div className="p-3 bg-white rounded border">
                    <p className="text-xs font-semibold text-slate-700 mb-2">Confidential Fields (Admin/Owner Only):</p>
                    <div className="text-xs text-slate-600 space-y-1">
                      {fieldLevelSecurity.confidential.map((field, i) => (
                        <div key={i}>• {field}</div>
                      ))}
                    </div>
                  </div>
                )}
                {fieldLevelSecurity.publicSafe && (
                  <div className="p-3 bg-white rounded border">
                    <p className="text-xs font-semibold text-slate-700 mb-2">Public-Safe Fields:</p>
                    <div className="text-xs text-slate-600 space-y-1">
                      {fieldLevelSecurity.publicSafe.map((field, i) => (
                        <div key={i}>• {field}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status-Based Permissions */}
          {statusBasedRules && statusBasedRules.length > 0 && (
            <div>
              <p className="font-semibold text-green-900 mb-3">✅ Status-Based Access Rules</p>
              <div className="space-y-2">
                {statusBasedRules.map((rule, i) => (
                  <div key={i} className="p-3 bg-white rounded border flex items-center gap-3">
                    <Badge variant="outline" className={`text-xs ${rule.badgeClass || ''}`}>{rule.status}</Badge>
                    <span className="text-sm text-slate-700">{rule.rule}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Municipal/Data Scoping (RLS) */}
          {municipalScoping && municipalScoping.description && (
            <div>
              <p className="font-semibold text-green-900 mb-3">✅ Municipal Data Scoping (RLS)</p>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-300">
                <p className="text-sm text-blue-900 mb-3">
                  <strong>Row-Level Security Implementation:</strong>
                </p>
                <div className="space-y-2 text-sm text-slate-700">
                  {municipalScoping.rules?.map((rule, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Expert System Integration */}
          {expertSystem && expertSystem.status && (
            <div>
              <p className="font-semibold text-green-900 mb-3">✅ Expert Evaluation System Features</p>
              <div className="grid md:grid-cols-3 gap-3 text-sm">
                <div className="p-3 bg-white rounded">
                  <p className="text-xs text-slate-500">Entities</p>
                  <p className="text-2xl font-bold text-blue-600">{expertSystem.entities || 4}</p>
                  <p className="text-xs text-slate-600">Profile, Evaluation, Assignment, Panel</p>
                </div>
                <div className="p-3 bg-white rounded">
                  <p className="text-xs text-slate-500">Pages</p>
                  <p className="text-2xl font-bold text-purple-600">{expertSystem.pages || 6}</p>
                  <p className="text-xs text-slate-600">Registry, Matching, Queue, Performance, Panel, Onboarding</p>
                </div>
                <div className="p-3 bg-white rounded">
                  <p className="text-xs text-slate-500">Integration</p>
                  <p className="text-2xl font-bold text-green-600">100%</p>
                  <p className="text-xs text-slate-600">{expertSystem.integration || 'Fully integrated in detail pages'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Implementation Summary */}
          <div className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-400">
            <p className="font-semibold text-green-900 mb-3">🎯 RBAC Implementation Summary</p>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-green-800 mb-2">Access Control:</p>
                <ul className="space-y-1 text-green-700">
                  <li>• {permissions.length}+ {entityName.toLowerCase()}-specific permissions</li>
                  <li>• {roles.length} role-based access patterns</li>
                  {municipalScoping?.rules && <li>• Municipality data scoping (RLS)</li>}
                  {statusBasedRules.length > 0 && <li>• Status-based visibility rules</li>}
                  {fieldLevelSecurity && Object.keys(fieldLevelSecurity).length > 0 && <li>• Field-level security</li>}
                </ul>
              </div>
              <div>
                <p className="font-medium text-green-800 mb-2">Expert Integration:</p>
                <ul className="space-y-1 text-green-700">
                  {expertSystem?.entities && <li>• {expertSystem.entities} expert entities operational</li>}
                  {expertSystem?.integration && <li>• {expertSystem.integration}</li>}
                  <li>• AI-powered expert matching</li>
                  <li>• Multi-expert consensus workflow</li>
                  <li>• Performance tracking & analytics</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
