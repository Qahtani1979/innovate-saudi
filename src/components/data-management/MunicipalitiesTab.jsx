/**
 * Municipalities Tab Component for Data Management Hub
 */
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Landmark } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { EntityTable } from './EntityTable';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export function MunicipalitiesTab({ regions, onEdit, onDelete, onAdd }) {
  const { language, t } = useLanguage();

  const { data: municipalities = [], isLoading } = useQuery({
    queryKey: ['municipalities-management'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('municipalities')
        .select('*')
        .order('name_en');
      if (error) throw error;
      return data || [];
    }
  });

  const columns = [
    { 
      key: 'name_en', 
      label: { en: 'Name (EN)', ar: 'الاسم (EN)' },
      render: (item) => (
        <Link 
          to={createPageUrl(`MunicipalityProfile?id=${item.id}`)} 
          className="text-blue-600 hover:underline font-medium"
        >
          {item.name_en}
        </Link>
      )
    },
    { key: 'name_ar', label: { en: 'Name (AR)', ar: 'الاسم (AR)' } },
    {
      key: 'region_id',
      label: { en: 'Region', ar: 'المنطقة' },
      render: (item) => {
        const region = regions.find(r => r.id === item.region_id);
        return region?.name_en || '-';
      }
    },
    {
      key: 'municipality_type',
      label: { en: 'Type', ar: 'النوع' },
      render: (item) => (
        <Badge variant="outline" className="capitalize">
          {item.municipality_type?.replace(/_/g, ' ') || 'Standard'}
        </Badge>
      )
    },
    { 
      key: 'population', 
      label: { en: 'Population', ar: 'السكان' },
      render: (item) => item.population ? `${(item.population / 1000).toFixed(0)}K` : '-'
    },
    {
      key: 'mii_score',
      label: { en: 'MII Score', ar: 'درجة MII' },
      render: (item) => {
        if (!item.mii_score) return '-';
        const color = item.mii_score >= 80 ? 'bg-green-100 text-green-700' :
                      item.mii_score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700';
        return <Badge className={color}>{item.mii_score}%</Badge>;
      }
    },
    {
      key: 'is_active',
      label: { en: 'Status', ar: 'الحالة' },
      render: (item) => item.is_active !== false ?
        <Badge className="bg-green-100 text-green-700">{t({ en: 'Active', ar: 'نشط' })}</Badge> :
        <Badge variant="outline">{t({ en: 'Inactive', ar: 'غير نشط' })}</Badge>
    },
  ];

  const municipalityTypes = [
    { value: 'national', label: t({ en: 'National', ar: 'وطنية' }) },
    { value: 'regional', label: t({ en: 'Regional', ar: 'إقليمية' }) },
    { value: 'city', label: t({ en: 'City', ar: 'مدينة' }) },
    { value: 'district', label: t({ en: 'District', ar: 'بلدية فرعية' }) },
  ];

  const filters = [
    {
      key: 'region_id',
      label: { en: 'Region', ar: 'المنطقة' },
      options: regions.map(r => ({ value: r.id, label: r.name_en }))
    },
    {
      key: 'municipality_type',
      label: { en: 'Type', ar: 'النوع' },
      options: municipalityTypes
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Landmark className="h-5 w-5 text-amber-600" />
          {t({ en: 'Municipalities Management', ar: 'إدارة البلديات' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <EntityTable
          data={municipalities}
          entity="Municipality"
          columns={columns}
          filters={filters}
          onEdit={onEdit}
          onDelete={onDelete}
          onAdd={() => onAdd('Municipality')}
        />
      </CardContent>
    </Card>
  );
}

export default MunicipalitiesTab;
