import React from 'react';
import { useLanguage } from '../components/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, MessageSquare, Award } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import ProtectedPage from '../components/permissions/ProtectedPage';

function StakeholderAlignmentDashboard() {
  const { language, isRTL, t } = useLanguage();

  const stakeholders = [
    {
      id: 1,
      name: { en: 'Ministry of Transport', ar: 'وزارة النقل' },
      alignment: 78,
      touchpoints: 12,
      initiatives: 3,
      satisfaction: 85
    },
    {
      id: 2,
      name: { en: 'Ministry of Environment', ar: 'وزارة البيئة' },
      alignment: 45,
      touchpoints: 4,
      initiatives: 0,
      satisfaction: 60
    }
  ];

  const alignmentColor = (score) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          {t({ en: 'Stakeholder Alignment Dashboard', ar: 'لوحة توافق أصحاب المصلحة' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Track ministry and partner engagement', ar: 'تتبع مشاركة الوزارات والشركاء' })}
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{stakeholders.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Key Stakeholders', ar: 'أطراف رئيسية' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">
              {Math.round(stakeholders.reduce((sum, s) => sum + s.alignment, 0) / stakeholders.length)}%
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Avg Alignment', ar: 'متوسط التوافق' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <MessageSquare className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">
              {stakeholders.reduce((sum, s) => sum + s.touchpoints, 0)}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Touchpoints', ar: 'نقاط الاتصال' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Stakeholders */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Stakeholder Health', ar: 'صحة الأطراف' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {stakeholders.map(stakeholder => (
            <div key={stakeholder.id} className="p-4 border-2 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{stakeholder.name[language]}</h3>
                  <div className="grid grid-cols-3 gap-4 mt-3">
                    <div>
                      <p className="text-xs text-slate-500">{t({ en: 'Alignment', ar: 'التوافق' })}</p>
                      <p className={`text-2xl font-bold ${alignmentColor(stakeholder.alignment)}`}>
                        {stakeholder.alignment}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">{t({ en: 'Touchpoints', ar: 'نقاط الاتصال' })}</p>
                      <p className="text-2xl font-bold text-blue-600">{stakeholder.touchpoints}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">{t({ en: 'Initiatives', ar: 'المبادرات' })}</p>
                      <p className="text-2xl font-bold text-purple-600">{stakeholder.initiatives}</p>
                    </div>
                  </div>
                </div>
              </div>
              {stakeholder.alignment < 60 && (
                <Badge className="bg-red-600">
                  {t({ en: 'Action Required: Increase Engagement', ar: 'إجراء مطلوب: زيادة المشاركة' })}
                </Badge>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(StakeholderAlignmentDashboard, { requiredPermissions: [] });