import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../LanguageContext';
import { Users, Save, X } from 'lucide-react';
import { toast } from 'sonner';

export default function BulkRoleAssignment({ selectedUsers, onComplete }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [targetRole, setTargetRole] = useState('user');

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => base44.entities.Role.list()
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async () => {
      for (const userId of selectedUsers) {
        await base44.entities.User.update(userId, { role: targetRole });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success(t({ en: `Updated ${selectedUsers.length} users`, ar: `تم تحديث ${selectedUsers.length} مستخدم` }));
      onComplete?.();
    }
  });

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          {t({ en: 'Bulk Role Assignment', ar: 'تعيين الأدوار الجماعي' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-900">
            {selectedUsers.length} {t({ en: 'users selected', ar: 'مستخدمون محددون' })}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">{t({ en: 'Assign Role', ar: 'تعيين الدور' })}</label>
          <Select value={targetRole} onValueChange={setTargetRole}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.code}>{role.name}</SelectItem>
              ))}
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => bulkUpdateMutation.mutate()}
            disabled={bulkUpdateMutation.isPending}
            className="flex-1 bg-blue-600"
          >
            <Save className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t({ en: 'Apply to All', ar: 'تطبيق على الكل' })}
          </Button>
          <Button variant="outline" onClick={onComplete}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}