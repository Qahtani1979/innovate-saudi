import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../LanguageContext';
import { toast } from 'sonner';
import {
  Users, Shield, Trash2, Plus, Copy, CheckSquare, Square
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
      const permissions = bulkPermissions.split('\n').filter(p => p.trim());
      const updates = selectedRoles.map(roleId => {
        const role = roles.find(r => r.id === roleId);
        const existingPerms = role.permissions || [];
        const newPerms = Array.from(new Set([...existingPerms, ...permissions]));
        
        return base44.entities.Role.update(roleId, {
          permissions: newPerms
        });
      });

      return Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['roles']);
      setBulkPermissions('');
      setSelectedRoles([]);
      toast.success(t({ en: 'Permissions added to selected roles', ar: 'تم إضافة الصلاحيات للأدوار المحددة' }));
    }
  });

  const bulkRemovePermissionsMutation = useMutation({
    mutationFn: async () => {
      const permissions = bulkPermissions.split('\n').filter(p => p.trim());
      const updates = selectedRoles.map(roleId => {
        const role = roles.find(r => r.id === roleId);
        const existingPerms = role.permissions || [];
        const newPerms = existingPerms.filter(p => !permissions.includes(p));
        
        return base44.entities.Role.update(roleId, {
          permissions: newPerms
        });
      });

      return Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['roles']);
      setBulkPermissions('');
      setSelectedRoles([]);
      toast.success(t({ en: 'Permissions removed from selected roles', ar: 'تم إزالة الصلاحيات من الأدوار المحددة' }));
    }
  });

  const bulkDeleteRolesMutation = useMutation({
    mutationFn: async () => {
      const deletable = selectedRoles.filter(roleId => {
        const role = roles.find(r => r.id === roleId);
        return !role.is_system_role;
      });

      const deletes = deletable.map(roleId => 
        base44.entities.Role.delete(roleId)
      );

      return Promise.all(deletes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['roles']);
      setSelectedRoles([]);
      toast.success(t({ en: 'Selected roles deleted', ar: 'تم حذف الأدوار المحددة' }));
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-lg">
            {roles.map((role) => (
              <div
                key={role.id}
                onClick={() => !role.is_system_role && toggleRole(role.id)}
                className={`p-2 rounded border cursor-pointer transition-all ${
                  selectedRoles.includes(role.id) ? 
                    'bg-indigo-100 border-indigo-400' : 
                    'bg-white hover:bg-slate-100'
                } ${role.is_system_role ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-2">
                  {selectedRoles.includes(role.id) ? (
                    <CheckSquare className="h-4 w-4 text-indigo-600" />
                  ) : (
                    <Square className="h-4 w-4 text-slate-400" />
                  )}
                  <span className="text-xs font-medium">{role.name}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-600 mt-1">
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
                disabled={!bulkPermissions.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t({ en: 'Add to Selected', ar: 'إضافة للمحدد' })}
              </Button>
              <Button
                onClick={() => bulkRemovePermissionsMutation.mutate()}
                disabled={!bulkPermissions.trim()}
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