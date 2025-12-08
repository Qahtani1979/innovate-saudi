import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Rocket, GitBranch, CheckCircle, AlertCircle } from 'lucide-react';

export default function DeploymentPipeline() {
  const { t } = useLanguage();

  const deploymentSteps = [
    { name: 'Code Push to Repo', status: 'configured' },
    { name: 'Automated Tests Run', status: 'missing' },
    { name: 'Build & Compile', status: 'configured' },
    { name: 'Deploy to Staging', status: 'manual' },
    { name: 'Smoke Tests', status: 'missing' },
    { name: 'Deploy to Production', status: 'manual' },
    { name: 'Health Checks', status: 'missing' },
    { name: 'Rollback if Needed', status: 'missing' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-purple-600" />
          {t({ en: 'Deployment Pipeline', ar: 'خط النشر' })}
          <Badge className="ml-auto bg-amber-600">Partial</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="text-amber-800">
              <p className="font-medium">Manual Deployment Process</p>
              <p>Need automated deployment pipeline with testing and rollback</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {deploymentSteps.map((step, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-2">
                {step.status === 'configured' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                )}
                <span className="text-sm">{step.name}</span>
              </div>
              <Badge variant={step.status === 'configured' ? 'default' : 'outline'}>
                {step.status}
              </Badge>
            </div>
          ))}
        </div>

        <div className="text-xs text-slate-600 pt-4 border-t">
          <p className="font-medium mb-2">Automation needed:</p>
          <ul className="space-y-1 ml-4">
            <li>• Zero-downtime deployments</li>
            <li>• Automated smoke testing</li>
            <li>• Health check verification</li>
            <li>• Automatic rollback on failure</li>
            <li>• Deployment notifications</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}