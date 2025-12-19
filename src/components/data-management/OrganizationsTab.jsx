/**
 * Organizations Tab Component for Data Management Hub
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2 } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { EntityTable } from './EntityTable';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export function OrganizationsTab({ organizations, isLoading, error, onEdit, onDelete, onAdd, calculateDataScore }) {
  const { t } = useLanguage();

  const columns = [
    {
      key: 'name_en',
      label: { en: 'Name (EN)', ar: 'الاسم (EN)' },
      render: (item) => (
        <Link to={createPageUrl(`OrganizationDetail?id=${item.id}`)} className="text-blue-600 hover:underline">
          {item.name_en}
        </Link>
      )
    },
    { key: 'name_ar', label: { en: 'Name (AR)', ar: 'الاسم (AR)' } },
    {
      key: 'org_type',
      label: { en: 'Type', ar: 'النوع' },
      render: (item) => {
        const orgType = item.org_type || item.type;
        return <Badge variant="outline">{orgType?.replace(/_/g, ' ') || '-'}</Badge>;
      }
    },
    {
      key: 'data_score',
      label: { en: 'Data Score', ar: 'درجة البيانات' },
      render: (item) => {
        const score = calculateDataScore?.(item) || 0;
        const color = score >= 80 ? 'bg-green-100 text-green-700' :
                      score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700';
        return <Badge className={color}>{score}%</Badge>;
      }
    },
    {
      key: 'is_active',
      label: { en: 'Status', ar: 'الحالة' },
      render: (item) => item.is_active ?
        <Badge className="bg-green-100 text-green-700">Active</Badge> :
        <Badge variant="outline">Inactive</Badge>
    },
  ];

  const filters = [
    {
      key: 'org_type',
      label: { en: 'Type', ar: 'النوع' },
      options: [
        { value: 'ministry', label: 'Ministry' },
        { value: 'municipality', label: 'Municipality' },
        { value: 'agency', label: 'Agency' },
        { value: 'university', label: 'University' },
        { value: 'research_center', label: 'Research Center' },
        { value: 'company', label: 'Company' },
        { value: 'startup', label: 'Startup' },
        { value: 'sme', label: 'SME' },
        { value: 'ngo', label: 'NGO' },
        { value: 'international_org', label: 'International Org' }
      ]
    },
    {
      key: 'is_active',
      label: { en: 'Status', ar: 'الحالة' },
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' }
      ]
    }
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-purple-600" />
            {t({ en: 'Organizations Management', ar: 'إدارة المنظمات' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Building2 className="h-5 w-5" />
            {t({ en: 'Error Loading Organizations', ar: 'خطأ في تحميل المنظمات' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error.message || 'Unknown error'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-purple-600" />
          {t({ en: 'Organizations Management', ar: 'إدارة المنظمات' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <EntityTable
          data={organizations}
          entity="Organization"
          columns={columns}
          filters={filters}
          onEdit={onEdit}
          onDelete={onDelete}
          onAdd={() => onAdd('Organization')}
        />
      </CardContent>
    </Card>
  );
}

export default OrganizationsTab;
