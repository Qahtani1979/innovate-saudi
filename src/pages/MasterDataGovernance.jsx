import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Database, Shield, CheckCircle2, AlertTriangle } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function MasterDataGovernance() {
  const { language, isRTL, t } = useLanguage();

  const { data: regions = [] } = useQuery({
    queryKey: ['regions-governance'],
    queryFn: () => base44.entities.Region.list()
  });

  const { data: cities = [] } = useQuery({
    queryKey: ['cities-governance'],
    queryFn: () => base44.entities.City.list()
  });

  const { data: sectors = [] } = useQuery({
    queryKey: ['sectors-governance'],
    queryFn: () => base44.entities.Sector.list()
  });

  const { data: organizations = [] } = useQuery({
    queryKey: ['orgs-governance'],
    queryFn: () => base44.entities.Organization.list()
  });

  const masterData = [
    { name: { en: 'Regions', ar: 'المناطق' }, count: regions.length, entity: 'Region' },
    { name: { en: 'Cities', ar: 'المدن' }, count: cities.length, entity: 'City' },
    { name: { en: 'Sectors', ar: 'القطاعات' }, count: sectors.length, entity: 'Sector' },
    { name: { en: 'Organizations', ar: 'المنظمات' }, count: organizations.length, entity: 'Organization' }
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          {t({ en: 'Master Data Governance', ar: 'حوكمة البيانات الرئيسية' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Manage reference data and taxonomies', ar: 'إدارة البيانات المرجعية والتصنيفات' })}
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {masterData.map((item, idx) => (
          <Card key={idx} className="bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="pt-6 text-center">
              <Database className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-blue-600">{item.count}</p>
              <p className="text-sm text-slate-600">{item.name[language]}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Master Data Entities */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Master Data Entities', ar: 'كيانات البيانات الرئيسية' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {masterData.map((item, idx) => (
            <div key={idx} className="p-4 border-2 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-slate-900">{item.name[language]}</h4>
                  <p className="text-sm text-slate-600">{item.count} {t({ en: 'records', ar: 'سجل' })}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  {t({ en: 'View', ar: 'عرض' })}
                </Button>
                <Button variant="outline" size="sm">
                  {t({ en: 'Edit', ar: 'تحرير' })}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(MasterDataGovernance, { requireAdmin: true });