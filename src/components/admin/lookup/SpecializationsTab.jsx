import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '@/components/LanguageContext';
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

import { useLookupData, useLookupMutations } from '@/hooks/useLookupManagement';

export default function SpecializationsTab() {
  const { isRTL, t } = useLanguage();
  // queryClient removed
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const { data: specializations = [], isLoading } = useLookupData({
    tableName: 'lookup_specializations',
    queryKey: ['lookup-specializations-admin'],
    sortColumn: 'display_order'
  });

  const { saveMutation, deleteMutation } = useLookupMutations({
    tableName: 'lookup_specializations',
    queryKey: ['lookup-specializations-admin'],
    entityName: { en: 'Specialization', ar: 'التخصص' }
  });

  const handleSaveWrapper = (formData) => {
    saveMutation.mutate(formData, {
      onSuccess: () => setDialogOpen(false)
    });
  };

  const handleCreate = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleSave = (formData) => {
    handleSaveWrapper(formData);
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
