import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../components/LanguageContext';
import { Plus, Play, Save, BarChart3 } from 'lucide-react';

export default function CustomReportBuilder() {
  const { language, isRTL, t } = useLanguage();
  const [selectedFields, setSelectedFields] = useState([]);

  const entityFields = {
    challenges: ['title', 'sector', 'status', 'priority', 'created_date'],
    pilots: ['title', 'stage', 'success_probability', 'budget'],
    solutions: ['name', 'provider', 'maturity_level', 'deployment_count']
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t({ en: 'Custom Report Builder', ar: 'بناء التقارير المخصصة' })}</h1>
          <p className="text-slate-600">{t({ en: 'Build custom data reports', ar: 'بناء تقارير بيانات مخصصة' })}</p>
        </div>
        <Button className="bg-blue-600">
          <Save className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t({ en: 'Save Report', ar: 'حفظ التقرير' })}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">{t({ en: 'Report Configuration', ar: 'إعداد التقرير' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Report Name', ar: 'اسم التقرير' })}</label>
              <Input placeholder="e.g., Pilot Success Analysis" />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Data Source', ar: 'مصدر البيانات' })}</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder={t({ en: 'Select entity', ar: 'اختر الكيان' })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="challenges">Challenges</SelectItem>
                  <SelectItem value="pilots">Pilots</SelectItem>
                  <SelectItem value="solutions">Solutions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Fields to Include', ar: 'الحقول المطلوبة' })}</label>
              <div className="space-y-2 max-h-48 overflow-auto border rounded p-3">
                {['title', 'sector', 'status', 'priority', 'created_date', 'municipality', 'owner'].map(field => (
                  <div key={field} className="flex items-center gap-2">
                    <Checkbox id={field} />
                    <label htmlFor={field} className="text-sm capitalize">{field.replace('_', ' ')}</label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t({ en: 'Preview', ar: 'معاينة' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed rounded-lg h-64 flex items-center justify-center bg-slate-50">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                <p className="text-sm text-slate-500">{t({ en: 'Report preview will appear here', ar: 'ستظهر معاينة التقرير هنا' })}</p>
                <Button size="sm" className="mt-3">
                  <Play className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t({ en: 'Generate', ar: 'توليد' })}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}