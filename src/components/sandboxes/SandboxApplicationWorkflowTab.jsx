import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from '../LanguageContext';
import { CheckCircle2, Circle, Clock, Send, Shield, LogOut } from 'lucide-react';

export default function SandboxApplicationWorkflowTab({ application }) {
  const { t } = useLanguage();

  const stages = [
    {
      key: 'submission',
      name: { en: 'Submission Gate', ar: 'بوابة التقديم' },
      icon: Send,
      status: application.status === 'submitted' || ['approved', 'active', 'completed', 'exited'].includes(application.status) ? 'completed' : 'pending'
    },
    {
      key: 'entry',
      name: { en: 'Entry Gate', ar: 'بوابة الدخول' },
      icon: Shield,
      status: application.status === 'approved' ? 'in_progress' :
              ['active', 'completed', 'exited'].includes(application.status) ? 'completed' : 'pending'
    },
    {
      key: 'active',
      name: { en: 'Active Testing', ar: 'اختبار نشط' },
      icon: CheckCircle2,
      status: application.status === 'active' ? 'in_progress' :
              ['completed', 'exited'].includes(application.status) ? 'completed' : 'pending'
    },
    {
      key: 'exit',
      name: { en: 'Exit Gate', ar: 'بوابة الخروج' },
      icon: LogOut,
      status: ['completed', 'exited'].includes(application.status) ? 'completed' : 'pending'
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
                  {stage.status === 'completed' ? <CheckCircle2 className="h-6 w-6" /> :
                   stage.status === 'in_progress' ? <Clock className="h-6 w-6 animate-pulse" /> :
                   <Circle className="h-6 w-6" />}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{t(stage.name)}</h3>
                  <Badge className={colorClass}>{stage.status.replace(/_/g, ' ')}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}