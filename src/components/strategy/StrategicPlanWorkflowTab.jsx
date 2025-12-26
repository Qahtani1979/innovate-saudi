import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from '../LanguageContext';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

export default function StrategicPlanWorkflowTab({ plan }) {
  const { t } = useLanguage();

  const stages = [
    {
      key: 'draft',
      name: { en: 'Draft & Development', ar: 'المسودة والتطوير' },
      status: plan.status === 'draft' ? 'in_progress' :
              ['submitted', 'under_review', 'approved', 'active'].includes(plan.status) ? 'completed' : 'pending'
    },
    {
      key: 'stakeholder',
      name: { en: 'Stakeholder Review', ar: 'مراجعة أصحاب المصلحة' },
      status: plan.status === 'submitted' ? 'in_progress' :
              ['under_review', 'approved', 'active'].includes(plan.status) ? 'completed' : 'pending'
    },
    {
      key: 'approval',
      name: { en: 'Executive Approval', ar: 'الموافقة التنفيذية' },
      status: plan.status === 'under_review' ? 'in_progress' :
              ['approved', 'active'].includes(plan.status) ? 'completed' : 'pending'
    },
    {
      key: 'implementation',
      name: { en: 'Implementation', ar: 'التنفيذ' },
      status: plan.status === 'active' ? 'in_progress' : 'pending'
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
                  <Badge className={colorClass}>{stage.status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
