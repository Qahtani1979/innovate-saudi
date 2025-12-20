import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { BookOpen, Download } from 'lucide-react';

export default function PartnershipPlaybookLibrary() {
  const { language, t } = useLanguage();

  const playbooks = [
    {
      title: { en: 'R&D Collaboration Playbook', ar: 'دليل التعاون البحثي' },
      type: 'rd_collaboration',
      context: { en: 'University + Municipality', ar: 'جامعة + بلدية' },
      timeline: { en: '12 months', ar: '12 شهر' },
      milestones: 3,
      typical_deliverables: { en: 'Research report, Pilot design, Publications', ar: 'تقرير بحثي، تصميم تجربة، منشورات' },
      success_rate: 85
    },
    {
      title: { en: 'Pilot Partnership Playbook', ar: 'دليل شراكة التجربة' },
      type: 'pilot_partnership',
      context: { en: 'Municipality + Startup', ar: 'بلدية + شركة ناشئة' },
      timeline: { en: '6-9 months', ar: '6-9 أشهر' },
      milestones: 4,
      typical_deliverables: { en: 'Pilot execution, KPI report, Scale recommendation', ar: 'تنفيذ التجربة، تقرير المؤشرات، توصية التوسع' },
      success_rate: 72
    },
    {
      title: { en: 'Strategic Alliance Playbook', ar: 'دليل التحالف الاستراتيجي' },
      type: 'strategic_alliance',
      context: { en: 'Multiple Organizations', ar: 'منظمات متعددة' },
      timeline: { en: '18-24 months', ar: '18-24 شهر' },
      milestones: 5,
      typical_deliverables: { en: 'Joint initiatives, Shared programs, Policy impact', ar: 'مبادرات مشتركة، برامج مشتركة، تأثير السياسة' },
      success_rate: 68
    },
    {
      title: { en: 'Data Sharing Agreement Playbook', ar: 'دليل اتفاقية مشاركة البيانات' },
      type: 'data_sharing',
      context: { en: 'Municipality + Research Center', ar: 'بلدية + مركز بحثي' },
      timeline: { en: '3-6 months', ar: '3-6 أشهر' },
      milestones: 2,
      typical_deliverables: { en: 'Data access, Analysis reports, Insights', ar: 'الوصول للبيانات، تقارير التحليل، الرؤى' },
      success_rate: 90
    }
  ];

  return (
    <Card className="border-2 border-indigo-300">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-indigo-600" />
          {t({ en: 'Partnership Playbook Library', ar: 'مكتبة أدلة الشراكات' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {playbooks.map((playbook, i) => (
            <div key={i} className="p-4 bg-white rounded-lg border-2 border-indigo-200 hover:border-indigo-400 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 mb-1">{playbook.title[language]}</h4>
                  <p className="text-xs text-slate-600">{playbook.context[language]}</p>
                </div>
                <Badge className="bg-green-600">
                  {playbook.success_rate}% success
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="text-center p-2 bg-slate-50 rounded">
                  <p className="text-xs text-slate-500">{t({ en: 'Timeline', ar: 'الجدول' })}</p>
                  <p className="text-sm font-semibold text-slate-900">{playbook.timeline[language]}</p>
                </div>
                <div className="text-center p-2 bg-slate-50 rounded">
                  <p className="text-xs text-slate-500">{t({ en: 'Milestones', ar: 'المعالم' })}</p>
                  <p className="text-sm font-semibold text-slate-900">{playbook.milestones}</p>
                </div>
                <div className="text-center p-2 bg-slate-50 rounded">
                  <p className="text-xs text-slate-500">{t({ en: 'Type', ar: 'النوع' })}</p>
                  <p className="text-xs font-semibold text-slate-900">{playbook.type}</p>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Typical Deliverables:', ar: 'التسليمات النموذجية:' })}</p>
                <p className="text-sm text-slate-700">{playbook.typical_deliverables[language]}</p>
              </div>

              <Button variant="outline" size="sm" className="w-full">
                <Download className="h-3 w-3 mr-2" />
                {t({ en: 'Use This Playbook', ar: 'استخدم هذا الدليل' })}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-indigo-50 rounded border border-indigo-200 text-xs text-slate-600">
          {t({ 
            en: '📚 Playbooks extracted from 50+ successful partnerships. Use as templates for faster setup.', 
            ar: '📚 الأدلة مستخرجة من 50+ شراكة ناجحة. استخدم كقوالب لإعداد أسرع.' 
          })}
        </div>
      </CardContent>
    </Card>
  );
}