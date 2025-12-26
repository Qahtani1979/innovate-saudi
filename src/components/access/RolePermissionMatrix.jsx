import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Shield } from 'lucide-react';

export default function RolePermissionMatrix({ roles, users }) {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState('role'); // 'role' or 'permission'

  // Get all unique permissions
  const allPermissions = Array.from(
    new Set(roles.flatMap(r => r.permissions || []))
  ).sort();

  // Permission categories
  const categories = {};
  allPermissions.forEach(perm => {
    const category = perm.split('_')[0];
    if (!categories[category]) categories[category] = [];
    categories[category].push(perm);
  });

  return (
    <Card className="border-2 border-blue-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            {t({ en: 'Role-Permission Matrix', ar: 'مصفوفة الدور-الصلاحية' })}
          </CardTitle>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('role')}
              className={`px-3 py-1 rounded text-sm ${viewMode === 'role' ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}
            >
              {t({ en: 'By Role', ar: 'حسب الدور' })}
            </button>
            <button
              onClick={() => setViewMode('permission')}
              className={`px-3 py-1 rounded text-sm ${viewMode === 'permission' ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}
            >
              {t({ en: 'By Permission', ar: 'حسب الصلاحية' })}
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === 'role' ? (
          <div className="space-y-4">
            {roles.map((role, i) => {
              const userCount = users.filter(u => u.assigned_roles?.includes(role.id)).length;
              return (
                <div key={i} className="p-4 bg-slate-50 rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{role.name}</span>
                      <Badge variant="outline">{role.permissions?.length || 0} perms</Badge>
                      <Badge className="bg-blue-600">{userCount} users</Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions?.map((perm, pi) => (
                      <Badge key={pi} variant="secondary" className="text-xs">
                        {perm}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(categories).map(([category, perms]) => (
              <div key={category} className="p-4 bg-slate-50 rounded-lg border">
                <h4 className="font-medium mb-3 text-sm capitalize">{category}</h4>
                <div className="space-y-2">
                  {perms.map((perm, pi) => {
                    const rolesWithPerm = roles.filter(r => r.permissions?.includes(perm));
                    const usersWithPerm = users.filter(u => 
                      u.assigned_roles?.some(roleId => 
                        rolesWithPerm.some(r => r.id === roleId)
                      )
                    ).length;

                    return (
                      <div key={pi} className="flex items-center justify-between p-2 bg-white rounded border">
                        <span className="text-xs font-medium">{perm}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {rolesWithPerm.length} roles
                          </Badge>
                          <Badge className="bg-blue-600 text-xs">
                            {usersWithPerm} users
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
