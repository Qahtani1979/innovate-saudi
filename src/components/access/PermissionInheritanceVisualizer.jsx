import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import {
  Users, Shield, Network, GitBranch, ChevronRight, User
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PermissionInheritanceVisualizer({ users, roles, teams, delegations }) {
  const { t } = useLanguage();
  const [selectedUser, setSelectedUser] = useState(users[0]?.email || '');

  const user = users.find(u => u.email === selectedUser);
  
  if (!user) return null;

  // Calculate user's permission sources
  const userRoles = user.assigned_roles?.map(roleId => 
    roles.find(r => r.id === roleId)
  ).filter(Boolean) || [];

  const userTeams = user.assigned_teams?.map(teamId => 
    teams.find(t => t.id === teamId)
  ).filter(Boolean) || [];

  const userDelegations = delegations.filter(d => 
    d.delegate_email === user.email && 
    d.is_active &&
    new Date(d.start_date) <= new Date() &&
    new Date(d.end_date) >= new Date()
  );

  const allPermissions = new Set();
  const permissionSources = {};

  // From roles
  userRoles.forEach(role => {
    role.permissions?.forEach(perm => {
      allPermissions.add(perm);
      if (!permissionSources[perm]) permissionSources[perm] = [];
      permissionSources[perm].push({ type: 'role', name: role.name });
    });
  });

  // From teams
  userTeams.forEach(team => {
    team.permissions?.forEach(perm => {
      allPermissions.add(perm);
      if (!permissionSources[perm]) permissionSources[perm] = [];
      permissionSources[perm].push({ type: 'team', name: team.name });
    });
  });

  // From delegations
  userDelegations.forEach(delegation => {
    delegation.permission_types?.forEach(perm => {
      allPermissions.add(perm);
      if (!permissionSources[perm]) permissionSources[perm] = [];
      permissionSources[perm].push({ 
        type: 'delegation', 
        name: delegation.delegator_email,
        endDate: delegation.end_date
      });
    });
  });

  return (
    <Card className="border-2 border-purple-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-purple-600" />
          {t({ en: 'Permission Inheritance Path', ar: 'مسار توريث الصلاحيات' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">
            {t({ en: 'Select User:', ar: 'اختر مستخدم:' })}
          </label>
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {users.map(u => (
                <SelectItem key={u.email} value={u.email}>
                  {u.full_name || u.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Visual Flow */}
        <div className="bg-slate-50 rounded-xl p-6">
          <div className="flex flex-wrap items-start gap-6">
            {/* User */}
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-2">
                <User className="h-10 w-10 text-white" />
              </div>
              <p className="text-xs font-medium">{user.full_name}</p>
              <Badge variant="outline" className="mt-1 text-xs">{user.role}</Badge>
            </div>

            <ChevronRight className="h-8 w-8 text-slate-400 mt-6" />

            {/* Sources */}
            <div className="flex-1 space-y-4">
              {/* Roles */}
              {userRoles.length > 0 && (
                <div className="p-4 bg-white rounded-lg border-2 border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-sm">
                      {t({ en: 'From Roles', ar: 'من الأدوار' })} ({userRoles.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {userRoles.map((role, i) => (
                      <Badge key={i} className="bg-blue-600">
                        {role.name} ({role.permissions?.length || 0})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Teams */}
              {userTeams.length > 0 && (
                <div className="p-4 bg-white rounded-lg border-2 border-green-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Network className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-sm">
                      {t({ en: 'From Teams', ar: 'من الفرق' })} ({userTeams.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {userTeams.map((team, i) => (
                      <Badge key={i} className="bg-green-600">
                        {team.name} ({team.permissions?.length || 0})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Delegations */}
              {userDelegations.length > 0 && (
                <div className="p-4 bg-white rounded-lg border-2 border-orange-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-orange-600" />
                    <span className="font-medium text-sm">
                      {t({ en: 'From Delegations', ar: 'من التفويضات' })} ({userDelegations.length})
                    </span>
                  </div>
                  <div className="space-y-1">
                    {userDelegations.map((delegation, i) => (
                      <div key={i} className="text-xs">
                        <Badge className="bg-orange-600">
                          {delegation.delegator_email}
                        </Badge>
                        <span className="text-slate-600 ml-2">
                          ({delegation.permission_types?.length || 0} perms, expires {new Date(delegation.end_date).toLocaleDateString()})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <ChevronRight className="h-8 w-8 text-slate-400 mt-6" />

            {/* Final Permissions */}
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center mb-2">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <p className="text-xs font-medium">{t({ en: 'Total', ar: 'الإجمالي' })}</p>
              <Badge className="mt-1 bg-green-600">{allPermissions.size}</Badge>
            </div>
          </div>
        </div>

        {/* Detailed Permission List */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-slate-700">
            {t({ en: 'All Permissions with Sources:', ar: 'جميع الصلاحيات مع المصادر:' })}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
            {Array.from(allPermissions).sort().map((perm, i) => (
              <div key={i} className="p-2 bg-white rounded border text-xs">
                <p className="font-medium mb-1">{perm}</p>
                <div className="flex flex-wrap gap-1">
                  {permissionSources[perm]?.map((source, si) => (
                    <Badge 
                      key={si} 
                      variant="outline" 
                      className={`text-xs ${
                        source.type === 'role' ? 'border-blue-400 text-blue-700' :
                        source.type === 'team' ? 'border-green-400 text-green-700' :
                        'border-orange-400 text-orange-700'
                      }`}
                    >
                      {source.type}: {source.name}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
