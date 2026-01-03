import { useLanguage } from '../components/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, TrendingUp } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function StrategicCommunicationsHub() {
  const { language, isRTL, t } = useLanguage();

  const communications = [
    {
      id: 1,
      type: 'briefing',
      title: { en: 'Q1 2025 Ministerial Briefing', ar: 'إحاطة وزارية الربع الأول 2025' },
      audience: { en: 'Ministers & Mayors', ar: 'الوزراء ورؤساء البلديات' },
      sent: 12,
      date: '2025-01-15'
    },
    {
      id: 2,
      type: 'campaign',
      title: { en: 'Innovation Month Campaign', ar: 'حملة شهر الابتكار' },
      audience: { en: 'Public & Media', ar: 'الجمهور والإعلام' },
      reach: 3400,
      date: '2025-03-01'
    }
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            {t({ en: 'Strategic Communications Hub', ar: 'مركز الاتصالات الاستراتيجية' })}
          </h1>
          <p className="text-slate-600 mt-2">
            {t({ en: 'Stakeholder updates and campaigns', ar: 'تحديثات الأطراف والحملات' })}
          </p>
        </div>
        <Button className="bg-blue-600">
          {t({ en: 'Create Briefing', ar: 'إنشاء إحاطة' })}
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{communications.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Communications', ar: 'اتصالات' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">
              {communications.reduce((sum, c) => sum + (c.sent || c.reach || 0), 0)}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Total Reach', ar: 'إجمالي الوصول' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">4.2/5</p>
            <p className="text-sm text-slate-600">{t({ en: 'Avg Satisfaction', ar: 'متوسط الرضا' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Communications List */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Recent Communications', ar: 'الاتصالات الأخيرة' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {communications.map(comm => (
            <div key={comm.id} className="p-4 border-2 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={comm.type === 'briefing' ? 'bg-blue-600' : 'bg-purple-600'}>
                      {comm.type}
                    </Badge>
                    <Badge variant="outline">{comm.date}</Badge>
                  </div>
                  <h3 className="font-semibold text-slate-900">{comm.title[language]}</h3>
                  <p className="text-sm text-slate-600 mt-1">{comm.audience[language]}</p>
                </div>
                <Button variant="outline" size="sm">
                  {t({ en: 'View', ar: 'عرض' })}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(StrategicCommunicationsHub, { requiredPermissions: ['communications_manage'], requireAdmin: true });
