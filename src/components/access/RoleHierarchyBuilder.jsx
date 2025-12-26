import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Network, ChevronRight } from 'lucide-react';

export default function RoleHierarchyBuilder({ roles, onUpdate }) {
  const { language, isRTL, t } = useLanguage();

  const getRoleChildren = (parentId) => {
    return roles.filter(r => r.parent_role_id === parentId);
  };

  const renderRoleNode = (role, level = 0) => {
    const children = getRoleChildren(role.id);
    
    return (
      <div key={role.id} className="space-y-2">
        <div 
          className={`flex items-center gap-3 p-3 bg-white border-2 rounded-lg hover:border-blue-300 transition-all`}
          style={{ marginLeft: `${level * 24}px` }}
        >
          {level > 0 && <ChevronRight className="h-4 w-4 text-slate-400" />}
          <div className="flex-1">
            <p className="font-medium">{role.name}</p>
            <p className="text-xs text-slate-600">{role.code}</p>
          </div>
          <Badge className={role.is_system_role ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}>
            {role.is_system_role ? 'System' : 'Custom'}
          </Badge>
          <Badge variant="outline">{role.user_count || 0} users</Badge>
        </div>
        {children.map(child => renderRoleNode(child, level + 1))}
      </div>
    );
  };

  const rootRoles = roles.filter(r => !r.parent_role_id);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5 text-purple-600" />
          {t({ en: 'Role Hierarchy', ar: 'تسلسل الأدوار' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rootRoles.map(role => renderRoleNode(role))}
        {rootRoles.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            {t({ en: 'No roles defined', ar: 'لا توجد أدوار' })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
