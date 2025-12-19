import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';
import { 
  ClipboardCheck, Database, Shield, Code, Users, GitBranch, Bell, 
  FileText, Eye, Lock, Search, Download, RefreshCw, CheckCircle2,
  AlertTriangle, XCircle, Layers, Activity, Settings
} from 'lucide-react';

const validationCategories = [
  {
    id: 'database',
    name: { en: 'Database Layer', ar: 'طبقة قاعدة البيانات' },
    icon: Database,
    color: 'blue',
    subcategories: [
      {
        name: { en: 'Schema Validation', ar: 'التحقق من المخطط' },
        checks: [
          { id: 'db-1', text: { en: 'All required tables exist', ar: 'جميع الجداول المطلوبة موجودة' }, priority: 'high' },
          { id: 'db-2', text: { en: 'Column types match expected data (UUID, TEXT, TIMESTAMP, etc.)', ar: 'أنواع الأعمدة تطابق البيانات المتوقعة' }, priority: 'high' },
          { id: 'db-3', text: { en: 'Foreign key relationships are correct', ar: 'علاقات المفاتيح الخارجية صحيحة' }, priority: 'high' },
          { id: 'db-4', text: { en: 'Indexes exist for frequently queried columns', ar: 'الفهارس موجودة للأعمدة المستعلم عنها بشكل متكرر' }, priority: 'medium' },
          { id: 'db-5', text: { en: 'Default values are appropriate', ar: 'القيم الافتراضية مناسبة' }, priority: 'medium' },
          { id: 'db-6', text: { en: 'Nullable columns are intentional', ar: 'الأعمدة القابلة للفراغ مقصودة' }, priority: 'low' }
        ]
      },
      {
        name: { en: 'Row Level Security (RLS)', ar: 'أمان مستوى الصف' },
        checks: [
          { id: 'rls-1', text: { en: 'RLS is ENABLED on all tables', ar: 'RLS مفعّل على جميع الجداول' }, priority: 'critical' },
          { id: 'rls-2', text: { en: 'SELECT policies exist for all user types', ar: 'سياسات SELECT موجودة لجميع أنواع المستخدمين' }, priority: 'critical' },
          { id: 'rls-3', text: { en: 'INSERT policies have WITH CHECK clause', ar: 'سياسات INSERT تحتوي على WITH CHECK' }, priority: 'critical' },
          { id: 'rls-4', text: { en: 'UPDATE policies have both USING and WITH CHECK', ar: 'سياسات UPDATE تحتوي على USING و WITH CHECK' }, priority: 'critical' },
          { id: 'rls-5', text: { en: 'DELETE policies are appropriately restrictive', ar: 'سياسات DELETE مقيدة بشكل مناسب' }, priority: 'high' },
          { id: 'rls-6', text: { en: 'No "Allow all" or overly permissive policies', ar: 'لا توجد سياسات "السماح للجميع"' }, priority: 'critical' },
          { id: 'rls-7', text: { en: 'PII tables have strict access control', ar: 'جداول البيانات الشخصية لها تحكم صارم' }, priority: 'critical' },
          { id: 'rls-8', text: { en: 'Owner-based access uses auth.uid()', ar: 'الوصول المبني على المالك يستخدم auth.uid()' }, priority: 'high' },
          { id: 'rls-9', text: { en: 'Admin bypass uses secure function (public.has_role())', ar: 'تجاوز المسؤول يستخدم دالة آمنة' }, priority: 'critical' }
        ]
      },
      {
        name: { en: 'Database Functions & Triggers', ar: 'دوال ومحفزات قاعدة البيانات' },
        checks: [
          { id: 'fn-1', text: { en: 'Functions use SECURITY DEFINER when needed', ar: 'الدوال تستخدم SECURITY DEFINER عند الحاجة' }, priority: 'high' },
          { id: 'fn-2', text: { en: 'Functions have SET search_path = public', ar: 'الدوال تحتوي على SET search_path = public' }, priority: 'high' },
          { id: 'fn-3', text: { en: 'Triggers exist for updated_at columns', ar: 'المحفزات موجودة لأعمدة updated_at' }, priority: 'medium' },
          { id: 'fn-4', text: { en: 'Audit/logging triggers work correctly', ar: 'محفزات التدقيق/التسجيل تعمل بشكل صحيح' }, priority: 'medium' }
        ]
      }
    ]
  },
  {
    id: 'hooks',
    name: { en: 'Hooks Layer', ar: 'طبقة الـ Hooks' },
    icon: Code,
    color: 'purple',
    subcategories: [
      {
        name: { en: 'Query Hooks', ar: 'Hooks الاستعلام' },
        checks: [
          { id: 'qh-1', text: { en: 'useQuery has proper queryKey with all dependencies', ar: 'useQuery يحتوي على queryKey مناسب' }, priority: 'high' },
          { id: 'qh-2', text: { en: 'enabled condition prevents unnecessary fetches', ar: 'شرط enabled يمنع الجلب غير الضروري' }, priority: 'medium' },
          { id: 'qh-3', text: { en: 'Error handling exists', ar: 'معالجة الأخطاء موجودة' }, priority: 'high' },
          { id: 'qh-4', text: { en: 'Loading states are handled', ar: 'حالات التحميل يتم التعامل معها' }, priority: 'medium' },
          { id: 'qh-5', text: { en: 'Empty data returns [] not undefined', ar: 'البيانات الفارغة ترجع [] وليس undefined' }, priority: 'medium' }
        ]
      },
      {
        name: { en: 'Mutation Hooks', ar: 'Hooks التعديل' },
        checks: [
          { id: 'mh-1', text: { en: 'useMutation invalidates related queries on success', ar: 'useMutation يبطل الاستعلامات المرتبطة عند النجاح' }, priority: 'high' },
          { id: 'mh-2', text: { en: 'Error handling with user feedback (toast)', ar: 'معالجة الأخطاء مع إشعار المستخدم' }, priority: 'high' },
          { id: 'mh-3', text: { en: 'Audit logging after mutations', ar: 'تسجيل التدقيق بعد التعديلات' }, priority: 'medium' }
        ]
      },
      {
        name: { en: 'Visibility Hooks', ar: 'Hooks الرؤية' },
        checks: [
          { id: 'vh-1', text: { en: 'Admin sees all data', ar: 'المسؤول يرى جميع البيانات' }, priority: 'high' },
          { id: 'vh-2', text: { en: 'Staff sees appropriate subset', ar: 'الموظف يرى المجموعة المناسبة' }, priority: 'high' },
          { id: 'vh-3', text: { en: 'Public users see only published items', ar: 'المستخدمون العامون يرون العناصر المنشورة فقط' }, priority: 'high' },
          { id: 'vh-4', text: { en: 'Visibility loading state prevents premature queries', ar: 'حالة تحميل الرؤية تمنع الاستعلامات المبكرة' }, priority: 'medium' }
        ]
      }
    ]
  },
  {
    id: 'components',
    name: { en: 'Components Layer', ar: 'طبقة المكونات' },
    icon: Layers,
    color: 'green',
    subcategories: [
      {
        name: { en: 'Page Components', ar: 'مكونات الصفحة' },
        checks: [
          { id: 'pc-1', text: { en: 'Protected with ProtectedPage HOC', ar: 'محمية بـ ProtectedPage HOC' }, priority: 'critical' },
          { id: 'pc-2', text: { en: 'Required permissions specified', ar: 'الصلاحيات المطلوبة محددة' }, priority: 'high' },
          { id: 'pc-3', text: { en: 'Loading skeleton shown during fetch', ar: 'هيكل التحميل يظهر أثناء الجلب' }, priority: 'medium' },
          { id: 'pc-4', text: { en: 'Empty state handled gracefully', ar: 'الحالة الفارغة يتم التعامل معها بشكل جيد' }, priority: 'medium' }
        ]
      },
      {
        name: { en: 'Form Components', ar: 'مكونات النموذج' },
        checks: [
          { id: 'fc-1', text: { en: 'Input validation (Zod schema)', ar: 'التحقق من المدخلات (Zod schema)' }, priority: 'high' },
          { id: 'fc-2', text: { en: 'Required fields marked', ar: 'الحقول المطلوبة معلّمة' }, priority: 'medium' },
          { id: 'fc-3', text: { en: 'Submit button disabled during loading', ar: 'زر الإرسال معطل أثناء التحميل' }, priority: 'medium' },
          { id: 'fc-4', text: { en: 'Form reset after successful submission', ar: 'إعادة تعيين النموذج بعد الإرسال الناجح' }, priority: 'low' }
        ]
      },
      {
        name: { en: 'List/Table Components', ar: 'مكونات القائمة/الجدول' },
        checks: [
          { id: 'lc-1', text: { en: 'Pagination for large datasets', ar: 'ترقيم الصفحات لمجموعات البيانات الكبيرة' }, priority: 'medium' },
          { id: 'lc-2', text: { en: 'Search/filter functionality works', ar: 'وظيفة البحث/الفلترة تعمل' }, priority: 'medium' },
          { id: 'lc-3', text: { en: 'Actions have permission checks', ar: 'الإجراءات لها فحوصات صلاحيات' }, priority: 'high' },
          { id: 'lc-4', text: { en: 'Confirmation dialogs for destructive actions', ar: 'نوافذ تأكيد للإجراءات المدمرة' }, priority: 'high' }
        ]
      }
    ]
  },
  {
    id: 'permissions',
    name: { en: 'Permissions Layer', ar: 'طبقة الصلاحيات' },
    icon: Shield,
    color: 'red',
    subcategories: [
      {
        name: { en: 'Role-Based Access Control', ar: 'التحكم في الوصول المبني على الأدوار' },
        checks: [
          { id: 'rbac-1', text: { en: 'Roles stored in separate roles table', ar: 'الأدوار مخزنة في جدول منفصل' }, priority: 'critical' },
          { id: 'rbac-2', text: { en: 'User-role mapping in user_roles table', ar: 'ربط المستخدم-الدور في جدول user_roles' }, priority: 'critical' },
          { id: 'rbac-3', text: { en: 'public.has_role() function exists with SECURITY DEFINER', ar: 'دالة public.has_role() موجودة مع SECURITY DEFINER' }, priority: 'critical' },
          { id: 'rbac-4', text: { en: 'UI elements hidden for unauthorized users', ar: 'عناصر الواجهة مخفية للمستخدمين غير المصرح لهم' }, priority: 'high' },
          { id: 'rbac-5', text: { en: 'RLS policies use consistent permission logic', ar: 'سياسات RLS تستخدم منطق صلاحيات متسق' }, priority: 'high' },
          { id: 'rbac-6', text: { en: 'No client-side only permission checks', ar: 'لا توجد فحوصات صلاحيات على جانب العميل فقط' }, priority: 'critical' }
        ]
      }
    ]
  },
  {
    id: 'workflow',
    name: { en: 'Workflow Layer', ar: 'طبقة سير العمل' },
    icon: GitBranch,
    color: 'amber',
    subcategories: [
      {
        name: { en: 'Status Transitions', ar: 'انتقالات الحالة' },
        checks: [
          { id: 'wf-1', text: { en: 'Valid status values defined', ar: 'قيم الحالة الصالحة محددة' }, priority: 'high' },
          { id: 'wf-2', text: { en: 'Transition rules enforced', ar: 'قواعد الانتقال مفروضة' }, priority: 'high' },
          { id: 'wf-3', text: { en: 'Status changes trigger appropriate actions', ar: 'تغييرات الحالة تحفز الإجراءات المناسبة' }, priority: 'medium' },
          { id: 'wf-4', text: { en: 'Status history tracked (audit log)', ar: 'سجل الحالة يتم تتبعه' }, priority: 'medium' }
        ]
      }
    ]
  },
  {
    id: 'notifications',
    name: { en: 'Notification Layer', ar: 'طبقة الإشعارات' },
    icon: Bell,
    color: 'indigo',
    subcategories: [
      {
        name: { en: 'Notifications', ar: 'الإشعارات' },
        checks: [
          { id: 'notif-1', text: { en: 'Email templates exist for trigger events', ar: 'قوالب البريد الإلكتروني موجودة للأحداث المحفزة' }, priority: 'medium' },
          { id: 'notif-2', text: { en: 'In-app notifications created on key events', ar: 'إشعارات داخل التطبيق تُنشأ عند الأحداث الرئيسية' }, priority: 'medium' },
          { id: 'notif-3', text: { en: 'Read/unread status tracked', ar: 'حالة القراءة/عدم القراءة يتم تتبعها' }, priority: 'low' }
        ]
      }
    ]
  },
  {
    id: 'audit',
    name: { en: 'Audit & Logging Layer', ar: 'طبقة التدقيق والتسجيل' },
    icon: FileText,
    color: 'slate',
    subcategories: [
      {
        name: { en: 'Audit Logging', ar: 'تسجيل التدقيق' },
        checks: [
          { id: 'audit-1', text: { en: 'Create actions logged', ar: 'إجراءات الإنشاء مسجلة' }, priority: 'high' },
          { id: 'audit-2', text: { en: 'Update actions logged with changed fields', ar: 'إجراءات التحديث مسجلة مع الحقول المتغيرة' }, priority: 'high' },
          { id: 'audit-3', text: { en: 'Delete actions logged', ar: 'إجراءات الحذف مسجلة' }, priority: 'high' },
          { id: 'audit-4', text: { en: 'Status changes logged', ar: 'تغييرات الحالة مسجلة' }, priority: 'medium' },
          { id: 'audit-5', text: { en: 'Sensitive actions logged (permission changes)', ar: 'الإجراءات الحساسة مسجلة' }, priority: 'high' },
          { id: 'audit-6', text: { en: 'Logs include user, timestamp, entity info', ar: 'السجلات تتضمن المستخدم والوقت ومعلومات الكيان' }, priority: 'medium' }
        ]
      }
    ]
  },
  {
    id: 'uiux',
    name: { en: 'UI/UX Layer', ar: 'طبقة واجهة المستخدم' },
    icon: Eye,
    color: 'teal',
    subcategories: [
      {
        name: { en: 'Accessibility & i18n', ar: 'إمكانية الوصول والتدويل' },
        checks: [
          { id: 'ui-1', text: { en: 'RTL layout works (Arabic)', ar: 'التخطيط من اليمين لليسار يعمل' }, priority: 'high' },
          { id: 'ui-2', text: { en: 'All strings use t() function', ar: 'جميع النصوص تستخدم دالة t()' }, priority: 'high' },
          { id: 'ui-3', text: { en: 'Mobile/tablet/desktop layouts work', ar: 'تخطيطات الجوال/التابلت/سطح المكتب تعمل' }, priority: 'medium' },
          { id: 'ui-4', text: { en: 'Proper heading hierarchy', ar: 'تسلسل العناوين صحيح' }, priority: 'low' }
        ]
      }
    ]
  },
  {
    id: 'security',
    name: { en: 'Security Layer', ar: 'طبقة الأمان' },
    icon: Lock,
    color: 'rose',
    subcategories: [
      {
        name: { en: 'Security Best Practices', ar: 'أفضل ممارسات الأمان' },
        checks: [
          { id: 'sec-1', text: { en: 'No hardcoded credentials', ar: 'لا توجد بيانات اعتماد مضمنة' }, priority: 'critical' },
          { id: 'sec-2', text: { en: 'No secrets in client code', ar: 'لا توجد أسرار في كود العميل' }, priority: 'critical' },
          { id: 'sec-3', text: { en: 'SQL injection prevented (parameterized queries)', ar: 'حقن SQL ممنوع' }, priority: 'critical' },
          { id: 'sec-4', text: { en: 'XSS prevented', ar: 'XSS ممنوع' }, priority: 'critical' },
          { id: 'sec-5', text: { en: 'Sensitive data encrypted', ar: 'البيانات الحساسة مشفرة' }, priority: 'high' },
          { id: 'sec-6', text: { en: 'Rate limiting on auth endpoints', ar: 'تحديد المعدل على نقاط نهاية المصادقة' }, priority: 'high' }
        ]
      }
    ]
  }
];

