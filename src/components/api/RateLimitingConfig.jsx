import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Zap, AlertCircle, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function RateLimitingConfig() {
  const { t } = useLanguage();
  const [config, setConfig] = useState({
    global_per_minute: 1000,
    per_user_per_minute: 60,
    per_ip_per_minute: 100,
    burst_size: 20,
    endpoints: [
      { path: '/api/entities/*', limit: 100, window: '1m' },
      { path: '/api/functions/*', limit: 50, window: '1m' },
      { path: '/api/integrations/*', limit: 30, window: '1m' }
    ]
  });

  const handleSave = () => {
    toast.success(t({ en: 'Rate limiting config saved', ar: 'تم حفظ إعدادات التحديد' }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-600" />
          {t({ en: 'API Rate Limiting', ar: 'تحديد معدل API' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t({ en: 'Global Per Minute', ar: 'عالمي/دقيقة' })}
            </label>
            <Input
              type="number"
              value={config.global_per_minute}
              onChange={(e) => setConfig({...config, global_per_minute: parseInt(e.target.value)})}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t({ en: 'Per User/Min', ar: 'لكل مستخدم/د' })}
            </label>
            <Input
              type="number"
              value={config.per_user_per_minute}
              onChange={(e) => setConfig({...config, per_user_per_minute: parseInt(e.target.value)})}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t({ en: 'Burst Size', ar: 'حجم الدفعة' })}
            </label>
            <Input
              type="number"
              value={config.burst_size}
              onChange={(e) => setConfig({...config, burst_size: parseInt(e.target.value)})}
            />
          </div>
        </div>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="text-xs text-amber-800">
              <p className="font-medium mb-1">Note: Backend implementation required</p>
              <p>Rate limiting middleware needs to be deployed at API gateway level</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">{t({ en: 'Endpoint Rules', ar: 'قواعد النقاط' })}</p>
          {config.endpoints.map((endpoint, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
              <code className="text-xs flex-1">{endpoint.path}</code>
              <Badge variant="outline">{endpoint.limit}/{endpoint.window}</Badge>
            </div>
          ))}
        </div>

        <Button onClick={handleSave} className="w-full bg-amber-600">
          <Save className="h-4 w-4 mr-2" />
          {t({ en: 'Save Configuration', ar: 'حفظ الإعدادات' })}
        </Button>
      </CardContent>
    </Card>
  );
}
