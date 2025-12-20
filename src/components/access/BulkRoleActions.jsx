import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../LanguageContext';
import { toast } from 'sonner';
import {
  Trash2, Plus, CheckSquare, Square
} from 'lucide-react';

export default function BulkRoleActions({ roles, users }) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [bulkPermissions, setBulkPermissions] = useState('');

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

  const bulkAddPermissionsMutation = useMutation({
    mutationFn: async () => {
      const permissionCodes = bulkPermissions.split('\n').filter(p => p.trim());
      
      // Get permission IDs for the codes
      const { data: permRecords } = await supabase
        .from('permissions')
        .select('id, code')
        .in('code', permissionCodes);

      if (!permRecords || permRecords.length === 0) {
        throw new Error('No valid permissions found');
      }

      // For each selected role, add the permissions
      for (const roleId of selectedRoles) {
        // Get existing permissions for this role
        const { data: existing } = await supabase
          .from('role_permissions')
          .select('permission_id')
          .eq('role_id', roleId);

        const existingPermIds = new Set(existing?.map(e => e.permission_id) || []);

        // Add new permissions that don't already exist
        const newPermissions = permRecords
          .filter(p => !existingPermIds.has(p.id))
          .map(p => ({
            role_id: roleId,
            permission_id: p.id
          }));

        if (newPermissions.length > 0) {
          await supabase.from('role_permissions').insert(newPermissions);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['roles']);
      queryClient.invalidateQueries(['role-permissions']);
      setBulkPermissions('');
      setSelectedRoles([]);
      toast.success(t({ en: 'Permissions added to selected roles', ar: 'تم إضافة الصلاحيات للأدوار المحددة' }));
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const bulkRemovePermissionsMutation = useMutation({
    mutationFn: async () => {
      const permissionCodes = bulkPermissions.split('\n').filter(p => p.trim());
      
      // Get permission IDs for the codes
      const { data: permRecords } = await supabase
        .from('permissions')
        .select('id, code')
        .in('code', permissionCodes);

      if (!permRecords || permRecords.length === 0) {
        throw new Error('No valid permissions found');
      }

      const permIds = permRecords.map(p => p.id);

      // For each selected role, remove the permissions
      for (const roleId of selectedRoles) {
        await supabase
          .from('role_permissions')
          .delete()
          .eq('role_id', roleId)
          .in('permission_id', permIds);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['roles']);
      queryClient.invalidateQueries(['role-permissions']);
      setBulkPermissions('');
      setSelectedRoles([]);
      toast.success(t({ en: 'Permissions removed from selected roles', ar: 'تم إزالة الصلاحيات من الأدوار المحددة' }));
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const bulkDeleteRolesMutation = useMutation({
    mutationFn: async () => {
      const deletable = selectedRoles.filter(roleId => {
        const role = roles.find(r => r.id === roleId);
        return !role?.is_system_role;
      });

      for (const roleId of deletable) {
        // Delete role permissions first
        await supabase.from('role_permissions').delete().eq('role_id', roleId);
        // Deactivate user_roles with this role_id (Phase 4: no user_functional_roles)
        await supabase.from('user_roles').update({ is_active: false }).eq('role_id', roleId);
        // Delete the role
        await supabase.from('roles').delete().eq('id', roleId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['roles']);
      setSelectedRoles([]);
      toast.success(t({ en: 'Selected roles deleted', ar: 'تم حذف الأدوار المحددة' }));
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

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
                className={`p-2 rounded border cursor-pointer transition-all ${
                  selectedRoles.includes(role.id) ? 
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
                value={bulkPermissions}
                onChange={(e) => setBulkPermissions(e.target.value)}
                placeholder="challenge_create&#10;pilot_view&#10;solution_edit"
                rows={6}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => bulkAddPermissionsMutation.mutate()}
                disabled={!bulkPermissions.trim() || bulkAddPermissionsMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t({ en: 'Add to Selected', ar: 'إضافة للمحدد' })}
              </Button>
              <Button
                onClick={() => bulkRemovePermissionsMutation.mutate()}
                disabled={!bulkPermissions.trim() || bulkRemovePermissionsMutation.isPending}
                variant="outline"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t({ en: 'Remove from Selected', ar: 'إزالة من المحدد' })}
              </Button>
              <Button
                onClick={() => {
                  if (confirm(t({ en: 'Delete selected non-system roles?', ar: 'حذف الأدوار غير النظامية المحددة؟' }))) {
                    bulkDeleteRolesMutation.mutate();
                  }
                }}
                variant="destructive"
                disabled={bulkDeleteRolesMutation.isPending}
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
