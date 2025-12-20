import { useState } from 'react';
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

export default function SpecializationsTab() {
  const { isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const { data: specializations = [], isLoading } = useQuery({
    queryKey: ['lookup-specializations-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lookup_specializations')
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
          .from('lookup_specializations')
          .update(data)
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('lookup_specializations')
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['lookup-specializations-admin']);
      toast.success(t({ en: 'Specialization saved', ar: 'تم حفظ التخصص' }));
      setDialogOpen(false);
    },
    onError: () => toast.error(t({ en: 'Failed to save', ar: 'فشل في الحفظ' }))
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('lookup_specializations').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['lookup-specializations-admin']);
      toast.success(t({ en: 'Specialization deleted', ar: 'تم حذف التخصص' }));
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

  const filteredItems = filterBySearchTerm(specializations, searchTerm);

  const headers = [
    { label: t({ en: 'Name (EN)', ar: 'الاسم (إنجليزي)' }) },
    { label: t({ en: 'Name (AR)', ar: 'الاسم (عربي)' }) },
    { label: t({ en: 'Category', ar: 'الفئة' }) },
    { label: t({ en: 'Status', ar: 'الحالة' }) },
    { label: t({ en: 'Actions', ar: 'الإجراءات' }), align: 'right' }
  ];

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <LookupTableCard
        title={t({ en: 'Manage Specializations', ar: 'إدارة التخصصات' })}
        onAdd={handleCreate}
        addLabel={t({ en: 'Add Specialization', ar: 'إضافة تخصص' })}
        addButtonClass="bg-teal-600 hover:bg-teal-700"
      >
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder={t({ en: 'Search specializations...', ar: 'بحث في التخصصات...' })}
        />
        
        <LookupTable headers={headers}>
          {filteredItems.map((spec) => (
            <LookupTableRow key={spec.id}>
              <LookupTableCell>{spec.name_en}</LookupTableCell>
              <LookupTableCell dir="rtl">{spec.name_ar}</LookupTableCell>
              <LookupTableCell>
                <Badge variant="outline">{spec.category}</Badge>
              </LookupTableCell>
              <LookupTableCell>
                <StatusBadge
                  isActive={spec.is_active}
                  activeLabel={t({ en: 'Active', ar: 'نشط' })}
                  inactiveLabel={t({ en: 'Inactive', ar: 'غير نشط' })}
                />
              </LookupTableCell>
              <LookupTableCell align="right">
                <ActionButtons
                  onEdit={() => handleEdit(spec)}
                  onDelete={() => deleteMutation.mutate(spec.id)}
                />
              </LookupTableCell>
            </LookupTableRow>
          ))}
        </LookupTable>
      </LookupTableCard>

      <LookupItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        type="specialization"
        item={editingItem}
        onSave={handleSave}
        isSaving={saveMutation.isPending}
      />
    </div>
  );
}
