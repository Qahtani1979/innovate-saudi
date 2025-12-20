import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from './LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Database, Save, RefreshCw, CheckCircle2, Download, MapPin, Building2 } from 'lucide-react';
import { toast } from 'sonner';

function SystemConfiguration() {
  const { language, isRTL, t } = useLanguage();

  const [config, setConfig] = useState({
    platformName: 'Saudi Innovates',
    defaultLanguage: 'ar',
    enableAI: true,
    enableNotifications: true,
    maintenanceMode: false,
    maxFileSize: 10,
    sessionTimeout: 30,
    aiModelThreshold: 0.75,
    backupFrequency: 'daily'
  });

  const handleSave = () => {
    toast.success(t({ en: 'Configuration saved', ar: 'تم حفظ التكوين' }));
  };

  const handleBackup = () => {
    toast.success(t({ en: 'Backup initiated', ar: 'تم بدء النسخ الاحتياطي' }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            {t({ en: 'General Settings', ar: 'الإعدادات العامة' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                {t({ en: 'Platform Name', ar: 'اسم المنصة' })}
              </label>
              <Input
                value={config.platformName}
                onChange={(e) => setConfig({ ...config, platformName: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                {t({ en: 'Max File Upload (MB)', ar: 'الحد الأقصى للملف' })}
              </label>
              <Input
                type="number"
                value={config.maxFileSize}
                onChange={(e) => setConfig({ ...config, maxFileSize: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">{t({ en: 'AI Features Enabled', ar: 'تفعيل الميزات الذكية' })}</p>
                <p className="text-sm text-slate-600">{t({ en: 'Enable AI assistant and predictions', ar: 'تفعيل المساعد الذكي والتنبؤات' })}</p>
              </div>
              <Switch
                checked={config.enableAI}
                onCheckedChange={(checked) => setConfig({ ...config, enableAI: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">{t({ en: 'Notifications Enabled', ar: 'تفعيل الإشعارات' })}</p>
                <p className="text-sm text-slate-600">{t({ en: 'Send email and in-app notifications', ar: 'إرسال إشعارات البريد والتطبيق' })}</p>
              </div>
              <Switch
                checked={config.enableNotifications}
                onCheckedChange={(checked) => setConfig({ ...config, enableNotifications: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Geography Management', ar: 'إدارة الجغرافيا' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-600">
            {t({ en: 'Manage regions, cities, and administrative boundaries', ar: 'إدارة المناطق والمدن والحدود الإدارية' })}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Link to={createPageUrl('RegionManagement')}>
              <Button variant="outline" className="w-full justify-start">
                <MapPin className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'Manage Regions', ar: 'إدارة المناطق' })}
              </Button>
            </Link>
            <Link to={createPageUrl('CityManagement')}>
              <Button variant="outline" className="w-full justify-start">
                <Building2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'Manage Cities', ar: 'إدارة المدن' })}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Backup & Export', ar: 'النسخ الاحتياطي والتصدير' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div>
              <p className="font-medium text-slate-900 mb-1">
                {t({ en: 'Automated Backups', ar: 'النسخ الاحتياطي التلقائي' })}
              </p>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-700">
                  <CheckCircle2 className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                  {t({ en: 'Active', ar: 'نشط' })}
                </Badge>
                <span className="text-sm text-slate-600">
                  {t({ en: 'Daily at 2:00 AM', ar: 'يوميًا الساعة 2:00 صباحًا' })}
                </span>
              </div>
            </div>
            <Button onClick={handleBackup}>
              <Download className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t({ en: 'Backup Now', ar: 'نسخ احتياطي الآن' })}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button variant="outline" className="w-full">
              {t({ en: 'Export All Data', ar: 'تصدير جميع البيانات' })}
            </Button>
            <Button variant="outline" className="w-full">
              {t({ en: 'Export Users', ar: 'تصدير المستخدمين' })}
            </Button>
            <Button variant="outline" className="w-full">
              {t({ en: 'Export Reports', ar: 'تصدير التقارير' })}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={handleSave} className="bg-gradient-to-r from-blue-600 to-teal-600">
          <Save className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t({ en: 'Save Configuration', ar: 'حفظ التكوين' })}
        </Button>
        <Button variant="outline">
          <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t({ en: 'Reset', ar: 'إعادة تعيين' })}
        </Button>
      </div>
    </div>
  );
}

export default SystemConfiguration;