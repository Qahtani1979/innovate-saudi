import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { MapPin, Plus, Edit2, Trash2, Save, X, Building2 } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useRegions, useCities } from '@/hooks/useRegions';
import { useRegionMutations } from '@/hooks/useRegionMutations';

function RegionManagement() {
  const { language, isRTL, t } = useLanguage();
  const [editingRegion, setEditingRegion] = useState(null);
  const [newRegion, setNewRegion] = useState(null);

  const { data: regions = [] } = useRegions();
  const { data: cities = [] } = useCities();
  const { createRegion, updateRegion, deleteRegion } = useRegionMutations();

  const getCityCount = (regionId) => {
    return cities.filter(c => c.region_id === regionId).length;
  };

  const handleCreate = () => {
    createRegion.mutate(newRegion, {
      onSuccess: () => setNewRegion(null),
    });
  };

  const handleUpdate = (id) => {
    updateRegion.mutate({ id, data: editingRegion }, {
      onSuccess: () => setEditingRegion(null),
    });
  };

  const handleDelete = (id) => {
    if (window.confirm(t({ en: 'Are you sure you want to delete this region?', ar: 'هل أنت متأكد من حذف هذه المنطقة؟' }))) {
      deleteRegion.mutate(id);
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            {t({ en: 'Region Management', ar: 'إدارة المناطق' })}
          </h1>
          <p className="text-slate-600 mt-2">
            {t({ en: 'Manage administrative regions across Saudi Arabia', ar: 'إدارة المناطق الإدارية عبر المملكة' })}
          </p>
        </div>
        <Button onClick={() => setNewRegion({ name_en: '', name_ar: '', code: '' })}>
          <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t({ en: 'Add Region', ar: 'إضافة منطقة' })}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Total Regions', ar: 'إجمالي المناطق' })}</p>
                <p className="text-3xl font-bold text-blue-600">{regions.length}</p>
              </div>
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Total Cities', ar: 'إجمالي المدن' })}</p>
                <p className="text-3xl font-bold text-green-600">{cities.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Region Form */}
      {newRegion && (
        <Card className="border-2 border-blue-300 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg">{t({ en: 'New Region', ar: 'منطقة جديدة' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  {t({ en: 'Name (English)', ar: 'الاسم (إنجليزي)' })}
                </label>
                <Input
                  value={newRegion.name_en}
                  onChange={(e) => setNewRegion({ ...newRegion, name_en: e.target.value })}
                  placeholder="Riyadh Region"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  {t({ en: 'Name (Arabic)', ar: 'الاسم (عربي)' })}
                </label>
                <Input
                  value={newRegion.name_ar}
                  onChange={(e) => setNewRegion({ ...newRegion, name_ar: e.target.value })}
                  placeholder="منطقة الرياض"
                  dir="rtl"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  {t({ en: 'Code', ar: 'الرمز' })}
                </label>
                <Input
                  value={newRegion.code}
                  onChange={(e) => setNewRegion({ ...newRegion, code: e.target.value })}
                  placeholder="RUH"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={!newRegion.name_en || !newRegion.code || createRegion.isPending}>
                <Save className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'Create', ar: 'إنشاء' })}
              </Button>
              <Button variant="outline" onClick={() => setNewRegion(null)}>
                <X className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'Cancel', ar: 'إلغاء' })}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Regions List */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Regions', ar: 'المناطق' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regions.map(region => {
              const isEditing = editingRegion?.id === region.id;
              const current = isEditing ? editingRegion : region;
              const cityCount = getCityCount(region.id);

              return (
                <div key={region.id} className={`p-4 border-2 rounded-lg transition-all ${isEditing ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
                  }`}>
                  {isEditing ? (
                    <div className="space-y-3">
                      <Input
                        value={current.name_en}
                        onChange={(e) => setEditingRegion({ ...current, name_en: e.target.value })}
                        placeholder="English name"
                      />
                      <Input
                        value={current.name_ar}
                        onChange={(e) => setEditingRegion({ ...current, name_ar: e.target.value })}
                        placeholder="Arabic name"
                        dir="rtl"
                      />
                      <Input
                        value={current.code}
                        onChange={(e) => setEditingRegion({ ...current, code: e.target.value })}
                        placeholder="Code"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleUpdate(region.id)} disabled={updateRegion.isPending}>
                          <Save className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingRegion(null)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <Badge className="bg-blue-100 text-blue-700">{region.code}</Badge>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" onClick={() => setEditingRegion(region)}>
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(region.id)} disabled={deleteRegion.isPending}>
                            <Trash2 className="h-3 w-3 text-red-600" />
                          </Button>
                        </div>
                      </div>
                      <p className="font-semibold text-slate-900 mb-1">
                        {language === 'ar' ? region.name_ar : region.name_en}
                      </p>
                      <p className="text-sm text-slate-600">
                        {language === 'ar' ? region.name_en : region.name_ar}
                      </p>
                      <div className="mt-3 pt-3 border-t flex items-center gap-2 text-sm text-slate-600">
                        <Building2 className="h-4 w-4" />
                        <span>{cityCount} {t({ en: 'cities', ar: 'مدينة' })}</span>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(RegionManagement, { requireAdmin: true });
