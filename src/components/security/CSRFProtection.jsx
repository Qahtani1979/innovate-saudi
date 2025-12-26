import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from '../LanguageContext';
import { Shield, AlertCircle } from 'lucide-react';

export default function CSRFProtection() {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-red-600" />
          {t({ en: 'CSRF Protection', ar: 'حماية CSRF' })}
          <Badge className="ml-auto bg-red-600">Critical Gap</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
            <div className="text-red-800">
              <p className="font-medium">CSRF Tokens Not Implemented</p>
              <p>All state-changing operations need CSRF token validation</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="text-sm font-medium">Double Submit Cookie Pattern</p>
              <p className="text-xs text-slate-500">CSRF token in cookie + header</p>
            </div>
            <Switch disabled />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="text-sm font-medium">Synchronizer Token Pattern</p>
              <p className="text-xs text-slate-500">Session-based token validation</p>
            </div>
            <Switch disabled />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="text-sm font-medium">SameSite Cookies</p>
              <p className="text-xs text-slate-500">SameSite=Strict for auth cookies</p>
            </div>
            <Switch disabled />
          </div>
        </div>

        <div className="text-xs text-slate-600 pt-4 border-t">
          <p className="font-medium mb-2">Implementation needs:</p>
          <ul className="space-y-1 ml-4">
            <li>• Generate CSRF tokens on login</li>
            <li>• Include token in all forms</li>
            <li>• Validate token on backend</li>
            <li>• Rotate tokens periodically</li>
            <li>• Handle token expiry gracefully</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
