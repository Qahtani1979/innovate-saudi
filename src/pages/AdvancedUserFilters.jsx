import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { Filter, Users, Download } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdvancedUserFilters() {
  const { language, isRTL, t } = useLanguage();
  const [filters, setFilters] = useState({ role: 'all', active: 'all' });

  const { data: users = [] } = useQuery({
    queryKey: ['users-filter', filters],
    queryFn: async () => {
      const allUsers = await base44.entities.User.list();
      return allUsers.filter(u => {
        if (filters.role !== 'all' && u.role !== filters.role) return false;
        return true;
      });
    }
  });

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            {t({ en: 'Advanced User Filters', ar: 'فلاتر المستخدمين المتقدمة' })}
          </h1>
          <p className="text-slate-600 mt-2">
            {t({ en: 'Filter and segment users', ar: 'تصفية وتقسيم المستخدمين' })}
          </p>
        </div>
        <Button className="bg-blue-600">
          <Download className="h-4 w-4 mr-2" />
          {t({ en: 'Export', ar: 'تصدير' })}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t({ en: 'Filters', ar: 'الفلاتر' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              {t({ en: 'Role', ar: 'الدور' })}
            </label>
            <Select value={filters.role} onValueChange={(val) => setFilters({...filters, role: val})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'All Roles', ar: 'جميع الأدوار' })}</SelectItem>
                <SelectItem value="admin">{t({ en: 'Admin', ar: 'مدير' })}</SelectItem>
                <SelectItem value="user">{t({ en: 'User', ar: 'مستخدم' })}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              {t({ en: 'Search', ar: 'بحث' })}
            </label>
            <Input placeholder={t({ en: 'Search by name or email', ar: 'البحث بالاسم أو البريد' })} />
          </div>

          <div className="flex items-end">
            <Button className="w-full bg-blue-600">
              {t({ en: 'Apply Filters', ar: 'تطبيق الفلاتر' })}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t({ en: 'Users', ar: 'المستخدمون' })} ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {users.slice(0, 20).map(user => (
            <div key={user.id} className="p-3 border rounded-lg flex items-center justify-between">
              <div>
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