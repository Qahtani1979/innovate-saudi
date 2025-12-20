import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Activity, Server, Database, Cpu } from 'lucide-react';

export default function MonitoringDashboard() {
  const { t } = useLanguage();

  const resources = [
    { name: 'API Server', status: 'healthy', cpu: 45, memory: 62, uptime: '99.8%' },
    { name: 'Database', status: 'healthy', cpu: 38, memory: 71, uptime: '99.9%' },
    { name: 'Cache Layer', status: 'warning', cpu: 0, memory: 0, uptime: 'N/A' },
    { name: 'Queue Workers', status: 'healthy', cpu: 22, memory: 35, uptime: '99.7%' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-600" />
          {t({ en: 'Infrastructure Monitoring', ar: 'مراقبة البنية التحتية' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {resources.map((resource, idx) => (
          <div key={idx} className="p-3 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-medium">{resource.name}</span>
              </div>
              <Badge className={
                resource.status === 'healthy' ? 'bg-green-600' :
                resource.status === 'warning' ? 'bg-amber-600' :
                'bg-red-600'
              }>
                {resource.status}
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <div className="flex items-center gap-1 text-slate-600">
                  <Cpu className="h-3 w-3" />
                  <span>CPU: {resource.cpu}%</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1 text-slate-600">
                  <Database className="h-3 w-3" />
                  <span>Mem: {resource.memory}%</span>
                </div>
              </div>
              <div className="text-slate-600">
                Uptime: {resource.uptime}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}