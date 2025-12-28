import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from '../components/LanguageContext';
import { FileText, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function ReportsBuilder() {
  const { language, isRTL, t } = useLanguage();
  const [reportConfig, setReportConfig] = useState({
    title: '',
    entities: [],
    dateRange: 'last_month',
    format: 'pdf',
    sections: []
  });

  const availableEntities = [
    'Challenge', 'Pilot', 'Solution', 'RDProject', 'Program', 'Municipality', 'Organization'
  ];

  const availableSections = [
    { id: 'summary', label_en: 'Executive Summary', label_ar: 'الملخص التنفيذي' },
    { id: 'kpis', label_en: 'KPI Dashboard', label_ar: 'لوحة المؤشرات' },
    { id: 'trends', label_en: 'Trend Analysis', label_ar: 'تحليل الاتجاهات' },
    { id: 'entities', label_en: 'Entity Details', label_ar: 'تفاصيل الكيانات' },
    { id: 'recommendations', label_en: 'AI Recommendations', label_ar: 'توصيات ذكية' }
  ];

  const handleGenerate = () => {

  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t({ en: 'Custom Reports Builder', ar: 'بناء التقارير المخصصة' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {t({ en: 'Create custom reports from platform data', ar: 'إنشاء تقارير مخصصة من بيانات المنصة' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t({ en: 'Report Configuration', ar: 'إعداد التقرير' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Report Title', ar: 'عنوان التقرير' })}</label>
              <Input
                value={reportConfig.title}
                onChange={(e) => setReportConfig({ ...reportConfig, title: e.target.value })}
                placeholder={t({ en: 'Monthly Innovation Report', ar: 'تقرير الابتكار الشهري' })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Data Sources', ar: 'مصادر البيانات' })}</label>
              <div className="grid grid-cols-2 gap-2">
                {availableEntities.map((entity) => (
                  <div key={entity} className="flex items-center gap-2 p-2 border rounded">
                    <Checkbox
                      checked={reportConfig.entities.includes(entity)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setReportConfig({ ...reportConfig, entities: [...reportConfig.entities, entity] });
                        } else {
                          setReportConfig({ ...reportConfig, entities: reportConfig.entities.filter(e => e !== entity) });
                        }
                      }}
                    />
                    <label className="text-sm">{entity}</label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Sections to Include', ar: 'الأقسام المطلوبة' })}</label>
              <div className="space-y-2">
                {availableSections.map((section) => (
                  <div key={section.id} className="flex items-center gap-2 p-2 border rounded">
                    <Checkbox
                      checked={reportConfig.sections.includes(section.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setReportConfig({ ...reportConfig, sections: [...reportConfig.sections, section.id] });
                        } else {
                          setReportConfig({ ...reportConfig, sections: reportConfig.sections.filter(s => s !== section.id) });
                        }
                      }}
                    />
                    <label className="text-sm">{language === 'ar' ? section.label_ar : section.label_en}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">{t({ en: 'Date Range', ar: 'الفترة الزمنية' })}</label>
                <Select value={reportConfig.dateRange} onValueChange={(val) => setReportConfig({ ...reportConfig, dateRange: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last_week">Last Week</SelectItem>
                    <SelectItem value="last_month">Last Month</SelectItem>
                    <SelectItem value="last_quarter">Last Quarter</SelectItem>
                    <SelectItem value="last_year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t({ en: 'Format', ar: 'التنسيق' })}</label>
                <Select value={reportConfig.format} onValueChange={(val) => setReportConfig({ ...reportConfig, format: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="pptx">PowerPoint</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button className="w-full bg-gradient-to-r from-blue-600 to-teal-600" onClick={handleGenerate}>
              <Download className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t({ en: 'Generate Report', ar: 'إنشاء التقرير' })}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t({ en: 'Quick Templates', ar: 'قوالب سريعة' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name_en: 'Monthly Executive Brief', name_ar: 'الملخص التنفيذي الشهري' },
              { name_en: 'Pilot Performance Report', name_ar: 'تقرير أداء التجارب' },
              { name_en: 'Sector Analysis', name_ar: 'تحليل القطاع' },
              { name_en: 'MII Trends Report', name_ar: 'تقرير اتجاهات المؤشر' }
            ].map((template, i) => (
              <Button key={i} variant="outline" className="w-full justify-start">
                <FileText className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {language === 'ar' ? template.name_ar : template.name_en}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
