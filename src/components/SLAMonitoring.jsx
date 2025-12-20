import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from './LanguageContext';
import { Clock } from 'lucide-react';

export default function SLAMonitoring() {
  const { language, isRTL, t } = useLanguage();
  const slas = [
    { name: 'Challenge Review', target: '48h', current: '36h', compliance: 95, status: 'on_track' },
    { name: 'Pilot Approval', target: '5 days', current: '6 days', compliance: 78, status: 'at_risk' },
    { name: 'Solution Verification', target: '72h', current: '45h', compliance: 98, status: 'on_track' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          {t({ en: 'SLA Monitoring', ar: 'مراقبة اتفاقيات مستوى الخدمة' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {slas.map((sla, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{sla.name}</span>
              <Badge className={sla.status === 'on_track' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                {sla.compliance}%
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span>Target: {sla.target}</span>
              <span>•</span>
              <span>Avg: {sla.current}</span>
            </div>
            <Progress value={sla.compliance} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}