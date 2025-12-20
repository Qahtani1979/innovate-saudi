import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Plug, Calendar, MessageSquare, FileText, Database, AlertCircle } from 'lucide-react';

export default function OAuthConnectorPanel() {
  const { t } = useLanguage();

  const connectors = [
    {
      name: 'Google Calendar',
      icon: Calendar,
      integration_type: 'googlecalendar',
      description: 'Sync platform events with Google Calendar',
      status: 'available',
      scopes: ['calendar.events', 'calendar.readonly']
    },
    {
      name: 'Slack',
      icon: MessageSquare,
      integration_type: 'slack',
      description: 'Send notifications to Slack channels',
      status: 'available',
      scopes: ['chat:write', 'channels:read']
    },
    {
      name: 'Notion',
      icon: FileText,
      integration_type: 'notion',
      description: 'Sync knowledge base with Notion',
      status: 'available',
      scopes: ['pages:read', 'pages:write']
    },
    {
      name: 'Salesforce',
      icon: Database,
      integration_type: 'salesforce',
      description: 'Integrate with Salesforce CRM',
      status: 'available',
      scopes: ['api', 'refresh_token']
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plug className="h-5 w-5 text-purple-600" />
          {t({ en: 'OAuth App Connectors', ar: 'موصلات OAuth' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="text-xs text-amber-800">
              <p className="font-medium mb-1">Activation Required</p>
              <p>OAuth connectors available but not yet activated. Backend functions must be enabled.</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {connectors.map((connector) => {
            const Icon = connector.icon;
            return (
              <div key={connector.integration_type} className="p-4 border rounded-lg hover:bg-slate-50 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <Icon className="h-5 w-5 text-slate-700" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{connector.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {connector.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{connector.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {connector.scopes.map(scope => (
                          <Badge key={scope} variant="secondary" className="text-xs">
                            {scope}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" disabled>
                    {t({ en: 'Connect', ar: 'ربط' })}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t text-xs text-slate-600">
          <p className="font-medium mb-2">Use Cases:</p>
          <ul className="space-y-1 ml-4">
            <li>• Auto-sync pilot milestones to Google Calendar</li>
            <li>• Send approval notifications to Slack channels</li>
            <li>• Sync knowledge documents with Notion workspace</li>
            <li>• Link partner organizations to Salesforce CRM</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}