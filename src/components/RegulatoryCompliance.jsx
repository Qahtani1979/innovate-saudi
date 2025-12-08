import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from './LanguageContext';
import { Shield, CheckCircle2, XCircle, AlertCircle, FileText } from 'lucide-react';

export default function RegulatoryCompliance({ pilot }) {
  const { language, isRTL, t } = useLanguage();

  const complianceChecks = [
    { 
      id: 1, 
      name: { en: 'Public Safety Assessment', ar: 'تقييم السلامة العامة' },
      status: 'approved',
      reviewer: 'Safety Department',
      date: '2025-01-10'
    },
    { 
      id: 2, 
      name: { en: 'Data Privacy Compliance', ar: 'امتثال خصوصية البيانات' },
      status: 'approved',
      reviewer: 'Legal Team',
      date: '2025-01-12'
    },
    { 
      id: 3, 
      name: { en: 'Environmental Impact', ar: 'الأثر البيئي' },
      status: 'pending',
      reviewer: 'Environmental Affairs',
      date: null
    },
    { 
      id: 4, 
      name: { en: 'Technical Standards', ar: 'المعايير التقنية' },
      status: 'approved',
      reviewer: 'Technical Committee',
      date: '2025-01-15'
    }
  ];

  const exemptions = pilot?.regulatory_exemptions || [
    'Operating hours flexibility (6am-midnight)',
    'Vehicle weight limit exemption',
    'Temporary signage approval'
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending': return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default: return <Shield className="h-5 w-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const approvedCount = complianceChecks.filter(c => c.status === 'approved').length;
  const totalCount = complianceChecks.length;
  const complianceRate = (approvedCount / totalCount) * 100;

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            {t({ en: 'Regulatory Compliance Status', ar: 'حالة الامتثال التنظيمي' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Compliance Rate', ar: 'معدل الامتثال' })}</p>
                <p className="text-3xl font-bold text-blue-600">{complianceRate.toFixed(0)}%</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600">{t({ en: 'Status', ar: 'الحالة' })}</p>
                <Badge className={complianceRate === 100 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                  {complianceRate === 100 ? t({ en: 'Fully Compliant', ar: 'مطابق بالكامل' }) : t({ en: 'In Progress', ar: 'قيد التنفيذ' })}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {complianceChecks.map((check) => (
              <div key={check.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                {getStatusIcon(check.status)}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-sm">{t(check.name)}</p>
                    <Badge className={getStatusColor(check.status)} variant="outline">
                      {check.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">{check.reviewer}</p>
                  {check.date && (
                    <p className="text-xs text-slate-400 mt-1">{t({ en: 'Approved on', ar: 'تمت الموافقة في' })} {check.date}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {exemptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-600" />
              {t({ en: 'Regulatory Exemptions', ar: 'الاستثناءات التنظيمية' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {exemptions.map((exemption, idx) => (
                <div key={idx} className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <Shield className="h-4 w-4 text-amber-600 mt-0.5" />
                  <p className="text-sm text-slate-700">{exemption}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                ⚠️ {t({ en: 'All exemptions are valid only within the designated sandbox zone and pilot duration', ar: 'جميع الاستثناءات صالحة فقط ضمن منطقة الاختبار المحددة ومدة التجربة' })}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}