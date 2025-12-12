/**
 * Regions Tab Component for Data Management Hub
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { EntityTable } from './EntityTable';

export function RegionsTab({ regions, onEdit, onDelete, onAdd }) {
  const { t } = useLanguage();

  const columns = [
    { key: 'code', label: { en: 'Code', ar: 'الرمز' } },
    { key: 'name_en', label: { en: 'Name (EN)', ar: 'الاسم (EN)' } },
    { key: 'name_ar', label: { en: 'Name (AR)', ar: 'الاسم (AR)' } },
    { 
      key: 'population', 
      label: { en: 'Population', ar: 'السكان' },
      render: (item) => item.population ? `${(item.population / 1000000).toFixed(1)}M` : '-'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          {t({ en: 'Regions Management', ar: 'إدارة المناطق' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <EntityTable
          data={regions}
          entity="Region"
          columns={columns}
          onEdit={onEdit}
          onDelete={onDelete}
          onAdd={() => onAdd('Region')}
        />
      </CardContent>
    </Card>
  );
}

export default RegionsTab;
