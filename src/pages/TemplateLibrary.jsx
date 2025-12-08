import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLanguage } from '../components/LanguageContext';
import { FileText, Eye, Copy, Star } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ProtectedPage from '../components/permissions/ProtectedPage';

function TemplateLibrary() {
  const { language, isRTL, t } = useLanguage();
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const templates = {
    strategic_plans: [
      {
        id: 1,
        name: { en: '5-Year Digital Transformation Plan', ar: 'خطة التحول الرقمي 5 سنوات' },
        description: { en: 'Comprehensive digital services strategy', ar: 'استراتيجية خدمات رقمية شاملة' },
        themes: 4,
        kpis: 12
      },
      {
        id: 2,
        name: { en: 'Environmental Sustainability Strategy', ar: 'استراتيجية الاستدامة البيئية' },
        description: { en: 'Green city planning framework', ar: 'إطار تخطيط المدينة الخضراء' },
        themes: 3,
        kpis: 8
      }
    ],
    rd_calls: [
      {
        id: 3,
        name: { en: 'Smart City Technologies R&D Call', ar: 'دعوة بحث تقنيات المدن الذكية' },
        description: { en: 'IoT, AI, and data analytics research', ar: 'بحث إنترنت الأشياء والذكاء الاصطناعي' },
        budget: '5M SAR',
        duration: '18 months'
      }
    ],
    campaigns: [
      {
        id: 4,
        name: { en: 'Innovation Challenge Campaign', ar: 'حملة تحدي الابتكار' },
        description: { en: 'Launch innovation challenge across municipalities', ar: 'إطلاق تحدي الابتكار عبر البلديات' },
        phases: 4,
        duration: '3 months'
      }
    ],
    pilot_proposals: [
      {
        id: 5,
        name: { en: 'Smart Waste Management Pilot', ar: 'تجربة إدارة النفايات الذكية' },
        description: { en: 'IoT-enabled waste collection optimization', ar: 'تحسين جمع النفايات بإنترنت الأشياء' },
        duration: '6 months',
        budget: '500K SAR'
      }
    ]
  };

  const useTemplate = (template) => {
    toast.success(t({ en: `Template "${template.name.en}" cloned`, ar: `تم استنساخ القالب "${template.name.ar}"` }));
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'Template Library', ar: 'مكتبة القوالب' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Pre-built templates to accelerate planning', ar: 'قوالب معدة مسبقاً لتسريع التخطيط' })}
        </p>
      </div>

      <Tabs defaultValue="strategic_plans">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="strategic_plans">{t({ en: 'Strategic Plans', ar: 'خطط استراتيجية' })}</TabsTrigger>
          <TabsTrigger value="rd_calls">{t({ en: 'R&D Calls', ar: 'دعوات بحث' })}</TabsTrigger>
          <TabsTrigger value="campaigns">{t({ en: 'Campaigns', ar: 'حملات' })}</TabsTrigger>
          <TabsTrigger value="pilot_proposals">{t({ en: 'Pilot Proposals', ar: 'مقترحات تجارب' })}</TabsTrigger>
        </TabsList>

        {Object.keys(templates).map(category => (
          <TabsContent key={category} value={category}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates[category].map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-base" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      {template.name[language]}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 mb-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      {template.description[language]}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {template.themes && <Badge variant="outline">{template.themes} themes</Badge>}
                      {template.kpis && <Badge variant="outline">{template.kpis} KPIs</Badge>}
                      {template.budget && <Badge variant="outline">{template.budget}</Badge>}
                      {template.duration && <Badge variant="outline">{template.duration}</Badge>}
                      {template.phases && <Badge variant="outline">{template.phases} phases</Badge>}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => setSelectedTemplate(template)}>
                        <Eye className="h-3 w-3 mr-2" />
                        {t({ en: 'Preview', ar: 'معاينة' })}
                      </Button>
                      <Button size="sm" className="flex-1 bg-blue-600" onClick={() => useTemplate(template)}>
                        <Copy className="h-3 w-3 mr-2" />
                        {t({ en: 'Use', ar: 'استخدام' })}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {selectedTemplate?.name[language]}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-slate-600" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {selectedTemplate?.description[language]}
            </p>
            <div className="p-4 bg-slate-50 rounded border">
              <p className="text-xs text-slate-500 mb-2">{t({ en: 'Template includes:', ar: 'يتضمن القالب:' })}</p>
              <ul className="text-sm space-y-1">
                <li>• Pre-defined structure</li>
                <li>• Sample KPIs and metrics</li>
                <li>• Suggested milestones</li>
                <li>• Budget categories</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProtectedPage(TemplateLibrary, { requiredPermissions: [] });