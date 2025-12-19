import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '@/components/LanguageContext';
import { Globe } from 'lucide-react';

export default function ChallengeCreateStep1({ 
  formData, 
  updateField, 
  municipalities = [],
  validationErrors = {}
}) {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-600" />
          {t({ en: 'Basic Information', ar: 'المعلومات الأساسية' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title_en">
              {t({ en: 'Title (English)', ar: 'العنوان (إنجليزي)' })} *
            </Label>
            <Input
              id="title_en"
              value={formData.title_en}
              onChange={(e) => updateField('title_en', e.target.value)}
              placeholder={t({ en: 'Enter challenge title', ar: 'أدخل عنوان التحدي' })}
              className={validationErrors.title_en ? 'border-red-500' : ''}
            />
            {validationErrors.title_en && (
              <p className="text-sm text-red-500">{validationErrors.title_en}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title_ar">
              {t({ en: 'Title (Arabic)', ar: 'العنوان (عربي)' })}
            </Label>
            <Input
              id="title_ar"
              value={formData.title_ar}
              onChange={(e) => updateField('title_ar', e.target.value)}
              placeholder={t({ en: 'Enter Arabic title', ar: 'أدخل العنوان بالعربية' })}
              dir="rtl"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="tagline_en">
              {t({ en: 'Tagline (English)', ar: 'الشعار (إنجليزي)' })}
            </Label>
            <Input
              id="tagline_en"
              value={formData.tagline_en}
              onChange={(e) => updateField('tagline_en', e.target.value)}
              placeholder={t({ en: 'Short tagline', ar: 'شعار قصير' })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagline_ar">
              {t({ en: 'Tagline (Arabic)', ar: 'الشعار (عربي)' })}
            </Label>
            <Input
              id="tagline_ar"
              value={formData.tagline_ar}
              onChange={(e) => updateField('tagline_ar', e.target.value)}
              placeholder={t({ en: 'Arabic tagline', ar: 'الشعار بالعربية' })}
              dir="rtl"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="municipality_id">
            {t({ en: 'Municipality', ar: 'البلدية' })} *
          </Label>
          <Select 
            value={formData.municipality_id} 
            onValueChange={(value) => updateField('municipality_id', value)}
          >
            <SelectTrigger className={validationErrors.municipality_id ? 'border-red-500' : ''}>
              <SelectValue placeholder={t({ en: 'Select municipality', ar: 'اختر البلدية' })} />
            </SelectTrigger>
            <SelectContent>
              {municipalities.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name_en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors.municipality_id && (
            <p className="text-sm text-red-500">{validationErrors.municipality_id}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="challenge_owner">
              {t({ en: 'Challenge Owner', ar: 'مالك التحدي' })}
            </Label>
            <Input
              id="challenge_owner"
              value={formData.challenge_owner}
              onChange={(e) => updateField('challenge_owner', e.target.value)}
              placeholder={t({ en: 'Name of the owner', ar: 'اسم المالك' })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="challenge_owner_email">
              {t({ en: 'Owner Email', ar: 'بريد المالك' })}
            </Label>
            <Input
              id="challenge_owner_email"
              type="email"
              value={formData.challenge_owner_email}
              onChange={(e) => updateField('challenge_owner_email', e.target.value)}
              placeholder={t({ en: 'owner@email.com', ar: 'owner@email.com' })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
