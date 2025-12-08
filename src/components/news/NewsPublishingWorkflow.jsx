import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Newspaper, CheckCircle, AlertCircle } from 'lucide-react';

export default function NewsPublishingWorkflow() {
  const { t } = useLanguage();

  const workflowSteps = [
    { step: 'Draft Creation', status: 'partial', notes: 'UI exists' },
    { step: 'AI Content Enhancement', status: 'not_implemented', notes: 'Need translation & SEO' },
    { step: 'Editor Review', status: 'not_implemented', notes: 'Approval workflow' },
    { step: 'Scheduling', status: 'not_implemented', notes: 'Future publish dates' },
    { step: 'Publication', status: 'partial', notes: 'Basic save only' },
    { step: 'SEO Optimization', status: 'not_implemented', notes: 'Meta tags, URLs' },
    { step: 'Social Media Sharing', status: 'not_implemented', notes: 'Auto-post integration' },
    { step: 'Analytics Tracking', status: 'not_implemented', notes: 'View count, engagement' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-blue-600" />
          {t({ en: 'News Publishing', ar: 'نشر الأخبار' })}
          <Badge className="ml-auto bg-amber-600">Partial</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="text-amber-800">
              <p className="font-medium">Publishing Workflow Incomplete</p>
              <p>News CMS UI exists but missing workflow automation</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {workflowSteps.map((step, i) => (
            <div key={i} className="flex items-center justify-between p-2 border rounded text-xs">
              <div className="flex items-center gap-2">
                {step.status === 'partial' ? (
                  <CheckCircle className="h-3 w-3 text-amber-600" />
                ) : (
                  <div className="h-3 w-3 border-2 border-slate-300 rounded" />
                )}
                <span className="font-medium">{step.step}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-600">{step.notes}</span>
                <Badge variant={step.status === 'partial' ? 'outline' : 'destructive'}>
                  {step.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-slate-600 pt-4 border-t">
          <p className="font-medium mb-2">Required features:</p>
          <ul className="space-y-1 ml-4">
            <li>• Multi-step approval workflow</li>
            <li>• Draft auto-save</li>
            <li>• Version history</li>
            <li>• Rich media embedding</li>
            <li>• SEO meta tag management</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}