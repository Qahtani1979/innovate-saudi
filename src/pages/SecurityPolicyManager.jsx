import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Shield } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function SecurityPolicyManager() {
  const { t } = useLanguage();

  const policies = [
    { name: 'Password Policy', status: 'active', strength: 'strong' },
    { name: 'Session Timeout', status: 'active', value: '30 min' },
    { name: 'Two-Factor Authentication', status: 'optional', value: 'enabled' }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <Shield className="h-8 w-8 text-red-600" />
        {t({ en: 'Security Policy Manager', ar: 'مدير سياسات الأمان' })}
      </h1>

      <div className="grid gap-4">
        {policies.map((policy, idx) => (
          <Card key={idx}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{policy.name}</p>
                  <p className="text-sm text-slate-600">{policy.value}</p>
                </div>
                <Badge className="bg-green-100 text-green-800">{policy.status}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ProtectedPage(SecurityPolicyManager, { 
  requiredPermissions: ['platform_admin', 'security_manage'] 
});