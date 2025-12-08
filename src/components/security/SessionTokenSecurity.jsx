import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from '../LanguageContext';
import { Shield, Lock, AlertCircle } from 'lucide-react';

export default function SessionTokenSecurity() {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-red-600" />
          {t({ en: 'Session Token Security', ar: 'أمان رمز الجلسة' })}
          <Badge className="ml-auto bg-red-600">Critical</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
            <div className="text-red-800">
              <p className="font-medium">Backend Security Enhancement Required</p>
              <p>Implement secure token generation, rotation, and validation</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="text-sm font-medium">Cryptographically Secure Tokens</p>
              <p className="text-xs text-slate-500">CSPRNG-based token generation</p>
            </div>
            <Switch disabled />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="text-sm font-medium">Token Rotation</p>
              <p className="text-xs text-slate-500">Auto-rotate on sensitive actions</p>
            </div>
            <Switch disabled />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="text-sm font-medium">HttpOnly Cookies</p>
              <p className="text-xs text-slate-500">XSS protection</p>
            </div>
            <Switch disabled />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="text-sm font-medium">SameSite Policy</p>
              <p className="text-xs text-slate-500">CSRF protection</p>
            </div>
            <Switch disabled />
          </div>
        </div>

        <div className="text-xs text-slate-600 pt-4 border-t">
          <p className="font-medium mb-2">Security requirements:</p>
          <ul className="space-y-1 ml-4">
            <li>• CSPRNG token generation (256-bit)</li>
            <li>• Secure token storage (hashed in DB)</li>
            <li>• Token expiration & refresh</li>
            <li>• IP binding (optional)</li>
            <li>• Device fingerprinting</li>
            <li>• Concurrent session limits</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}