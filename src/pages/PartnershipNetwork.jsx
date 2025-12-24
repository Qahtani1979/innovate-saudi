import { useState } from 'react';
import { usePartnershipsWithVisibility } from '@/hooks/usePartnershipsWithVisibility';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Network, Plus, Building2, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ProtectedPage from '../components/permissions/ProtectedPage';

function PartnershipNetwork() {
  const { t } = useLanguage();
  const [typeFilter, setTypeFilter] = useState('all');

  const { data: partnerships = [], isLoading } = usePartnershipsWithVisibility({ includeAll: true });

  const filteredPartnerships = partnerships.filter(p =>
    typeFilter === 'all' || p.partnership_type === typeFilter
  );

  const stats = {
    total: partnerships.length,
    active: partnerships.filter(p => p.status === 'active').length,
    strategic: partnerships.filter(p => p.partnership_type === 'strategic').length,
    mous: partnerships.filter(p => p.mou_signed).length
  };

  const typeColors = {
    strategic: 'bg-purple-100 text-purple-700',
    operational: 'bg-blue-100 text-blue-700',
    research: 'bg-green-100 text-green-700',
    funding: 'bg-amber-100 text-amber-700',
    technology: 'bg-indigo-100 text-indigo-700'
  };

  const statusColors = {
    proposed: 'bg-slate-200 text-slate-700',
    negotiation: 'bg-amber-200 text-amber-700',
    active: 'bg-green-200 text-green-700',
    suspended: 'bg-red-200 text-red-700',
    completed: 'bg-blue-200 text-blue-700'
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t({ en: 'Partnership Network', ar: 'شبكة الشراكات' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {t({ en: 'Organization-to-organization strategic partnerships', ar: 'الشراكات الاستراتيجية بين المنظمات' })}
          </p>
        </div>
        <Link to={createPageUrl('PartnershipPerformance')}>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            {t({ en: 'New Partnership', ar: 'شراكة جديدة' })}
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Total', ar: 'الإجمالي' })}</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <Network className="h-8 w-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Active', ar: 'نشط' })}</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Strategic', ar: 'استراتيجي' })}</p>
                <p className="text-2xl font-bold text-purple-600">{stats.strategic}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'MOUs Signed', ar: 'الاتفاقيات الموقعة' })}</p>
                <p className="text-2xl font-bold text-blue-600">{stats.mous}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">{t({ en: 'All Types', ar: 'كل الأنواع' })}</option>
            <option value="strategic">{t({ en: 'Strategic', ar: 'استراتيجي' })}</option>
            <option value="operational">{t({ en: 'Operational', ar: 'تشغيلي' })}</option>
            <option value="research">{t({ en: 'Research', ar: 'بحثي' })}</option>
            <option value="funding">{t({ en: 'Funding', ar: 'تمويلي' })}</option>
            <option value="technology">{t({ en: 'Technology', ar: 'تقني' })}</option>
          </select>
        </CardContent>
      </Card>

      {/* Partnerships Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPartnerships.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <Network className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">{t({ en: 'No partnerships found', ar: 'لا توجد شراكات' })}</p>
            </CardContent>
          </Card>
        ) : (
          filteredPartnerships.map(partnership => (
            <Card key={partnership.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={typeColors[partnership.partnership_type]}>
                          {partnership.partnership_type}
                        </Badge>
                        <Badge className={statusColors[partnership.status]}>
                          {partnership.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-900">
                        <Building2 className="h-4 w-4 text-slate-500" />
                        <span className="font-medium">{partnership.org_a_id}</span>
                        <span className="text-slate-500">↔</span>
                        <span className="font-medium">{partnership.org_b_id}</span>
                      </div>
                    </div>
                  </div>

                  {partnership.objectives && partnership.objectives.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-600 mb-1">{t({ en: 'Objectives:', ar: 'الأهداف:' })}</p>
                      <p className="text-sm text-slate-700">{partnership.objectives[0]}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <div>
                      {partnership.start_date && (
                        <span>{new Date(partnership.start_date).toLocaleDateString()}</span>
                      )}
                    </div>
                    {partnership.mou_signed && (
                      <Badge variant="outline" className="text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        MOU Signed
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export default ProtectedPage(PartnershipNetwork, {
  requiredPermissions: ['partnership_view_all']
});