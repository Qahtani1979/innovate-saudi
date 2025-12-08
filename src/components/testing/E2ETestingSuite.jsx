import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { PlayCircle, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

export default function E2ETestingSuite() {
  const { t } = useLanguage();

  const testSuites = [
    { name: 'Challenge Submission Flow', tests: 12, passed: 0, failed: 0, status: 'not_run' },
    { name: 'Pilot Launch Workflow', tests: 18, passed: 0, failed: 0, status: 'not_run' },
    { name: 'User Authentication', tests: 8, passed: 0, failed: 0, status: 'not_run' },
    { name: 'RBAC Enforcement', tests: 15, passed: 0, failed: 0, status: 'not_run' },
    { name: 'API Integration Tests', tests: 20, passed: 0, failed: 0, status: 'not_run' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlayCircle className="h-5 w-5 text-green-600" />
          {t({ en: 'E2E Testing Suite', ar: 'مجموعة اختبارات E2E' })}
          <Badge className="ml-auto bg-red-600">Not Implemented</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
            <div className="text-red-800">
              <p className="font-medium">Test Automation Required</p>
              <p>Playwright/Cypress E2E tests + CI/CD pipeline needed</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-900">73</p>
            <p className="text-xs text-slate-600">Total Tests</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">0</p>
            <p className="text-xs text-green-700">Passed</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">0</p>
            <p className="text-xs text-red-700">Failed</p>
          </div>
        </div>

        <div className="space-y-2">
          {testSuites.map((suite, idx) => (
            <div key={idx} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">{suite.name}</p>
                <Badge variant="outline">{suite.tests} tests</Badge>
              </div>
              <Progress value={0} className="h-1" />
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline" disabled>
                  <PlayCircle className="h-3 w-3 mr-1" />
                  Run
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-slate-600 pt-4 border-t">
          <p className="font-medium mb-2">Required implementation:</p>
          <ul className="space-y-1 ml-4">
            <li>• Playwright/Cypress setup</li>
            <li>• Test scenarios for all workflows</li>
            <li>• CI/CD integration</li>
            <li>• Automated regression testing</li>
            <li>• Test reporting dashboard</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}