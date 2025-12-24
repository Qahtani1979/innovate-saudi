import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../LanguageContext';
import { useRoleMutations } from '@/hooks/useRoleMutations';
import { Trash2, Plus, CheckSquare, Square } from 'lucide-react';
import { toast } from 'sonner';

export default function BulkRoleActions({ roles, users }) {
  const { t } = useLanguage();
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [bulkPermissionsVal, setBulkPermissionsVal] = useState('');

  const { bulkAddPermissions, bulkRemovePermissions, bulkDeleteRoles } = useRoleMutations();

  const toggleRole = (roleId) => {
    if (selectedRoles.includes(roleId)) {
      setSelectedRoles(selectedRoles.filter(id => id !== roleId));
    } else {
      setSelectedRoles([...selectedRoles, roleId]);
    }
  };

  const selectAll = () => {
    if (selectedRoles.length === roles.length) {
      setSelectedRoles([]);
    } else {
      setSelectedRoles(roles.map(r => r.id));
    }
  };

  const handleBulkAdd = () => {
    const permissionCodes = bulkPermissionsVal.split('\n').filter(p => p.trim());
    if (permissionCodes.length === 0) return;

    bulkAddPermissions.mutate({ roles: selectedRoles, permissionCodes }, {
      onSuccess: () => {
        setBulkPermissionsVal('');
        setSelectedRoles([]);
      },
      onError: (error) => toast.error(error.message)
    });
  };

  const handleBulkRemove = () => {
    const permissionCodes = bulkPermissionsVal.split('\n').filter(p => p.trim());
    if (permissionCodes.length === 0) return;

    bulkRemovePermissions.mutate({ roles: selectedRoles, permissionCodes }, {
      onSuccess: () => {
        setBulkPermissionsVal('');
        setSelectedRoles([]);
      },
      onError: (error) => toast.error(error.message)
    });
  };

  const handleBulkDelete = () => {
    if (confirm(t({ en: 'Delete selected non-system roles?', ar: 'حذف الأدوار غير النظامية المحددة؟' }))) {
      bulkDeleteRoles.mutate({ roles: selectedRoles, allRoles: roles }, {
        onSuccess: () => setSelectedRoles([]),
        onError: (error) => toast.error(error.message)
      });
    }
  };

  return (
    <Card className="border-2 border-indigo-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-indigo-600" />
          {t({ en: 'Bulk Role Actions', ar: 'إجراءات جماعية للأدوار' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Role Selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">
              {t({ en: 'Select Roles:', ar: 'اختر الأدوار:' })}
            </span>
            <Button variant="outline" size="sm" onClick={selectAll}>
              {selectedRoles.length === roles.length ?
                t({ en: 'Deselect All', ar: 'إلغاء الكل' }) :
                t({ en: 'Select All', ar: 'تحديد الكل' })}
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-muted/50 rounded-lg">
            {roles.map((role) => (
              <div
                key={role.id}
                onClick={() => !role.is_system_role && toggleRole(role.id)}
                className={`p-2 rounded border cursor-pointer transition-all ${selectedRoles.includes(role.id) ?
                    'bg-indigo-100 border-indigo-400' :
                    'bg-background hover:bg-muted'
                  } ${role.is_system_role ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-2">
                  {selectedRoles.includes(role.id) ? (
                    <CheckSquare className="h-4 w-4 text-indigo-600" />
                  ) : (
                    <Square className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-xs font-medium">{role.name}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {selectedRoles.length} {t({ en: 'selected', ar: 'محدد' })}
          </p>
        </div>

        {/* Permission Input */}
        {selectedRoles.length > 0 && (
          <>
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t({ en: 'Permissions (one per line):', ar: 'الصلاحيات (واحدة لكل سطر):' })}
              </label>
              <Textarea
                value={bulkPermissionsVal}
                onChange={(e) => setBulkPermissionsVal(e.target.value)}
                placeholder="challenge_create&#10;pilot_view&#10;solution_edit"
                rows={6}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleBulkAdd}
                disabled={!bulkPermissionsVal.trim() || bulkAddPermissions.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t({ en: 'Add to Selected', ar: 'إضافة للمحدد' })}
              </Button>
              <Button
                onClick={handleBulkRemove}
                disabled={!bulkPermissionsVal.trim() || bulkRemovePermissions.isPending}
                variant="outline"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t({ en: 'Remove from Selected', ar: 'إزالة من المحدد' })}
              </Button>
              <Button
                onClick={handleBulkDelete}
                variant="destructive"
                disabled={bulkDeleteRoles.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t({ en: 'Delete Selected', ar: 'حذف المحدد' })}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
