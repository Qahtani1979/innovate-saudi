import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from '../LanguageContext';
import { Shield, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function SecurityHeadersConfig() {
  const { t } = useLanguage();
  const [headers, setHeaders] = useState({
    csp: {
      enabled: false,
      policy: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
    },
    hsts: {
      enabled: false,
      max_age: 31536000
    },
    x_frame_options: {
      enabled: true,
      value: 'SAMEORIGIN'
    },
    x_content_type: {
      enabled: true
    },
    referrer_policy: {
      enabled: true,
      value: 'strict-origin-when-cross-origin'
    }
  });

  const handleSave = () => {
    toast.success(t({ en: 'Security headers configured', ar: 'تم تكوين رؤوس الأمان' }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          {t({ en: 'Security Headers', ar: 'رؤوس الأمان' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="text-xs text-amber-800">
              <p className="font-medium mb-1">Backend Configuration Required</p>
              <p>Security headers must be configured at server/proxy level</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { 
              key: 'csp', 
              label: 'Content Security Policy', 
              description: 'Prevents XSS attacks',
              critical: true
            },
            { 
              key: 'hsts', 
              label: 'HTTP Strict Transport Security', 
              description: 'Forces HTTPS connections',
              critical: true
            },
            { 
              key: 'x_frame_options', 
              label: 'X-Frame-Options', 
              description: 'Prevents clickjacking',
              critical: false
            },
            { 
              key: 'x_content_type', 
              label: 'X-Content-Type-Options', 
              description: 'Prevents MIME sniffing',
              critical: false
            }
          ].map(header => (
            <div key={header.key} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{header.label}</p>
                  {header.critical && <Badge variant="destructive" className="text-xs">Critical</Badge>}
                </div>
                <p className="text-xs text-slate-600 mt-0.5">{header.description}</p>
              </div>
              <Switch
                checked={headers[header.key]?.enabled}
                onCheckedChange={(checked) => setHeaders({
                  ...headers,
                  [header.key]: { ...headers[header.key], enabled: checked }
                })}
              />
            </div>
          ))}
        </div>

        <Button onClick={handleSave} className="w-full bg-blue-600">
          {t({ en: 'Save Configuration', ar: 'حفظ الإعدادات' })}
        </Button>

        <div className="pt-4 border-t text-xs text-slate-600">
          <p className="font-medium mb-2">Recommended Headers:</p>
          <ul className="space-y-1 ml-4">
            <li>• Content-Security-Policy (XSS protection)</li>
            <li>• Strict-Transport-Security (HTTPS enforcement)</li>
            <li>• X-Frame-Options (Clickjacking prevention)</li>
            <li>• X-Content-Type-Options (MIME sniffing prevention)</li>
            <li>• Referrer-Policy (Privacy protection)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}