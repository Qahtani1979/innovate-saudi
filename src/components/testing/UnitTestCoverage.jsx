import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { CheckCircle, FileCode } from 'lucide-react';

export default function UnitTestCoverage() {
  const { t } = useLanguage();

  const modules = [
    { name: 'Components', files: 180, tested: 0, coverage: 0 },
    { name: 'Pages', files: 150, tested: 0, coverage: 0 },
    { name: 'Hooks', files: 12, tested: 0, coverage: 0 },
    { name: 'Utils', files: 8, tested: 0, coverage: 0 },
    { name: 'API Client', files: 5, tested: 0, coverage: 0 }
  ];

  const totalFiles = modules.reduce((sum, m) => sum + m.files, 0);
  const totalTested = modules.reduce((sum, m) => sum + m.tested, 0);
  const overallCoverage = totalFiles > 0 ? (totalTested / totalFiles) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCode className="h-5 w-5 text-blue-600" />
          {t({ en: 'Unit Test Coverage', ar: 'تغطية اختبارات الوحدة' })}
          <Badge className="ml-auto bg-red-600">
            {Math.round(overallCoverage)}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-slate-50 rounded-lg">
          <div className="text-center">
            <p className="text-3xl font-bold text-slate-900">{totalTested}/{totalFiles}</p>
            <p className="text-xs text-slate-600 mt-1">Files with tests</p>
            <Progress value={overallCoverage} className="mt-3 h-2" />
          </div>
        </div>

        <div className="space-y-2">
          {modules.map((module, idx) => (
            <div key={idx} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{module.name}</span>
                <span className="text-xs text-slate-600">{module.tested}/{module.files}</span>
              </div>
              <Progress value={module.coverage} className="h-1" />
            </div>
          ))}
        </div>

        <div className="text-xs text-slate-600 pt-4 border-t">
          <p className="font-medium mb-2">Target: 70% coverage</p>
          <ul className="space-y-1 ml-4">
            <li>• Jest + React Testing Library setup</li>
            <li>• Component unit tests</li>
            <li>• Hook tests</li>
            <li>• Utility function tests</li>
            <li>• Coverage reporting</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}