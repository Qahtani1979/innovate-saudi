import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Plug, Activity } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function APIManagementConsole() {
  const { t } = useLanguage();

  const apiEndpoints = [
    { name: 'Challenges API', status: 'active', uptime: '99.9%', requests: '12.3K' },
    { name: 'Pilots API', status: 'active', uptime: '99.8%', requests: '8.7K' },
    { name: 'Solutions API', status: 'active', uptime: '100%', requests: '5.2K' }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <Plug className="h-8 w-8 text-blue-600" />
        {t({ en: 'API Management Console', ar: 'وحدة تحكم إدارة API' })}
      </h1>

      <div className="grid gap-4">
        {apiEndpoints.map((api, idx) => (
          <Card key={idx}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-semibold">{api.name}</p>
                    <p className="text-xs text-slate-600">{api.requests} requests/day</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-600">Uptime: {api.uptime}</span>
                  <Badge className="bg-green-100 text-green-800">{api.status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ProtectedPage(APIManagementConsole, { requireAdmin: true });