function SystemValidationChecklist() {
  const { t, language } = useLanguage();
  const [checkedItems, setCheckedItems] = useState({});
  const [selectedSystem, setSelectedSystem] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCheck = (checkId) => {
    setCheckedItems(prev => ({
      ...prev,
      [checkId]: !prev[checkId]
    }));
  };

  const getTotalChecks = () => {
    let total = 0;
    validationCategories.forEach(cat => {
      cat.subcategories.forEach(sub => {
        total += sub.checks.length;
      });
    });
    return total;
  };

  const getCompletedChecks = () => {
    return Object.values(checkedItems).filter(Boolean).length;
  };

  const getCategoryProgress = (category) => {
    let total = 0;
    let completed = 0;
    category.subcategories.forEach(sub => {
      sub.checks.forEach(check => {
        total++;
        if (checkedItems[check.id]) completed++;
      });
    });
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-slate-400 text-white';
      default: return 'bg-slate-300';
    }
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      critical: { en: 'Critical', ar: 'حرج' },
      high: { en: 'High', ar: 'عالي' },
      medium: { en: 'Medium', ar: 'متوسط' },
      low: { en: 'Low', ar: 'منخفض' }
    };
    return t(labels[priority] || { en: priority, ar: priority });
  };

  const exportChecklist = () => {
    const data = {
      system: selectedSystem || 'All Systems',
      date: new Date().toISOString(),
      totalChecks: getTotalChecks(),
      completedChecks: getCompletedChecks(),
      categories: validationCategories.map(cat => ({
        name: t(cat.name),
        progress: getCategoryProgress(cat),
        subcategories: cat.subcategories.map(sub => ({
          name: t(sub.name),
          checks: sub.checks.map(check => ({
            text: t(check.text),
            priority: check.priority,
            completed: !!checkedItems[check.id]
          }))
        }))
      }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `validation-checklist-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const resetChecklist = () => {
    setCheckedItems({});
  };

  const totalChecks = getTotalChecks();
  const completedChecks = getCompletedChecks();
  const overallProgress = totalChecks > 0 ? Math.round((completedChecks / totalChecks) * 100) : 0;

  const filteredCategories = validationCategories.filter(cat => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      t(cat.name).toLowerCase().includes(query) ||
      cat.subcategories.some(sub => 
        t(sub.name).toLowerCase().includes(query) ||
        sub.checks.some(check => t(check.text).toLowerCase().includes(query))
      )
    );
  });

  return (
    <PageLayout>
      <PageHeader
        title={t({ en: 'System Validation Checklist', ar: 'قائمة التحقق من النظام' })}
        description={t({ en: 'Comprehensive deep validation checklist for all systems', ar: 'قائمة تحقق شاملة لجميع الأنظمة' })}
        icon={<ClipboardCheck className="h-8 w-8 text-primary" />}
      />

      {/* Overall Progress */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                  overallProgress === 100 ? 'bg-green-600' : overallProgress >= 70 ? 'bg-amber-500' : 'bg-red-500'
                }`}>
                  {overallProgress === 100 ? (
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  ) : overallProgress >= 70 ? (
                    <AlertTriangle className="h-6 w-6 text-white" />
                  ) : (
                    <XCircle className="h-6 w-6 text-white" />
                  )}
                </div>
                <div>
                  <p className="text-2xl font-bold">{overallProgress}%</p>
                  <p className="text-sm text-muted-foreground">
                    {completedChecks} / {totalChecks} {t({ en: 'checks completed', ar: 'تم إكمال الفحوصات' })}
                  </p>
                </div>
              </div>
              <Progress value={overallProgress} className="h-3" />
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetChecklist} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                {t({ en: 'Reset', ar: 'إعادة تعيين' })}
              </Button>
              <Button onClick={exportChecklist} className="gap-2">
                <Download className="h-4 w-4" />
                {t({ en: 'Export', ar: 'تصدير' })}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t({ en: 'Search checks...', ar: 'البحث في الفحوصات...' })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Input
              placeholder={t({ en: 'System name (optional)', ar: 'اسم النظام (اختياري)' })}
              value={selectedSystem}
              onChange={(e) => setSelectedSystem(e.target.value)}
              className="md:w-64"
            />
          </div>
        </CardContent>
      </Card>

      {/* Category Progress Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {validationCategories.map(cat => {
          const Icon = cat.icon;
          const progress = getCategoryProgress(cat);
          return (
            <Card key={cat.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`h-4 w-4 text-${cat.color}-600`} />
                  <span className="text-xs font-medium truncate">{t(cat.name)}</span>
                </div>
                <Progress value={progress} className="h-2 mb-1" />
                <p className="text-xs text-muted-foreground text-right">{progress}%</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Validation Categories */}
      <div className="space-y-4">
        {filteredCategories.map(category => {
          const Icon = category.icon;
          const progress = getCategoryProgress(category);
          
          return (
            <Card key={category.id} className={`border-2 border-${category.color}-200`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Icon className={`h-5 w-5 text-${category.color}-600`} />
                    {t(category.name)}
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    <Progress value={progress} className="w-24 h-2" />
                    <Badge variant={progress === 100 ? 'default' : 'secondary'}>
                      {progress}%
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  {category.subcategories.map((subcat, subIdx) => (
                    <AccordionItem key={subIdx} value={`${category.id}-${subIdx}`}>
                      <AccordionTrigger className="text-sm font-medium hover:no-underline">
                        <div className="flex items-center gap-2">
                          {t(subcat.name)}
                          <Badge variant="outline" className="text-xs">
                            {subcat.checks.filter(c => checkedItems[c.id]).length}/{subcat.checks.length}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pt-2">
                          {subcat.checks.map(check => (
                            <div 
                              key={check.id} 
                              className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                                checkedItems[check.id] ? 'bg-green-50 border-green-200' : 'bg-background hover:bg-muted/50'
                              }`}
                            >
                              <Checkbox
                                id={check.id}
                                checked={!!checkedItems[check.id]}
                                onCheckedChange={() => handleCheck(check.id)}
                                className="mt-0.5"
                              />
                              <div className="flex-1">
                                <label 
                                  htmlFor={check.id} 
                                  className={`text-sm cursor-pointer ${checkedItems[check.id] ? 'line-through text-muted-foreground' : ''}`}
                                >
                                  {t(check.text)}
                                </label>
                              </div>
                              <Badge className={`text-xs ${getPriorityColor(check.priority)}`}>
                                {getPriorityLabel(check.priority)}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* SQL Validation Queries */}
      <Card className="border-2 border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-slate-600" />
            {t({ en: 'Validation SQL Queries', ar: 'استعلامات SQL للتحقق' })}
          </CardTitle>
          <CardDescription>
            {t({ en: 'Run these queries to validate database configuration', ar: 'قم بتشغيل هذه الاستعلامات للتحقق من تكوين قاعدة البيانات' })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-slate-900 rounded-lg">
            <p className="text-xs text-slate-400 mb-2">-- {t({ en: 'Check RLS enabled on all tables', ar: 'تحقق من تفعيل RLS على جميع الجداول' })}</p>
            <code className="text-sm text-green-400 font-mono">
              SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
            </code>
          </div>
          
          <div className="p-4 bg-slate-900 rounded-lg">
            <p className="text-xs text-slate-400 mb-2">-- {t({ en: 'List all policies', ar: 'عرض جميع السياسات' })}</p>
            <code className="text-sm text-green-400 font-mono">
              SELECT tablename, policyname, cmd, qual FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename;
            </code>
          </div>
          
          <div className="p-4 bg-slate-900 rounded-lg">
            <p className="text-xs text-slate-400 mb-2">-- {t({ en: 'Find tables without policies', ar: 'البحث عن الجداول بدون سياسات' })}</p>
            <code className="text-sm text-green-400 font-mono">
              SELECT t.tablename FROM pg_tables t LEFT JOIN pg_policies p ON t.tablename = p.tablename WHERE t.schemaname = 'public' AND p.policyname IS NULL;
            </code>
          </div>
          
          <div className="p-4 bg-slate-900 rounded-lg">
            <p className="text-xs text-slate-400 mb-2">-- {t({ en: 'Check for "Allow all" policies', ar: 'تحقق من سياسات "السماح للجميع"' })}</p>
            <code className="text-sm text-green-400 font-mono">
              SELECT * FROM pg_policies WHERE qual = 'true';
            </code>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}

export default ProtectedPage(SystemValidationChecklist, { requireAdmin: true });
