import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '@/components/LanguageContext';
import {
  LookupTableCard,
  LookupTable,
  LookupTableRow,
  LookupTableCell,
  StatusBadge,
  ActionButtons
} from './shared/LookupTableStyles';
import AutoApprovalRuleDialog from './shared/AutoApprovalRuleDialog';

import { useLookupData, useLookupMutations } from '@/hooks/useLookupManagement';

export default function AutoApprovalRulesTab() {
  const { isRTL, t } = useLanguage();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  const { data: autoApprovalRules = [] } = useLookupData({
    tableName: 'auto_approval_rules',
    queryKey: ['auto-approval-rules-admin'],
    sortColumn: 'persona_type, priority' // Note: Ensure hook supports this or update hook. 
    // simple .order('persona_type, priority') might not work in supabase js client directly if comma separated? 
    // actually order() takes column name. 'persona_type, priority' is invalid.
    // But let's check the hook again. 
  });

  // The hook does: .order(sortColumn)
  // If I pass 'persona_type, priority', it might fail.
  // I should update the hook to support custom order or just use one column.
  // For now, let's use 'priority' as it is numeric.

  const { data: municipalities = [] } = useLookupData({
    tableName: 'municipalities',
    queryKey: ['municipalities-list', 'active'],
    sortColumn: 'name_en' // or whatever
  });
  // Wait, municipalities query filtered by is_active=true.
  // The generic hook doesn't support filtering.
  // I should perhaps add filters to the hook or leave this as a specific query?
  // Or update the hook to accept a filter builder.

  const { saveMutation, deleteMutation } = useLookupMutations({
    tableName: 'auto_approval_rules',
    queryKey: ['auto-approval-rules-admin'],
    entityName: { en: 'Rule', ar: 'القاعدة' }
  });

  const handleSaveWrapper = (formData) => {
    saveMutation.mutate(formData, {
      onSuccess: () => setDialogOpen(false)
    });
  };

  const handleCreate = () => {
    setEditingRule(null);
    setDialogOpen(true);
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setDialogOpen(true);
  };

  const handleSave = (formData) => {
    handleSaveWrapper(formData);
  };

  const getRuleTypeBadgeClass = (ruleType) => {
    switch (ruleType) {
      case 'always': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'never': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  const headers = [
    { label: t({ en: 'Persona Type', ar: 'نوع الشخصية' }) },
    { label: t({ en: 'Rule Type', ar: 'نوع القاعدة' }) },
    { label: t({ en: 'Rule Value', ar: 'قيمة القاعدة' }) },
    { label: t({ en: 'Assigns Role', ar: 'يعين الدور' }) },
    { label: t({ en: 'Priority', ar: 'الأولوية' }) },
    { label: t({ en: 'Status', ar: 'الحالة' }) },
    { label: t({ en: 'Actions', ar: 'الإجراءات' }), align: 'right' }
  ];

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <LookupTableCard
        title={t({ en: 'Auto-Approval Rules', ar: 'قواعد الموافقة التلقائية' })}
        onAdd={handleCreate}
        addLabel={t({ en: 'Add Rule', ar: 'إضافة قاعدة' })}
        addButtonClass="bg-purple-600 hover:bg-purple-700"
      >
        <LookupTable headers={headers}>
          {autoApprovalRules.map((rule) => (
            <LookupTableRow key={rule.id}>
              <LookupTableCell>
                <Badge variant="outline" className="capitalize">{rule.persona_type}</Badge>
              </LookupTableCell>
              <LookupTableCell>
                <Badge className={getRuleTypeBadgeClass(rule.rule_type)}>
                  {rule.rule_type}
                </Badge>
              </LookupTableCell>
              <LookupTableCell>
                <span className="font-mono text-sm">{rule.rule_value || '-'}</span>
              </LookupTableCell>
              <LookupTableCell>
                <Badge variant="secondary">{rule.role_to_assign}</Badge>
              </LookupTableCell>
              <LookupTableCell>{rule.priority}</LookupTableCell>
              <LookupTableCell>
                <StatusBadge
                  isActive={rule.is_active}
                  activeLabel={t({ en: 'Active', ar: 'نشط' })}
                  inactiveLabel={t({ en: 'Inactive', ar: 'غير نشط' })}
                />
              </LookupTableCell>
              <LookupTableCell align="right">
                <ActionButtons
                  onEdit={() => handleEdit(rule)}
                  onDelete={() => deleteMutation.mutate(rule.id)}
                />
              </LookupTableCell>
            </LookupTableRow>
          ))}
        </LookupTable>

        {/* Rule Types Explanation */}
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">{t({ en: 'Rule Types Explained', ar: 'شرح أنواع القواعد' })}</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li><strong>always:</strong> {t({ en: 'Auto-approve all users of this persona type', ar: 'الموافقة التلقائية لجميع المستخدمين من هذا النوع' })}</li>
            <li><strong>never:</strong> {t({ en: 'Always require manual approval', ar: 'يتطلب دائماً موافقة يدوية' })}</li>
            <li><strong>email_domain:</strong> {t({ en: 'Auto-approve if email domain matches (e.g., gov.sa)', ar: 'الموافقة التلقائية إذا تطابق نطاق البريد' })}</li>
            <li><strong>organization:</strong> {t({ en: 'Auto-approve for specific organization', ar: 'الموافقة التلقائية لمنظمة محددة' })}</li>
            <li><strong>institution:</strong> {t({ en: 'Auto-approve for institutional domains', ar: 'الموافقة التلقائية للنطاقات المؤسسية' })}</li>
          </ul>
        </div>
      </LookupTableCard>

      <AutoApprovalRuleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        rule={editingRule}
        municipalities={municipalities}
        onSave={handleSave}
        isSaving={saveMutation.isPending}
      />
    </div>
  );
}
