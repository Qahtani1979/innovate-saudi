// Implementation Plans for System Validation Gaps
// Each plan contains detailed fixes for failed validation checks

export const IMPLEMENTATION_PLANS = {
  solutions: {
    systemId: 'solutions',
    systemName: 'Solutions Hub',
    auditDate: '2024-12-19',
    totalGaps: 41,
    phases: [
      {
        id: 'phase-1',
        name: { en: 'Phase 1: CRITICAL', ar: 'المرحلة 1: حرجة' },
        priority: 'critical',
        estimatedHours: 4,
        fixes: [
          {
            checkId: 'rls-3',
            title: { en: 'Add WITH CHECK to INSERT Policies', ar: 'إضافة WITH CHECK لسياسات الإدراج' },
            description: { en: 'INSERT policies lack WITH CHECK clause for data validation', ar: 'سياسات الإدراج تفتقر إلى WITH CHECK للتحقق' },
            status: 'pending',
            codeChanges: [
              {
                type: 'sql',
                file: 'Migration',
                code: `-- Drop existing INSERT policy and recreate with WITH CHECK
DROP POLICY IF EXISTS "Providers can insert own solutions" ON solutions;

CREATE POLICY "Providers can insert own solutions" ON solutions
FOR INSERT
WITH CHECK (
  provider_id IN (
    SELECT id FROM providers 
    WHERE user_id = auth.uid()
  )
);`
              }
            ]
          },
          {
            checkId: 'rls-4',
            title: { en: 'Add WITH CHECK to UPDATE Policies', ar: 'إضافة WITH CHECK لسياسات التحديث' },
            description: { en: 'UPDATE policies need both USING and WITH CHECK', ar: 'سياسات التحديث تحتاج USING و WITH CHECK' },
            status: 'pending',
            codeChanges: [
              {
                type: 'sql',
                file: 'Migration',
                code: `-- Add WITH CHECK to UPDATE policies
DROP POLICY IF EXISTS "Providers can update own solutions" ON solutions;

CREATE POLICY "Providers can update own solutions" ON solutions
FOR UPDATE
USING (
  provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
)
WITH CHECK (
  provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
);`
              }
            ]
          },
          {
            checkId: 'pc-1',
            title: { en: 'Add ProtectedPage Wrapper', ar: 'إضافة غلاف الصفحة المحمية' },
            description: { en: 'Solutions.jsx lacks ProtectedPage HOC for authentication', ar: 'Solutions.jsx تفتقر لغلاف ProtectedPage' },
            status: 'pending',
            codeChanges: [
              {
                type: 'jsx',
                file: 'src/pages/Solutions.jsx',
                code: `// Before: export default Solutions;
// After:
import ProtectedPage from '@/components/permissions/ProtectedPage';

export default ProtectedPage(Solutions, { 
  requiredPermissions: ['solution_view'] 
});`
              }
            ]
          },
          {
            checkId: 'fc-1',
            title: { en: 'Add Zod Schema Validation', ar: 'إضافة التحقق من مخطط Zod' },
            description: { en: 'Form lacks input validation using Zod schema', ar: 'النموذج يفتقر للتحقق باستخدام Zod' },
            status: 'pending',
            codeChanges: [
              {
                type: 'jsx',
                file: 'src/components/solutions/SolutionCreateWizard.jsx',
                code: `import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const solutionSchema = z.object({
  name_en: z.string().min(3, 'Name must be at least 3 characters').max(200),
  name_ar: z.string().min(3, 'Arabic name required').max(200),
  description_en: z.string().min(50, 'Description must be at least 50 characters'),
  sector_id: z.string().uuid('Valid sector required'),
  maturity_level: z.enum(['concept', 'prototype', 'pilot', 'scaling', 'mature']),
  trl: z.number().min(1).max(9),
});

const form = useForm({
  resolver: zodResolver(solutionSchema),
  defaultValues: { ... }
});`
              }
            ]
          }
        ]
      },
      {
        id: 'phase-2',
        name: { en: 'Phase 2: DATABASE', ar: 'المرحلة 2: قاعدة البيانات' },
        priority: 'high',
        estimatedHours: 6,
        fixes: [
          {
            checkId: 'db-4',
            title: { en: 'Add Performance Indexes', ar: 'إضافة فهارس الأداء' },
            description: { en: 'Missing indexes on frequently queried columns', ar: 'فهارس مفقودة على الأعمدة المستعلمة بكثرة' },
            status: 'pending',
            codeChanges: [
              {
                type: 'sql',
                file: 'Migration',
                code: `-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_solutions_workflow_stage 
ON solutions(workflow_stage);

CREATE INDEX IF NOT EXISTS idx_solutions_created_at 
ON solutions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_solutions_provider_id 
ON solutions(provider_id);

CREATE INDEX IF NOT EXISTS idx_solutions_sector_id 
ON solutions(sector_id);

CREATE INDEX IF NOT EXISTS idx_solutions_is_published 
ON solutions(is_published) WHERE is_published = true;`
              }
            ]
          },
          {
            checkId: 'fn-3',
            title: { en: 'Create updated_at Trigger', ar: 'إنشاء محفز updated_at' },
            description: { en: 'No trigger to auto-update updated_at column', ar: 'لا يوجد محفز لتحديث عمود updated_at تلقائياً' },
            status: 'pending',
            codeChanges: [
              {
                type: 'sql',
                file: 'Migration',
                code: `-- Create trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_solutions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_solutions_timestamp ON solutions;
CREATE TRIGGER update_solutions_timestamp
  BEFORE UPDATE ON solutions
  FOR EACH ROW
  EXECUTE FUNCTION update_solutions_updated_at();`
              }
            ]
          },
          {
            checkId: 'fn-4',
            title: { en: 'Create Audit Logging Trigger', ar: 'إنشاء محفز سجل التدقيق' },
            description: { en: 'No audit trigger for tracking changes', ar: 'لا يوجد محفز تدقيق لتتبع التغييرات' },
            status: 'pending',
            codeChanges: [
              {
                type: 'sql',
                file: 'Migration',
                code: `-- Create audit logging function for solutions
CREATE OR REPLACE FUNCTION log_solution_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO access_logs (
    action, entity_type, entity_id, 
    old_values, new_values, user_id, user_email
  ) VALUES (
    TG_OP, 'solution', COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END,
    auth.uid(), current_setting('request.jwt.claims', true)::json->>'email'
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS solutions_audit_trigger ON solutions;
CREATE TRIGGER solutions_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON solutions
  FOR EACH ROW EXECUTE FUNCTION log_solution_changes();`
              }
            ]
          },
          {
            checkId: 'wf-5',
            title: { en: 'Create Version History Table', ar: 'إنشاء جدول تاريخ الإصدارات' },
            description: { en: 'No table for tracking solution version history', ar: 'لا يوجد جدول لتتبع تاريخ إصدارات الحلول' },
            status: 'pending',
            codeChanges: [
              {
                type: 'sql',
                file: 'Migration',
                code: `-- Create version history table
CREATE TABLE IF NOT EXISTS solution_version_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id UUID REFERENCES solutions(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  changes JSONB,
  changed_by UUID,
  change_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE solution_version_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own solution versions" 
ON solution_version_history FOR SELECT
USING (
  solution_id IN (
    SELECT s.id FROM solutions s
    JOIN providers p ON s.provider_id = p.id
    WHERE p.user_id = auth.uid()
  ) OR
  EXISTS (SELECT 1 FROM user_roles ur 
          JOIN roles r ON ur.role_id = r.id 
          WHERE ur.user_id = auth.uid() AND r.name = 'Admin')
);`
              }
            ]
          },
          {
            checkId: 'notif-4',
            title: { en: 'Enable Realtime for Solutions', ar: 'تفعيل الوقت الحقيقي للحلول' },
            description: { en: 'Solutions table not in realtime publication', ar: 'جدول الحلول ليس في نشر الوقت الحقيقي' },
            status: 'pending',
            codeChanges: [
              {
                type: 'sql',
                file: 'Migration',
                code: `-- Enable realtime for solutions table
ALTER PUBLICATION supabase_realtime ADD TABLE solutions;`
              }
            ]
          },
          {
            checkId: 'rls-8',
            title: { en: 'Fix Provider RLS Policy', ar: 'إصلاح سياسة RLS للمزود' },
            description: { en: 'Provider-based access policy needs correction', ar: 'سياسة الوصول المبنية على المزود تحتاج تصحيح' },
            status: 'pending',
            codeChanges: [
              {
                type: 'sql',
                file: 'Migration',
                code: `-- Fix provider RLS to properly use auth.uid()
DROP POLICY IF EXISTS "Providers can view own solutions" ON solutions;

CREATE POLICY "Providers can view own solutions" ON solutions
FOR SELECT
USING (
  -- Provider owns the solution
  provider_id IN (
    SELECT id FROM providers WHERE user_id = auth.uid()
  )
  -- OR solution is published
  OR is_published = true
  -- OR user is admin
  OR EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'Admin'
  )
);`
              }
            ]
          }
        ]
      },
      {
        id: 'phase-3',
        name: { en: 'Phase 3: COMPONENTS', ar: 'المرحلة 3: المكونات' },
        priority: 'high',
        estimatedHours: 8,
        fixes: [
          {
            checkId: 'pc-3',
            title: { en: 'Add Required Roles', ar: 'إضافة الأدوار المطلوبة' },
            description: { en: 'SolutionCreate.jsx missing requiredRoles prop', ar: 'SolutionCreate.jsx تفتقر لخاصية requiredRoles' },
            status: 'pending',
            codeChanges: [
              {
                type: 'jsx',
                file: 'src/pages/SolutionCreate.jsx',
                code: `export default ProtectedPage(SolutionCreate, { 
  requiredPermissions: ['solution_create'],
  requiredRoles: ['provider', 'admin']
});`
              }
            ]
          },
          {
            checkId: 'pc-6',
            title: { en: 'Add Error Boundary', ar: 'إضافة حدود الخطأ' },
            description: { en: 'No error boundary to catch component failures', ar: 'لا توجد حدود خطأ لالتقاط فشل المكون' },
            status: 'pending',
            codeChanges: [
              {
                type: 'jsx',
                file: 'src/pages/Solutions.jsx',
                code: `import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <Card className="p-6 text-center">
      <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
      <h3 className="text-lg font-semibold">Something went wrong</h3>
      <p className="text-muted-foreground mb-4">{error.message}</p>
      <Button onClick={resetErrorBoundary}>Try Again</Button>
    </Card>
  );
}

// Wrap main content
<ErrorBoundary FallbackComponent={ErrorFallback}>
  {/* Solutions content */}
</ErrorBoundary>`
              }
            ]
          },
          {
            checkId: 'fc-2',
            title: { en: 'Mark Required Fields', ar: 'تحديد الحقول المطلوبة' },
            description: { en: 'Required fields not marked with asterisk', ar: 'الحقول المطلوبة غير محددة بنجمة' },
            status: 'pending',
            codeChanges: [
              {
                type: 'jsx',
                file: 'src/components/solutions/SolutionCreateWizard.jsx',
                code: `<Label htmlFor="name_en">
  Solution Name <span className="text-destructive">*</span>
</Label>
<Label htmlFor="description_en">
  Description <span className="text-destructive">*</span>
</Label>`
              }
            ]
          },
          {
            checkId: 'fc-3',
            title: { en: 'Add Input Max Length', ar: 'إضافة الحد الأقصى للإدخال' },
            description: { en: 'Text inputs missing maxLength validation', ar: 'حقول النص تفتقر للحد الأقصى للطول' },
            status: 'pending',
            codeChanges: [
              {
                type: 'jsx',
                file: 'src/components/solutions/SolutionCreateWizard.jsx',
                code: `<Input
  id="name_en"
  maxLength={200}
  {...register('name_en')}
/>
<Textarea
  id="description_en"
  maxLength={5000}
  {...register('description_en')}
/>`
              }
            ]
          },
          {
            checkId: 'lc-3',
            title: { en: 'Add Sort Functionality', ar: 'إضافة وظيفة الفرز' },
            description: { en: 'List component missing sort controls', ar: 'مكون القائمة يفتقر لعناصر الفرز' },
            status: 'pending',
            codeChanges: [
              {
                type: 'jsx',
                file: 'src/pages/Solutions.jsx',
                code: `const [sortField, setSortField] = useState('created_at');
const [sortOrder, setSortOrder] = useState('desc');

<Select value={sortField} onValueChange={setSortField}>
  <SelectTrigger className="w-40">
    <SelectValue placeholder="Sort by" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="created_at">Date Created</SelectItem>
    <SelectItem value="name_en">Name</SelectItem>
    <SelectItem value="trl">TRL Level</SelectItem>
    <SelectItem value="maturity_level">Maturity</SelectItem>
  </SelectContent>
</Select>`
              }
            ]
          },
          {
            checkId: 'lc-5',
            title: { en: 'Add Delete Confirmation', ar: 'إضافة تأكيد الحذف' },
            description: { en: 'No confirmation dialog for destructive actions', ar: 'لا يوجد حوار تأكيد للإجراءات التدميرية' },
            status: 'pending',
            codeChanges: [
              {
                type: 'jsx',
                file: 'src/pages/Solutions.jsx',
                code: `import { AlertDialog, AlertDialogAction, AlertDialogCancel, 
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const [deleteId, setDeleteId] = useState(null);

<AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete Solution?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. This will permanently delete 
        the solution and all associated data.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction 
        className="bg-destructive"
        onClick={() => handleDelete(deleteId)}
      >
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>`
              }
            ]
          },
          {
            checkId: 'dc-1',
            title: { en: 'Add 404 Handling', ar: 'إضافة معالجة 404' },
            description: { en: 'No 404 state for invalid solution IDs', ar: 'لا توجد حالة 404 لمعرفات الحلول غير الصالحة' },
            status: 'pending',
            codeChanges: [
              {
                type: 'jsx',
                file: 'src/pages/SolutionDetail.jsx',
                code: `if (!isLoading && !solution) {
  return (
    <PageLayout>
      <Card className="p-12 text-center">
        <FileQuestion className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Solution Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The solution you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link to="/solutions">Back to Solutions</Link>
        </Button>
      </Card>
    </PageLayout>
  );
}`
              }
            ]
          },
          {
            checkId: 'dc-2',
            title: { en: 'Add Unauthorized State', ar: 'إضافة حالة غير مصرح' },
            description: { en: 'No access denied message for unauthorized users', ar: 'لا توجد رسالة رفض الوصول للمستخدمين غير المصرح لهم' },
            status: 'pending',
            codeChanges: [
              {
                type: 'jsx',
                file: 'src/pages/SolutionDetail.jsx',
                code: `if (error?.code === 'PGRST116' || error?.message?.includes('permission')) {
  return (
    <PageLayout>
      <Card className="p-12 text-center">
        <ShieldX className="h-16 w-16 mx-auto text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-6">
          You don't have permission to view this solution.
        </p>
        <Button asChild variant="outline">
          <Link to="/solutions">Back to Solutions</Link>
        </Button>
      </Card>
    </PageLayout>
  );
}`
              }
            ]
          },
          {
            checkId: 'dc-4',
            title: { en: 'Fix N+1 Query Pattern', ar: 'إصلاح نمط استعلام N+1' },
            description: { en: 'Related data not loaded efficiently', ar: 'البيانات المرتبطة لا تُحمل بكفاءة' },
            status: 'pending',
            codeChanges: [
              {
                type: 'jsx',
                file: 'src/pages/SolutionDetail.jsx',
                code: `// Use single query with joins instead of multiple queries
const { data: solution } = useQuery({
  queryKey: ['solution', id],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('solutions')
      .select(\`
        *,
        provider:providers(*),
        sector:sectors(*),
        challenge_matches:challenge_solution_matches(
          *,
          challenge:challenges(id, title_en, title_ar)
        )
      \`)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }
});`
              }
            ]
          },
          {
            checkId: 'api-14',
            title: { en: 'Optimize Database Queries', ar: 'تحسين استعلامات قاعدة البيانات' },
            description: { en: 'Ensure queries use proper indexes', ar: 'ضمان استخدام الاستعلامات للفهارس المناسبة' },
            status: 'pending',
            codeChanges: [
              {
                type: 'jsx',
                file: 'src/hooks/useSolutions.js',
                code: `// Use .order() to leverage indexes
const { data } = await supabase
  .from('solutions')
  .select('*')
  .eq('is_published', true)
  .order('created_at', { ascending: false })
  .limit(20);`
              }
            ]
          }
        ]
      },
      {
        id: 'phase-4',
        name: { en: 'Phase 4: HOOKS', ar: 'المرحلة 4: الخطافات' },
        priority: 'medium',
        estimatedHours: 2,
        fixes: [
          {
            checkId: 'mh-2',
            title: { en: 'Add Optimistic Updates', ar: 'إضافة التحديثات المتفائلة' },
            description: { en: 'Implement optimistic updates for better UX', ar: 'تنفيذ التحديثات المتفائلة لتجربة مستخدم أفضل' },
            status: 'pending',
            codeChanges: [
              {
                type: 'jsx',
                file: 'src/hooks/useSolutions.js',
                code: `const updateSolution = useMutation({
  mutationFn: async ({ id, data }) => {
    const { error } = await supabase
      .from('solutions')
      .update(data)
      .eq('id', id);
    if (error) throw error;
  },
  onMutate: async ({ id, data }) => {
    await queryClient.cancelQueries(['solutions']);
    const previous = queryClient.getQueryData(['solutions']);
    
    queryClient.setQueryData(['solutions'], (old) =>
      old?.map(s => s.id === id ? { ...s, ...data } : s)
    );
    
    return { previous };
  },
  onError: (err, variables, context) => {
    queryClient.setQueryData(['solutions'], context.previous);
    toast.error('Failed to update solution');
  },
  onSettled: () => {
    queryClient.invalidateQueries(['solutions']);
  }
});`
              }
            ]
          }
        ]
      },
      {
        id: 'phase-5',
        name: { en: 'Phase 5: WORKFLOW', ar: 'المرحلة 5: سير العمل' },
        priority: 'high',
        estimatedHours: 4,
        fixes: [
          {
            checkId: 'wf-2',
            title: { en: 'Enforce Stage Transitions', ar: 'فرض انتقالات المراحل' },
            description: { en: 'No enforcement of valid workflow stage transitions', ar: 'لا يوجد فرض لانتقالات مراحل سير العمل الصالحة' },
            status: 'pending',
            codeChanges: [
              {
                type: 'sql',
                file: 'Migration',
                code: `-- Create workflow transition validation
CREATE OR REPLACE FUNCTION validate_solution_stage_transition()
RETURNS TRIGGER AS $$
DECLARE
  valid_transitions JSONB := '{
    "draft": ["submitted"],
    "submitted": ["under_review", "draft"],
    "under_review": ["approved", "rejected", "needs_revision"],
    "needs_revision": ["submitted"],
    "approved": ["published"],
    "rejected": ["draft"],
    "published": ["archived"]
  }'::JSONB;
  allowed_stages TEXT[];
BEGIN
  IF OLD.workflow_stage IS NULL OR OLD.workflow_stage = NEW.workflow_stage THEN
    RETURN NEW;
  END IF;
  
  SELECT ARRAY(SELECT jsonb_array_elements_text(valid_transitions->OLD.workflow_stage))
  INTO allowed_stages;
  
  IF NOT NEW.workflow_stage = ANY(allowed_stages) THEN
    RAISE EXCEPTION 'Invalid stage transition from % to %', 
      OLD.workflow_stage, NEW.workflow_stage;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_solution_stage_transition
  BEFORE UPDATE OF workflow_stage ON solutions
  FOR EACH ROW
  EXECUTE FUNCTION validate_solution_stage_transition();`
              }
            ]
          },
          {
            checkId: 'aw-3',
            title: { en: 'Add SLA Escalation', ar: 'إضافة تصعيد SLA' },
            description: { en: 'No escalation when SLA is exceeded', ar: 'لا يوجد تصعيد عند تجاوز SLA' },
            status: 'pending',
            codeChanges: [
              {
                type: 'sql',
                file: 'Migration',
                code: `-- Create SLA escalation function
CREATE OR REPLACE FUNCTION check_solution_sla_escalation()
RETURNS void AS $$
BEGIN
  -- Update escalation level for overdue approvals
  UPDATE approval_requests
  SET 
    escalation_level = escalation_level + 1,
    updated_at = now()
  WHERE 
    entity_type = 'solution'
    AND approval_status = 'pending'
    AND sla_due_date < now()
    AND escalation_level < 3;
    
  -- Notify escalation managers
  INSERT INTO notifications (user_id, title, message, notification_type)
  SELECT 
    ur.user_id,
    'SLA Escalation',
    'Solution approval request has exceeded SLA',
    'escalation'
  FROM approval_requests ar
  JOIN user_roles ur ON ur.role_id = (
    SELECT id FROM roles WHERE name = 'Admin'
  )
  WHERE ar.entity_type = 'solution'
    AND ar.sla_due_date < now()
    AND ar.escalation_level = 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`
              }
            ]
          }
        ]
      },
      {
        id: 'phase-6',
        name: { en: 'Phase 6: NOTIFICATIONS', ar: 'المرحلة 6: الإشعارات' },
        priority: 'medium',
        estimatedHours: 3,
        fixes: [
          {
            checkId: 'email-1',
            title: { en: 'Add Email Templates', ar: 'إضافة قوالب البريد' },
            description: { en: 'Missing email templates for solution events', ar: 'قوالب البريد مفقودة لأحداث الحلول' },
            status: 'pending',
            codeChanges: [
              {
                type: 'sql',
                file: 'Migration',
                code: `-- Insert solution email templates
INSERT INTO email_templates (name, subject_en, subject_ar, body_en, body_ar, trigger_event) VALUES
('solution_submitted', 
 'Solution Submitted: {{solution_name}}',
 'تم تقديم الحل: {{solution_name}}',
 'Your solution "{{solution_name}}" has been submitted for review.',
 'تم تقديم حلك "{{solution_name}}" للمراجعة.',
 'solution_submitted'),
('solution_approved',
 'Solution Approved: {{solution_name}}',
 'تمت الموافقة على الحل: {{solution_name}}',
 'Congratulations! Your solution "{{solution_name}}" has been approved.',
 'تهانينا! تمت الموافقة على حلك "{{solution_name}}".',
 'solution_approved'),
('solution_rejected',
 'Solution Needs Revision: {{solution_name}}',
 'الحل يحتاج مراجعة: {{solution_name}}',
 'Your solution "{{solution_name}}" requires revisions. Feedback: {{feedback}}',
 'حلك "{{solution_name}}" يحتاج مراجعات. الملاحظات: {{feedback}}',
 'solution_rejected');`
              }
            ]
          },
          {
            checkId: 'email-5',
            title: { en: 'Add Bounce Handling', ar: 'إضافة معالجة الارتداد' },
            description: { en: 'No bounce handling for failed emails', ar: 'لا توجد معالجة للبريد المرتد' },
            status: 'pending',
            codeChanges: [
              {
                type: 'typescript',
                file: 'supabase/functions/handle-email-bounce/index.ts',
                code: `// Document webhook handler for email bounces
// Configure with email provider (SendGrid, Resend, etc.)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  const bounce = await req.json();
  
  // Log bounce event
  await supabase.from('email_logs').update({
    status: 'bounced',
    error_message: bounce.reason
  }).eq('message_id', bounce.messageId);
  
  // Mark user email as invalid if hard bounce
  if (bounce.type === 'hard') {
    await supabase.from('user_profiles').update({
      email_verified: false,
      email_bounce_count: supabase.sql\`email_bounce_count + 1\`
    }).eq('email', bounce.email);
  }
  
  return new Response(JSON.stringify({ success: true }));
});`
              }
            ]
          }
        ]
      },
      {
        id: 'phase-7',
        name: { en: 'Phase 7: AUDIT', ar: 'المرحلة 7: التدقيق' },
        priority: 'high',
        estimatedHours: 4,
        fixes: [
          {
            checkId: 'audit-3',
            title: { en: 'Log Delete Actions', ar: 'تسجيل إجراءات الحذف' },
            description: { en: 'Delete actions not being logged', ar: 'إجراءات الحذف لا يتم تسجيلها' },
            status: 'pending',
            codeChanges: [
              {
                type: 'sql',
                file: 'Migration',
                code: `-- Already covered by solutions_audit_trigger in Phase 2
-- Ensure the trigger includes DELETE operations:

DROP TRIGGER IF EXISTS solutions_audit_trigger ON solutions;
CREATE TRIGGER solutions_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON solutions
  FOR EACH ROW EXECUTE FUNCTION log_solution_changes();`
              }
            ]
          },
          {
            checkId: 'audit-6',
            title: { en: 'Log Sensitive Actions', ar: 'تسجيل الإجراءات الحساسة' },
            description: { en: 'Export and bulk operations not logged', ar: 'عمليات التصدير والجملة لا يتم تسجيلها' },
            status: 'pending',
            codeChanges: [
              {
                type: 'jsx',
                file: 'src/pages/Solutions.jsx',
                code: `const logExport = async (format, count) => {
  await supabase.from('access_logs').insert({
    action: 'export',
    entity_type: 'solution',
    metadata: { format, count, timestamp: new Date().toISOString() }
  });
};

const handleExport = async () => {
  // Export logic...
  await logExport('csv', solutions.length);
};`
              }
            ]
          },
          {
            checkId: 'audit-10',
            title: { en: 'Log Bulk Operations', ar: 'تسجيل العمليات المجمعة' },
            description: { en: 'Bulk update/delete not tracked', ar: 'التحديث/الحذف المجمع غير متتبع' },
            status: 'pending',
            codeChanges: [
              {
                type: 'sql',
                file: 'Migration',
                code: `-- Create function to log bulk operations
CREATE OR REPLACE FUNCTION log_solution_bulk_operation(
  operation_type TEXT,
  solution_ids UUID[],
  performed_by UUID
)
RETURNS void AS $$
BEGIN
  INSERT INTO access_logs (
    action, entity_type, metadata, user_id
  ) VALUES (
    'bulk_' || operation_type,
    'solution',
    jsonb_build_object(
      'solution_ids', solution_ids,
      'count', array_length(solution_ids, 1)
    ),
    performed_by
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`
              }
            ]
          },
          {
            checkId: 'audit-11',
            title: { en: 'Log Data Exports', ar: 'تسجيل تصدير البيانات' },
            description: { en: 'Data export events not tracked', ar: 'أحداث تصدير البيانات غير متتبعة' },
            status: 'pending',
            codeChanges: [
              {
                type: 'sql',
                file: 'Migration',
                code: `-- Create export logging function
CREATE OR REPLACE FUNCTION log_solution_export(
  export_format TEXT,
  record_count INTEGER,
  filter_criteria JSONB,
  performed_by UUID
)
RETURNS void AS $$
BEGIN
  INSERT INTO access_logs (
    action, entity_type, metadata, user_id
  ) VALUES (
    'export',
    'solution',
    jsonb_build_object(
      'format', export_format,
      'count', record_count,
      'filters', filter_criteria,
      'exported_at', now()
    ),
    performed_by
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`
              }
            ]
          },
          {
            checkId: 'audit-14',
            title: { en: 'Define Retention Policy', ar: 'تحديد سياسة الاحتفاظ' },
            description: { en: 'Audit log retention policy not documented', ar: 'سياسة الاحتفاظ بسجل التدقيق غير موثقة' },
            status: 'pending',
            codeChanges: [
              {
                type: 'markdown',
                file: 'docs/solutions/AUDIT_POLICY.md',
                code: `# Solutions Audit Log Retention Policy

## Retention Periods
- **Standard logs**: 2 years
- **Security events**: 7 years
- **Delete operations**: Permanent

## Archival Process
1. Logs older than retention period moved to cold storage
2. Monthly archival job runs on 1st of each month
3. Archived logs compressed and stored in secure bucket

## Access Controls
- Only Admin role can view audit logs
- No user can delete audit records
- Export requires special permission`
              }
            ]
          }
        ]
      },
      {
        id: 'phase-8',
        name: { en: 'Phase 8: UI/UX', ar: 'المرحلة 8: واجهة المستخدم' },
        priority: 'medium',
        estimatedHours: 2,
        fixes: [
          {
            checkId: 'a11y-3',
            title: { en: 'Add Keyboard Navigation', ar: 'إضافة التنقل بلوحة المفاتيح' },
            description: { en: 'View buttons not keyboard accessible', ar: 'أزرار العرض غير قابلة للوصول بلوحة المفاتيح' },
            status: 'pending',
            codeChanges: [
              {
                type: 'jsx',
                file: 'src/pages/Solutions.jsx',
                code: `<Button
  variant="ghost"
  size="sm"
  asChild
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(\`/solutions/\${solution.id}\`);
    }
  }}
  tabIndex={0}
  aria-label={\`View details for \${solution.name_en}\`}
>
  <Link to={\`/solutions/\${solution.id}\`}>
    <Eye className="h-4 w-4" />
  </Link>
</Button>`
              }
            ]
          },
          {
            checkId: 'i18n-4',
            title: { en: 'Add Pluralization', ar: 'إضافة صيغ الجمع' },
            description: { en: 'Counts not properly pluralized', ar: 'الأعداد غير مصاغة بالجمع الصحيح' },
            status: 'pending',
            codeChanges: [
              {
                type: 'jsx',
                file: 'src/pages/Solutions.jsx',
                code: `const pluralize = (count, singular, plural) => {
  return count === 1 ? singular : plural;
};

// Usage
<p>{solutions.length} {t({
  en: pluralize(solutions.length, 'solution', 'solutions'),
  ar: solutions.length === 1 ? 'حل' : solutions.length < 11 ? 'حلول' : 'حل'
})}</p>`
              }
            ]
          }
        ]
      },
      {
        id: 'phase-9',
        name: { en: 'Phase 9: INTEGRATION', ar: 'المرحلة 9: التكامل' },
        priority: 'medium',
        estimatedHours: 3,
        fixes: [
          {
            checkId: 'ext-3',
            title: { en: 'Add Retry Logic', ar: 'إضافة منطق إعادة المحاولة' },
            description: { en: 'No retry for transient API failures', ar: 'لا توجد إعادة محاولة لفشل API المؤقت' },
            status: 'pending',
            codeChanges: [
              {
                type: 'jsx',
                file: 'src/utils/apiRetry.js',
                code: `export const withRetry = async (fn, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx)
      if (error.status >= 400 && error.status < 500) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, delay * attempt));
      }
    }
  }
  
  throw lastError;
};

// Usage in embedding generation
const generateEmbedding = (text) => withRetry(
  () => supabase.functions.invoke('generate-embedding', { body: { text } }),
  3,
  2000
);`
              }
            ]
          },
          {
            checkId: 'stor-5',
            title: { en: 'Cleanup Orphaned Files', ar: 'تنظيف الملفات اليتيمة' },
            description: { en: 'No cleanup for orphaned storage files', ar: 'لا يوجد تنظيف للملفات اليتيمة في التخزين' },
            status: 'pending',
            codeChanges: [
              {
                type: 'sql',
                file: 'Migration',
                code: `-- Create scheduled job to cleanup orphaned files
-- Run weekly via pg_cron or scheduled edge function

CREATE OR REPLACE FUNCTION cleanup_orphaned_solution_files()
RETURNS void AS $$
DECLARE
  orphan RECORD;
BEGIN
  -- Find files not referenced by any solution
  FOR orphan IN 
    SELECT sf.storage_path
    FROM solution_files sf
    LEFT JOIN solutions s ON sf.solution_id = s.id
    WHERE s.id IS NULL
    AND sf.created_at < now() - interval '7 days'
  LOOP
    -- Log cleanup action
    INSERT INTO access_logs (action, entity_type, metadata)
    VALUES ('cleanup', 'solution_file', 
            jsonb_build_object('path', orphan.storage_path));
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`
              }
            ]
          }
        ]
      },
      {
        id: 'phase-10',
        name: { en: 'Phase 10: DOCUMENTATION', ar: 'المرحلة 10: التوثيق' },
        priority: 'low',
        estimatedHours: 6,
        fixes: [
          {
            checkId: 'doc-1',
            title: { en: 'Create README', ar: 'إنشاء README' },
            description: { en: 'Missing setup instructions', ar: 'تعليمات الإعداد مفقودة' },
            status: 'pending',
            codeChanges: [
              {
                type: 'markdown',
                file: 'docs/solutions/README.md',
                code: `# Solutions Hub

## Overview
The Solutions Hub manages innovation solutions from providers.

## Setup
1. Ensure \`solutions\` table exists with proper RLS
2. Configure provider roles
3. Set up email templates

## Features
- Solution CRUD operations
- Workflow stage management
- Challenge matching
- Provider dashboard

## Permissions Required
- \`solution_view\`: View solutions
- \`solution_create\`: Create new solutions
- \`solution_edit\`: Edit solutions
- \`solution_delete\`: Delete solutions`
              }
            ]
          },
          {
            checkId: 'doc-4',
            title: { en: 'Document Schema', ar: 'توثيق المخطط' },
            description: { en: 'Database schema not documented', ar: 'مخطط قاعدة البيانات غير موثق' },
            status: 'pending',
            codeChanges: [
              {
                type: 'markdown',
                file: 'docs/solutions/SCHEMA.md',
                code: `# Solutions Database Schema

## Tables

### solutions
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name_en | TEXT | English name |
| name_ar | TEXT | Arabic name |
| provider_id | UUID | FK to providers |
| sector_id | UUID | FK to sectors |
| workflow_stage | TEXT | Current stage |
| trl | INTEGER | Technology Readiness Level (1-9) |
| maturity_level | TEXT | Solution maturity |
| is_published | BOOLEAN | Public visibility |

### Related Tables
- \`solution_version_history\`
- \`challenge_solution_matches\`
- \`solution_evaluations\``
              }
            ]
          },
          {
            checkId: 'doc-5',
            title: { en: 'Add Workflow Diagrams', ar: 'إضافة مخططات سير العمل' },
            description: { en: 'Missing workflow diagrams', ar: 'مخططات سير العمل مفقودة' },
            status: 'pending',
            codeChanges: [
              {
                type: 'markdown',
                file: 'docs/solutions/WORKFLOWS.md',
                code: `# Solution Workflows

## Stage Transitions
\`\`\`mermaid
stateDiagram-v2
    [*] --> draft
    draft --> submitted: Submit for review
    submitted --> under_review: Reviewer assigned
    submitted --> draft: Withdrawn
    under_review --> approved: Passes review
    under_review --> rejected: Fails review
    under_review --> needs_revision: Requires changes
    needs_revision --> submitted: Resubmit
    approved --> published: Publish
    rejected --> draft: Revise and retry
    published --> archived: Archive
    archived --> [*]
\`\`\``
              }
            ]
          },
          {
            checkId: 'doc-6',
            title: { en: 'Document Permissions', ar: 'توثيق الأذونات' },
            description: { en: 'Permission matrix not documented', ar: 'مصفوفة الأذونات غير موثقة' },
            status: 'pending',
            codeChanges: [
              {
                type: 'markdown',
                file: 'docs/solutions/PERMISSIONS.md',
                code: `# Solutions Permission Matrix

| Role | View | Create | Edit | Delete | Publish |
|------|------|--------|------|--------|---------|
| Admin | ✅ All | ✅ | ✅ All | ✅ All | ✅ |
| Provider | ✅ Own + Published | ✅ | ✅ Own | ✅ Own (draft) | ❌ |
| Staff | ✅ Sector | ❌ | ❌ | ❌ | ✅ Sector |
| Public | ✅ Published | ❌ | ❌ | ❌ | ❌ |`
              }
            ]
          },
          {
            checkId: 'doc-2',
            title: { en: 'Add API Docs', ar: 'إضافة توثيق API' },
            description: { en: 'API documentation missing', ar: 'توثيق API مفقود' },
            status: 'pending',
            codeChanges: [
              {
                type: 'markdown',
                file: 'docs/solutions/API.md',
                code: `# Solutions API

## Endpoints

### GET /solutions
List all accessible solutions.

**Query Parameters:**
- \`sector_id\`: Filter by sector
- \`maturity_level\`: Filter by maturity
- \`workflow_stage\`: Filter by stage

### POST /solutions
Create a new solution.

### GET /solutions/:id
Get solution details.

### PATCH /solutions/:id
Update solution.

### DELETE /solutions/:id
Delete solution (draft only).`
              }
            ]
          },
          {
            checkId: 'doc-3',
            title: { en: 'Document Components', ar: 'توثيق المكونات' },
            description: { en: 'Component documentation missing', ar: 'توثيق المكونات مفقود' },
            status: 'pending',
            codeChanges: [
              {
                type: 'markdown',
                file: 'docs/solutions/COMPONENTS.md',
                code: `# Solutions Components

## Pages
- \`Solutions.jsx\` - List view
- \`SolutionDetail.jsx\` - Detail view
- \`SolutionCreate.jsx\` - Create form

## Components
- \`SolutionCard.jsx\` - Card display
- \`SolutionCreateWizard.jsx\` - Multi-step form
- \`SolutionFilters.jsx\` - Filter controls

## Hooks
- \`useSolutions.js\` - CRUD operations
- \`useSolutionsWithVisibility.js\` - Visibility rules`
              }
            ]
          }
        ]
      }
    ]
  }
};

// Helper to get plan by system ID
export const getImplementationPlan = (systemId) => {
  return IMPLEMENTATION_PLANS[systemId] || null;
};

// Helper to calculate plan summary
export const getPlanSummary = (plan) => {
  if (!plan) return null;
  
  let totalFixes = 0;
  let completedFixes = 0;
  let criticalFixes = 0;
  let criticalCompleted = 0;
  let totalHours = 0;
  
  plan.phases.forEach(phase => {
    totalHours += phase.estimatedHours;
    phase.fixes.forEach(fix => {
      totalFixes++;
      if (fix.status === 'completed') completedFixes++;
      if (phase.priority === 'critical') {
        criticalFixes++;
        if (fix.status === 'completed') criticalCompleted++;
      }
    });
  });
  
  return {
    totalFixes,
    completedFixes,
    criticalFixes,
    criticalCompleted,
    totalHours,
    progress: totalFixes > 0 ? Math.round((completedFixes / totalFixes) * 100) : 0
  };
};
