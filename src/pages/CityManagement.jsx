import { useState } from 'react';
import { useCityManagement } from '@/hooks/useCityManagement';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from '../components/LanguageContext';
import { Building2, Plus, Edit2, Trash2, Save, X, MapPin, Search } from 'lucide-react';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

function CityManagement() {
  const { language, isRTL, t } = useLanguage();
  const [editingCity, setEditingCity] = useState(null);
  const [newCity, setNewCity] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  /* 
    Refactored to use useCityManagement hook 
    Removed direct Supabase calls and local mutations
  */
  const {
    cities,
    regions,
    createCityMutation,
    updateCityMutation,
    deleteCityMutation
  } = useCityManagement(t);


  const filteredCities = cities.filter(city => {
    const matchesSearch = city.name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.name_ar?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = regionFilter === 'all' || city.region_id === regionFilter;
    return matchesSearch && matchesRegion;
  });

  const getRegionName = (regionId) => {
    const region = regions.find(r => r.id === regionId);
    return region ? (language === 'ar' ? region.name_ar : region.name_en) : regionId;
  };

  return (
    <PageLayout>
      <PageHeader
        icon={Building2}
        title={{ en: 'City Management', ar: 'إدارة المدن' }}
        subtitle={{ en: 'Manage cities and their administrative regions', ar: 'إدارة المدن ومناطقها الإدارية' }}
        stats={[
          { icon: Building2, value: cities.length, label: { en: 'Total Cities', ar: 'إجمالي المدن' } },
          { icon: MapPin, value: cities.filter(c => c.municipality_id).length, label: { en: 'Municipalities', ar: 'البلديات' } },
        ]}
        action={<Button onClick={() => setNewCity({ region_id: '', name_en: '', name_ar: '', population: 0 })}>
          <Plus className="h-4 w-4 mr-2" />
          {t({ en: 'Add City', ar: 'إضافة مدينة' })}
        </Button>} description={undefined} actions={undefined} children={undefined} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Total Cities', ar: 'إجمالي المدن' })}</p>
                <p className="text-3xl font-bold text-blue-600">{cities.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Municipalities', ar: 'البلديات' })}</p>
                <p className="text-3xl font-bold text-green-600">
                  {cities.filter(c => c.municipality_id).length}
                </p>
              </div>
              <MapPin className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Total Population', ar: 'إجمالي السكان' })}</p>
                <p className="text-2xl font-bold text-purple-600">
                  {(cities.reduce((sum, c) => sum + (c.population || 0), 0) / 1000000).toFixed(1)}M
                </p>
              </div>
              <Building2 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New City Form */}
      {newCity && (
        <Card className="border-2 border-blue-300 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg">{t({ en: 'New City', ar: 'مدينة جديدة' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  {t({ en: 'Region', ar: 'المنطقة' })}
                </label>
                <Select value={newCity.region_id} onValueChange={(value) => setNewCity({ ...newCity, region_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t({ en: 'Select region', ar: 'اختر المنطقة' })} />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map(region => (
                      <SelectItem key={region.id} value={region.id}>
                        {language === 'ar' ? region.name_ar : region.name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  {t({ en: 'Name (English)', ar: 'الاسم (إنجليزي)' })}
                </label>
                <Input
                  value={newCity.name_en}
                  onChange={(e) => setNewCity({ ...newCity, name_en: e.target.value })}
                  placeholder="Riyadh"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  {t({ en: 'Name (Arabic)', ar: 'الاسم (عربي)' })}
                </label>
                <Input
                  value={newCity.name_ar}
                  onChange={(e) => setNewCity({ ...newCity, name_ar: e.target.value })}
                  placeholder="الرياض"
                  dir="rtl"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  {t({ en: 'Population', ar: 'عدد السكان' })}
                </label>
                <Input
                  type="number"
                  value={newCity.population}
                  onChange={(e) => setNewCity({ ...newCity, population: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            {/* 
            <div className="flex items-center gap-3">
              <Switch
                checked={newCity.is_municipality}
                onCheckedChange={(checked) => setNewCity({ ...newCity, is_municipality: checked })}
              />
              <label className="text-sm text-slate-700">
                {t({ en: 'Has its own municipality', ar: 'لديها بلدية خاصة' })}
              </label>
            </div>
             */}
            <div className="flex gap-2">
              <Button onClick={() => createCityMutation.mutate(newCity, { onSuccess: () => setNewCity(null) })} disabled={!newCity.name_en || !newCity.region_id}>
                <Save className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'Create', ar: 'إنشاء' })}
              </Button>
              <Button variant="outline" onClick={() => setNewCity(null)}>
                <X className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'Cancel', ar: 'إلغاء' })}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
              <Input
                placeholder={t({ en: 'Search cities...', ar: 'ابحث عن المدن...' })}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${isRTL ? 'pr-10' : 'pl-10'}`}
              />
            </div>
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t({ en: 'All Regions', ar: 'كل المناطق' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'All Regions', ar: 'كل المناطق' })}</SelectItem>
                {regions.map(region => (
                  <SelectItem key={region.id} value={region.id}>
                    {language === 'ar' ? region.name_ar : region.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cities List */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Cities', ar: 'المدن' })} ({filteredCities.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredCities.map(city => {
              const isEditing = editingCity?.id === city.id;
              const current = isEditing ? editingCity : city;

              return (
                <div key={city.id} className={`p-4 border rounded-lg transition-all ${isEditing ? 'border-blue-500 bg-blue-50' : 'hover:border-blue-300'
                  }`}>
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Select value={current.region_id} onValueChange={(value) => setEditingCity({ ...current, region_id: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {regions.map(region => (
                              <SelectItem key={region.id} value={region.id}>
                                {language === 'ar' ? region.name_ar : region.name_en}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          value={current.name_en}
                          onChange={(e) => setEditingCity({ ...current, name_en: e.target.value })}
                          placeholder="English name"
                        />
                        <Input
                          value={current.name_ar}
                          onChange={(e) => setEditingCity({ ...current, name_ar: e.target.value })}
                          placeholder="Arabic name"
                          dir="rtl"
                        />
                        <Input
                          type="number"
                          value={current.population}
                          onChange={(e) => setEditingCity({ ...current, population: parseInt(e.target.value) || 0 })}
                          placeholder="Population"
                        />
                      </div>
                      {/* 
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={current.is_municipality}
                          onCheckedChange={(checked) => setEditingCity({ ...current, is_municipality: checked })}
                        />
                        <label className="text-sm text-slate-700">
                          {t({ en: 'Has municipality', ar: 'لديها بلدية' })}
                        </label>
                      </div>
             */}
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => updateCityMutation.mutate({ id: city.id, data: editingCity }, { onSuccess: () => setEditingCity(null) })}>
                          <Save className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingCity(null)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-semibold text-slate-900 text-lg">
                            {language === 'ar' ? city.name_ar : city.name_en}
                          </p>
                          {city.municipality_id && (
                            <Badge className="bg-green-100 text-green-700">
                              {t({ en: 'Municipality', ar: 'بلدية' })}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {getRegionName(city.region_id)}
                          </span>
                          {city.population > 0 && (
                            <span>
                              {t({ en: 'Pop:', ar: 'السكان:' })} {(city.population / 1000).toFixed(0)}K
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingCity(city)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => deleteCityMutation.mutate(city.id)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}

export default ProtectedPage(CityManagement, { requireAdmin: true });
