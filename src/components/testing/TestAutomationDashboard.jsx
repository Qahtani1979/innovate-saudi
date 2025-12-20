import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { TestTube } from 'lucide-react';

export default function TestAutomationDashboard() {
  const { t } = useLanguage();

  const testSuites = [
    { name: 'Unit Tests', coverage: 0, tests: 0, passing: 0, failing: 0, status: 'not_setup' },
    { name: 'Integration Tests', coverage: 0, tests: 0, passing: 0, failing: 0, status: 'not_setup' },
    { name: 'E2E Tests', coverage: 0, tests: 0, passing: 0, failing: 0, status: 'not_setup' },
    { name: 'Performance Tests', coverage: 0, tests: 0, passing: 0, failing: 0, status: 'not_setup' },
    { name: 'Security Tests', coverage: 0, tests: 0, passing: 0, failing: 0, status: 'not_setup' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5 text-purple-600" />
          {t({ en: 'Test Automation', ar: 'اختبار آلي' })}
          <Badge className="ml-auto bg-red-600">0% Coverage</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-slate-50 rounded">
            <p className="text-3xl font-bold text-slate-600">0</p>
            <p className="text-xs text-slate-600">Total Tests</p>
          </div>
          <div className="p-3 bg-green-50 rounded">
            <p className="text-3xl font-bold text-green-600">0</p>
            <p className="text-xs text-green-600">Passing</p>
          </div>
          <div className="p-3 bg-red-50 rounded">
            <p className="text-3xl font-bold text-red-600">0</p>
            <p className="text-xs text-red-600">Failing</p>
          </div>
        </div>

        <div className="space-y-3">
          {testSuites.map((suite, i) => (
            <div key={i} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{suite.name}</span>
                <Badge variant="outline">{suite.status}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>{suite.tests} tests</span>
                <span>{suite.coverage}% coverage</span>
              </div>
              <Progress value={suite.coverage} className="h-1 mt-2" />
            </div>
          ))}
        </div>

        <div className="text-xs text-slate-600 pt-4 border-t">
          <p className="font-medium mb-2">Implementation plan:</p>
          <ul className="space-y-1 ml-4">
            <li>• Setup Jest + React Testing Library</li>
            <li>• Configure Playwright for E2E</li>
            <li>• Add tests to CI/CD pipeline</li>
            <li>• Set minimum coverage threshold (80%)</li>
            <li>• Setup test reporting dashboard</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}