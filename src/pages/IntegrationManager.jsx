import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Plug, Plus, Key, Webhook, Globe, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

export default function IntegrationManager() {
  const { language, isRTL, t } = useLanguage();
  const [apiKeys, setApiKeys] = useState([
    { id: 1, name: 'Google Maps API', key: 'AIza***hidden***', status: 'active', created: '2025-01-01' },
    { id: 2, name: 'WhatsApp Business', key: 'whatsapp_***', status: 'active', created: '2025-01-05' }
  ]);

  const [webhooks, setWebhooks] = useState([
    { id: 1, name: 'Challenge Created', url: 'https://api.example.com/webhook', events: ['challenge.created'], status: 'active' },
    { id: 2, name: 'Pilot Status Change', url: 'https://api.example.com/pilot', events: ['pilot.status_changed'], status: 'active' }
  ]);

  return (
    <PageLayout>
      <PageHeader
        icon={Plug}
        title={t({ en: 'Integration & API Management', ar: 'إدارة التكاملات وواجهة البرمجة' })}
        description={t({ en: 'Configure API keys, webhooks, OAuth apps, and external integrations', ar: 'تكوين مفاتيح API، الخطافات، تطبيقات OAuth، والتكاملات الخارجية' })}
      />

      {/* API Keys */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-blue-600" />
              {t({ en: 'API Keys', ar: 'مفاتيح API' })}
            </CardTitle>
            <Button className="bg-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              {t({ en: 'Generate Key', ar: 'توليد مفتاح' })}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {apiKeys.map((key) => (
              <div key={key.id} className="p-4 bg-slate-50 rounded-lg border-2 hover:border-blue-300 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-semibold text-slate-900">{key.name}</p>
                      <Badge className={key.status === 'active' ? 'bg-green-600' : 'bg-red-600'}>
                        {key.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 font-mono">{key.key}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {t({ en: 'Created:', ar: 'تم الإنشاء:' })} {key.created}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    {t({ en: 'Revoke', ar: 'إلغاء' })}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5 text-purple-600" />
              {t({ en: 'Webhooks', ar: 'الخطافات' })}
            </CardTitle>
            <Button className="bg-purple-600">
              <Plus className="h-4 w-4 mr-2" />
              {t({ en: 'Add Webhook', ar: 'إضافة خطاف' })}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {webhooks.map((webhook) => (
              <div key={webhook.id} className="p-4 bg-slate-50 rounded-lg border-2">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{webhook.name}</p>
                    <p className="text-sm text-slate-600 mt-1">{webhook.url}</p>
                    <div className="flex gap-2 mt-2">
                      {webhook.events.map((event, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{event}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {webhook.status === 'active' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* OAuth Apps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-teal-600" />
            {t({ en: 'OAuth Applications', ar: 'تطبيقات OAuth' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            {t({ en: 'No OAuth apps registered', ar: 'لا توجد تطبيقات OAuth مسجلة' })}
          </div>
          <Button variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            {t({ en: 'Register OAuth App', ar: 'تسجيل تطبيق OAuth' })}
          </Button>
        </CardContent>
      </Card>

      {/* OAuth Connectors */}
      <OAuthConnectorPanel />
    </PageLayout>
  );
}