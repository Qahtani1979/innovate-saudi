import { useState } from 'react';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { useUserRoleMutations } from '@/hooks/useUserRoleMutations';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from './LanguageContext';
import { Users, Search, Save, X } from 'lucide-react';
import { useUsersWithVisibility } from '@/hooks/useUsersWithVisibility';

function UserRoleManager() {
  const { language, isRTL, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const queryClient = useAppQueryClient();

  const { data: users = [] } = useUsersWithVisibility();

  const { updateRoles } = useUserRoleMutations();

  const specialRoles = [
    { value: 'tech_lead', label: { en: 'Tech Lead', ar: 'قائد تقني' }, color: 'bg-blue-100 text-blue-700' },
    { value: 'budget_officer', label: { en: 'Budget Officer', ar: 'مسؤول الميزانية' }, color: 'bg-green-100 text-green-700' },
    { value: 'director', label: { en: 'Director', ar: 'مدير' }, color: 'bg-purple-100 text-purple-700' },
    { value: 'gdisb_admin', label: { en: 'GDISB Admin', ar: 'إدارة GDISB' }, color: 'bg-red-100 text-red-700' },
    { value: 'program_operator', label: { en: 'Program Operator', ar: 'مشغل برنامج' }, color: 'bg-amber-100 text-amber-700' },
    { value: 'evaluator', label: { en: 'Evaluator', ar: 'مقيّم' }, color: 'bg-teal-100 text-teal-700' },
    { value: 'municipality_lead', label: { en: 'Municipality Lead', ar: 'قائد بلدية' }, color: 'bg-indigo-100 text-indigo-700' }
  ];

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = (userId, specialRoles) => {
    updateRoles.mutate({ userId, roles: specialRoles });
  };

  const toggleRole = (user, roleValue) => {
    const currentRoles = user.special_roles || [];
    const newRoles = currentRoles.includes(roleValue)
      ? currentRoles.filter(r => r !== roleValue)
      : [...currentRoles, roleValue];

    setEditingUser({ ...user, special_roles: newRoles });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            {t({ en: 'User Role Assignment', ar: 'تعيين أدوار المستخدمين' })}
          </CardTitle>
          <div className="relative">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
            <Input
              placeholder={t({ en: 'Search users...', ar: 'ابحث عن المستخدمين...' })}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-64 ${isRTL ? 'pr-10' : 'pl-10'}`}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900 mb-3 font-medium">
            {t({ en: 'Available Special Roles', ar: 'الأدوار الخاصة المتاحة' })}
          </p>
          <div className="flex flex-wrap gap-2">
            {specialRoles.map(role => (
              <Badge key={role.value} className={role.color}>
                {role.label[language]}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredUsers.map(user => {
            const isEditing = editingUser?.id === user.id;
            const currentUser = isEditing ? editingUser : user;
            const userRoles = currentUser.special_roles || [];

            return (
              <div key={user.id} className="p-4 border rounded-lg hover:border-blue-300 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold text-slate-900">{user.full_name}</p>
                      <Badge className={user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}>
                        {user.role}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">{user.email}</p>
                  </div>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingUser(user)}
                    >
                      {t({ en: 'Edit Roles', ar: 'تعديل الأدوار' })}
                    </Button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {specialRoles.map(role => {
                        const isActive = userRoles.includes(role.value);
                        return (
                          <Button
                            key={role.value}
                            variant={isActive ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => toggleRole(currentUser, role.value)}
                            className={isActive ? role.color : ''}
                          >
                            {role.label[language]}
                            {isActive && <X className={`h-3 w-3 ${isRTL ? 'mr-2' : 'ml-2'}`} />}
                          </Button>
                        );
                      })}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleSave(user.id, editingUser.special_roles)}
                        disabled={updateRoles.isPending}
                        className="bg-gradient-to-r from-blue-600 to-teal-600"
                      >
                        <Save className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {t({ en: 'Save', ar: 'حفظ' })}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setEditingUser(null)}
                      >
                        {t({ en: 'Cancel', ar: 'إلغاء' })}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {userRoles.length > 0 ? (
                      userRoles.map(roleValue => {
                        const role = specialRoles.find(r => r.value === roleValue);
                        return role ? (
                          <Badge key={roleValue} className={role.color}>
                            {role.label[language]}
                          </Badge>
                        ) : null;
                      })
                    ) : (
                      <p className="text-sm text-slate-500">
                        {t({ en: 'No special roles assigned', ar: 'لم يتم تعيين أدوار خاصة' })}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default UserRoleManager;

