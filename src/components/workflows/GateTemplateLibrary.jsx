import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Library, Copy } from 'lucide-react';

export default function GateTemplateLibrary({ onApplyTemplate }) {
  const { language, isRTL, t } = useLanguage();

  const templates = [
    {
      name: { en: 'Standard Approval Gate', ar: 'بوابة الموافقة القياسية' },
      description: { en: 'Basic approval with single reviewer', ar: 'موافقة أساسية مع مراجع واحد' },
      steps: 3,
      approvers: 1,
      sla_days: 5
    },
    {
      name: { en: 'Multi-Level Approval', ar: 'موافقة متعددة المستويات' },
      description: { en: 'Sequential approval by multiple stakeholders', ar: 'موافقة تسلسلية من عدة أطراف' },
      steps: 5,
      approvers: 3,
      sla_days: 10
    },
    {
      name: { en: 'Budget Approval Gate', ar: 'بوابة موافقة الميزانية' },
      description: { en: 'Financial approval with budget thresholds', ar: 'موافقة مالية مع حدود الميزانية' },
      steps: 4,
      approvers: 2,
      sla_days: 7
    },
    {
      name: { en: 'Compliance Check Gate', ar: 'بوابة فحص الامتثال' },
      description: { en: 'Regulatory compliance verification', ar: 'التحقق من الامتثال التنظيمي' },
      steps: 6,
      approvers: 2,
      sla_days: 14
    },
    {
      name: { en: 'Quality Review Gate', ar: 'بوابة مراجعة الجودة' },
      description: { en: 'Technical and quality assessment', ar: 'التقييم الفني والجودة' },
      steps: 4,
      approvers: 3,
      sla_days: 7
    }
  ];

  return (
    <Card className="border-2 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Library className="h-5 w-5 text-purple-600" />
          {t({ en: 'Gate Template Library', ar: 'مكتبة قوالب البوابات' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {templates.map((template, i) => (
          <div key={i} className="p-4 bg-slate-50 rounded-lg border hover:border-purple-300 transition-all">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900">{template.name[language]}</h4>
                <p className="text-sm text-slate-600 mt-1">{template.description[language]}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">{template.steps} steps</Badge>
                  <Badge variant="outline" className="text-xs">{template.approvers} approvers</Badge>
                  <Badge variant="outline" className="text-xs">{template.sla_days}d SLA</Badge>
                </div>
              </div>
              <Button size="sm" onClick={() => onApplyTemplate?.(template)} className="bg-purple-600">
                <Copy className="h-3 w-3 mr-1" />
                {t({ en: 'Use', ar: 'استخدام' })}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
