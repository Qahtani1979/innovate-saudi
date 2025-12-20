import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Filter, X } from 'lucide-react';

export default function AdvancedUserFilters({ onFilterChange }) {
  const { language, isRTL, t } = useLanguage();
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    dateRange: 'all',
    organization: '',
    lastLogin: 'all'
  });

  const applyFilters = () => {
    onFilterChange(filters);
  };

  const clearFilters = () => {
    const defaultFilters = {
      role: 'all',
      status: 'all',
      dateRange: 'all',
      organization: '',
      lastLogin: 'all'
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const activeFilterCount = Object.values(filters).filter(v => v && v !== 'all').length;

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" />
            {t({ en: 'Advanced Filters', ar: 'تصفية متقدمة' })}
          </CardTitle>
          {activeFilterCount > 0 && (
            <Badge className="bg-blue-600">{activeFilterCount} active</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium mb-2 block">{t({ en: 'Role', ar: 'الدور' })}</label>
            <Select value={filters.role} onValueChange={(v) => setFilters({...filters, role: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'All Roles', ar: 'كل الأدوار' })}</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="municipality_admin">Municipality Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium mb-2 block">{t({ en: 'Status', ar: 'الحالة' })}</label>
            <Select value={filters.status} onValueChange={(v) => setFilters({...filters, status: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'All', ar: 'الكل' })}</SelectItem>
                <SelectItem value="active">{t({ en: 'Active', ar: 'نشط' })}</SelectItem>
                <SelectItem value="inactive">{t({ en: 'Inactive', ar: 'غير نشط' })}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium mb-2 block">{t({ en: 'Last Login', ar: 'آخر دخول' })}</label>
            <Select value={filters.lastLogin} onValueChange={(v) => setFilters({...filters, lastLogin: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'Any time', ar: 'أي وقت' })}</SelectItem>
                <SelectItem value="24h">{t({ en: 'Last 24 hours', ar: 'آخر 24 ساعة' })}</SelectItem>
                <SelectItem value="7d">{t({ en: 'Last 7 days', ar: 'آخر 7 أيام' })}</SelectItem>
                <SelectItem value="30d">{t({ en: 'Last 30 days', ar: 'آخر 30 يوم' })}</SelectItem>
                <SelectItem value="90d">{t({ en: 'Last 90 days', ar: 'آخر 90 يوم' })}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium mb-2 block">{t({ en: 'Date Range', ar: 'النطاق الزمني' })}</label>
            <Select value={filters.dateRange} onValueChange={(v) => setFilters({...filters, dateRange: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'All time', ar: 'كل الوقت' })}</SelectItem>
                <SelectItem value="thisWeek">{t({ en: 'This week', ar: 'هذا الأسبوع' })}</SelectItem>
                <SelectItem value="thisMonth">{t({ en: 'This month', ar: 'هذا الشهر' })}</SelectItem>
                <SelectItem value="lastMonth">{t({ en: 'Last month', ar: 'الشهر الماضي' })}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium mb-2 block">{t({ en: 'Organization', ar: 'المنظمة' })}</label>
            <Input
              placeholder={t({ en: 'Search org...', ar: 'بحث منظمة...' })}
              value={filters.organization}
              onChange={(e) => setFilters({...filters, organization: e.target.value})}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={applyFilters} className="flex-1 bg-blue-600">
            <Filter className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t({ en: 'Apply Filters', ar: 'تطبيق التصفية' })}
          </Button>
          <Button onClick={clearFilters} variant="outline">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}