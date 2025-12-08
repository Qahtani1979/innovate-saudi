import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLanguage } from '../LanguageContext';
import { BookOpen, Search, FileText, Video, Download, Star } from 'lucide-react';

export default function MunicipalityKnowledgeBase() {
  const { language, isRTL, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const knowledgeItems = [
    {
      id: 1,
      title_en: 'Challenge Identification Guide',
      title_ar: 'دليل تحديد التحديات',
      type: 'document',
      category: 'challenges',
      description_en: 'Step-by-step guide to identify and articulate municipal challenges',
      description_ar: 'دليل خطوة بخطوة لتحديد وصياغة التحديات البلدية',
      downloads: 245,
      rating: 4.8
    },
    {
      id: 2,
      title_en: 'Pilot Design Toolkit',
      title_ar: 'مجموعة أدوات تصميم التجارب',
      type: 'toolkit',
      category: 'pilots',
      description_en: 'Templates and tools for designing effective innovation pilots',
      description_ar: 'قوالب وأدوات لتصميم تجارب ابتكارية فعالة',
      downloads: 189,
      rating: 4.6
    },
    {
      id: 3,
      title_en: 'KPI Selection Framework',
      title_ar: 'إطار اختيار مؤشرات الأداء',
      type: 'document',
      category: 'monitoring',
      description_en: 'Framework for selecting relevant KPIs for pilots and challenges',
      description_ar: 'إطار لاختيار مؤشرات الأداء ذات الصلة للتجارب والتحديات',
      downloads: 312,
      rating: 4.9
    },
    {
      id: 4,
      title_en: 'Partnership Agreement Templates',
      title_ar: 'قوالب اتفاقيات الشراكة',
      type: 'template',
      category: 'partnerships',
      description_en: 'Legal templates for partnerships with startups and research institutions',
      description_ar: 'قوالب قانونية للشراكات مع الشركات الناشئة والمؤسسات البحثية',
      downloads: 156,
      rating: 4.7
    },
    {
      id: 5,
      title_en: 'Data Collection Best Practices',
      title_ar: 'أفضل ممارسات جمع البيانات',
      type: 'video',
      category: 'data',
      description_en: 'Video guide on collecting and managing pilot data effectively',
      description_ar: 'دليل فيديو حول جمع وإدارة بيانات التجارب بفعالية',
      views: 423,
      rating: 4.5
    },
    {
      id: 6,
      title_en: 'Stakeholder Engagement Playbook',
      title_ar: 'دليل إشراك أصحاب المصلحة',
      type: 'document',
      category: 'engagement',
      description_en: 'Strategies for engaging stakeholders in innovation initiatives',
      description_ar: 'استراتيجيات لإشراك أصحاب المصلحة في مبادرات الابتكار',
      downloads: 198,
      rating: 4.8
    }
  ];

  const categories = [
    { id: 'all', label_en: 'All', label_ar: 'الكل' },
    { id: 'challenges', label_en: 'Challenges', label_ar: 'التحديات' },
    { id: 'pilots', label_en: 'Pilots', label_ar: 'التجارب' },
    { id: 'monitoring', label_en: 'Monitoring', label_ar: 'المراقبة' },
    { id: 'partnerships', label_en: 'Partnerships', label_ar: 'الشراكات' },
    { id: 'data', label_en: 'Data', label_ar: 'البيانات' }
  ];

  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredItems = knowledgeItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      item.title_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title_ar.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'toolkit': return <BookOpen className="h-4 w-4" />;
      case 'template': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Search & Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {t({ en: 'Municipal Knowledge Base', ar: 'قاعدة معرفة البلديات' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
              <Input
                placeholder={t({ en: 'Search knowledge base...', ar: 'ابحث في قاعدة المعرفة...' })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={isRTL ? 'pr-10' : 'pl-10'}
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {language === 'ar' ? cat.label_ar : cat.label_en}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Knowledge Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(item.type)}
                    <Badge variant="outline" className="text-xs">{item.type}</Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-medium">{item.rating}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold">{language === 'ar' ? item.title_ar : item.title_en}</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {language === 'ar' ? item.description_ar : item.description_en}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs text-slate-500">
                    {item.downloads ? `${item.downloads} ${t({ en: 'downloads', ar: 'تنزيل' })}` : `${item.views} ${t({ en: 'views', ar: 'مشاهدة' })}`}
                  </span>
                  <Button size="sm" variant="outline">
                    <Download className="h-3 w-3 mr-2" />
                    {t({ en: 'Access', ar: 'الوصول' })}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-600">{t({ en: 'No resources found', ar: 'لم يتم العثور على موارد' })}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}