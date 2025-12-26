import { useLanguage } from '../components/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle2, XCircle } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function ValidationRulesEngine() {
  const { language, isRTL, t } = useLanguage();

  const rules = [
    {
      id: 1,
      entity: 'Challenge',
      field: 'budget_estimate',
      rule: { en: 'Must be > 0 and < 100M SAR', ar: 'يجب أن يكون > 0 و < 100 مليون ريال' },
      active: true,
      violations: 3
    },
    {
      id: 2,
      entity: 'Pilot',
      field: 'duration_weeks',
      rule: { en: 'Must be between 4 and 52 weeks', ar: 'يجب أن يكون بين 4 و 52 أسبوع' },
      active: true,
      violations: 0
    },
    {
      id: 3,
      entity: 'Solution',
      field: 'maturity_level',
      rule: { en: 'Must be one of: concept, prototype, pilot_ready, market_ready, proven', ar: 'يجب أن يكون: concept، prototype، pilot_ready، market_ready، proven' },
      active: true,
      violations: 1
    }
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            {t({ en: 'Validation Rules Engine', ar: 'محرك قواعد التحقق' })}
          </h1>
          <p className="text-slate-600 mt-2">
            {t({ en: 'Define and manage data validation rules', ar: 'تعريف وإدارة قواعد التحقق من البيانات' })}
          </p>
        </div>
        <Button className="bg-blue-600">
          {t({ en: 'Add Rule', ar: 'إضافة قاعدة' })}
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{rules.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Active Rules', ar: 'قواعد نشطة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">
              {rules.filter(r => r.violations === 0).length}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Passing Rules', ar: 'قواعد نافذة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-white">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-red-600">
              {rules.reduce((sum, r) => sum + r.violations, 0)}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Violations', ar: 'انتهاكات' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Rules List */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Validation Rules', ar: 'قواعد التحقق' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {rules.map(rule => (
            <div key={rule.id} className="p-4 border-2 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{rule.entity}</Badge>
                    <Badge className={rule.active ? 'bg-green-600' : 'bg-slate-600'}>
                      {rule.active ? t({ en: 'Active', ar: 'نشط' }) : t({ en: 'Inactive', ar: 'غير نشط' })}
                    </Badge>
                    {rule.violations > 0 && (
                      <Badge className="bg-red-600">{rule.violations} {t({ en: 'violations', ar: 'انتهاك' })}</Badge>
                    )}
                  </div>
                  <p className="font-medium text-slate-900">{rule.field}</p>
                  <p className="text-sm text-slate-600 mt-1">{rule.rule[language]}</p>
                </div>
                <Button variant="outline" size="sm">
                  {t({ en: 'Edit', ar: 'تحرير' })}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(ValidationRulesEngine, { requireAdmin: true });
