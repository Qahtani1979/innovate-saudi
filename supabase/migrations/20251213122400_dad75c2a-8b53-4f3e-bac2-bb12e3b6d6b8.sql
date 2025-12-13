-- Add event permissions
INSERT INTO permissions (code, name, name_ar, description, description_ar, entity_type, action, is_active) VALUES
  ('event_create', 'Create Events', 'إنشاء الفعاليات', 'Create new events', 'إنشاء فعاليات جديدة', 'event', 'create', true),
  ('event_edit', 'Edit Events', 'تعديل الفعاليات', 'Edit own or assigned events', 'تعديل الفعاليات الخاصة أو المُسندة', 'event', 'update', true),
  ('event_delete', 'Delete Events', 'حذف الفعاليات', 'Delete or cancel events', 'حذف أو إلغاء الفعاليات', 'event', 'delete', true),
  ('event_manage', 'Manage Events', 'إدارة الفعاليات', 'Full event management', 'إدارة كاملة للفعاليات', 'event', 'manage', true),
  ('event_approve', 'Approve Events', 'الموافقة على الفعاليات', 'Approve pending events', 'الموافقة على الفعاليات المعلقة', 'event', 'approve', true)
ON CONFLICT (code) DO NOTHING;