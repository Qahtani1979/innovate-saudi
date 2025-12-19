// Validation categories for system validation checklist
// 22 categories with 300+ checks for comprehensive platform validation

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
      },
      {
        id: 'hook-composition',
        name: { en: '2.4 Hook Composition & Dependencies', ar: '2.4 تكوين الـ Hooks' },
        checks: [
          { id: 'hc-1', text: { en: 'Hooks follow single responsibility principle', ar: 'الـ Hooks تتبع مبدأ المسؤولية الواحدة' }, priority: 'medium' },
          { id: 'hc-2', text: { en: 'Hook dependencies are correctly specified', ar: 'تبعيات الـ Hooks محددة بشكل صحيح' }, priority: 'high' },
          { id: 'hc-3', text: { en: 'Hooks have proper cleanup on unmount', ar: 'الـ Hooks لها تنظيف عند الإزالة' }, priority: 'medium' },
          { id: 'hc-4', text: { en: 'Hooks are reusable across components', ar: 'الـ Hooks قابلة لإعادة الاستخدام' }, priority: 'low' },
          { id: 'hc-5', text: { en: 'Hooks handle race conditions', ar: 'الـ Hooks تعالج حالات السباق' }, priority: 'medium' },
          { id: 'hc-6', text: { en: 'Hooks use proper memoization', ar: 'الـ Hooks تستخدم التخزين المؤقت المناسب' }, priority: 'medium' }
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
          { id: 'email-5', text: { en: 'Bounce handling configured', ar: 'معالجة الرسائل المرتدة مكونة' }, priority: 'low' }
        ]
      },
      {
        id: 'in-app-notifications',
        name: { en: '7.2 In-App Notifications', ar: '7.2 الإشعارات داخل التطبيق' },
        checks: [
          { id: 'notif-1', text: { en: 'Notifications created on key events', ar: 'الإشعارات تُنشأ عند الأحداث الرئيسية' }, priority: 'medium' },
          { id: 'notif-2', text: { en: 'Read/unread status tracked', ar: 'حالة القراءة/عدم القراءة يتم تتبعها' }, priority: 'medium' },
          { id: 'notif-3', text: { en: 'Mark all as read works', ar: 'تحديد الكل كمقروء يعمل' }, priority: 'low' },
          { id: 'notif-4', text: { en: 'Real-time updates via WebSocket', ar: 'التحديثات الفورية عبر WebSocket' }, priority: 'low' }
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
        name: { en: '11.1 Documentation Files', ar: '11.1 ملفات التوثيق' },
        checks: [
          { id: 'doc-1', text: { en: 'README.md exists with overview', ar: 'README.md موجود مع نظرة عامة' }, priority: 'medium' },
          { id: 'doc-2', text: { en: 'API.md documents hooks and functions', ar: 'API.md يوثق الـ hooks والدوال' }, priority: 'medium' },
          { id: 'doc-3', text: { en: 'COMPONENTS.md lists all components', ar: 'COMPONENTS.md يسرد جميع المكونات' }, priority: 'low' },
          { id: 'doc-4', text: { en: 'SCHEMA.md documents database tables', ar: 'SCHEMA.md يوثق جداول قاعدة البيانات' }, priority: 'medium' },
          { id: 'doc-5', text: { en: 'WORKFLOWS.md has Mermaid diagrams', ar: 'WORKFLOWS.md لديه مخططات Mermaid' }, priority: 'low' },
          { id: 'doc-6', text: { en: 'PERMISSIONS.md documents role matrix', ar: 'PERMISSIONS.md يوثق مصفوفة الأدوار' }, priority: 'medium' }
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
          { id: 'role-6', text: { en: 'Role requests workflow works', ar: 'سير عمل طلبات الأدوار يعمل' }, priority: 'medium' }
        ]
      },
      {
        id: 'role-visibility',
        name: { en: '15.2 Role Visibility', ar: '15.2 رؤية الأدوار' },
        checks: [
          { id: 'vis-1', text: { en: 'UI adapts to user role', ar: 'الواجهة تتكيف مع دور المستخدم' }, priority: 'high' },
          { id: 'vis-2', text: { en: 'Actions hidden for non-permitted roles', ar: 'الإجراءات مخفية للأدوار غير المسموحة' }, priority: 'high' },
          { id: 'vis-3', text: { en: 'Data filtered by role scope', ar: 'البيانات مفلترة حسب نطاق الدور' }, priority: 'high' },
          { id: 'vis-4', text: { en: 'Menu items filtered by role', ar: 'عناصر القائمة مفلترة حسب الدور' }, priority: 'high' },
          { id: 'vis-5', text: { en: 'Dashboard widgets respect roles', ar: 'عناصر لوحة القيادة تحترم الأدوار' }, priority: 'medium' },
          { id: 'vis-6', text: { en: 'Reports respect role data scope', ar: 'التقارير تحترم نطاق بيانات الدور' }, priority: 'high' }
        ]
      },
      {
        id: 'role-actions',
        name: { en: '15.3 Role-Based Actions', ar: '15.3 الإجراءات المبنية على الأدوار' },
        checks: [
          { id: 'act-1', text: { en: 'Create action respects role', ar: 'إجراء الإنشاء يحترم الدور' }, priority: 'high' },
          { id: 'act-2', text: { en: 'Edit action respects role', ar: 'إجراء التعديل يحترم الدور' }, priority: 'high' },
          { id: 'act-3', text: { en: 'Delete action respects role', ar: 'إجراء الحذف يحترم الدور' }, priority: 'high' },
          { id: 'act-4', text: { en: 'Approve action respects role', ar: 'إجراء الموافقة يحترم الدور' }, priority: 'high' },
          { id: 'act-5', text: { en: 'Publish action respects role', ar: 'إجراء النشر يحترم الدور' }, priority: 'high' },
          { id: 'act-6', text: { en: 'Export action respects role', ar: 'إجراء التصدير يحترم الدور' }, priority: 'medium' }
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
          { id: 'ds-1', text: { en: 'Uses semantic color tokens', ar: 'يستخدم رموز الألوان الدلالية' }, priority: 'high' },
          { id: 'ds-2', text: { en: 'Uses consistent spacing scale', ar: 'يستخدم مقياس مسافات متسق' }, priority: 'medium' },
          { id: 'ds-3', text: { en: 'Uses design system components', ar: 'يستخدم مكونات نظام التصميم' }, priority: 'high' },
          { id: 'ds-4', text: { en: 'Typography follows hierarchy', ar: 'الطباعة تتبع التسلسل' }, priority: 'medium' },
          { id: 'ds-5', text: { en: 'Icons are consistent style', ar: 'الأيقونات بنمط متسق' }, priority: 'low' },
          { id: 'ds-6', text: { en: 'No hardcoded colors', ar: 'لا توجد ألوان مضمنة' }, priority: 'high' }
        ]
      },
      {
        id: 'layout-consistency',
        name: { en: '16.2 Layout Consistency', ar: '16.2 اتساق التخطيط' },
        checks: [
          { id: 'layout-1', text: { en: 'Page headers consistent', ar: 'رؤوس الصفحات متسقة' }, priority: 'medium' },
          { id: 'layout-2', text: { en: 'Card layouts consistent', ar: 'تخطيط البطاقات متسق' }, priority: 'medium' },
          { id: 'layout-3', text: { en: 'Form layouts consistent', ar: 'تخطيط النماذج متسق' }, priority: 'medium' },
          { id: 'layout-4', text: { en: 'Table layouts consistent', ar: 'تخطيط الجداول متسق' }, priority: 'medium' },
          { id: 'layout-5', text: { en: 'Modal/dialog layouts consistent', ar: 'تخطيط النوافذ المنبثقة متسق' }, priority: 'medium' },
          { id: 'layout-6', text: { en: 'Action buttons positioned consistently', ar: 'أزرار الإجراءات موضوعة بشكل متسق' }, priority: 'low' }
        ]
      },
      {
        id: 'visual-polish',
        name: { en: '16.3 Visual Polish', ar: '16.3 التلميع البصري' },
        checks: [
          { id: 'polish-1', text: { en: 'Loading states have skeletons', ar: 'حالات التحميل لها هياكل' }, priority: 'medium' },
          { id: 'polish-2', text: { en: 'Transitions are smooth', ar: 'الانتقالات سلسة' }, priority: 'low' },
          { id: 'polish-3', text: { en: 'Hover states are defined', ar: 'حالات التحويم محددة' }, priority: 'low' },
          { id: 'polish-4', text: { en: 'Error states are styled', ar: 'حالات الخطأ منسقة' }, priority: 'medium' },
          { id: 'polish-5', text: { en: 'Success feedback is visible', ar: 'رسائل النجاح مرئية' }, priority: 'medium' },
          { id: 'polish-6', text: { en: 'Empty states are styled', ar: 'الحالات الفارغة منسقة' }, priority: 'medium' }
        ]
      }
    ]
  },
  // NEW CATEGORIES FOR PLATFORM INTEGRATION
  {
    id: 'persona',
    name: { en: '17. Persona System', ar: '17. نظام الشخصيات' },
    color: 'lime',
    subcategories: [
      {
        id: 'persona-selection',
        name: { en: '17.1 Persona Selection', ar: '17.1 اختيار الشخصية' },
        checks: [
          { id: 'persona-1', text: { en: 'Persona selection page exists', ar: 'صفحة اختيار الشخصية موجودة' }, priority: 'high' },
          { id: 'persona-2', text: { en: 'All personas are selectable', ar: 'جميع الشخصيات قابلة للاختيار' }, priority: 'high' },
          { id: 'persona-3', text: { en: 'Persona change workflow exists', ar: 'سير عمل تغيير الشخصية موجود' }, priority: 'medium' },
          { id: 'persona-4', text: { en: 'Persona stored in user profile', ar: 'الشخصية مخزنة في ملف المستخدم' }, priority: 'high' },
          { id: 'persona-5', text: { en: 'Persona affects available features', ar: 'الشخصية تؤثر على الميزات المتاحة' }, priority: 'high' }
        ]
      },
      {
        id: 'persona-dashboards',
        name: { en: '17.2 Persona Dashboards', ar: '17.2 لوحات الشخصيات' },
        checks: [
          { id: 'dash-1', text: { en: 'Persona has dedicated dashboard', ar: 'الشخصية لها لوحة قيادة مخصصة' }, priority: 'high' },
          { id: 'dash-2', text: { en: 'Dashboard shows relevant widgets', ar: 'لوحة القيادة تعرض عناصر ذات صلة' }, priority: 'medium' },
          { id: 'dash-3', text: { en: 'Dashboard respects data scope', ar: 'لوحة القيادة تحترم نطاق البيانات' }, priority: 'high' },
          { id: 'dash-4', text: { en: 'Dashboard has quick actions', ar: 'لوحة القيادة لها إجراءات سريعة' }, priority: 'low' },
          { id: 'dash-5', text: { en: 'Dashboard loads efficiently', ar: 'لوحة القيادة تحمل بكفاءة' }, priority: 'medium' }
        ]
      },
      {
        id: 'persona-onboarding',
        name: { en: '17.3 Persona Onboarding', ar: '17.3 إعداد الشخصية' },
        checks: [
          { id: 'onb-1', text: { en: 'Persona-specific onboarding exists', ar: 'إعداد خاص بالشخصية موجود' }, priority: 'medium' },
          { id: 'onb-2', text: { en: 'Onboarding collects required data', ar: 'الإعداد يجمع البيانات المطلوبة' }, priority: 'high' },
          { id: 'onb-3', text: { en: 'Onboarding progress tracked', ar: 'تقدم الإعداد يتم تتبعه' }, priority: 'medium' },
          { id: 'onb-4', text: { en: 'Onboarding can be resumed', ar: 'الإعداد يمكن استئنافه' }, priority: 'low' },
          { id: 'onb-5', text: { en: 'Onboarding completion triggers role assignment', ar: 'اكتمال الإعداد يعين الدور' }, priority: 'high' }
        ]
      },
      {
        id: 'persona-routing',
        name: { en: '17.4 Persona Routing', ar: '17.4 توجيه الشخصية' },
        checks: [
          { id: 'proute-1', text: { en: 'Routes filtered by persona', ar: 'المسارات مفلترة حسب الشخصية' }, priority: 'high' },
          { id: 'proute-2', text: { en: 'Redirect to persona dashboard', ar: 'إعادة توجيه إلى لوحة الشخصية' }, priority: 'medium' },
          { id: 'proute-3', text: { en: 'Persona-specific URLs work', ar: 'عناوين URL الخاصة بالشخصية تعمل' }, priority: 'medium' },
          { id: 'proute-4', text: { en: 'Cross-persona navigation handled', ar: 'التنقل بين الشخصيات يتم معالجته' }, priority: 'low' }
        ]
      }
    ]
  },
  {
    id: 'inner-integration',
    name: { en: '18. Inner Systems Integration', ar: '18. تكامل الأنظمة الداخلية' },
    color: 'yellow',
    subcategories: [
      {
        id: 'notification-integration',
        name: { en: '18.1 Notification Integration', ar: '18.1 تكامل الإشعارات' },
        checks: [
          { id: 'ni-1', text: { en: 'System triggers notifications on create', ar: 'النظام يطلق إشعارات عند الإنشاء' }, priority: 'medium' },
          { id: 'ni-2', text: { en: 'System triggers notifications on status change', ar: 'النظام يطلق إشعارات عند تغيير الحالة' }, priority: 'medium' },
          { id: 'ni-3', text: { en: 'System triggers notifications on approval', ar: 'النظام يطلق إشعارات عند الموافقة' }, priority: 'high' },
          { id: 'ni-4', text: { en: 'System triggers notifications on assignment', ar: 'النظام يطلق إشعارات عند التعيين' }, priority: 'medium' },
          { id: 'ni-5', text: { en: 'useNotification hook integrated', ar: 'hook useNotification مدمج' }, priority: 'medium' },
          { id: 'ni-6', text: { en: 'Email notifications configured', ar: 'إشعارات البريد الإلكتروني مكونة' }, priority: 'medium' }
        ]
      },
      {
        id: 'approval-integration',
        name: { en: '18.2 Approval System Integration', ar: '18.2 تكامل نظام الموافقات' },
        checks: [
          { id: 'ai-1', text: { en: 'useApprovalRequest hook integrated', ar: 'hook useApprovalRequest مدمج' }, priority: 'high' },
          { id: 'ai-2', text: { en: 'Approval requests created automatically', ar: 'طلبات الموافقة تُنشأ تلقائياً' }, priority: 'high' },
          { id: 'ai-3', text: { en: 'Approval status displayed in UI', ar: 'حالة الموافقة تُعرض في الواجهة' }, priority: 'medium' },
          { id: 'ai-4', text: { en: 'Pending approvals queue works', ar: 'قائمة الموافقات المعلقة تعمل' }, priority: 'medium' },
          { id: 'ai-5', text: { en: 'Approval triggers status change', ar: 'الموافقة تحفز تغيير الحالة' }, priority: 'high' },
          { id: 'ai-6', text: { en: 'Rejection workflow implemented', ar: 'سير عمل الرفض مطبق' }, priority: 'medium' }
        ]
      },
      {
        id: 'audit-integration',
        name: { en: '18.3 Audit System Integration', ar: '18.3 تكامل نظام التدقيق' },
        checks: [
          { id: 'aui-1', text: { en: 'useAuditLog hook integrated', ar: 'hook useAuditLog مدمج' }, priority: 'high' },
          { id: 'aui-2', text: { en: 'All CRUD operations logged', ar: 'جميع عمليات CRUD مسجلة' }, priority: 'high' },
          { id: 'aui-3', text: { en: 'Audit trail visible in detail page', ar: 'سجل التدقيق مرئي في صفحة التفاصيل' }, priority: 'medium' },
          { id: 'aui-4', text: { en: 'Sensitive fields masked in logs', ar: 'الحقول الحساسة مخفية في السجلات' }, priority: 'high' },
          { id: 'aui-5', text: { en: 'User context captured in logs', ar: 'سياق المستخدم مسجل في السجلات' }, priority: 'medium' }
        ]
      },
      {
        id: 'communication-integration',
        name: { en: '18.4 Communication Integration', ar: '18.4 تكامل الاتصالات' },
        checks: [
          { id: 'ci-1', text: { en: 'useEmailTrigger hook integrated', ar: 'hook useEmailTrigger مدمج' }, priority: 'medium' },
          { id: 'ci-2', text: { en: 'Email templates configured for entity', ar: 'قوالب البريد مكونة للكيان' }, priority: 'medium' },
          { id: 'ci-3', text: { en: 'Email trigger events defined', ar: 'أحداث محفزات البريد محددة' }, priority: 'medium' },
          { id: 'ci-4', text: { en: 'Digest emails include entity updates', ar: 'رسائل الملخص تتضمن تحديثات الكيان' }, priority: 'low' },
          { id: 'ci-5', text: { en: 'Communication preferences respected', ar: 'تفضيلات الاتصال محترمة' }, priority: 'medium' }
        ]
      }
    ]
  },
  {
    id: 'realtime',
    name: { en: '19. Realtime & WebSocket', ar: '19. الوقت الحقيقي والـ WebSocket' },
    color: 'orange',
    subcategories: [
      {
        id: 'realtime-subscriptions',
        name: { en: '19.1 Realtime Subscriptions', ar: '19.1 اشتراكات الوقت الحقيقي' },
        checks: [
          { id: 'rt-1', text: { en: 'Realtime enabled on main table', ar: 'الوقت الحقيقي مفعل على الجدول الرئيسي' }, priority: 'low' },
          { id: 'rt-2', text: { en: 'Subscription cleans up on unmount', ar: 'الاشتراك ينظف عند الإزالة' }, priority: 'medium' },
          { id: 'rt-3', text: { en: 'Realtime updates merge with cache', ar: 'تحديثات الوقت الحقيقي تدمج مع التخزين المؤقت' }, priority: 'medium' },
          { id: 'rt-4', text: { en: 'Connection state handled', ar: 'حالة الاتصال يتم معالجتها' }, priority: 'low' },
          { id: 'rt-5', text: { en: 'Reconnection logic exists', ar: 'منطق إعادة الاتصال موجود' }, priority: 'low' }
        ]
      },
      {
        id: 'live-updates',
        name: { en: '19.2 Live Updates', ar: '19.2 التحديثات المباشرة' },
        checks: [
          { id: 'live-1', text: { en: 'List view updates in realtime', ar: 'عرض القائمة يتحدث في الوقت الحقيقي' }, priority: 'low' },
          { id: 'live-2', text: { en: 'Detail view updates in realtime', ar: 'عرض التفاصيل يتحدث في الوقت الحقيقي' }, priority: 'low' },
          { id: 'live-3', text: { en: 'Notification badge updates live', ar: 'شارة الإشعارات تتحدث مباشرة' }, priority: 'medium' },
          { id: 'live-4', text: { en: 'Collaboration indicators work', ar: 'مؤشرات التعاون تعمل' }, priority: 'low' }
        ]
      }
    ]
  },
  {
    id: 'activity',
    name: { en: '20. Activity & Timeline', ar: '20. النشاط والجدول الزمني' },
    color: 'indigo',
    subcategories: [
      {
        id: 'activity-logging',
        name: { en: '20.1 Activity Logging', ar: '20.1 تسجيل النشاط' },
        checks: [
          { id: 'actlog-1', text: { en: 'Entity has activity table', ar: 'الكيان له جدول نشاط' }, priority: 'medium' },
          { id: 'actlog-2', text: { en: 'Activity logged on all actions', ar: 'النشاط يسجل عند جميع الإجراءات' }, priority: 'medium' },
          { id: 'actlog-3', text: { en: 'Activity includes user info', ar: 'النشاط يتضمن معلومات المستخدم' }, priority: 'medium' },
          { id: 'actlog-4', text: { en: 'Activity includes timestamp', ar: 'النشاط يتضمن الطابع الزمني' }, priority: 'medium' },
          { id: 'actlog-5', text: { en: 'Activity includes metadata', ar: 'النشاط يتضمن البيانات الوصفية' }, priority: 'low' }
        ]
      },
      {
        id: 'timeline-display',
        name: { en: '20.2 Timeline Display', ar: '20.2 عرض الجدول الزمني' },
        checks: [
          { id: 'time-1', text: { en: 'Timeline component exists', ar: 'مكون الجدول الزمني موجود' }, priority: 'low' },
          { id: 'time-2', text: { en: 'Timeline shows all activities', ar: 'الجدول الزمني يعرض جميع الأنشطة' }, priority: 'low' },
          { id: 'time-3', text: { en: 'Timeline is paginated', ar: 'الجدول الزمني مقسم' }, priority: 'low' },
          { id: 'time-4', text: { en: 'Timeline is filterable', ar: 'الجدول الزمني قابل للفلترة' }, priority: 'low' }
        ]
      },
      {
        id: 'cross-entity-streams',
        name: { en: '20.3 Cross-Entity Activity Streams', ar: '20.3 تيارات النشاط المشتركة' },
        checks: [
          { id: 'ces-1', text: { en: 'User activity stream exists', ar: 'تيار نشاط المستخدم موجود' }, priority: 'low' },
          { id: 'ces-2', text: { en: 'Organization activity stream exists', ar: 'تيار نشاط المنظمة موجود' }, priority: 'low' },
          { id: 'ces-3', text: { en: 'Global activity feed exists', ar: 'تغذية النشاط العالمية موجودة' }, priority: 'low' },
          { id: 'ces-4', text: { en: 'Activity stream respects permissions', ar: 'تيار النشاط يحترم الصلاحيات' }, priority: 'medium' }
        ]
      }
    ]
  },
  {
    id: 'delegation',
    name: { en: '21. Delegation & Escalation', ar: '21. التفويض والتصعيد' },
    color: 'rose',
    subcategories: [
      {
        id: 'delegation-rules',
        name: { en: '21.1 Delegation Rules', ar: '21.1 قواعد التفويض' },
        checks: [
          { id: 'del-1', text: { en: 'Delegation rules table exists', ar: 'جدول قواعد التفويض موجود' }, priority: 'medium' },
          { id: 'del-2', text: { en: 'Delegation can be temporary', ar: 'التفويض يمكن أن يكون مؤقت' }, priority: 'low' },
          { id: 'del-3', text: { en: 'Delegation requires approval', ar: 'التفويض يتطلب موافقة' }, priority: 'medium' },
          { id: 'del-4', text: { en: 'Delegation audit trail exists', ar: 'سجل تدقيق التفويض موجود' }, priority: 'medium' },
          { id: 'del-5', text: { en: 'Delegation scope is limited', ar: 'نطاق التفويض محدود' }, priority: 'medium' }
        ]
      },
      {
        id: 'auto-approval',
        name: { en: '21.2 Auto-Approval Rules', ar: '21.2 قواعد الموافقة التلقائية' },
        checks: [
          { id: 'auto-1', text: { en: 'Auto-approval rules configurable', ar: 'قواعد الموافقة التلقائية قابلة للتكوين' }, priority: 'low' },
          { id: 'auto-2', text: { en: 'Auto-approval by persona type', ar: 'موافقة تلقائية حسب نوع الشخصية' }, priority: 'low' },
          { id: 'auto-3', text: { en: 'Auto-approval by organization', ar: 'موافقة تلقائية حسب المنظمة' }, priority: 'low' },
          { id: 'auto-4', text: { en: 'Auto-approval logged', ar: 'الموافقة التلقائية مسجلة' }, priority: 'medium' }
        ]
      },
      {
        id: 'escalation-chains',
        name: { en: '21.3 Escalation Chains', ar: '21.3 سلاسل التصعيد' },
        checks: [
          { id: 'esc-1', text: { en: 'Escalation levels defined', ar: 'مستويات التصعيد محددة' }, priority: 'medium' },
          { id: 'esc-2', text: { en: 'Escalation triggers on SLA breach', ar: 'التصعيد يُحفز عند خرق SLA' }, priority: 'medium' },
          { id: 'esc-3', text: { en: 'Escalation notifications sent', ar: 'إشعارات التصعيد تُرسل' }, priority: 'medium' },
          { id: 'esc-4', text: { en: 'Escalation visual indicator', ar: 'مؤشر بصري للتصعيد' }, priority: 'low' },
          { id: 'esc-5', text: { en: 'Escalation de-escalation logic', ar: 'منطق إلغاء التصعيد' }, priority: 'low' }
        ]
      }
    ]
  },
  {
    id: 'cross-entity',
    name: { en: '22. Cross-Entity Linking', ar: '22. ربط الكيانات المتقاطعة' },
    color: 'teal',
    subcategories: [
      {
        id: 'entity-references',
        name: { en: '22.1 Entity References', ar: '22.1 مراجع الكيانات' },
        checks: [
          { id: 'ref-1', text: { en: 'Linked entities displayed', ar: 'الكيانات المرتبطة معروضة' }, priority: 'medium' },
          { id: 'ref-2', text: { en: 'Links are navigable', ar: 'الروابط قابلة للتنقل' }, priority: 'medium' },
          { id: 'ref-3', text: { en: 'Reverse links shown', ar: 'الروابط العكسية معروضة' }, priority: 'low' },
          { id: 'ref-4', text: { en: 'Link creation UI exists', ar: 'واجهة إنشاء الروابط موجودة' }, priority: 'low' },
          { id: 'ref-5', text: { en: 'Link removal respects permissions', ar: 'إزالة الروابط تحترم الصلاحيات' }, priority: 'medium' }
        ]
      },
      {
        id: 'cascade-updates',
        name: { en: '22.2 Cascade Updates', ar: '22.2 التحديثات المتسلسلة' },
        checks: [
          { id: 'cas-1', text: { en: 'Status changes cascade correctly', ar: 'تغييرات الحالة تتسلسل بشكل صحيح' }, priority: 'medium' },
          { id: 'cas-2', text: { en: 'Delete cascades handled', ar: 'حذف التسلسل يُعالج' }, priority: 'high' },
          { id: 'cas-3', text: { en: 'Orphan records prevented', ar: 'السجلات اليتيمة ممنوعة' }, priority: 'medium' },
          { id: 'cas-4', text: { en: 'Cascade notifications sent', ar: 'إشعارات التسلسل تُرسل' }, priority: 'low' }
        ]
      },
      {
        id: 'dependency-checks',
        name: { en: '22.3 Dependency Checks', ar: '22.3 فحوصات التبعيات' },
        checks: [
          { id: 'dep-1', text: { en: 'Delete blocked if dependencies exist', ar: 'الحذف يُحظر إذا وجدت تبعيات' }, priority: 'high' },
          { id: 'dep-2', text: { en: 'Dependencies listed before delete', ar: 'التبعيات تُسرد قبل الحذف' }, priority: 'medium' },
          { id: 'dep-3', text: { en: 'Impact analysis available', ar: 'تحليل التأثير متاح' }, priority: 'low' },
          { id: 'dep-4', text: { en: 'Dependency graph visualized', ar: 'رسم بياني للتبعيات معروض' }, priority: 'low' }
        ]
      }
    ]
  },
  {
    id: 'code-integrity',
    name: { en: '23. Code Integrity', ar: '23. سلامة الكود' },
    color: 'fuchsia',
    subcategories: [
      {
        id: 'import-exports',
        name: { en: '23.1 Import/Export Validation', ar: '23.1 التحقق من الاستيراد/التصدير' },
        checks: [
          { id: 'imp-1', text: { en: 'Index file exports resolve to existing files', ar: 'تصدير ملف الفهرس يشير لملفات موجودة' }, priority: 'critical' },
          { id: 'imp-2', text: { en: 'Relative import paths are correct (../ vs ./)', ar: 'مسارات الاستيراد النسبية صحيحة' }, priority: 'critical' },
          { id: 'imp-3', text: { en: 'No circular dependencies in hooks', ar: 'لا توجد تبعيات دائرية في الـ hooks' }, priority: 'high' },
          { id: 'imp-4', text: { en: 'All named exports exist in source', ar: 'جميع الصادرات المسماة موجودة في المصدر' }, priority: 'high' },
          { id: 'imp-5', text: { en: 'Default exports match file purpose', ar: 'الصادرات الافتراضية تطابق الغرض' }, priority: 'medium' }
        ]
      },
      {
        id: 'hook-usage',
        name: { en: '23.2 Hook Usage Verification', ar: '23.2 التحقق من استخدام الـ Hooks' },
        checks: [
          { id: 'hu-1', text: { en: 'Created hooks are imported in components', ar: 'الـ Hooks المنشأة مستوردة في المكونات' }, priority: 'high' },
          { id: 'hu-2', text: { en: 'Realtime hooks used in list/detail pages', ar: 'hooks الوقت الحقيقي مستخدمة في صفحات القوائم' }, priority: 'medium' },
          { id: 'hu-3', text: { en: 'Delegation hooks integrated in workflows', ar: 'hooks التفويض مدمجة في سير العمل' }, priority: 'medium' },
          { id: 'hu-4', text: { en: 'Notification hooks called on state changes', ar: 'hooks الإشعارات تُستدعى عند تغيير الحالة' }, priority: 'medium' },
          { id: 'hu-5', text: { en: 'Audit hooks called in mutations', ar: 'hooks التدقيق تُستدعى في التعديلات' }, priority: 'high' }
        ]
      }
    ]
  },
  {
    id: 'schema-sync',
    name: { en: '24. Schema Synchronization', ar: '24. تزامن المخطط' },
    color: 'lime',
    subcategories: [
      {
        id: 'code-schema-match',
        name: { en: '24.1 Code↔DB Schema Match', ar: '24.1 تطابق الكود مع مخطط قاعدة البيانات' },
        checks: [
          { id: 'csm-1', text: { en: 'Hook insert() uses only existing columns', ar: 'hook insert() يستخدم أعمدة موجودة فقط' }, priority: 'critical' },
          { id: 'csm-2', text: { en: 'Hook update() uses only existing columns', ar: 'hook update() يستخدم أعمدة موجودة فقط' }, priority: 'critical' },
          { id: 'csm-3', text: { en: 'Hook select() columns exist in table', ar: 'أعمدة select() موجودة في الجدول' }, priority: 'critical' },
          { id: 'csm-4', text: { en: 'Filter conditions reference valid columns', ar: 'شروط الفلترة تشير لأعمدة صالحة' }, priority: 'high' },
          { id: 'csm-5', text: { en: 'Types file matches actual schema', ar: 'ملف الأنواع يطابق المخطط الفعلي' }, priority: 'high' },
          { id: 'csm-6', text: { en: 'Required columns have values on insert', ar: 'الأعمدة المطلوبة لها قيم عند الإدراج' }, priority: 'critical' }
        ]
      },
      {
        id: 'realtime-config',
        name: { en: '24.2 Realtime Configuration', ar: '24.2 تكوين الوقت الحقيقي' },
        checks: [
          { id: 'rtc-1', text: { en: 'Main table in supabase_realtime publication', ar: 'الجدول الرئيسي في نشر supabase_realtime' }, priority: 'high' },
          { id: 'rtc-2', text: { en: 'Activity table in supabase_realtime publication', ar: 'جدول النشاط في نشر supabase_realtime' }, priority: 'medium' },
          { id: 'rtc-3', text: { en: 'Proposals/comments table in publication', ar: 'جدول المقترحات في النشر' }, priority: 'medium' },
          { id: 'rtc-4', text: { en: 'Realtime filter matches table structure', ar: 'فلتر الوقت الحقيقي يطابق بنية الجدول' }, priority: 'high' },
          { id: 'rtc-5', text: { en: 'Channel names follow naming convention', ar: 'أسماء القنوات تتبع اتفاقية التسمية' }, priority: 'low' }
        ]
      },
      {
        id: 'fk-integrity',
        name: { en: '24.3 Foreign Key Integrity', ar: '24.3 سلامة المفاتيح الخارجية' },
        checks: [
          { id: 'fk-1', text: { en: 'FK references valid tables', ar: 'المفاتيح الخارجية تشير لجداول صالحة' }, priority: 'critical' },
          { id: 'fk-2', text: { en: 'FK columns match referenced PK type', ar: 'أعمدة المفاتيح الخارجية تطابق نوع المفتاح الأساسي' }, priority: 'critical' },
          { id: 'fk-3', text: { en: 'Cascade rules appropriate for relationship', ar: 'قواعد التسلسل مناسبة للعلاقة' }, priority: 'high' },
          { id: 'fk-4', text: { en: 'Index exists on FK columns', ar: 'فهرس موجود على أعمدة المفاتيح الخارجية' }, priority: 'medium' }
        ]
      }
    ]
  },
  {
    id: 'automated-tests',
    name: { en: '25. Automated Verification', ar: '25. التحقق الآلي' },
    color: 'amber',
    subcategories: [
      {
        id: 'runtime-checks',
        name: { en: '25.1 Runtime Checks', ar: '25.1 فحوصات وقت التشغيل' },
        checks: [
          { id: 'run-1', text: { en: 'Console has no import errors', ar: 'الكونسول ليس به أخطاء استيراد' }, priority: 'critical' },
          { id: 'run-2', text: { en: 'No undefined hook return values', ar: 'لا توجد قيم إرجاع غير معرفة من الـ hooks' }, priority: 'high' },
          { id: 'run-3', text: { en: 'No React hooks rules violations', ar: 'لا توجد انتهاكات لقواعد React hooks' }, priority: 'critical' },
          { id: 'run-4', text: { en: 'Network requests return 2xx/4xx (not 5xx)', ar: 'طلبات الشبكة ترجع 2xx/4xx' }, priority: 'high' },
          { id: 'run-5', text: { en: 'Supabase queries execute without errors', ar: 'استعلامات Supabase تنفذ بدون أخطاء' }, priority: 'critical' }
        ]
      },
      {
        id: 'db-verification',
        name: { en: '25.2 Database Verification', ar: '25.2 التحقق من قاعدة البيانات' },
        checks: [
          { id: 'dbv-1', text: { en: 'All referenced tables exist', ar: 'جميع الجداول المشار إليها موجودة' }, priority: 'critical' },
          { id: 'dbv-2', text: { en: 'All referenced columns exist', ar: 'جميع الأعمدة المشار إليها موجودة' }, priority: 'critical' },
          { id: 'dbv-3', text: { en: 'RLS policies allow expected operations', ar: 'سياسات RLS تسمح بالعمليات المتوقعة' }, priority: 'critical' },
          { id: 'dbv-4', text: { en: 'Indexes exist for filter columns', ar: 'فهارس موجودة لأعمدة الفلترة' }, priority: 'medium' },
          { id: 'dbv-5', text: { en: 'Test data can be inserted/retrieved', ar: 'بيانات الاختبار يمكن إدراجها/استرجاعها' }, priority: 'high' }
        ]
      }
    ]
  }
];

// Helper function to get total check count
export const getTotalCheckCount = () => {
  return VALIDATION_CATEGORIES.reduce((total, category) => {
    return total + category.subcategories.reduce((subTotal, sub) => {
      return subTotal + sub.checks.length;
    }, 0);
  }, 0);
};

// Helper function to get checks by priority
export const getChecksByPriority = (priority) => {
  const checks = [];
  VALIDATION_CATEGORIES.forEach(category => {
    category.subcategories.forEach(sub => {
      sub.checks.filter(c => c.priority === priority).forEach(check => {
        checks.push({ ...check, category: category.id, subcategory: sub.id });
      });
    });
  });
  return checks;
};
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
