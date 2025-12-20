import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from './LanguageContext';
import { Shield, Save } from 'lucide-react';
import { toast } from 'sonner';

function PermissionMatrix() {
  const { language, isRTL, t } = useLanguage();

  const roles = [
    { id: 'admin', label: { en: 'Admin', ar: 'مدير' }, color: 'bg-purple-600' },
    { id: 'tech_lead', label: { en: 'Tech Lead', ar: 'قائد تقني' }, color: 'bg-cyan-600' },
    { id: 'budget_officer', label: { en: 'Budget Officer', ar: 'مسؤول ميزانية' }, color: 'bg-green-600' },
    { id: 'director', label: { en: 'Director', ar: 'مدير' }, color: 'bg-indigo-600' },
    { id: 'municipality_lead', label: { en: 'Municipality Lead', ar: 'قائد بلدية' }, color: 'bg-orange-600' }
  ];

  const entities = [
    { id: 'Challenge', label: { en: 'Challenges', ar: 'التحديات' } },
    { id: 'Pilot', label: { en: 'Pilots', ar: 'التجارب' } },
    { id: 'Solution', label: { en: 'Solutions', ar: 'الحلول' } }
  ];

  const actions = [
    { id: 'create', label: { en: 'Create', ar: 'إنشاء' } },
    { id: 'read', label: { en: 'Read', ar: 'قراءة' } },
    { id: 'update', label: { en: 'Update', ar: 'تحديث' } },
    { id: 'delete', label: { en: 'Delete', ar: 'حذف' } },
    { id: 'approve', label: { en: 'Approve', ar: 'موافقة' } }
  ];

  const [permissions, setPermissions] = useState({
    admin: {
      Challenge: { create: true, read: true, update: true, delete: true, approve: true },
      Pilot: { create: true, read: true, update: true, delete: true, approve: true },
      Solution: { create: true, read: true, update: true, delete: true, approve: true }
    },
    tech_lead: {
      Challenge: { create: true, read: true, update: true, delete: false, approve: true },
      Pilot: { create: true, read: true, update: true, delete: false, approve: true },
      Solution: { create: false, read: true, update: true, delete: false, approve: true }
    },
    budget_officer: {
      Challenge: { create: false, read: true, update: false, delete: false, approve: false },
      Pilot: { create: false, read: true, update: true, delete: false, approve: true },
      Solution: { create: false, read: true, update: false, delete: false, approve: false }
    },
    director: {
      Challenge: { create: false, read: true, update: false, delete: false, approve: true },
      Pilot: { create: false, read: true, update: false, delete: false, approve: true },
      Solution: { create: false, read: true, update: false, delete: false, approve: false }
    },
    municipality_lead: {
      Challenge: { create: true, read: true, update: true, delete: false, approve: false },
      Pilot: { create: true, read: true, update: true, delete: false, approve: false },
      Solution: { create: false, read: true, update: false, delete: false, approve: false }
    }
  });

  const togglePermission = (role, entity, action) => {
    setPermissions({
      ...permissions,
      [role]: {
        ...permissions[role],
        [entity]: {
          ...permissions[role][entity],
          [action]: !permissions[role][entity][action]
        }
      }
    });
  };

  const handleSave = () => {
    toast.success(t({ en: 'Permissions saved', ar: 'تم حفظ الصلاحيات' }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            {t({ en: 'Permission Matrix', ar: 'مصفوفة الصلاحيات' })}
          </CardTitle>
          <div className="flex gap-2">
            <Button onClick={handleSave} size="sm">
              <Save className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t({ en: 'Save', ar: 'حفظ' })}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {roles.map(role => (
            <div key={role.id} className="space-y-3">
              <Badge className={`${role.color} text-white`}>
                {role.label[language]}
              </Badge>

              <div className="grid grid-cols-1 gap-3">
                {entities.map(entity => (
                  <div key={entity.id} className="p-4 border rounded-lg bg-slate-50">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-medium text-slate-900">{entity.label[language]}</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {actions.map(action => {
                        const isAllowed = permissions[role.id]?.[entity.id]?.[action.id];
                        return (
                          <div key={action.id} className="flex items-center gap-2">
                            <Switch
                              checked={isAllowed}
                              onCheckedChange={() => togglePermission(role.id, entity.id, action.id)}
                            />
                            <span className={`text-sm ${isAllowed ? 'text-green-700 font-medium' : 'text-slate-500'}`}>
                              {action.label[language]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default PermissionMatrix;