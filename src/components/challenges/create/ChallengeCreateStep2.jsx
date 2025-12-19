import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '@/components/LanguageContext';
import { Target } from 'lucide-react';

export default function ChallengeCreateStep2({ 
  formData, 
  updateField, 
  sectors = [],
  subsectors = [],
  services = [],
  regions = [],
  cities = [],
  validationErrors = {}
}) {
  const { t } = useLanguage();

  const filteredSubsectors = subsectors.filter(s => s.sector_id === formData.sector_id);
  const filteredServices = services.filter(s => s.subsector_id === formData.subsector_id);
  const filteredCities = cities.filter(c => c.region_id === formData.region_id);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-green-600" />
          {t({ en: 'Classification', ar: 'التصنيف' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="sector_id">
              {t({ en: 'Sector', ar: 'القطاع' })} *
            </Label>
            <Select 
              value={formData.sector_id} 
              onValueChange={(value) => {
                updateField('sector_id', value);
                updateField('subsector_id', '');
                updateField('service_id', '');
              }}
            >
              <SelectTrigger className={validationErrors.sector_id ? 'border-red-500' : ''}>
                <SelectValue placeholder={t({ en: 'Select sector', ar: 'اختر القطاع' })} />
              </SelectTrigger>
              <SelectContent>
                {sectors.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {validationErrors.sector_id && (
              <p className="text-sm text-red-500">{validationErrors.sector_id}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subsector_id">
              {t({ en: 'Sub-sector', ar: 'القطاع الفرعي' })}
            </Label>
            <Select 
              value={formData.subsector_id} 
              onValueChange={(value) => {
                updateField('subsector_id', value);
                updateField('service_id', '');
              }}
              disabled={!formData.sector_id}
            >
              <SelectTrigger>
                <SelectValue placeholder={t({ en: 'Select sub-sector', ar: 'اختر القطاع الفرعي' })} />
              </SelectTrigger>
              <SelectContent>
                {filteredSubsectors.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="service_id">
              {t({ en: 'Service', ar: 'الخدمة' })}
            </Label>
            <Select 
              value={formData.service_id} 
              onValueChange={(value) => updateField('service_id', value)}
              disabled={!formData.subsector_id}
            >
              <SelectTrigger>
                <SelectValue placeholder={t({ en: 'Select service', ar: 'اختر الخدمة' })} />
              </SelectTrigger>
              <SelectContent>
                {filteredServices.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="region_id">
              {t({ en: 'Region', ar: 'المنطقة' })}
            </Label>
            <Select 
              value={formData.region_id} 
              onValueChange={(value) => {
                updateField('region_id', value);
                updateField('city_id', '');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t({ en: 'Select region', ar: 'اختر المنطقة' })} />
              </SelectTrigger>
              <SelectContent>
                {regions.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city_id">
              {t({ en: 'City', ar: 'المدينة' })}
            </Label>
            <Select 
              value={formData.city_id} 
              onValueChange={(value) => updateField('city_id', value)}
              disabled={!formData.region_id}
            >
              <SelectTrigger>
                <SelectValue placeholder={t({ en: 'Select city', ar: 'اختر المدينة' })} />
              </SelectTrigger>
              <SelectContent>
                {filteredCities.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="challenge_type">
              {t({ en: 'Challenge Type', ar: 'نوع التحدي' })}
            </Label>
            <Select 
              value={formData.challenge_type} 
              onValueChange={(value) => updateField('challenge_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t({ en: 'Select type', ar: 'اختر النوع' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="operational">{t({ en: 'Operational', ar: 'تشغيلي' })}</SelectItem>
                <SelectItem value="strategic">{t({ en: 'Strategic', ar: 'استراتيجي' })}</SelectItem>
                <SelectItem value="technical">{t({ en: 'Technical', ar: 'تقني' })}</SelectItem>
                <SelectItem value="regulatory">{t({ en: 'Regulatory', ar: 'تنظيمي' })}</SelectItem>
                <SelectItem value="other">{t({ en: 'Other', ar: 'أخرى' })}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">
              {t({ en: 'Priority', ar: 'الأولوية' })}
            </Label>
            <Select 
              value={formData.priority} 
              onValueChange={(value) => updateField('priority', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t({ en: 'Select priority', ar: 'اختر الأولوية' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tier_1">{t({ en: 'Tier 1 (Critical)', ar: 'المستوى 1 (حرج)' })}</SelectItem>
                <SelectItem value="tier_2">{t({ en: 'Tier 2 (High)', ar: 'المستوى 2 (عالي)' })}</SelectItem>
                <SelectItem value="tier_3">{t({ en: 'Tier 3 (Medium)', ar: 'المستوى 3 (متوسط)' })}</SelectItem>
                <SelectItem value="tier_4">{t({ en: 'Tier 4 (Low)', ar: 'المستوى 4 (منخفض)' })}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
