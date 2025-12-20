import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { CheckCircle, XCircle, Clock, TestTube } from 'lucide-react';

export default function TestingDashboard() {
  const { t } = useLanguage();

  const testSuites = [
    { name: 'Unit Tests', total: 0, passed: 0, failed: 0, coverage: 0 },
    { name: 'Integration Tests', total: 0, passed: 0, failed: 0, coverage: 0 },
    { name: 'E2E Tests', total: 0, passed: 0, failed: 0, coverage: 0 }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5 text-purple-600" />
          {t({ en: 'Automated Testing', ar: 'الاختبار الآلي' })}
          <Badge className="ml-auto bg-red-600">
            {t({ en: 'Not Implemented', ar: 'غير منفذ' })}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-900 font-medium mb-2">
            {t({ en: 'Testing Suite Required', ar: 'مجموعة الاختبار مطلوبة' })}
          </p>
          <p className="text-xs text-red-700">
            {t({ en: 'Automated testing is critical for production readiness. Recommended: Jest, React Testing Library, Cypress.', ar: 'الاختبار الآلي ضروري للجاهزية الإنتاجية' })}
          </p>
        </div>

        {testSuites.map((suite, idx) => (
          <div key={idx} className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{suite.name}</p>
              <Badge variant="outline">{suite.coverage}% coverage</Badge>
            </div>
            <div className="flex gap-4 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-600" />
                {suite.passed} passed
              </span>
              <span className="flex items-center gap-1">
                <XCircle className="h-3 w-3 text-red-600" />
                {suite.failed} failed
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-slate-400" />
                {suite.total} total
              </span>
            </div>
            <Progress value={suite.coverage} className="h-1" />
          </div>
        ))}

        <div className="pt-4 border-t text-xs text-slate-600 space-y-1">
          <p><strong>Recommended Tests:</strong></p>
          <ul className="ml-4 space-y-0.5">
            <li>• Entity CRUD operations</li>
            <li>• Permission enforcement</li>
            <li>• Workflow state transitions</li>
            <li>• Critical user journeys (Challenge → Pilot → Scale)</li>
            <li>• API endpoint responses</li>
            <li>• Form validations</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}