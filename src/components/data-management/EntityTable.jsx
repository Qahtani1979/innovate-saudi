/**
 * Reusable Entity Table Component for Data Management Hub
 */
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from '@/components/LanguageContext';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function EntityTable({ data, entity, columns, onEdit, onDelete, onAdd, filters }) {
  const { language, isRTL, t } = useLanguage();
  const [localSearch, setLocalSearch] = useState('');
  const [localFilters, setLocalFilters] = useState({});

  const filtered = data.filter(item => {
    const searchMatch = !localSearch || Object.values(item).some(val =>
      String(val).toLowerCase().includes(localSearch.toLowerCase())
    );

    const filtersMatch = !filters || filters.every(filter => {
      const filterValue = localFilters[filter.key];
      if (!filterValue || filterValue === 'all') return true;
      
      if (filter.key === 'region_id') {
        return item.region_id === filterValue;
      }
      if (filter.key === 'org_type') {
        return item.org_type === filterValue;
      }
      if (filter.key === 'is_active') {
        return item.is_active === (filterValue === 'true');
      }
      if (filter.key === 'municipality_type') {
        return item.municipality_type === filterValue;
      }
      return true;
    });

    return searchMatch && filtersMatch;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
          <Input
            placeholder={t({ en: 'Search...', ar: 'بحث...' })}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className={isRTL ? 'pr-10' : 'pl-10'}
          />
        </div>

        {filters?.map(filter => (
          <Select
            key={filter.key}
            value={localFilters[filter.key] || 'all'}
            onValueChange={(val) => setLocalFilters({...localFilters, [filter.key]: val})}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={filter.label[language]} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t({ en: 'All', ar: 'الكل' })}</SelectItem>
              {filter.options.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

        {onAdd && (
          <Button onClick={onAdd} className="bg-gradient-to-r from-blue-600 to-teal-600">
            <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t({ en: 'Add New', ar: 'إضافة جديد' })}
          </Button>
        )}
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              {columns.map(col => (
                <th key={col.key} className="text-left px-4 py-3 text-sm font-medium text-foreground">
                  {col.label[language]}
                </th>
              ))}
              <th className="text-right px-4 py-3 text-sm font-medium text-foreground">
                {t({ en: 'Actions', ar: 'الإجراءات' })}
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="border-b hover:bg-muted/30">
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3 text-sm text-foreground">
                    {col.render ? col.render(item) : item[col.key]}
                  </td>
                ))}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(entity, item)}
                      className="hover:bg-blue-50"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm(t({ en: 'Delete this item?', ar: 'حذف هذا العنصر؟' }))) {
                          onDelete(entity, item.id);
                        }
                      }}
                      className="hover:bg-red-50 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-muted-foreground text-center">
        {t({ en: `${filtered.length} of ${data.length} items`, ar: `${filtered.length} من ${data.length} عنصر` })}
      </p>
    </div>
  );
}

export default EntityTable;
