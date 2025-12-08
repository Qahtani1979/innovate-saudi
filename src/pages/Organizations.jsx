import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLanguage } from '../components/LanguageContext';
import { Building2, Search, Plus, MapPin, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { usePermissions } from '../components/permissions/usePermissions';
import ProtectedPage from '../components/permissions/ProtectedPage';

function Organizations() {
  const { hasPermission } = usePermissions();
  const { language, isRTL, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const { data: organizations = [], isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => base44.entities.Organization.list('-created_date', 100),
    initialData: []
  });

  const orgTypes = [
    { id: 'all', label_en: 'All Types', label_ar: 'جميع الأنواع' },
    { id: 'ministry', label_en: 'Ministry', label_ar: 'وزارة' },
    { id: 'municipality', label_en: 'Municipality', label_ar: 'بلدية' },
    { id: 'university', label_en: 'University', label_ar: 'جامعة' },
    { id: 'research_center', label_en: 'Research Center', label_ar: 'مركز بحثي' },
    { id: 'company', label_en: 'Company', label_ar: 'شركة' },
    { id: 'startup', label_en: 'Startup', label_ar: 'شركة ناشئة' }
  ];

  const filteredOrganizations = organizations.filter(org => {
    const matchesType = typeFilter === 'all' || org.org_type === typeFilter;
    const matchesSearch = searchQuery === '' ||
      (org.name_en && org.name_en.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (org.name_ar && org.name_ar.includes(searchQuery));
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">{t({ en: 'Organizations', ar: 'المنظمات' })}</h1>
          <p className="text-slate-600 mt-2">{t({ en: 'Partner organizations in the innovation ecosystem', ar: 'المنظمات الشريكة في منظومة الابتكار' })}</p>
        </div>
        {hasPermission('org_create') && (
          <Link to={createPageUrl('OrganizationCreate')}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t({ en: 'Add Organization', ar: 'إضافة منظمة' })}
            </Button>
          </Link>
        )}
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
              <Input
                placeholder={t({ en: 'Search organizations...', ar: 'ابحث عن منظمات...' })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={isRTL ? 'pr-10' : 'pl-10'}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {orgTypes.map((type) => (
                <Button
                  key={type.id}
                  variant={typeFilter === type.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTypeFilter(type.id)}
                >
                  {language === 'ar' ? type.label_ar : type.label_en}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organizations Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-slate-600">{t({ en: 'Loading...', ar: 'جاري التحميل...' })}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrganizations.map((org) => (
            <Link key={org.id} to={createPageUrl('OrganizationDetail') + `?id=${org.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Logo */}
                    {org.logo_url ? (
                      <img src={org.logo_url} alt={org.name_en} className="h-16 w-16 object-contain mx-auto" />
                    ) : (
                      <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mx-auto">
                        <Building2 className="h-8 w-8 text-blue-600" />
                      </div>
                    )}

                    {/* Name */}
                    <div className="text-center">
                      <h3 className="font-bold text-lg">{language === 'ar' ? org.name_ar : org.name_en}</h3>
                      {org.org_type && (
                        <Badge variant="outline" className="mt-2">
                          {org.org_type.replace(/_/g, ' ')}
                        </Badge>
                      )}
                    </div>

                    {/* Description */}
                    {(org.description_en || org.description_ar) && (
                      <p className="text-sm text-slate-600 line-clamp-2 text-center">
                        {language === 'ar' ? org.description_ar : org.description_en}
                      </p>
                    )}

                    {/* Location */}
                    {org.city_id && (
                      <div className="flex items-center justify-center gap-1 text-xs text-slate-500">
                        <MapPin className="h-3 w-3" />
                        <span>{org.city_id}</span>
                      </div>
                    )}

                    {/* Website */}
                    {org.website && (
                      <div className="flex items-center justify-center gap-1 text-xs text-blue-600">
                        <Globe className="h-3 w-3" />
                        <span className="truncate">{org.website}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {filteredOrganizations.length === 0 && !isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">{t({ en: 'No organizations found', ar: 'لم يتم العثور على منظمات' })}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProtectedPage(Organizations, {
  requiredPermissions: ['org_view_all']
});