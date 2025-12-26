import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2 } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { EntityTable } from './EntityTable';
import { useMinistries } from '@/hooks/useMinistries';

export function MinistriesTab({ sectors = [], onEdit, onDelete, onAdd }) {
  const { language, t } = useLanguage();

  const { data: ministries = [], isLoading, error } = useMinistries({
    includeInactive: true
  });

  const columns = [
    {
      key: 'name_en',
      label: { en: 'Name (EN)', ar: 'الاسم (EN)' },
      render: (item) => (
        <span className="font-medium text-foreground">{item.name_en}</span>
      )
    },
    { key: 'name_ar', label: { en: 'Name (AR)', ar: 'الاسم (AR)' } },
    { key: 'code', label: { en: 'Code', ar: 'الرمز' } },
    {
      key: 'sector_id',
      label: { en: 'Sector', ar: 'القطاع' },
      render: (item) => {
        const sector = sectors.find(s => s.id === item.sector_id);
        return sector?.name_en || '-';
      }
    },
    {
      key: 'website',
      label: { en: 'Website', ar: 'الموقع' },
      render: (item) => item.website ? (
        <a href={item.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          {new URL(item.website).hostname}
        </a>
      ) : '-'
    },
    {
      key: 'is_active',
      label: { en: 'Status', ar: 'الحالة' },
      render: (item) => item.is_active !== false ?
        <Badge className="bg-green-100 text-green-700">{t({ en: 'Active', ar: 'نشط' })}</Badge> :
        <Badge variant="outline">{t({ en: 'Inactive', ar: 'غير نشط' })}</Badge>
    },
  ];

  const filters = [
    {
      key: 'sector_id',
      label: { en: 'Sector', ar: 'القطاع' },
      options: sectors.map(s => ({ value: s.id, label: s.name_en }))
    },
    {
      key: 'is_active',
      label: { en: 'Status', ar: 'الحالة' },
      options: [
        { value: 'true', label: t({ en: 'Active', ar: 'نشط' }) },
        { value: 'false', label: t({ en: 'Inactive', ar: 'غير نشط' }) }
      ]
    }
  ];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center text-destructive">
            <p>Error loading ministries: {error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-purple-600" />
          {t({ en: 'Ministries Management', ar: 'إدارة الوزارات' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <EntityTable
          data={ministries}
          entity="Ministry"
          columns={columns}
          filters={filters}
          onEdit={onEdit}
          onDelete={onDelete}
          onAdd={() => onAdd('Ministry')}
        />
      </CardContent>
    </Card>
  );
}

export default MinistriesTab;
