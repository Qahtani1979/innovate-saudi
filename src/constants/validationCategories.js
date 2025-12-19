// Validation categories for system validation checklist

export const VALIDATION_CATEGORIES = [
  {
    id: 'database',
    name: { en: '1. Database Layer', ar: '1. طبقة قاعدة البيانات' },
    color: 'blue',
    subcategories: [
      {
        id: 'schema',
        name: { en: '1.1 Schema Validation', ar: '1.1 التحقق من المخطط' },
        checks: [
          { id: 'db-1', text: { en: 'All required tables exist', ar: 'جميع الجداول المطلوبة موجودة' }, priority: 'high' },
          { id: 'db-2', text: { en: 'Column types match expected data', ar: 'أنواع الأعمدة تطابق البيانات المتوقعة' }, priority: 'high' },
          { id: 'db-3', text: { en: 'Foreign key relationships are correct', ar: 'علاقات المفاتيح الخارجية صحيحة' }, priority: 'high' },
          { id: 'db-4', text: { en: 'Indexes exist for frequently queried columns', ar: 'الفهارس موجودة للأعمدة المستعلم عنها بشكل متكرر' }, priority: 'medium' },
          { id: 'db-5', text: { en: 'Default values are appropriate', ar: 'القيم الافتراضية مناسبة' }, priority: 'medium' },
          { id: 'db-6', text: { en: 'Nullable columns are intentional', ar: 'الأعمدة القابلة للفراغ مقصودة' }, priority: 'low' }
        ]
      },
      {
        id: 'rls',
        name: { en: '1.2 Row Level Security (RLS)', ar: '1.2 أمان مستوى الصف' },
        checks: [
          { id: 'rls-1', text: { en: 'RLS is ENABLED on all tables', ar: 'RLS مفعّل على جميع الجداول' }, priority: 'critical' },
          { id: 'rls-2', text: { en: 'SELECT policies exist for all user types', ar: 'سياسات SELECT موجودة لجميع أنواع المستخدمين' }, priority: 'critical' },
          { id: 'rls-3', text: { en: 'INSERT policies have WITH CHECK clause', ar: 'سياسات INSERT تحتوي على WITH CHECK' }, priority: 'critical' },
          { id: 'rls-4', text: { en: 'UPDATE policies have both USING and WITH CHECK', ar: 'سياسات UPDATE تحتوي على USING و WITH CHECK' }, priority: 'critical' },
          { id: 'rls-5', text: { en: 'DELETE policies are appropriately restrictive', ar: 'سياسات DELETE مقيدة بشكل مناسب' }, priority: 'high' },
          { id: 'rls-6', text: { en: 'No "Allow all" or overly permissive policies', ar: 'لا توجد سياسات مفرطة' }, priority: 'critical' },
          { id: 'rls-7', text: { en: 'PII tables have strict access control', ar: 'جداول البيانات الشخصية لها تحكم صارم' }, priority: 'critical' },
          { id: 'rls-8', text: { en: 'Owner-based access uses auth.uid()', ar: 'الوصول المبني على المالك يستخدم auth.uid()' }, priority: 'high' },
          { id: 'rls-9', text: { en: 'Admin bypass uses secure function', ar: 'تجاوز المسؤول يستخدم دالة آمنة' }, priority: 'critical' },
          { id: 'rls-10', text: { en: 'Staff policies check role correctly', ar: 'سياسات الموظفين تتحقق من الدور' }, priority: 'high' }
        ]
      },
      {
        id: 'functions',
        name: { en: '1.3 Database Functions & Triggers', ar: '1.3 دوال ومحفزات قاعدة البيانات' },
        checks: [
          { id: 'fn-1', text: { en: 'Functions use SECURITY DEFINER when needed', ar: 'الدوال تستخدم SECURITY DEFINER عند الحاجة' }, priority: 'high' },
          { id: 'fn-2', text: { en: 'Functions have SET search_path = public', ar: 'الدوال تحتوي على SET search_path = public' }, priority: 'high' },
          { id: 'fn-3', text: { en: 'Triggers exist for updated_at columns', ar: 'المحفزات موجودة لأعمدة updated_at' }, priority: 'medium' },
          { id: 'fn-4', text: { en: 'Audit/logging triggers work correctly', ar: 'محفزات التدقيق تعمل بشكل صحيح' }, priority: 'medium' },
          { id: 'fn-5', text: { en: 'No functions expose sensitive data', ar: 'لا توجد دوال تكشف بيانات حساسة' }, priority: 'critical' }
        ]
      }
    ]
  },
  {
    id: 'hooks',
    name: { en: '2. Hooks Layer', ar: '2. طبقة الـ Hooks' },
    color: 'purple',
    subcategories: [
      {
        id: 'query-hooks',
        name: { en: '2.1 Query Hooks', ar: '2.1 Hooks الاستعلام' },
        checks: [
          { id: 'qh-1', text: { en: 'useQuery has proper queryKey with all dependencies', ar: 'useQuery يحتوي على queryKey مناسب' }, priority: 'high' },
          { id: 'qh-2', text: { en: 'enabled condition prevents unnecessary fetches', ar: 'شرط enabled يمنع الجلب غير الضروري' }, priority: 'medium' },
          { id: 'qh-3', text: { en: 'staleTime is set appropriately', ar: 'staleTime مضبوط بشكل مناسب' }, priority: 'medium' },
          { id: 'qh-4', text: { en: 'Error handling exists', ar: 'معالجة الأخطاء موجودة' }, priority: 'high' },
          { id: 'qh-5', text: { en: 'Loading states are handled', ar: 'حالات التحميل يتم التعامل معها' }, priority: 'medium' },
          { id: 'qh-6', text: { en: 'Empty data returns [] not undefined', ar: 'البيانات الفارغة ترجع []' }, priority: 'medium' }
        ]
      },
      {
        id: 'mutation-hooks',
        name: { en: '2.2 Mutation Hooks', ar: '2.2 Hooks التعديل' },
        checks: [
          { id: 'mh-1', text: { en: 'useMutation invalidates related queries', ar: 'useMutation يبطل الاستعلامات المرتبطة' }, priority: 'high' },
          { id: 'mh-2', text: { en: 'Optimistic updates (if applicable)', ar: 'التحديثات المتفائلة' }, priority: 'low' },
          { id: 'mh-3', text: { en: 'Error handling with user feedback', ar: 'معالجة الأخطاء مع إشعار المستخدم' }, priority: 'high' },
          { id: 'mh-4', text: { en: 'Audit logging after mutations', ar: 'تسجيل التدقيق بعد التعديلات' }, priority: 'medium' },
          { id: 'mh-5', text: { en: 'Notification triggers after important actions', ar: 'محفزات الإشعارات بعد الإجراءات المهمة' }, priority: 'medium' }
        ]
      },
      {
        id: 'visibility-hooks',
        name: { en: '2.3 Visibility Hooks', ar: '2.3 Hooks الرؤية' },
        checks: [
          { id: 'vh-1', text: { en: 'Admin sees all data', ar: 'المسؤول يرى جميع البيانات' }, priority: 'high' },
          { id: 'vh-2', text: { en: 'Staff sees appropriate subset', ar: 'الموظف يرى المجموعة المناسبة' }, priority: 'high' },
          { id: 'vh-3', text: { en: 'Public users see only published items', ar: 'المستخدمون العامون يرون العناصر المنشورة فقط' }, priority: 'high' },
          { id: 'vh-4', text: { en: 'Visibility loading state prevents premature queries', ar: 'حالة تحميل الرؤية تمنع الاستعلامات المبكرة' }, priority: 'medium' },
          { id: 'vh-5', text: { en: 'National vs Geographic visibility logic correct', ar: 'منطق الرؤية الوطنية مقابل الجغرافية صحيح' }, priority: 'high' }
        ]
      }
    ]
  },
  {
    id: 'components',
    name: { en: '3. Components Layer', ar: '3. طبقة المكونات' },
    color: 'green',
    subcategories: [
      {
        id: 'page-components',
        name: { en: '3.1 Page Components', ar: '3.1 مكونات الصفحة' },
        checks: [
          { id: 'pc-1', text: { en: 'Protected with ProtectedPage HOC', ar: 'محمية بـ ProtectedPage HOC' }, priority: 'critical' },
          { id: 'pc-2', text: { en: 'Required permissions specified', ar: 'الصلاحيات المطلوبة محددة' }, priority: 'high' },
          { id: 'pc-3', text: { en: 'Required roles specified', ar: 'الأدوار المطلوبة محددة' }, priority: 'high' },
          { id: 'pc-4', text: { en: 'Loading skeleton shown during fetch', ar: 'هيكل التحميل يظهر أثناء الجلب' }, priority: 'medium' },
          { id: 'pc-5', text: { en: 'Empty state handled gracefully', ar: 'الحالة الفارغة يتم التعامل معها' }, priority: 'medium' },
          { id: 'pc-6', text: { en: 'Error boundary exists', ar: 'حدود الخطأ موجودة' }, priority: 'medium' }
        ]
      },
      {
        id: 'form-components',
        name: { en: '3.2 Form Components', ar: '3.2 مكونات النموذج' },
        checks: [
          { id: 'fc-1', text: { en: 'Input validation (Zod schema)', ar: 'التحقق من المدخلات' }, priority: 'high' },
          { id: 'fc-2', text: { en: 'Required fields marked', ar: 'الحقول المطلوبة معلّمة' }, priority: 'medium' },
          { id: 'fc-3', text: { en: 'Max length limits enforced', ar: 'حدود الطول القصوى مفروضة' }, priority: 'medium' },
          { id: 'fc-4', text: { en: 'Proper error messages', ar: 'رسائل خطأ مناسبة' }, priority: 'medium' },
          { id: 'fc-5', text: { en: 'Submit button disabled during loading', ar: 'زر الإرسال معطل أثناء التحميل' }, priority: 'medium' },
          { id: 'fc-6', text: { en: 'Form reset after successful submission', ar: 'إعادة تعيين النموذج بعد الإرسال' }, priority: 'low' }
        ]
      },
      {
        id: 'list-components',
        name: { en: '3.3 List/Table Components', ar: '3.3 مكونات الجدول' },
        checks: [
          { id: 'lc-1', text: { en: 'Pagination or infinite scroll', ar: 'ترقيم الصفحات' }, priority: 'medium' },
          { id: 'lc-2', text: { en: 'Search/filter functionality works', ar: 'وظيفة البحث/الفلترة تعمل' }, priority: 'medium' },
          { id: 'lc-3', text: { en: 'Sort functionality works', ar: 'وظيفة الفرز تعمل' }, priority: 'low' },
          { id: 'lc-4', text: { en: 'Actions have permission checks', ar: 'الإجراءات لها فحوصات صلاحيات' }, priority: 'high' },
          { id: 'lc-5', text: { en: 'Confirmation dialogs for destructive actions', ar: 'نوافذ تأكيد للإجراءات المدمرة' }, priority: 'high' }
        ]
      },
      {
        id: 'detail-components',
        name: { en: '3.4 Detail Components', ar: '3.4 مكونات التفاصيل' },
        checks: [
          { id: 'dc-1', text: { en: '404 handling for invalid IDs', ar: 'معالجة 404 للمعرفات غير الصالحة' }, priority: 'medium' },
          { id: 'dc-2', text: { en: 'Access denied for unauthorized users', ar: 'رفض الوصول للمستخدمين غير المصرح لهم' }, priority: 'high' },
          { id: 'dc-3', text: { en: 'Edit/delete buttons respect permissions', ar: 'أزرار التعديل/الحذف تحترم الصلاحيات' }, priority: 'high' },
          { id: 'dc-4', text: { en: 'Related data loaded efficiently', ar: 'البيانات المرتبطة يتم تحميلها بكفاءة' }, priority: 'medium' }
        ]
      }
    ]
  },
  {
    id: 'api',
    name: { en: '4. API/Edge Functions', ar: '4. طبقة API' },
    color: 'orange',
    subcategories: [
      {
        id: 'api-security',
        name: { en: '4.1 Security', ar: '4.1 الأمان' },
        checks: [
          { id: 'api-1', text: { en: 'Authentication required (JWT validation)', ar: 'المصادقة مطلوبة' }, priority: 'critical' },
          { id: 'api-2', text: { en: 'Authorization checked', ar: 'التفويض يتم فحصه' }, priority: 'critical' },
          { id: 'api-3', text: { en: 'Rate limiting implemented', ar: 'تحديد المعدل مطبق' }, priority: 'high' },
          { id: 'api-4', text: { en: 'Input validation before processing', ar: 'التحقق من المدخلات قبل المعالجة' }, priority: 'critical' },
          { id: 'api-5', text: { en: 'Secrets not exposed in responses', ar: 'الأسرار غير مكشوفة في الردود' }, priority: 'critical' },
          { id: 'api-6', text: { en: 'CORS configured correctly', ar: 'CORS مكوّن بشكل صحيح' }, priority: 'high' }
        ]
      },
      {
        id: 'api-errors',
        name: { en: '4.2 Error Handling', ar: '4.2 معالجة الأخطاء' },
        checks: [
          { id: 'api-7', text: { en: 'Proper HTTP status codes', ar: 'رموز حالة HTTP مناسبة' }, priority: 'high' },
          { id: 'api-8', text: { en: 'Error messages don\'t leak sensitive info', ar: 'رسائل الخطأ لا تسرب معلومات حساسة' }, priority: 'critical' },
          { id: 'api-9', text: { en: 'Errors logged for debugging', ar: 'الأخطاء مسجلة للتصحيح' }, priority: 'medium' },
          { id: 'api-10', text: { en: 'Graceful degradation', ar: 'التدهور اللطيف' }, priority: 'medium' }
        ]
      },
      {
        id: 'api-performance',
        name: { en: '4.3 Performance', ar: '4.3 الأداء' },
        checks: [
          { id: 'api-11', text: { en: 'Response times acceptable', ar: 'أوقات الاستجابة مقبولة' }, priority: 'medium' },
          { id: 'api-12', text: { en: 'Large payloads paginated', ar: 'الحمولات الكبيرة مقسمة' }, priority: 'medium' },
          { id: 'api-13', text: { en: 'Caching where appropriate', ar: 'التخزين المؤقت حيثما مناسب' }, priority: 'low' },
          { id: 'api-14', text: { en: 'Database queries optimized', ar: 'استعلامات قاعدة البيانات محسنة' }, priority: 'medium' }
        ]
      }
    ]
  },
  {
    id: 'permissions',
    name: { en: '5. Permissions Layer', ar: '5. طبقة الصلاحيات' },
    color: 'red',
    subcategories: [
      {
        id: 'rbac',
        name: { en: '5.1 Role-Based Access Control', ar: '5.1 التحكم في الوصول المبني على الأدوار' },
        checks: [
          { id: 'rbac-1', text: { en: 'Roles stored in separate roles table', ar: 'الأدوار مخزنة في جدول منفصل' }, priority: 'critical' },
          { id: 'rbac-2', text: { en: 'User-role mapping in user_roles table', ar: 'ربط المستخدم-الدور في جدول user_roles' }, priority: 'critical' },
          { id: 'rbac-3', text: { en: 'Permissions stored in permissions table', ar: 'الصلاحيات مخزنة في جدول permissions' }, priority: 'high' },
          { id: 'rbac-4', text: { en: 'Role-permission mapping in role_permissions', ar: 'ربط الدور-الصلاحية في role_permissions' }, priority: 'high' },
          { id: 'rbac-5', text: { en: 'usePermissions hook returns correct data', ar: 'hook usePermissions يرجع بيانات صحيحة' }, priority: 'high' },
          { id: 'rbac-6', text: { en: 'hasRole() function works correctly', ar: 'دالة hasRole() تعمل بشكل صحيح' }, priority: 'high' },
          { id: 'rbac-7', text: { en: 'hasPermission() function works correctly', ar: 'دالة hasPermission() تعمل بشكل صحيح' }, priority: 'high' }
        ]
      },
      {
        id: 'perm-checks',
        name: { en: '5.2 Permission Checks', ar: '5.2 فحوصات الصلاحيات' },
        checks: [
          { id: 'perm-1', text: { en: 'UI elements hidden for unauthorized users', ar: 'عناصر الواجهة مخفية للمستخدمين غير المصرح لهم' }, priority: 'high' },
          { id: 'perm-2', text: { en: 'API endpoints verify permissions server-side', ar: 'نقاط API تتحقق من الصلاحيات على الخادم' }, priority: 'critical' },
          { id: 'perm-3', text: { en: 'RLS policies use consistent permission logic', ar: 'سياسات RLS تستخدم منطق صلاحيات متسق' }, priority: 'high' },
          { id: 'perm-4', text: { en: 'No client-side only permission checks', ar: 'لا توجد فحوصات صلاحيات على العميل فقط' }, priority: 'critical' }
        ]
      }
    ]
  },
  {
    id: 'workflow',
    name: { en: '6. Workflow Layer', ar: '6. طبقة سير العمل' },
    color: 'amber',
    subcategories: [
      {
        id: 'status-transitions',
        name: { en: '6.1 Status Transitions', ar: '6.1 انتقالات الحالة' },
        checks: [
          { id: 'wf-1', text: { en: 'Valid status values defined', ar: 'قيم الحالة الصالحة محددة' }, priority: 'high' },
          { id: 'wf-2', text: { en: 'Transition rules enforced', ar: 'قواعد الانتقال مفروضة' }, priority: 'high' },
          { id: 'wf-3', text: { en: 'Status changes trigger appropriate actions', ar: 'تغييرات الحالة تحفز الإجراءات المناسبة' }, priority: 'medium' },
          { id: 'wf-4', text: { en: 'Rollback/rejection paths work', ar: 'مسارات التراجع/الرفض تعمل' }, priority: 'medium' },
          { id: 'wf-5', text: { en: 'Status history tracked', ar: 'سجل الحالة يتم تتبعه' }, priority: 'medium' }
        ]
      },
      {
        id: 'approval-workflows',
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
    color: 'indigo',
    subcategories: [
      {
        id: 'email-notifications',
        name: { en: '7.1 Email Notifications', ar: '7.1 إشعارات البريد الإلكتروني' },
        checks: [
          { id: 'email-1', text: { en: 'Templates exist for all trigger events', ar: 'القوالب موجودة لجميع الأحداث' }, priority: 'medium' },
          { id: 'email-2', text: { en: 'Variables interpolated correctly', ar: 'المتغيرات مستبدلة بشكل صحيح' }, priority: 'medium' },
          { id: 'email-3', text: { en: 'Unsubscribe option works', ar: 'خيار إلغاء الاشتراك يعمل' }, priority: 'medium' },
          { id: 'email-4', text: { en: 'Email logs captured', ar: 'سجلات البريد الإلكتروني مسجلة' }, priority: 'medium' },
          { id: 'email-5', text: { en: 'Bounce handling', ar: 'معالجة الرسائل المرتدة' }, priority: 'low' }
        ]
      },
      {
        id: 'in-app-notifications',
        name: { en: '7.2 In-App Notifications', ar: '7.2 الإشعارات داخل التطبيق' },
        checks: [
          { id: 'notif-1', text: { en: 'Notifications created on key events', ar: 'الإشعارات تُنشأ عند الأحداث الرئيسية' }, priority: 'medium' },
          { id: 'notif-2', text: { en: 'Read/unread status tracked', ar: 'حالة القراءة/عدم القراءة يتم تتبعها' }, priority: 'medium' },
          { id: 'notif-3', text: { en: 'Mark all as read works', ar: 'تحديد الكل كمقروء يعمل' }, priority: 'low' },
          { id: 'notif-4', text: { en: 'Real-time updates', ar: 'التحديثات الفورية' }, priority: 'low' }
        ]
      }
    ]
  },
  {
    id: 'audit',
    name: { en: '8. Audit & Logging', ar: '8. طبقة التدقيق' },
    color: 'slate',
    subcategories: [
      {
        id: 'audit-logging',
        name: { en: '8.1 Audit Logging', ar: '8.1 تسجيل التدقيق' },
        checks: [
          { id: 'audit-1', text: { en: 'Create actions logged', ar: 'إجراءات الإنشاء مسجلة' }, priority: 'high' },
          { id: 'audit-2', text: { en: 'Update actions logged with changed fields', ar: 'إجراءات التحديث مسجلة مع الحقول المتغيرة' }, priority: 'high' },
          { id: 'audit-3', text: { en: 'Delete actions logged', ar: 'إجراءات الحذف مسجلة' }, priority: 'high' },
          { id: 'audit-4', text: { en: 'Status changes logged', ar: 'تغييرات الحالة مسجلة' }, priority: 'medium' },
          { id: 'audit-5', text: { en: 'Login/logout logged', ar: 'تسجيل الدخول/الخروج مسجل' }, priority: 'high' },
          { id: 'audit-6', text: { en: 'Sensitive actions logged', ar: 'الإجراءات الحساسة مسجلة' }, priority: 'high' },
          { id: 'audit-7', text: { en: 'Logs include user, timestamp, entity info', ar: 'السجلات تتضمن المستخدم والوقت ومعلومات الكيان' }, priority: 'medium' },
          { id: 'audit-8', text: { en: 'Failed login attempts logged', ar: 'محاولات تسجيل الدخول الفاشلة مسجلة' }, priority: 'high' },
          { id: 'audit-9', text: { en: 'Permission/role changes logged', ar: 'تغييرات الصلاحيات/الأدوار مسجلة' }, priority: 'critical' },
          { id: 'audit-10', text: { en: 'Bulk operations logged', ar: 'العمليات الجماعية مسجلة' }, priority: 'high' },
          { id: 'audit-11', text: { en: 'Data exports logged', ar: 'تصدير البيانات مسجل' }, priority: 'high' },
          { id: 'audit-12', text: { en: 'IP address captured', ar: 'عنوان IP مسجل' }, priority: 'medium' },
          { id: 'audit-13', text: { en: 'Audit logs immutable (cannot be deleted)', ar: 'سجلات التدقيق غير قابلة للتغيير' }, priority: 'critical' },
          { id: 'audit-14', text: { en: 'Audit log retention policy defined', ar: 'سياسة الاحتفاظ بسجلات التدقيق محددة' }, priority: 'medium' },
          { id: 'audit-15', text: { en: 'Admin actions separately tracked', ar: 'إجراءات المسؤول يتم تتبعها بشكل منفصل' }, priority: 'high' }
        ]
      }
    ]
  },
  {
    id: 'uiux',
    name: { en: '9. UI/UX Layer', ar: '9. طبقة واجهة المستخدم' },
    color: 'teal',
    subcategories: [
      {
        id: 'accessibility',
        name: { en: '9.1 Accessibility', ar: '9.1 إمكانية الوصول' },
        checks: [
          { id: 'a11y-1', text: { en: 'Proper heading hierarchy', ar: 'تسلسل العناوين الصحيح' }, priority: 'medium' },
          { id: 'a11y-2', text: { en: 'Alt text on images', ar: 'نص بديل على الصور' }, priority: 'medium' },
          { id: 'a11y-3', text: { en: 'Keyboard navigation works', ar: 'التنقل بلوحة المفاتيح يعمل' }, priority: 'medium' },
          { id: 'a11y-4', text: { en: 'Focus indicators visible', ar: 'مؤشرات التركيز مرئية' }, priority: 'medium' },
          { id: 'a11y-5', text: { en: 'Color contrast sufficient', ar: 'تباين الألوان كافي' }, priority: 'medium' }
        ]
      },
      {
        id: 'responsiveness',
        name: { en: '9.2 Responsiveness', ar: '9.2 الاستجابة' },
        checks: [
          { id: 'resp-1', text: { en: 'Mobile layout works', ar: 'تخطيط الجوال يعمل' }, priority: 'high' },
          { id: 'resp-2', text: { en: 'Tablet layout works', ar: 'تخطيط التابلت يعمل' }, priority: 'medium' },
          { id: 'resp-3', text: { en: 'Desktop layout works', ar: 'تخطيط سطح المكتب يعمل' }, priority: 'high' },
          { id: 'resp-4', text: { en: 'Touch targets adequate size', ar: 'أهداف اللمس بحجم مناسب' }, priority: 'medium' }
        ]
      },
      {
        id: 'i18n',
        name: { en: '9.3 Internationalization', ar: '9.3 التدويل' },
        checks: [
          { id: 'i18n-1', text: { en: 'All strings use t() function', ar: 'جميع النصوص تستخدم دالة t()' }, priority: 'high' },
          { id: 'i18n-2', text: { en: 'RTL layout works', ar: 'تخطيط RTL يعمل' }, priority: 'high' },
          { id: 'i18n-3', text: { en: 'Date/number formatting localized', ar: 'تنسيق التاريخ/الأرقام محلي' }, priority: 'medium' },
          { id: 'i18n-4', text: { en: 'Pluralization handled', ar: 'الجمع يتم التعامل معه' }, priority: 'low' }
        ]
      }
    ]
  },
  {
    id: 'integration',
    name: { en: '10. Integration Layer', ar: '10. طبقة التكامل' },
    color: 'cyan',
    subcategories: [
      {
        id: 'external-apis',
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
        id: 'file-storage',
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
    name: { en: '11. Documentation', ar: '11. طبقة التوثيق' },
    color: 'violet',
    subcategories: [
      {
        id: 'docs',
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
    color: 'rose',
    subcategories: [
      {
        id: 'security-practices',
        name: { en: '12.1 Security Best Practices', ar: '12.1 أفضل ممارسات الأمان' },
        checks: [
          { id: 'sec-1', text: { en: 'No hardcoded credentials', ar: 'لا توجد بيانات اعتماد مضمنة' }, priority: 'critical' },
          { id: 'sec-2', text: { en: 'No secrets in client code', ar: 'لا توجد أسرار في كود العميل' }, priority: 'critical' },
          { id: 'sec-3', text: { en: 'SQL injection prevented', ar: 'حقن SQL ممنوع' }, priority: 'critical' },
          { id: 'sec-4', text: { en: 'XSS prevented', ar: 'XSS ممنوع' }, priority: 'critical' },
          { id: 'sec-5', text: { en: 'CSRF protection enabled', ar: 'حماية CSRF مفعلة' }, priority: 'high' },
          { id: 'sec-6', text: { en: 'Sensitive data encrypted', ar: 'البيانات الحساسة مشفرة' }, priority: 'high' },
          { id: 'sec-7', text: { en: 'Password policies enforced', ar: 'سياسات كلمة المرور مفروضة' }, priority: 'high' },
          { id: 'sec-8', text: { en: 'Session timeout configured', ar: 'انتهاء الجلسة مكوّن' }, priority: 'medium' },
          { id: 'sec-9', text: { en: 'Rate limiting on auth endpoints', ar: 'تحديد المعدل على نقاط المصادقة' }, priority: 'high' }
        ]
      }
    ]
  },
  {
    id: 'pages',
    name: { en: '13. Pages & Hubs', ar: '13. الصفحات والمحاور' },
    color: 'emerald',
    subcategories: [
      {
        id: 'hub-pages',
        name: { en: '13.1 Hub Pages', ar: '13.1 صفحات المحور' },
        checks: [
          { id: 'hub-1', text: { en: 'Hub landing page exists', ar: 'صفحة المحور الرئيسية موجودة' }, priority: 'high' },
          { id: 'hub-2', text: { en: 'Hub has consistent card layout', ar: 'المحور له تخطيط بطاقات متسق' }, priority: 'medium' },
          { id: 'hub-3', text: { en: 'Hub has working search/filter', ar: 'المحور له بحث/فلتر يعمل' }, priority: 'medium' },
          { id: 'hub-4', text: { en: 'Hub has create action button', ar: 'المحور له زر إنشاء' }, priority: 'medium' },
          { id: 'hub-5', text: { en: 'Hub stats/summary section exists', ar: 'قسم الإحصائيات موجود' }, priority: 'low' },
          { id: 'hub-6', text: { en: 'Hub has proper empty state', ar: 'المحور له حالة فارغة مناسبة' }, priority: 'medium' }
        ]
      },
      {
        id: 'single-pages',
        name: { en: '13.2 Single/Detail Pages', ar: '13.2 الصفحات الفردية' },
        checks: [
          { id: 'single-1', text: { en: 'Detail page exists for entity', ar: 'صفحة التفاصيل موجودة' }, priority: 'high' },
          { id: 'single-2', text: { en: 'Detail page shows all relevant fields', ar: 'صفحة التفاصيل تعرض جميع الحقول' }, priority: 'medium' },
          { id: 'single-3', text: { en: 'Detail page has edit/delete actions', ar: 'صفحة التفاصيل لها إجراءات تحرير/حذف' }, priority: 'high' },
          { id: 'single-4', text: { en: 'Detail page shows related entities', ar: 'صفحة التفاصيل تعرض الكيانات المرتبطة' }, priority: 'medium' },
          { id: 'single-5', text: { en: 'Detail page has breadcrumb navigation', ar: 'صفحة التفاصيل لها مسار التنقل' }, priority: 'low' },
          { id: 'single-6', text: { en: 'Detail page handles 404 gracefully', ar: 'صفحة التفاصيل تعالج 404 بشكل مناسب' }, priority: 'medium' }
        ]
      },
      {
        id: 'create-edit-pages',
        name: { en: '13.3 Create/Edit Pages', ar: '13.3 صفحات الإنشاء/التعديل' },
        checks: [
          { id: 'form-page-1', text: { en: 'Create form page exists', ar: 'صفحة نموذج الإنشاء موجودة' }, priority: 'high' },
          { id: 'form-page-2', text: { en: 'Edit form page exists', ar: 'صفحة نموذج التعديل موجودة' }, priority: 'high' },
          { id: 'form-page-3', text: { en: 'Form has proper validation', ar: 'النموذج له تحقق مناسب' }, priority: 'high' },
          { id: 'form-page-4', text: { en: 'Form pre-fills data on edit', ar: 'النموذج يملأ البيانات عند التعديل' }, priority: 'medium' },
          { id: 'form-page-5', text: { en: 'Form shows success/error feedback', ar: 'النموذج يعرض رسائل النجاح/الخطأ' }, priority: 'medium' },
          { id: 'form-page-6', text: { en: 'Form has cancel/back navigation', ar: 'النموذج له إلغاء/رجوع' }, priority: 'low' }
        ]
      }
    ]
  },
  {
    id: 'navigation',
    name: { en: '14. Navigation & Routing', ar: '14. التنقل والتوجيه' },
    color: 'sky',
    subcategories: [
      {
        id: 'menu-links',
        name: { en: '14.1 Menu & Links', ar: '14.1 القوائم والروابط' },
        checks: [
          { id: 'nav-1', text: { en: 'System appears in sidebar menu', ar: 'النظام يظهر في القائمة الجانبية' }, priority: 'high' },
          { id: 'nav-2', text: { en: 'Menu item has correct icon', ar: 'عنصر القائمة له أيقونة صحيحة' }, priority: 'low' },
          { id: 'nav-3', text: { en: 'Menu respects user permissions', ar: 'القائمة تحترم صلاحيات المستخدم' }, priority: 'critical' },
          { id: 'nav-4', text: { en: 'Sub-menu items work correctly', ar: 'عناصر القائمة الفرعية تعمل' }, priority: 'medium' },
          { id: 'nav-5', text: { en: 'Active menu state highlighted', ar: 'حالة القائمة النشطة مميزة' }, priority: 'low' },
          { id: 'nav-6', text: { en: 'Menu collapses properly on mobile', ar: 'القائمة تطوى على الجوال' }, priority: 'medium' }
        ]
      },
      {
        id: 'routing',
        name: { en: '14.2 Routes & URLs', ar: '14.2 المسارات والروابط' },
        checks: [
          { id: 'route-1', text: { en: 'Routes follow naming convention', ar: 'المسارات تتبع اتفاقية التسمية' }, priority: 'medium' },
          { id: 'route-2', text: { en: 'Routes have proper guards', ar: 'المسارات لها حراسة مناسبة' }, priority: 'critical' },
          { id: 'route-3', text: { en: 'Deep links work correctly', ar: 'الروابط العميقة تعمل' }, priority: 'medium' },
          { id: 'route-4', text: { en: 'Route params validated', ar: 'معاملات المسار محققة' }, priority: 'high' },
          { id: 'route-5', text: { en: 'Unauthorized redirects to login', ar: 'غير المصرح يُعاد توجيهه' }, priority: 'high' },
          { id: 'route-6', text: { en: 'Not found shows 404 page', ar: 'غير موجود يعرض صفحة 404' }, priority: 'medium' }
        ]
      },
      {
        id: 'breadcrumbs',
        name: { en: '14.3 Breadcrumbs & Back', ar: '14.3 مسار التنقل والرجوع' },
        checks: [
          { id: 'bread-1', text: { en: 'Breadcrumbs show correct path', ar: 'مسار التنقل يعرض المسار الصحيح' }, priority: 'low' },
          { id: 'bread-2', text: { en: 'Breadcrumb links are clickable', ar: 'روابط مسار التنقل قابلة للنقر' }, priority: 'low' },
          { id: 'bread-3', text: { en: 'Back button works correctly', ar: 'زر الرجوع يعمل' }, priority: 'medium' },
          { id: 'bread-4', text: { en: 'Browser back/forward works', ar: 'رجوع/تقدم المتصفح يعمل' }, priority: 'medium' }
        ]
      }
    ]
  },
  {
    id: 'roles',
    name: { en: '15. Roles & Access', ar: '15. الأدوار والوصول' },
    color: 'pink',
    subcategories: [
      {
        id: 'role-assignments',
        name: { en: '15.1 Role Assignments', ar: '15.1 تعيينات الأدوار' },
        checks: [
          { id: 'role-1', text: { en: 'System has defined roles', ar: 'النظام له أدوار محددة' }, priority: 'high' },
          { id: 'role-2', text: { en: 'Admin role has full access', ar: 'دور المسؤول له وصول كامل' }, priority: 'high' },
          { id: 'role-3', text: { en: 'Staff role has appropriate access', ar: 'دور الموظف له وصول مناسب' }, priority: 'high' },
          { id: 'role-4', text: { en: 'Public/viewer role is restricted', ar: 'دور العارض مقيد' }, priority: 'high' },
          { id: 'role-5', text: { en: 'Role hierarchy is correct', ar: 'تسلسل الأدوار صحيح' }, priority: 'medium' },
          { id: 'role-6', text: { en: 'Role assignment UI works', ar: 'واجهة تعيين الأدوار تعمل' }, priority: 'medium' }
        ]
      },
      {
        id: 'role-visibility',
        name: { en: '15.2 Role-Based Visibility', ar: '15.2 الرؤية المبنية على الدور' },
        checks: [
          { id: 'vis-1', text: { en: 'Admin sees all records', ar: 'المسؤول يرى جميع السجلات' }, priority: 'high' },
          { id: 'vis-2', text: { en: 'Staff sees scoped records', ar: 'الموظف يرى السجلات المحددة' }, priority: 'high' },
          { id: 'vis-3', text: { en: 'Owner sees own records', ar: 'المالك يرى سجلاته' }, priority: 'high' },
          { id: 'vis-4', text: { en: 'Public sees published only', ar: 'العام يرى المنشور فقط' }, priority: 'high' },
          { id: 'vis-5', text: { en: 'PII hidden from unauthorized', ar: 'البيانات الشخصية مخفية' }, priority: 'critical' },
          { id: 'vis-6', text: { en: 'Sensitive fields masked', ar: 'الحقول الحساسة مقنعة' }, priority: 'high' }
        ]
      },
      {
        id: 'role-actions',
        name: { en: '15.3 Role-Based Actions', ar: '15.3 الإجراءات المبنية على الدور' },
        checks: [
          { id: 'act-1', text: { en: 'Create action respects role', ar: 'إجراء الإنشاء يحترم الدور' }, priority: 'high' },
          { id: 'act-2', text: { en: 'Edit action respects role', ar: 'إجراء التعديل يحترم الدور' }, priority: 'high' },
          { id: 'act-3', text: { en: 'Delete action respects role', ar: 'إجراء الحذف يحترم الدور' }, priority: 'high' },
          { id: 'act-4', text: { en: 'Approve action respects role', ar: 'إجراء الموافقة يحترم الدور' }, priority: 'high' },
          { id: 'act-5', text: { en: 'Export action respects role', ar: 'إجراء التصدير يحترم الدور' }, priority: 'medium' },
          { id: 'act-6', text: { en: 'Bulk actions respect role', ar: 'الإجراءات الجماعية تحترم الدور' }, priority: 'medium' }
        ]
      }
    ]
  },
  {
    id: 'design',
    name: { en: '16. UI Design & Layout', ar: '16. التصميم والتخطيط' },
    color: 'fuchsia',
    subcategories: [
      {
        id: 'design-system',
        name: { en: '16.1 Design System', ar: '16.1 نظام التصميم' },
        checks: [
          { id: 'ds-1', text: { en: 'Uses design system tokens', ar: 'يستخدم رموز نظام التصميم' }, priority: 'high' },
          { id: 'ds-2', text: { en: 'Colors from theme variables', ar: 'الألوان من متغيرات الثيم' }, priority: 'high' },
          { id: 'ds-3', text: { en: 'Typography consistent', ar: 'الخط متسق' }, priority: 'medium' },
          { id: 'ds-4', text: { en: 'Spacing follows system', ar: 'التباعد يتبع النظام' }, priority: 'medium' },
          { id: 'ds-5', text: { en: 'Icons from icon library', ar: 'الأيقونات من المكتبة' }, priority: 'low' },
          { id: 'ds-6', text: { en: 'Shadows/borders consistent', ar: 'الظلال/الحدود متسقة' }, priority: 'low' }
        ]
      },
      {
        id: 'layout-consistency',
        name: { en: '16.2 Layout Consistency', ar: '16.2 اتساق التخطيط' },
        checks: [
          { id: 'lay-1', text: { en: 'Page header consistent', ar: 'عنوان الصفحة متسق' }, priority: 'medium' },
          { id: 'lay-2', text: { en: 'Card layouts consistent', ar: 'تخطيطات البطاقات متسقة' }, priority: 'medium' },
          { id: 'lay-3', text: { en: 'Form layouts consistent', ar: 'تخطيطات النماذج متسقة' }, priority: 'medium' },
          { id: 'lay-4', text: { en: 'Table layouts consistent', ar: 'تخطيطات الجداول متسقة' }, priority: 'medium' },
          { id: 'lay-5', text: { en: 'Modal/dialog layouts consistent', ar: 'تخطيطات النوافذ متسقة' }, priority: 'medium' },
          { id: 'lay-6', text: { en: 'Empty states consistent', ar: 'الحالات الفارغة متسقة' }, priority: 'low' }
        ]
      },
      {
        id: 'visual-polish',
        name: { en: '16.3 Visual Polish', ar: '16.3 التلميع البصري' },
        checks: [
          { id: 'polish-1', text: { en: 'Loading states styled', ar: 'حالات التحميل مصممة' }, priority: 'medium' },
          { id: 'polish-2', text: { en: 'Error states styled', ar: 'حالات الخطأ مصممة' }, priority: 'medium' },
          { id: 'polish-3', text: { en: 'Success states styled', ar: 'حالات النجاح مصممة' }, priority: 'low' },
          { id: 'polish-4', text: { en: 'Animations smooth', ar: 'الحركات سلسة' }, priority: 'low' },
          { id: 'polish-5', text: { en: 'Hover states work', ar: 'حالات التمرير تعمل' }, priority: 'low' },
          { id: 'polish-6', text: { en: 'Dark mode supported', ar: 'الوضع الداكن مدعوم' }, priority: 'medium' }
        ]
      }
    ]
  }
];

// Helper to get all checks from categories
export function getAllChecks() {
  const checks = [];
  VALIDATION_CATEGORIES.forEach(category => {
    category.subcategories.forEach(subcat => {
      subcat.checks.forEach(check => {
        checks.push({
          ...check,
          categoryId: category.id,
          subcategoryId: subcat.id
        });
      });
    });
  });
  return checks;
}

// Helper to count checks by priority
export function countChecksByPriority(categories = VALIDATION_CATEGORIES) {
  const counts = { critical: 0, high: 0, medium: 0, low: 0, total: 0 };
  categories.forEach(category => {
    category.subcategories.forEach(subcat => {
      subcat.checks.forEach(check => {
        counts[check.priority] = (counts[check.priority] || 0) + 1;
        counts.total++;
      });
    });
  });
  return counts;
}
