import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { GitBranch, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

export default function CICDPipeline() {
  const { t } = useLanguage();

  const stages = [
    { name: 'Code Commit', status: 'not_configured' },
    { name: 'Unit Tests', status: 'not_configured' },
    { name: 'Integration Tests', status: 'not_configured' },
    { name: 'E2E Tests', status: 'not_configured' },
    { name: 'Build', status: 'not_configured' },
    { name: 'Security Scan', status: 'not_configured' },
    { name: 'Deploy to Staging', status: 'not_configured' },
    { name: 'Deploy to Production', status: 'not_configured' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-indigo-600" />
          {t({ en: 'CI/CD Pipeline', ar: 'خط CI/CD' })}
          <Badge className="ml-auto bg-red-600">Not Configured</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
            <div className="text-red-800">
              <p className="font-medium">DevOps Pipeline Required</p>
              <p>GitHub Actions/GitLab CI for automated testing and deployment</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {stages.map((stage, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" />
                <span className="text-sm">{stage.name}</span>
              </div>
              <Badge variant="outline">Not Set</Badge>
            </div>
          ))}
        </div>

        <div className="text-xs text-slate-600 pt-4 border-t">
          <p className="font-medium mb-2">Pipeline features needed:</p>
          <ul className="space-y-1 ml-4">
            <li>• Automated test execution</li>
            <li>• Code quality checks (linting)</li>
            <li>• Security vulnerability scanning</li>
            <li>• Automated deployments</li>
            <li>• Rollback capability</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}