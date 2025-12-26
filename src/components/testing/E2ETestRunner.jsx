import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { MonitorPlay, Play, AlertCircle } from 'lucide-react';

export default function E2ETestRunner() {
  const { t } = useLanguage();

  const e2eScenarios = [
    { name: 'Complete Challenge Submission', steps: 8, status: 'not_implemented' },
    { name: 'Full Pilot Lifecycle', steps: 12, status: 'not_implemented' },
    { name: 'User Registration to First Action', steps: 6, status: 'not_implemented' },
    { name: 'Solution Matching & Proposal', steps: 10, status: 'not_implemented' },
    { name: 'R&D Call Response Flow', steps: 9, status: 'not_implemented' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MonitorPlay className="h-5 w-5 text-purple-600" />
          {t({ en: 'E2E Tests', ar: 'اختبارات E2E' })}
          <Badge className="ml-auto bg-red-600">0 Tests</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
            <div className="text-red-800">
              <p className="font-medium">No End-to-End Tests</p>
              <p>Critical user flows not validated</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {e2eScenarios.map((scenario, i) => (
            <div key={i} className="flex items-center justify-between p-2 border rounded text-xs">
              <div>
                <p className="font-medium">{scenario.name}</p>
                <p className="text-slate-600">{scenario.steps} steps</p>
              </div>
              <Badge variant="outline">{scenario.status}</Badge>
            </div>
          ))}
        </div>

        <Button disabled className="w-full" variant="outline">
          <Play className="h-4 w-4 mr-2" />
          {t({ en: 'Run E2E Suite', ar: 'تشغيل اختبارات E2E' })}
        </Button>

        <div className="text-xs text-slate-600 pt-4 border-t">
          <p className="font-medium mb-2">Framework needed:</p>
          <ul className="space-y-1 ml-4">
            <li>• Playwright or Cypress setup</li>
            <li>• Page object models</li>
            <li>• Test data generators</li>
            <li>• Screenshot/video recording</li>
            <li>• Parallel test execution</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
