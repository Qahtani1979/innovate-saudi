import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { FileText, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from './LanguageContext';

const CHALLENGE_TEMPLATES = [
  {
    id: 'drainage_flooding',
    title_en: 'Drainage & Flooding Issues',
    title_ar: 'مشاكل الصرف والفيضانات',
    sector: 'environment',
    description_en: 'Recurring drainage blockages and flooding during rain seasons',
    description_ar: 'انسداد متكرر في الصرف والفيضانات خلال مواسم الأمطار',
    priority: 'tier_2',
    track: 'pilot',
    kpis: [
      { name: 'Complaints per month', baseline: '120', target: '40' },
      { name: 'Response time (hours)', baseline: '48', target: '12' }
    ]
  },
  {
    id: 'traffic_congestion',
    title_en: 'Traffic Congestion Hotspots',
    title_ar: 'نقاط الازدحام المروري',
    sector: 'transport',
    description_en: 'Severe congestion at key intersections during peak hours',
    description_ar: 'ازدحام شديد في التقاطعات الرئيسية خلال ساعات الذروة',
    priority: 'tier_1',
    track: 'pilot',
    kpis: [
      { name: 'Average delay (minutes)', baseline: '25', target: '10' },
      { name: 'Traffic flow (vehicles/hour)', baseline: '800', target: '1200' }
    ]
  },
  {
    id: 'waste_collection',
    title_en: 'Waste Collection Optimization',
    title_ar: 'تحسين جمع النفايات',
    sector: 'environment',
    description_en: 'Inefficient waste collection routes and schedules',
    description_ar: 'مسارات ومواعيد غير فعالة لجمع النفايات',
    priority: 'tier_3',
    track: 'pilot',
    kpis: [
      { name: 'Collection efficiency (%)', baseline: '65', target: '85' },
      { name: 'Fuel costs (SAR/month)', baseline: '50000', target: '35000' }
    ]
  }
];

const PILOT_TEMPLATES = [
  {
    id: 'smart_sensor_pilot',
    title_en: 'Smart Sensor Deployment Pilot',
    title_ar: 'تجربة نشر المستشعرات الذكية',
    sector: 'environment',
    duration_weeks: 8,
    trl_start: 7,
    budget: 500000,
    kpis: [
      { name: 'Sensor uptime (%)', baseline: '0', target: '95' },
      { name: 'Data accuracy (%)', baseline: '0', target: '90' }
    ]
  },
  {
    id: 'ai_traffic_pilot',
    title_en: 'AI Traffic Optimization Pilot',
    title_ar: 'تجربة تحسين المرور بالذكاء الاصطناعي',
    sector: 'transport',
    duration_weeks: 12,
    trl_start: 8,
    budget: 800000,
    kpis: [
      { name: 'Congestion reduction (%)', baseline: '0', target: '25' },
      { name: 'Average speed increase (%)', baseline: '0', target: '20' }
    ]
  }
];

export default function TemplateLibrary({ entityType, onUseTemplate }) {
  const { language, isRTL, t } = useLanguage();
  const [open, setOpen] = useState(false);

  const templates = entityType === 'Challenge' ? CHALLENGE_TEMPLATES : PILOT_TEMPLATES;

  const handleUseTemplate = (template) => {
    onUseTemplate(template);
    setOpen(false);
    toast.success(t({ en: 'Template applied', ar: 'تم تطبيق القالب' }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          {t({ en: 'Use Template', ar: 'استخدام قالب' })}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {t({ en: `${entityType} Templates`, ar: `قوالب ${entityType === 'Challenge' ? 'التحديات' : 'التجارب'}` })}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
          {templates.map((template) => (
            <Card key={template.id} className="hover:border-blue-300 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {language === 'ar' && template.title_ar ? template.title_ar : template.title_en}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="capitalize">
                        {template.sector?.replace(/_/g, ' ')}
                      </Badge>
                      {template.priority && (
                        <Badge variant="outline">{template.priority}</Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleUseTemplate(template)}
                    className="bg-gradient-to-r from-blue-600 to-teal-600"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {t({ en: 'Use', ar: 'استخدام' })}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700">
                  {language === 'ar' && template.description_ar ? template.description_ar : template.description_en}
                </p>
                {template.kpis && (
                  <div className="mt-3">
                    <p className="text-xs text-slate-500 mb-2">Included KPIs:</p>
                    <div className="flex flex-wrap gap-2">
                      {template.kpis.map((kpi, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {kpi.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}