import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { TestTube, Play, AlertCircle } from 'lucide-react';

export default function IntegrationTestRunner() {
  const { t } = useLanguage();

  const testScenarios = [
    { name: 'Challenge Creation Flow', endpoints: 3, status: 'not_implemented' },
    { name: 'Pilot Approval Workflow', endpoints: 5, status: 'not_implemented' },
    { name: 'User Authentication Flow', endpoints: 4, status: 'not_implemented' },
    { name: 'R&D Proposal Submission', endpoints: 6, status: 'not_implemented' },
    { name: 'Matchmaker Application', endpoints: 4, status: 'not_implemented' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5 text-blue-600" />
          {t({ en: 'Integration Tests', ar: 'اختبارات التكامل' })}
          <Badge className="ml-auto bg-red-600">0 Tests</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
            <div className="text-red-800">
              <p className="font-medium">No Integration Tests</p>
              <p>API workflows untested - bugs may reach production</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {testScenarios.map((scenario, i) => (
            <div key={i} className="flex items-center justify-between p-2 border rounded text-xs">
              <div>
                <p className="font-medium">{scenario.name}</p>
                <p className="text-slate-600">{scenario.endpoints} API endpoints</p>
              </div>
              <Badge variant="outline">{scenario.status}</Badge>
            </div>
          ))}
        </div>

        <Button disabled className="w-full" variant="outline">
          <Play className="h-4 w-4 mr-2" />
          {t({ en: 'Run All Tests', ar: 'تشغيل جميع الاختبارات' })}
        </Button>

        <div className="text-xs text-slate-600 pt-4 border-t">
          <p className="font-medium mb-2">Setup needed:</p>
          <ul className="space-y-1 ml-4">
            <li>• Supertest or similar API testing library</li>
            <li>• Test database with fixtures</li>
            <li>• Mock authentication tokens</li>
            <li>• Cleanup scripts between tests</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}