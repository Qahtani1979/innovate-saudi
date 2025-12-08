import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { Users, CheckSquare, Mail, UserCog } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";

export default function BulkUserActions() {
  const { language, isRTL, t } = useLanguage();
  const [selected, setSelected] = useState([]);

  const { data: users = [] } = useQuery({
    queryKey: ['users-bulk'],
    queryFn: () => base44.entities.User.list()
  });

  const toggleUser = (userId) => {
    setSelected(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          {t({ en: 'Bulk User Actions', ar: 'إجراءات المستخدمين الجماعية' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Perform actions on multiple users', ar: 'تنفيذ إجراءات على عدة مستخدمين' })}
        </p>
      </div>

      {/* Actions Bar */}
      {selected.length > 0 && (
        <Card className="border-2 border-blue-300 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-slate-900">
                  {selected.length} {t({ en: 'users selected', ar: 'مستخدم محدد' })}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  {t({ en: 'Send Email', ar: 'إرسال بريد' })}
                </Button>
                <Button variant="outline" size="sm">
                  <UserCog className="h-4 w-4 mr-2" />
                  {t({ en: 'Change Role', ar: 'تغيير الدور' })}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelected([])}>
                  {t({ en: 'Clear', ar: 'مسح' })}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t({ en: 'Users', ar: 'المستخدمون' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {users.slice(0, 20).map(user => (
            <div key={user.id} className="p-3 border rounded-lg flex items-center gap-3">
              <Checkbox
                checked={selected.includes(user.id)}
                onCheckedChange={() => toggleUser(user.id)}
              />
              <div className="flex-1">
                <p className="font-medium text-slate-900">{user.full_name}</p>
                <p className="text-sm text-slate-600">{user.email}</p>
              </div>
              <Badge>{user.role}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}