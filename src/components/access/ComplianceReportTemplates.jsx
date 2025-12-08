import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { FileCheck, Download, Calendar } from 'lucide-react';

export default function ComplianceReportTemplates({ onGenerate }) {
  const { language, isRTL, t } = useLanguage();

  const templates = [
    {
      name: { en: 'User Access Review', ar: 'مراجعة وصول المستخدمين' },
      description: { en: 'Quarterly user access compliance report', ar: 'تقرير امتثال وصول المستخدمين الفصلي' },
      frequency: 'Quarterly',
      lastGenerated: '2025-01-01'
    },
    {
      name: { en: 'Security Audit Report', ar: 'تقرير التدقيق الأمني' },
      description: { en: 'Comprehensive security and access audit', ar: 'تدقيق شامل للأمان والوصول' },
      frequency: 'Monthly',
      lastGenerated: '2025-01-15'
    },
    {
      name: { en: 'Role & Permission Review', ar: 'مراجعة الأدوار والصلاحيات' },
      description: { en: 'Review of all roles and their permissions', ar: 'مراجعة جميع الأدوار وصلاحياتها' },
      frequency: 'Annual',
      lastGenerated: '2024-12-01'
    },
    {
      name: { en: 'Anomaly Detection Report', ar: 'تقرير اكتشاف الشذوذ' },
      description: { en: 'AI-flagged suspicious activity summary', ar: 'ملخص النشاط المشبوه المكتشف بالذكاء' },
      frequency: 'Weekly',
      lastGenerated: '2025-01-20'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-emerald-600" />
          {t({ en: 'Compliance Report Templates', ar: 'قوالب تقارير الامتثال' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {templates.map((template, i) => (
          <div key={i} className="p-4 bg-slate-50 rounded-lg border-2 hover:border-emerald-300 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900">{template.name[language]}</h4>
                <p className="text-xs text-slate-600 mt-1">{template.description[language]}</p>
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="outline" className="text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    {template.frequency}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    {t({ en: 'Last:', ar: 'آخر:' })} {template.lastGenerated}
                  </span>
                </div>
              </div>
              <Button size="sm" onClick={() => onGenerate?.(template)} className="bg-emerald-600">
                <Download className="h-3 w-3 mr-1" />
                {t({ en: 'Generate', ar: 'توليد' })}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}