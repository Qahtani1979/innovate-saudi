import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from '../LanguageContext';
import { Clock, Save } from 'lucide-react';

export default function SessionTimeoutConfig({ onSave }) {
  const { language, isRTL, t } = useLanguage();
  const [config, setConfig] = useState({
    enabled: true,
    timeout_minutes: 30,
    warning_minutes: 5,
    remember_me_enabled: true,
    remember_me_days: 30,
    force_logout_inactive: true
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-600" />
          {t({ en: 'Session Timeout Configuration', ar: 'إعدادات انتهاء الجلسة' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
          <div>
            <p className="font-medium">{t({ en: 'Enable Session Timeout', ar: 'تفعيل انتهاء الجلسة' })}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Auto-logout after inactivity', ar: 'تسجيل خروج تلقائي بعد عدم النشاط' })}</p>
          </div>
          <Switch
            checked={config.enabled}
            onCheckedChange={(checked) => setConfig({...config, enabled: checked})}
          />
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t({ en: 'Timeout Duration (minutes)', ar: 'مدة الانتظار (دقائق)' })}
            </label>
            <Select 
              value={config.timeout_minutes.toString()} 
              onValueChange={(v) => setConfig({...config, timeout_minutes: parseInt(v)})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
                <SelectItem value="240">4 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              {t({ en: 'Warning Before Timeout (minutes)', ar: 'تحذير قبل الانتهاء (دقائق)' })}
            </label>
            <Input
              type="number"
              value={config.warning_minutes}
              onChange={(e) => setConfig({...config, warning_minutes: parseInt(e.target.value)})}
              min="1"
              max="10"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium">{t({ en: 'Enable "Remember Me"', ar: 'تفعيل "تذكرني"' })}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Allow extended sessions', ar: 'السماح بجلسات ممتدة' })}</p>
            </div>
            <Switch
              checked={config.remember_me_enabled}
              onCheckedChange={(checked) => setConfig({...config, remember_me_enabled: checked})}
            />
          </div>

          {config.remember_me_enabled && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t({ en: 'Remember Me Duration (days)', ar: 'مدة تذكرني (أيام)' })}
              </label>
              <Input
                type="number"
                value={config.remember_me_days}
                onChange={(e) => setConfig({...config, remember_me_days: parseInt(e.target.value)})}
                min="1"
                max="90"
              />
            </div>
          )}
        </div>

        <Button onClick={() => onSave?.(config)} className="w-full bg-amber-600">
          <Save className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t({ en: 'Save Configuration', ar: 'حفظ الإعدادات' })}
        </Button>
      </CardContent>
    </Card>
  );
}