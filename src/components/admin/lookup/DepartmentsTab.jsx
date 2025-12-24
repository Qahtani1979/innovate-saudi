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

export default function DepartmentsTab() {
  const { isRTL, t } = useLanguage();
  // queryClient removed
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const { data: departments = [] } = useLookupData({
    tableName: 'lookup_departments',
    queryKey: ['lookup-departments-admin'],
    sortColumn: 'display_order'
  });

  const { saveMutation, deleteMutation } = useLookupMutations({
    tableName: 'lookup_departments',
    queryKey: ['lookup-departments-admin'],
    entityName: { en: 'Department', ar: 'القسم' }
  });

  // Wrapper for save success to close dialog
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
