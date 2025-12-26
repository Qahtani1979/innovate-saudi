import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from '../LanguageContext';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

export default function OrganizationWorkflowTab({ organization }) {
  const { t } = useLanguage();

  const stages = [
    {
      key: 'registration',
      name: { en: 'Registration', ar: 'التسجيل' },
      status: 'completed'
    },
    {
      key: 'verification',
      name: { en: 'Verification Review', ar: 'مراجعة التحقق' },
      status: organization.is_verified ? 'completed' : 
              organization.verification_date ? 'in_progress' : 'pending'
    },
    {
      key: 'partnership',
      name: { en: 'Partnership Approval', ar: 'موافقة الشراكة' },
      status: organization.partnership_status === 'active' ? 'completed' :
              organization.partnership_status === 'pending' ? 'in_progress' : 'pending'
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
