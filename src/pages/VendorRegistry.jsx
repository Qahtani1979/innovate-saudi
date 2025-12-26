import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Building2, Search, Plus, Star, CheckCircle2, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useVendors } from '@/hooks/useVendors';

function VendorRegistry() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const { data: vendors = [], isLoading } = useVendors();

  const filteredVendors = vendors.filter(v => {
    const matchesSearch = !search ||
      v.name_en?.toLowerCase().includes(search.toLowerCase()) ||
      v.name_ar?.toLowerCase().includes(search.toLowerCase()) ||
      v.vendor_code?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    const matchesType = typeFilter === 'all' || v.vendor_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: vendors.length,
    approved: vendors.filter(v => v.status === 'approved').length,
    active: vendors.filter(v => v.status === 'active').length,
    avg_rating: vendors.reduce((sum, v) => sum + (v.performance_rating || 0), 0) / (vendors.length || 1)
  };

  const statusColors = {
    registered: 'bg-slate-200 text-slate-700',
    approved: 'bg-blue-200 text-blue-700',
    active: 'bg-green-200 text-green-700',
    suspended: 'bg-red-200 text-red-700',
    blacklisted: 'bg-red-300 text-red-800',
    inactive: 'bg-slate-300 text-slate-700'
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
            {t({ en: 'Vendor Registry', ar: 'سجل الموردين' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {t({ en: 'Manage approved vendors and suppliers', ar: 'إدارة الموردين والمقاولين المعتمدين' })}
          </p>
        </div>
        <Link to={createPageUrl('VendorPerformance')}>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            {t({ en: 'Add Vendor', ar: 'إضافة مورد' })}
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
              <Building2 className="h-8 w-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Approved', ar: 'معتمد' })}</p>
                <p className="text-2xl font-bold text-blue-600">{stats.approved}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Active', ar: 'نشط' })}</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <Package className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Avg Rating', ar: 'متوسط التقييم' })}</p>
                <p className="text-2xl font-bold text-amber-600">{stats.avg_rating.toFixed(1)}</p>
              </div>
              <Star className="h-8 w-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder={t({ en: 'Search vendors...', ar: 'البحث عن الموردين...' })}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">{t({ en: 'All Types', ar: 'كل الأنواع' })}</option>
              <option value="goods">{t({ en: 'Goods', ar: 'سلع' })}</option>
              <option value="services">{t({ en: 'Services', ar: 'خدمات' })}</option>
              <option value="consultancy">{t({ en: 'Consultancy', ar: 'استشارات' })}</option>
              <option value="technology">{t({ en: 'Technology', ar: 'تقنية' })}</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">{t({ en: 'All Status', ar: 'كل الحالات' })}</option>
              <option value="active">{t({ en: 'Active', ar: 'نشط' })}</option>
              <option value="approved">{t({ en: 'Approved', ar: 'معتمد' })}</option>
              <option value="suspended">{t({ en: 'Suspended', ar: 'معلق' })}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVendors.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">{t({ en: 'No vendors found', ar: 'لا يوجد موردون' })}</p>
            </CardContent>
          </Card>
        ) : (
          filteredVendors.map(vendor => (
            <Card key={vendor.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">{vendor.name_en || vendor.name_ar}</h3>
                    <p className="text-xs text-slate-500 mb-2">{vendor.vendor_code}</p>
                    <Badge className={statusColors[vendor.status]}>
                      {vendor.status?.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  {vendor.performance_rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      <span className="font-medium">{vendor.performance_rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>{t({ en: 'Type:', ar: 'النوع:' })}</span>
                    <Badge variant="outline" className="text-xs">
                      {vendor.vendor_type?.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  {vendor.total_contracts > 0 && (
                    <div className="flex items-center justify-between">
                      <span>{t({ en: 'Contracts:', ar: 'العقود:' })}</span>
                      <span className="font-medium">{vendor.total_contracts}</span>
                    </div>
                  )}
                  {vendor.contact_email && (
                    <div className="text-xs text-slate-500">
                      {vendor.contact_email}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export default ProtectedPage(VendorRegistry, {
  requiredPermissions: ['vendor_view_all']
});
