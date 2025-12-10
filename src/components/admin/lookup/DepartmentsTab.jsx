import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '@/components/LanguageContext';
import { toast } from 'sonner';
import {
  LookupTableCard,
  SearchInput,
  LookupTable,
  LookupTableRow,
  LookupTableCell,
  StatusBadge,
  ActionButtons,
  filterBySearchTerm
} from './shared/LookupTableStyles';
import LookupItemDialog from './shared/LookupItemDialog';

export default function DepartmentsTab() {
  const { isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ['lookup-departments-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lookup_departments')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data || [];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (data.id) {
        const { error } = await supabase
          .from('lookup_departments')
          .update(data)
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('lookup_departments')
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['lookup-departments-admin']);
      toast.success(t({ en: 'Department saved', ar: 'تم حفظ القسم' }));
      setDialogOpen(false);
    },
    onError: () => toast.error(t({ en: 'Failed to save', ar: 'فشل في الحفظ' }))
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('lookup_departments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['lookup-departments-admin']);
      toast.success(t({ en: 'Department deleted', ar: 'تم حذف القسم' }));
    },
    onError: () => toast.error(t({ en: 'Failed to delete', ar: 'فشل في الحذف' }))
  });

  const handleCreate = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleSave = (formData) => {
    saveMutation.mutate(formData);
  };

  const filteredItems = filterBySearchTerm(departments, searchTerm);

  const headers = [
    { label: t({ en: 'Name (EN)', ar: 'الاسم (إنجليزي)' }) },
    { label: t({ en: 'Name (AR)', ar: 'الاسم (عربي)' }) },
    { label: t({ en: 'Code', ar: 'الرمز' }) },
    { label: t({ en: 'Order', ar: 'الترتيب' }) },
    { label: t({ en: 'Status', ar: 'الحالة' }) },
    { label: t({ en: 'Actions', ar: 'الإجراءات' }), align: 'right' }
  ];

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <LookupTableCard
        title={t({ en: 'Manage Departments', ar: 'إدارة الأقسام' })}
        onAdd={handleCreate}
        addLabel={t({ en: 'Add Department', ar: 'إضافة قسم' })}
        addButtonClass="bg-blue-600 hover:bg-blue-700"
      >
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder={t({ en: 'Search departments...', ar: 'بحث في الأقسام...' })}
        />
        
        <LookupTable headers={headers}>
          {filteredItems.map((dept) => (
            <LookupTableRow key={dept.id}>
              <LookupTableCell>{dept.name_en}</LookupTableCell>
              <LookupTableCell dir="rtl">{dept.name_ar}</LookupTableCell>
              <LookupTableCell>
                <Badge variant="outline">{dept.code}</Badge>
              </LookupTableCell>
              <LookupTableCell>{dept.display_order}</LookupTableCell>
              <LookupTableCell>
                <StatusBadge
                  isActive={dept.is_active}
                  activeLabel={t({ en: 'Active', ar: 'نشط' })}
                  inactiveLabel={t({ en: 'Inactive', ar: 'غير نشط' })}
                />
              </LookupTableCell>
              <LookupTableCell align="right">
                <ActionButtons
                  onEdit={() => handleEdit(dept)}
                  onDelete={() => deleteMutation.mutate(dept.id)}
                />
              </LookupTableCell>
            </LookupTableRow>
          ))}
        </LookupTable>
      </LookupTableCard>

      <LookupItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        type="department"
        item={editingItem}
        onSave={handleSave}
        isSaving={saveMutation.isPending}
      />
    </div>
  );
}
