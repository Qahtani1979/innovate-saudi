import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Users, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function BulkUserActions({ selectedUsers, onComplete, onAction }) {
  const { language, isRTL, t } = useLanguage();

  const handleActivate = () => {
    if (confirm(t({ en: `Activate ${selectedUsers.length} users?`, ar: `تفعيل ${selectedUsers.length} مستخدم؟` }))) {
      onAction?.('activate', selectedUsers);
      toast.success(t({ en: 'Users activated', ar: 'تم تفعيل المستخدمين' }));
    }
  };

  const handleDeactivate = () => {
    if (confirm(t({ en: `Deactivate ${selectedUsers.length} users?`, ar: `تعطيل ${selectedUsers.length} مستخدم؟` }))) {
      onAction?.('deactivate', selectedUsers);
      toast.success(t({ en: 'Users deactivated', ar: 'تم تعطيل المستخدمين' }));
    }
  };

  const handleDelete = () => {
    if (confirm(t({ en: `Delete ${selectedUsers.length} users permanently?`, ar: `حذف ${selectedUsers.length} مستخدم نهائياً؟` }))) {
      onAction?.('delete', selectedUsers);
      toast.success(t({ en: 'Users deleted', ar: 'تم حذف المستخدمين' }));
    }
  };

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-600" />
          {t({ en: 'Bulk Actions', ar: 'إجراءات جماعية' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 mb-4">
          <Badge className="bg-purple-600 text-white text-sm px-3 py-1">
            {selectedUsers.length} {t({ en: 'users selected', ar: 'مستخدمون محددون' })}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button onClick={handleActivate} variant="outline" className="flex-col h-20 border-green-300">
            <CheckCircle className="h-6 w-6 text-green-600 mb-1" />
            <span className="text-xs">{t({ en: 'Activate', ar: 'تفعيل' })}</span>
          </Button>
          
          <Button onClick={handleDeactivate} variant="outline" className="flex-col h-20 border-amber-300">
            <XCircle className="h-6 w-6 text-amber-600 mb-1" />
            <span className="text-xs">{t({ en: 'Deactivate', ar: 'تعطيل' })}</span>
          </Button>
          
          <Button onClick={handleDelete} variant="outline" className="flex-col h-20 border-red-300">
            <Trash2 className="h-6 w-6 text-red-600 mb-1" />
            <span className="text-xs">{t({ en: 'Delete', ar: 'حذف' })}</span>
          </Button>

          <Button onClick={onComplete} variant="outline" className="flex-col h-20">
            <XCircle className="h-6 w-6 text-slate-600 mb-1" />
            <span className="text-xs">{t({ en: 'Cancel', ar: 'إلغاء' })}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}