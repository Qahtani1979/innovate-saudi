import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Network, Server, AlertCircle } from 'lucide-react';

export default function APIGatewayConfig() {
  const { t } = useLanguage();

  const features = [
    { name: 'API Gateway Layer', status: 'missing', priority: 'High' },
    { name: 'Request/Response Transformation', status: 'missing', priority: 'Medium' },
    { name: 'API Rate Limiting', status: 'partial', priority: 'High' },
    { name: 'Request Throttling', status: 'missing', priority: 'High' },
    { name: 'API Key Validation', status: 'missing', priority: 'High' },
    { name: 'Request Logging', status: 'partial', priority: 'Medium' },
    { name: 'Response Caching', status: 'missing', priority: 'Medium' },
    { name: 'Load Balancing', status: 'missing', priority: 'High' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5 text-blue-600" />
          {t({ en: 'API Gateway', ar: 'بوابة API' })}
          <Badge className="ml-auto bg-amber-600">Missing</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="text-amber-800">
              <p className="font-medium">No API Gateway Layer</p>
              <p>Need centralized API management and security</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {features.map((feature, i) => (
            <div key={i} className="flex items-center justify-between p-2 border rounded text-xs">
              <span>{feature.name}</span>
              <div className="flex items-center gap-2">
                <Badge className={feature.priority === 'High' ? 'bg-red-600' : 'bg-amber-600'}>
                  {feature.priority}
                </Badge>
                <Badge variant={feature.status === 'partial' ? 'outline' : 'destructive'}>
                  {feature.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-slate-600 pt-4 border-t">
          <p className="font-medium mb-2">Recommended solutions:</p>
          <ul className="space-y-1 ml-4">
            <li>• AWS API Gateway</li>
            <li>• Kong Gateway</li>
            <li>• Nginx as reverse proxy</li>
            <li>• Custom Node.js middleware</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}