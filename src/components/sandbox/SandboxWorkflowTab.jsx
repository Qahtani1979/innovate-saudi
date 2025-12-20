import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from '../LanguageContext';
import { CheckCircle2, Circle, Clock, Shield, Play } from 'lucide-react';

export default function SandboxWorkflowTab({ sandbox }) {
  const { t } = useLanguage();

  const stages = [
    {
      key: 'design',
      name: { en: 'Design & Setup', ar: 'التصميم والإعداد' },
      icon: Shield,
      status: sandbox.status === 'design' ? 'in_progress' : 
              ['approval_pending', 'active', 'monitoring', 'completed'].includes(sandbox.status) ? 'completed' : 'pending'
    },
    {
      key: 'approval',
      name: { en: 'Approval Gate', ar: 'بوابة الموافقة' },
      icon: CheckCircle2,
      status: sandbox.status === 'approval_pending' ? 'in_progress' :
              ['active', 'monitoring', 'completed'].includes(sandbox.status) ? 'completed' : 'pending'
    },
    {
      key: 'active',
      name: { en: 'Active Operations', ar: 'عمليات نشطة' },
      icon: Play,
      status: sandbox.status === 'active' ? 'in_progress' :
              ['monitoring', 'completed'].includes(sandbox.status) ? 'completed' : 'pending'
    },
    {
      key: 'completed',
      name: { en: 'Completion & Review', ar: 'الإكمال والمراجعة' },
      icon: CheckCircle2,
      status: sandbox.status === 'completed' ? 'completed' : 'pending'
    }
  ];

  const statusColors = {
    completed: 'bg-green-100 text-green-700 border-green-300',
    in_progress: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    pending: 'bg-slate-100 text-slate-500 border-slate-300'
  };

  return (
    <div className="space-y-4">
      {stages.map((stage) => {
        const StageIcon = stage.icon;
        const colorClass = statusColors[stage.status];

        return (
          <Card key={stage.key} className={`border-2 ${colorClass}`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-full ${colorClass} flex items-center justify-center`}>
                  {stage.status === 'completed' ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : stage.status === 'in_progress' ? (
                    <Clock className="h-6 w-6 animate-pulse" />
                  ) : (
                    <Circle className="h-6 w-6" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{t(stage.name)}</h3>
                    <Badge className={colorClass}>
                      {stage.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}