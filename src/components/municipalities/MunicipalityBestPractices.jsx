import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { Award, TrendingUp, MapPin, ExternalLink, Star } from 'lucide-react';

export default function MunicipalityBestPractices() {
  const { language, isRTL, t } = useLanguage();
  const [selectedSector, setSelectedSector] = useState('all');

  const bestPractices = [
    {
      id: 1,
      title_en: 'Smart Parking Management System',
      title_ar: 'نظام إدارة مواقف ذكي',
      sector: 'transport',
      municipality_en: 'Riyadh',
      municipality_ar: 'الرياض',
      impact_en: 'Reduced parking search time by 40%, increased revenue by 25%',
      impact_ar: 'تقليل وقت البحث عن مواقف بنسبة 40%، زيادة الإيرادات بنسبة 25%',
      description_en: 'IoT-enabled smart parking system with real-time availability tracking',
      description_ar: 'نظام مواقف ذكي مدعوم بإنترنت الأشياء مع تتبع التوفر في الوقت الفعلي',
      scalability: 'high',
      year: 2024
    },
    {
      id: 2,
      title_en: 'Community-Led Urban Forestry',
      title_ar: 'التحريج الحضري بقيادة المجتمع',
      sector: 'environment',
      municipality_en: 'Jeddah',
      municipality_ar: 'جدة',
      impact_en: 'Planted 50,000 trees, engaged 5,000 volunteers',
      impact_ar: 'زراعة 50,000 شجرة، إشراك 5,000 متطوع',
      description_en: 'Community-driven initiative to increase green cover in urban areas',
      description_ar: 'مبادرة مجتمعية لزيادة الغطاء الأخضر في المناطق الحضرية',
      scalability: 'high',
      year: 2023
    },
    {
      id: 3,
      title_en: 'Digital Permit Platform',
      title_ar: 'منصة التصاريح الرقمية',
      sector: 'digital_services',
      municipality_en: 'Dammam',
      municipality_ar: 'الدمام',
      impact_en: 'Reduced permit processing time from 15 days to 2 days',
      impact_ar: 'تقليل وقت معالجة التصاريح من 15 يومًا إلى يومين',
      description_en: 'End-to-end digital platform for business and construction permits',
      description_ar: 'منصة رقمية شاملة لتصاريح الأعمال والبناء',
      scalability: 'high',
      year: 2024
    },
    {
      id: 4,
      title_en: 'AI-Powered Street Cleaning Optimization',
      title_ar: 'تحسين تنظيف الشوارع بالذكاء الاصطناعي',
      sector: 'urban_design',
      municipality_en: 'Madinah',
      municipality_ar: 'المدينة',
      impact_en: 'Improved cleaning efficiency by 35%, reduced costs by 20%',
      impact_ar: 'تحسين كفاءة التنظيف بنسبة 35%، تقليل التكاليف بنسبة 20%',
      description_en: 'AI algorithm optimizes cleaning routes based on real-time data',
      description_ar: 'خوارزمية ذكاء اصطناعي تحسن مسارات التنظيف بناءً على بيانات في الوقت الفعلي',
      scalability: 'medium',
      year: 2024
    },
    {
      id: 5,
      title_en: 'Youth Innovation Lab',
      title_ar: 'مختبر ابتكار الشباب',
      sector: 'social_services',
      municipality_en: 'Khobar',
      municipality_ar: 'الخبر',
      impact_en: '120 youth-led projects, 15 startups launched',
      impact_ar: '120 مشروع بقيادة الشباب، إطلاق 15 شركة ناشئة',
      description_en: 'Innovation hub empowering youth to solve local challenges',
      description_ar: 'مركز ابتكار يمكّن الشباب من حل التحديات المحلية',
      scalability: 'medium',
      year: 2023
    }
  ];

  const sectors = [
    { id: 'all', label_en: 'All Sectors', label_ar: 'جميع القطاعات' },
    { id: 'transport', label_en: 'Transport', label_ar: 'النقل' },
    { id: 'environment', label_en: 'Environment', label_ar: 'البيئة' },
    { id: 'digital_services', label_en: 'Digital Services', label_ar: 'الخدمات الرقمية' },
    { id: 'urban_design', label_en: 'Urban Design', label_ar: 'التصميم الحضري' },
    { id: 'social_services', label_en: 'Social Services', label_ar: 'الخدمات الاجتماعية' }
  ];

  const filteredPractices = selectedSector === 'all' 
    ? bestPractices 
    : bestPractices.filter(p => p.sector === selectedSector);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-600" />
            {t({ en: 'Best Practices Library', ar: 'مكتبة أفضل الممارسات' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 mb-4">
            {t({ 
              en: 'Learn from successful innovation initiatives across Saudi municipalities',
              ar: 'تعلم من مبادرات الابتكار الناجحة عبر البلديات السعودية'
            })}
          </p>

          {/* Sector Filters */}
          <div className="flex flex-wrap gap-2">
            {sectors.map((sector) => (
              <Button
                key={sector.id}
                variant={selectedSector === sector.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSector(sector.id)}
              >
                {language === 'ar' ? sector.label_ar : sector.label_en}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Best Practices List */}
      <div className="space-y-4">
        {filteredPractices.map((practice) => (
          <Card key={practice.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{language === 'ar' ? practice.title_ar : practice.title_en}</h3>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {language === 'ar' ? practice.municipality_ar : practice.municipality_en}
                      </Badge>
                      <Badge variant="outline">{practice.year}</Badge>
                      <Badge className={
                        practice.scalability === 'high' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }>
                        {practice.scalability === 'high' ? t({ en: 'High Scalability', ar: 'قابلية توسع عالية' }) : t({ en: 'Medium Scalability', ar: 'قابلية توسع متوسطة' })}
                      </Badge>
                    </div>
                  </div>
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                </div>

                {/* Description */}
                <p className="text-sm text-slate-700">
                  {language === 'ar' ? practice.description_ar : practice.description_en}
                </p>

                {/* Impact */}
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-xs font-semibold text-green-900">
                      {t({ en: 'Measured Impact', ar: 'التأثير المقاس' })}
                    </span>
                  </div>
                  <p className="text-sm text-green-900">
                    {language === 'ar' ? practice.impact_ar : practice.impact_en}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    <ExternalLink className="h-3 w-3 mr-2" />
                    {t({ en: 'View Full Case Study', ar: 'عرض دراسة الحالة كاملة' })}
                  </Button>
                  <Button size="sm">
                    {t({ en: 'Adapt for My City', ar: 'تكييف لمدينتي' })}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}