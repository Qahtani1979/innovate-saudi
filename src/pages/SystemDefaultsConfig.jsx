import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from '../components/LanguageContext';
import { Settings, Clock, Target, AlertTriangle, Save } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function SystemDefaultsConfig() {
  const { language, isRTL, t } = useLanguage();
  const [defaults, setDefaults] = useState({
    default_challenge_status: 'draft',
    default_pilot_duration: 90,
    default_approval_sla: 5,
    escalation_after_days: 3,
    auto_archive_after_days: 365,
    business_hours_start: '08:00',
    business_hours_end: '17:00'
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-600 via-gray-600 to-zinc-600 p-8 text-white">
        <h1 className="text-5xl font-bold mb-2">
          {t({ en: '⚙️ System Defaults & Rules', ar: '⚙️ الافتراضات والقواعد النظامية' })}
        </h1>
        <p className="text-xl text-white/90">
          {t({ en: 'Configure default behaviors, SLAs, escalations, and business rules', ar: 'تكوين السلوكيات الافتراضية، اتفاقيات مستوى الخدمة، التصعيد، وقواعد العمل' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Default Statuses', ar: 'الحالات الافتراضية' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'New Challenge Status', ar: 'حالة التحدي الجديد' })}</label>
              <Select value={defaults.default_challenge_status} onValueChange={(v) => setDefaults({...defaults, default_challenge_status: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Default Pilot Duration (days)', ar: 'مدة التجربة الافتراضية (أيام)' })}</label>
              <Input type="number" value={defaults.default_pilot_duration} onChange={(e) => setDefaults({...defaults, default_pilot_duration: parseInt(e.target.value)})} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'SLA & Escalation', ar: 'اتفاقية مستوى الخدمة والتصعيد' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Approval SLA (days)', ar: 'اتفاقية الموافقة (أيام)' })}</label>
              <Input type="number" value={defaults.default_approval_sla} onChange={(e) => setDefaults({...defaults, default_approval_sla: parseInt(e.target.value)})} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Escalate After (days)', ar: 'التصعيد بعد (أيام)' })}</label>
              <Input type="number" value={defaults.escalation_after_days} onChange={(e) => setDefaults({...defaults, escalation_after_days: parseInt(e.target.value)})} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Business Hours', ar: 'ساعات العمل' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Start Time', ar: 'وقت البدء' })}</label>
              <Input type="time" value={defaults.business_hours_start} onChange={(e) => setDefaults({...defaults, business_hours_start: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'End Time', ar: 'وقت الانتهاء' })}</label>
              <Input type="time" value={defaults.business_hours_end} onChange={(e) => setDefaults({...defaults, business_hours_end: e.target.value})} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Auto-Archive', ar: 'الأرشفة التلقائية' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Archive Inactive Records After (days)', ar: 'أرشفة السجلات غير النشطة بعد (أيام)' })}</label>
              <Input type="number" value={defaults.auto_archive_after_days} onChange={(e) => setDefaults({...defaults, auto_archive_after_days: parseInt(e.target.value)})} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Button className="w-full bg-slate-700 text-lg py-6">
        <Save className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
        {t({ en: 'Save System Defaults', ar: 'حفظ الافتراضات النظامية' })}
      </Button>
    </div>
  );
}

export default ProtectedPage(SystemDefaultsConfig, { requireAdmin: true });