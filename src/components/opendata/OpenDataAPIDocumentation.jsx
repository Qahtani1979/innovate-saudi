import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Code, Book, AlertCircle } from 'lucide-react';

export default function OpenDataAPIDocumentation() {
  const { t } = useLanguage();

  const endpoints = [
    { endpoint: 'GET /api/opendata/challenges', status: 'not_documented', auth: 'Public' },
    { endpoint: 'GET /api/opendata/pilots', status: 'not_documented', auth: 'Public' },
    { endpoint: 'GET /api/opendata/mii-scores', status: 'not_documented', auth: 'Public' },
    { endpoint: 'GET /api/opendata/statistics', status: 'not_documented', auth: 'Public' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5 text-green-600" />
          {t({ en: 'Open Data API', ar: 'واجهة البيانات المفتوحة' })}
          <Badge className="ml-auto bg-red-600">Not Available</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
            <div className="text-red-800">
              <p className="font-medium">No Public API Available</p>
              <p>Open data portal lacks programmatic access</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {endpoints.map((ep, i) => (
            <div key={i} className="p-2 border rounded text-xs">
              <div className="flex items-center justify-between">
                <code className="text-slate-900">{ep.endpoint}</code>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{ep.auth}</Badge>
                  <Badge variant="destructive">{ep.status}</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-slate-600 pt-4 border-t">
          <p className="font-medium mb-2">Required features:</p>
          <ul className="space-y-1 ml-4">
            <li>• RESTful API endpoints</li>
            <li>• Swagger/OpenAPI documentation</li>
            <li>• API playground (try it out)</li>
            <li>• Rate limiting for public access</li>
            <li>• Usage analytics</li>
            <li>• Dataset versioning</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}