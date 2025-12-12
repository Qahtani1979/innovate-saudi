/**
 * Cities Tab Component for Data Management Hub
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { EntityTable } from './EntityTable';

export function CitiesTab({ cities, regions, onEdit, onDelete, onAdd }) {
  const { t } = useLanguage();

  const columns = [
    { key: 'name_en', label: { en: 'Name (EN)', ar: 'الاسم (EN)' } },
    { key: 'name_ar', label: { en: 'Name (AR)', ar: 'الاسم (AR)' } },
    {
      key: 'region_id',
      label: { en: 'Region', ar: 'المنطقة' },
      render: (item) => {
        const region = regions.find(r => r.id === item.region_id);
        return region?.name_en || item.region_id;
      }
    },
    { 
      key: 'population', 
      label: { en: 'Population', ar: 'السكان' },
      render: (item) => item.population ? `${(item.population / 1000).toFixed(0)}K` : '-'
    },
  ];

  const filters = [
    {
      key: 'region_id',
      label: { en: 'Region', ar: 'المنطقة' },
      options: regions.map(r => ({ value: r.id, label: r.name_en }))
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-teal-600" />
          {t({ en: 'Cities Management', ar: 'إدارة المدن' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <EntityTable
          data={cities}
          entity="City"
          columns={columns}
          filters={filters}
          onEdit={onEdit}
          onDelete={onDelete}
          onAdd={() => onAdd('City')}
        />
      </CardContent>
    </Card>
  );
}

export default CitiesTab;
