import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '@/components/LanguageContext';
import { toast } from 'sonner';
import {
  LookupTableCard,
  LookupTable,
  LookupTableRow,
  LookupTableCell,
  StatusBadge,
  ActionButtons
} from './shared/LookupTableStyles';
import AutoApprovalRuleDialog from './shared/AutoApprovalRuleDialog';

export default function AutoApprovalRulesTab() {
  const { isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  const { data: autoApprovalRules = [], isLoading } = useQuery({
    queryKey: ['auto-approval-rules-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('auto_approval_rules')
        .select('*')
        .order('persona_type, priority');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: municipalities = [] } = useQuery({
    queryKey: ['municipalities-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('municipalities')
        .select('id, name_en, name_ar')
        .eq('is_active', true);
      if (error) throw error;
      return data || [];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (data.id) {
        const { error } = await supabase
          .from('auto_approval_rules')
          .update(data)
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('auto_approval_rules')
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['auto-approval-rules-admin']);
      toast.success(t({ en: 'Rule saved', ar: 'تم حفظ القاعدة' }));
      setDialogOpen(false);
    },
    onError: () => toast.error(t({ en: 'Failed to save', ar: 'فشل في الحفظ' }))
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('auto_approval_rules').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['auto-approval-rules-admin']);
      toast.success(t({ en: 'Rule deleted', ar: 'تم حذف القاعدة' }));
    },
    onError: () => toast.error(t({ en: 'Failed to delete', ar: 'فشل في الحذف' }))
  });

  const handleCreate = () => {
    setEditingRule(null);
    setDialogOpen(true);
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setDialogOpen(true);
  };

  const handleSave = (formData) => {
    saveMutation.mutate(formData);
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
