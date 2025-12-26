import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Handshake, CheckCircle2, TrendingUp } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useMOUs } from '@/hooks/useMOUs';

function PartnershipMOUTracker() {
  const { language, isRTL, t } = useLanguage();

  const { data: partnerships = [] } = useMOUs();

  const active = partnerships.filter(p => p.status === 'active').length;
  const avgHealth = partnerships.length > 0
    ? Math.round(partnerships.reduce((sum, p) => sum + (p.health_score || 70), 0) / partnerships.length)
    : 0;

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          {t({ en: 'Partnership & MOU Tracker', ar: 'متتبع الشراكات والاتفاقيات' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Track strategic partnerships and agreements', ar: 'تتبع الشراكات الاستراتيجية والاتفاقيات' })}
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Handshake className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{partnerships.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Total Partnerships', ar: 'إجمالي الشراكات' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{active}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Active', ar: 'نشط' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{avgHealth}%</p>
            <p className="text-sm text-slate-600">{t({ en: 'Avg Health', ar: 'متوسط الصحة' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Partnerships */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Strategic Partnerships', ar: 'الشراكات الاستراتيجية' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {partnerships.map(partnership => (
            <div key={partnership.id} className="p-4 border-2 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">
                    {language === 'ar' && partnership.name_ar ? partnership.name_ar : partnership.name_en || partnership.id}
                  </h3>
                  <Badge className={partnership.status === 'active' ? 'bg-green-600' : 'bg-slate-600'}>
                    {partnership.status}
                  </Badge>
                </div>
                {partnership.health_score && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{partnership.health_score}%</p>
                    <p className="text-xs text-slate-500">{t({ en: 'Health', ar: 'الصحة' })}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
          {partnerships.length === 0 && (
            <p className="text-center text-slate-500 py-8">
              {t({ en: 'No partnerships yet', ar: 'لا توجد شراكات بعد' })}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(PartnershipMOUTracker, { requiredPermissions: [] });
