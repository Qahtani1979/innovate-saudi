import { useLanguage } from '../components/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import ProtectedPage from '../components/permissions/ProtectedPage';

function OKRManagementSystem() {
  const { language, isRTL, t } = useLanguage();

  // Mock OKR data
  const okrs = [
    {
      id: 'okr-1',
      level: 'national',
      objective: { en: 'Achieve 90% MII average nationwide', ar: 'تحقيق متوسط MII 90% وطنياً' },
      key_results: [
        { name: { en: '50 municipalities >85 MII', ar: '50 بلدية >85 MII' }, current: 23, target: 50, progress: 46 },
        { name: { en: '150 pilots scaled', ar: '150 تجربة موسعة' }, current: 78, target: 150, progress: 52 },
        { name: { en: '200 challenges resolved', ar: '200 تحدي محلول' }, current: 145, target: 200, progress: 73 }
      ],
      overall_progress: 57,
      owner: 'National Team'
    },
    {
      id: 'okr-2',
      level: 'directorate',
      objective: { en: 'Accelerate pilot execution by 40%', ar: 'تسريع تنفيذ التجارب بنسبة 40%' },
      key_results: [
        { name: { en: 'Reduce approval time to 15 days', ar: 'تقليل وقت الموافقة لـ 15 يوم' }, current: 18, target: 15, progress: 83 },
        { name: { en: 'Launch 60 pilots this year', ar: 'إطلاق 60 تجربة هذا العام' }, current: 34, target: 60, progress: 57 }
      ],
      overall_progress: 70,
      owner: 'Innovation Directorate'
    }
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            {t({ en: 'OKR Management System', ar: 'نظام إدارة OKR' })}
          </h1>
          <p className="text-slate-600 mt-2">
            {t({ en: 'Objectives & Key Results tracking', ar: 'تتبع الأهداف والنتائج الرئيسية' })}
          </p>
        </div>
        <Button className="bg-blue-600">
          {t({ en: 'Create OKR', ar: 'إنشاء OKR' })}
        </Button>
      </div>

      {/* OKRs */}
      <div className="space-y-4">
        {okrs.map(okr => (
          <Card key={okr.id} className="border-2">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={okr.level === 'national' ? 'bg-purple-600' : 'bg-blue-600'}>
                      {okr.level}
                    </Badge>
                    <Badge variant="outline">{okr.owner}</Badge>
                  </div>
                  <CardTitle className="text-xl">{okr.objective[language]}</CardTitle>
                  <div className="mt-3">
                    <Progress value={okr.overall_progress} className="h-3" />
                    <p className="text-sm text-slate-600 mt-1">
                      {t({ en: 'Overall Progress', ar: 'التقدم الإجمالي' })}: {okr.overall_progress}%
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <h4 className="font-semibold text-sm text-slate-700">
                {t({ en: 'Key Results', ar: 'النتائج الرئيسية' })}
              </h4>
              {okr.key_results.map((kr, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-900">{kr.name[language]}</span>
                    <Badge className={kr.progress >= 70 ? 'bg-green-600' : kr.progress >= 50 ? 'bg-yellow-600' : 'bg-red-600'}>
                      {kr.progress}%
                    </Badge>
                  </div>
                  <Progress value={kr.progress} className="h-2 mb-1" />
                  <p className="text-xs text-slate-600">
                    {t({ en: 'Current', ar: 'الحالي' })}: {kr.current} / {t({ en: 'Target', ar: 'الهدف' })}: {kr.target}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ProtectedPage(OKRManagementSystem, { requiredPermissions: [] });
