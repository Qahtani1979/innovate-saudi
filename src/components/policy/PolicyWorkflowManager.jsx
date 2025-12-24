import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { usePolicyMutations } from '@/hooks/usePolicy';
import {
  GitBranch,
  CheckCircle2,
  ArrowRight,
  FileText,
  Scale,
  MessageSquare,
  Building2,
  Shield,
  PlayCircle,
  CheckCircle
} from 'lucide-react';

export default function PolicyWorkflowManager({ policy, onUpdate }) {
  const { language, isRTL, t } = useLanguage();
  const { updatePolicy } = usePolicyMutations();

  const workflowStages = [
    { key: 'draft', icon: FileText, label: { en: 'Draft', ar: 'مسودة' }, color: 'slate' },
    { key: 'legal_review', icon: Scale, label: { en: 'Legal Review', ar: 'مراجعة قانونية' }, color: 'blue' },
    { key: 'public_consultation', icon: MessageSquare, label: { en: 'Public Consultation', ar: 'استشارة عامة' }, color: 'purple' },
    { key: 'council_approval', icon: Building2, label: { en: 'Council Approval', ar: 'موافقة المجلس' }, color: 'orange' },
    { key: 'ministry_approval', icon: Shield, label: { en: 'Ministry Approval', ar: 'موافقة الوزارة' }, color: 'red' },
    { key: 'published', icon: PlayCircle, label: { en: 'Published', ar: 'منشور' }, color: 'green' },
    { key: 'implementation', icon: CheckCircle, label: { en: 'Implementation', ar: 'تنفيذ' }, color: 'teal' },
    { key: 'active', icon: CheckCircle2, label: { en: 'Active', ar: 'فعال' }, color: 'emerald' }
  ];

  const handleStageTransition = (nextStage) => {
    updatePolicy.mutate({
      id: policy.id,
      workflow_stage: nextStage,
      ...(nextStage === 'legal_review' && { submission_date: new Date().toISOString() })
    }, {
      onSuccess: () => {
        onUpdate?.();
        // Toast is handled by the hook
      }
    });
  };

  const currentStage = policy.workflow_stage || policy.status || 'draft';
  const currentIndex = workflowStages.findIndex(s => s.key === currentStage);

  const canTransition = (targetStage) => {
    const targetIndex = workflowStages.findIndex(s => s.key === targetStage);
    return targetIndex === currentIndex + 1;
  };

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-blue-600" />
          <span>{t({ en: 'Policy Workflow', ar: 'سير عمل السياسة' })}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Visual Workflow */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {workflowStages.map((stage, idx) => {
            const Icon = stage.icon;
            const isActive = stage.key === currentStage;
            const isPast = idx < currentIndex;
            const isFuture = idx > currentIndex;

            return (
              <React.Fragment key={stage.key}>
                <div className={`flex flex-col items-center gap-1 flex-shrink-0`}>
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center border-2 ${isActive ? `bg-${stage.color}-100 border-${stage.color}-500` :
                    isPast ? `bg-${stage.color}-500 text-white border-${stage.color}-500` :
                      'bg-slate-100 border-slate-300'
                    }`}>
                    <Icon className={`h-5 w-5 ${isActive ? `text-${stage.color}-700` :
                      isPast ? 'text-white' :
                        'text-slate-400'
                      }`} />
                  </div>
                  <p className={`text-xs font-medium text-center ${isActive ? 'text-blue-700' :
                    isPast ? 'text-slate-700' :
                      'text-slate-400'
                    }`}>
                    {stage.label[language]}
                  </p>
                </div>
                {idx < workflowStages.length - 1 && (
                  <ArrowRight className={`h-4 w-4 flex-shrink-0 ${isPast ? 'text-green-500' : 'text-slate-300'
                    }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Current Stage Info */}
        <div className={`p-4 rounded-lg bg-blue-50 border-l-4 border-blue-500`}>
          <p className="text-sm font-semibold text-blue-900 mb-1">
            {t({ en: 'Current Stage:', ar: 'المرحلة الحالية:' })}
          </p>
          <div className="flex items-center gap-2">
            <Badge className={`bg-blue-600 text-white`}>
              {workflowStages.find(s => s.key === currentStage)?.label[language]}
            </Badge>
            {policy.submission_date && (
              <p className="text-xs text-slate-600">
                {t({ en: 'Submitted:', ar: 'مُقدم:' })} {new Date(policy.submission_date).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Next Actions */}
        {currentIndex < workflowStages.length - 1 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-900">
              {t({ en: 'Available Actions:', ar: 'الإجراءات المتاحة:' })}
            </p>
            <Button
              onClick={() => handleStageTransition(workflowStages[currentIndex + 1].key)}
              disabled={updatePolicy.isPending}
              className="w-full gap-2"
            >
              <ArrowRight className="h-4 w-4" />
              {t({ en: 'Move to', ar: 'انتقل إلى' })} {workflowStages[currentIndex + 1]?.label[language]}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}