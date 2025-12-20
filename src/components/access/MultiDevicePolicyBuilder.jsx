import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from '../LanguageContext';
import { Smartphone, Save } from 'lucide-react';

export default function MultiDevicePolicyBuilder({ onSave }) {
  const { language, isRTL, t } = useLanguage();
  const [policy, setPolicy] = useState({
    max_concurrent_sessions: 3,
    allow_multiple_devices: true,
    require_verification_new_device: true,
    auto_logout_old_sessions: true,
    block_suspicious_devices: true,
    trusted_device_duration_days: 90
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-indigo-600" />
          {t({ en: 'Multi-Device Policy', ar: 'سياسة الأجهزة المتعددة' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            {t({ en: 'Max Concurrent Sessions', ar: 'الحد الأقصى للجلسات المتزامنة' })}
          </label>
          <Input
            type="number"
            value={policy.max_concurrent_sessions}
            onChange={(e) => setPolicy({...policy, max_concurrent_sessions: parseInt(e.target.value)})}
            min="1"
            max="10"
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div>
            <p className="font-medium text-sm">{t({ en: 'Allow Multiple Devices', ar: 'السماح بأجهزة متعددة' })}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Users can login from multiple devices', ar: 'يمكن للمستخدمين الدخول من أجهزة متعددة' })}</p>
          </div>
          <Switch
            checked={policy.allow_multiple_devices}
            onCheckedChange={(v) => setPolicy({...policy, allow_multiple_devices: v})}
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div>
            <p className="font-medium text-sm">{t({ en: 'Verify New Devices', ar: 'التحقق من الأجهزة الجديدة' })}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Require verification for new devices', ar: 'يتطلب التحقق للأجهزة الجديدة' })}</p>
          </div>
          <Switch
            checked={policy.require_verification_new_device}
            onCheckedChange={(v) => setPolicy({...policy, require_verification_new_device: v})}
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div>
            <p className="font-medium text-sm">{t({ en: 'Auto-Logout Old Sessions', ar: 'تسجيل خروج تلقائي للجلسات القديمة' })}</p>
            <p className="text-xs text-slate-600">{t({ en: 'When limit reached, logout oldest session', ar: 'عند الوصول للحد، إنهاء الجلسة الأقدم' })}</p>
          </div>
          <Switch
            checked={policy.auto_logout_old_sessions}
            onCheckedChange={(v) => setPolicy({...policy, auto_logout_old_sessions: v})}
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div>
            <p className="font-medium text-sm">{t({ en: 'Block Suspicious Devices', ar: 'حظر الأجهزة المشبوهة' })}</p>
            <p className="text-xs text-slate-600">{t({ en: 'AI-detected suspicious devices blocked', ar: 'حظر الأجهزة المشبوهة المكتشفة بالذكاء' })}</p>
          </div>
          <Switch
            checked={policy.block_suspicious_devices}
            onCheckedChange={(v) => setPolicy({...policy, block_suspicious_devices: v})}
          />
        </div>

        <Button onClick={() => onSave?.(policy)} className="w-full bg-indigo-600">
          <Save className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t({ en: 'Save Policy', ar: 'حفظ السياسة' })}
        </Button>
      </CardContent>
    </Card>
  );
}