import { useLanguage } from '@/components/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle2, Lock } from 'lucide-react';

export default function AccessRulesContent() {
  const { language, isRTL, t } = useLanguage();

  const rules = [
    {
      id: 1,
      name: { en: 'Executive Portal Access', ar: 'الوصول لبوابة القيادة' },
      conditions: ['role = executive', 'municipality approved'],
      action: 'Allow',
      active: true
    },
    {
      id: 2,
      name: { en: 'Sandbox Admin Access', ar: 'وصول مدير المنطقة' },
      conditions: ['role = admin', 'certification = sandbox_admin'],
      action: 'Allow',
      active: true
    },
    {
      id: 3,
      name: { en: 'Budget Approval Authority', ar: 'صلاحية الموافقة على الميزانية' },
      conditions: ['role = financial_officer', 'budget_limit > 0'],
      action: 'Allow',
      active: true
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {t({ en: 'Conditional Access Rules', ar: 'قواعد الوصول المشروط' })}
          </h2>
          <p className="text-muted-foreground mt-1">
            {t({ en: 'Define context-aware access control policies', ar: 'تعريف سياسات التحكم بالوصول الذكي' })}
          </p>
        </div>
        <Button className="bg-blue-600">
          {t({ en: 'Add Rule', ar: 'إضافة قاعدة' })}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-background">
          <CardContent className="pt-6 text-center">
            <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{rules.length}</p>
            <p className="text-sm text-muted-foreground">{t({ en: 'Total Rules', ar: 'إجمالي القواعد' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-background">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{rules.filter(r => r.active).length}</p>
            <p className="text-sm text-muted-foreground">{t({ en: 'Active', ar: 'نشط' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-background">
          <CardContent className="pt-6 text-center">
            <Lock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{rules.filter(r => r.action === 'Allow').length}</p>
            <p className="text-sm text-muted-foreground">{t({ en: 'Allow Rules', ar: 'قواعد السماح' })}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Access Rules', ar: 'قواعد الوصول' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {rules.map(rule => (
            <div key={rule.id} className="p-4 border-2 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-foreground">{rule.name[language]}</h4>
                    <Badge className={rule.active ? 'bg-green-600' : 'bg-slate-600'}>
                      {rule.active ? t({ en: 'Active', ar: 'نشط' }) : t({ en: 'Inactive', ar: 'غير نشط' })}
                    </Badge>
                    <Badge className={rule.action === 'Allow' ? 'bg-blue-600' : 'bg-red-600'}>
                      {rule.action}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{t({ en: 'Conditions:', ar: 'الشروط:' })}</p>
                    {rule.conditions.map((cond, i) => (
                      <p key={i} className="text-sm text-muted-foreground pl-4">• {cond}</p>
                    ))}
                  </div>
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
