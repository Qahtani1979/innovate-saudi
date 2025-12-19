import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';
import { 
  ClipboardCheck, Database, Shield, Code, Users, GitBranch, Bell, 
  FileText, Eye, Lock, Search, Download, RefreshCw, CheckCircle2,
  AlertTriangle, XCircle, Layers, Activity, Settings, Server, 
  Globe, FolderOpen, BookOpen, Zap
} from 'lucide-react';

const validationCategories = [
  {
    id: 'database',
    name: { en: '1. Database Layer', ar: '1. طبقة قاعدة البيانات' },
    icon: Database,
    color: 'blue',
    subcategories: [
      {
        name: { en: '1.1 Schema Validation', ar: '1.1 التحقق من المخطط' },
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
        name: { en: '1.2 Row Level Security (RLS)', ar: '1.2 أمان مستوى الصف' },
        checks: [
          { id: 'rls-1', text: { en: 'RLS is ENABLED on all tables', ar: 'RLS مفعّل على جميع الجداول' }, priority: 'critical' },
          { id: 'rls-2', text: { en: 'SELECT policies exist for all user types (admin, staff, user, public)', ar: 'سياسات SELECT موجودة لجميع أنواع المستخدمين' }, priority: 'critical' },
          { id: 'rls-3', text: { en: 'INSERT policies have WITH CHECK clause (not just USING)', ar: 'سياسات INSERT تحتوي على WITH CHECK وليس USING فقط' }, priority: 'critical' },
          { id: 'rls-4', text: { en: 'UPDATE policies have both USING and WITH CHECK', ar: 'سياسات UPDATE تحتوي على USING و WITH CHECK' }, priority: 'critical' },
          { id: 'rls-5', text: { en: 'DELETE policies are appropriately restrictive', ar: 'سياسات DELETE مقيدة بشكل مناسب' }, priority: 'high' },
          { id: 'rls-6', text: { en: 'No "Allow all" or overly permissive policies', ar: 'لا توجد سياسات "السماح للجميع" أو المفرطة' }, priority: 'critical' },
          { id: 'rls-7', text: { en: 'PII tables have strict access control', ar: 'جداول البيانات الشخصية لها تحكم صارم' }, priority: 'critical' },
          { id: 'rls-8', text: { en: 'Owner-based access uses auth.uid() or auth.email()', ar: 'الوصول المبني على المالك يستخدم auth.uid() أو auth.email()' }, priority: 'high' },
          { id: 'rls-9', text: { en: 'Admin bypass uses secure function (is_admin())', ar: 'تجاوز المسؤول يستخدم دالة آمنة' }, priority: 'critical' },
          { id: 'rls-10', text: { en: 'Staff policies check role via user_roles + roles join', ar: 'سياسات الموظفين تتحقق من الدور عبر user_roles + roles' }, priority: 'high' }
        ]
      },
      {
        name: { en: '1.3 Database Functions & Triggers', ar: '1.3 دوال ومحفزات قاعدة البيانات' },
        checks: [
          { id: 'fn-1', text: { en: 'Functions use SECURITY DEFINER when needed', ar: 'الدوال تستخدم SECURITY DEFINER عند الحاجة' }, priority: 'high' },
          { id: 'fn-2', text: { en: 'Functions have SET search_path = public', ar: 'الدوال تحتوي على SET search_path = public' }, priority: 'high' },
          { id: 'fn-3', text: { en: 'Triggers exist for updated_at columns', ar: 'المحفزات موجودة لأعمدة updated_at' }, priority: 'medium' },
          { id: 'fn-4', text: { en: 'Audit/logging triggers work correctly', ar: 'محفزات التدقيق/التسجيل تعمل بشكل صحيح' }, priority: 'medium' },
          { id: 'fn-5', text: { en: 'No functions expose sensitive data', ar: 'لا توجد دوال تكشف بيانات حساسة' }, priority: 'critical' }
        ]
      }
    ]
  },
  {
    id: 'hooks',
    name: { en: '2. Hooks Layer', ar: '2. طبقة الـ Hooks' },
    icon: Code,
    color: 'purple',
    subcategories: [
      {
        name: { en: '2.1 Query Hooks', ar: '2.1 Hooks الاستعلام' },
        checks: [
          { id: 'qh-1', text: { en: 'useQuery has proper queryKey with all dependencies', ar: 'useQuery يحتوي على queryKey مناسب مع جميع التبعيات' }, priority: 'high' },
          { id: 'qh-2', text: { en: 'enabled condition prevents unnecessary fetches', ar: 'شرط enabled يمنع الجلب غير الضروري' }, priority: 'medium' },
          { id: 'qh-3', text: { en: 'staleTime is set appropriately', ar: 'staleTime مضبوط بشكل مناسب' }, priority: 'medium' },
          { id: 'qh-4', text: { en: 'Error handling exists', ar: 'معالجة الأخطاء موجودة' }, priority: 'high' },
          { id: 'qh-5', text: { en: 'Loading states are handled', ar: 'حالات التحميل يتم التعامل معها' }, priority: 'medium' },
          { id: 'qh-6', text: { en: 'Empty data returns [] not undefined', ar: 'البيانات الفارغة ترجع [] وليس undefined' }, priority: 'medium' }
        ]
      },
      {
        name: { en: '2.2 Mutation Hooks', ar: '2.2 Hooks التعديل' },
        checks: [
          { id: 'mh-1', text: { en: 'useMutation invalidates related queries on success', ar: 'useMutation يبطل الاستعلامات المرتبطة عند النجاح' }, priority: 'high' },
          { id: 'mh-2', text: { en: 'Optimistic updates (if applicable)', ar: 'التحديثات المتفائلة (إذا كان قابلاً للتطبيق)' }, priority: 'low' },
          { id: 'mh-3', text: { en: 'Error handling with user feedback (toast)', ar: 'معالجة الأخطاء مع إشعار المستخدم (toast)' }, priority: 'high' },
          { id: 'mh-4', text: { en: 'Audit logging after mutations', ar: 'تسجيل التدقيق بعد التعديلات' }, priority: 'medium' },
          { id: 'mh-5', text: { en: 'Email/notification triggers after important actions', ar: 'محفزات البريد/الإشعارات بعد الإجراءات المهمة' }, priority: 'medium' }
        ]
      },
      {
        name: { en: '2.3 Visibility Hooks', ar: '2.3 Hooks الرؤية' },
        checks: [
          { id: 'vh-1', text: { en: 'Admin sees all data', ar: 'المسؤول يرى جميع البيانات' }, priority: 'high' },
          { id: 'vh-2', text: { en: 'Staff sees appropriate subset (own municipality, sector)', ar: 'الموظف يرى المجموعة المناسبة (بلديته، قطاعه)' }, priority: 'high' },
          { id: 'vh-3', text: { en: 'Public users see only published/active items', ar: 'المستخدمون العامون يرون العناصر المنشورة/النشطة فقط' }, priority: 'high' },
          { id: 'vh-4', text: { en: 'Visibility loading state prevents premature queries', ar: 'حالة تحميل الرؤية تمنع الاستعلامات المبكرة' }, priority: 'medium' },
          { id: 'vh-5', text: { en: 'National vs Geographic visibility logic is correct', ar: 'منطق الرؤية الوطنية مقابل الجغرافية صحيح' }, priority: 'high' }
        ]
      }
    ]
  },
  {
    id: 'components',
    name: { en: '3. Components Layer', ar: '3. طبقة المكونات' },
    icon: Layers,
    color: 'green',
    subcategories: [
      {
        name: { en: '3.1 Page Components', ar: '3.1 مكونات الصفحة' },
        checks: [
          { id: 'pc-1', text: { en: 'Protected with ProtectedPage HOC', ar: 'محمية بـ ProtectedPage HOC' }, priority: 'critical' },
          { id: 'pc-2', text: { en: 'Required permissions specified', ar: 'الصلاحيات المطلوبة محددة' }, priority: 'high' },
          { id: 'pc-3', text: { en: 'Required roles specified', ar: 'الأدوار المطلوبة محددة' }, priority: 'high' },
          { id: 'pc-4', text: { en: 'Loading skeleton shown during fetch', ar: 'هيكل التحميل يظهر أثناء الجلب' }, priority: 'medium' },
          { id: 'pc-5', text: { en: 'Empty state handled gracefully', ar: 'الحالة الفارغة يتم التعامل معها بشكل جيد' }, priority: 'medium' },
          { id: 'pc-6', text: { en: 'Error boundary exists', ar: 'حدود الخطأ موجودة' }, priority: 'medium' }
        ]
      },
      {
        name: { en: '3.2 Form Components', ar: '3.2 مكونات النموذج' },
        checks: [
          { id: 'fc-1', text: { en: 'Input validation (Zod schema)', ar: 'التحقق من المدخلات (Zod schema)' }, priority: 'high' },
          { id: 'fc-2', text: { en: 'Required fields marked', ar: 'الحقول المطلوبة معلّمة' }, priority: 'medium' },
          { id: 'fc-3', text: { en: 'Max length limits enforced', ar: 'حدود الطول القصوى مفروضة' }, priority: 'medium' },
          { id: 'fc-4', text: { en: 'Proper error messages', ar: 'رسائل خطأ مناسبة' }, priority: 'medium' },
          { id: 'fc-5', text: { en: 'Submit button disabled during loading', ar: 'زر الإرسال معطل أثناء التحميل' }, priority: 'medium' },
          { id: 'fc-6', text: { en: 'Form reset after successful submission', ar: 'إعادة تعيين النموذج بعد الإرسال الناجح' }, priority: 'low' }
        ]
      },
      {
        name: { en: '3.3 List/Table Components', ar: '3.3 مكونات القائمة/الجدول' },
        checks: [
          { id: 'lc-1', text: { en: 'Pagination or infinite scroll for large datasets', ar: 'ترقيم الصفحات أو التمرير اللانهائي للبيانات الكبيرة' }, priority: 'medium' },
          { id: 'lc-2', text: { en: 'Search/filter functionality works', ar: 'وظيفة البحث/الفلترة تعمل' }, priority: 'medium' },
          { id: 'lc-3', text: { en: 'Sort functionality works', ar: 'وظيفة الفرز تعمل' }, priority: 'low' },
          { id: 'lc-4', text: { en: 'Actions (edit, delete, view) have permission checks', ar: 'الإجراءات (تعديل، حذف، عرض) لها فحوصات صلاحيات' }, priority: 'high' },
          { id: 'lc-5', text: { en: 'Confirmation dialogs for destructive actions', ar: 'نوافذ تأكيد للإجراءات المدمرة' }, priority: 'high' }
        ]
      },
      {
        name: { en: '3.4 Detail Components', ar: '3.4 مكونات التفاصيل' },
        checks: [
          { id: 'dc-1', text: { en: '404 handling for invalid IDs', ar: 'معالجة 404 للمعرفات غير الصالحة' }, priority: 'medium' },
          { id: 'dc-2', text: { en: 'Access denied for unauthorized users', ar: 'رفض الوصول للمستخدمين غير المصرح لهم' }, priority: 'high' },
          { id: 'dc-3', text: { en: 'Edit/delete buttons respect permissions', ar: 'أزرار التعديل/الحذف تحترم الصلاحيات' }, priority: 'high' },
          { id: 'dc-4', text: { en: 'Related data loaded efficiently (joins vs separate queries)', ar: 'البيانات المرتبطة يتم تحميلها بكفاءة' }, priority: 'medium' }
        ]
      }
    ]
  },
  {
    id: 'api',
    name: { en: '4. API/Edge Functions Layer', ar: '4. طبقة API/Edge Functions' },
    icon: Server,
    color: 'orange',
    subcategories: [
      {
        name: { en: '4.1 Security', ar: '4.1 الأمان' },
        checks: [
          { id: 'api-1', text: { en: 'Authentication required (JWT validation)', ar: 'المصادقة مطلوبة (التحقق من JWT)' }, priority: 'critical' },
          { id: 'api-2', text: { en: 'Authorization checked (user has permission)', ar: 'التفويض يتم فحصه (المستخدم لديه صلاحية)' }, priority: 'critical' },
          { id: 'api-3', text: { en: 'Rate limiting implemented', ar: 'تحديد المعدل مطبق' }, priority: 'high' },
          { id: 'api-4', text: { en: 'Input validation before processing', ar: 'التحقق من المدخلات قبل المعالجة' }, priority: 'critical' },
          { id: 'api-5', text: { en: 'Secrets not exposed in responses', ar: 'الأسرار غير مكشوفة في الردود' }, priority: 'critical' },
          { id: 'api-6', text: { en: 'CORS configured correctly', ar: 'CORS مكوّن بشكل صحيح' }, priority: 'high' }
        ]
      },
      {
        name: { en: '4.2 Error Handling', ar: '4.2 معالجة الأخطاء' },
        checks: [
          { id: 'api-7', text: { en: 'Proper HTTP status codes (400, 401, 403, 404, 500)', ar: 'رموز حالة HTTP مناسبة' }, priority: 'high' },
          { id: 'api-8', text: { en: 'Error messages don\'t leak sensitive info', ar: 'رسائل الخطأ لا تسرب معلومات حساسة' }, priority: 'critical' },
          { id: 'api-9', text: { en: 'Errors logged for debugging', ar: 'الأخطاء مسجلة للتصحيح' }, priority: 'medium' },
          { id: 'api-10', text: { en: 'Graceful degradation', ar: 'التدهور اللطيف' }, priority: 'medium' }
        ]
      },
      {
        name: { en: '4.3 Performance', ar: '4.3 الأداء' },
        checks: [
          { id: 'api-11', text: { en: 'Response times acceptable', ar: 'أوقات الاستجابة مقبولة' }, priority: 'medium' },
          { id: 'api-12', text: { en: 'Large payloads paginated', ar: 'الحمولات الكبيرة مقسمة لصفحات' }, priority: 'medium' },
          { id: 'api-13', text: { en: 'Caching where appropriate', ar: 'التخزين المؤقت حيثما مناسب' }, priority: 'low' },
          { id: 'api-14', text: { en: 'Database queries optimized', ar: 'استعلامات قاعدة البيانات محسنة' }, priority: 'medium' }
        ]
      }
    ]
  },
  {
    id: 'permissions',
    name: { en: '5. Permissions Layer', ar: '5. طبقة الصلاحيات' },
    icon: Shield,
    color: 'red',
    subcategories: [
      {
        name: { en: '5.1 Role-Based Access Control (RBAC)', ar: '5.1 التحكم في الوصول المبني على الأدوار' },
        checks: [
          { id: 'rbac-1', text: { en: 'Roles stored in separate roles table', ar: 'الأدوار مخزنة في جدول منفصل' }, priority: 'critical' },
          { id: 'rbac-2', text: { en: 'User-role mapping in user_roles table', ar: 'ربط المستخدم-الدور في جدول user_roles' }, priority: 'critical' },
          { id: 'rbac-3', text: { en: 'Permissions stored in permissions table', ar: 'الصلاحيات مخزنة في جدول permissions' }, priority: 'high' },
          { id: 'rbac-4', text: { en: 'Role-permission mapping in role_permissions table', ar: 'ربط الدور-الصلاحية في جدول role_permissions' }, priority: 'high' },
          { id: 'rbac-5', text: { en: 'usePermissions hook returns correct data', ar: 'hook usePermissions يرجع بيانات صحيحة' }, priority: 'high' },
          { id: 'rbac-6', text: { en: 'hasRole() function works correctly', ar: 'دالة hasRole() تعمل بشكل صحيح' }, priority: 'high' },
          { id: 'rbac-7', text: { en: 'hasPermission() function works correctly', ar: 'دالة hasPermission() تعمل بشكل صحيح' }, priority: 'high' }
        ]
      },
      {
        name: { en: '5.2 Permission Checks', ar: '5.2 فحوصات الصلاحيات' },
        checks: [
          { id: 'perm-1', text: { en: 'UI elements hidden for unauthorized users', ar: 'عناصر الواجهة مخفية للمستخدمين غير المصرح لهم' }, priority: 'high' },
          { id: 'perm-2', text: { en: 'API endpoints verify permissions server-side', ar: 'نقاط API تتحقق من الصلاحيات على الخادم' }, priority: 'critical' },
          { id: 'perm-3', text: { en: 'RLS policies use consistent permission logic', ar: 'سياسات RLS تستخدم منطق صلاحيات متسق' }, priority: 'high' },
          { id: 'perm-4', text: { en: 'No client-side only permission checks', ar: 'لا توجد فحوصات صلاحيات على جانب العميل فقط' }, priority: 'critical' }
        ]
      }
    ]
  },
  {
    id: 'workflow',
    name: { en: '6. Workflow Layer', ar: '6. طبقة سير العمل' },
    icon: GitBranch,
    color: 'amber',
    subcategories: [
      {
        name: { en: '6.1 Status Transitions', ar: '6.1 انتقالات الحالة' },
        checks: [
          { id: 'wf-1', text: { en: 'Valid status values defined', ar: 'قيم الحالة الصالحة محددة' }, priority: 'high' },
          { id: 'wf-2', text: { en: 'Transition rules enforced (draft→pending→approved)', ar: 'قواعد الانتقال مفروضة (مسودة→معلق→موافق)' }, priority: 'high' },
          { id: 'wf-3', text: { en: 'Status changes trigger appropriate actions', ar: 'تغييرات الحالة تحفز الإجراءات المناسبة' }, priority: 'medium' },
          { id: 'wf-4', text: { en: 'Rollback/rejection paths work', ar: 'مسارات التراجع/الرفض تعمل' }, priority: 'medium' },
          { id: 'wf-5', text: { en: 'Status history tracked (audit log)', ar: 'سجل الحالة يتم تتبعه (سجل التدقيق)' }, priority: 'medium' }
        ]
      },
      {
        name: { en: '6.2 Approval Workflows', ar: '6.2 سير عمل الموافقات' },
        checks: [
          { id: 'aw-1', text: { en: 'Approval requests created correctly', ar: 'طلبات الموافقة تُنشأ بشكل صحيح' }, priority: 'high' },
          { id: 'aw-2', text: { en: 'SLA due dates calculated', ar: 'تواريخ استحقاق SLA محسوبة' }, priority: 'medium' },
          { id: 'aw-3', text: { en: 'Escalation logic works', ar: 'منطق التصعيد يعمل' }, priority: 'medium' },
          { id: 'aw-4', text: { en: 'Approver receives notification', ar: 'الموافِق يستلم إشعار' }, priority: 'high' },
          { id: 'aw-5', text: { en: 'Requester notified of decision', ar: 'مقدم الطلب يُبلّغ بالقرار' }, priority: 'high' }
        ]
      }
    ]
  },
  {
    id: 'notifications',
    name: { en: '7. Notification Layer', ar: '7. طبقة الإشعارات' },
    icon: Bell,
    color: 'indigo',
    subcategories: [
      {
        name: { en: '7.1 Email Notifications', ar: '7.1 إشعارات البريد الإلكتروني' },
        checks: [
          { id: 'email-1', text: { en: 'Templates exist for all trigger events', ar: 'القوالب موجودة لجميع الأحداث المحفزة' }, priority: 'medium' },
          { id: 'email-2', text: { en: 'Variables interpolated correctly', ar: 'المتغيرات مستبدلة بشكل صحيح' }, priority: 'medium' },
          { id: 'email-3', text: { en: 'Unsubscribe option works', ar: 'خيار إلغاء الاشتراك يعمل' }, priority: 'medium' },
          { id: 'email-4', text: { en: 'Email logs captured', ar: 'سجلات البريد الإلكتروني مسجلة' }, priority: 'medium' },
          { id: 'email-5', text: { en: 'Bounce handling', ar: 'معالجة الرسائل المرتدة' }, priority: 'low' }
        ]
      },
      {
        name: { en: '7.2 In-App Notifications', ar: '7.2 الإشعارات داخل التطبيق' },
        checks: [
          { id: 'notif-1', text: { en: 'Notifications created on key events', ar: 'الإشعارات تُنشأ عند الأحداث الرئيسية' }, priority: 'medium' },
          { id: 'notif-2', text: { en: 'Read/unread status tracked', ar: 'حالة القراءة/عدم القراءة يتم تتبعها' }, priority: 'medium' },
          { id: 'notif-3', text: { en: 'Mark all as read works', ar: 'تحديد الكل كمقروء يعمل' }, priority: 'low' },
          { id: 'notif-4', text: { en: 'Real-time updates (if applicable)', ar: 'التحديثات الفورية (إذا كان قابلاً للتطبيق)' }, priority: 'low' }
        ]
      }
    ]
  },
  {
    id: 'audit',
    name: { en: '8. Audit & Logging Layer', ar: '8. طبقة التدقيق والتسجيل' },
    icon: FileText,
    color: 'slate',
    subcategories: [
      {
        name: { en: '8.1 Audit Logging', ar: '8.1 تسجيل التدقيق' },
        checks: [
          { id: 'audit-1', text: { en: 'Create actions logged', ar: 'إجراءات الإنشاء مسجلة' }, priority: 'high' },
          { id: 'audit-2', text: { en: 'Update actions logged with changed fields', ar: 'إجراءات التحديث مسجلة مع الحقول المتغيرة' }, priority: 'high' },
          { id: 'audit-3', text: { en: 'Delete actions logged', ar: 'إجراءات الحذف مسجلة' }, priority: 'high' },
          { id: 'audit-4', text: { en: 'Status changes logged', ar: 'تغييرات الحالة مسجلة' }, priority: 'medium' },
          { id: 'audit-5', text: { en: 'Login/logout logged', ar: 'تسجيل الدخول/الخروج مسجل' }, priority: 'high' },
          { id: 'audit-6', text: { en: 'Sensitive actions logged (permission changes)', ar: 'الإجراءات الحساسة مسجلة (تغييرات الصلاحيات)' }, priority: 'high' },
          { id: 'audit-7', text: { en: 'Logs include user, timestamp, entity info', ar: 'السجلات تتضمن المستخدم والوقت ومعلومات الكيان' }, priority: 'medium' }
        ]
      }
    ]
  },
  {
    id: 'uiux',
    name: { en: '9. UI/UX Layer', ar: '9. طبقة واجهة المستخدم' },
    icon: Eye,
    color: 'teal',
    subcategories: [
      {
        name: { en: '9.1 Accessibility', ar: '9.1 إمكانية الوصول' },
        checks: [
          { id: 'a11y-1', text: { en: 'Proper heading hierarchy (h1, h2, h3)', ar: 'تسلسل العناوين الصحيح (h1، h2، h3)' }, priority: 'medium' },
          { id: 'a11y-2', text: { en: 'Alt text on images', ar: 'نص بديل على الصور' }, priority: 'medium' },
          { id: 'a11y-3', text: { en: 'Keyboard navigation works', ar: 'التنقل بلوحة المفاتيح يعمل' }, priority: 'medium' },
          { id: 'a11y-4', text: { en: 'Focus indicators visible', ar: 'مؤشرات التركيز مرئية' }, priority: 'medium' },
          { id: 'a11y-5', text: { en: 'Color contrast sufficient', ar: 'تباين الألوان كافي' }, priority: 'medium' }
        ]
      },
      {
        name: { en: '9.2 Responsiveness', ar: '9.2 الاستجابة' },
        checks: [
          { id: 'resp-1', text: { en: 'Mobile layout works', ar: 'تخطيط الجوال يعمل' }, priority: 'high' },
          { id: 'resp-2', text: { en: 'Tablet layout works', ar: 'تخطيط التابلت يعمل' }, priority: 'medium' },
          { id: 'resp-3', text: { en: 'Desktop layout works', ar: 'تخطيط سطح المكتب يعمل' }, priority: 'high' },
          { id: 'resp-4', text: { en: 'Touch targets adequate size', ar: 'أهداف اللمس بحجم مناسب' }, priority: 'medium' }
        ]
      },
      {
        name: { en: '9.3 Internationalization (i18n)', ar: '9.3 التدويل' },
        checks: [
          { id: 'i18n-1', text: { en: 'All strings use t() function', ar: 'جميع النصوص تستخدم دالة t()' }, priority: 'high' },
          { id: 'i18n-2', text: { en: 'RTL layout works (Arabic)', ar: 'تخطيط RTL يعمل (العربية)' }, priority: 'high' },
          { id: 'i18n-3', text: { en: 'Date/number formatting localized', ar: 'تنسيق التاريخ/الأرقام محلي' }, priority: 'medium' },
          { id: 'i18n-4', text: { en: 'Pluralization handled', ar: 'الجمع يتم التعامل معه' }, priority: 'low' }
        ]
      }
    ]
  },
  {
    id: 'integration',
    name: { en: '10. Integration Layer', ar: '10. طبقة التكامل' },
    icon: Globe,
    color: 'cyan',
    subcategories: [
      {
        name: { en: '10.1 External APIs', ar: '10.1 واجهات API الخارجية' },
        checks: [
          { id: 'ext-1', text: { en: 'API keys stored as secrets', ar: 'مفاتيح API مخزنة كأسرار' }, priority: 'critical' },
          { id: 'ext-2', text: { en: 'Error handling for API failures', ar: 'معالجة الأخطاء لفشل API' }, priority: 'high' },
          { id: 'ext-3', text: { en: 'Retry logic for transient failures', ar: 'منطق إعادة المحاولة للفشل المؤقت' }, priority: 'medium' },
          { id: 'ext-4', text: { en: 'Timeout handling', ar: 'معالجة انتهاء المهلة' }, priority: 'medium' },
          { id: 'ext-5', text: { en: 'Response validation', ar: 'التحقق من الاستجابة' }, priority: 'medium' }
        ]
      },
      {
        name: { en: '10.2 File Storage', ar: '10.2 تخزين الملفات' },
        checks: [
          { id: 'stor-1', text: { en: 'Upload size limits enforced', ar: 'حدود حجم الرفع مفروضة' }, priority: 'high' },
          { id: 'stor-2', text: { en: 'File type validation', ar: 'التحقق من نوع الملف' }, priority: 'high' },
          { id: 'stor-3', text: { en: 'Storage bucket policies correct', ar: 'سياسات دلو التخزين صحيحة' }, priority: 'high' },
          { id: 'stor-4', text: { en: 'Public vs private buckets appropriate', ar: 'الدلاء العامة مقابل الخاصة مناسبة' }, priority: 'high' },
          { id: 'stor-5', text: { en: 'Cleanup of orphaned files', ar: 'تنظيف الملفات اليتيمة' }, priority: 'low' }
        ]
      }
    ]
  },
  {
    id: 'documentation',
    name: { en: '11. Documentation Layer', ar: '11. طبقة التوثيق' },
    icon: BookOpen,
    color: 'violet',
    subcategories: [
      {
        name: { en: '11.1 Documentation', ar: '11.1 التوثيق' },
        checks: [
          { id: 'doc-1', text: { en: 'README exists with setup instructions', ar: 'README موجود مع تعليمات الإعداد' }, priority: 'medium' },
          { id: 'doc-2', text: { en: 'API documentation current', ar: 'توثيق API محدث' }, priority: 'medium' },
          { id: 'doc-3', text: { en: 'Component documentation exists', ar: 'توثيق المكونات موجود' }, priority: 'low' },
          { id: 'doc-4', text: { en: 'Database schema documented', ar: 'مخطط قاعدة البيانات موثق' }, priority: 'medium' },
          { id: 'doc-5', text: { en: 'Workflow diagrams exist', ar: 'مخططات سير العمل موجودة' }, priority: 'low' },
          { id: 'doc-6', text: { en: 'Permission matrix documented', ar: 'مصفوفة الصلاحيات موثقة' }, priority: 'medium' }
        ]
      }
    ]
  },
  {
    id: 'security',
    name: { en: '12. Security Layer', ar: '12. طبقة الأمان' },
    icon: Lock,
    color: 'rose',
    subcategories: [
      {
        name: { en: '12.1 Security Best Practices', ar: '12.1 أفضل ممارسات الأمان' },
        checks: [
          { id: 'sec-1', text: { en: 'No hardcoded credentials', ar: 'لا توجد بيانات اعتماد مضمنة' }, priority: 'critical' },
          { id: 'sec-2', text: { en: 'No secrets in client code', ar: 'لا توجد أسرار في كود العميل' }, priority: 'critical' },
          { id: 'sec-3', text: { en: 'SQL injection prevented (parameterized queries)', ar: 'حقن SQL ممنوع (استعلامات معلمة)' }, priority: 'critical' },
          { id: 'sec-4', text: { en: 'XSS prevented (no dangerouslySetInnerHTML)', ar: 'XSS ممنوع (لا dangerouslySetInnerHTML)' }, priority: 'critical' },
          { id: 'sec-5', text: { en: 'CSRF protection enabled', ar: 'حماية CSRF مفعلة' }, priority: 'high' },
          { id: 'sec-6', text: { en: 'Sensitive data encrypted', ar: 'البيانات الحساسة مشفرة' }, priority: 'high' },
          { id: 'sec-7', text: { en: 'Password policies enforced', ar: 'سياسات كلمة المرور مفروضة' }, priority: 'high' },
          { id: 'sec-8', text: { en: 'Session timeout configured', ar: 'انتهاء الجلسة مكوّن' }, priority: 'medium' },
          { id: 'sec-9', text: { en: 'Rate limiting on auth endpoints', ar: 'تحديد المعدل على نقاط المصادقة' }, priority: 'high' }
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
  const [activeTab, setActiveTab] = useState('all');

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

  const getCriticalCount = () => {
    let total = 0;
    let completed = 0;
    validationCategories.forEach(cat => {
      cat.subcategories.forEach(sub => {
        sub.checks.forEach(check => {
          if (check.priority === 'critical') {
            total++;
            if (checkedItems[check.id]) completed++;
          }
        });
      });
    });
    return { total, completed };
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
    a.download = `validation-checklist-${selectedSystem || 'all'}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const resetChecklist = () => {
    setCheckedItems({});
  };

  const totalChecks = getTotalChecks();
  const completedChecks = getCompletedChecks();
  const overallProgress = totalChecks > 0 ? Math.round((completedChecks / totalChecks) * 100) : 0;
  const criticalStats = getCriticalCount();

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
        description={t({ en: 'Comprehensive 12-layer deep validation checklist for all systems', ar: 'قائمة تحقق شاملة من 12 طبقة لجميع الأنظمة' })}
        icon={<ClipboardCheck className="h-8 w-8 text-primary" />}
      />

      {/* Overall Progress */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className={`h-14 w-14 rounded-full flex items-center justify-center ${
                  overallProgress === 100 ? 'bg-green-600' : overallProgress >= 70 ? 'bg-amber-500' : 'bg-red-500'
                }`}>
                  {overallProgress === 100 ? (
                    <CheckCircle2 className="h-7 w-7 text-white" />
                  ) : overallProgress >= 70 ? (
                    <AlertTriangle className="h-7 w-7 text-white" />
                  ) : (
                    <XCircle className="h-7 w-7 text-white" />
                  )}
                </div>
                <div>
                  <p className="text-3xl font-bold">{overallProgress}%</p>
                  <p className="text-sm text-muted-foreground">
                    {completedChecks} / {totalChecks} {t({ en: 'checks completed', ar: 'فحص مكتمل' })}
                  </p>
                </div>
              </div>
              <Progress value={overallProgress} className="h-3" />
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                <Shield className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-900">
                    {t({ en: 'Critical Items', ar: 'العناصر الحرجة' })}
                  </p>
                  <p className="text-xs text-red-700">
                    {criticalStats.completed}/{criticalStats.total} {t({ en: 'completed', ar: 'مكتمل' })}
                  </p>
                </div>
              </div>
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
              placeholder={t({ en: 'System/Hub name (e.g., Challenges, Pilots)', ar: 'اسم النظام (مثل: التحديات، التجارب)' })}
              value={selectedSystem}
              onChange={(e) => setSelectedSystem(e.target.value)}
              className="md:w-72"
            />
          </div>
        </CardContent>
      </Card>

      {/* Category Progress Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {validationCategories.map(cat => {
          const Icon = cat.icon;
          const progress = getCategoryProgress(cat);
          return (
            <Card key={cat.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`h-4 w-4 text-${cat.color}-600`} />
                  <span className="text-xs font-medium truncate">{cat.id.toUpperCase()}</span>
                </div>
                <Progress value={progress} className="h-2 mb-1" />
                <p className="text-xs text-muted-foreground text-right">{progress}%</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Validation Categories */}
      <ScrollArea className="h-[calc(100vh-500px)] min-h-[400px]">
        <div className="space-y-4 pr-4">
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
                                <Badge className={`text-xs shrink-0 ${getPriorityColor(check.priority)}`}>
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
      </ScrollArea>

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
          <div className="p-4 bg-slate-900 rounded-lg overflow-x-auto">
            <p className="text-xs text-slate-400 mb-2">-- 1. {t({ en: 'Check RLS enabled on all tables', ar: 'تحقق من تفعيل RLS على جميع الجداول' })}</p>
            <code className="text-sm text-green-400 font-mono whitespace-pre">
              SELECT tablename, rowsecurity FROM pg_tables{'\n'}WHERE schemaname = 'public' ORDER BY tablename;
            </code>
          </div>
          
          <div className="p-4 bg-slate-900 rounded-lg overflow-x-auto">
            <p className="text-xs text-slate-400 mb-2">-- 2. {t({ en: 'List all policies', ar: 'عرض جميع السياسات' })}</p>
            <code className="text-sm text-green-400 font-mono whitespace-pre">
              SELECT tablename, policyname, cmd, qual FROM pg_policies{'\n'}WHERE schemaname = 'public' ORDER BY tablename;
            </code>
          </div>
          
          <div className="p-4 bg-slate-900 rounded-lg overflow-x-auto">
            <p className="text-xs text-slate-400 mb-2">-- 3. {t({ en: 'Find tables without policies', ar: 'البحث عن الجداول بدون سياسات' })}</p>
            <code className="text-sm text-green-400 font-mono whitespace-pre">
              SELECT t.tablename FROM pg_tables t{'\n'}LEFT JOIN pg_policies p ON t.tablename = p.tablename{'\n'}WHERE t.schemaname = 'public' AND p.policyname IS NULL;
            </code>
          </div>
          
          <div className="p-4 bg-slate-900 rounded-lg overflow-x-auto">
            <p className="text-xs text-slate-400 mb-2">-- 4. {t({ en: 'Check for "Allow all" policies', ar: 'تحقق من سياسات "السماح للجميع"' })}</p>
            <code className="text-sm text-green-400 font-mono whitespace-pre">
              SELECT tablename, policyname FROM pg_policies WHERE qual = 'true';
            </code>
          </div>
          
          <div className="p-4 bg-slate-900 rounded-lg overflow-x-auto">
            <p className="text-xs text-slate-400 mb-2">-- 5. {t({ en: 'Check for public.has_role function', ar: 'تحقق من وجود دالة public.has_role' })}</p>
            <code className="text-sm text-green-400 font-mono whitespace-pre">
              SELECT proname, prosecdef FROM pg_proc{'\n'}WHERE proname LIKE 'has_role%' OR proname LIKE 'has_permission%';
            </code>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}

export default ProtectedPage(SystemValidationChecklist, { requireAdmin: true });
