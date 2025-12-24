import { useRoleDetails, useUsersWithRole } from '@/hooks/useRoles';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { useAccessLogs } from '@/hooks/useRBACStatistics';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Shield, Users, Activity, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function RoleAuditDetail({ roleId }) {
  const { t } = useLanguage();

  // Fetch role
  const { data: role } = useRoleDetails(roleId);

  // Fetch role permissions
  const { data: rolePermissions = [] } = useRolePermissions(roleId);

  // Fetch users with this role
  const { data: usersWithRole = [] } = useUsersWithRole(roleId);

  // Fetch access logs for permissions in this role
  const { data: accessLogs = [] } = useAccessLogs(7);

  if (!role) return null;

  const permissions = rolePermissions.map(rp => rp.permissions?.code).filter(Boolean);

  // Analytics - filter logs by permissions in this role
  const permissionUsage = {};
  accessLogs.forEach(log => {
    const action = log.action || '';
    // Check if this action might relate to role permissions
    if (permissions.some(p => action.includes(p.split('_')[0]))) {
      if (!permissionUsage[action]) {
        permissionUsage[action] = { total: 0, denied: 0 };
      }
      permissionUsage[action].total++;
      if (action.includes('denied')) permissionUsage[action].denied++;
    }
  });

  const usageData = Object.entries(permissionUsage)
    .map(([perm, data]) => ({
      permission: perm.split('_').pop(),
      total: data.total,
      denied: data.denied
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const unusedPermissions = permissions.filter(p => {
    return !Object.keys(permissionUsage).some(action => action.includes(p.split('_')[0]));
  });

  return (
    <div className="space-y-4">
      <Card className="border-2 border-blue-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            {t({ en: 'Role Audit:', ar: 'تدقيق الدور:' })} {role.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{permissions.length}</p>
              <p className="text-xs text-muted-foreground">{t({ en: 'Permissions', ar: 'الصلاحيات' })}</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{usersWithRole.length}</p>
              <p className="text-xs text-muted-foreground">{t({ en: 'Users', ar: 'المستخدمين' })}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Activity className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{Object.keys(permissionUsage).length}</p>
              <p className="text-xs text-muted-foreground">{t({ en: 'Access Events', ar: 'أحداث الوصول' })}</p>
            </div>
          </div>

          {/* Permission Usage Chart */}
          {usageData.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-3">
                {t({ en: 'Permission Usage (Last 7 Days)', ar: 'استخدام الصلاحيات (آخر 7 أيام)' })}
              </h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={usageData}>
                  <XAxis dataKey="permission" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="hsl(var(--primary))" name="Used" />
                  <Bar dataKey="denied" fill="hsl(var(--destructive))" name="Denied" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Unused Permissions Alert */}
          {unusedPermissions.length > 0 && (
            <div className="p-4 bg-amber-50 rounded-lg border-2 border-amber-300">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-amber-900 mb-2">
                    {t({ en: 'Unused Permissions', ar: 'صلاحيات غير مستخدمة' })} ({unusedPermissions.length})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {unusedPermissions.map((perm, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {perm}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Assigned Users */}
          <div>
            <h4 className="font-medium text-sm mb-3">
              {t({ en: 'Assigned Users:', ar: 'المستخدمون المعينون:' })}
            </h4>
            <div className="space-y-1">
              {usersWithRole.map((ufr, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm">{ufr.user_profiles?.full_name || ufr.user_profiles?.user_email}</span>
                  <Badge variant="outline">Active</Badge>
                </div>
              ))}
              {usersWithRole.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t({ en: 'No users assigned to this role', ar: 'لا يوجد مستخدمين معينين لهذا الدور' })}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
